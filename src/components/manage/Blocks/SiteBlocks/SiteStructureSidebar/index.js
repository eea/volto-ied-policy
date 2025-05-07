import Edit from './Edit';
import View from './View';
import schema from './schema';
import documentIcon from '@plone/volto/icons/doument-details.svg';

const apply = (config) => {
  config.blocks.blocksConfig.site_structure = {
    view: View,
    edit: Edit,
    schema: schema,
    id: 'site_structure',
    icon: documentIcon,
    group: 'eprtr_blocks',
    title: 'Site Structure Sidebar',
  };

  return config;
};

export default apply;
