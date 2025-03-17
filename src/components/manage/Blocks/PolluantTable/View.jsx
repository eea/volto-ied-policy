import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Icon, UniversalLink } from '@plone/volto/components';
import { Table, Menu, Loader } from 'semantic-ui-react';
import cx from 'classnames';
import RenderComponent from '@eeacms/volto-datablocks/components/manage/Blocks/SimpleDataTable/components';
import { ConnectorContext } from '@eeacms/volto-datablocks/hocs';
import { setQuery } from '@eeacms/volto-industry-theme/actions';
import { cleanUpText } from '@eeacms/volto-industry-theme/helpers';

import leftSVG from '@plone/volto/icons/left-key.svg';
import rightSVG from '@plone/volto/icons/right-key.svg';
import upSVG from '@plone/volto/icons/up-key.svg';
import downSVG from '@plone/volto/icons/down-key.svg';

import './styles.less';

const isNotEmpty = (item) => {
  if (!item) return false;
  if (Array.isArray(item) && item.filter((i) => i).length === 0) return false;
  if (item === undefined || item === null) return false;
  if (typeof item === 'object' && Object.keys(item).length === 0) return false;
  return true;
};

const getFacilityTypes = (facilityTypes = []) => {
  if (facilityTypes.length === 2 || !facilityTypes.length) return '';
  const type = facilityTypes.includes('EPRTR') ? 'EPRTR' : 'NONEPRTR';
  return [
    {
      or: [
        { like: ['facilityTypes', { literal: `${type}%` }] },
        { like: ['facilityTypes', { literal: `% ${type}` }] },
      ],
    },
  ];
};

const getInstallationTypes = (installationTypes = []) => {
  return [
    {
      and: [
        ...(installationTypes.indexOf('IED') !== -1
          ? [{ gte: ['count_instype_IED', 1] }]
          : []),
        ...(installationTypes.indexOf('NONIED') !== -1
          ? [{ gte: ['count_instype_NONIED', 1] }]
          : []),
      ],
    },
  ];
};

const getThematicInformation = (thematicInformation = []) => {
  return [
    {
      and: [
        ...(thematicInformation.indexOf('has_release') !== -1
          ? [{ gt: ['has_release_data', 0] }]
          : []),
        ...(thematicInformation.indexOf('has_transfer') !== -1
          ? [{ gt: ['has_transfer_data', 0] }]
          : []),
        ...(thematicInformation.indexOf('has_waste') !== -1
          ? [{ gt: ['has_waste_data', 0] }]
          : []),
        ...(thematicInformation.indexOf('has_seveso') !== -1
          ? [{ gt: ['has_seveso', 0] }]
          : []),
      ],
    },
  ];
};

const getPollutantGroups = (pollutantGroups = []) => {
  if (pollutantGroups.length === 1) {
    return [
      {
        or: [
          { like: ['air_groups', { literal: pollutantGroups[0] }] },
          { like: ['water_groups', { literal: pollutantGroups[0] }] },
        ],
      },
    ];
  }
  return [
    {
      or: [
        {
          and: pollutantGroups.map((group) => ({
            like: ['air_groups', { literal: group }],
          })),
        },
        {
          and: pollutantGroups.map((group) => ({
            like: ['water_groups', { literal: group }],
          })),
        },
      ],
    },
  ];
};

