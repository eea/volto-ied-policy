const pagesSchema = {
  title: 'Page',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['title', 'url'],
    },
  ],
  properties: {
    title: {
      title: 'Title',
    },
    url: {
      title: 'Pages',
      widget: 'textarea',
    },
  },
  required: [],
};
const Navigation = {
  title: 'Navigation block',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['ignoreScroll', 'isExact', 'isResponsive', 'parent', 'pages'],
    },
  ],
  properties: {
    parent: {
      title: 'Parent',
      widget: 'url',
    },
    pages: {
      title: 'Pages',
      schema: pagesSchema,
      widget: 'object_list',
    },
    isExact: {
      title: 'Is exact',
      type: 'boolean',
    },
    ignoreScroll: {
      title: 'Ignore scroll',
      type: 'boolean',
    },
    isResponsive: {
      title: 'Responsive',
      type: 'boolean',
    },
  },
  required: [],
}
const providerSchema = {
  title: 'Provider',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['name', 'url'],
    },
  ],
  properties: {
    name: {
      title: 'Provider name',
    },
    url: {
      title: 'Provider url',
      widget: 'object_by_path',
    },
  },
  required: [],
};


const Filters =  {
  title: 'Filters block',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['searchPlaceholder'],
    },
  ],
  properties: {
    searchPlaceholder: {
      title: 'Search placeholder',
    },
  },
  required: [],
};
const schema = {
  title: 'Industry map',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['providers', 'hideFilters', 'navigation', 'filters'],
    },
  ],
  properties: {
    providers: {
      title: 'Providers',
      schema: providerSchema,
      widget: 'object_list',
    },
    hideFilters: {
      title: 'Hide Filters',
      type: 'boolean',
    },
    navigation: {
      title: 'Navigation',
      schema: Navigation,
      widget: 'object',
    },
    filters: {
      title: 'Filters',
      schema: Filters,
      widget: 'object'
    }
  },
  required: [],
};

export default schema;
