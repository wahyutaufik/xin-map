import xin from 'xin';

import './css/map-google-input.css';

class MapGoogleInput extends xin.Component {
  get template () {
    return '' +
    `
      <p class="text">[[valueText]]</p>
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
        let view = document.querySelector('map-google-input-selectview');
        view.set('callback', (result) => {
          this.set('value', result);
          this.set('valueText', result.address);
          this.fire('change');
        });
      });

      this.__app.navigate(this.selectViewUri);
    });
  }
}

xin.define('map-google-input', MapGoogleInput);

export default MapGoogleInput;
