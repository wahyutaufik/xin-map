import xin from 'xin';

import './css/map-google-input.css';

class MapGoogleInput extends xin.Component {
  get template () {
    return '' +
    `
      <div class="text">[[valueText]]</div>
      <div class="cover" (click)="_coverClicked(evt)"></div>
    `;
  }

  get props () {
    return {
      value: {
        type: Object,
        notify: true,
      },

      valueText: {
        type: String,
        value: '',
      },

      selectViewUri: {
        type: String,
        value: '/map-google-input-selectview',
      },
    };
  }

  _coverClicked (evt) {
    evt.stopImmediatePropagation();

    this.present();
  }

  async present () {
    return await new Promise((resolve, reject) => {
      // let referer = this.__app.getFragment();

      this.__app.once('navigated', evt => {
        let view = document.getElementsByTagName('map-google-input-selectview')[0];
        view.set('callback', (result) => {
          let geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({
            location: {lat: result.latitude, lng: result.longitude},
          }, (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK) {
              this.set('value', result);
              this.set('valueText', results[0].formatted_address);
              // this.__app.navigate(referer);
              this.fire('change');
            }
          });
        });
      });

      this.__app.navigate(this.selectViewUri);
    });
  }
}

xin.define('map-google-input', MapGoogleInput);

export default MapGoogleInput;
