import xin from 'xin';

let mapInquiries = [];

class MapGoogle extends xin.Component {
  static async waitForGoogleMap (apiKey) {
    if (window.google && window.google.maps) {
      return window.google.maps;
    }

    if (mapInquiries.length > 0) {
      return await new Promise((resolve, reject) => {
        mapInquiries.push([resolve, reject]);
      });
    }

    return await new Promise((resolve, reject) => {
      mapInquiries.push([resolve, reject]);

      let script = document.createElement('script');
      script.id = 'gmap-api';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.onload = () => {
        mapInquiries.forEach(inquiry => inquiry[0](window.google.maps));
      };
      document.body.appendChild(script);
    });
  }

  get props () {
    return Object.assign({}, super.props, {
      latitude: {
        type: Number,
        value: -6.254844,
        observer: '_centerChanged(latitude, longitude)',
        notify: true,
      },

      longitude: {
        type: Number,
        value: 106.826583,
        observer: '_centerChanged(latitude, longitude)',
        notify: true,
      },

      markCenter: {
        type: Boolean,
      },

      currentLocation: {
        type: Boolean,
      },

      zoom: {
        type: Number,
        value: 14,
      },

      disableDefaultUi: {
        type: Boolean,
      },

      disableMapTypeControl: {
        type: Boolean,
      },

      disableStreetViewControl: {
        type: Boolean,
      },

      disableFullscreenControl: {
        type: Boolean,
      },

      apiKey: {
        type: String,
        observer: '_apiKeyChanged',
      },

      map: {
        type: Object,
        notify: true,
      },

      dragEvents: {
        type: Boolean,
        value: false,
        observer: '_dragEventsChanged',
      },

      mouseEvents: {
        type: Boolean,
        value: false,
        observer: '_mouseEventsChanged',
      },
    });
  }

  get template () {
    return String(`
      <slot></slot>
      <div id="map" style="height: 100%"></div>
    `);
  }

  created () {
    super.created();
    this._listeners = [];

    this.markers = [];
  }

  _clearListener (name) {
    if (this._listeners[name]) {
      window.google.maps.event.removeListener(this._listeners[name]);
      this._listeners[name] = null;
    }
  }

  _forwardEvent (name) {
    this._listeners[name] = window.google.maps.event.addListener(this.map, name, evt => {
      this.fire('google-map-' + name, evt);
    });
  }

  async _apiKeyChanged () {
    if (!this.apiKey) {
      return;
    }

    await MapGoogle.waitForGoogleMap(this.apiKey);

    this.set('map', new window.google.maps.Map(this.$.map, this._getMapOptions()));

    this.async(() => {
      google.maps.event.trigger(this.map, 'resize');
    }, 50);

    this.fire('google-map-ready');

    if (this.markCenter) {
      let centerMarker = document.createElement('div');
      centerMarker.classList.add('centerMarker');
      this.map.getDiv().appendChild(centerMarker);
    }

    if (this.currentLocation) {
      let controlDiv = document.createElement('div');

      let firstChild = document.createElement('button');
      firstChild.style.backgroundColor = '#fff';
      firstChild.style.border = 'none';
      firstChild.style.outline = 'none';
      firstChild.style.width = '28px';
      firstChild.style.height = '28px';
      firstChild.style.borderRadius = '2px';
      firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
      firstChild.style.cursor = 'pointer';
      firstChild.style.marginRight = '10px';
      firstChild.style.padding = '0px';
      firstChild.title = 'Your Location';
      controlDiv.appendChild(firstChild);

      let secondChild = document.createElement('div');
      secondChild.style.margin = '5px';
      secondChild.style.width = '18px';
      secondChild.style.height = '18px';
      secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-1x.png)';
      secondChild.style.backgroundSize = '180px 18px';
      secondChild.style.backgroundPosition = '0px 0px';
      secondChild.style.backgroundRepeat = 'no-repeat';
      secondChild.id = 'you_location_img';
      firstChild.appendChild(secondChild);

      let currentLocationImg = secondChild;

      window.google.maps.event.addListener(this.map, 'dragend', () => {
        currentLocationImg.style.backgroundPosition = '0px 0px';
      });

      firstChild.addEventListener('click', () => {
        var imgX = '0';
        var animationInterval = setInterval(() => {
          imgX = imgX === '-18' ? '0' : '-18';
          currentLocationImg.style.backgroundPosition = imgX + 'px 0px';
        }, 500);

        navigator.geolocation.getCurrentPosition(position => {
          var latlng = new window.google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          // marker.setPosition(latlng);
          this.map.setCenter(latlng);
          clearInterval(animationInterval);
          currentLocationImg.style.backgroundPosition = '-144px 0px';
        }, err => {
          clearInterval(animationInterval);
          currentLocationImg.style.backgroundPosition = '0px 0px';
        });
      });

      controlDiv.index = 1;
      this.map.controls[window.google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
    }

    if (this.__isNotified('latitude') && this.__isNotified('longitude')) {
      window.google.maps.event.addListener(this.map, 'center_changed', () => {
        let center = this.map.getCenter();
        this.set('latitude', center.lat());
        this.set('longitude', center.lng());

        this.fire('google-map-center-changed');
      });
    }

    [].forEach.call(this.children, el => {
      if (el.is === 'map-google-marker') {
        if (!el.get('map')) {
          el.set('map', this.map);
        }
      }
    });
  }

  _dragEventsChanged () {
    if (this.map) {
      if (this.dragEvents) {
        this._forwardEvent('drag');
        this._forwardEvent('dragend');
        this._forwardEvent('dragstart');
      } else {
        this._clearListener('drag');
        this._clearListener('dragend');
        this._clearListener('dragstart');
      }
    }
  }

  _mouseEventsChanged () {
    if (this.map) {
      if (this.mouseEvents) {
        this._forwardEvent('mousemove');
        this._forwardEvent('mouseout');
        this._forwardEvent('mouseover');
      } else {
        this._clearListener('mousemove');
        this._clearListener('mouseout');
        this._clearListener('mouseover');
      }
    }
  }

  _getMapOptions () {
    let mapOptions = {
      center: {
        lat: this.latitude,
        lng: this.longitude,
      },
      zoom: this.zoom,
      tilt: this.noAutoTilt ? 0 : 45,
      mapTypeId: this.mapType,
      disableDefaultUI: this.disableDefaultUi,
      mapTypeControl: !this.disableDefaultUi && !this.disableMapTypeControl,
      streetViewControl: !this.disableDefaultUi && !this.disableStreetViewControl,
      fullscreenControl: !this.disableDefaultUi && !this.disableFullscreenControl,
      disableDoubleClickZoom: this.disableZoom,
      scrollwheel: !this.disableZoom,
      styles: this.styles,
      maxZoom: Number(this.maxZoom),
      minZoom: Number(this.minZoom),
      zoomControl: true,
      zoomControlOptions: {
          position: google.maps.ControlPosition.LEFT_BOTTOM
      },
    };

    // Only override the default if set.
    // We use getAttribute here because the default value of this.draggable = false even when not set.
    if (this.getAttribute('draggable') != null) {
      mapOptions.draggable = this.draggable;
    }

    for (let p in this.additionalMapOptions) {
      mapOptions[p] = this.additionalMapOptions[p];
    }

    return mapOptions;
  }

  _centerChanged (latitude, longitude) {
    if (latitude === undefined || longitude === undefined || !this.map) {
      return;
    }

    this.debounce('_centerChanged', () => {
      this.map.setCenter({
        lat: this.latitude,
        lng: this.longitude,
      });
    });
  }
}

xin.define('map-google', MapGoogle);

export default MapGoogle;
