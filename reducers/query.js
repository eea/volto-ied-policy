import {
  SET_QUERY,
  DELETE_QUERY,
  RESET_QUERY,
  TRIGGER_QUERY_RENDER,
} from '../constants';

const initialState = {
  search: {},
  deletedQueryParams: {},
  counter: 0,
  lastAction: '',
};

export default function query(state = initialState, action = {}) {
  let search = { ...state.search };
  let deletedQueryParams = { ...state.deletedQueryParams };
  switch (action.type) {
    case SET_QUERY:
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
        lastAction: SET_QUERY,
      };
    case DELETE_QUERY:
      if (Array.isArray(action.queryParam)) {
        action.queryParam.forEach((param) => {
          if (Object.prototype.hasOwnProperty.call(search, param)) {
            delete search[param];
            deletedQueryParams[param] = true;
          }
        });
      } else {
        delete search?.[action.queryParam];
        deletedQueryParams[action.queryParam] = true;
      }
      return {
        ...state,
        search,
        deletedQueryParams,
        counter: state.counter + 1,
        lastAction: DELETE_QUERY,
      };
    case RESET_QUERY:
      if (Array.isArray(action.queryParam)) {
        action.queryParam.forEach((param) => {
          delete search?.[param];
          deletedQueryParams[param] = true;
        });
      } else {
        delete search?.[action.queryParam];
        deletedQueryParams[action.queryParam] = true;
      }
      return {
        ...state,
        search: {},
        deletedQueryParams: {},
        counter: 0,
        lastAction: RESET_QUERY,
      };
    case `${TRIGGER_QUERY_RENDER}`:
      return {
        ...state,
        counter: state.counter + 1,
        lastAction: TRIGGER_QUERY_RENDER,
      };
    default:
      return state;
  }
}