const getQuery = (query) => {
  const obj = {
    ...(isNotEmpty(query.filter_industries)
      ? {
          'eprtr_sectors[in]': query.filter_industries,
        }
      : {}),
    ...(isNotEmpty(query.filter_eprtr_AnnexIActivity)
      ? {
          'eprtr_AnnexIActivity[in]': query.filter_eprtr_AnnexIActivity,
        }
      : {}),
    ...(isNotEmpty(query.filter_pollutants)
      ? {
          'pollutants[like]': query.filter_pollutants.map(
            (filter) => `%${filter}%`,
          ),
        }
      : {}),
    ...(isNotEmpty(query.filter_permit_years)
      ? {
          'permit_years[like]': query.filter_permit_years.map(
            (filter) => `%${filter}%`,
          ),
        }
      : {}),
    ...(isNotEmpty(query.filter_permit_types)
      ? {
          'permit_types[like]': query.filter_permit_types.map(
            (filter) => `%${filter}%`,
          ),
        }
      : {}),
    ...(isNotEmpty(query.filter_bat_conclusions)
      ? {
          'bat_conclusions[like]': query.filter_bat_conclusions.map(
            (filter) => `%${filter}%`,
          ),
        }
      : {}),
    ...(isNotEmpty(query.filter_reporting_years)
      ? { 'Site_reporting_year[in]': query.filter_reporting_years }
      : {}),
    // ...(isNotEmpty(query.nuts_latest)
    //   ? { 'nuts_regions[like]': query.nuts_latest }
    //   : {}),
    ...(isNotEmpty(query.filter_countries)
      ? { 'countryCode[in]': query.filter_countries }
      : {}),
  };
  return obj;
};

const getConditions = (query) => {
  return [
    ...(isNotEmpty(query.filter_facility_types)
      ? getFacilityTypes(query.filter_facility_types)
      : []),
    ...(isNotEmpty(query.filter_installation_types)
      ? getInstallationTypes(query.filter_installation_types)
      : []),
    ...(isNotEmpty(query.filter_thematic_information)
      ? getThematicInformation(query.filter_thematic_information)
      : []),
    ...(isNotEmpty(query.filter_pollutant_groups)
      ? getPollutantGroups(
          query.filter_pollutant_groups.map((filter) => `%${filter}%`),
        )
      : []),
    ...(query.filter_search?.text && query.filter_change?.type === 'search-site'
      ? [
          {
            like: [
              'siteName',
              { literal: cleanUpText(query.filter_search.text) },
            ],
          },
        ]
      : []),
    ...(query.filter_search?.text &&
    query.filter_change?.type === 'search-facility'
      ? [
          {
            like: [
              'facilityNames',
              { literal: cleanUpText(query.filter_search.text) },
            ],
          },
        ]
      : []),
  ];
};

