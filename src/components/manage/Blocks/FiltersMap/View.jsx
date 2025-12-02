/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { setQuery } from '@eeacms/volto-ied-policy/actions';
import { Icon } from 'semantic-ui-react';

import Search from './Search';
import Modal from './Modal';
import { getOptions, permitTypes } from './dictionary';
import { connect } from 'react-redux';
import { connectToMultipleProvidersUnfiltered } from '@eeacms/volto-datablocks/hocs';
import { compose } from 'redux';
import './styles.less';
import { withRouter } from 'react-router-dom';
import { resetQuery } from '@eeacms/volto-ied-policy/actions';
const View = ({
  data,
  providers_data,
  query,
  dispatch,
  location,
  history,
  ...props
}) => {
  const [open, setOpenState] = useState(false);
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [options, setOptions] = useState({});
  const prevProvidersData = useRef(providers_data);
  const setOpen = useCallback((open, callback) => {
    setOpenState(open);
    if (callback) callback();
  }, []);

  const setInitialFilters = useCallback(
    (filters = {}) => {
      const keys = Object.keys(filters);
      const queryKeys = Object.keys(query);
      for (const key of keys) {
        if (queryKeys.includes(key)) {
          return false;
        }
      }
      dispatch(setQuery(filters));
      setFiltersInitialized(true);
      return true;
    },
    [dispatch, query],
  );

  const initialSearchRef = useRef(location.search);

  const updateOptions = useCallback(() => {
    const newOptions = { ...options };
    if (data.providers) {
      data.providers.forEach((source) => {
        if (
          source?.name &&
          !newOptions?.[source.name] &&
          providers_data?.[source.name]
        ) {
          newOptions[source.name] = getOptions(providers_data[source.name]);
        }
      });
      if (!newOptions['permit_types']) {
        newOptions['permit_types'] = permitTypes;
      }
      setOptions(newOptions);
      if (!filtersInitialized && newOptions.reporting_years?.length) {
        const latestYear = newOptions.reporting_years
          .filter((opt) => opt.value)
          .sort((a, b) => b.value - a.value)[0].value;
        const inputs = {};
        // Use the initial search params, not current location.search
        const searchParams = new URLSearchParams(initialSearchRef.current);
        for (const [key, value] of searchParams.entries()) {
          if (!value) continue;
          if (key === 'Site_reporting_year[in]') {
            inputs['filter_reporting_years'] = value
              .split(',')
              .filter((year) => !isNaN(year))
              .map((year) => parseInt(year));
          } else if (key === 'eprtr_sectors[in]') {
            inputs['filter_industries'] = value.split(',');
          } else if (key === 'eprtr_AnnexIActivity[in]') {
            inputs['filter_eprtr_AnnexIActivity'] = value.split(',');
          } else if (key === 'bat_conclusions[like]') {
            inputs['filter_bat_conclusions'] = value
              .split(',')
              .map((group) => group.replaceAll('%', ''));
          } else if (key === 'permit_types[like]') {
            inputs['filter_permit_types'] = value
              .split(',')
              .map((group) => group.replaceAll('%', ''));
          } else if (key === 'permit_years[like]') {
            inputs['filter_permit_years'] = value
              .split(',')
              .map((group) => group.replaceAll('%', ''))
              .filter((year) => !isNaN(year))
              .map((year) => parseInt(year));
          } else if (key === 'pollutants[like]') {
            inputs['filter_pollutants'] = value
              .split('%,')
              .map((group) => group.replaceAll('%', ''));
          } else if (
            key === 'air_groups[like]' ||
            key === 'water_groups[like]'
          ) {
            inputs['filter_pollutant_groups'] = value.split(',');
          } else if (key === 'countryCode[in]') {
            inputs['filter_countries'] = value.split(',');
          } else if (key === 'has_release_data[gt]') {
            inputs['filter_thematic_information'] = [
              ...(inputs?.['filter_thematic_information']
                ? inputs['filter_thematic_information']
                : []),
              'has_release',
            ];
          } else if (key === 'has_transfer_data[gt]') {
            inputs['filter_thematic_information'] = [
              ...(inputs?.['filter_thematic_information']
                ? inputs['filter_thematic_information']
                : []),
              'has_transfer',
            ];
          } else if (key === 'has_waste_data[gt]') {
            inputs['filter_thematic_information'] = [
              ...(inputs?.['filter_thematic_information']
                ? inputs['filter_thematic_information']
                : []),
              'has_waste',
            ];
          } else if (key === 'has_seveso[gt]') {
            inputs['filter_thematic_information'] = [
              ...(inputs?.['filter_thematic_information']
                ? inputs['filter_thematic_information']
                : []),
              'has_seveso',
            ];
          } else if (key === 'count_instype_IED[gte]') {
            inputs['filter_installation_types'] = [
              ...(inputs?.['filter_installation_types']
                ? inputs['filter_installation_types']
                : []),
              'IED',
            ];
          } else if (key === 'count_instype_NONIED[gte]') {
            inputs['filter_installation_types'] = [
              ...(inputs?.['filter_installation_types']
                ? inputs['filter_installation_types']
                : []),
              'NONIED',
            ];
          } else if (key === 'nuts_regions[like]') {
            inputs['filter_nuts_2'] = [value.replaceAll('%', '')];
            inputs['filter_nuts_1'] = [
              value
                .replaceAll('%', '')
                .substring(0, value.replaceAll('%', '').length - 1),
            ];
          } else if (key === 'facility_types') {
            inputs['filter_facility_types'] = value
              .split('%,')
              .map((group) => group.replaceAll('%', ''));
          } else if (key === 'river_basin') {
            inputs['filter_river_basin_districts'] = value
              .split('%,')
              .map((group) => group.replaceAll('%', ''));
          } else if (key === 'plant_types') {
            inputs['filter_plant_types'] = value
              .split('%,')
              .map((group) => group.replaceAll('%', ''));
          }
        }
        const filtersWereSet = setInitialFilters({
          filter_reporting_years: [latestYear],
          ...inputs,
          filter_change: {
            counter: 1,
            type: 'simple-filter',
          },
        });
        // Only update URL if filters were actually set (not already initialized)
        if (filtersWereSet) {
          const urlParams = new URLSearchParams(initialSearchRef.current);
          if (
            !urlParams.get('Site_reporting_year[in]') &&
            props.mode !== 'edit'
          ) {
            urlParams.set('Site_reporting_year[in]', latestYear);
            history.push({
              pathname: location.pathname,
              search: `?${urlParams.toString()}`,
            });
          }
        }
      }
    }
  }, [
    data,
    providers_data,
    filtersInitialized,
    permitTypes,
    setInitialFilters,
    history,
    location.pathname,
    props.mode,
  ]);

  useEffect(() => {
    if (providers_data !== prevProvidersData.current) {
      updateOptions();
    }
    prevProvidersData.current = providers_data;
  }, [providers_data, updateOptions]);

  useEffect(() => {
    updateOptions();
  }, [updateOptions]);

  //Remove query params from URL on other pages
  useEffect(() => {
    return () => {
      const isOnExplorePage = location.pathname.includes('/explore');
      if (!isOnExplorePage) {
        dispatch(resetQuery());
        setFiltersInitialized(false);
        history.replace({ pathname: location.pathname });
      }
    };
  }, []);

  // Calculate active filters for display
  const activeFilters = useMemo(() => {
    const filters = [];

    if (query.filter_reporting_years?.length) {
      filters.push({
        key: 'filter_reporting_years',
        label: `Year: ${query.filter_reporting_years.join(', ')}`,
      });
    }

    if (query.filter_countries?.length) {
      filters.push({
        key: 'filter_countries',
        label: `Countries: ${query.filter_countries.length}`,
      });
    }

    if (query.filter_industries?.length) {
      filters.push({
        key: 'filter_industries',
        label: `Industries: ${query.filter_industries.length}`,
      });
    }

    if (query.filter_pollutants?.length) {
      filters.push({
        key: 'filter_pollutants',
        label: `Pollutants: ${query.filter_pollutants.length}`,
      });
    }

    if (query.filter_bat_conclusions?.length) {
      filters.push({
        key: 'filter_bat_conclusions',
        label: `BAT: ${query.filter_bat_conclusions.length}`,
      });
    }

    if (query.filter_permit_types?.length) {
      filters.push({
        key: 'filter_permit_types',
        label: `Permit types: ${query.filter_permit_types.length}`,
      });
    }

    return filters;
  }, [query]);

  const removeFilter = useCallback(
    (filterKey) => {
      dispatch(
        setQuery({
          [filterKey]: [],
          filter_change: {
            counter: (query['filter_change']?.counter || 0) + 1,
            type: 'simple-filter',
          },
        }),
      );

      // Also update URL params
      const urlParams = new URLSearchParams(location.search);
      const urlKeyMap = {
        filter_reporting_years: 'Site_reporting_year[in]',
        filter_countries: 'countryCode[in]',
        filter_industries: 'eprtr_sectors[in]',
        filter_pollutants: 'pollutants[like]',
        filter_bat_conclusions: 'bat_conclusions[like]',
        filter_permit_types: 'permit_types[like]',
      };
      if (urlKeyMap[filterKey]) {
        urlParams.delete(urlKeyMap[filterKey]);
        history.push({
          pathname: location.pathname,
          search: urlParams.toString() ? `?${urlParams.toString()}` : '',
        });
      }
    },
    [dispatch, query, location.search, location.pathname, history],
  );

  return (
    <div className="filters-block outline-button">
      <Search data={data} providers_data={providers_data} />
      <button onClick={() => setOpen(true)}>
        Advanced Filter
        {activeFilters.length > 0 && (
          <span className="filter-badge">{activeFilters.length}</span>
        )}
      </button>
      {activeFilters.length > 0 && (
        <div className="active-filters">
          {activeFilters.map((filter) => (
            <span key={filter.key} className="filter-tag">
              {filter.label}
              <Icon
                name="close"
                size="small"
                onClick={() => removeFilter(filter.key)}
              />
            </span>
          ))}
        </div>
      )}
      <Modal
        data={data}
        providers_data={providers_data}
        open={open}
        options={options}
        setOpen={setOpen}
      />
    </div>
  );
};

export default compose(
  withRouter,
  connect((state) => ({
    query: state.query.search,
  })),
  connectToMultipleProvidersUnfiltered((props) => ({
    providers: props.data.providers,
  })),
)(View);
