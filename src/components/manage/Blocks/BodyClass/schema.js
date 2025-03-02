const schema = {
  title: 'Body class',

  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['class'],
    },
  ],

  properties: {
    class: {
      title: 'Classname',
      description: 'The value will be applied to body tag',
    },
  },

  required: [],
};

export default schema;
