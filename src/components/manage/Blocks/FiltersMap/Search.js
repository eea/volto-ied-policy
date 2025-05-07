import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import axios from 'axios';
import { Input, List } from 'semantic-ui-react';
import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';
import Highlighter from 'react-highlight-words';
import config from '@plone/volto/registry';
import { trackSiteSearch } from '@eeacms/volto-matomo/utils';
import { setQuery } from '@eeacms/volto-ied-policy/actions';
import { getEncodedQueryString } from '@eeacms/volto-ied-policy/helpers';
import { inputsKeys } from './dictionary';
import { withRouter } from 'react-router-dom';

const MAX_RESULTS = 6;
let timer;

const debounce = (func, ...args) => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(func, 600, ...args);
};

const getSites = (value) => {
  const providerUrl = config.settings.providerUrl;
  const db_version =
    process.env.RAZZLE_DB_VERSION || config.settings.db_version || 'latest';
  const query = `SELECT siteName
  FROM [IED].[${db_version}].[SiteMap]
  WHERE [siteName] COLLATE Latin1_General_CI_AI LIKE '%${value}%'
  GROUP BY siteName
  ORDER BY [siteName]`;

  return axios.get(
    providerUrl + `?${getEncodedQueryString(query)}&p=1&nrOfHits=6`,
  );
};

const getLocations = (value, providers_data) => {
  const countries = providers_data.countries?.opt_value?.join(',') || '';
  return axios.get(
    `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&text=${value}&maxSuggestions=6${
      countries.length ? `&countryCode=${countries}` : ''
    }`,
  );
};

const getFacilities = (value) => {
  const providerUrl = config.settings.providerUrl;
  const db_version =
    process.env.RAZZLE_DB_VERSION || config.settings.db_version || 'latest';
  const query = `SELECT facilityName
  FROM [IED].[${db_version}].[ProductionFacility]
  WHERE [facilityName] COLLATE Latin1_General_CI_AI LIKE '%${value}%'
  GROUP BY facilityName
  ORDER BY [facilityName]`;

  return axios.get(
    providerUrl + `?${getEncodedQueryString(query)}&p=1&nrOfHits=6`,
  );
};

