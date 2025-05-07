/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import { Modal, Checkbox } from 'semantic-ui-react';
import { trackSiteSearch } from '@eeacms/volto-matomo/utils';
import { setQuery } from '@eeacms/volto-ied-policy/actions';
import { inputsKeys, permitTypes } from './dictionary';
import SelectWrapper from './SelectWrapper';
import { withRouter } from 'react-router-dom';

const getLatestRegions = (query) => {
  const siteCountries = query.filter_countries;
  const regions = query.filter_nuts_1;
  const provinces = query.filter_nuts_2;
  let nuts = [];
  let nuts_latest = [];

  siteCountries &&
    siteCountries.forEach((country) => {
      const filteredRegions = regions
        ? regions.filter((region) => {
            return region && region.includes(country);
          })
        : [];
      if (filteredRegions.length) {
        filteredRegions.forEach((region) => {
          const filteredProvinces = provinces
            ? provinces.filter((province) => {
                return province && province.includes(region);
              })
            : [];
          if (filteredProvinces.length) {
            filteredProvinces.forEach((province) => {
              nuts.push(`${province},${region},${country}`);
              nuts_latest.push(province);
            });
          } else {
            nuts.push(`${region},${country}`);
            nuts_latest.push(region);
          }
        });
      }
    });

  return {
    nuts,
    nuts_latest,
  };
};

