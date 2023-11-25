import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import maplibregl, { Map, NavigationControl } from 'maplibre-gl';
import { Observable, Subscriber } from 'rxjs';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  map: any;



  constructor() { }
  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;
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
  private loadMap(): void {
    const myAPIKey = '165c18e3661c43e9893446644364cbbb';
    const mapStyle = 'https://maps.geoapify.com/v1/styles/osm-liberty/style.json';

    const initialState = {
      lng: 2.213749,
      lat: 46.227638,
      zoom: 5,
    };

    const map = new Map({
      container: this.mapContainer.nativeElement,
      style: `${mapStyle}?apiKey=${myAPIKey}`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
    });
    map.addControl(new maplibregl.NavigationControl({}));

  }

  ngAfterViewInit() {
    this.getCurrentPosition()
    this.loadMap()
  }
}

