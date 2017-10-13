import xin from 'xin';
import View from 'xin/components/view';
import html from './templates/map-google-view.html';

import './css/map-google-view.css';

import 'xin-ionic/ion-toolbar';
import 'xin-ionic/ion-label';
import 'xin-ionic/ion-button';
import 'xin-ionic/ion-input';
import 'xin-ionic/ion-searchbar';
import 'xin-ionic/ion-icon';
import 'xin-ionic/ion-content';

import './map-google';
import './map-google-marker';

class MapGoogleView extends View {
  get template () {
    return html;
  }

  get props () {
    return Object.assign({}, super.props, {
      title: {
        type: String,
        value: 'Choose Map',
      },

      button: {
        type: String,
        value: 'Choose',
      },

      latitude: {
        type: Number,
        observer: '_locationChanged(latitude, longitude)',
      },

      longitude: {
        type: Number,
        observer: '_locationChanged(latitude, longitude)',
      },

      apiKey: {
        type: String,
      },

      value: {
        type: Object,
        value: () => ({}),
      },

      callback: {
        type: Function,
        value: () => {
          return result => {
            console.log('do nothing');
          };
        },
      },
    });
  }

  focusing (parameters) {
    super.focusing(parameters);

    if (parameters.latitude && parameters.longitude) {
      this.set('latitude', Number(parameters.latitude));
      this.set('longitude', Number(parameters.longitude));
    } else {
      navigator.geolocation.getCurrentPosition(position => {
        // if (this.latitude || this.longitude) {
        //   return;
        // }

        this.set('latitude', position.coords.latitude);
        this.set('longitude', position.coords.longitude);
      });
    }
  }

  _chooseClicked (evt) {
    evt.stopImmediatePropagation();

    if (this.isSet) {
      window.history.back();
      this.callback(this.value);
    }
  }

  _mapReady (evt) {
    let searchBox = new window.google.maps.places.SearchBox(this.$.search);
    searchBox.addListener('places_changed', () => {
      this.$.search.blur();

      let places = searchBox.getPlaces();
      if (places && places.length) {
        this.$.map.map.setCenter(places[0].geometry.location);
      }
    });
  }

  _clearValueClicked (evt) {
    this.set('search', '');
  }

  _locationChanged (latitude, longitude) {
    if (!window.google || !latitude || !longitude) {
      return;
    }

    this.isSet = false;

    this.debounce('_locationChanged', () => {
      let geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat: this.latitude, lng: this.longitude } }, (results, status) => {
        if (status !== window.google.maps.GeocoderStatus.OK) {
          return;
        }

        let val = {
          latitude: this.latitude,
          longitude: this.longitude,
          googleFormattedAddress: results[0].formatted_address,
          address: results[0].formatted_address,
          components: {},
        };

        results[0].address_components.forEach(component => {
          if (component.types[0] === 'political') {
            return;
          }
          val.components[component.types[0]] = component.long_name;
        });

        this.set('value', val);
        this.set('search', val.address);

        this.isSet = true;
      });
    });
  }
}

xin.define('map-google-view', MapGoogleView);

export default MapGoogleView;
