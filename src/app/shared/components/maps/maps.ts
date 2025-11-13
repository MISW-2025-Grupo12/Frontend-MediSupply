import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
  input,
  signal,
  computed,
  effect
} from '@angular/core';
import { Delivery } from '../../models/delivery.model';
import type { Location } from '../../models/location.model';
import { GoogleMapsLoaderService, GoogleMapsModules } from '../../../core/services/google-maps-loader.service';
import { environment } from '../../../../environments/environment';

type MapError = 'missingKey' | 'loadFailure';

type MapOrigin = {
  id: string;
  label?: string;
  position: google.maps.LatLngLiteral;
};

@Component({
  selector: 'app-maps',
  standalone: true,
  templateUrl: './maps.html',
  styleUrl: './maps.scss'
})
export class Maps implements OnInit, AfterViewInit {
  private readonly googleMapsLoader = inject(GoogleMapsLoaderService);

  @ViewChild('mapContainer', { static: false })
  private mapContainer?: ElementRef<HTMLDivElement>;

  readonly deliveries = input<Delivery[]>([], { alias: 'deliveries' });
  readonly ariaLabel = input('Mapa de entregas seleccionadas');
  readonly loadingMessage = input('Cargando mapa...');
  readonly loadErrorMessage = input('No fue posible cargar el mapa.');
  readonly emptyMessage = input('No hay entregas seleccionadas.');
  readonly missingKeyMessage = input('La clave de Google Maps no está configurada.');
  readonly routePath = input<google.maps.LatLngLiteral[] | null>(null, { alias: 'routePath' });
  readonly routeOrder = input<Delivery['id'][] | null>(null, { alias: 'routeOrder' });
  readonly origin = input<MapOrigin | null>(null, { alias: 'origin' });

  readonly isMapConfigured = !!environment.googleMapsApiKey;
  readonly isMapLoading = signal(false);
  readonly mapError = signal<MapError | null>(null);
  private readonly mapApiLoaded = signal(false);
  private map?: google.maps.Map;
  private geocoder?: google.maps.Geocoder;
  private markers: Array<google.maps.marker.AdvancedMarkerElement | google.maps.Marker> = [];
  private routePolyline?: google.maps.Polyline;
  private originMarker: google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null = null;
  private readonly addressLocationCache = new Map<string, google.maps.LatLngLiteral>();
  private readonly deliveryLocationCache = new Map<Delivery['id'], google.maps.LatLngLiteral>();
  private markerRenderCycle = 0;
  private readonly fallbackCenter: google.maps.LatLngLiteral = { lat: 4.710989, lng: -74.07209 };
  private mapsModules?: GoogleMapsModules;
  private readonly singleMarkerMaxZoom = 13;
  private hasWarnedMissingMapId = false;

  private readonly syncMarkers = effect(() => {
    const deliveries = this.deliveries();
    this.routeOrder();
    const origin = this.origin();
    const isReady = this.mapApiLoaded();

    if (!isReady || !this.map) {
      return;
    }

    void this.updateMarkers(deliveries, origin);
  });

  private readonly syncRoutePath = effect(() => {
    const path = this.routePath();
    const isReady = this.mapApiLoaded();

    if (!isReady || !this.map) {
      return;
    }

    this.updateRoutePolyline(path);
  });

  readonly hasDeliveries = computed(() => this.deliveries().length > 0);

  ngOnInit(): void {
    if (!this.isMapConfigured) {
      console.warn('Google Maps API key is not configured.');
      this.mapError.set('missingKey');
      return;
    }

    this.isMapLoading.set(true);
    this.googleMapsLoader
      .load(environment.googleMapsApiKey)
      .then((modules) => {
        this.mapsModules = modules;
        this.mapApiLoaded.set(true);
        this.isMapLoading.set(false);
        void this.tryInitializeMap();
      })
      .catch((error) => {
        console.error('Failed to load Google Maps script', error);
        this.isMapLoading.set(false);
        this.mapError.set('loadFailure');
      });
  }

  ngAfterViewInit(): void {
    void this.tryInitializeMap();
  }

