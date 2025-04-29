import React, { useEffect, useState, useRef, useCallback } from 'react';
import { setQuery } from '@eeacms/volto-ied-policy/actions';

import Search from './Search';
import Modal from './Modal';
import { getOptions, permitTypes } from './dictionary';
import { connect } from 'react-redux';
import { connectToMultipleProvidersUnfiltered } from '@eeacms/volto-datablocks/hocs';
import { compose } from 'redux';

import './styles.less';

const View = ({ data, providers_data, query, dispatch }) => {
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
        setInitialFilters({
          filter_reporting_years: [latestYear],
          filter_change: {
            counter: 1,
            type: 'simple-filter',
          },
        });
      }
    }
  }, [
    data,
    providers_data,
    filtersInitialized,
    setInitialFilters,
    permitTypes,
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
  connect((state) => ({
    query: state.query.search,
  })),
  connectToMultipleProvidersUnfiltered((props) => ({
    providers: props.data.providers,
  })),
)(View);
