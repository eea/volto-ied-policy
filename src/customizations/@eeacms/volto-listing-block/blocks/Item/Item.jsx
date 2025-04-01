import cx from 'classnames';
import { Item as UiItem, Icon } from 'semantic-ui-react';
import { getFieldURL } from '@eeacms/volto-listing-block/helpers';
import config from '@plone/volto/registry';
import 'remixicon/fonts/remixicon.css';
import './styles.less';
const ItemImage = ({ image, imageSize, verticalAlign }) => {
  const imageURL = getFieldURL(image);
  if (!imageURL) return null;
  const imageSizes = config.blocks.blocksConfig.item.imageSizes;
  const size = imageSizes[imageSize];

  return (
    <img
      src={`${imageURL}/@@images/image/${imageSize}`}
      className={cx('ui', imageSize, verticalAlign, 'aligned')}
      alt=""
      width={size.width}
      height={size.height}
      loading="lazy"
    />
  );
};
function Item({
  assetType,
  children,
  description,
  extra,
  header,
  icon,
  iconSize = 'big',
  theme,
  verticalAlign,
  imageSize = 'big',
  meta,
  mode = 'view',
  ...props
}) {
  return (
    <UiItem.Group unstackable className="row">
      <UiItem className={cx(theme)}>
        {assetType === 'image' && (
          <ItemImage
            image={props.image}
            imageSize={imageSize}
            verticalAlign={verticalAlign}
          />
        )}
        {assetType === 'icon' && icon && (
          <Icon
            className={cx(icon, theme, verticalAlign, 'aligned', {
              medium: iconSize === 'medium',
            })}
            size={iconSize === 'medium' ? null : iconSize}
          />
        )}
        <UiItem.Content verticalAlign={verticalAlign}>
          {header && <UiItem.Header>{header}</UiItem.Header>}
          {meta && <UiItem.Meta>{meta}</UiItem.Meta>}
          {description && mode === 'view' && (
            <UiItem.Description>{description}</UiItem.Description>
          )}
          {mode === 'edit' && children}
          {extra && <UiItem.Extra>{extra}</UiItem.Extra>}
        </UiItem.Content>
      </UiItem>
    </UiItem.Group>
  );
}

export default Item;
