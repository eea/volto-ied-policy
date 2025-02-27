import imageSVG from '@plone/volto/icons/image.svg';
import NavigationBlockView from './View';
import NavigationBlockEdit from './Edit';

const config = (config) => {
  config.blocks.blocksConfig.navigationBlock = {
    id: 'navigationBlock',
    title: 'Navigation Block',
    icon: imageSVG,
    group: 'common',
    view: NavigationBlockView,
    edit: NavigationBlockEdit,
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
