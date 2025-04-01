import config from '@plone/volto/registry';
import messages from '@eeacms/volto-listing-block/messages';

const ItemBlockSchema = ({ data, intl }) => {
  const { assetType = 'image' } = data;
  return {
    title: intl.formatMessage(messages.itemTitle),
    fieldsets: [
      {
        id: 'default',
        title: intl.formatMessage(messages.defaultLabel),
        fields: ['assetType', 'verticalAlign'],
      },
      ...(assetType === 'image'
        ? [
            {
              id: 'image',
              title: intl.formatMessage(messages.image),
              fields: ['image', 'imageSize'],
            },
          ]
        : []),
      ...(assetType === 'icon'
        ? [
            {
              id: 'icon',
              title: intl.formatMessage(messages.iconLabel),
              fields: ['icon', 'iconSize'],
            },
          ]
        : []),
    ],
    properties: {
      assetType: {
        title: intl.formatMessage(messages.assetType),
        choices: [
          ['image', intl.formatMessage(messages.image)],
          ['icon', intl.formatMessage(messages.iconLabel)],
        ],
        default: 'image',
      },
      image: {
        title: intl.formatMessage(messages.image),
        widget: 'attachedimage',
      },
      imageSize: {
        title: intl.formatMessage(messages.imageSize),
        choices: [
          ['tiny', intl.formatMessage(messages.sizeTiny)],
          ['small', intl.formatMessage(messages.sizeSmall)],
          ['medium', intl.formatMessage(messages.sizeMedium)],
          ['big', intl.formatMessage(messages.sizeLarge)],
          ['preview', intl.formatMessage(messages.preview)],
        ],
        default: 'big',
      },
      icon: {
        title: intl.formatMessage(messages.icon),
        description: (
          <>
            Choose an icon from the{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://remixicon.com"
            >
              Remix Icon cheatsheet
            </a>
            . Copy the icon name and prefix it with <code>ri-</code>, for
            example: <code>ri-heart-line</code>.
          </>
        ),
      },
      iconSize: {
        title: intl.formatMessage(messages.iconSize),
        choices: [
          ['tiny', intl.formatMessage(messages.sizeTiny)],
          ['small', intl.formatMessage(messages.sizeSmall)],
          ['medium', intl.formatMessage(messages.sizeMedium)],
          ['big', intl.formatMessage(messages.sizeLarge)],
        ],
        default: 'big',
      },
      theme: {
        title: intl.formatMessage(messages.itemTheme),
        widget: 'theme_picker',
        colors: [
          ...(config.settings && config.settings.themeColors
            ? config.settings.themeColors.map(({ value, title }) => ({
                name: value,
                label: title,
              }))
            : []),
          //and add extra ones here
        ],
      },
      verticalAlign: {
        title: intl.formatMessage(messages.verticalAlign),
        choices: [
          ['top', intl.formatMessage(messages.top)],
          ['middle', intl.formatMessage(messages.middle)],
          ['bottom', intl.formatMessage(messages.bottom)],
        ],
        default: 'middle',
      },
    },
    required: [],
  };
};

export default ItemBlockSchema;
