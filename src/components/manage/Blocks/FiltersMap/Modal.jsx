// import React from 'react';
// import { compose } from 'redux';
// import { connect } from 'react-redux';
// import { cloneDeep } from 'lodash';
// import { Modal, Checkbox } from 'semantic-ui-react';
// import { trackSiteSearch } from '@eeacms/volto-matomo/utils';
// import { setQuery } from '@eeacms/volto-ied-policy/actions';
// import { inputsKeys, permitTypes } from './dictionary';
// import SelectWrapper from './SelectWrapper';
// import { filters } from '../IndustryMap';

// const getLatestRegions = (query) => {
//   const siteCountries = query.filter_countries;
//   const regions = query.filter_nuts_1;
//   const provinces = query.filter_nuts_2;
//   let nuts = [];
//   let nuts_latest = [];

//   siteCountries &&
//     siteCountries.forEach((country) => {
//       const filteredRegions = regions
//         ? regions.filter((region) => {
//             return region && region.includes(country);
//           })
//         : [];
//       if (filteredRegions.length) {
//         filteredRegions.forEach((region) => {
//           const filteredProvinces = provinces
//             ? provinces.filter((province) => {
//                 return province && province.includes(region);
//               })
//             : [];
//           if (filteredProvinces.length) {
//             filteredProvinces.forEach((province) => {
//               nuts.push(`${province},${region},${country}`);
//               nuts_latest.push(province);
//             });
//           } else {
//             nuts.push(`${region},${country}`);
//             nuts_latest.push(region);
//           }
//         });
//       }
//     });

//   return {
//     nuts,
//     nuts_latest,
//   };
// };

// const setParamsQuery = (data) => {
//   const query = { ...data, nuts_latest: getLatestRegions(data).nuts_latest };
//   const facility_types = query.filter_facility_types || [];
//   const installation_types = query.filter_installation_types || [];
//   const thematic_information = query.filter_thematic_information || [];
//   const search = query.filter_search;

//   const urlParams = new URLSearchParams();

//   for (const { queryKey, featureKey } of filters) {
//     const values = query[queryKey];
//     if (Array.isArray(values)) {
//       values.forEach((value) => {
//         if (value) {
//           if (featureKey === 'pollutant_groups') {
//             urlParams.append('air_groups_like', value);
//             urlParams.append('water_groups_like', value);
//           } else {
//             urlParams.append(featureKey, value);
//           }
//         }
//       });
//     }
//   }

//   if (facility_types?.filter(Boolean)?.length === 1) {
//     const type = facility_types.includes('EPRTR') ? 'EPRTR' : 'NONEPRTR';
//     urlParams.append('facilityTypes_like', type);
//   }

//   if (installation_types.includes('IED')) {
//     urlParams.append('count_instype_IED_min', '1');
//   }

//   if (installation_types.includes('NONIED')) {
//     urlParams.append('count_instype_NONIED_min', '1');
//   }

//   if (thematic_information.includes('has_release')) {
//     urlParams.append('has_release_data_min', '1');
//   }

//   if (thematic_information.includes('has_transfer')) {
//     urlParams.append('has_transfer_data_min', '1');
//   }

//   if (thematic_information.includes('has_waste')) {
//     urlParams.append('has_waste_data_min', '1');
//   }

//   if (thematic_information.includes('has_seveso')) {
//     urlParams.append('has_seveso_min', '1');
//   }

//   if (search?.type === 'site' && search?.text) {
//     urlParams.append('siteName', search.text.trim());
//   }

//   if (search?.type === 'facility' && search?.text) {
//     urlParams.append('facilityNames', search.text.trim());
//   }

//   return urlParams.toString();
// };

// const filterOptionsByParent = (options, input) => {
//   if (!options || !input) return [];
//   return options.filter((option) => {
//     return (
//       option.value === null ||
//       input.filter((value) => option.key.includes(value)).length
//     );
//   });
// };

// const filterOptionsByParentSector = (options, input) => {
//   if (!options || !input) return [];
//   return options.filter((option) => {
//     return (
//       option.value === null ||
//       input.filter((value) => option.sector.includes(value)).length
//     );
//   });
// };

// const filterInputByParent = (input, parentInput) => {
//   if (!input || !parentInput) return [];
//   return input.filter((value) => {
//     return (
//       value &&
//       parentInput.filter((parentValue) => value.includes(parentValue)).length
//     );
//   });
// };

