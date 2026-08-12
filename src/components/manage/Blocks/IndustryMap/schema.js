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

const schema = {
  title: 'Industry map',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['providers', 'hideFilters', 'smallHeight'],
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
    smallHeight: {
      title: 'Small height',
      type: 'boolean',
    },
  },
  required: [],
};

export default schema;
