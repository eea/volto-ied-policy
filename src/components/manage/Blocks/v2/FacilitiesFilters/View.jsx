/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Checkbox, Dropdown, Input } from 'semantic-ui-react';
import { FACILITIES_OPTIONS_URL, COUNTRY_NAMES, URL_KEYS } from './index';
import './style.less';

const splitParam = (value) =>
  (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const NO_LABEL = () => null;

const optionLabel = (options, value) =>
  options.find((o) => o.value === value)?.text || COUNTRY_NAMES[value] || value;

const AppliedChips = ({ values = [], options, onRemove }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted && values.length ? (
    <ul className="v2-applied-chips" aria-label="Applied values">
      {values.map((value) => (
        <li className="v2-applied-chip" key={value}>
          <span className="v2-applied-chip-text">
            {optionLabel(options, value)}
          </span>
          <button
            type="button"
            className="v2-applied-chip-remove"
            aria-label={`Remove ${optionLabel(options, value)}`}
            onClick={() => onRemove(value)}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  ) : null;
};

const readFromUrl = (search) => {
  const p = new URLSearchParams(search);
  return {
    name: p.get(URL_KEYS.name) || '',
    reportingYear: splitParam(p.get(URL_KEYS.reportingYear)),
    country: splitParam(p.get(URL_KEYS.country)),
    industrialSector: splitParam(p.get(URL_KEYS.industrialSector)),
    facilityType: splitParam(p.get(URL_KEYS.facilityType)),
    installationType: splitParam(p.get(URL_KEYS.installationType)),
    thematicInformation: splitParam(p.get(URL_KEYS.thematicInformation)),
    facilityName: p.get(URL_KEYS.facilityName) || '',
    parentCompany: p.get(URL_KEYS.parentCompany) || '',
    owner: p.get(URL_KEYS.owner) || '',
    pollutants: splitParam(p.get(URL_KEYS.pollutants)),
    combustionPlantType: p.get(URL_KEYS.combustionPlantType) || '',
    permitType: splitParam(p.get(URL_KEYS.permitType)),
    permitYear: splitParam(p.get(URL_KEYS.permitYear)),
  };
};

const writeToUrl = (search, draft) => {
  const p = new URLSearchParams(search);
  if (draft.name) p.set(URL_KEYS.name, draft.name);
  else p.delete(URL_KEYS.name);

  if (draft.reportingYear && draft.reportingYear.length)
    p.set(URL_KEYS.reportingYear, draft.reportingYear.join(','));
  else p.delete(URL_KEYS.reportingYear);

  const writeArray = (key, value) => {
    if (value && value.length) p.set(key, value.join(','));
    else p.delete(key);
  };
  const writeString = (key, value) => {
    if (value) p.set(key, value);
    else p.delete(key);
  };

  writeArray(URL_KEYS.country, draft.country);
  writeArray(URL_KEYS.industrialSector, draft.industrialSector);
  writeArray(URL_KEYS.facilityType, draft.facilityType);
  writeArray(URL_KEYS.installationType, draft.installationType);
  writeArray(URL_KEYS.thematicInformation, draft.thematicInformation);
  writeString(URL_KEYS.facilityName, draft.facilityName);
  writeString(URL_KEYS.parentCompany, draft.parentCompany);
  writeString(URL_KEYS.owner, draft.owner);
  writeArray(URL_KEYS.pollutants, draft.pollutants);
  writeString(URL_KEYS.combustionPlantType, draft.combustionPlantType);
  writeArray(URL_KEYS.permitType, draft.permitType);
  writeArray(URL_KEYS.permitYear, draft.permitYear);

  const out = p.toString();
  return out ? `?${out}` : '';
};

const clearWiredKeys = (search) => {
  const p = new URLSearchParams(search);
  Object.values(URL_KEYS).forEach((k) => p.delete(k));
  const out = p.toString();
  return out ? `?${out}` : '';
};

const View = (props) => {
  const { location } = props;
  const history = useHistory();

  const [draft, setDraft] = React.useState(() => readFromUrl(location.search));
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [options, setOptions] = React.useState({
    years: [],
    countries: [],
    sectors: [],
  });

  // Sync draft from URL on external nav.
  React.useEffect(() => {
    setDraft(readFromUrl(location.search));
  }, [location.search]);

  // Fetch lightweight options once on mount.
  React.useEffect(() => {
    if (__SERVER__) return undefined;
    let alive = true;
    const params = new URLSearchParams({
      where: '1=1',
      outFields: 'reportingYear,countryCode,EPRTRAnnexIMainActivity',
      f: 'json',
      outSR: '4326',
      returnGeometry: 'false',
    });
    fetch(`${FACILITIES_OPTIONS_URL}?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        if (!alive) return;
        const years = new Set();
        const countries = new Set();
        const sectors = new Set();
        (data.features || []).forEach(({ attributes: a }) => {
          if (a?.reportingYear) years.add(a.reportingYear);
          if (a?.countryCode) countries.add(a.countryCode);
          if (a?.EPRTRAnnexIMainActivity)
            sectors.add(a.EPRTRAnnexIMainActivity);
        });
        setOptions({
          years: [...years].sort((x, y) => y - x),
          countries: [...countries].sort(),
          sectors: [...sectors].sort(),
        });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load filter options:', err);
      });
    return () => {
      alive = false;
    };
  }, []);

  const yearOptions = React.useMemo(
    () =>
      options.years.map((y) => ({
        key: y,
        value: String(y),
        text: String(y),
      })),
    [options.years],
  );

  const countryOptions = React.useMemo(
    () =>
      options.countries.map((c) => ({
        key: c,
        value: c,
        text: COUNTRY_NAMES[c] || c,
      })),
    [options.countries],
  );

  const sectorOptions = React.useMemo(
    () => options.sectors.map((s) => ({ key: s, value: s, text: s })),
    [options.sectors],
  );

  const applyFilters = (next = draft) => {
    history.push({
      pathname: location.pathname,
      search: writeToUrl(location.search, next),
    });
  };

  const clearAll = () => {
    const blank = readFromUrl('');
    setDraft(blank);
    history.push({
      pathname: location.pathname,
      search: clearWiredKeys(location.search),
    });
  };

  const toggleCheckboxValue = (group, value) => {
    setDraft((d) => {
      const current = d[group] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...d, [group]: next };
    });
  };

  return (
    <div className="facilities-filters-block">
      <div className="ff-card">
        <div className="ff-header">
          <h2 className="ff-title">Filters</h2>
          <div className="ff-toggle">
            <span>Show advanced</span>
            <Checkbox
              toggle
              checked={showAdvanced}
              onChange={(_, d) => setShowAdvanced(!!d.checked)}
            />
          </div>
        </div>

        {/* ── Row: Reporting year, Country, Industrial Sector ── */}
        <div className="ff-row ff-row-3">
          <div className="ff-field">
            <label>Reporting year</label>
            <Dropdown
              fluid
              multiple
              selection
              search
              placeholder="Select years"
              renderLabel={NO_LABEL}
              options={yearOptions}
              value={draft.reportingYear}
              onChange={(_, d) =>
                setDraft((s) => ({ ...s, reportingYear: d.value }))
              }
            />
            <AppliedChips
              values={draft.reportingYear}
              options={yearOptions}
              onRemove={(value) =>
                setDraft((s) => ({
                  ...s,
                  reportingYear: s.reportingYear.filter((v) => v !== value),
                }))
              }
            />
          </div>
          <div className="ff-field">
            <label>Country</label>
            <Dropdown
              fluid
              multiple
              selection
              search
              placeholder="Select country"
              renderLabel={NO_LABEL}
              options={countryOptions}
              value={draft.country}
              onChange={(_, d) =>
                setDraft((s) => ({ ...s, country: d.value || [] }))
              }
            />
            <AppliedChips
              values={draft.country}
              options={countryOptions}
              onRemove={(value) =>
                setDraft((s) => ({
                  ...s,
                  country: s.country.filter((v) => v !== value),
                }))
              }
            />
          </div>
          <div className="ff-field">
            <label>Industrial Sector</label>
            <Dropdown
              fluid
              multiple
              selection
              search
              placeholder="Select sector"
              renderLabel={NO_LABEL}
              options={sectorOptions}
              value={draft.industrialSector}
              onChange={(_, d) =>
                setDraft((s) => ({ ...s, industrialSector: d.value || [] }))
              }
            />
            <AppliedChips
              values={draft.industrialSector}
              options={sectorOptions}
              onRemove={(value) =>
                setDraft((s) => ({
                  ...s,
                  industrialSector: s.industrialSector.filter(
                    (v) => v !== value,
                  ),
                }))
              }
            />
          </div>
        </div>

        {/* ── Row: Facility type + Installation type (checkboxes) ── */}
        <div className="ff-row ff-row-2">
          <div className="ff-field">
            <label>Facility type</label>
            <div className="ff-checks">
              <Checkbox
                label="EPRTR"
                checked={draft.facilityType.includes('EPRTR')}
                onChange={() => toggleCheckboxValue('facilityType', 'EPRTR')}
              />
              <Checkbox
                label="NONEPRTR"
                checked={draft.facilityType.includes('NONEPRTR')}
                onChange={() => toggleCheckboxValue('facilityType', 'NONEPRTR')}
              />
            </div>
          </div>
          <div className="ff-field">
            <label>Installation type</label>
            <div className="ff-checks">
              <Checkbox
                label="IED"
                checked={draft.installationType.includes('IED')}
                onChange={() => toggleCheckboxValue('installationType', 'IED')}
              />
              <Checkbox
                label="NONIED"
                checked={draft.installationType.includes('NONIED')}
                onChange={() =>
                  toggleCheckboxValue('installationType', 'NONIED')
                }
              />
            </div>
          </div>
        </div>

        {showAdvanced ? (
          <>
            {/* ── Thematic information ── */}
            <div className="ff-row ff-row-1">
              <div className="ff-field">
                <label>Thematic information</label>
                <div className="ff-checks">
                  <Checkbox
                    label="Pollutant release"
                    checked={draft.thematicInformation.includes('release')}
                    onChange={() =>
                      toggleCheckboxValue('thematicInformation', 'release')
                    }
                  />
                  <Checkbox
                    label="Pollutant transfer"
                    checked={draft.thematicInformation.includes('transfer')}
                    onChange={() =>
                      toggleCheckboxValue('thematicInformation', 'transfer')
                    }
                  />
                  <Checkbox
                    label="Pollutant waste"
                    checked={draft.thematicInformation.includes('waste')}
                    onChange={() =>
                      toggleCheckboxValue('thematicInformation', 'waste')
                    }
                  />
                </div>
              </div>
            </div>

            <div className="ff-subheader">Advanced filters</div>

            {/* ── Row: Facility name / Parent company / Owner (text inputs, placeholders) ── */}
            <div className="ff-row ff-row-3">
              <div className="ff-field">
                <label>Facility name</label>
                <Input
                  fluid
                  placeholder="Facility name"
                  value={draft.facilityName}
                  onChange={(e) =>
                    setDraft((s) => ({ ...s, facilityName: e.target.value }))
                  }
                />
              </div>
              <div className="ff-field">
                <label>Parent company name</label>
                <Input
                  fluid
                  placeholder="Parent company"
                  value={draft.parentCompany}
                  onChange={(e) =>
                    setDraft((s) => ({ ...s, parentCompany: e.target.value }))
                  }
                />
              </div>
              <div className="ff-field">
                <label>Owner</label>
                <Input
                  fluid
                  placeholder="Owner"
                  value={draft.owner}
                  onChange={(e) =>
                    setDraft((s) => ({ ...s, owner: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* ── Pollutants ── */}
            <div className="ff-row ff-row-1">
              <div className="ff-field">
                <label>Pollutants</label>
                <Dropdown
                  fluid
                  multiple
                  selection
                  search
                  placeholder="Pollutant"
                  options={[]}
                  value={draft.pollutants}
                  onChange={(_, d) =>
                    setDraft((s) => ({ ...s, pollutants: d.value || [] }))
                  }
                />
              </div>
            </div>

            {/* ── Combustion plant type + Permit ── */}
            <div className="ff-row ff-row-3">
              <div className="ff-field">
                <label>Combustion plant type</label>
                <Input
                  fluid
                  placeholder="Select plant type"
                  value={draft.combustionPlantType}
                  onChange={(e) =>
                    setDraft((s) => ({
                      ...s,
                      combustionPlantType: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="ff-field">
                <label>Permit</label>
                <Dropdown
                  fluid
                  multiple
                  selection
                  search
                  placeholder="Permit type"
                  options={[]}
                  value={draft.permitType}
                  onChange={(_, d) =>
                    setDraft((s) => ({ ...s, permitType: d.value || [] }))
                  }
                />
              </div>
              <div className="ff-field">
                <label>&nbsp;</label>
                <Dropdown
                  fluid
                  multiple
                  selection
                  search
                  placeholder="Permit year"
                  options={[]}
                  value={draft.permitYear}
                  onChange={(_, d) =>
                    setDraft((s) => ({ ...s, permitYear: d.value || [] }))
                  }
                />
              </div>
            </div>
          </>
        ) : null}

        <div className="ff-actions">
          <button
            type="button"
            className="ff-btn-primary"
            onClick={() => applyFilters()}
          >
            Apply filters
          </button>
          <button type="button" className="ff-btn-clear" onClick={clearAll}>
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
};

export default connect((state) => ({
  location: state.router.location,
}))(View);
