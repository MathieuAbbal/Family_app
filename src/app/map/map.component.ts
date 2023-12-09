import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import maplibregl from 'maplibre-gl';
import { NavigationControl, Map } from 'maplibre-gl';
import { Observable, Subscriber } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  constructor() { }
  @ViewChild('map')
  private mapContainer: ElementRef<HTMLElement>;

  private map: Map;

  private getCurrentPosition(): any {
    return new Observable((observer: Subscriber<any>) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position: any) => {
          observer.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          observer.complete();
        });
      } else {
        observer.error();
      }
    });
  }

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

    this.map.addControl(new maplibregl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true
    }));
    // Initialize the geolocate control.
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
  }

}