// const filterInputByParentKey = (input, options, parentInput) => {
//   if (!input || !parentInput) return [];
//   let keys = {};
//   options
//     .filter((opt) => input.includes(opt.value))
//     .forEach((opt) => {
//       keys[input.indexOf(opt.value)] = opt.key;
//     });
//   return input.filter((value, index) => {
//     return (
//       value &&
//       parentInput.filter((parentValue) => keys[index].includes(parentValue))
//         .length
//     );
//   });
// };

// const ModalView = ({
//   data,
//   providers_data,
//   open,
//   options,
//   query,
//   setOpen,
//   setQuery,
// }) => {
//   const [inputs, setInputs] = React.useState({});

//   React.useEffect(() => {
//     setInitialInputs();
//     /* eslint-disable-next-line */
//   }, [open]);

//   /*---------- Actions ----------*/
//   const setInitialInputs = React.useCallback(() => {
//     const inputs = {};
//     inputsKeys.forEach((key) => {
//       inputs[key] = [...(query[key] || [])];
//     });
//     setInputs(inputs);
//   }, [query]);

//   const isChecked = React.useCallback(
//     (filter, label) => {
//       return (inputs[filter] || []).indexOf(label) !== -1;
//     },
//     [inputs],
//   );

//   const setCheckboxValue = React.useCallback(
//     (_, data) => {
//       const values = [...(inputs[data.name] || [])];
//       const value = data.value || data.label;
//       const checked = data.checked;
//       const index = values.indexOf(value);
//       if (checked && index === -1) {
//         values.push(value);
//       }
//       if (!checked && index !== -1) {
//         values.splice(index, 1);
//       }
//       setInputs({ ...inputs, [data.name]: values });
//     },
//     [inputs],
//   );

//   const clearFilters = React.useCallback(() => {
//     const newInputs = {};
//     inputsKeys.forEach((key) => {
//       newInputs[key] = [];
//     });
//     setQuery({
//       ...newInputs,
//       filter_change: {
//         counter: (query['filter_change']?.counter || 0) + 1,
//         type: 'clear',
//       },
//       filter_search: null,
//       filter_search_value: '',
//     });
//     setOpen(false);
//     /* eslint-disable-next-line */
//   }, [query]);

//   const applyFilters = React.useCallback(() => {
//     const newQuery = {
//       ...inputs,
//       filter_change: {
//         counter: (query['filter_change']?.counter || 0) + 1,
//         type: 'advanced-filter',
//       },
//       filter_search: null,
//       filter_search_value: '',
//     };
//     setQuery(newQuery);
//     const urlParams = setParamsQuery(inputs);
//     const newUrl = `${window.location.pathname}?${urlParams}`;
//     trackSiteSearch({
//       category: `Map/Table advanced-filter`,
//       keyword: JSON.stringify({
//         ...Object.keys(newQuery)
//           .filter(
//             (key) =>
//               inputsKeys.includes(key) &&
//               newQuery[key]?.filter((value) => value)?.length,
//           )
//           .reduce((obj, key) => {
//             obj[key] = newQuery[key]?.filter((value) => value);
//             return obj;
//           }, {}),
//       }),
//     });
//     setOpen(false);
//     window.history.pushState({}, '', newUrl);

//     /* eslint-disable-next-line */
//   }, [inputs, query]);

//   /*---------- On change behavior ----------*/
//   const onIndustriesChange = React.useCallback(
//     ({ inputs }) => {
//       let newInputs = cloneDeep(inputs);
//       newInputs.filter_eprtr_AnnexIActivity =
//         newInputs.filter_eprtr_AnnexIActivity.filter((input) => {
//           const sector = options.eprtr_AnnexIActivity.filter(
//             (opt) => opt.value === input,
//           )[0]?.sector;
//           return newInputs.filter_industries.indexOf(sector) !== -1;
//         });
//       setInputs(newInputs);
//     },
//     [options.eprtr_AnnexIActivity],
//   );

//   const onCountriesChange = React.useCallback(({ inputs }) => {
//     let newInputs = cloneDeep(inputs);
//     newInputs.filter_nuts_1 = filterInputByParent(
//       newInputs.filter_nuts_1,
//       newInputs.filter_countries,
//     );
//     newInputs.filter_nuts_2 = filterInputByParent(
//       newInputs.filter_nuts_2,
//       newInputs.filter_nuts_1,
//     );
//     newInputs.filter_river_basin_districts = filterInputByParent(
//       newInputs.filter_river_basin_districts,
//       newInputs.filter_countries,
//     );
//     setInputs(newInputs);
//     /* eslint-disable-next-line */
//   }, []);

