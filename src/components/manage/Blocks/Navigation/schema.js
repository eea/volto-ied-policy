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
      title: 'Url',
      widget: 'url',
    },
  },
  required: [],
};

const schema = {
  title: 'Navigation block',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['parent', 'pages'],
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
  },
  required: [],
};

export default schema;
