/**
 * Header component.
 * @module components/theme/Header/Header
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Dropdown, Image, Sticky } from 'semantic-ui-react';
import { connect, useDispatch, useSelector } from 'react-redux';
import Cookies from 'universal-cookie';

import { matchPath } from 'react-router';
import { withRouter, useParams } from 'react-router-dom';
import { UniversalLink } from '@plone/volto/components';
import {
  getBaseUrl,
  hasApiExpander,
  flattenToAppURL,
} from '@plone/volto/helpers';
import { getNavigation } from '@plone/volto/actions';
import { Header, Logo } from '@eeacms/volto-eea-design-system/ui';
import { usePrevious } from '@eeacms/volto-eea-design-system/helpers';
import globeIcon from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Header/global-line.svg';
import eeaFlag from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Header/eea.png';

import config from '@plone/volto/registry';
import { compose } from 'recompose';
import { BodyClass } from '@plone/volto/helpers';
import { withScreenSize } from '@eeacms/volto-resize-helper/hocs';

import cx from 'classnames';

function removeTrailingSlash(path) {
  return path.replace(/\/+$/, '');
}

function getLanguage() {
  if (__SERVER__) {
    return config.settings.eea.defaultLanguage;
  }
  const cookies = new Cookies();

  if (!cookies.get('LANGUAGE')) {
    cookies.set('LANGUAGE', config.settings.eea.defaultLanguage || '');
  }

  return cookies.get('LANGUAGE');
}

/**
 * EEA Specific Header component.
 */