const View = (props) => {
  const table = React.useRef();
  const context = React.useContext(ConnectorContext);
  const [openedRow, setOpenedRow] = React.useState(null);
  const {
    data = {},
    getAlignmentOfColumn,
    getNameOfColumn,
    getTitleOfColumn,
    has_pagination,
    pagination = {},
    placeholder,
    row_size,
    selectedColumns,
    show_header,
    tableData,
    query = {},
    updatePagination = () => {},
  } = props;

  React.useEffect(() => {
    const extent = query.map_extent || [
      -10686671.0000035, -2430148.00000588, 6199975.99999531, 10421410.9999871,
    ];

    context.setState({
      ...context.state,
      extraQuery: {
        ...getQuery(query || {}),
        'shape_wm.STX[gte]': extent[0],
        'shape_wm.STX[lte]': extent[2],
        'shape_wm.STY[gte]': extent[1],
        'shape_wm.STY[lte]': extent[3],
      },
      extraConditions: getConditions(query),
    });
    /* eslint-disable-next-line */
  }, [JSON.stringify(query)]);

  return (
    <div ref={table} className="industry-table">
      {row_size && tableData ? (
        <Table
          textAlign="left"
          striped={data.striped}
          className={`unstackable ${data.bordered ? 'no-borders' : ''}
          ${data.compact_table ? 'compact-table' : ''}`}
        >
          {show_header ? (
            <Table.Header>
              <Table.Row>
                {selectedColumns.map((colDef, j) => (
                  <Table.HeaderCell
                    key={getNameOfColumn(colDef)}
                    className={getAlignmentOfColumn(colDef, j)}
                  >
                    {getTitleOfColumn(colDef)}
                  </Table.HeaderCell>
                ))}
              </Table.Row>
            </Table.Header>
          ) : null}
          <Table.Body>
            {Array(Math.max(0, row_size))
              .fill()
              .map((_, i) => {
                const countFactypeEprtr =
                  tableData?.['count_factype_EPRTR']?.[i];
                const countFactypeNonEprtr =
                  tableData?.['count_factype_NONEPRTR']?.[i];
                const countInstypeIed = tableData?.['count_instype_IED']?.[i];
                const countInstypeNonIed =
                  tableData?.['count_instype_NONIED']?.[i];
                const countPlantypeLcp =
                  tableData?.['count_plantType_LCP']?.[i];
                const countPlantypeCoWi =
                  tableData?.['count_plantType_coWI']?.[i];
                const countPlantypeWi = tableData?.['count_plantType_WI']?.[i];
                return (
                  <React.Fragment key={`row-${i}`}>
                    <Table.Row>
                      {selectedColumns.map((colDef, j) => (
                        <Table.Cell
                          key={`${i}-${getNameOfColumn(colDef)}`}
                          textAlign={getAlignmentOfColumn(colDef, j)}
                        >
                          <RenderComponent
                            tableData={tableData}
                            colDef={colDef}
                            row={i}
                            {...props}
                          />
                        </Table.Cell>
                      ))}
                      <Table.Cell>
                        <button
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setOpenedRow(openedRow === i ? null : i);
                          }}
                        >
                          <Icon
                            name={openedRow === i ? upSVG : downSVG}
                            size="3em"
                          />
                        </button>
                      </Table.Cell>
                    </Table.Row>
                    {/* ==== TABLE HIDDEN ROW ==== */}
                    <Table.Row
                      className={cx('hidden-row', {
                        show: openedRow === i,
                        hide: openedRow !== i,
                      })}
                    >
                      <Table.Cell colSpan={selectedColumns.length + 1}>
                        <div className="hidden-row-container outline-button">
                          <div className="table-flex-container white">
                            <div>
                              <span className="header">Regulation</span>
                              <div className="flex column">
                                {countFactypeEprtr ? (
                                  <p className="mb-0">
                                    {`${countFactypeEprtr} ${
                                      countFactypeEprtr === 1
                                        ? 'EPRTR Facility'
                                        : 'EPRTR Facilities'
                                    }`}
                                  </p>
                                ) : (
                                  ''
                                )}

                                {countFactypeNonEprtr ? (
                                  <p className="mb-0">
                                    {`${countFactypeNonEprtr} ${
                                      countFactypeNonEprtr === 1
                                        ? 'NON-EPRTR Facility'
                                        : 'NON-EPRTR Facilities'
                                    }`}
                                  </p>
                                ) : (
                                  ''
                                )}

                                {countInstypeIed ? (
                                  <p className="mb-0">
                                    {`${countInstypeIed} ${
                                      countInstypeIed === 1
                                        ? 'IED Installation'
                                        : 'IED Installations'
                                    }`}
                                  </p>
                                ) : (
                                  ''
                                )}

                                {countInstypeNonIed ? (
                                  <p className="mb-0">
                                    {`${countInstypeNonIed} ${
                                      countInstypeNonIed === 1
                                        ? 'NON-IED Installation'
                                        : 'NON-IED Installations'
                                    }`}
                                  </p>
                                ) : (
                                  ''
                                )}

                                {countPlantypeLcp ? (
                                  <p className="mb-0">
                                    {`${countPlantypeLcp} ${
                                      countPlantypeLcp === 1
                                        ? 'Large combustion plant'
                                        : 'Large combustion plants'
                                    }`}
                                  </p>
                                ) : (
                                  ''
                                )}

                                {countPlantypeWi ? (
                                  <p className="mb-0">
                                    {`${countPlantypeWi} ${
                                      countPlantypeWi === 1
                                        ? 'Waste incinerator'
                                        : 'Waste incinerators'
                                    }`}
                                  </p>
                                ) : (
                                  ''
                                )}

                                {countPlantypeCoWi ? (
                                  <p className="mb-0">
                                    {`${countPlantypeCoWi} ${
                                      countPlantypeCoWi === 1
                                        ? 'Co-waste incinerator'
                                        : 'Co-waste incinerators'
                                    }`}
                                  </p>
                                ) : (
                                  ''
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="header">
                                Pollutant emissions
                              </span>
                              <div className="flex column">
                                <p className="mb-0">
                                  {tableData?.['pollutants']?.[i] ||
                                    'Not reported'}
                                </p>
                              </div>
                            </div>
                            <div>
                              <span className="header">
                                Regulatory Informations
                              </span>
                              <div className="flex column">
                                <p className="mb-0">
                                  Operating since:{' '}
                                  {tableData?.['dateOfLatestOpStart']?.[i] ||
                                    'not reported'}
                                </p>
                                <p className="mb-0">
                                  Last operating permit issued:{' '}
                                  {tableData?.['dateOfLatestPermit']?.[i] ||
                                    'not reported'}
                                </p>
                                <p className="mb-0">
                                  Number of inspections:{' '}
                                  {tableData?.['numInspections']?.[i] ||
                                    'not reported'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="table-flex-container action">
                            <div>
                              <div className="flex column">
                                <div className="flex align-center flex-grow">
                                  <UniversalLink
                                    className="solid red"
                                    href={`${data.link || '/'}?siteInspireId=${
                                      tableData?.['Site Inspire ID']?.[i]
                                    }&siteName=${
                                      tableData?.['siteName']?.[i]
                                    }&siteReportingYear=${
                                      tableData?.['Site_reporting_year']?.[i]
                                    }`}
                                  >
                                    Site details
                                  </UniversalLink>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  </React.Fragment>
                );
              })}
          </Table.Body>
          {has_pagination ? (
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell
                  colSpan={selectedColumns.length + 1}
                  style={{ textAlign: 'center' }}
                >
                  <Menu pagination>
                    <Menu.Item
                      as="a"
                      icon
                      disabled={
                        props.loadingProviderData || pagination.activePage === 1
                      }
                      onClick={() => {
                        if (pagination.activePage > 1) {
                          updatePagination({
                            activePage: pagination.activePage - 1,
                          });
                        }
                      }}
                    >
                      <Icon name={leftSVG} size="24px" />
                    </Menu.Item>
                    <Menu.Item fitted>
                      <Loader
                        disabled={!props.loadingProviderData}
                        active
                        inline
                        size="tiny"
                      />
                    </Menu.Item>
                    <Menu.Item
                      as="a"
                      icon
                      disabled={
                        props.loadingProviderData ||
                        pagination.activePage === pagination.lastPage
                      }
                      onClick={() => {
                        if (row_size === pagination.itemsPerPage) {
                          updatePagination({
                            activePage: pagination.activePage + 1,
                          });
                        }
                      }}
                    >
                      <Icon name={rightSVG} size="24px" />
                    </Menu.Item>
                  </Menu>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          ) : null}
        </Table>
      ) : tableData ? (
        // TODO: find a better solution to keep headers
        <Table
          textAlign="left"
          striped={data.striped}
          className={`unstackable ${data.bordered ? 'no-borders' : ''}
        ${data.compact_table ? 'compact-table' : ''}`}
        >
          {show_header ? (
            <Table.Header>
              <Table.Row>
                {data?.columns?.map((header) => (
                  <Table.HeaderCell
                    key={header.column}
                    className={header.textAlign || 'left'}
                  >
                    {header.title}
                  </Table.HeaderCell>
                ))}
              </Table.Row>
            </Table.Header>
          ) : null}
          <Table.Body>
            <Table.Row>
              <Table.Cell colSpan={data?.columns?.length || 1}>
                <p>{placeholder}</p>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      ) : (
        <Loader active inline="centered">
          European Environment Agency
        </Loader>
      )}
    </div>
  );
};

export default compose(
  connect(
    (state) => ({
      query: state.query.search,
    }),
    { setQuery },
  ),
)(View);
