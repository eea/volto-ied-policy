import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Tab, Dropdown, Table } from 'semantic-ui-react';
import cx from 'classnames';
import qs from 'querystring';
import { connectToMultipleProvidersUnfiltered } from '@eeacms/volto-datablocks/hocs';
import { setQuery, deleteQuery } from '@eeacms/volto-ied-policy/actions';
import { getObjectByIndex } from '@eeacms/volto-ied-policy/helpers';
import './styles.less';

const RenderTable = (props) => {
  const { headless = false, headers = [], rows = [] } = props;

  return (
    <Table
      unstackable
      celled={props.celled}
      className={cx(props.className, headless ? 'headless' : '')}
      columns={headers.length}
    >
      {!headless && headers.length > 0 && (
        <Table.Header>
          <Table.Row>
            {headers.map((header, headerIndex) => (
              <Table.HeaderCell key={`${headerIndex}_header`}>
                {header.value}
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
      )}
      <Table.Body>
        {rows.length > 0 &&
          headers.length > 0 &&
          rows.map((row, rowIndex) => (
            <Table.Row key={`${rowIndex}_row`}>
              {headers.map((header, headerIndex) => (
                <Table.Cell key={`${headerIndex}_cell`}>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: row[header.key],
                    }}
                  />
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
      </Table.Body>
    </Table>
  );
};

const panes = [
  {
    menuItem: 'General infromation',
    render: ({ data }) => {
      const { pollutant = {} } = data;
      const hasData = Object.keys(pollutant).length > 0;

      const molecular_formula_sub = pollutant?.molecular_formula_sub
        ?.split('|')
        .map((sub) => sub.replace(/['"]+/g, ''));
      const molecular_formula = pollutant?.molecular_formula
        ?.replace(/['"]+/g, '')
        .split('\n')
        .map(
          (element, index) =>
            element +
            (molecular_formula_sub?.[index]
              ? `<sub>${molecular_formula_sub[index]}</sub>`
              : ''),
        )
        .join('');

      const health_affects_sub = pollutant.health_affects_sub
        ?.split('|')
        ?.map((sub) => sub.replace(/['"]+/g, ''));
      const health_affects =
        pollutant.health_affects
          ?.split('|')
          ?.map((item, index) =>
            health_affects_sub?.[index]
              ? item
                  .replace(/['"]+/g, '')
                  .replace('\n', `<sub>${health_affects_sub[index]}</sub>`)
              : item.replace(/['"]+/g, ''),
          ) || [];

      if (!hasData) {
        return <Tab.Pane></Tab.Pane>;
      }

      return (
        <Tab.Pane>
          <RenderTable
            className="description-table"
            celled={false}
            headless={true}
            headers={[
              { key: 'label', value: 'Label' },
              { key: 'value', value: 'Value' },
            ]}
            rows={[
              {
                label: 'E-PRTR Pollutant No',
                value: pollutant.pollutantId || '-',
              },
              { label: 'IUPAC Name', value: pollutant.IUPAC_Name || '-' },
              { label: 'CAS Number', value: pollutant.cas_no || '-' },
              // { label: 'EC Number	', value: pollutant.ec_no || '-' },
              // { label: 'SMILES tooltip', value: pollutant.smiles_code || '-' },
              // { label: 'Chemspider id', value: pollutant.chemspider_id || '-' },
              { label: 'Formula', value: molecular_formula || '-' },
              // {
              //   label: 'Classification',
              //   value: classification || '-',
              // },
            ]}
          />
          {pollutant.description ? (
            <>
              <h3>Description</h3>
              <p>{pollutant.description}</p>
            </>
          ) : (
            ''
          )}
          {pollutant.main_uses ? (
            <>
              <h3>Main Uses</h3>
              <p>{pollutant.main_uses}</p>
            </>
          ) : (
            ''
          )}
          {pollutant.main_uses ? (
            <>
              {' '}
              <h3>Where do the releases originate?</h3>
              <p
                dangerouslySetInnerHTML={{
                  __html: pollutant.main_methods_of_release,
                }}
              />
            </>
          ) : (
            ''
          )}
          {health_affects?.length ? (
            <>
              <h3>How do the releases affect you and your environment?</h3>
              {health_affects.map((item, index) => (
                <p
                  key={`health_affects_${index}`}
                  dangerouslySetInnerHTML={{
                    __html: item,
                  }}
                />
              ))}
            </>
          ) : (
            ''
          )}
        </Tab.Pane>
      );
    },
  },
  {
    menuItem: 'Pollutant thresholds',
    render: ({ data }) => {
      const { pollutant = {} } = data;
      const hasData = Object.keys(pollutant).length > 0;

      if (!hasData) {
        return <Tab.Pane></Tab.Pane>;
      }

      return (
        <Tab.Pane>
          <h3>Provisions under E-PRTR Regulation</h3>
          <p className="bold">Threshold for releases</p>
          <RenderTable
            celled={false}
            headless={false}
            headers={[
              { key: 'prtr_provision_air', value: 'to air kg/year' },
              { key: 'prtr_provision_water', value: 'to water kg/year' },
              { key: 'prtr_provision_land', value: 'to land kg/year' },
            ]}
            rows={[
              {
                prtr_provision_air: pollutant.prtr_provision_air || '',
                prtr_provision_water: pollutant.prtr_provision_water || '',
                prtr_provision_land: pollutant.prtr_provision_land || '',
              },
            ]}
          />
          <p>
            * - indicates that the parameter and medium in question do not
            trigger a reporting requirement.
          </p>
        </Tab.Pane>
      );
    },
  },
];

const View = ({ providers_data, query, setQuery, ...props }) => {
  const id = query?.index_pollutant_id || -1;
  console.log({ query });

  console.log(props.data.providers, providers_data);
  React.useEffect(() => {
    if (!query?.index_pollutant_id) {
      console.log('uu', { index_pollutant_id: 70 });
      setQuery({ index_pollutant_id: 70 });
    }
  }, []);

  const index_data = React.useMemo(() => {
    if (id < 0) return {};
    const {
      index_pollutants,
      index_pollutant_groups,
      index_pollutant_iso,
      index_pollutant_other_provisions,
      index_pollutant_phrases,
    } = providers_data || {};
    const pollutant = getObjectByIndex(
      index_pollutants,
      index_pollutants?.pollutantId?.indexOf(id),
    );
    const pollutantGroup = getObjectByIndex(
      index_pollutant_groups,
      index_pollutant_groups?.pollutant_group_id?.indexOf(pollutant.parentId),
    );
    const pollutantIso = getObjectByIndex(
      index_pollutant_iso,
      index_pollutant_iso?.pollutantId?.indexOf(pollutant.pollutantId),
    );
    const pollutantOtherProvisions = [];
    const pollutantPhrases = {
      clp_phrases: [],
      ghs_phrases: [],
      r_phrases: [],
      s_phrases: [],
    };

    const provisions_ids =
      pollutant.other_provisions
        ?.split('|')
        ?.map((item) => Number.parseInt(item.replace(/['"]+/g, ''))) || [];

    provisions_ids.forEach((id) => {
      const provision = getObjectByIndex(
        index_pollutant_other_provisions,
        index_pollutant_other_provisions?.other_provision_id?.indexOf(id),
      );
      if (Object.keys(provision).length) {
        pollutantOtherProvisions.push(provision);
      }
    });

    Object.keys(pollutantPhrases)
      .filter((key) => pollutant[key] && pollutant[key] !== 'NoData')
      .forEach((key) => {
        pollutant[key].split('|').forEach((item) => {
          const id = item.replace(/['"]+/g, '');
          const phrase = getObjectByIndex(
            index_pollutant_phrases,
            index_pollutant_phrases?.phrase_id?.indexOf(id),
          );
          if (Object.keys(phrase).length) {
            pollutantPhrases[key].push(phrase);
          }
        });
      });

    return {
      pollutant,
      pollutantGroup,
      pollutantIso,
      pollutantOtherProvisions,
      pollutantPhrases,
    };
  }, [id, providers_data]);

  console.log(index_data);
  const pollutantsOptions = React.useMemo(() => {
    const { index_pollutants } = providers_data;
    return (
      index_pollutants?.pollutantId
        ?.map((_, index) => ({
          key: index_pollutants.code[index],
          value: index_pollutants.pollutantId[index],
          text: index_pollutants.name[index],
        }))
        ?.filter((opt) => opt.value !== null) || []
    );
  }, [providers_data]);

  return (
    <div className="index-pollutants">
      <Dropdown
        fluid
        search
        selection
        onChange={(event, data) => {
          setQuery({ index_pollutant_id: data.value });
        }}
        placeholder={'Select pollutant'}
        options={pollutantsOptions}
        value={id}
      />

      <Tab
        menu={{ attached: false, tabular: false }}
        panes={panes}
        data={index_data}
      />
    </div>
  );
};

export default compose(
  connect(
    (state) => ({
      query: {
        ...(qs.parse(state.router.location?.search?.replace('?', '')) || {}),
        ...(state?.query?.search || {}),
      },
    }),
    {
      setQuery,
      deleteQuery,
    },
  ),
  connectToMultipleProvidersUnfiltered((props) => ({
    providers: props.data.providers,
  })),
)(View);
