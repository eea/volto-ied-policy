import React, { useEffect, useState } from 'react';
import { Grid } from 'semantic-ui-react';

const Popup = ({ lock = false, staticData = null }) => {
  const [data, setData] = useState(staticData || {});

  useEffect(() => {
    console.log('here lock', lock);
    if (lock && staticData) {
      setData(staticData);
      return;
    }

    const handler = (e) => {
      if (JSON.stringify(e.detail) !== JSON.stringify(data)) {
        setData(e.detail);
      }
    };

    const mapElement = document.querySelector('#industry-map');
    mapElement?.addEventListener('ol-pointermove', handler);

    return () => {
      mapElement?.removeEventListener('ol-pointermove', handler);
    };
  }, [lock, staticData]);

  return (
    <div
      id="popup"
      style={
        !Object.keys(data).length
          ? { display: 'none', pointerEvents: 'auto' }
          : {}
      }
    >
      <div className="popover-header">
        {data.siteName ? (
          <h3>{data.siteName}</h3>
        ) : data.NUTS_NAME && data.CNTR_CODE && data.COUNTRY ? (
          <h3>{`${data.NUTS_NAME}, ${data.CNTR_CODE}, ${data.COUNTRY}`}</h3>
        ) : (
          ''
        )}
      </div>
      <div className="popover-body">
        <Grid.Column stretched>
          {data.num_sites ? (
            <Grid.Row>
              <p>
                Number of sites: <code>{data.num_sites}</code>
              </p>
            </Grid.Row>
          ) : (
            ''
          )}
          <Grid.Row>
            {data.hdms ? (
              <>
                <p className="mb-1">The location you are viewing is:</p>
                <code>{data.hdms}</code>
              </>
            ) : (
              ''
            )}
          </Grid.Row>
        </Grid.Column>
      </div>
    </div>
  );
};

export default Popup;
