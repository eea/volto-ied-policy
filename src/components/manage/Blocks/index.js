import installBodyClass from './BodyClass';
import installConnectedList from './ConnectedList';
import installFactsheetsListing from './FactsheetsListing';
import installFiltersMap from './FiltersMap';
import installIndustryMap from './IndustryMap';
import installKeyFacts from './KeyFacts';
import installMaesViewer from './MaesViewer';
import installNavigation from './Navigation';
import installPolluantsTable from './PolluantsTable';
import installRedirect from './Redirect';
import installSiteBlocks from './SiteBlocks';
import installSiteLocationMap from './SiteLocationMap';
import installSiteTableau from './SiteTableau';
import installV2Blocks from './v2';

const config = (config) =>
  [
    installBodyClass,
    installConnectedList,
    installFactsheetsListing,
    installFiltersMap,
    installIndustryMap,
    installKeyFacts,
    installMaesViewer,
    installNavigation,
    installPolluantsTable,
    installRedirect,
    installSiteBlocks,
    installSiteLocationMap,
    installSiteTableau,
    installV2Blocks,
  ].reduce((acc, apply) => apply(acc), config);

export default config;
