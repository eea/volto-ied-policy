export const getOptions = (data, appendNoValue = true) => {
  if (!data || !data.opt_key || !data.opt_value || !data.opt_text) return [];
  return [
    ...(appendNoValue
      ? [{ key: 'no-value', value: null, text: 'No value' }]
      : []),
    ...data.opt_key.map((_, index) => ({
      key: data.opt_id?.[index]
        ? `${data.opt_key[index]} - ${data.opt_id[index]}`
        : data.opt_key[index],
      value: data.opt_value[index],
      text: data.opt_text[index],
      ...(data.opt_sector?.[index] ? { sector: data.opt_sector[index] } : {}),
    })),
  ];
};

export const inputsKeys = [
  'filter_bat_conclusions',
  'filter_countries',
  'filter_eprtr_AnnexIActivity',
  'filter_facility_types',
  'filter_industries',
  'filter_installation_types',
  'filter_nuts_1',
  'filter_nuts_2',
  'filter_permit_types',
  'filter_permit_years',
  'filter_plant_types',
  'filter_pollutant_groups',
  'filter_pollutants',
  'filter_reporting_years',
  'filter_river_basin_districts',
  'filter_thematic_information',
];

export const inputKeysToQueryPar = [
  {'filter_bat_conclusions':'bat_conclusions'},
  {'filter_countries':'countryCode'},
  {'filter_eprtr_AnnexIActivity':'eprtr_AnnexIActivity'},
  {'filter_facility_types':''},
  {'filter_industries':''},
  {'filter_installation_types':''},
  {'filter_nuts_1':''},
  {'filter_nuts_2':''},
  {'filter_permit_types':'permit_types'},
  {'filter_permit_years':'permit_years'},
  {'filter_plant_types':''},
  {'filter_pollutant_groups':''},
  {'filter_pollutants':''},
  {'filter_reporting_years':'Site_reporting_year'},
  {'filter_river_basin_districts':''},
  {'filter_thematic_information': '' },
]

export const permitTypes = [
  { key: null, value: null, text: 'No value' },
  {
    key: 'permitGranted',
    value: 'permitGranted',
    text: 'Permit granted',
  },
  {
    key: 'permitReconsidered',
    value: 'permitReconsidered',
    text: 'Permit reconsidered',
  },
  {
    key: 'permitUpdated',
    value: 'permitUpdated',
    text: 'Permit updated',
  },
];

export const noOptions = [{ key: 'no-value', value: null, text: 'No value' }];
