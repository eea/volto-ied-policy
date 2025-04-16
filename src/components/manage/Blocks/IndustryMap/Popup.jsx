import React from 'react';
import { Grid } from 'semantic-ui-react';

class Popup extends React.PureComponent {
  constructor(props) {
    super(props);
    this.onPointermove = this.onPointermove.bind(this);
    this.state = {
      data: {},
    };
  }

  onPointermove(e) {
    if (JSON.stringify(e.detail) !== JSON.stringify(this.state.data)) {
      this.setState({ data: e.detail });
    }
  }

  componentDidMount() {
    if (document && document.querySelector('#industry-map'))
      document
        .querySelector('#industry-map')
        .addEventListener('ol-pointermove', this.onPointermove);
  }

  componentWillUnmount() {
    if (document && document.querySelector('#industry-map'))
      document
        .querySelector('#industry-map')
        .removeEventListener('ol-pointermove', this.onPointermove);
  }

  render() {
    const { data } = this.state;
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
  }
}

export default Popup;
