import {
  SET_INDUSTRY_MAP_FILTERS,
  DELETE_INDUSTRY_MAP_FILTERS,
  RESET_INDUSTRY_MAP_FILTERS,
  TRIGGER_INDUSTRY_MAP_FILTERS_RENDER,
} from '../constants/';

export function setIndustryMapFilters(queryParam) {
  return {
    type: SET_INDUSTRY_MAP_FILTERS,
    queryParam,
  };
}

export function deleteIndustryMapFilters(queryParam) {
  return {
    type: DELETE_INDUSTRY_MAP_FILTERS,
    queryParam,
  };
}

export function resetIndustryMapFilters() {
  return {
    type: RESET_INDUSTRY_MAP_FILTERS,
  };
}

export function triggerIndustryMapFiltersRender() {
  return {
    type: TRIGGER_INDUSTRY_MAP_FILTERS_RENDER,
  };
}
