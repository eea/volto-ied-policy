import iconSVG from '@plone/volto/icons/tag.svg';
import Edit from './Edit';
import View from './View';
import schema from './schema';

const applyConfig = (config) => {
  config.blocks.blocksConfig.custom_connected_tags = {
    id: 'custom_connected_tags',
    title: 'Connected Tags',
    group: 'common',
    view: View,
    edit: Edit,
    schema,
    icon: iconSVG,
  };
  return config;
};

export default applyConfig;