const EEAHeader = ({ token, history, subsite, content, screen, ...props }) => {
  const dispatch = useDispatch();
  const [language, setLanguage] = useState(getLanguage());
  const previousToken = usePrevious(token);
  const params = useParams();
  const { items } = props;
  const { eea } = config.settings;
  const { headerOpts, headerSearchBox } = eea || {};
  const { logo, logoWhite } = headerOpts || {};

  const width = useSelector((state) => state.screen?.width);

  const pathname = removeTrailingSlash(props.pathname);

  const _pathname = removeTrailingSlash(history.location.pathname);

  const content_pathname = useMemo(
    () => flattenToAppURL(content.data?.['@id']),
    [content],
  );

  const isSubsite = subsite?.['@type'] === 'Subsite';

  const isN2KSite = useMemo(() => {
    return !!matchPath(pathname, {
      path: ['/natura2000/sites/site', '/natura2000/sites/site_cdda'],
      exact: false,
    });
  }, [pathname]);

  const isN2KSpecies = useMemo(() => {
    return !!matchPath(pathname, {
      path: '/natura2000/species/species',
      exact: false,
    });
  }, [pathname]);

  const isN2KHabitat = useMemo(() => {
    return !!matchPath(pathname, {
      path: '/natura2000/habitats/habitat',
      exact: false,
    });
  }, [pathname]);

  const isHomePageInverse = content_pathname === '' && _pathname === '';

  const isMultilingual =
    config.settings.isMultilingual || (isSubsite && subsite.isMultilingual);

  const changeLanguage = useCallback(
    (lang) => {
      setLanguage(lang);
      const cookies = new Cookies();
      cookies.set('LANGUAGE', lang);
    },
    [setLanguage],
  );

  const getSubsiteItems = useCallback(() => {
    if (!subsite) return [];
    const subsiteData = items.filter((item) => item.url === subsite['@id'])[0];
    const subsiteItems = subsiteData?.items || [];
    if (subsite.isMultilingual) {
      const subsiteMultilingualData = subsiteItems.filter(
        (item) => item.url === `${subsite['@id']}/${language}`,
      )[0];
      return subsiteMultilingualData?.items || [];
    }

    return subsiteItems;
  }, [items, language, subsite]);

  React.useEffect(() => {
    const { settings } = config;
    const base_url = getBaseUrl(pathname);
    if (!hasApiExpander('navigation', base_url)) {
      dispatch(getNavigation(base_url, settings.navDepth));
    }
  }, [pathname, dispatch]);

  React.useEffect(() => {
    if (token !== previousToken) {
      const { settings } = config;
      const base = getBaseUrl(pathname);
      if (!hasApiExpander('navigation', base)) {
        dispatch(getNavigation(base, settings.navDepth));
      }
    }
  }, [token, dispatch, pathname, previousToken]);

  React.useEffect(() => {
    if (isN2KSpecies && [0, '0'].includes(params.id_eunis)) {
      history.push('/species-name-or-error-code');
    }
    /* eslint-disable-next-line */
  }, [isN2KSpecies, params]);

  React.useEffect(() => {
    let width = 0;
    const menuEl = document.querySelector('.eea.header .main.bar');
    const items =
      document.querySelectorAll(
        '.eea.header .main.bar .main-menu .ui.eea-main-menu li.item',
      ) || [];

    for (let item of items) {
      width += item.offsetWidth;
    }
    menuEl.style.setProperty('--menu-width', `${width}px`);
  }, [screen]);

  return (
    <Header menuItems={items}>
      {isHomePageInverse && <BodyClass className="homepage homepage-inverse" />}
      {isSubsite && !subsite.isRoot && !isN2KSpecies && !isN2KHabitat && (
        <BodyClass className="with-n2k-navigation" />
      )}
      {isSubsite && isN2KSite && <BodyClass className="is-n2k-site" />}

      <Header.TopHeader>
        <Header.TopItem className="official-union">
          <Image src={eeaFlag} alt="eea flag"></Image>
          <Header.TopDropdownMenu
            text="An official website of the European Union | How do you know?"
            tabletText="EEA information systems"
            mobileText=" "
            icon="chevron down"
            aria-label="dropdown"
            className=""
            viewportWidth={width}
          >
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            <div
              className="content"
              onClick={(evt) => evt.stopPropagation()}
              onKeyDown={(evt) => evt.stopPropagation()}
            >
              <p>
                All official European Union website addresses are in the{' '}
                <b>europa.eu</b> domain.
              </p>
              <a
                href="https://europa.eu/european-union/contact/institutions-bodies_en"
                target="_blank"
                rel="noopener"
                onKeyDown={(evt) => evt.stopPropagation()}
              >
                See all EU institutions and bodies
              </a>
            </div>
          </Header.TopDropdownMenu>
        </Header.TopItem>

        {!!headerOpts.partnerLinks && (
          <Header.TopItem>
            <Header.TopDropdownMenu
              id="theme-sites"
              text={headerOpts.partnerLinks.title}
              viewportWidth={width}
            >
              <div className="wrapper">
                <Dropdown.Item>
                  <UniversalLink
                    href={`/natura2000/${language}`}
                    className="site"
                    target="_self"
                    rel="noreferrer"
                  >
                    Natura 2000
                  </UniversalLink>
                </Dropdown.Item>
                {headerOpts.partnerLinks.links.map((item, index) => (
                  <Dropdown.Item key={index}>
                    <a
                      href={item.href}
                      className="site"
                      target="_blank"
                      rel="noopener"
                      onKeyDown={(evt) => evt.stopPropagation()}
                    >
                      {item.title}
                    </a>
                  </Dropdown.Item>
                ))}
              </div>
            </Header.TopDropdownMenu>
          </Header.TopItem>
        )}

        {isMultilingual && !isN2KSite && !isN2KSpecies && !isN2KHabitat && (
          <Header.TopItem>
            <Header.TopDropdownMenu
              id="language-switcher"
              className="item"
              text={`${language.toUpperCase()}`}
              mobileText={`${language.toUpperCase()}`}
              hasLanguageDropdown={true}
              icon={
                <Image
                  src={globeIcon}
                  alt="language dropdown globe icon"
                ></Image>
              }
              viewportWidth={width}
            >
              <ul
                className="wrapper language-list"
                role="listbox"
                aria-label="language switcher"
              >
                {eea.languages.map((item, index) => (
                  <Dropdown.Item
                    as="li"
                    key={index}
                    text={
                      <span>
                        {item.name}
                        <span className="country-code">
                          {item.code.toUpperCase()}
                        </span>
                      </span>
                    }
                    onClick={() => {
                      if (isSubsite && subsite.isMultilingual) {
                        for (const language of eea.languages) {
                          const multilingualSubsiteRe = new RegExp(
                            `^(${subsite['@id']})(/${language.code}($|/))(.*)`,
                            'g',
                          );
                          const matches = [
                            ...pathname.matchAll(multilingualSubsiteRe),
                          ][0];
                          if (matches && matches[2] !== `/${item.code}/`) {
                            changeLanguage(item.code);
                            history.push(
                              `${matches[1]}/${item.code}${
                                matches[4] ? '/' + matches[4] : ''
                              }`,
                            );
                            break;
                          }
                        }
                      }
                    }}
                  ></Dropdown.Item>
                ))}
              </ul>
            </Header.TopDropdownMenu>
          </Header.TopItem>
        )}
      </Header.TopHeader>
      <Sticky
        active={isSubsite && subsite['@id'] === '/natura2000'}
        context={__CLIENT__ && document.querySelector('.content-area')}
      >
        <Header.Main
          pathname={pathname}
          headerSearchBox={headerSearchBox}
          inverted={isHomePageInverse ? true : false}
          transparency={isHomePageInverse ? true : false}
          hideSearch={isSubsite}
          logo={
            <Logo
              src={isHomePageInverse ? logoWhite : logo}
              title={eea.websiteTitle}
              alt={eea.organisationName}
              url={eea.logoTargetUrl}
            />
          }
          menuItems={
            isN2KSite
              ? [
                  {
                    title: 'AT A GLANCE',
                    url: '#',
                    items: [],
                    className: 'at-glance',
                    onClick: (e) => {
                      e.preventDefault();
                      window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: 'smooth',
                      });
                    },
                  },
                  {
                    title: 'GO TO EXPERT VIEW',
                    url: params.site_code
                      ? `https://natura2000.eea.europa.eu/Natura2000/SDF.aspx?site=${params.site_code}`
                      : '#',
                    items: [],
                    className: 'deep-dive',
                    target: params.site_code ? '_blank' : null,
                  },
                ]
              : isSubsite && !subsite.isRoot && !isN2KSpecies && !isN2KHabitat
              ? getSubsiteItems()
              : items.filter((item) => item.url !== '/natura2000')
          }
          renderGlobalMenuItem={(item, { onClick }) => (
            <a
              href={item.url || '/'}
              title={item.title}
              target={item.target || '_self'}
              className={item.className}
              onClick={(e) => {
                if (!isN2KSite) {
                  e.preventDefault();
                  onClick(e, item);
                }
                if (item.onClick) {
                  item.onClick(e, item);
                }
              }}
            >
              {item.title}
            </a>
          )}
          renderMenuItem={(item, options, props) => (
            <UniversalLink
              href={item.url || '/'}
              title={item.nav_title || item.title}
              {...(options || {})}
              className={cx(options?.className, {
                active: item.url === pathname,
              })}
              onClick={(e) => {
                if (item.onClick) {
                  item.onClick(e);
                }
              }}
            >
              {props?.iconPosition !== 'right' && props?.children}
              <span>{item.nav_title || item.title}</span>
              {props?.iconPosition === 'right' && props?.children}
            </UniversalLink>
          )}
        />
      </Sticky>
    </Header>
  );
};

export default compose(
  withRouter,
  withScreenSize,
  connect(
    (state) => ({
      token: state.userSession.token,
      items: state.navigation.items,
      subsite: state.subsite.data,
      content: state.content,
    }),
    { getNavigation },
  ),
)(EEAHeader);
