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
      fields: ['providers'],
    },
  ],
  properties: {
    providers: {
      title: 'Providers',
      schema: providerSchema,
      widget: 'object_list',
    },
  },
  required: [],
};

export default schema;
