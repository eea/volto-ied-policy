import {
  SET_INDUSTRY_MAP_FILTERS,
  DELETE_INDUSTRY_MAP_FILTERS,
  RESET_INDUSTRY_MAP_FILTERS,
  TRIGGER_INDUSTRY_MAP_FILTERS_RENDER,
} from '../constants';

const initialState = {
  search: {},
  deletedQueryParams: {},
  counter: 0,
  lastAction: '',
};
// Holds cross-component coordination state only (filter_change, map_extent,
// index_pollutant_id, filter_search). User-facing filter values live in the URL
// query params; see IndustryMap/urlFilters.js.
//fix deploy in strict mode
export default function industryMapFilters(state = initialState, action = {}) {
  let search = { ...state.search };
  let deletedQueryParams = { ...state.deletedQueryParams };
  switch (action.type) {
    case SET_INDUSTRY_MAP_FILTERS:
      if (typeof action.queryParam === 'string') {
        search[action.queryParam] = action.value;
        delete deletedQueryParams[action.queryParam];
      } else if (
        typeof action.queryParam === 'object' &&
        Object.keys(action.queryParam).length > 0
      ) {
        action.queryParam &&
          Object.entries(action.queryParam).forEach(([key, value]) => {
            search[key] = value;
            delete deletedQueryParams[key];
          });
      }
      return {
        ...state,
        search,
        deletedQueryParams,
        counter: state.counter + 1,
        lastAction: SET_INDUSTRY_MAP_FILTERS,
      };
    case DELETE_INDUSTRY_MAP_FILTERS:
      if (Array.isArray(action.queryParam)) {
        action.queryParam.forEach((param) => {
          if (search?.[param]) delete search[param];
          deletedQueryParams[param] = true;
        });
      } else {
        if (search?.[action.queryParam]) delete search[action.queryParam];
        deletedQueryParams[action.queryParam] = true;
      }
      return {
        ...state,
        search,
        deletedQueryParams,
        counter: state.counter + 1,
        lastAction: DELETE_INDUSTRY_MAP_FILTERS,
      };
    case RESET_INDUSTRY_MAP_FILTERS:
      if (Array.isArray(action.queryParam)) {
        action.queryParam.forEach((param) => {
          if (search?.[param]) delete search[param];
          deletedQueryParams[param] = true;
        });
      } else {
        if (search?.[action.queryParam]) delete search[action.queryParam];
        deletedQueryParams[action.queryParam] = true;
      }
      return {
        ...state,
        search: {},
        deletedQueryParams: {},
        counter: 0,
        lastAction: RESET_INDUSTRY_MAP_FILTERS,
      };
    case `${TRIGGER_INDUSTRY_MAP_FILTERS_RENDER}`:
      return {
        ...state,
        counter: state.counter + 1,
        lastAction: TRIGGER_INDUSTRY_MAP_FILTERS_RENDER,
      };
    default:
      return state;
  }
}
