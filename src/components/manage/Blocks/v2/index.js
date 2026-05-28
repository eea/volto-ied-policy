import installInstallationPartsList from './InstallationPartsList';
import installSiteExplorer from './SiteExplorer';

const config = (config) =>
  [installSiteExplorer, installInstallationPartsList].reduce(
    (acc, apply) => apply(acc),
    config,
  );

export default config;
