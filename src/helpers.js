import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { isInternalURL, flattenToAppURL } from '@plone/volto/helpers';

import { isMatch } from 'lodash';
import qs from 'querystring';
import { getBaseUrl } from '@plone/volto/helpers';
import config from '@plone/volto/registry';
import { setConnectedDataParameters } from '@eeacms/volto-datablocks/actions';

export const getFieldURL = (data) => {
  let url = data;
  const _isObject = data && isObject(data) && !isArray(data);
  if (_isObject && data['@type'] === 'URL') {
    url = data['value'] ?? data['url'] ?? data['href'] ?? data;
  } else if (_isObject) {
    url = data['@id'] ?? data['url'] ?? data['href'] ?? data;
  }
  if (isArray(data)) {
    url = data.map((item) => getFieldURL(item));
  }
  if (isString(url) && isInternalURL(url)) return flattenToAppURL(url);
  return url;
};

export function cleanUpText(value) {
  let text = value.replaceAll('\n', '');
  text = text.replaceAll("'", "''");
  text = text.replace(/(^\s+|\s+$)/gm, '');

  return text;
}

export function removeValue(arr) {
  if (!arr || arr.length === 0) return [];
  let what,
    a = arguments,
    L = a.length,
    ax;
  while (L > 1 && arr.length) {
    what = a[--L];
    while ((ax = arr.indexOf(what)) !== -1) {
      arr.splice(ax, 1);
    }
  }
  return arr;
}

export function getBasePath(url) {
  const parseUrl = url === '' ? '/' : url;
  if (parseUrl) {
    return getBaseUrl(url)
      .replace(config.settings.apiPath, '')
      .replace(config.settings.internalApiPath, '');
  }
  return '';
}

export const getNavigationByParent = (items, parent) => {
  if (items && parent !== undefined && typeof parent === 'string') {
    const pathnameArray = removeValue(parent.split('/'), '');
    const location = pathnameArray;
    const depth = pathnameArray.length;
    if (!depth) {
      return items;
    }
    return deepSearchNavigationParent({
      inputArray: items,
      location,
      depth,
    });
  }
  return {};
};

export const isActive = (url, pathname) => {
  return (
    (url === '' && pathname === '/') ||
    (url !== '' && isMatch(pathname?.split('/'), url?.split('/')))
  );
};

export const objectHasData = (obj) => {
  return typeof obj === 'object' && obj !== null && Object.keys(obj).length > 0;
};

export function deepSearch({ inputArray = [], pattern, depth }) {
  const objFitCriteria = {
    first: (index) => index === 0,
    last: (index) => index === inputArray.length - 1,
  };
  const validate = {
    hasItems: (arr) => arr && arr.length > 0,
  };
  for (let index = 0; index < inputArray.length; index++) {
    if (depth <= 1 || !inputArray[index][pattern.propertyToValidate])
      return inputArray[index][pattern.propertyToReturn] || null;
    if (!objFitCriteria[pattern.criteria]?.(index)) continue;
    if (
      validate[pattern.validationType]?.(
        inputArray[index][pattern.propertyToValidate],
      )
    )
      return deepSearch({
        inputArray: inputArray[index][pattern.propertyToValidate],
        pattern,
        depth: depth - 1,
      });
  }

  return null;
}

export const deepSearchNavigationParent = ({
  inputArray = [],
  location,
  depth,
  start = 1,
}) => {
  for (let index = 0; index < inputArray.length; index++) {
    if (
      depth === 1 &&
      removeValue(inputArray[index].url?.split('/'), '')[start - 1] ===
        location[start - 1]
    ) {
      return inputArray[index] || {};
    }
    if (
      removeValue(inputArray[index].url?.split('/'), '')[start - 1] ===
      location[start - 1]
    ) {
      return deepSearchNavigationParent({
        inputArray: inputArray[index].items,
        location,
        depth: depth - 1,
        start: start + 1,
      });
    }
  }

  return null;
};

export const getSchemaWithDataQuery = (props) => {
  if (!props.schema) return {};
  let schemaWithDataQuery = {};
  Object.keys(props.schema).forEach((element) => {
    if (props.schema[element].type === 'data-provider') {
      if (
        !objectHasData(
          props?.connected_data_parameters?.byProviderPath?.[props.path],
        ) &&
        !objectHasData(
          props?.connected_data_parameters?.byContextPath?.[props.path],
        )
      ) {
        const dataQuery = {};
        dataQuery[element + '_data_query'] = {
          defaultformat: 'compactnumber',
          type: 'data-query',
        };
        schemaWithDataQuery[element] = props.schema[element];
        schemaWithDataQuery = { ...schemaWithDataQuery, ...dataQuery };
      }
    }
    schemaWithDataQuery[element] = props.schema[element];
  });
  return schemaWithDataQuery;
};

export const updateConnectedDataParameters = (props) => {
  props.schema &&
    Object.keys(props.schema).forEach((element) => {
      if (props.schema[element].type === 'data-query') {
        if (
          props?.newData?.columns?.[element] &&
          (props?.newData?.columns?.[element]?.value?.i !==
            props?.data?.columns?.[element]?.value?.i ||
            props?.newData?.columns?.[element]?.value?.v !==
              props?.data?.columns?.[element]?.value?.v)
        ) {
          const path = getBasePath(props.pathname);
          const byPath = props?.connected_data_parameters?.byPath;
          const connected_data_parameters =
            (byPath?.[path]?.override?.length > 0 &&
              byPath?.[path]?.override?.[`${props.id}_${element}`]) ||
            null;
          if (
            connected_data_parameters === null ||
            connected_data_parameters?.i !==
              props?.newData?.columns?.[element]?.value?.i ||
            connected_data_parameters?.v?.join(',') !==
              props?.newData?.columns?.[element]?.value?.v
          ) {
            props.dispatch(
              setConnectedDataParameters(
                path.replace('/edit', ''),
                props?.newData?.columns?.[element]?.value,
                `${props.id}_${element}`,
              ),
            );
          }
        }
      }
    });
};

// USED

export const getObjectByIndex = (provider_data, index) => {
  if ((!index && index !== 0) || index === -1) return {};
  const obj = {};
  const keys = Object.keys(provider_data);
  keys.forEach((key) => {
    obj[key] = provider_data[key][index];
  });
  return obj;
};

export function removeTralingSlash(url) {
  return getBasePath(url).replace(/\/+$/, '');
}

export const getEncodedQueryString = (query) => {
  if (!query) return '';
  return qs.stringify(
    { query },
    {
      arrayFormat: 'comma',
      encode: true,
    },
  );
};

export const emitEvent = (el, eventName, options) => {
  let event;
  if (window.CustomEvent) {
    event = new CustomEvent(eventName, options);
  } else {
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(eventName, true, true, options);
  }
  if (el) el.dispatchEvent(event);
};

export const getEncodedString = (str) => {
  if (str) {
    return qs
      .stringify(
        { str },
        {
          arrayFormat: 'comma',
          encode: true,
        },
      )
      .replace('str=', '');
  }
  return '';
};
