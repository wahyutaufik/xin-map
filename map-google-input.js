import { Component, define} from '@xinix/xin';

import './css/map-google-input.css';

class MapGoogleInput extends Component {
  get template () {
    return String(`
      <div class="cover" (click)="_coverClicked(evt)">
        <p class="text">[[valueText]]</p>
      </div>
    `);
  }

  get props () {
    return {
      value: {
        type: Object,
        notify: true,
      },

      valueText: {
        type: String,
        computed: '_computeValueText(value)',
      },

      selectViewUri: {
        type: String,
        value: '/map',
      },

      selectViewComponent: {
        type: String,
        value: 'map-google-view',
      },
    };
  }

  _coverClicked (evt) {
    evt.stopImmediatePropagation();

    this.present();
  }

  async present () {
    return await new Promise((resolve, reject) => {
      // Select Location
      // let referer = this.__app.getFragment();

      this.__app.once('navigated', evt => {
        let view = document.querySelector(`${this.selectViewComponent}`);
        if (!view) {
          throw new Error('Select view not found');
        }
        view.set('callback', (result) => {
          this.set('value', result);
          this.fire('change');
        });
      });

      this.__app.navigate(this.selectViewUri);
    });
  }

  _computeValueText (value) {
    if (!value || !value.address) {
      return '';
    }

    return value.address;
  }
}

define('map-google-input', MapGoogleInput);

export default MapGoogleInput;
