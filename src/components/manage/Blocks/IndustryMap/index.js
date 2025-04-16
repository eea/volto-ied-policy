import axios from 'axios';
import config from '@plone/volto/registry';
import sliderSVG from '@plone/volto/icons/slider.svg';
import mapPlaceholder from './map_placeholder.png';
import {
  cleanUpText,
  getEncodedQueryString,
} from '@eeacms/volto-ied-policy/helpers.js';
import IndustryMapEdit from './Edit';
import IndustryMapView from './View';

export const filters = [
  {
    queryKey: 'filter_bat_conclusions',
    featureKey: 'batConclusionCode',
    op: 'like',
  },
  { queryKey: 'filter_industries', featureKey: 'eprtr_sectors', op: 'like' },
  {
    queryKey: 'filter_eprtr_AnnexIActivity',
    featureKey: 'eprtr_AnnexIActivity',
    op: 'like',
  },
  { queryKey: 'nuts_latest', featureKey: 'nuts_regions', op: 'like' },
  { queryKey: 'filter_permit_types', featureKey: 'permit_types', op: 'like' },
  { queryKey: 'filter_permit_years', featureKey: 'permitYears', op: 'like' },
  // {
  //   queryKey: 'filter_facility_types',
  //   featureKey: 'facilityTypes',
  //   op: 'eqStr',
  // },
  { queryKey: 'filter_plant_types', featureKey: 'plantTypes', op: 'like' },
  { queryKey: 'filter_pollutants', featureKey: 'pollutants', op: 'like' },
  {
    queryKey: 'filter_pollutant_groups',
    featureKey: 'pollutant_groups',
    op: 'like',
  },
  {
    queryKey: 'filter_reporting_years',
    featureKey: 'Site_reporting_year',
    op: 'eq',
  },
  { queryKey: 'filter_river_basin_districts', featureKey: 'rbds', op: 'like' },
  { queryKey: 'filter_countries', featureKey: 'countryCode', op: 'like' },
  // { queryKey: 'filter_search', featureKey: 'siteName', op: 'like' },
];

export const dataprotection = {
  enabled: true,
  privacy_statement:
    'This map is hosted by a third party [Environmental Systems Research Institute, INC: "ESRI"]. By showing the external content you accept the terms and conditions of www.esri.com. This includes their cookie policies, which we have no control over.',
  privacy_cookie_key: 'site-location-map',
  placeholder_image: mapPlaceholder,
  type: 'big',
};

export const getStyles = (style) => {
  const obj = {};
  obj.smallCircle = new style.Style({
    image: new style.Circle({
      radius: 4,
      fill: new style.Fill({ color: '#000' }),
      stroke: new style.Stroke({ color: '#6A6A6A', width: 1 }),
      zIndex: 0,
    }),
  });
  obj.bigCircle = new style.Style({
    image: new style.Circle({
      radius: 6,
      fill: new style.Fill({ color: '#000' }),
      stroke: new style.Stroke({ color: '#6A6A6A', width: 1 }),
      zIndex: 0,
    }),
  });
  obj.smallGreenCircle = new style.Style({
    image: new style.Circle({
      radius: 4,
      fill: new style.Fill({ color: '#00FF00' }),
      stroke: new style.Stroke({ color: '#6A6A6A', width: 1 }),
      zIndex: 0,
    }),
  });
  obj.bigGreenCircle = new style.Style({
    image: new style.Circle({
      radius: 6,
      fill: new style.Fill({ color: '#00FF00' }),
      stroke: new style.Stroke({ color: '#6A6A6A', width: 1 }),
      zIndex: 0,
    }),
  });
  obj.regionCircle = new style.Style({
    image: new style.Circle({
      radius: 4,
      fill: new style.Fill({ color: '#4296B2' }),
      stroke: new style.Stroke({ color: '#6A6A6A', width: 1 }),
      zIndex: 0,
    }),
  });

  return obj;
};

