import React, { useMemo } from "react";
import { connect } from "react-redux";
import { Menu } from "semantic-ui-react";
import { UniversalLink } from "@plone/volto/components";
import { flattenToAppURL } from "@plone/volto/helpers";
import { getFieldURL } from "@eeacms/volto-ied-policy/helpers";

import "./styles.less";

const View = ({ history, data, navigation, ...props }) => {
  const search = history?.location?.search || "";
  const pathname = props.path || props.pathname;
  const pages = useMemo(() => data.pages || [], [data.pages]);
  const items = useMemo(() => {
    return [
      ...(navigation.filter(
        (item) => flattenToAppURL(item.url) === getFieldURL(data.parent)
      )[0]?.items || []),
      ...pages.map((page) => ({ ...page, url: getFieldURL(page.url) })),
    ];
  }, [navigation, pages, data.parent]);

  return (
    <Menu className="navigation-block">
      {items.map((item) => (
        <Menu.Item
          key={item.url}
          active={
            item.url &&
            pathname?.replace("/edit", "") === flattenToAppURL(item.url)
          }
        >
          <UniversalLink href={`${item.url}${search}`}>
            {item.title}
          </UniversalLink>
        </Menu.Item>
      ))}
    </Menu>
  );
};

export default connect((state) => ({
  navigation: state.navigation.items,
}))(View);
