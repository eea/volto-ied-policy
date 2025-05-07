import installEnvironmentalSiteDetails from './EnvironmentalSiteDetails';
import installEnvironmentalSiteStructure from './SiteStructureSidebar';
const installEprtrSpecificBlocks = (config) => {
  return [
    installEnvironmentalSiteDetails,
    installEnvironmentalSiteStructure,
  ].reduce((acc, apply) => apply(acc), config);
};

export default installEprtrSpecificBlocks;
