import worldSVG from '@plone/volto/icons/world.svg';
import FiltersBlockView from './View';
import FiltersBlockEdit from './Edit';

const applyFiltersBlockConfig = (config) => {
  config.blocks.blocksConfig.filtersBlock = {
    id: 'filtersBlock',
    title: 'Filters Block',
    icon: worldSVG,
    group: 'eprtr_blocks',
    view: FiltersBlockView,
    edit: FiltersBlockEdit,
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

export default applyFiltersBlockConfig;