//   const onNutsIChange = React.useCallback(({ inputs }) => {
//     let newInputs = cloneDeep(inputs);
//     newInputs.filter_nuts_2 = filterInputByParent(
//       newInputs.filter_nuts_2,
//       newInputs.filter_nuts_1,
//     );
//     setInputs(newInputs);
//     /* eslint-disable-next-line */
//   }, []);

//   const onPollutantGroupsChange = React.useCallback(
//     ({ inputs }) => {
//       let newInputs = cloneDeep(inputs);
//       newInputs.filter_pollutants = filterInputByParentKey(
//         newInputs.filter_pollutants,
//         options.pollutants,
//         newInputs.filter_pollutant_groups,
//       );
//       setInputs(newInputs);
//     },
//     /* eslint-disable-next-line */
//     [options.pollutants, options.pollutant_groups],
//   );

//   /*---------- Custom options ----------*/
//   const eprtrAnnexIActivityOptions = React.useMemo(
//     () =>
//       filterOptionsByParentSector(
//         options.eprtr_AnnexIActivity,
//         inputs.filter_industries,
//       ),
//     [options.eprtr_AnnexIActivity, inputs.filter_industries],
//   );

//   const nutsIOptions = React.useMemo(
//     () => filterOptionsByParent(options.nuts_1, inputs.filter_countries),
//     [options.nuts_1, inputs.filter_countries],
//   );

//   const nutsIIOptions = React.useMemo(
//     () => filterOptionsByParent(options.nuts_2, inputs.filter_nuts_1),
//     [options.nuts_2, inputs.filter_nuts_1],
//   );

//   const riverBasinDistrictsOptions = React.useMemo(
//     () =>
//       filterOptionsByParent(
//         options.river_basin_districts,
//         inputs.filter_countries,
//       ),
//     [options.river_basin_districts, inputs.filter_countries],
//   );

//   const pollutantsOptions = React.useMemo(
//     () =>
//       filterOptionsByParent(options.pollutants, inputs.filter_pollutant_groups),
//     [options.pollutants, inputs.filter_pollutant_groups],
//   );