const getLatestRegions = (query) => {
  const siteCountries = query.filter_countries;
  const regions = query.filter_nuts_1;
  const provinces = query.filter_nuts_2;
  let nuts = [];
  let nuts_latest = [];

  siteCountries &&
    siteCountries.forEach((country) => {
      const filteredRegions = regions
        ? regions.filter((region) => {
            return region && region.includes(country);
          })
        : [];
      if (filteredRegions.length) {
        filteredRegions.forEach((region) => {
          const filteredProvinces = provinces
            ? provinces.filter((province) => {
                return province && province.includes(region);
              })
            : [];
          if (filteredProvinces.length) {
            filteredProvinces.forEach((province) => {
              nuts.push(`${province},${region},${country}`);
              nuts_latest.push(province);
            });
          } else {
            nuts.push(`${region},${country}`);
            nuts_latest.push(region);
          }
        });
      }
    });

  return {
    nuts,
    nuts_latest,
  };
};

export const getLayerSitesURL = (extent) => {
  return `https://air.discomap.eea.europa.eu/arcgis/rest/services/Air/IED_SiteMap/MapServer/0/query/?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=${encodeURIComponent(
    '{"xmin":' +
      extent[0] +
      ',"ymin":' +
      extent[1] +
      ',"xmax":' +
      extent[2] +
      ',"ymax":' +
      extent[3] +
      ',"spatialReference":{"wkid":102100}}',
  )}&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*&outSR=102100&resultRecordCount=20`;
};

export const getLayerRegionsURL = (extent) => {
  return `https://air.discomap.eea.europa.eu/arcgis/rest/services/Air/IED_Clusters_WM/MapServer/0/query/?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=${encodeURIComponent(
    '{"xmin":' +
      extent[0] +
      ',"ymin":' +
      extent[1] +
      ',"xmax":' +
      extent[2] +
      ',"ymax":' +
      extent[3] +
      ',"spatialReference":{"wkid":102100}}',
  )}&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*&outSR=102100`;
};

export const getLayerBaseURL = () =>
  'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

export const getLocationExtent = (data) => {
  return axios.get(
    encodeURI(
      'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=' +
        data.text +
        '&f=json&outSR={"wkid":102100,"latestWkid":3857}&outFields=Match_addr,Addr_type,StAddr,City&magicKey=' +
        data.magicKey +
        '&maxLocations=6',
    ),
  );
};

export const getSiteExtent = (data) => {
  const db_version =
    process.env.RAZZLE_DB_VERSION || config.settings.db_version || 'latest';

  return axios.get(
    `${config.settings.providerUrl}?${getEncodedQueryString(`SELECT
    MIN(shape_wm.STX) AS MIN_X,
    MIN(shape_wm.STY) AS MIN_Y,
    MAX(shape_wm.STX) AS MAX_X,
    MAX(shape_wm.STY) AS MAX_Y
    FROM [IED].[${db_version}].[SiteMap]
    WHERE [siteName] COLLATE Latin1_General_CI_AI LIKE '%${cleanUpText(
      data.text,
    )}%'`)}`,
  );
};

export const getFacilityExtent = (data) => {
  const db_version =
    process.env.RAZZLE_DB_VERSION || config.settings.db_version || 'latest';

  return axios.get(
    `${config.settings.providerUrl}?${getEncodedQueryString(`SELECT
    MIN(shape_wm.STX) AS MIN_X,
    MIN(shape_wm.STY) AS MIN_Y,
    MAX(shape_wm.STX) AS MAX_X,
    MAX(shape_wm.STY) AS MAX_Y
    FROM [IED].[${db_version}].[SiteMap]
    WHERE [facilityNames] COLLATE Latin1_General_CI_AI LIKE '%${cleanUpText(
      data.text,
    )}%'`)}`,
  );
};

export const getCountriesExtent = (countries) => {
  const requests = [];
  countries.forEach((country) => {
    requests.push(
      axios.get(
        `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${country}&f=pjson&maxLocations=1`,
      ),
    );
  });
  return Promise.all(requests);
};

// https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=Romania&f=pjson&maxLocations=1

