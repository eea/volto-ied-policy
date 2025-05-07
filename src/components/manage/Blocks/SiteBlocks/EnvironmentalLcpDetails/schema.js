const schema = {
  title: 'Env. Site Details',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['provider_url'],
    },
  ],
  properties: {
    provider_url: {
      title: 'Data provider',
      widget: 'url',
    },
  },
  required: [],
};
export default schema;
