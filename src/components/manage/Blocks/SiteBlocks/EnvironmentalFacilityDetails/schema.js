const schema = {
  title: 'Env. Facility Details',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['provider_url'],
    },
  ],
  properties: {
    provider_url: {
      title: 'Providers',
      schema: providerSchema,
      widget: 'url',
    },
  },
  required: [],
};
export default schema;