const Search = ({
  data,
  providers_data,
  query,
  setQuery,
  location,
  history,
  ...props
}) => {
  const searchContainer = React.useRef();
  const [loading, setLoading] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [sites, setSites] = React.useState([]);
  const [facilities, setFacilities] = React.useState([]);
  const [locations, setLocations] = React.useState([]);

  const value = React.useMemo(() => {
    if (query.filter_search_value) return query.filter_search_value;
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('siteName')) {
      return urlParams.get('siteName');
    }
    if (urlParams.get('facilityName')) {
      return urlParams.get('facilityName');
    }
    if (urlParams.get('searchLocation')) {
      return urlParams.get('searchLocation');
    }
    return null;
  }, [query.filter_search_value]);

  const setValue = React.useCallback((value) => {
    setQuery({ filter_search_value: value });
    /* eslint-disable-next-line */
  }, []);

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside, false);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, false);
    };
    /* eslint-disable-next-line */
  }, []);

  const items = React.useMemo(() => {
    if (loading) return [];
    const slices = MAX_RESULTS / 3;
    let total_entities = 1;
    let empty_slices = 0;
    let entities = 0;
    let _locations = locations.slice(0, slices);
    let _sites = sites.slice(0, slices);
    let _facilities = facilities.slice(0, slices);

    if (_locations.length < slices) {
      empty_slices += slices - _locations.length;
      entities++;
    } else if (_locations.length <= slices) {
      total_entities++;
    }
    if (_sites.length < slices) {
      empty_slices += slices - _sites.length;
      entities++;
    } else if (_sites.length <= slices) {
      total_entities++;
    }
    if (_facilities.length < slices) {
      empty_slices += slices - _facilities.length;
      entities++;
    } else if (_facilities.length <= slices) {
      total_entities++;
    }

    if (locations.length > slices && empty_slices > 0) {
      const used_slices = Math.round(
        empty_slices / (total_entities - entities),
      );
      _locations = locations.slice(0, slices + used_slices);
      empty_slices -= used_slices;
    } else {
      total_entities--;
    }

    if (sites.length > slices && empty_slices > 0) {
      const used_slices = Math.round(
        empty_slices / (total_entities - entities),
      );
      _sites = sites.slice(0, slices + used_slices);
      empty_slices -= used_slices;
    } else {
      total_entities--;
    }

    if (facilities.length > slices && empty_slices > 0) {
      const used_slices = Math.round(
        empty_slices / (total_entities - entities),
      );
      _facilities = facilities.slice(0, slices + used_slices);
      empty_slices -= used_slices;
    } else {
      total_entities--;
    }

    return [..._locations, ..._sites, ..._facilities];
  }, [sites, facilities, locations, loading]);

  const handleClickOutside = React.useCallback((event) => {
    if (!doesNodeContainClick(searchContainer.current, event)) {
      setShowResults(false);
      return;
    }
    setShowResults(true);
  }, []);

  const onChange = React.useCallback(
    (data) => {
      const { value } = data;
      const requests = [];
      if (value.length >= 3) {
        requests.push(getSites(value));
        requests.push(getFacilities(value));
        requests.push(getLocations(value, providers_data));

        Promise.all(requests).then((responses) => {
          setSites(
            responses[0].data?.results?.map((item) => ({
              text: item.siteName,
              type: 'site',
            })) || [],
          );
          setFacilities(
            responses[1].data?.results?.map((item) => ({
              text: item.facilityName,
              type: 'facility',
            })) || [],
          );
          setLocations(
            responses[2].data?.suggestions?.map((item) => ({
              ...item,
              type: 'location',
            })) || [],
          );
          setLoading(false);
        });
      } else {
        setLoading(false);
        setSites([]);
        setFacilities([]);
        setLocations([]);
      }
    },
    [providers_data],
  );

  const search = React.useCallback(
    (value, type, magicKey) => {
      debounce(onChange, { value });
      setLoading(true);
      const newInputs = {};
      inputsKeys.forEach((filter) => {
        newInputs[filter] = [];
      });
      setQuery({
        ...newInputs,
        filter_search:
          value && type
            ? { text: value, type, ...(magicKey ? { magicKey } : {}) }
            : null,
        filter_search_value: value,
        filter_change: {
          counter: (query['filter_change']?.counter || 0) + 1,
          type: value && type ? `search-${type}` : 'clear',
        },
      });

      if (value && type) {
        trackSiteSearch({
          category: `Map/Table search-${type}`,
          keyword: value,
        });
        const urlParams = new URLSearchParams(location.search);

        if (type === 'site' && value) {
          urlParams.set('siteName', value.trim());
          urlParams.delete('facilityNames');
          urlParams.delete('searchLocation');
        }

        if (type === 'facility' && value) {
          urlParams.set('facilityNames', value.trim());
          urlParams.delete('searchLocation');
          urlParams.delete('siteName');
        }
        if (type === 'location' && value) {
          urlParams.set('searchLocation', value.trim());
          urlParams.delete('facilityNames');
          urlParams.delete('siteName');
        }
        history.push({
          pathname: location.pathname,
          search: `?${urlParams.toString()}`,
        });
      }
    },
    [query, onChange, setQuery],
  );

  return (
    <div className="search-container" ref={searchContainer}>
      <form autoComplete="off" name="Map search">
        <Input
          loading={loading}
          value={value}
          aria-label="Site search"
          // autocomplete="off"
          icon={
            <>
              {!loading && value ? (
                <i
                  aria-hidden
                  className="delete icon"
                  onClick={() => {
                    search('', null);
                    setShowResults(false);
                  }}
                />
              ) : (
                ''
              )}
              <i
                aria-hidden
                className="search icon"
                onClick={() => {
                  debounce(onChange, { value });
                  setLoading(true);
                }}
              />
            </>
          }
          placeholder={
            data.searchPlaceholder ||
            'Search for country, region, city or a site name'
          }
          onChange={(_, data) => {
            debounce(onChange, data);
            setValue(data.value);
            setLoading(true);
          }}
        />
      </form>
      {items.length && showResults && value.length >= 3 ? (
        <List>
          {items.map((item, index) => (
            <List.Item
              key={`result-${index}`}
              onClick={() => {
                search(item.text, item.type, item.magicKey);
                setShowResults(false);
              }}
            >
              <Highlighter
                className="text"
                highlightClassName="highlight"
                searchWords={value?.split(' ') || []}
                autoEscape={true}
                textToHighlight={item.text}
              />
              <span className="type">{item.type}</span>
            </List.Item>
          ))}
        </List>
      ) : (
        ''
      )}
    </div>
  );
};

export default compose(
  withRouter,
  connect(
    (state) => ({
      query: state.query.search,
    }),
    {
      setQuery,
    },
  ),
)(Search);
