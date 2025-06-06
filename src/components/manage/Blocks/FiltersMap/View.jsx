/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { setQuery } from '@eeacms/volto-ied-policy/actions';

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
        const searchParams = new URLSearchParams(location.search);
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
        setInitialFilters({
          filter_reporting_years: [latestYear],
          ...inputs,
          filter_change: {
            counter: 1,
            type: 'simple-filter',
          },
        });
        const urlParams = new URLSearchParams(location.search);
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
  }, [
    data,
    providers_data,
    filtersInitialized,
    permitTypes,
    setInitialFilters,
    location.search,
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

  return (
    <div className="filters-block outline-button">
      <Search data={data} providers_data={providers_data} />
      <button onClick={() => setOpen(true)}>Advanced Filter</button>
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
