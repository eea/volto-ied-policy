import { Sitemap } from '@plone/volto/components';
import { getBlocks } from '@plone/volto/helpers';
import installLink from '@plone/volto-slate/editor/plugins/AdvancedLink';

import { addStylingFieldsetSchemaEnhancer } from '@eeacms/volto-ied-policy/components/manage/Blocks/schema';
import ecLogo from '@eeacms/volto-ied-policy/../theme/assets/logos/logo-ec.svg';
import iedLogo from '@eeacms/volto-ied-policy/../theme/assets/images/Header/Emissions_portal_negative.svg';
import iedLogoBlack from '@eeacms/volto-ied-policy/../theme/assets/images/Header/Emissions_portal_colour.svg';

import IndustryDataTable from './components/IndustryDataTableVariation.jsx';
import RedirectView from './components/manage/Views/RedirectView.jsx';
import installBlocks from './components/manage/Blocks';
import installStyles from './styles-config';
import addonReducers from './reducers';

const restrictedBlocks = ['imagecards', 'embed_eea_tableau_block'];

const customBlocks = [
  'html',
  'countryFlag',
  'tableau_block',
  'body_classname',
  'redirect',
  'navigationBlock',
];

const applyConfig = (config) => {
  // ---------- Core settings ----------
  config.settings = {
    ...config.settings,
    navDepth: 3,
    isMultilingual: false,
    defaultLanguage: config.settings.eea?.defaultLanguage || 'en',
    providerUrl: 'https://discodata.eea.europa.eu/sql',
  };

  // ---------- Routes ----------
  // Subsite sitemap pages (e.g., /industrial-emissions/sitemap)
  config.addonRoutes = [
    ...(config.addonRoutes || []),
    { path: '/**/sitemap', component: Sitemap },
  ];

  // ---------- Reducers ----------
  config.addonReducers = {
    ...config.addonReducers,
    ...addonReducers,
  };

  // ---------- API Expanders ----------
  config.settings.apiExpanders = [
    ...(config.settings.apiExpanders || []),
    {
      match: ['/facility', '/facility/*'],
      GET_CONTENT: ['connector-data'],
    },
  ];

  // ---------- Content type views ----------
  config.views.contentTypesViews.redirect = RedirectView;

  // ---------- EEA branding ----------
  config.settings.eea = {
    ...(config.settings.eea || {}),
    headerOpts: {
      ...(config.settings.eea?.headerOpts || {}),
      logo: iedLogoBlack,
      logoWhite: iedLogo,
      // Reserve the taller logo variant; CSS preserves each SVG's ratio.
      logoWidth: 300,
      logoHeight: 143,
    },
    headerSearchBox: [
      {
        isDefault: true,
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
    columnSize: { mobile: 6, tablet: 12, computer: 4 },
  };

  // ---------- Block defaults ----------
  config.blocks.requiredBlocks = [];
  config.blocks.blocksConfig.html.restricted = false;
  config.blocks.blocksConfig.tableau_block.restricted = false;

  // ---------- Slate: advanced link ----------
  config = installLink(config);
  const toolbarButtons = config.settings.slate.toolbarButtons || [];
  const linkIndex = toolbarButtons.indexOf('link');
  const advancedLinkIndex = toolbarButtons.indexOf('a');
  toolbarButtons.splice(linkIndex, 1, 'a');
  toolbarButtons.splice(advancedLinkIndex, 1);

  // ---------- Columns block ----------
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

  // ---------- Listing block ----------
  if (config.blocks.blocksConfig.listing) {
    config.blocks.blocksConfig.listing.title = 'Listing (Content)';
    config.blocks.blocksConfig.listing.schemaEnhancer =
      addStylingFieldsetSchemaEnhancer;
  }

  // ---------- Hero image left ----------
  if (config.blocks.blocksConfig.hero_image_left) {
    config.blocks.blocksConfig.hero_image_left.schemaEnhancer =
      addStylingFieldsetSchemaEnhancer;
  }

  // ---------- Install custom blocks + styles ----------
  config = [installBlocks, installStyles].reduce(
    (acc, apply) => apply(acc),
    config,
  );

  // ---------- Restrict blocks ----------
  restrictedBlocks.forEach((block) => {
    if (config.blocks.blocksConfig[block]) {
      config.blocks.blocksConfig[block].restricted = true;
    }
  });

  // ---------- Group custom blocks ----------
  config.blocks.groupBlocksOrder = [
    ...config.blocks.groupBlocksOrder,
    { id: 'custom_blocks', title: 'Custom blocks' },
  ];
  customBlocks.forEach((block) => {
    if (config.blocks.blocksConfig[block]) {
      config.blocks.blocksConfig[block].group = 'custom_blocks';
    }
  });

  // ---------- data_table variation ----------
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
