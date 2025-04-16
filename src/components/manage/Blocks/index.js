import installBodyClass from './BodyClass';
import installRedirect from './Redirect';
import installFactsheetsListing from './FactsheetsListing';
import installKeyFacts from './KeyFacts';
import installMaesViewer from './MaesViewer';
import installNavigation from './Navigation';
import installIndustryMap from './IndustryMap';
import FiltersMap from './FiltersMap';
const config = (config) => {
  return [
    installBodyClass,
    installRedirect,
    installFactsheetsListing,
    installKeyFacts,
    installMaesViewer,
    installNavigation,
    installIndustryMap,
    FiltersMap
  ].reduce((acc, apply) => apply(acc), config);
};

export default config;