export const filterFeature = (feature, query = {}) => {
  let ok = true;
  const properties = feature.getProperties();

  for (let filter = 0; filter < filters.length; filter++) {
    const { queryKey, featureKey, op } = filters[filter];
    if (!ok) {
      break;
    }
    if (Array.isArray(query[queryKey])) {
      for (let item = 0; item < query[queryKey].length; item++) {
        const value = query[queryKey][item];
        if (
          value &&
          ((op === 'like' && !properties[featureKey]?.includes(value)) ||
            (op === 'eq' && properties[featureKey] !== value))
        ) {
          ok = false;
          break;
        }
      }
    } else if (query[queryKey]) {
      const value = query[queryKey];
      if (
        (op === 'like' && !properties[featureKey]?.includes(value)) ||
        (op === 'eq' && properties[featureKey] !== value)
      ) {
        ok = false;
        break;
      }
    }
  }

  return ok;
};

export const getWhereStatement = (data) => {
  const query = { ...data, nuts_latest: getLatestRegions(data).nuts_latest };
  const facility_types = query.filter_facility_types || [];
  const installation_types = query.filter_installation_types || [];
  const thematic_information = query.filter_thematic_information || [];
  const search = query.filter_search;
  let filter,
    where = [];
  for (filter = 0; filter < filters.length; filter++) {
    const { queryKey, featureKey, op } = filters[filter];
    where[filter] = [];
    if (Array.isArray(query[queryKey])) {
      for (let item = 0; item < query[queryKey].length; item++) {
        const value = query[queryKey][item];
        if (value && featureKey === 'pollutant_groups') {
          where[filter].push(
            `(air_groups LIKE '%${value}%') OR (water_groups LIKE '%${value}%')`,
          );
        } else if (op === 'like' && value) {
          where[filter].push(`${featureKey} LIKE '%${value}%'`);
        } else if (op === 'eq' && value) {
          where[filter].push(`${featureKey} = ${value}`);
        } else if (op === 'eqStr' && value) {
          where[filter].push(`${featureKey} = '${value}''`);
        }
      }
    }
  }

  if (facility_types?.filter((v) => v)?.length === 1) {
    const type = facility_types.includes('EPRTR') ? 'EPRTR' : 'NONEPRTR';
    where[filter++] = [
      `(facilityTypes LIKE '${type}%') OR (facilityTypes LIKE '% ${type}')`,
    ];
  }

  if (installation_types?.indexOf('IED') !== -1) {
    where[filter++] = ['count_instype_IED >= 1'];
  }

  if (installation_types?.indexOf('NONIED') !== -1) {
    where[filter++] = ['count_instype_NONIED >= 1'];
  }

  if (thematic_information?.indexOf('has_release') !== -1) {
    where[filter++] = ['has_release_data > 0'];
  }

  if (thematic_information?.indexOf('has_transfer') !== -1) {
    where[filter++] = ['has_transfer_data > 0'];
  }

  if (thematic_information?.indexOf('has_waste') !== -1) {
    where[filter++] = ['has_waste_data > 0'];
  }

  if (thematic_information?.indexOf('has_seveso') !== -1) {
    where[filter++] = ['has_seveso > 0'];
  }

  if (search?.type === 'site' && search?.text) {
    where[filter++] = [`siteName LIKE '${search.text}%'`];
  }

  if (search?.type === 'facility' && search?.text) {
    where[filter++] = [`facilityNames LIKE '%${search.text.trim()}%'`];
  }
  console.log(where);
  return where
    .filter((w) => w.length)
    .map((w) => `(${w.join(' OR ')})`)
    .join(' AND ');
};

export const getRegionsWhereStatement = (query = {}) => {
  let where = [];
  if (Array.isArray(query.siteCountry)) {
    for (let item = 0; item < query.siteCountry.length; item++) {
      const value = query.siteCountry[item];
      if (value) {
        where.push(`CNTR_CODE LIKE '%${value}%'`);
      }
    }
  }
  return where.join(' AND ');
};

const applyIndustryMapBlockConfig = (config) => {
  config.blocks.blocksConfig.industry_map = {
    id: 'industry_map',
    title: 'Industry map',
    icon: sliderSVG,
    group: 'eprtr_blocks',
    edit: IndustryMapEdit,
    view: IndustryMapView,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };
  return config;
};

export const mercatorToLatLon = (x, y) => {
  const R = 6378137.0; // Radius of Earth in meters
  const lng = (x / R) * (180 / Math.PI);
  const lat = (2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) * (180 / Math.PI);
  return { lat, lng };
};

export default applyIndustryMapBlockConfig;
