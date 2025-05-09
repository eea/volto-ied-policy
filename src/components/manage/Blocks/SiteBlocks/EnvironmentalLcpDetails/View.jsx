import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Grid } from 'semantic-ui-react';
import qs from 'querystring';
import '../style.css';

const View = (props) => {
  const [lcp, setLcp] = React.useState({});
  const provider_data = React.useMemo(
    () => props.provider_data || {},
    [props.provider_data],
  );
  const query = { ...props.query };
  const { lcpInspireId = null } = query;
  const siteReportingYear = parseInt(query.siteReportingYear || '');
  const index = provider_data?.euregReportingYear?.indexOf(siteReportingYear);

  React.useEffect(() => {
    const keys = Object.keys(provider_data || {});
    if (keys?.length) {
      const newLcp = {};
      keys.forEach((key) => {
        newLcp[key] = provider_data[key][index];
      });
      setLcp(newLcp);
    }
  }, [index, provider_data, lcpInspireId]);

  return props.mode === 'edit' ? (
    <p>{props.blockTitle}</p>
  ) : (
    <div className="site-block">
      <h3 className="blue">{lcp.installationPartName}</h3>
      <Grid columns={12}>
        <Grid.Row>
          <Grid.Column mobile={6}>
            <p className="label">Plant Type</p>
            <p className="info">{lcp.plantType || '-'}</p>
          </Grid.Column>
          <Grid.Column mobile={6}>
            <p className="label">Total rated thermal input</p>
            <p className="info">
              {lcp.totalRatedThermalInput
                ? lcp.totalRatedThermalInput
                : 'unspecified'}
            </p>
          </Grid.Column>
          <Grid.Column mobile={6}>
            <p className="label">Untreated municipal waste treate</p>
            <p className="info">{lcp.untreatedMunicipalWaste ? 'yes' : 'no'}</p>
          </Grid.Column>
          <Grid.Column mobile={6}>
            <p className="label">Specific conditions apply?</p>
            <p className="info">
              {lcp.specificConditions ? lcp.specificConditions : 'no'}
            </p>
          </Grid.Column>
          <Grid.Column mobile={6}>
            <p className="label">Significant hazardous waste incinerated</p>
            <p className="info">
              {lcp.heatReleaseHazardousWaste ? 'yes' : 'no'}
            </p>
          </Grid.Column>
          <Grid.Column mobile={6}>
            <p className="label">Nominal capacity</p>
            <p className="info">
              {lcp.totalNominalCapacityAnyWaste
                ? lcp.totalNominalCapacityAnyWaste
                : 'unspecified'}
            </p>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};

export default compose(
  connect((state, props) => ({
    query: qs.parse(state.router.location.search.replace('?', '')),
  })),
)(View);
