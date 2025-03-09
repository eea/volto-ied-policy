import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { UniversalLink, BlockDataForm } from '@plone/volto/components';
import cx from 'classnames';
import { setQuery } from '../../../../../actions';
import schema from './schema';

import './styles.less';

const getLength = (length = 0, limit = 0) => {
  if (!length) return 0;
  return limit < length ? limit : length;
};

const ConnectedList = (props) => {
  const { data = {}, onChangeBlock, block, mode, provider_data = {} } = props;
  const columns = getLength(
    provider_data[Object.keys(provider_data)?.[0]]?.length,
    data.limit,
  );

  console.log('assa', props);
  return (
    <div className="connected-list-container">
      <BlockDataForm
        schema={schema()}
        formData={data}
        onChangeField={(id, value) => {
          onChangeBlock(block, { ...data, [id]: value });
        }}
      />

      <div className="connected-list">
        {data.queries?.length && data.value ? (
          Array(Math.max(0, columns))
            .fill()
            .map((_, column) => {
              const queries = {};
              data.queries.forEach((query) => {
                if (
                  query.paramToSet &&
                  query.param &&
                  provider_data[query.param]
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
                  {provider_data[data.value][column]}
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
  connect(
    (state) => {
      console.log({ state });
      return {};
    },
    { setQuery },
  ),
)(ConnectedList);
