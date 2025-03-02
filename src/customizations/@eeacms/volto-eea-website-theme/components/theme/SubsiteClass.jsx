import React, { useEffect, useMemo } from 'react';
import cx from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import config from '@plone/volto/registry';
import { BodyClass, flattenToAppURL } from '@plone/volto/helpers';
import { isSubsiteRoot } from 'volto-subsites/utils';
import { setSubsite } from 'volto-subsites/actions';

const SubsiteClass = () => {
  const dispatch = useDispatch();
  const content = useSelector((state) => state.content?.data);
  const _subsite = useMemo(
    () => content?.data?.['@components']?.subsite || {},
    [content],
  );
  const pathname = useMemo(
    () => flattenToAppURL(content?.['@id']) || '',
    [content],
  );

  const { eea, bise } = config.settings;
  const { subsites, multilingualSubsites } = bise || {};

  const subsite = useMemo(() => {
    for (const subsite of subsites) {
      const subsiteRe = new RegExp(`^(${subsite['@id']})(.*)`, 'g');
      const isMultilingual = multilingualSubsites.includes(subsite['@id']);
      let isRoot = isSubsiteRoot(pathname, subsite);

      if (isMultilingual) {
        for (const language of eea.languages) {
          const multilingualSubsiteRe = new RegExp(
            `^(${subsite['@id']})(/${language.code}($|/))$`,
            'g',
          );
          if (!!pathname.match(multilingualSubsiteRe)) {
            isRoot = true;
            break;
          }
        }
      }

      if (!!pathname.match(subsiteRe)) {
        return {
          ...subsite,
          isMultilingual,
          isRoot,
        };
      }
    }
    return _subsite;
  }, [pathname, _subsite, subsites, multilingualSubsites, eea.languages]);

  const subsiteClass = subsite.subsite_css_class?.token;

  useEffect(() => {
    dispatch(setSubsite(subsite));
  }, [dispatch, subsite]);

  return (
    <BodyClass
      className={cx({
        subsite: subsite?.['@type'] === 'Subsite',
        [`subsite-${subsiteClass}`]: !!subsiteClass,
        'subsite-root': subsite.isRoot,
      })}
    />
  );
};
export default SubsiteClass;
