import { defineMessages } from 'react-intl';

const messages = defineMessages({
  tagItem: {
    id: 'Tag item',
    defaultMessage: 'Tag item',
  },
  default: {
    id: 'Default',
    defaultMessage: 'Default',
  },
  openLinkInNewTab: {
    id: 'openLinkInNewTab',
    defaultMessage: 'Open link in new tab?',
  },
  tagBlock: {
    id: 'tagBlock',
    defaultMessage: 'Tag block',
  },
  title: {
    id: 'title',
    defaultMessage: 'Title',
  },
  alignment: {
    id: 'alignment',
    defaultMessage: 'Alignment',
  },
  showTagIcon: {
    id: 'showTagIcon',
    defaultMessage: 'Enable tag items icon',
  },
  tagItems: {
    id: 'tagItems',
    defaultMessage: 'Tag items',
  },
});

const tagSchema = (intl) => ({
  title: intl.formatMessage(messages.tagItem),
  fieldsets: [
    {
      id: 'default',
      title: intl.formatMessage(messages.default),
      fields: ['category', 'href', 'openLinkInNewTab'],
    },
  ],
  properties: {
    category: {
      title: 'Text',
      widget: 'textarea',
    },
    href: {
      title: 'Link',
      widget: 'url',
    },
    openLinkInNewTab: {
      title: intl.formatMessage(messages.openLinkInNewTab),
      type: 'boolean',
    },
  },
  required: [],
});

const schema = (intl) => ({
  title: intl.formatMessage(messages.tagBlock),

  fieldsets: [
    {
      id: 'default',
      title: intl.formatMessage(messages.default),
      fields: ['title', 'varition', 'position', 'showTagIcon', 'items'],
    },
  ],

  properties: {
    title: {
      title: intl.formatMessage(messages.title),
      widget: 'textarea',
    },
    position: {
      title: intl.formatMessage(messages.alignment),
      widget: 'align',
    },
    showTagIcon: {
      title: intl.formatMessage(messages.showTagIcon),
      type: 'boolean',
    },
    items: {
      title: intl.formatMessage(messages.tagItems),
      widget: 'object_list',
      schema: tagSchema(intl),
    },
  },

  required: [],
});

export default schema;