const setParamsQuery = (data, location) => {
  const oldParams = new URLSearchParams(location.search);
  const activeTab = oldParams.get('activeTab');
  const query = { ...data, nuts_latest: getLatestRegions(data).nuts_latest };

  const urlParams = new URLSearchParams();
  if (activeTab) {
    urlParams.set('activeTab', activeTab);
  }
  const filteredReportingYears =
    query?.filter_reporting_years?.filter((year) => year != null) ?? [];

  if (filteredReportingYears.length > 0) {
    urlParams.set('Site_reporting_year[in]', filteredReportingYears.join(','));
  }

  const filteredIndustries =
    query.filter_industries.filter((industry) => industry != null) ?? [];
  if (filteredIndustries.length > 0) {
    urlParams.set('eprtr_sectors[in]', filteredIndustries.join(','));
  }

  const filteredEprtrAnnexIActivity =
    query.filter_eprtr_AnnexIActivity.filter((activity) => activity != null) ??
    [];
  if (filteredEprtrAnnexIActivity.length > 0) {
    urlParams.set(
      'eprtr_AnnexIActivity[in]',
      filteredEprtrAnnexIActivity.join(','),
    );
  }

  const filteredBatConclusions =
    query.filter_bat_conclusions.filter((conclusion) => conclusion != null) ??
    [];
  if (filteredBatConclusions.length > 0) {
    urlParams.set(
      'bat_conclusions[like]',
      filteredBatConclusions.map((conclusion) => `%${conclusion}%`).join(','),
    );
  }

  const filteredPermitTypes =
    query.filter_permit_types.filter((type) => type != null) ?? [];
  if (filteredPermitTypes.length > 0) {
    urlParams.set(
      'permit_types[like]',
      filteredPermitTypes.map((type) => `%${type}%`).join(','),
    );
  }

  const filteredPermitYears =
    query.filter_permit_years.filter((year) => year != null) ?? [];
  if (filteredPermitYears.length > 0) {
    urlParams.set(
      'permit_years[like]',
      filteredPermitYears.map((year) => `%${year}%`).join(','),
    );
  }

  const filteredPollutants =
    query.filter_pollutants.filter((pollutant) => pollutant != null) ?? [];
  if (filteredPollutants.length > 0) {
    urlParams.set(
      'pollutants[like]',
      filteredPollutants.map((pollutant) => `%${pollutant}%`).join(','),
    );
  }

  const filteredPollutantsGroups =
    query.filter_pollutant_groups.filter((group) => group != null) ?? [];
  if (filteredPollutantsGroups.length > 0) {
    urlParams.set(
      'air_groups[like]',
      filteredPollutantsGroups.map((group) => `%${group}%`).join(','),
    );
    urlParams.set(
      'water_groups[like]',
      filteredPollutantsGroups.map((group) => `%${group}%`).join(','),
    );
  }

  const filteredCountryCodes =
    query.filter_countries.filter((code) => code != null) ?? [];
  if (filteredCountryCodes.length > 0) {
    urlParams.set('countryCode[in]', filteredCountryCodes.join(','));
  }

  const filteredNuts = query.nuts_latest.filter((nuts) => nuts != null) ?? [];
  if (filteredNuts.length > 0) {
    urlParams.set(
      'nuts_regions[like]',
      filteredNuts.map((nuts) => `%${nuts}%`).join(','),
    );
  }

  const filteredThematicInformation =
    query.filter_thematic_information.filter((info) => info != null) ?? [];
  if (filteredThematicInformation.length > 0) {
    if (filteredThematicInformation.indexOf('has_release') !== -1) {
      urlParams.set('has_release_data[gt]', 0);
    }
    if (filteredThematicInformation.indexOf('has_transfer') !== -1) {
      urlParams.set('has_transfer_data[gt]', 0);
    }
    if (filteredThematicInformation.indexOf('has_waste') !== -1) {
      urlParams.set('has_waste_data[gt]', 0);
    }
    if (filteredThematicInformation.indexOf('has_seveso') !== -1) {
      urlParams.set('has_seveso[gt]', 0);
    }
  }

  const filteredInstallationTypes =
    query.filter_installation_types.filter((type) => type != null) ?? [];
  if (filteredInstallationTypes.length > 0) {
    if (filteredInstallationTypes.indexOf('IED') !== -1) {
      urlParams.set('count_instype_IED[gte]', 1);
    }
    if (filteredInstallationTypes.indexOf('NONIED') !== -1) {
      urlParams.set('count_instype_NONIED[gte]', 1);
    }
  }

  const filteredFacilityTypes =
    query.filter_facility_types.filter((type) => type != null) ?? [];
  if (filteredFacilityTypes.length > 0) {
    urlParams.set(
      'facility_types',
      filteredFacilityTypes.map((type) => `%${type}%`).join(','),
    );
  }

  const filteredRiverBasinDistricts =
    query.filter_river_basin_districts.filter((district) => district != null) ??
    [];
  if (filteredRiverBasinDistricts.length > 0) {
    urlParams.set(
      'river_basin',
      filteredRiverBasinDistricts.map((district) => `%${district}%`).join(','),
    );
  }

  const filteredPlantTypes =
    query.filter_plant_types.filter((type) => type != null) ?? [];
  if (filteredPlantTypes.length > 0) {
    urlParams.set(
      'plant_types',
      filteredPlantTypes.map((type) => `%${type}%`).join(','),
    );
  }

  return urlParams.toString();
};

const filterOptionsByParent = (options, input) => {
  if (!options || !input) return [];
  return options.filter((option) => {
    return (
      option.value === null ||
      input.filter((value) => option.key.includes(value)).length
    );
  });
};

const filterOptionsByParentSector = (options, input) => {
  if (!options || !input) return [];
  return options.filter((option) => {
    return (
      option.value === null ||
      input.filter((value) => option.sector.includes(value)).length
    );
  });
};

const filterInputByParent = (input, parentInput) => {
  if (!input || !parentInput) return [];
  return input.filter((value) => {
    return (
      value &&
      parentInput.filter((parentValue) => value.includes(parentValue)).length
    );
  });
};

const filterInputByParentKey = (input, options, parentInput) => {
  if (!input || !parentInput) return [];
  let keys = {};
  options
    .filter((opt) => input.includes(opt.value))
    .forEach((opt) => {
      keys[input.indexOf(opt.value)] = opt.key;
    });
  return input.filter((value, index) => {
    return (
      value &&
      parentInput.filter((parentValue) => keys[index].includes(parentValue))
        .length
    );
  });
};

