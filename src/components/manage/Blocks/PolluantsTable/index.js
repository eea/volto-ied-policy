import documentIcon from '@plone/volto/icons/doument-details.svg';
import Edit from './Edit';
import View from './View';
import schema from './schema';

const applyConfig = (config) => {
  config.blocks.blocksConfig.polluantTable = {
    id: 'polluantTable',
    title: 'Pollutant index',
    icon: documentIcon,
    group: 'eprtr_blocks',
    view: View,
    edit: Edit,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
    schema,
    security: {
      addPermission: [],
      view: [],
    },
  };
  return config;
};

export default applyConfig;
