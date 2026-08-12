import cx from 'classnames';
import isPlainObject from 'lodash/isPlainObject';
import pick from 'lodash/pick';
import { useCallback, useEffect, useRef, useState } from 'react';
import { compose } from 'redux';

import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';

import { DataConnectedValue } from '@eeacms/volto-datablocks/Utils';
import { connectToMultipleProviders } from '@eeacms/volto-datablocks/hocs';
import Icon from '@plone/volto/components/theme/Icon/Icon';

import expandIcon from '@eeacms/volto-ied-policy/../theme/assets/icons/expand.svg';
import siteIcon from '@eeacms/volto-ied-policy/../theme/assets/icons/site.svg';

import './style.less';

function serializeRow(data, row = 0) {
  if (data === undefined) return undefined;
  if (!data) return null;
  const serialized = {};

  Object.entries(data).forEach(([key, value]) => {
    serialized[key] = value[row];
  });
  return serialized;
}

function getProviderLength(provider) {
  if (!provider || !isPlainObject(provider)) return 0;
  return Object.values(provider)[0]?.length || 0;
}

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
        allowedParams: provider?.allowedParams,
        waitForParams: true,
      }}
      placeholder={placeholder}
      url={provider?.provider_url}
      skeletonWidth="150px"
      skeleton={skeleton}
      {...rest}
    />
  );
}

function View(props) {
  const { providers_data, location, history, match, data, properties } = props;
  const contentPath = flattenToAppURL(properties?.['@id']);
  const { siteExplorer } = history.location.state || {};
  const params = new URLSearchParams(location.search);
  const parentPath = match?.url?.replace(/\/[^/]+$/, '') || '';

  const [expanded, setExpanded] = useState(true);
  const selectedInstallationId =
    params.get('installationInspireID') ||
    providers_data.installations?.installationInspireID?.[0] ||
    null;

  const facility = serializeRow(providers_data?.facility);
  const facilitiesLen = getProviderLength(providers_data.facilities);

  const facilitiesListRef = useRef(null);
  const selectedFacilityRef = useRef(null);

  const updateQueryParam = useCallback(
    (key, value, method = 'push') => {
      const nextParams = new URLSearchParams(
        history.location?.search || location.search,
      );
      nextParams.set(key, value);
      history[method]({
        pathname: location.pathname,
        search: nextParams.toString(),
        state: history.location.state,
      });
    },
    [history, location],
  );

  const goToFacility = (row) => {
    const id = providers_data.facilities?.facilityLocalId?.[row];
    if (!id || facility?.facilityLocalId === id) {
      return;
    }
    const scrollTop = facilitiesListRef.current?.scrollTop ?? 0;
    const url = `${parentPath}/${id}`;

    // history.replace({
    //   state: {
    //     ...historyState,
    //     siteExplorer: {
    //       ...(historyState.siteExplorer || {}),
    //       scrollTop,
    //     },
    //   },
    // });
    history.push({
      pathname: url,
      hash: '#_',
      state: {
        siteExplorer: {
          expanded: true,
          scrollTop,
        },
      },
    });
  };

  const goToInstallation = (row) => {
    const id = providers_data.installations?.installationInspireID?.[row];
    if (!id || selectedInstallationId === id) {
      return;
    }
    updateQueryParam('installationInspireID', id);
  };

  useEffect(() => {
    const id = providers_data.installations?.installationInspireID?.[0];
    const currentPath = history.location?.pathname;
    const latestParams = new URLSearchParams(
      history.location?.search || location.search,
    );

    if (
      !id ||
      latestParams.get('installationInspireID') ||
      currentPath !== contentPath
    ) {
      return;
    }

    updateQueryParam('installationInspireID', id, 'replace');
  }, [
    providers_data.installations?.installationInspireID,
    contentPath,
    history.location,
    location,
    updateQueryParam,
  ]);

  return (
    <div
      className={cx('site-explorer', { 'site-explorer--expanded': expanded })}
    >
      <div
        className="site-explorer__toolbar"
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setExpanded(!expanded);
          }
        }}
      >
        <div className="toolbar-left">
          <Icon name={siteIcon} size="18px" />
          <div className="toolbar-left__content">
            <p className="label">
              <Value
                provider={data.facility}
                column="siteNamespace"
                textTemplate="SITE EXPLORER"
                skeletonWidth="66px"
              />
            </p>
            <p className="value">
              <Value provider={data.facility} column="siteNamespace" />
            </p>
          </div>
        </div>
        <div className="toolbar--right">
          <button className="expand-btn" aria-label="Expand">
            <Icon name={expandIcon} size="11px" />
          </button>
        </div>
      </div>

      <div
        className={cx('site-explorer__content--wrapper', {
          visible: expanded && (siteExplorer?.expanded || facilitiesLen > 0),
        })}
      >
        <div className="site-explorer__content">
          <p className="panel-label facilities-panel-label">
            <Value
              provider={data.facilities}
              column="facilityLocalId"
              textTemplate={`Facilities (${facilitiesLen})`}
              skeletonWidth="100px"
            />
          </p>
          <p className="panel-label installations-panel-label">
            <Value
              provider={data.installations}
              column="installationInspireID"
              textTemplate={`Installations (${getProviderLength(
                providers_data.installations,
              )})`}
              skeletonWidth="100px"
              placeholder="Installations (0)"
            />
          </p>
          <div className="panel facilities-panel" ref={facilitiesListRef}>
            <ol className="entities-list facilities-list">
              {((providers_data.facilities || {}).facilityLocalId || []).map(
                (id, row) => (
                  <li key={id}>
                    <div
                      ref={
                        facility?.facilityLocalId === id
                          ? selectedFacilityRef
                          : null
                      }
                      className={cx('list-card', {
                        selected: facility?.facilityLocalId === id,
                      })}
                      role="link"
                      tabIndex={0}
                      onClick={() => {
                        goToFacility(row);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          goToFacility(row);
                        }
                      }}
                    >
                      <p className="list-card-title">
                        <span className="list-card-index">{row + 1}.</span>
                        <Value
                          provider={data.facilities}
                          column="facilityInspireID"
                          row={row}
                          skeleton={false}
                        />
                      </p>
                      <div className="list-card-content">
                        <p>SC COMP ANNEX ROMANIA SA (placeholder)</p>
                      </div>
                    </div>
                  </li>
                ),
              )}
            </ol>
            <div className="connector">
              {facilitiesLen > 0 && <span className="connector-line" />}
            </div>
          </div>
          <div className="panel installations-panel">
            <ol className="entities-list installations-list">
              {(
                (providers_data.installations || {}).installationInspireID || []
              ).map((id, row) => (
                <li key={id}>
                  <div
                    className={cx('list-card', {
                      selected: selectedInstallationId === id,
                    })}
                    role="link"
                    tabIndex={0}
                    onClick={() => {
                      goToInstallation(row);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        goToInstallation(row);
                      }
                    }}
                  >
                    <p className="list-card-title">
                      <span className="list-card-index">{row + 1}.</span>
                      <Value
                        provider={data.installations}
                        column="installationInspireID"
                        row={row}
                        skeleton={false}
                      />
                    </p>
                    <div className="list-card-content">
                      <p>Iron and Steel Production (placeholder)</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default compose(
  connectToMultipleProviders((props) => ({
    providers: Object.entries(
      pick(props.data, ['facility', 'facilities', 'installations']),
    ).map(([name, provider]) => ({
      name,
      provider_url: provider.provider_url,
      waitForParams: true,
      data: {
        allowedParams: provider.allowedParams,
      },
    })),
  })),
)(View);
