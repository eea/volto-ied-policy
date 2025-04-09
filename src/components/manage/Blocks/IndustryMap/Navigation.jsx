import React, { useEffect, useState, useRef } from 'react';

import { openlayers } from '@eeacms/volto-openlayers-map';

import { getWhereStatement } from './index';
import cx from 'classnames';

import { Container, Menu, Dropdown, Grid } from 'semantic-ui-react';
import { UniversalLink } from '@plone/volto/components';
import { getBaseUrl } from '@plone/volto/helpers';

import { positionedOffset } from './dimensions';

import './styles.less';
import { useLocation } from 'react-router-dom';

function toggleItem(container, item, hidden) {
  // Set visibility to hidden, instead of .hidden attribute
  // so we can still calculate distance accurately
  item.style.visibility = hidden ? 'hidden' : '';
  // Get tab-item name, if present, so we can match it up with the dropdown menu
  const itemData = item.getAttribute('item-data');
  if (itemData) {
    const itemToHide = container.querySelector(
      `[underline-item-data="${itemData}"]`,
    );
    if (itemToHide instanceof HTMLElement) {
      itemToHide.hidden = !hidden;
    }
  }
}

const MenuWrapper = ({ children, data, className }) => {
  if (data.styles?.align === 'full') {
    return <Container className="menu-wrapper">{children}</Container>;
  }
  return <div className="menu-wrapper">{children}</div>;
};

const NavigationBlock = ({ data, screen, navigation }) => {
  if (!data?.navigation) return null;
  data = data.navigation;
  const nav = useRef();
  const [items, setItems] = useState([]);
  const pages = data.pages || [];
  const location = useLocation();
  const pathname = getBaseUrl(location.pathname);
  useEffect(() => {
    const parent = navigation.filter((item) => item.url === data.parent)[0];
    setItems(parent?.items || []);
  }, [data.parent, navigation]);

  useEffect(() => {
    if (!nav.current || !data.isResponsive) return;
    const items = nav.current.querySelectorAll('.ui.menu .item');
    const underlineMenu = nav.current.querySelector('.ui.underline-menu');
    if (!underlineMenu) return;
    const overflowOffset = positionedOffset(underlineMenu, nav.current);
    if (!overflowOffset) {
      return;
    }
    let anyHidden = false;
    for (const item of items) {
      const itemOffset = positionedOffset(item, nav.current);
      if (itemOffset) {
        const hidden =
          itemOffset.left + item.offsetWidth >= overflowOffset.left;
        toggleItem(nav.current, item, hidden);
        anyHidden = anyHidden || hidden;
      }
    }
    underlineMenu.style.visibility = anyHidden ? '' : 'hidden';
  }, [screen, data.isResponsive]);

  return (
    <div
      className={cx('navigation-block', {
        'with-container': data.styles?.align === 'full',
      })}
      ref={nav}
    >
      <MenuWrapper data={data}>
        <Menu>
          {items.map((item, index) => (
            <Menu.Item
              key={item.url}
              item-data={item.url}
              active={
                data.isExact
                  ? pathname === item.url
                  : pathname.includes(getBaseUrl(item.url))
              }
            >
              <UniversalLink
                href={`${item.url}${location.search}`}
                ignoreScroll={data.ignoreScroll}
              >
                {item.title}
              </UniversalLink>
            </Menu.Item>
          ))}
          {pages.map((item) => {
            return item.url ? (
              <Menu.Item
                key={item.url}
                item-data={item.url}
                active={pathname.includes(getBaseUrl(item.url))}
              >
                <UniversalLink
                  href={`${item.url}${location.search}`}
                  ignoreScroll={data.ignoreScroll}
                >
                  {item.title}
                </UniversalLink>
              </Menu.Item>
            ) : (
              ''
            );
          })}
        </Menu>
        {data.isResponsive ? (
          <Dropdown
            icon="ellipsis horizontal"
            className="ui underline-menu"
            pointing="top-right"
          >
            <Dropdown.Menu>
              {items.map((item) => (
                <Dropdown.Item
                  hidden
                  key={item.url}
                  underline-item-data={item.url}
                  active={
                    data.isExact
                      ? pathname === item.url
                      : pathname.includes(getBaseUrl(item.url))
                  }
                >
                  <UniversalLink
                    href={`${item.url}${location.search}`}
                    ignoreScroll={data.ignoreScroll}
                  >
                    {item.title}
                  </UniversalLink>
                </Dropdown.Item>
              ))}
              {pages.map((item) => {
                return item.url ? (
                  <Dropdown.Item
                    hidden
                    key={item.url}
                    underline-item-data={item.url}
                    active={pathname.includes(getBaseUrl(item.url))}
                  >
                    <UniversalLink
                      href={`${item.url}${location.search}`}
                      ignoreScroll={data.ignoreScroll}
                    >
                      {item.title}
                    </UniversalLink>
                  </Dropdown.Item>
                ) : (
                  ''
                );
              })}
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          ''
        )}
      </MenuWrapper>
    </div>
  );
};

export default NavigationBlock;
