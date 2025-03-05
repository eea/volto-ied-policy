import {
  SET_QUERY,
  DELETE_QUERY,
  RESET_QUERY,
  TRIGGER_QUERY_RENDER,
} from '@eeacms/volto-industry-theme/constants';

export function setQuery(queryParam) {
  return {
    type: SET_QUERY,
    queryParam,
  };
}

export function deleteQuery(queryParam) {
  return {
    type: DELETE_QUERY,
    queryParam,
  };
}

export function resetQuery() {
  return {
    type: RESET_QUERY,
  };
}

export function triggerQueryRender() {
  return {
    type: TRIGGER_QUERY_RENDER,
  };
}
