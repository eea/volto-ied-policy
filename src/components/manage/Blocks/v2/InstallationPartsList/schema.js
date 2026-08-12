const schema = {
  title: 'Installation parts list',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['provider_url', 'allowedParams'],
    },
  ],
  properties: {
    provider_url: {
      title: 'Provider url',
      widget: 'object_by_path',
    },
    allowedParams: {
      title: 'Allowed params',
      type: 'array',
      creatable: true,
      items: { choices: [] },
    },
  },
  required: [],
};
export default schema;
