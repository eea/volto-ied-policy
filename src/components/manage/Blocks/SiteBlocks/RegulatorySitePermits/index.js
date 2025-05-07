import RegulatorySitePermits from './View';
import getSchema from './schema';

const install = (config) => {
  config.blocks.blocksConfig.custom_connected_block = {
    ...config.blocks.blocksConfig.custom_connected_block,
    blocks: {
      ...config.blocks.blocksConfig.custom_connected_block.blocks,
      regulatory_site_permits: {
        view: RegulatorySitePermits,
        title: 'Regulatory site permits',
        getSchema: getSchema,
      },
    },
  };
  return config;
};

export default install;
