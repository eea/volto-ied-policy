import { getBlocks } from '@plone/volto/helpers';
import installLink from '@plone/volto-slate/editor/plugins/AdvancedLink';
import { addStylingFieldsetSchemaEnhancer } from '@eeacms/volto-ied-policy/components/manage/Blocks/schema';
import documentIcon from '@plone/volto/icons/doument-details.svg';
import sliderSVG from '@plone/volto/icons/slider.svg';

import installBlocks from './components/manage/Blocks';
import installStyles from './styles-config';
import iconSVG from '@plone/volto/icons/tag.svg';
import iedLogo from '@eeacms/volto-ied-policy/../theme/assets/images/Header/ied-logo.svg';
import ecLogo from '@eeacms/volto-ied-policy/../theme/assets/logos/logo-ec.svg';
import ListView from './components/manage/Blocks/ConnectedList/View.jsx';
import EditView from './components/manage/Blocks/ConnectedList/Edit.jsx';
import getSchema from './components/manage/Blocks/ConnectedList/schema.js';
import PollutantIndexView from './components/manage/Blocks/PolluantsTable/View';
import PollutantIndexEdit from './components/manage/Blocks/PolluantsTable/Edit';
import addonReducers from './reducers';
import IndustryDataTable from './components/IndustryDataTableVariation.jsx';
import TableauEdit from './components/manage/Blocks/SiteTableau/Edit';
import TableauView from './components/manage/Blocks/SiteTableau/View';

import installSiteBlocks from './components/manage/Blocks/SiteBlocks/index.js';
import RedirectView from './components/manage/Views/RedirectView.jsx';

const restrictedBlocks = ['imagecards', 'embed_eea_tableau_block'];

const customBlocks = [
  'html',
  'countryFlag',
  'tableau_block',
  'body_classname',
  'redirect',
  'navigationBlock',
];

const n2kLanguages = [
  { name: 'Български', code: 'bg' },
  { name: 'čeština', code: 'cs' },
  { name: 'Hrvatski', code: 'hr' },
  { name: 'dansk', code: 'da' },
  { name: 'Nederlands', code: 'nl' },
  { name: 'ελληνικά', code: 'el' },
  { name: 'English', code: 'en' },
  { name: 'eesti', code: 'et' },
  { name: 'Suomi', code: 'fi' },
  { name: 'Français', code: 'fr' },
  { name: 'Deutsch', code: 'de' },
  { name: 'magyar', code: 'hu' },
  { name: 'Irish', code: 'ga' },
  { name: 'italiano', code: 'it' },
  { name: 'Latviešu', code: 'lv' },
  { name: 'lietuvių', code: 'lt' },
  { name: 'Malti', code: 'mt' },
  { name: 'polski', code: 'pl' },
  { name: 'Português', code: 'pt' },
  { name: 'Română', code: 'ro' },
  { name: 'slovenčina', code: 'sk' },
  { name: 'Slovenščina', code: 'sl' },
  { name: 'Español', code: 'es' },
  { name: 'Svenska', code: 'sv' },
];