  private async tryInitializeMap(): Promise<void> {
    if (!this.mapApiLoaded() || this.map || !this.mapContainer?.nativeElement || !this.mapsModules) {
      return;
    }

    try {
      const MapConstructor = this.mapsModules.maps.Map;
      const mapId = environment.googleMapsMapId?.trim();

      if (this.mapsModules.marker?.AdvancedMarkerElement && !mapId && !this.hasWarnedMissingMapId) {
        console.warn('Google Maps advanced markers require a valid mapId. Set environment.googleMapsMapId to enable them.');
        this.hasWarnedMissingMapId = true;
      }

      const mapOptions: google.maps.MapOptions = {
        center: this.fallbackCenter,
        zoom: 6,
        gestureHandling: 'greedy',
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        mapId: mapId || undefined
      };

      if (!mapOptions.mapId) {
        mapOptions.styles = [
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }]
          }
        ];
      }

      this.map = new MapConstructor(this.mapContainer.nativeElement, mapOptions);

      if (!this.geocoder) {
        const GeocoderConstructor = this.mapsModules.geocoding?.Geocoder ?? google.maps.Geocoder;
        this.geocoder = new GeocoderConstructor();
      }

      await this.updateMarkers(this.deliveries(), this.origin());
    } catch (error) {
      console.error('Failed to initialize Google Maps', error);
      this.mapError.set('loadFailure');
    }
  }

  private clearMarkers(): void {
    for (const marker of this.markers) {
      if (marker instanceof google.maps.Marker) {
        marker.setMap(null);
      } else {
        marker.map = null;
      }
    }

    this.markers = [];
  }

  private clearOriginMarker(): void {
    if (!this.originMarker) {
      return;
    }

    if (this.originMarker instanceof google.maps.Marker) {
      this.originMarker.setMap(null);
    } else {
      this.originMarker.map = null;
    }

    this.originMarker = null;
  }

  private updateOriginMarker(origin: MapOrigin | null, bounds: google.maps.LatLngBounds): void {
    if (!this.map || !origin?.position) {
      return;
    }

    this.clearOriginMarker();

    const marker = this.createOriginMarker(origin.position, origin.label ?? origin.id);

    this.originMarker = marker;
    bounds.extend(origin.position);
  }

  private async updateMarkers(deliveries: Delivery[], origin: MapOrigin | null): Promise<void> {
    if (!this.map) {
      return;
    }

    const renderCycle = ++this.markerRenderCycle;

    this.clearMarkers();
    this.clearOriginMarker();

    const bounds = new google.maps.LatLngBounds();
    const routeOrder = this.routeOrder();
    const routeOrderMap = this.buildRouteOrderMap(routeOrder);

    if (!deliveries.length) {
      if (origin?.position) {
        this.updateOriginMarker(origin, bounds);

        if (!bounds.isEmpty()) {
          this.map.fitBounds(bounds);
        } else {
          this.map.setCenter(origin.position);
          this.map.setZoom(12);
        }
      } else {
        this.map.setCenter(this.fallbackCenter);
        this.map.setZoom(12);
      }

      return;
    }

    for (const delivery of deliveries) {
      const location = await this.resolveDeliveryPosition(delivery);

      if (renderCycle !== this.markerRenderCycle) {
        return;
      }

      if (!location) {
        continue;
      }

      const marker = this.createMarker(location, delivery.id, routeOrderMap.get(delivery.id));

      this.markers.push(marker);
      bounds.extend(location);
    }

    if (origin?.position) {
      this.updateOriginMarker(origin, bounds);
    }

    const hasRoutePath = !!this.routePath()?.length;

    if (!hasRoutePath) {
      if (this.markers.length && !bounds.isEmpty()) {
        this.map.fitBounds(bounds);

        if (this.markers.length === 1) {
          const currentZoom = this.map.getZoom();

          if (typeof currentZoom === 'number' && currentZoom > this.singleMarkerMaxZoom) {
            this.map.setZoom(this.singleMarkerMaxZoom);
          }
        }
      } else {
        this.map.setCenter(this.fallbackCenter);
        this.map.setZoom(12);
      }
    }

    if (hasRoutePath) {
      this.updateRoutePolyline(this.routePath());
    }
  }

  private updateRoutePolyline(path: google.maps.LatLngLiteral[] | null): void {
    if (!this.map) {
      return;
    }

    if (!path?.length) {
      if (this.routePolyline) {
        this.routePolyline.setMap(null);
        this.routePolyline = undefined;
      }

      return;
    }

    if (!this.routePolyline) {
      this.routePolyline = new google.maps.Polyline({
        map: this.map,
        path,
        strokeColor: '#1a73e8',
        strokeOpacity: 0.8,
        strokeWeight: 4
      });
    } else {
      this.routePolyline.setPath(path);
      this.routePolyline.setMap(this.map);
    }

    const bounds = new google.maps.LatLngBounds();

    for (const point of path) {
      bounds.extend(point);
    }

    for (const marker of this.markers) {
      const position = this.getMarkerPosition(marker);

      if (position) {
        bounds.extend(position);
      }
    }

    if (this.originMarker) {
      const originPosition = this.getMarkerPosition(this.originMarker);

      if (originPosition) {
        bounds.extend(originPosition);
      }
    }

    if (!bounds.isEmpty()) {
      this.map.fitBounds(bounds);
    }
  }

  private getMarkerPosition(
    marker: google.maps.marker.AdvancedMarkerElement | google.maps.Marker
  ): google.maps.LatLng | google.maps.LatLngLiteral | null {
    if (marker instanceof google.maps.Marker) {
      const position = marker.getPosition();

      return position ?? null;
    }

    const { position } = marker;

    if (!position) {
      return null;
    }

    if (position instanceof google.maps.LatLng) {
      return position;
    }

    return {
      lat: position.lat,
      lng: position.lng
    };
  }

  private async resolveLocation(address: string | null | undefined): Promise<google.maps.LatLngLiteral | null> {
    if (!address?.trim()) {
      return null;
    }

    const cached = this.addressLocationCache.get(address);

    if (cached) {
      return cached;
    }

    if (!this.geocoder) {
      const GeocoderConstructor = this.mapsModules?.geocoding?.Geocoder ?? google.maps.Geocoder;
      this.geocoder = new GeocoderConstructor();
    }

    return new Promise<google.maps.LatLngLiteral | null>((resolve) => {
      this.geocoder!.geocode(
        { address },
        (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === 'OK' && results?.[0]?.geometry?.location) {
          const location = results[0].geometry.location.toJSON();

          this.addressLocationCache.set(address, location);
          resolve(location);
          return;
        }

        console.warn(`Unable to geocode address "${address}". Status: ${status}`);
        resolve(null);
      });
    });
  }

  private createMarker(
    position: google.maps.LatLngLiteral,
    deliveryId: Delivery['id'],
    routeIndex: number | undefined
  ) {
    const label = typeof routeIndex === 'number' ? String(routeIndex + 1) : undefined;

    if (this.mapsModules?.marker?.AdvancedMarkerElement) {
      const options: google.maps.marker.AdvancedMarkerElementOptions = {
        map: this.map,
        position,
        title: String(deliveryId)
      };

      if (label) {
        options.content = this.createAdvancedMarkerContent(label);
      }

      return new this.mapsModules.marker.AdvancedMarkerElement(options);
    }

    return new google.maps.Marker({
      position,
      map: this.map,
      title: String(deliveryId),
      label
    });
  }

  private createOriginMarker(
    position: google.maps.LatLngLiteral,
    label: string
  ): google.maps.marker.AdvancedMarkerElement | google.maps.Marker {
    const title = label?.trim() ? label.trim() : 'Warehouse';
    const displayLabel = title.charAt(0).toUpperCase() || 'W';

    if (this.mapsModules?.marker?.AdvancedMarkerElement) {
      const options: google.maps.marker.AdvancedMarkerElementOptions = {
        map: this.map,
        position,
        title
      };

      options.content = this.createOriginAdvancedMarkerContent(displayLabel);

      return new this.mapsModules.marker.AdvancedMarkerElement(options);
    }

    const icon: google.maps.Symbol = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: '#0f9d58',
      fillOpacity: 1,
      strokeColor: '#0b8043',
      strokeWeight: 2
    };

    return new google.maps.Marker({
      position,
      map: this.map,
      title,
      label: {
        text: displayLabel,
        color: '#ffffff',
        fontWeight: '600'
      },
      icon
    });
  }

  private buildRouteOrderMap(routeOrder: Delivery['id'][] | null): Map<Delivery['id'], number> {
    const map = new Map<Delivery['id'], number>();

    if (!routeOrder?.length) {
      return map;
    }

    routeOrder.forEach((deliveryId, index) => {
      map.set(deliveryId, index);
    });

    return map;
  }

  private createAdvancedMarkerContent(label: string): HTMLElement {
    const container = document.createElement('div');

    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.width = '32px';
    container.style.height = '32px';
    container.style.borderRadius = '16px';
    container.style.backgroundColor = '#1a73e8';
    container.style.color = '#fff';
    container.style.fontWeight = '600';
    container.style.fontSize = '14px';
    container.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';

    container.textContent = label;

    return container;
  }

  private createOriginAdvancedMarkerContent(label: string): HTMLElement {
    const container = document.createElement('div');

    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.width = '36px';
    container.style.height = '36px';
    container.style.borderRadius = '18px';
    container.style.backgroundColor = '#0f9d58';
    container.style.color = '#fff';
    container.style.fontWeight = '600';
    container.style.fontSize = '14px';
    container.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
    container.style.border = '2px solid #0b8043';

    container.textContent = label;

    return container;
  }

  private async resolveDeliveryPosition(delivery: Delivery): Promise<google.maps.LatLngLiteral | null> {
    const cachedById = this.deliveryLocationCache.get(delivery.id);

    if (cachedById) {
      return cachedById;
    }

    const modelLocation = this.toLatLngLiteralFromModel(delivery.location);

    if (modelLocation) {
      this.deliveryLocationCache.set(delivery.id, modelLocation);
      return modelLocation;
    }

    const geocoded = await this.resolveLocation(delivery.address);

    if (geocoded) {
      this.deliveryLocationCache.set(delivery.id, geocoded);
    }

    return geocoded;
  }

  private toLatLngLiteralFromModel(location: Location | null | undefined): google.maps.LatLngLiteral | null {
    if (!this.isValidLocation(location)) {
      return null;
    }

    return {
      lat: location.latitude,
      lng: location.longitude
    };
  }

  private isValidLocation(value: Location | null | undefined): value is Location {
    return (
      typeof value?.latitude === 'number' &&
      Number.isFinite(value.latitude) &&
      typeof value.longitude === 'number' &&
      Number.isFinite(value.longitude)
    );
  }
}
