import cx from 'classnames';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { compose } from 'redux';
import { Message, MessageHeader } from 'semantic-ui-react';

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
  const { provider_data, data, location, mode } = props;
  const history = useHistory();
  const params = new URLSearchParams(location.search);

  const [selectedPart, setSelectedPart] = useState(
    params.get('partInspireID') || null,
  );

  const updateQueryParam = (key, value) => {
    params.set(key, value);
    history.push({
      pathname: location.pathname,
      search: params.toString(),
    });
  };

  const goToPart = (row) => {
    const id = provider_data?.partInspireID?.[row];
    if (!id || selectedPart === id) {
      return;
    }
    setSelectedPart(id);
    updateQueryParam('partInspireID', id);
  };

  useEffect(() => {
    const ids = provider_data?.partInspireID || [];
    if (!selectedPart && ids.length) {
      const id = ids[0];
      setSelectedPart(id);
      updateQueryParam('partInspireID', id);
    }
  }, [selectedPart, provider_data?.partInspireID]);

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
              selected: selectedPart === id,
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
  connectToProviderData((props) => ({
    provider_url: props.data.provider_url,
  })),
)(View);
