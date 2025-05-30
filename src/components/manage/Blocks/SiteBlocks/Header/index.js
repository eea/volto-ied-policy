import SiteHeader from './View';
import getSchema from './schema';

const install = (config) => {
  config.blocks.blocksConfig.custom_connected_block = {
    ...config.blocks.blocksConfig.custom_connected_block,
    blocks: {
      ...config.blocks.blocksConfig.custom_connected_block.blocks,
      site_header: {
        view: SiteHeader,
        title: 'Site header',
        getSchema: getSchema,
      },
    },
  };
  return config;
};
export default install;
