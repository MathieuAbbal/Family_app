import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import maplibregl from 'maplibre-gl';
import { Map, Marker, Popup } from 'maplibre-gl';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import { LocationService, UserLocation } from '../services/location.service';
import { auth } from '../firebase';


@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnDestroy {

  @ViewChild('map')
  private mapContainer: ElementRef<HTMLElement>;
  private map: Map;
  private markers: Record<string, Marker> = {};
  private unsubscribeLocations: (() => void) | null = null;
  private centeredOnSelf = false;

  constructor(private locationService: LocationService) {}

  private geocoderApi = {
    forwardGeocode: async (config: any) => {
      const features: any[] = [];
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
        type: "FeatureCollection" as const,
        features
      };
    }
  };

  ngAfterViewInit() {
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
    this.map.addControl(new maplibregl.FullscreenControl());

    this.map.addControl(
      new MaplibreGeocoder(this.geocoderApi, { maplibregl }),
      'top-left'
    );

    // Start tracking current user's location to Firebase
    this.locationService.startTracking();

    // Listen for all family members (including self) after map loads
    this.map.on('load', () => {
      this.unsubscribeLocations = this.locationService.listenAllLocations((locations) => {
        this.updateFamilyMarkers(locations);
        // Center on self on first load
        const myUid = auth.currentUser?.uid;
        if (myUid && locations[myUid] && !this.centeredOnSelf) {
          this.map.flyTo({ center: [locations[myUid].lng, locations[myUid].lat], zoom: 14 });
          this.centeredOnSelf = true;
        }
      });
    });
  }

  private updateFamilyMarkers(locations: Record<string, UserLocation>): void {
    const currentUid = auth.currentUser?.uid;
    const activeUids = new Set<string>();

    for (const [uid, loc] of Object.entries(locations)) {
      activeUids.add(uid);
      const isSelf = uid === currentUid;

      if (this.markers[uid]) {
        this.markers[uid].setLngLat([loc.lng, loc.lat]);
        this.markers[uid].getPopup()?.setHTML(this.buildPopupHtml(loc));
      } else {
        const el = document.createElement('div');
        el.className = 'family-marker';
        const borderColor = isSelf ? '#3b82f6' : '#ec4899';
        el.style.cssText = `width:40px;height:40px;border-radius:50%;border:3px solid ${borderColor};overflow:hidden;background:#fff;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.3);`;
        if (loc.photoURL) {
          const img = document.createElement('img');
          img.src = loc.photoURL;
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
          img.referrerPolicy = 'no-referrer';
          el.appendChild(img);
        } else {
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.fontSize = '14px';
          el.style.fontWeight = 'bold';
          el.style.color = '#ec4899';
          el.textContent = (loc.displayName || '?')[0].toUpperCase();
        }

        const popup = new Popup({ offset: 25 }).setHTML(this.buildPopupHtml(loc));

        this.markers[uid] = new Marker({ element: el })
          .setLngLat([loc.lng, loc.lat])
          .setPopup(popup)
          .addTo(this.map);
      }
    }

    // Remove markers for users no longer in locations
    for (const uid of Object.keys(this.markers)) {
      if (!activeUids.has(uid)) {
        this.markers[uid].remove();
        delete this.markers[uid];
      }
    }
  }

  private buildPopupHtml(loc: UserLocation): string {
    const date = new Date(loc.timestamp);
    const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return `<div style="font-family:sans-serif;text-align:center;">
      <strong>${loc.displayName || 'Membre'}</strong><br>
      <span style="color:#888;font-size:12px;">${time}</span>
    </div>`;
  }

  ngOnDestroy(): void {
    this.locationService.stopTracking();
    if (this.unsubscribeLocations) {
      this.unsubscribeLocations();
    }
    Object.values(this.markers).forEach(m => m.remove());
  }
}
