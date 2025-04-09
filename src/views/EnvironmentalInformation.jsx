import React, { useEffect, useState } from 'react';
import { compose } from 'redux';
import { connect, useSelector } from 'react-redux';
import { Grid, Dropdown } from 'semantic-ui-react';

import { connectToMultipleProviders } from '@eeacms/volto-datablocks/hocs';
import RenderBlocks from '@plone/volto/components/theme/View/RenderBlocks.jsx';
import qs from 'querystring';
import './style.css';
import { setQuery } from '@eeacms/volto-ied-policy/actions';
import { useDispatch } from 'react-redux';

const mapBlock = {
  blocks: {
    'dd8d70fd-7544-4906-bc09-2c6db106c9ec': {
      '@type': 'industry_map',

      filters: {},
      hideFilters: true,

      providers: [
        {
          '@id': '46e7955d-47a4-4610-a7c8-13fd267f991f',
          name: 'countries',
          url: 'https://demo-industry.01dev.eea.europa.eu/data-connectors/countries',
        },
        {
          '@id': '8fde6db8-a9cc-4d97-b142-add4988fb87e',
          name: 'reporting_years',
          url: 'https://demo-industry.01dev.eea.europa.eu/data-connectors/reporting-years',
        },
        {
          '@id': '3225aca5-878e-4539-844b-33a515131f63',
          name: 'industries',
          url: 'https://demo-industry.01dev.eea.europa.eu/data-connectors/industries',
        },
        {
          '@id': '964e2886-7f0b-448d-b00b-cfaf77cdfc3b',
          name: 'eprtr_AnnexIActivity',
          url: '/data-connectors/eprtr_AnnexIActivity',
        },
        {
          '@id': '664d383e-b1a9-43ad-a0dd-821811fef07e',
          name: 'nuts_1',
          url: 'https://demo-industry.01dev.eea.europa.eu/data-connectors/nuts-code-1',
        },
        {
          '@id': '430cbcc9-fa39-4545-9d90-41a84809be05',
          name: 'nuts_2',
          url: 'https://demo-industry.01dev.eea.europa.eu/data-connectors/nuts-code-2',
        },
        {
          '@id': '5421fe8d-da4a-4388-b6f1-cd642ff90222',
          name: 'river_basin_districts',
          url: 'https://demo-industry.01dev.eea.europa.eu/data-connectors/river-basin-districts',
        },
        {
          '@id': '3df622a7-a65d-4a14-a83a-476445d2806e',
          name: 'pollutants_group',
          url: 'https://demo-industry.01dev.eea.europa.eu/data-connectors/pollutants-group',
        },
        {
          '@id': '4b09c86e-7db4-4907-b667-f8b3949e2f2b',
          name: 'Pollutants',
          url: 'https://demo-industry.01dev.eea.europa.eu/data-connectors/pollutants',
        },
        {
          '@id': 'fc8c2466-9697-425a-917a-752d227b2b9a',
          name: 'bat-conclusion',
          url: 'https://demo-industry.01dev.eea.europa.eu/data-connectors/bat-conclusion',
        },
        {
          '@id': '4fe44735-50ce-4986-a4a4-871362d0934d',
          name: 'permit_years',
          url: 'https://demo-industry.01dev.eea.europa.eu/data-connectors/permit-years',
        },
        {
          '@id': '5c38ac7e-7490-4d77-92d9-0595be3689b1',
          name: 'plant-types',
          url: 'https://demo-industry.01dev.eea.europa.eu/data-connectors/plant-types',
        },
      ],
    },
  },
  blocks_layout: { items: ['dd8d70fd-7544-4906-bc09-2c6db106c9ec'] },
};

const getQueryString = (query) => {
  if (!Object.keys(query).length) return '';
  return '?' + qs.stringify(query);
};

const getSiteByYear = (provider_data, year) => {
  const index = provider_data?.euregReportingYear?.indexOf(year);

  const keys = Object.keys(provider_data || {});

  const site = {};
  if (keys?.length) {
    keys.forEach((key) => {
      site[key] = provider_data[key][index];
    });
  }

  return site;
};

