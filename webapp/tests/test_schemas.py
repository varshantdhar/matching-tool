from tableschema import Schema
from webapp import SCHEMA_DIRECTORY


def test_all_schemas():
    schema_files = ['hmis-service-stays', 'jail-bookings']
    for schema_file in schema_files:
        schema = Schema(SCHEMA_DIRECTORY + schema_file + '.json')
        assert not schema.errors
