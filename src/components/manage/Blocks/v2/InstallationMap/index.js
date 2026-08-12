import codeSVG from '@plone/volto/icons/code.svg';
import Edit from './Edit';
import View from './View';

const BASE =
  'https://test.discomap.eea.europa.eu/arcgis/rest/services/IEPR/' +
  'IEPR_FacilityMap_Test/MapServer/';

export const FACILITIES_INDEX_URL = `${BASE}1/query`;
export const INSTALLATIONS_URL = `${BASE}0/query`;

export const COUNTRY_NAMES = {
  BE: 'Belgium',
  CZ: 'Czechia',
  DE: 'Germany',
  PT: 'Portugal',
  SI: 'Slovenia',
};

const config = (config) => {
  config.blocks.blocksConfig.installation_map = {
    id: 'installation_map',
    title: 'Installation map',
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
