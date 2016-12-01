import xin from 'xin';
import View from 'xin/components/view';
import html from './templates/map-google-input-selectview.html';

import './css/map-google-input-selectview.css';

import 'xin-ionic/ion-input';

import './map-google';
import './map-google-marker';

class MapGoogleInputSelectview extends View {
  get template () {
    return html;
  }

  get props () {
    return Object.assign({}, super.props, {
      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },

      apiKey: {
        type: String,
      },

      callback: {
        type: Function,
        value: () => {
          return result => {
            // let geocoder = new window.google.maps.Geocoder();
            // geocoder.geocode({
            //   location: {
            //     lat: this.latitude,
            //     lng: this.longitude,
            //   },
            // }, result => {
            //   if (!result) {
            //     return;
            //   }
            //   console.log(result);
            // });
          };
        },
      },
    });
  }

  attached () {
    super.attached();

    window.navigator.geolocation.getCurrentPosition(position => {
      this.set('latitude', position.coords.latitude);
      this.set('longitude', position.coords.longitude);
    });
  }

  _chooseClicked (evt) {
    evt.stopImmediatePropagation();

    window.history.back();
    // console.log('return', this.latitude, this.longitude);

    this.callback({
      latitude: this.latitude,
      longitude: this.longitude,
      address: this.search,
    });
  }

  _mapReady (evt) {
    let searchBox = new window.google.maps.places.SearchBox(this.$.search);
    searchBox.addListener('places_changed', () => {
      let places = searchBox.getPlaces();
      if (places && places.length) {
        this.$.map.map.setCenter(places[0].geometry.location);
      }
    });
  }

  _centerChanged (evt) {
    this.debounce('_centerChanged', () => {
      let geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({
        location: {lat: this.latitude, lng: this.longitude},
      }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK) {
          this.set('search', results[0].formatted_address);
        }
      });
    });
  }
}

xin.define('map-google-input-selectview', MapGoogleInputSelectview);

export default MapGoogleInputSelectview;
