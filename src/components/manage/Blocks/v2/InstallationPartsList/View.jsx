import cx from 'classnames';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { compose } from 'redux';
import { Message, MessageHeader } from 'semantic-ui-react';

import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';

import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';
import { DataConnectedValue } from '@eeacms/volto-datablocks/Utils';

import './style.less';

function Value({
  provider,
  column,
  placeholder = ' ',
  skeleton = true,
  ...rest
}) {
  return (
    <DataConnectedValue
      column={column}
      data={{
        allowedParams: provider.allowedParams,
        waitForParams: true,
      }}
      placeholder={placeholder}
      url={provider.provider_url}
      skeletonWidth="150px"
      skeleton={skeleton}
      {...rest}
    />
  );
}

function View(props) {
  const { provider_data, data, location, mode, properties } = props;
  const contentPath = flattenToAppURL(properties?.['@id']);
  const history = useHistory();
  const params = new URLSearchParams(location.search);

  const selectedPartId =
    params.get('partInspireID') || provider_data?.partInspireID?.[0] || null;

  const updateQueryParam = (key, value, method = 'push') => {
    const nextParams = new URLSearchParams(
      history.location?.search || location.search,
    );
    nextParams.set(key, value);
    history[method]({
      pathname: location.pathname,
      search: nextParams.toString(),
      state: history.location.state,
    });
  };

  const goToPart = (row) => {
    const id = provider_data?.partInspireID?.[row];
    if (!id || selectedPartId === id) {
      return;
    }
    updateQueryParam('partInspireID', id);
  };

  useEffect(() => {
    const id = provider_data?.partInspireID?.[0];
    const currentPath = history.location?.pathname;
    const latestParams = new URLSearchParams(
      history.location?.search || location.search,
    );

    if (
      !id ||
      latestParams.get('partInspireID') ||
      currentPath !== contentPath
    ) {
      return;
    }
    updateQueryParam('partInspireID', id, 'replace');
  }, [provider_data?.partInspireID, history.location, location, contentPath]);

  if (
    !provider_data?.partInspireID ||
    provider_data?.partInspireID.length === 0
  ) {
    return mode === 'edit' ? (
      <Message>
        <MessageHeader>Installation Parts List</MessageHeader>
        No parts found
      </Message>
    ) : null;
  }

  return (
    <div className="panel installation-parts-panel">
      <ol className="entities-list installation-parts-list">
        {(provider_data?.partInspireID || []).map((id, row) => (
          <li
            key={id}
            className={cx('list-card', {
              selected: selectedPartId === id,
            })}
            role="link"
            tabIndex={0}
            onClick={() => {
              goToPart(row);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                goToPart(row);
              }
            }}
          >
            <p className="list-card-title">
              <span className="list-card-index">{row + 1}.</span>
              <Value
                provider={data}
                column="partInspireID"
                row={row}
                skeletonWidth="100px"
              />
            </p>
            <div className="list-card-content">
              <p>Iron and steal production (placeholder)</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default compose(
  connectToProviderData(({ data }) => ({
    provider_url: data.provider_url,
    waitForParams: true,
  })),
)(View);
