import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { NavigationControl,Map } from 'maplibre-gl';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit  {

  constructor() { }
  @ViewChild('map')
  private mapContainer: ElementRef<HTMLElement>;

  private map: Map;
  ngAfterViewInit() {
    // This API key is for use only in stackblitz.com
    // Get your Geoapify API key on https://www.geoapify.com/get-started-with-maps-api
    // The Geoapify service is free for small projects and the development phase.
    const myAPIKey = '793f93202015411eaa6fceaeadaad99c';
    const mapStyle = 'https://maps.geoapify.com/v1/styles/osm-carto/style.json';

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

  }
 
}