function HeaderInformation(props) {
  const [siteHeader, setSiteHeader] = React.useState({});
  const dispatch = useDispatch();

  const provider_data = React.useMemo(
    () => props.providers_data?.siteHeader || {},
    [props.providers_data],
  );

  const siteReportingYear = useSelector(
    (state) => state.query.search.siteReportingYear,
  );

  const reportingYears = React.useMemo(() => {
    return provider_data?.euregReportingYear?.length
      ? provider_data.euregReportingYear
          .filter((year) => year)
          .sort((a, b) => b - a)
          .map((year) => ({
            key: year,
            value: year,
            text: year,
          }))
      : [];
    /* eslint-disable-next-line */
  }, [provider_data]);

  useEffect(
    () => {
      const query = new URLSearchParams(props?.location?.search || '');

      if (query.get('siteReportingYear') || query.get('siteName')) {
        dispatch(
          setQuery({
            siteName: query.get('siteName'),
            siteReportingYear: parseInt(query.get('siteReportingYear')),
          }),
        );

        props.history.push({
          pathname: props.location.pathname,
          search: getQueryString({
            siteInspireId: query.get('siteInspireId'),
          }),
          state: {
            ignoreScrollBehavior: true,
          },
        });
      }
    },
    { props },
  );

  React.useEffect(() => {
    setSiteHeader(getSiteByYear(provider_data, siteReportingYear));
    /* eslint-disable-next-line */
  }, [provider_data, siteReportingYear]);

  return props.mode === 'edit' ? (
    <p>Site header</p>
  ) : Object.keys(siteHeader)?.length ? (
    <div className="site-header">
      <div>
        {/* <UniversalLink className="back-button" href={'/'}>
            BACK
          </UniversalLink> */}
        <div style={{ flex: 1 }}>
          <h3 className="title">{siteHeader.siteName}</h3>
          <Grid columns={12}>
            <Grid.Row>
              <Grid.Column mobile={6} tablet={3} computer={3}>
                <p className="label">Country</p>
                <p className="info">{siteHeader.countryCode || 'test'}</p>
              </Grid.Column>
              <Grid.Column mobile={6} tablet={3} computer={3}>
                <p className="label">Regulation</p>
                {siteHeader.count_factype_EPRTR ? (
                  <p className="info">
                    {siteHeader.count_factype_EPRTR} EPRTR{' '}
                    {siteHeader.count_factype_EPRTR > 1
                      ? 'Facilities'
                      : 'Facility'}
                  </p>
                ) : (
                  ''
                )}
                {siteHeader.count_factype_NONEPRTR ? (
                  <p className="info">
                    {siteHeader.count_factype_NONEPRTR} NON-EPRTR{' '}
                    {siteHeader.count_factype_NONEPRTR > 1
                      ? 'Facilities'
                      : 'Facility'}
                  </p>
                ) : (
                  ''
                )}
                {siteHeader.count_instype_IED ? (
                  <p className="info">
                    {siteHeader.count_instype_IED} IED Installation
                    {siteHeader.count_instype_IED > 1 ? 's' : ''}
                  </p>
                ) : (
                  ''
                )}
                {siteHeader.count_instype_NONIED ? (
                  <p className="info">
                    {siteHeader.count_instype_NONIED} NON-IED Installation
                    {siteHeader.count_instype_NONIED > 1 ? 's' : ''}
                  </p>
                ) : (
                  ''
                )}
                {siteHeader.count_plantType_LCP ? (
                  <p className="info">
                    {siteHeader.count_plantType_LCP} Large combustion plant
                    {siteHeader.count_plantType_LCP > 1 ? 's' : ''}
                  </p>
                ) : (
                  ''
                )}
                {siteHeader.count_plantType_WI ? (
                  <p className="info">
                    {siteHeader.count_plantType_WI} Waste incinerator
                    {siteHeader.count_plantType_WI > 1 ? 's' : ''}
                  </p>
                ) : (
                  ''
                )}
                {siteHeader.count_plantType_coWI ? (
                  <p className="info">
                    {siteHeader.count_plantType_coWI} Co-waste incinerator
                    {siteHeader.count_plantType_coWI > 1 ? 's' : ''}
                  </p>
                ) : (
                  ''
                )}
              </Grid.Column>
              <Grid.Column mobile={6} tablet={3} computer={3}>
                <p className="label">Inspire id</p>
                <p className="info">{siteHeader.siteInspireId}</p>
              </Grid.Column>
              <Grid.Column mobile={6} tablet={3} computer={3}>
                <p className="label">Reporting year</p>
                <div>
                  <Dropdown
                    fluid
                    selection
                    onChange={(event, data) => {
                      const newSite = getSiteByYear(provider_data, data.value);
                      const newQuery = { ...props.query };
                      newQuery.siteInspireId = newSite.siteInspireId;

                      dispatch(setQuery({ ...newSite }));

                      props.history.push({
                        pathname: props.location.pathname,
                        search: getQueryString(newQuery),
                        state: {
                          ignoreScrollBehavior: true,
                        },
                      });
                    }}
                    placeholder={'Select'}
                    options={reportingYears}
                    value={siteReportingYear}
                    aria-label="Reporting year selector"
                  />
                </div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      </div>
    </div>
  ) : (
    ''
  );
}

function EnvironmentalInformation(props) {
  return (
    <div className="environmental-information">
      <HeaderInformation {...props} />
      <div className="map-render site-location-map">
        <RenderBlocks
          {...props}
          content={{
            ...(props.content || {}),
            ...mapBlock,
          }}
        />
      </div>
    </div>
  );
}

export default compose(
  connect(
    (state) => ({
      query: {
        ...qs.parse(state.router.location.search.replace('?', '')),
      },
    }),
    { setQuery },
  ),
  connectToMultipleProviders((props) => ({
    providers: [
      {
        '@id': 'header_information',
        url: props?.content?.header_information_provider,
        name: 'siteHeader',
      },
    ],
  })),
)(EnvironmentalInformation);
