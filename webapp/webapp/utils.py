from uuid import uuid4

import unicodecsv as csv
import itertools
import json
import tempfile
from datetime import date
from webapp.config import config as app_config
from webapp import SCHEMA_DIRECTORY

from contextlib import contextmanager
import requests
from sqlalchemy import MetaData, Table


def unique_upload_id():
    return str(uuid4())


def s3_upload_path(jurisdiction, event_type, upload_id):
    datestring = date.today().isoformat()
    path_template = app_config['raw_uploads_path']

    full_s3_path = path_template.format(
        event_type=event_type,
        jurisdiction=jurisdiction,
        date=datestring,
        upload_id=upload_id
    )
    return full_s3_path


def merged_file_path(jurisdiction, event_type):
    path_template = app_config['merged_uploads_path']
    full_s3_path = path_template.format(
        event_type=event_type,
        jurisdiction=jurisdiction
    )
    return full_s3_path


@contextmanager
def makeNamedTemporaryCSV(content, separator='|'):
    tf = tempfile.NamedTemporaryFile(delete=False)
    with open(tf.name, 'wb') as write_stream:
        writer = csv.writer(write_stream, delimiter=separator)
        for row in content:
            writer.writerow(row)

    yield tf.name

    tf.close()


def schema_filename(event_type):
    return'{}/{}.json'.format(
        SCHEMA_DIRECTORY,
        event_type.replace('_', '-')
    )


def load_schema_file(event_type):
    with open(schema_filename(event_type)) as f:
        return json.load(f)


def column_list_from_goodtables_schema(goodtables_schema):
    fields = goodtables_schema['fields']

    def type_map(gt_type):
        if gt_type == 'string':
            return 'varchar'
        if gt_type == 'datetime':
            return 'timestamp'
        else:
            return gt_type

    return [
        (field['name'], type_map(field['type']))
        for field in fields
    ]


def create_statement_from_column_list(column_list, table_name, primary_key):
    column_string = ', '.join(['"{}" {}'.format(column_name, column_type) for column_name, column_type in column_list])
    return 'create table if not exists "{table_name}" ({column_string}, primary key ({primary_key}))'.format(
        table_name=table_name,
        column_string=column_string,
        primary_key=', '.join(["\"{}\"".format(col) for col in primary_key])
    )


def create_statement_from_goodtables_schema(goodtables_schema, table_name):
    column_list = column_list_from_goodtables_schema(goodtables_schema)
    primary_key = goodtables_schema['primaryKey']
    return create_statement_from_column_list(column_list, table_name, primary_key)


def primary_key_statement(primary_key):
    return ', '.join(["\"{}\"".format(col) for col in primary_key])


def generate_master_table_name(jurisdiction, event_type):
    return '{jurisdiction}_{event_type}_master'.format(**locals())


def master_table_column_list(goodtables_schema):
    base_column_list = column_list_from_goodtables_schema(goodtables_schema)
    # mutate column list
    full_column_list = base_column_list + [('inserted_ts', 'timestamp'), ('updated_ts', 'timestamp')]
    return full_column_list


def generate_matched_table_name(jurisdiction, event_type):
    return 'matched.{jurisdiction}_{event_type}'.format(**locals())

def notify_matcher(jurisdiction, event_type, upload_id, filename):
    matcher_response = requests.get(
        'http://{location}:{port}/match/{jurisdiction}/{event_type}/{filename}?uploadId={upload_id}'.format(
            location=app_config['matcher_location'],
            port=app_config['matcher_port'],
            jurisdiction=jurisdiction,
            event_type=event_type,
            upload_id=upload_id,
            filename=filename,
        )
    )
    if matcher_response.status_code != 200:
        raise RuntimeError(matcher_response.json())


def lower_first(iterator):
    return itertools.chain([next(iterator).lower()], iterator)


def infer_delimiter(infilename):
    # we only support comma and pipe
    with open(infilename, 'rb') as infileobj:
        reader = csv.reader(infileobj, delimiter='|')
        first_row = next(reader)
        if len(first_row) > 1:
            return '|'
        infileobj.seek(0)
        reader = csv.reader(infileobj, delimiter=',')
        first_row = next(reader)
        if len(first_row) > 1:
            return ','
        raise ValueError('Unknown delimiter')


def split_table(table_name):
    """Split a fully-qualified table name into schema and table
    Args:
        table_name (string) A table name, either with or without a schema prefix
    Returns: (tuple) of schema and table name
    """
    table_parts = table_name.split('.')
    if len(table_parts) == 2:
        return tuple(table_parts)
    elif len(table_parts) == 1:
        return (None, table_parts[0])
    else:
        raise ValueError('Table name in unknown format')


def table_object(table_name, db_engine, reflect=True):
    schema, table_name = split_table(table_name)
    meta = MetaData(schema=schema, bind=db_engine)
    return Table(table_name, meta)


def table_has_column(table_name, db_engine, column):
    return column in table_object(table_name, db_engine).columns


def table_exists(table_name, db_engine):
    return table_object(table_name, db_engine, reflect=False).exists()
