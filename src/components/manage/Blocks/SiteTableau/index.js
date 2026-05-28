import sliderSVG from '@plone/volto/icons/slider.svg';
import Edit from './Edit';
import View from './View';

const applyConfig = (config) => {
  config.blocks.blocksConfig.site_tableau_block = {
    id: 'site_tableau_block',
    title: 'Site tableau',
    icon: sliderSVG,
    group: 'data_blocks',
    edit: Edit,
    view: View,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
    blocks: {},
    security: {
      addPermission: [],
      view: [],
    },
    breakpoints: {
      desktop: [Infinity, 982],
      tablet: [981, 768],
      mobile: [767, 0],
    },
    defaultProviderUrl: '/data-connectors/site-flags',
  };
  return config;
};

export default applyConfig;
