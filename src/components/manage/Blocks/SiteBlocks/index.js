/*---  EPRTR specific blocks  ---*/
import installEnvironmentalFacilityDetails from './EnvironmentalFacilityDetails';
import installEnvironmentalLcpDetails from './EnvironmentalLcpDetails';
import installEnvironmentalSiteDetails from './EnvironmentalSiteDetails';
import installRegulatoryBATConclusions from './RegulatoryBATConclusions';
import installRegulatoryPermits from './RegulatoryPermits';
import installRegulatorySiteDetails from './RegulatorySiteDetails';
import installSiteHeader from './Header';
import installSiteStructureSidebar from './SiteStructureSidebar';

const installEprtrSpecificBlocks = (config) => {
  return [
    installEnvironmentalFacilityDetails,
    installEnvironmentalLcpDetails,
    installEnvironmentalSiteDetails,
    installRegulatoryBATConclusions,
    installRegulatoryPermits,
    installRegulatorySiteDetails,
    installSiteHeader,
    installSiteStructureSidebar,
  ].reduce((acc, apply) => apply(acc), config);
};
export default installEprtrSpecificBlocks;
