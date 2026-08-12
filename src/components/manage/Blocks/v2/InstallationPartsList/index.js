import codeSVG from '@plone/volto/icons/code.svg';
import Edit from './Edit';
import View from './View';

const config = (config) => {
  config.blocks.blocksConfig.installation_parts_list = {
    id: 'installation_parts_list',
    title: 'Installation parts list',
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
