import installBodyClass from './BodyClass';
import installRedirect from './Redirect';
import installFactsheetsListing from './FactsheetsListing';
import installKeyFacts from './KeyFacts';
import installMaesViewer from './MaesViewer';
import installNavigation from './Navigation';

const config = (config) => {
  return [
    installBodyClass,
    installRedirect,
    installFactsheetsListing,
    installKeyFacts,
    installMaesViewer,
    installNavigation,
  ].reduce((acc, apply) => apply(acc), config);
};

export default config;
