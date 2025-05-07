import Edit from './Edit';
import View from './View';
import schema from './schema';
import documentIcon from '@plone/volto/icons/doument-details.svg';

const apply = (config) => {
  config.blocks.blocksConfig.environmental_site_details = {
    view: View,
    edit: Edit,
    schema: schema,
    id: 'environmental_site_details',
    icon: documentIcon,
    group: 'eprtr_blocks',
    title: 'Environmenta Site Details',
  };
  return config;
};

export default apply;
