import worldSVG from '@plone/volto/icons/world.svg';
import FiltersBlockView from './View';
import FiltersBlockEdit from './Edit';

export default (config) => {
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
