import codeSVG from '@plone/volto/icons/code.svg';
import Edit from './Edit';
import View from './View';

const config = (config) => {
  config.blocks.blocksConfig.site_explorer = {
    id: 'site_explorer',
    title: 'Site Explorer',
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
