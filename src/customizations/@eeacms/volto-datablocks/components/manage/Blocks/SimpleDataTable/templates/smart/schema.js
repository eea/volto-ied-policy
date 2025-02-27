const getSchema = () => ({
  title: 'Smart datatable',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['searchDescription'],
    },
  ],
  properties: {
    searchDescription: {
      title: 'Search description',
      widget: 'textarea',
    },
  },
  required: [],
});

export default getSchema;
