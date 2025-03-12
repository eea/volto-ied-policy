import React from 'react';
import { compose } from 'redux';
import { UniversalLink, BlockDataForm } from '@plone/volto/components';
import cx from 'classnames';
import schema from './schema';
import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';

import './styles.less';

const getLength = (length = 0, limit = 0) => {
  if (!length) return 0;
  return Math.min(limit || length, length);
};

const ConnectedList = (props) => {
  const { data = {}, onChangeBlock, block, mode, provider_data = {} } = props;

  const firstKey = Object.keys(provider_data || {})?.[0];
  const columns = getLength(provider_data?.[firstKey]?.length, data?.limit);

  return (
    <div className="connected-list-container">
      {mode === 'edit' && (
        <BlockDataForm
          schema={schema}
          title={schema.title}
          formData={data}
          onChangeField={(id, value) => {
            onChangeBlock(block, { ...data, [id]: value });
          }}
        />
      )}

      <div className="connected-list">
        {data?.value ? (
          Array(Math.max(0, columns))
            .fill()
            .map((_, column) => {
              const queries = {};
              data.queries.forEach((query) => {
                if (
                  query.paramToSet &&
                  query.param &&
                  provider_data?.[query.param]?.[column]
                ) {
                  queries[query.paramToSet] =
                    provider_data[query.param][column];
                }
              });

              return (
                <UniversalLink
                  key={`connected-list-${column}`}
                  href={data.url || '/'}
                  className={cx(data.className)}
                  style={{
                    display: 'inline-block',
                    margin: '5px',
                  }}
                  onClick={() => {
                    props.setQuery({
                      ...queries,
                    });
                  }}
                >
                  {provider_data?.[data.value]?.[column] ?? 'N/A'}
                </UniversalLink>
              );
            })
        ) : (
          <p>Please add queries</p>
        )}
      </div>
    </div>
  );
};

export default compose(
  connectToProviderData((props) => ({
    provider_url: props.data?.url,
    pagination: {
      enabled: false,
    },
  })),
)(ConnectedList);
