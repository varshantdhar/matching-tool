# coding: utf-8

import pandas as pd

from typing import List

import matcher.contraster as contraster
import matcher.rules as rules
import matcher.cluster as cluster
import matcher.ioutils as ioutils

from matcher.logger import logger

import recordlinkage as rl

def unpack_blocking_rule(df, column_name, position):
    if position < 0:
        return df[column_name].astype(str).str[position:]
    elif position > 0:
        return df[column_name].astype(str).str[:position]
    else:
        raise ValueError('I cannot split a string at this position: {position}')


def run(df:pd.DataFrame, clustering_params:dict, jurisdiction:str, match_job_id:str, blocking_rules:dict) -> pd.DataFrame:

    ## We will split-apply-combine
    logger.debug(f'df sent to matcher has the following columns: {df.dtypes}')
    logger.info(f'Blocking by {blocking_rules}')
    grouped = df.groupby([unpack_blocking_rule(df, column_name, position) for column_name, position in blocking_rules.items()])
    logger.info(f'Applying matcher to {len(grouped)} blocks.')

    matches = {}

    for key, group in grouped:
        logger.debug(f"Processing group: {key}")
        logger.debug(f"Group size: {len(group)}")

        if len(group) > 1:

            indexer = rl.FullIndex()
            pairs = indexer.index(group)

            logger.debug(f"Number of pairs: {len(pairs)}")

            logger.debug(f"Initializing contrasting")
            features = contraster.generate_contrasts(pairs, df)
            logger.debug(f"Features created")

            features.index.rename(['matcher_index_left', 'matcher_index_right'], inplace=True)
            features = rules.compactify(features, operation='mean')
            ioutils.write_dataframe_to_s3(features.reset_index(), key=f'csh/matcher/{jurisdiction}/match_cache/features/{match_job_id}/{key}')

            logger.debug(f"Features dataframe size: {features.shape}")
            logger.debug(f"Features data without duplicated indexes: {features[~features.index.duplicated(keep='first')].shape}")
            logger.debug("Duplicated keys:")
            logger.debug(f"{features[features.index.duplicated(keep=False)]}")

            matched = cluster.generate_matched_ids(
                distances=features,
                DF=group,
                clustering_params=clustering_params,
                jurisdiction=jurisdiction, # at some point, we may want to consider making the matcher into a class
                match_job_id=match_job_id,       # rather than passing around keys, match_job_ids, jurisdictions, etc.
                block_name=str(key)
            )

            matches[key] = matched
        else:
            logger.debug(f"Group {key} only have one record, making a singleton id")
            matches[key] = cluster.generate_singleton_id(group, str(key))

    return matches
