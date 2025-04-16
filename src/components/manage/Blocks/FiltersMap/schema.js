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
  title: 'Filters block',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['searchPlaceholder', 'providers'],
    },
  ],
  properties: {
    searchPlaceholder: {
      title: 'Search placeholder',
    },
    providers: {
      title: 'Providers',
      schema: providerSchema,
      widget: 'object_list',
    },
  },
  required: [],
};

export default schema;
