/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { setIndustryMapFilters } from '@eeacms/volto-ied-policy/actions';

import Search from './Search';
import Modal from './Modal';
import { getOptions, permitTypes } from './dictionary';
import { connect } from 'react-redux';
import { connectToMultipleProvidersUnfiltered } from '@eeacms/volto-datablocks/hocs';
import { compose } from 'redux';
import './styles.less';
import { withRouter } from 'react-router-dom';
import {
  filtersToSearchParams,
  searchParamsToFilters,
} from '@eeacms/volto-ied-policy/components/manage/Blocks/IndustryMap/urlFilters';
const View = ({
  data,
  providers_data,
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
        // Filters live in the URL (source of truth). Seed a default reporting
        // year into the URL when none is present, then trigger the initial fetch.
        const urlFilters = searchParamsToFilters(initialSearchRef.current);
        const hasReportingYear = urlFilters.filter_reporting_years?.length > 0;
        if (!hasReportingYear && props.mode !== 'edit') {
          const search = filtersToSearchParams(
            { ...urlFilters, filter_reporting_years: [latestYear] },
            location,
          ).toString();
          history.push({
            pathname: location.pathname,
            search: search ? `?${search}` : '',
          });
        }
        dispatch(
          setIndustryMapFilters({ filter_change: { counter: 1, type: 'simple-filter' } }),
        );
        setFiltersInitialized(true);
      }
    }
  }, [
    data,
    providers_data,
    filtersInitialized,
    permitTypes,
    dispatch,
    history,
    location,
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
  connect(null),
  connectToMultipleProvidersUnfiltered((props) => ({
    providers: props.data.providers,
  })),
)(View);
