const providerSchema = {
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

const schema = {
  title: 'Site Explorer',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: [],
    },
    {
      id: 'facility',
      title: 'Current facility',
      fields: ['facility'],
    },
    {
      id: 'facilities',
      title: 'Sibling facilities',
      fields: ['facilities'],
    },
    {
      id: 'installations',
      title: 'Current facility installations',
      fields: ['installations'],
    },
  ],
  properties: {
    facility: {
      title: 'Facility',
      widget: 'object',
      schema: { ...providerSchema },
    },
    facilities: {
      title: 'Facilities',
      widget: 'object',
      schema: { ...providerSchema },
    },
    installations: {
      title: 'Installations',
      widget: 'object',
      schema: { ...providerSchema },
    },
  },
  required: [],
};
export default schema;
