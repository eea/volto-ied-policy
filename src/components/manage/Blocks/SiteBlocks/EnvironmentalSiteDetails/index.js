import EnvironmentalSiteDetails from './View';
import getSchema from './schema';

const install = (config) => {
  config.blocks.blocksConfig.custom_connected_block = {
    ...config.blocks.blocksConfig.custom_connected_block,
    blocks: {
      ...config.blocks.blocksConfig.custom_connected_block.blocks,
      environmental_site_details: {
        view: EnvironmentalSiteDetails,
        title: 'Environmental site details',
        getSchema: getSchema,
      },
    },
  };
  return config;
};
export default install;
