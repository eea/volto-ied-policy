import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router';
import { Portal } from 'react-portal';
import cs from 'classnames';
import { Dropdown, Checkbox } from 'semantic-ui-react';
import { Icon } from '@plone/volto/components';
import { BodyClass } from '@plone/volto/helpers';
import { trackSiteSearch } from '@eeacms/volto-matomo/utils';
import { setIndustryMapFilters } from '@eeacms/volto-ied-policy/actions';
import {
  getOptions,
  noOptions,
  inputsKeys,
} from '@eeacms/volto-ied-policy/components/manage/Blocks/FiltersMap/dictionary';
import { filtersToSearchParams, searchParamsToFilters } from './urlFilters';

import menuSVG from '@plone/volto/icons/menu-alt.svg';
class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.isChecked = this.isChecked.bind(this);
    this.setCheckboxValue = this.setCheckboxValue.bind(this);
    this.setDropdownValue = this.setDropdownValue.bind(this);
    this.applyFilters = this.applyFilters.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
    this.updateOptions = this.updateOptions.bind(this);
    this.state = {
      options: {},
      open: false,
    };
  }

  // Filter values live in the URL (source of truth); decode them on demand.
  getFilters() {
    return searchParamsToFilters(this.props.location.search);
  }

  // Push the new filter set to the URL and bump the redux coordination counter
  // so the map/table refetch effects fire (filter_change stays in redux).
  pushFilters(filters, type) {
    const { history, location, query, dispatch } = this.props;
    const search = filtersToSearchParams(filters, location).toString();
    history.push({
      pathname: location.pathname,
      search: search ? `?${search}` : '',
    });
    dispatch(
      setIndustryMapFilters({
        filter_change: {
          counter: (query['filter_change']?.counter || 0) + 1,
          type,
        },
        filter_search: null,
        filter_search_value: '',
      }),
    );
  }

  isChecked(filter, label) {
    return (this.getFilters()[filter] || []).indexOf(label) !== -1;
  }

  setCheckboxValue(_, data) {
    const values = [...(this.getFilters()[data.name] || [])];
    const checked = data.checked;
    const index = values.indexOf(data.label);
    if (checked && index === -1) {
      values.push(data.label);
    }
    if (!checked && index !== -1) {
      values.splice(index, 1);
    }
    this.applyFilters({ [data.name]: values });
  }

  setDropdownValue(data, filterName) {
    this.applyFilters({
      [filterName]: Array.isArray(data.value) ? data.value : [data.value],
      ...(filterName === 'filter_countries'
        ? {
            filter_nuts_1: [],
            filter_nuts_2: [],
            filter_river_basin_districts: [],
          }
        : {}),
    });
  }

  applyFilters(filters) {
    const newFilters = { ...this.getFilters(), ...filters };
    this.pushFilters(newFilters, 'simple-filter');
    trackSiteSearch({
      category: `Map/Table simple-filter`,
      keyword: JSON.stringify({
        ...Object.keys(newFilters)
          .filter(
            (key) =>
              inputsKeys.includes(key) &&
              newFilters[key]?.filter((value) => value)?.length,
          )
          .reduce((obj, key) => {
            obj[key] = newFilters[key]?.filter((value) => value);
            return obj;
          }, {}),
      }),
    });
  }

  clearFilters(e) {
    this.pushFilters({}, 'clear');
    e.preventDefault();
    e.stopPropagation();
  }

  updateOptions() {
    const { data, providers_data } = this.props;
    const newOptions = { ...this.options };
    if (data.providers) {
      data.providers.forEach((source) => {
        if (
          source.name &&
          !newOptions[source.name] &&
          providers_data[source.name]
        ) {
          newOptions[source.name] = getOptions(
            providers_data[source.name],
            false,
          );
        }
      });
      this.setState({ options: newOptions });
    }
  }

  componentDidUpdate(prevProps) {
    const providersData = this.props.providers_data;
    const prevProvidersData = prevProps.providers_data;
    if (providersData !== prevProvidersData) {
      this.updateOptions();
    }
  }

  componentDidMount() {
    this.updateOptions();
  }

  render() {
    const filters = this.getFilters();
    const { options } = this.state;
    if (__SERVER__) return '';
    return (
      <div id="map-sidebar" className="outline-button">
        <form autoComplete="off" name="Map simple filters">
          <h2>
            <span>Quick filters</span>{' '}
            <i
              aria-hidden
              className="delete icon"
              style={{ float: 'right', cursor: 'pointer' }}
              onClick={() => {
                this.setState({ open: false });
              }}
            />
          </h2>
          <h3>Reporting year</h3>
          <Dropdown
            fluid
            search
            selection
            multiple
            upward={false}
            onChange={(_, data) => {
              this.setDropdownValue(data, 'filter_reporting_years');
            }}
            options={options.reporting_years || noOptions}
            placeholder={'Select reporting year'}
            value={filters.filter_reporting_years || []}
          />
          <h3>Country</h3>
          <Dropdown
            fluid
            search
            selection
            multiple
            upward={false}
            onChange={(_, data) => {
              this.setDropdownValue(data, 'filter_countries');
            }}
            options={options.countries || noOptions}
            placeholder={'Select country'}
            value={filters.filter_countries || []}
          />
          <h3>Industrial sector</h3>
          <Dropdown
            fluid
            search
            selection
            multiple
            upward={false}
            onChange={(_, data) => {
              this.setDropdownValue(data, 'filter_industries');
            }}
            options={options.industries || noOptions}
            placeholder={'Select industrial sector'}
            value={filters.filter_industries || []}
          />
          <h3>Facility type</h3>
          <Checkbox
            name="filter_facility_types"
            label="EPRTR"
            style={{ marginRight: '1rem' }}
            checked={this.isChecked('filter_facility_types', 'EPRTR')}
            onChange={this.setCheckboxValue}
          />
          <Checkbox
            name="filter_facility_types"
            label="NONEPRTR"
            checked={this.isChecked('filter_facility_types', 'NONEPRTR')}
            onChange={this.setCheckboxValue}
          />
          <h3>Installation type</h3>
          <Checkbox
            name="filter_installation_types"
            label="IED"
            style={{ marginRight: '1rem' }}
            checked={this.isChecked('filter_installation_types', 'IED')}
            onChange={this.setCheckboxValue}
          />
          <Checkbox
            name="filter_installation_types"
            label="NONIED"
            checked={this.isChecked('filter_installation_types', 'NONIED')}
            onChange={this.setCheckboxValue}
          />
          <button onClick={this.clearFilters} className="clear-button">
            Clear filters
          </button>
        </form>
        <Portal
          node={document.querySelector('.industry-map .ol-control.ol-custom')}
        >
          <button
            className="menu-button"
            title="Toggle sidebar"
            onClick={() => {
              this.setState((prevState) => ({ open: !prevState.open }));
            }}
          >
            <Icon name={menuSVG} size="1em" fill="white" />
          </button>
        </Portal>
        <BodyClass className={cs({ 'map-sidebar-visible': this.state.open })} />
      </div>
    );
  }
}

export default compose(
  withRouter,
  connect((state) => ({
    query: state.industryMapFilters.search,
  })),
)(Sidebar);
