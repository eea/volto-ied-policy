import RegulatoryPermits from './View';
import getSchema from './schema';

const install = (config) => {
  config.blocks.blocksConfig.custom_connected_block = {
    ...config.blocks.blocksConfig.custom_connected_block,
    blocks: {
      ...config.blocks.blocksConfig.custom_connected_block.blocks,
      regulatory_permits: {
        view: RegulatoryPermits,
        title: 'Regulatory permits',
        getSchema: getSchema,
      },
    },
  };
  return config;
};

export default install;
