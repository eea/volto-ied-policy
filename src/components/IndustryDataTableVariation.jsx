import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Icon, UniversalLink } from '@plone/volto/components';
import { Table, Menu, Loader } from 'semantic-ui-react';
import cx from 'classnames';
import { setQuery } from '@eeacms/volto-ied-policy/actions';

import leftSVG from '@plone/volto/icons/left-key.svg';
import rightSVG from '@plone/volto/icons/right-key.svg';
import upSVG from '@plone/volto/icons/up-key.svg';
import downSVG from '@plone/volto/icons/down-key.svg';

const IndustryDataTable = (props) => {
  const table = React.useRef();
  const [openedRow, setOpenedRow] = React.useState(null);
  const {
    data = {},
    pagination,
    updatePagination = () => {},
    loadingProviderData,
    rows,
  } = props;
  const withPagination = data.withPagination;

  const tableData = {};

  rows.forEach(obj => {
    for (const [key, value] of Object.entries(obj)) {
      if (!tableData[key]) {
        tableData[key] = [];
      }
      tableData[key].push(value);
    }
  });
  const row_size = data.itemsPerPage;

  return (
    <div ref={table} className="industry-table">
      {row_size && tableData ? (
        <Table
          textAlign="left"
          striped={data.striped}
          className={`unstackable ${data.bordered ? 'no-borders' : ''}
          ${data.compact_table ? 'compact-table' : ''}`}
        >
          <Table.Header>
            <Table.Row>
              {data.columnDefs.map((colDef, j) => (
                <Table.HeaderCell key={colDef.field} className={'left aligned'}>
                  {colDef.headerName}
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
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
                      {data.columnDefs.map((colDef, j) => (
                        <Table.Cell
                          key={`${i}-${colDef.field}`}
                          textAlign={'left'}
                        >
                          {tableData[colDef.field]?.[i]}
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
                      <Table.Cell colSpan={data.columnDefs.length + 1}>
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
          {withPagination ? (
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell
                  colSpan={data.columnDefs.length + 1}
                  style={{ textAlign: 'center' }}
                >
                  <Menu pagination>
                    <Menu.Item
                      as="a"
                      icon
                      disabled={
                        loadingProviderData || pagination.activePage === 1
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
                        if (rows.length === pagination.itemsPerPage) {
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
          <Table.Body>
            <Table.Row>
              <Table.Cell colSpan={data?.columns?.length || 1}>
                <p>Placeholder</p>
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
)(IndustryDataTable);
