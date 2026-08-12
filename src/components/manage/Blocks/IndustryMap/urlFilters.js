import { inputsKeys } from '@eeacms/volto-ied-policy/components/manage/Blocks/FiltersMap/dictionary';

/**
 * Single source of truth for translating IndustryMap filters between the
 * `filter_*` object shape (used by the UI + `getWhereStatement`) and the URL
 * query string. The URL is the source of truth for filter *values*; the redux
 * slice only holds cross-component coordination state (filter_change, etc).
 *
 * The encoding intentionally matches the keys consumed by the data providers
 * (`Site_reporting_year[in]`, `eprtr_sectors[in]`, `bat_conclusions[like]`, ...)
 * so that shared/reloaded URLs reproduce the exact same map + table results.
 */

/**
 * Derive the most specific NUTS regions from the selected country / nuts_1 /
 * nuts_2 filters. Kept here (rather than index.js) so it can be reused without a
 * circular import. `index.js` re-exports this for `getWhereStatement`.
 */
export const getLatestRegions = (query) => {
  const siteCountries = query.filter_countries;
  const regions = query.filter_nuts_1;
  const provinces = query.filter_nuts_2;
  let nuts = [];
  let nuts_latest = [];

  siteCountries &&
    siteCountries.forEach((country) => {
      const filteredRegions = regions
        ? regions.filter((region) => region && region.includes(country))
        : [];
      if (filteredRegions.length) {
        filteredRegions.forEach((region) => {
          const filteredProvinces = provinces
            ? provinces.filter(
                (province) => province && province.includes(region),
              )
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

  return { nuts, nuts_latest };
};

const wrap = (values) => values.map((v) => `%${v}%`).join(',');

/**
 * filters object -> URLSearchParams.
 * @param {Object} filters - the `filter_*` shape.
 * @param {Object} [location] - react-router location; `activeTab` is preserved.
 */
export const filtersToSearchParams = (filters = {}, location) => {
  const urlParams = new URLSearchParams();
  const activeTab = location
    ? new URLSearchParams(location.search).get('activeTab')
    : null;
  if (activeTab) urlParams.set('activeTab', activeTab);

  const clean = (key) =>
    (filters[key] || []).filter((v) => v != null && v !== '');

  const reportingYears = clean('filter_reporting_years');
  if (reportingYears.length)
    urlParams.set('Site_reporting_year[in]', reportingYears.join(','));

  const industries = clean('filter_industries');
  if (industries.length) urlParams.set('eprtr_sectors[like]', wrap(industries));

  const annexActivity = clean('filter_eprtr_AnnexIActivity');
  if (annexActivity.length)
    urlParams.set('eprtr_AnnexIActivity[like]', wrap(annexActivity));

  const batConclusions = clean('filter_bat_conclusions');
  if (batConclusions.length)
    urlParams.set('bat_conclusions[like]', wrap(batConclusions));

  const permitTypes = clean('filter_permit_types');
  if (permitTypes.length)
    urlParams.set('permit_types[like]', wrap(permitTypes));

  const permitYears = clean('filter_permit_years');
  if (permitYears.length)
    urlParams.set('permit_years[like]', wrap(permitYears));

  const pollutants = clean('filter_pollutants');
  if (pollutants.length) urlParams.set('pollutants[like]', wrap(pollutants));

  const pollutantGroups = clean('filter_pollutant_groups');
  if (pollutantGroups.length) {
    urlParams.set('air_groups[like]', wrap(pollutantGroups));
    urlParams.set('water_groups[like]', wrap(pollutantGroups));
  }

  const countries = clean('filter_countries');
  if (countries.length) urlParams.set('countryCode[in]', countries.join(','));

  const { nuts_latest } = getLatestRegions(filters);
  const nuts = (nuts_latest || []).filter((v) => v != null && v !== '');
  if (nuts.length) urlParams.set('nuts_regions[like]', wrap(nuts));

  const thematic = clean('filter_thematic_information');
  if (thematic.includes('has_release'))
    urlParams.set('has_release_data[gt]', 0);
  if (thematic.includes('has_transfer'))
    urlParams.set('has_transfer_data[gt]', 0);
  if (thematic.includes('has_waste')) urlParams.set('has_waste_data[gt]', 0);
  if (thematic.includes('has_seveso')) urlParams.set('has_seveso[gt]', 0);

  const installationTypes = clean('filter_installation_types');
  if (installationTypes.includes('IED'))
    urlParams.set('count_instype_IED[gte]', 1);
  if (installationTypes.includes('NONIED'))
    urlParams.set('count_instype_NONIED[gte]', 1);

  const facilityTypes = clean('filter_facility_types');
  if (facilityTypes.length)
    urlParams.set('facility_types', wrap(facilityTypes));

  const riverBasins = clean('filter_river_basin_districts');
  if (riverBasins.length) urlParams.set('river_basin', wrap(riverBasins));

  const plantTypes = clean('filter_plant_types');
  if (plantTypes.length) urlParams.set('plant_types', wrap(plantTypes));

  return urlParams;
};

const stripPct = (v) => v.replaceAll('%', '');

/**
 * URLSearchParams (or a search string) -> filters object.
 * Always returns all `inputsKeys` defaulted to [] so callers can read safely.
 */
export const searchParamsToFilters = (searchParams) => {
  const params =
    typeof searchParams === 'string'
      ? new URLSearchParams(searchParams)
      : searchParams;

  const filters = {};
  inputsKeys.forEach((key) => {
    filters[key] = [];
  });

  for (const [key, value] of params.entries()) {
    if (!value) continue;
    switch (key) {
      case 'Site_reporting_year[in]':
        filters.filter_reporting_years = value
          .split(',')
          .filter((year) => !isNaN(year))
          .map((year) => parseInt(year, 10));
        break;
      case 'eprtr_sectors[like]':
        filters.filter_industries = value.split(',').map(stripPct);
        break;
      case 'eprtr_AnnexIActivity[like]':
        filters.filter_eprtr_AnnexIActivity = value.split(',').map(stripPct);
        break;
      case 'bat_conclusions[like]':
        filters.filter_bat_conclusions = value.split(',').map(stripPct);
        break;
      case 'permit_types[like]':
        filters.filter_permit_types = value.split(',').map(stripPct);
        break;
      case 'permit_years[like]':
        filters.filter_permit_years = value
          .split(',')
          .map(stripPct)
          .filter((year) => !isNaN(year))
          .map((year) => parseInt(year, 10));
        break;
      case 'pollutants[like]':
        filters.filter_pollutants = value.split('%,').map(stripPct);
        break;
      case 'air_groups[like]':
      case 'water_groups[like]':
        filters.filter_pollutant_groups = value.split(',').map(stripPct);
        break;
      case 'countryCode[in]':
        filters.filter_countries = value.split(',');
        break;
      case 'nuts_regions[like]': {
        const region = stripPct(value);
        filters.filter_nuts_2 = [region];
        filters.filter_nuts_1 = [region.substring(0, region.length - 1)];
        break;
      }
      case 'has_release_data[gt]':
        filters.filter_thematic_information = [
          ...filters.filter_thematic_information,
          'has_release',
        ];
        break;
      case 'has_transfer_data[gt]':
        filters.filter_thematic_information = [
          ...filters.filter_thematic_information,
          'has_transfer',
        ];
        break;
      case 'has_waste_data[gt]':
        filters.filter_thematic_information = [
          ...filters.filter_thematic_information,
          'has_waste',
        ];
        break;
      case 'has_seveso[gt]':
        filters.filter_thematic_information = [
          ...filters.filter_thematic_information,
          'has_seveso',
        ];
        break;
      case 'count_instype_IED[gte]':
        filters.filter_installation_types = [
          ...filters.filter_installation_types,
          'IED',
        ];
        break;
      case 'count_instype_NONIED[gte]':
        filters.filter_installation_types = [
          ...filters.filter_installation_types,
          'NONIED',
        ];
        break;
      case 'facility_types':
        filters.filter_facility_types = value.split('%,').map(stripPct);
        break;
      case 'river_basin':
        filters.filter_river_basin_districts = value.split('%,').map(stripPct);
        break;
      case 'plant_types':
        filters.filter_plant_types = value.split('%,').map(stripPct);
        break;
      default:
        break;
    }
  }

  return filters;
};