const applyConfig = (config) => {
  // Volto specific settings

  config.settings = {
    ...config.settings,
    navDepth: 3,
  };

  config = installSiteBlocks(config);
  config = installSiteBlocks(config);
  config.blocks.blocksConfig.site_tableau_block = {
    id: 'site_tableau_block',
    title: 'Site tableau',
    icon: sliderSVG,
    group: 'data_blocks',
    edit: TableauEdit,
    view: TableauView,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
    blocks: {},
    security: {
      addPermission: [],
      view: [],
    },
    breakpoints: {
      desktop: [Infinity, 982],
      tablet: [981, 768],
      mobile: [767, 0],
    },
    defaultProviderUrl: '/data-connectors/site-flags',
  };
  config.views.contentTypesViews.redirect = RedirectView;

  config.blocks.blocksConfig.polluantTable = {
    id: 'polluantTable',
    title: 'Pollutant index',
    icon: documentIcon,
    group: 'eprtr_blocks',
    view: PollutantIndexView,
    edit: PollutantIndexEdit,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
    schema: getSchema,
    security: {
      addPermission: [],
      view: [],
    },
  };
  // config.blocks.blocksConfig.siteHeader = {
  //   view: SiteHeader,
  //   edit: SiteHeader,
  //   title: 'Site header',
  //   getSchema: siteHeaderSchema,
  //   id: 'siteHeader',
  //   icon: documentIcon,
  //   group: 'eprtr_blocks',
  // };

  // config.blocks.blocksConfig.regularitory_site_details = {
  //   view: RegulatorySiteDetails,
  //   edit: RegulatorySiteDetails,
  //   schema: RegulatorySiteDetailsSchema,
  //   id: 'regularitory_site_details',
  //   icon: documentIcon,
  //   group: 'eprtr_blocks',
  //   title: 'Regulatory Site Details',
  // };

  // config.blocks.blocksConfig.regularitory_site_permits = {
  //   view: RegulatoryPermits,
  //   edit: RegulatoryPermits,
  //   schema: RegulatoryPermitsSchema,
  //   id: 'regularitory_site_permits',
  //   icon: documentIcon,
  //   group: 'eprtr_blocks',
  //   title: 'Regulatory Permits',
  // };
  // config.blocks.blocksConfig.regulatory_bat = {
  //   view: RegulatoryBAT,
  //   edit: RegulatoryBAT,
  //   schema: RegulatoryBATSchema,
  //   id: 'regulatory_bat',
  //   icon: documentIcon,
  //   group: 'eprtr_blocks',
  //   title: 'Regulatory BAT',
  // };

  config.addonReducers = {
    ...config.addonReducers,
    ...addonReducers,
  };
  config.blocks.blocksConfig.custom_connected_tags = {
    id: 'custom_connected_tags',
    title: 'Connected Tags',
    group: 'common',
    view: ListView,
    edit: EditView,
    schema: getSchema,
    icon: iconSVG,
  };

  config.blocks.blocksConfig.tableau_block.restricted = false;
  // Multi-lingual
  config.settings.isMultilingual = false;
  config.settings.defaultLanguage =
    config.settings.eea?.defaultLanguage || 'en';

  // mega menu layout settings

  // EEA customizations
  config.settings.eea = {
    ...(config.settings.eea || {}),
    languages: n2kLanguages,
    headerOpts: {
      ...(config.settings.eea?.headerOpts || {}),
      logo: iedLogo,
      logoWhite: iedLogo,
    },
    headerSearchBox: [
      {
        isDefault: true,
        // to replace search path change path to whatever you want and match with the page in volto website
        path: '/advanced-search',
        placeholder: 'Search IED...',
        description:
          'Looking for more information? Try searching the full EEA website content',
        buttonTitle: 'Go to advanced search',
        buttonUrl: 'https://www.eea.europa.eu/en/advanced-search',
      },
    ],
    logoTargetUrl: '/',
    organisationName: 'European Industrial Emissions Portal',
  };

  config.settings.eea.footerOpts.logosHeader = 'Managed by';
  config.settings.eea.footerOpts.managedBy[1] = {
    url: 'https://commission.europa.eu',
    src: ecLogo,
    alt: 'European commission Logo',
    className: 'commission logo',
    columnSize: {
      mobile: 6,
      tablet: 12,
      computer: 4,
    },
  };
  // BISE config

  config.blocks.requiredBlocks = [];

  config.blocks.blocksConfig.html.restricted = false;

  // Install advanced link
  config = installLink(config);
  const toolbarButtons = config.settings.slate.toolbarButtons || [];
  const linkIndex = toolbarButtons.indexOf('link');
  const advancedLinkIndex = toolbarButtons.indexOf('a');
  toolbarButtons.splice(linkIndex, 1, 'a');
  toolbarButtons.splice(advancedLinkIndex, 1);

  // Customizations
  config.settings.providerUrl = 'https://discodata.eea.europa.eu/sql';

  // Columns
  if (config.blocks.blocksConfig.columnsBlock) {
    config.blocks.blocksConfig.columnsBlock.mostUsed = true;
    config.blocks.blocksConfig.columnsBlock.schemaEnhancer =
      addStylingFieldsetSchemaEnhancer;
    config.blocks.blocksConfig.columnsBlock.tocEntry = undefined;
    config.blocks.blocksConfig.columnsBlock.tocEntries = (
      block = {},
      tocData,
    ) => {
      // integration with volto-block-toc
      const headlines = tocData.levels || ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
      let entries = [];
      const sorted_column_blocks = getBlocks(block?.data || {});
      sorted_column_blocks.forEach((column_block) => {
        const sorted_blocks = getBlocks(column_block[1]);
        sorted_blocks.forEach((block) => {
          const { value, plaintext } = block[1];
          const type = value?.[0]?.type;
          if (headlines.includes(type)) {
            entries.push([parseInt(type.slice(1)), plaintext, block[0]]);
          }
        });
      });
      return entries;
    };
  }

  // Listing
  if (config.blocks.blocksConfig.listing) {
    config.blocks.blocksConfig.listing.title = 'Listing (Content)';
    config.blocks.blocksConfig.listing.schemaEnhancer =
      addStylingFieldsetSchemaEnhancer;
  }

  // Hero image left
  if (config.blocks.blocksConfig.hero_image_left) {
    config.blocks.blocksConfig.hero_image_left.schemaEnhancer =
      addStylingFieldsetSchemaEnhancer;
  }

  config = [installBlocks, installStyles].reduce(
    (acc, apply) => apply(acc),
    config,
  );

  // Disable some blocks
  restrictedBlocks.forEach((block) => {
    if (config.blocks.blocksConfig[block]) {
      config.blocks.blocksConfig[block].restricted = true;
    }
  });

  // Set custom blocks
  config.blocks.groupBlocksOrder = [
    ...config.blocks.groupBlocksOrder,
    { id: 'custom_blocks', title: 'Custom blocks' },
  ];
  customBlocks.forEach((block) => {
    if (config.blocks.blocksConfig[block]) {
      config.blocks.blocksConfig[block].group = 'custom_blocks';
    }
  });
  if (config?.blocks?.blocksConfig?.data_table) {
    config.blocks.blocksConfig.data_table = {
      ...config.blocks.blocksConfig.data_table,
      variations: [
        ...config.blocks.blocksConfig.data_table.variations,
        {
          id: 'industryTable',
          title: 'Industry data table',
          view: IndustryDataTable,
        },
      ],
      variationSelector: true,
    };
  }
  return config;
};

export default applyConfig;
