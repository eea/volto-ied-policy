import React from 'react';
import { Dropdown } from 'semantic-ui-react';
import { Icon } from '@plone/volto/components';
import { noOptions } from './dictionary';

import circlePlus from '@plone/volto/icons/circle-plus.svg';
import circleMinus from '@plone/volto/icons/circle-minus.svg';

const Actions = ({ inputs, filterName, options, setInputs, onChange }) => {
  const addButtonVisible = React.useMemo(() => {
    if (!options || !options.length) return false;
    return inputs[filterName].length < options.length - 1;
  }, [inputs, filterName, options]);

  const removeButtonVisible = React.useMemo(() => {
    return inputs[filterName].length > 1;
  }, [inputs, filterName]);

  return (
    <>
      {addButtonVisible ? (
        <Icon
          className="add-button"
          onClick={() => {
            let newInputs;
            const newInput = inputs[filterName];
            if (!newInput.length) {
              newInput.push(null);
            }
            newInput.push(null);
            newInputs = { ...inputs, [filterName]: [...newInput] };
            setInputs(newInputs);
          }}
          name={circlePlus}
          size="2em"
        />
      ) : (
        ''
      )}

      {removeButtonVisible ? (
        <Icon
          className="remove-button"
          onClick={() => {
            let newInputs;
            const newInput = inputs[filterName];
            newInput.pop();
            newInputs = { ...inputs, [filterName]: [...newInput] };
            if (onChange) {
              onChange({ type: 'REMOVE', inputs: newInputs });
              return;
            }
            setInputs(newInputs);
          }}
          name={circleMinus}
          size="2em"
        />
      ) : (
        ''
      )}
    </>
  );
};

const SelectWrapper = ({
  inputs,
  name,
  options,
  placeholder,
  setInputs,
  onChange,
}) => {
  const filterName = `filter_${name}`;

  if (!inputs[filterName] || options?.length <= 1) return '';
  return (
    <div className="dropdown-wrapper">
      {!inputs[filterName].length ? (
        <Dropdown
          selection
          search
          onChange={(_, data) => {
            let newInputs;
            const newInput = inputs[filterName];
            newInput[0] = data.value;
            newInputs = { ...inputs, [filterName]: [...newInput] };
            if (onChange) {
              onChange({ type: 'UPDATE', inputs: newInputs });
              return;
            }
            setInputs(newInputs);
          }}
          options={options || noOptions}
          placeholder={placeholder}
          value={inputs[filterName][0]}
        />
      ) : (
        inputs[filterName].map((_, index) => {
          return (
            <Dropdown
              selection
              search
              key={`${index + 1}-${name}`}
              onChange={(_, data) => {
                let newInputs;
                const newInput = inputs[filterName];
                newInput[index] = data.value;
                newInputs = { ...inputs, [filterName]: [...newInput] };
                if (onChange) {
                  onChange({ type: 'UPDATE', inputs: newInputs });
                  return;
                }
                setInputs(newInputs);
              }}
              options={(options || noOptions).filter((option) => {
                return (
                  option.value === null ||
                  option.value === inputs[filterName][index] ||
                  !inputs[filterName].includes(option.value)
                );
              })}
              placeholder={placeholder}
              value={inputs[filterName][index]}
            />
          );
        })
      )}
      <Actions
        inputs={inputs}
        filterName={filterName}
        options={options}
        setInputs={setInputs}
        onChange={onChange}
      />
    </div>
  );
};

export default SelectWrapper;