//   return (
//     <Modal
//       className="filters-block"
//       closeOnDimmerClick={false}
//       open={open}
//       onClose={() => {
//         setOpen(false);
//       }}
//     >
//       <Modal.Header>
//         <span>Advanced search and filter</span>
//         <i
//           aria-hidden
//           className="delete icon"
//           onClick={() => {
//             setOpen(false);
//           }}
//         />
//       </Modal.Header>
//       <Modal.Content>
//         <form autoComplete="off" name="Map advanced filters">
//           <h3>Industrial sector</h3>
//           <SelectWrapper
//             inputs={inputs}
//             name="industries"
//             placeholder="Select industrial sector"
//             options={options.industries}
//             setInputs={setInputs}
//             onChange={onIndustriesChange}
//           />
//           <SelectWrapper
//             inputs={inputs}
//             name="eprtr_AnnexIActivity"
//             placeholder="Select activity"
//             options={eprtrAnnexIActivityOptions}
//             setInputs={setInputs}
//           />
//           <h3>Type of entities</h3>
//           <h4>Facility type</h4>
//           <Checkbox
//             name="filter_facility_types"
//             label="EPRTR"
//             style={{ marginRight: '1rem' }}
//             checked={isChecked('filter_facility_types', 'EPRTR')}
//             onChange={setCheckboxValue}
//           />
//           <Checkbox
//             name="filter_facility_types"
//             label="NONEPRTR"
//             checked={isChecked('filter_facility_types', 'NONEPRTR')}
//             onChange={setCheckboxValue}
//           />
//           <div style={{ marginBottom: '1rem' }} />
//           <h4>Industry type</h4>
//           <Checkbox
//             name="filter_installation_types"
//             label="IED"
//             style={{ marginRight: '1rem' }}
//             checked={isChecked('filter_installation_types', 'IED')}
//             onChange={setCheckboxValue}
//           />
//           <Checkbox
//             name="filter_installation_types"
//             label="NONIED"
//             checked={isChecked('filter_installation_types', 'NONIED')}
//             onChange={setCheckboxValue}
//           />
//           <div style={{ marginBottom: '2rem' }} />
//           <Checkbox
//             name="filter_thematic_information"
//             label="Site with a Seveso establishment"
//             value="has_seveso"
//             checked={isChecked('filter_thematic_information', 'has_seveso')}
//             onChange={setCheckboxValue}
//           />
//           <div style={{ marginBottom: '2rem' }} />
//           <h3>Reporting year</h3>
//           <SelectWrapper
//             inputs={inputs}
//             name="reporting_years"
//             placeholder="Select reporting year"
//             options={options.reporting_years}
//             setInputs={setInputs}
//           />
//           <h3>Geographical specifics</h3>
//           <SelectWrapper
//             inputs={inputs}
//             name="countries"
//             placeholder="Select country"
//             options={options.countries}
//             setInputs={setInputs}
//             onChange={onCountriesChange}
//           />
//           <SelectWrapper
//             inputs={inputs}
//             name="nuts_1"
//             placeholder="Select NUTS 1"
//             options={nutsIOptions}
//             setInputs={setInputs}
//             onChange={onNutsIChange}
//           />
//           <SelectWrapper
//             inputs={inputs}
//             name="nuts_2"
//             placeholder="Select NUTS 2"
//             options={nutsIIOptions}
//             setInputs={setInputs}
//           />
//           <SelectWrapper
//             inputs={inputs}
//             name="river_basin_districts"
//             placeholder="Select riven basin district"
//             options={riverBasinDistrictsOptions}
//             setInputs={setInputs}
//           />
//           <h3>Thematic information</h3>
//           <Checkbox
//             name="filter_thematic_information"
//             label="Pollutant release"
//             value="has_release"
//             style={{ marginRight: '1rem' }}
//             checked={isChecked('filter_thematic_information', 'has_release')}
//             onChange={setCheckboxValue}
//           />
//           <br />
//           <Checkbox
//             name="filter_thematic_information"
//             label="Pollutant transfer"
//             value="has_transfer"
//             style={{ marginRight: '1rem' }}
//             checked={isChecked('filter_thematic_information', 'has_transfer')}
//             onChange={setCheckboxValue}
//           />
//           <br />
//           <Checkbox
//             name="filter_thematic_information"
//             label="Pollutant waste"
//             value="has_waste"
//             checked={isChecked('filter_thematic_information', 'has_waste')}
//             onChange={setCheckboxValue}
//           />
//           <div style={{ marginBottom: '2rem' }} />
//           <h3>Pollutants</h3>
//           <SelectWrapper
//             inputs={inputs}
//             name="pollutant_groups"
//             placeholder="Select pollutant group"
//             options={options.pollutant_groups}
//             setInputs={setInputs}
//             onChange={onPollutantGroupsChange}
//           />
//           <SelectWrapper
//             inputs={inputs}
//             name="pollutants"
//             placeholder="Select pollutant"
//             options={pollutantsOptions}
//             setInputs={setInputs}
//           />
//           <h3>Permit</h3>
//           <SelectWrapper
//             inputs={inputs}
//             name="permit_types"
//             placeholder="Select permit type"
//             options={permitTypes}
//             setInputs={setInputs}
//           />
//           <SelectWrapper
//             inputs={inputs}
//             name="permit_years"
//             placeholder="Select permit year"
//             options={options.permit_years}
//             setInputs={setInputs}
//           />
//           <h3>Combustion plant type</h3>
//           <SelectWrapper
//             inputs={inputs}
//             name="plant_types"
//             placeholder="Select plant type"
//             options={options.plant_types}
//             setInputs={setInputs}
//           />
//           <h3>BAT conclusions</h3>
//           <SelectWrapper
//             inputs={inputs}
//             name="bat_conclusions"
//             placeholder="Select BAT conclusion"
//             options={options.bat_conclusions}
//             setInputs={setInputs}
//           />
//           <div style={{ marginBottom: '1rem' }} />
//         </form>
//       </Modal.Content>
//       <Modal.Actions className="outline-button">
//         <button onClick={clearFilters} className="clear-button">
//           Clear filters
//         </button>
//         <button onClick={applyFilters} className="filter-button">
//           Apply filters
//         </button>
//       </Modal.Actions>
//     </Modal>
//   );
// };

// export default compose(
//   connect(
//     (state) => ({
//       query: state.query.search,
//     }),
//     {
//       setQuery,
//     },
//   ),
// )(ModalView);
