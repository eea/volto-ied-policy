import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { UniversalLink } from '@plone/volto/components';
import cx from 'classnames';
import { setQuery } from '../../../../../actions';

import './styles.less';

const getLength = (length = 0, limit = 0) => {
  if (!length) return 0;
  return limit < length ? limit : length;
};

const View = (props) => {
  const { data = {} } = props;
  const provider_data = props.provider_data || {};
  const columns = getLength(
    provider_data[Object.keys(provider_data)?.[0]]?.length,
    data.limit,
  );

  return (
    <>
      {props.mode === 'edit' ? <p>Connected list</p> : ''}
      {data.queries?.length && data.value ? (
        <div className="connected-list">
          {Array(Math.max(0, columns))
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
            })}
        </div>
      ) : (
        <p>Please add queries</p>
      )}
    </>
  );
};

export default compose(
  connect(
    (state) => ({
      query: state.router.location.search,
      search: state.query.search,
    }),
    { setQuery },
  ),
)(View);