const ModalView = ({
  data,
  providers_data,
  open,
  options,
  query,
  setOpen,
  setQuery,
  history,
  location,
}) => {
  const [inputs, setInputs] = React.useState({});

  React.useEffect(() => {
    setInitialInputs();
    /* eslint-disable-next-line */
  }, [open]);

  /*---------- Actions ----------*/
  const setInitialInputs = React.useCallback(() => {
    const inputs = {};
    inputsKeys.forEach((key) => {
      inputs[key] = [...(query[key] || [])];
    });
    setInputs(inputs);
  }, [query]);

  const isChecked = React.useCallback(
    (filter, label) => {
      return (inputs[filter] || []).indexOf(label) !== -1;
    },
    [inputs],
  );

  const setCheckboxValue = React.useCallback(
    (_, data) => {
      const values = [...(inputs[data.name] || [])];
      const value = data.value || data.label;
      const checked = data.checked;
      const index = values.indexOf(value);
      if (checked && index === -1) {
        values.push(value);
      }
      if (!checked && index !== -1) {
        values.splice(index, 1);
      }
      setInputs({ ...inputs, [data.name]: values });
    },
    [inputs],
  );

  const clearFilters = React.useCallback(() => {
    history.replace({
      pathname: location.pathname,
      search: '',
    });
    const newInputs = {};
    inputsKeys.forEach((key) => {
      newInputs[key] = [];
    });
    setQuery({
      ...newInputs,
      filter_change: {
        counter: (query['filter_change']?.counter || 0) + 1,
        type: 'clear',
      },
      filter_search: null,
      filter_search_value: '',
    });
    setOpen(false);

    /* eslint-disable-next-line */
  }, [query, history, location]);

  const applyFilters = React.useCallback(() => {
    const newQuery = {
      ...inputs,
      filter_change: {
        counter: (query['filter_change']?.counter || 0) + 1,
        type: 'advanced-filter',
      },
      filter_search: null,
      filter_search_value: '',
    };
    setQuery(newQuery);
    const urlParams = setParamsQuery(inputs, location);
    trackSiteSearch({
      category: `Map/Table advanced-filter`,
      keyword: JSON.stringify({
        ...Object.keys(newQuery)
          .filter(
            (key) =>
              inputsKeys.includes(key) &&
              newQuery[key]?.filter((value) => value)?.length,
          )
          .reduce((obj, key) => {
            obj[key] = newQuery[key]?.filter((value) => value);
            return obj;
          }, {}),
      }),
    });
    setOpen(false);
    history.push({
      pathname: location.pathname,
      search: `?${urlParams.toString()}`,
    });
    /* eslint-disable-next-line */
  }, [inputs, query]);

  /*---------- On change behavior ----------*/
  const onIndustriesChange = React.useCallback(
    ({ inputs }) => {
      let newInputs = cloneDeep(inputs);
      newInputs.filter_eprtr_AnnexIActivity =
        newInputs.filter_eprtr_AnnexIActivity.filter((input) => {
          const sector = options.eprtr_AnnexIActivity.filter(
            (opt) => opt.value === input,
          )[0]?.sector;
          return newInputs.filter_industries.indexOf(sector) !== -1;
        });
      setInputs(newInputs);
    },
    [options.eprtr_AnnexIActivity],
  );

  const onCountriesChange = React.useCallback(({ inputs }) => {
    let newInputs = cloneDeep(inputs);
    newInputs.filter_nuts_1 = filterInputByParent(
      newInputs.filter_nuts_1,
      newInputs.filter_countries,
    );
    newInputs.filter_nuts_2 = filterInputByParent(
      newInputs.filter_nuts_2,
      newInputs.filter_nuts_1,
    );
    newInputs.filter_river_basin_districts = filterInputByParent(
      newInputs.filter_river_basin_districts,
      newInputs.filter_countries,
    );
    setInputs(newInputs);
    /* eslint-disable-next-line */
  }, []);

  const onNutsIChange = React.useCallback(({ inputs }) => {
    let newInputs = cloneDeep(inputs);
    newInputs.filter_nuts_2 = filterInputByParent(
      newInputs.filter_nuts_2,
      newInputs.filter_nuts_1,
    );
    setInputs(newInputs);
    /* eslint-disable-next-line */
  }, []);

  const onPollutantGroupsChange = React.useCallback(
    ({ inputs }) => {
      let newInputs = cloneDeep(inputs);
      newInputs.filter_pollutants = filterInputByParentKey(
        newInputs.filter_pollutants,
        options.pollutants,
        newInputs.filter_pollutant_groups,
      );
      setInputs(newInputs);
    },
    /* eslint-disable-next-line */
    [options.pollutants, options.pollutant_groups],
  );

  /*---------- Custom options ----------*/
  const eprtrAnnexIActivityOptions = React.useMemo(
    () =>
      filterOptionsByParentSector(
        options.eprtr_AnnexIActivity,
        inputs.filter_industries,
      ),
    [options.eprtr_AnnexIActivity, inputs.filter_industries],
  );

  const nutsIOptions = React.useMemo(
    () => filterOptionsByParent(options.nuts_1, inputs.filter_countries),
    [options.nuts_1, inputs.filter_countries],
  );

  const nutsIIOptions = React.useMemo(
    () => filterOptionsByParent(options.nuts_2, inputs.filter_nuts_1),
    [options.nuts_2, inputs.filter_nuts_1],
  );

  const riverBasinDistrictsOptions = React.useMemo(
    () =>
      filterOptionsByParent(
        options.river_basin_districts,
        inputs.filter_countries,
      ),
    [options.river_basin_districts, inputs.filter_countries],
  );

  const pollutantsOptions = React.useMemo(
    () =>
      filterOptionsByParent(options.pollutants, inputs.filter_pollutant_groups),
    [options.pollutants, inputs.filter_pollutant_groups],
  );

  return (
    <Modal
      className="filters-block"
      closeOnDimmerClick={false}
      open={open}
      onClose={() => {
        setOpen(false);
      }}
    >
      <Modal.Header>
        <span>Advanced search and filter</span>
        <i
          aria-hidden
          className="delete icon"
          onClick={() => {
            setOpen(false);
          }}
        />
      </Modal.Header>
      <Modal.Content>
        <form autoComplete="off" name="Map advanced filters">
          <h3>Industrial sector</h3>
          <SelectWrapper
            inputs={inputs}
            name="industries"
            placeholder="Select industrial sector"
            options={options.industries}
            setInputs={setInputs}
            onChange={onIndustriesChange}
          />
          <SelectWrapper
            inputs={inputs}
            name="eprtr_AnnexIActivity"
            placeholder="Select activity"
            options={eprtrAnnexIActivityOptions}
            setInputs={setInputs}
          />
          <h3>Type of entities</h3>
          <h4>Facility type</h4>
          <Checkbox
            name="filter_facility_types"
            label="EPRTR"
            style={{ marginRight: '1rem' }}
            checked={isChecked('filter_facility_types', 'EPRTR')}
            onChange={setCheckboxValue}
          />
          <Checkbox
            name="filter_facility_types"
            label="NONEPRTR"
            checked={isChecked('filter_facility_types', 'NONEPRTR')}
            onChange={setCheckboxValue}
          />
          <div style={{ marginBottom: '1rem' }} />
          <h4>Industry type</h4>
          <Checkbox
            name="filter_installation_types"
            label="IED"
            style={{ marginRight: '1rem' }}
            checked={isChecked('filter_installation_types', 'IED')}
            onChange={setCheckboxValue}
          />
          <Checkbox
            name="filter_installation_types"
            label="NONIED"
            checked={isChecked('filter_installation_types', 'NONIED')}
            onChange={setCheckboxValue}
          />
          <div style={{ marginBottom: '2rem' }} />
          <Checkbox
            name="filter_thematic_information"
            label="Site with a Seveso establishment"
            value="has_seveso"
            checked={isChecked('filter_thematic_information', 'has_seveso')}
            onChange={setCheckboxValue}
          />
          <div style={{ marginBottom: '2rem' }} />
          <h3>Reporting year</h3>
          <SelectWrapper
            inputs={inputs}
            name="reporting_years"
            placeholder="Select reporting year"
            options={options.reporting_years}
            setInputs={setInputs}
          />
          <h3>Geographical specifics</h3>
          <SelectWrapper
            inputs={inputs}
            name="countries"
            placeholder="Select country"
            options={options.countries}
            setInputs={setInputs}
            onChange={onCountriesChange}
          />
          <SelectWrapper
            inputs={inputs}
            name="nuts_1"
            placeholder="Select NUTS 1"
            options={nutsIOptions}
            setInputs={setInputs}
            onChange={onNutsIChange}
          />
          <SelectWrapper
            inputs={inputs}
            name="nuts_2"
            placeholder="Select NUTS 2"
            options={nutsIIOptions}
            setInputs={setInputs}
          />
          <SelectWrapper
            inputs={inputs}
            name="river_basin_districts"
            placeholder="Select riven basin district"
            options={riverBasinDistrictsOptions}
            setInputs={setInputs}
          />
          <h3>Thematic information</h3>
          <Checkbox
            name="filter_thematic_information"
            label="Pollutant release"
            value="has_release"
            style={{ marginRight: '1rem' }}
            checked={isChecked('filter_thematic_information', 'has_release')}
            onChange={setCheckboxValue}
          />
          <br />
          <Checkbox
            name="filter_thematic_information"
            label="Pollutant transfer"
            value="has_transfer"
            style={{ marginRight: '1rem' }}
            checked={isChecked('filter_thematic_information', 'has_transfer')}
            onChange={setCheckboxValue}
          />
          <br />
          <Checkbox
            name="filter_thematic_information"
            label="Pollutant waste"
            value="has_waste"
            checked={isChecked('filter_thematic_information', 'has_waste')}
            onChange={setCheckboxValue}
          />
          <div style={{ marginBottom: '2rem' }} />
          <h3>Pollutants</h3>
          <SelectWrapper
            inputs={inputs}
            name="pollutant_groups"
            placeholder="Select pollutant group"
            options={options.pollutant_groups}
            setInputs={setInputs}
            onChange={onPollutantGroupsChange}
          />
          <SelectWrapper
            inputs={inputs}
            name="pollutants"
            placeholder="Select pollutant"
            options={pollutantsOptions}
            setInputs={setInputs}
          />
          <h3>Permit</h3>
          <SelectWrapper
            inputs={inputs}
            name="permit_types"
            placeholder="Select permit type"
            options={permitTypes}
            setInputs={setInputs}
          />
          <SelectWrapper
            inputs={inputs}
            name="permit_years"
            placeholder="Select permit year"
            options={options.permit_years}
            setInputs={setInputs}
          />
          <h3>Combustion plant type</h3>
          <SelectWrapper
            inputs={inputs}
            name="plant_types"
            placeholder="Select plant type"
            options={options.plant_types}
            setInputs={setInputs}
          />
          <h3>BAT conclusions</h3>
          <SelectWrapper
            inputs={inputs}
            name="bat_conclusions"
            placeholder="Select BAT conclusion"
            options={options.bat_conclusions}
            setInputs={setInputs}
          />
          <div style={{ marginBottom: '1rem' }} />
        </form>
      </Modal.Content>
      <Modal.Actions className="outline-button">
        <button onClick={clearFilters} className="clear-button">
          Clear filters
        </button>
        <button onClick={applyFilters} className="filter-button">
          Apply filters
        </button>
      </Modal.Actions>
    </Modal>
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
)(ModalView);
