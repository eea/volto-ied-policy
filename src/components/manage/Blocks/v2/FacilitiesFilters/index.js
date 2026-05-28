import codeSVG from '@plone/volto/icons/code.svg';
import Edit from './Edit';
import View from './View';

const BASE =
  'https://test.discomap.eea.europa.eu/arcgis/rest/services/IEPR/' +
  'IEPR_FacilityMap_Test/MapServer/';

// Lightweight options lookup (no geometry) for dropdowns.
export const FACILITIES_OPTIONS_URL = `${BASE}1/query`;

export const COUNTRY_NAMES = {
  BE: 'Belgium',
  CZ: 'Czechia',
  DE: 'Germany',
  PT: 'Portugal',
  SI: 'Slovenia',
};

// V2 URL keys this block writes / FacilitiesMap reads.
export const URL_KEYS = {
  name: 'name',
  reportingYear: 'reportingYear', // comma-separated for multi-select
  country: 'country',
  industrialSector: 'industrialSector',
  facilityType: 'facilityType',
  installationType: 'installationType',
  thematicInformation: 'thematicInformation',
  facilityName: 'facilityName',
  parentCompany: 'parentCompany',
  owner: 'owner',
  pollutants: 'pollutants',
  combustionPlantType: 'combustionPlantType',
  permitType: 'permitType',
  permitYear: 'permitYear',
};

const config = (config) => {
  config.blocks.blocksConfig.facilities_filters = {
    id: 'facilities_filters',
    title: 'Facilities filters',
    icon: codeSVG,
    group: 'ied_addons',
    view: View,
    edit: Edit,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };
  return config;
};

export default config;
