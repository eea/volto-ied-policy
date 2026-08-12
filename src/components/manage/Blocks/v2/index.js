import installFacilitiesFilters from './FacilitiesFilters';
import installFacilitiesMap from './FacilitiesMap';
import installInstallationMap from './InstallationMap';
import installInstallationPartsList from './InstallationPartsList';
import installSiteExplorer from './SiteExplorer';

const config = (config) =>
  [
    installSiteExplorer,
    installInstallationPartsList,
    installFacilitiesFilters,
    installFacilitiesMap,
    installInstallationMap,
  ].reduce((acc, apply) => apply(acc), config);

export default config;
