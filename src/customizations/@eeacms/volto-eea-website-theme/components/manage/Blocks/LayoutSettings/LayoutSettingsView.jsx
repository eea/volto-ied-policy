import React from 'react';
import { BodyClass } from '@plone/volto/helpers';
import { getVoltoStyles } from '@eeacms/volto-eea-website-theme/helpers/schema-utils';
import cx from 'classnames';

const LayoutSettingsView = (props) => {
  let classNames = getVoltoStyles(props.data);
  if (classNames?.['homepage-inverse']) classNames.homepage = 'homepage';
  return <BodyClass className={cx(classNames)} />;
};

function propsAreEqual(prevProps, nextProps) {
  return prevProps.data === nextProps.data;
}

export default React.memo(LayoutSettingsView, propsAreEqual);
