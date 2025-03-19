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

const pollutantsIndexSchema = {
  title: 'Pollutants index',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['allowedParams', 'providers'],
    },
  ],
  properties: {
    providers: {
      title: 'Providers',
      schema: providerSchema,
      widget: 'object_list',
    },
    allowedParams: {
      title: 'Allowed params',
      type: 'array',
      items: {
        choices: [],
      },
    },
  },
  required: [],
};
export default pollutantsIndexSchema;
