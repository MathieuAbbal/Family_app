import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import maplibregl from 'maplibre-gl';
import { Map } from 'maplibre-gl';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';


@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  constructor() { }
  @ViewChild('map')
  private mapContainer: ElementRef<HTMLElement>;

  private map: Map;


  private geocoderApi = {
    forwardGeocode: async (config) => {
      const features = [];
      try {
        const request =
          `https://nominatim.openstreetmap.org/search?q=${config.query
          }&format=geojson&polygon_geojson=1&addressdetails=1`;
        const response = await fetch(request);
        const geojson = await response.json();
        for (const feature of geojson.features) {
          const center = [
            feature.bbox[0] +
            (feature.bbox[2] - feature.bbox[0]) / 2,
            feature.bbox[1] +
            (feature.bbox[3] - feature.bbox[1]) / 2
          ];
          const point = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: center
            },
            place_name: feature.properties.display_name,
            properties: feature.properties,
            text: feature.properties.display_name,
            place_type: ['place'],
            center
          };
          features.push(point);
        }
      } catch (e) {
        console.error(`Failed to forwardGeocode with error: ${e}`);
      }

      return {
        features
      };
    }
  };
  ngAfterViewInit() {
    // Get your Geoapify API key on https://www.geoapify.com/get-started-with-maps-api
    // The Geoapify service is free for small projects and the development phase.
    const myAPIKey = '793f93202015411eaa6fceaeadaad99c';
    const mapStyle = 'https://maps.geoapify.com/v1/styles/maptiler-3d/style.json';

    const initialState = {
      lng: 2.213749,
      lat: 46.227638,
      zoom: 5,
    };

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: `${mapStyle}?apiKey=${myAPIKey}`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
    });
    //control navigation
    this.map.addControl(new maplibregl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true
    }));
    //control fullscreen
    this.map.addControl(new maplibregl.FullscreenControl());
    //control geolocate
    let geolocate = new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserLocation: true
    });
    // Add the control to the map.
    this.map.addControl(geolocate);
    // when a geolocate event occurs.
    geolocate.on('geolocate', function () {
      console.log('A geolocate event has occurred.')
    });
    geolocate.trigger();
    //control geocoder
    this.map.addControl(
      new MaplibreGeocoder(this.geocoderApi, {
        maplibregl
      }),
      'top-left'
    );
    let style: {
      version: 8,
      sources: {
          osm: {
              type: 'raster',
              tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap Contributors',
              maxzoom: 19
          },
          // Use a different source for terrain and hillshade layers, to improve render quality
          terrainSource: {
              type: 'raster-dem',
              url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
              tileSize: 256
          },
          hillshadeSource: {
              type: 'raster-dem',
              url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
              tileSize: 256
          }
      },
      layers: [
          {
              id: 'osm',
              type: 'raster',
              source: 'osm'
          },
          {
              id: 'hills',
              type: 'hillshade',
              source: 'hillshadeSource',
              layout: {visibility: 'visible'},
              paint: {'hillshade-shadow-color': '#473B24'}
          }
      ],
      terrain: {
          source: 'terrainSource',
          exaggeration: 1
      }
  }




  }

}

