const schema = {
  title: 'Redirect',

  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['url'],
    },
  ],

  properties: {
    url: {
      title: 'Target',
      widget: 'url',
    },
  },

  required: [],
};

export default schema;
