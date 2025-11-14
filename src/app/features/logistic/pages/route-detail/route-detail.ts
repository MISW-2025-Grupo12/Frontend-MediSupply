import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';

import { Maps } from '../../../../shared/components/maps/maps';
import { LogisticStore } from '../../state/logistic.store';
import { Route as LogisticRoute } from '../../../../shared/models/route.model';
import { Delivery } from '../../../../shared/models/delivery.model';
import { Warehouse } from '../../../../shared/models/warehouse.model';
import { Location } from '../../../../shared/models/location.model';
import { RouteComputationService } from '../../../../core/services/route-computation.service';
import { GoogleMapsLoaderService, GoogleRoute } from '../../../../core/services/google-maps-loader.service';
import { environment } from '../../../../../environments/environment';
import { UsersStore } from '../../../users/state/users.store';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';

type MapOriginMarker = {
  id: string;
  label: string;
  position: google.maps.LatLngLiteral;
};

@Component({
  selector: 'app-route-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoDirective, MatButtonModule, MatIconModule, DatePipe, Maps],
  templateUrl: './route-detail.html',
  styleUrl: './route-detail.scss'
})
export class RouteDetail implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly logisticStore = inject(LogisticStore);
  private readonly transloco = inject(TranslocoService);
  private readonly routeComputation = inject(RouteComputationService);
  private readonly googleMapsLoader = inject(GoogleMapsLoaderService);
  private readonly usersStore = inject(UsersStore);
  private readonly localeRouteService = inject(LocaleRouteService);

  private readonly googleMapsApiKey = environment.googleMapsApiKey?.trim() || null;
  private readonly requestedRouteId = signal<string | null>(null);
  private readonly visualizationToken = signal(0);
  private visualizedRouteId: string | null = null;

  readonly currentRoute = signal<LogisticRoute | null>(null);
  readonly mapDeliveries = signal<Delivery[]>([]);
  readonly mapRouteOrder = signal<Delivery['id'][] | null>(null);
  readonly mapRoutePath = signal<google.maps.LatLngLiteral[] | null>(null);
  readonly mapOrigin = signal<MapOriginMarker | null>(null);
  readonly mapWarningKey = signal<string | null>(null);
  readonly isComputingPath = signal(false);
  readonly hasRouteNotFound = signal(false);

  readonly isLoadingRoutes = computed(() => this.logisticStore.routesLoading());
  readonly routeError = computed(() => this.logisticStore.error());
  readonly totalDeliveries = computed(() => this.currentRoute()?.deliveries.length ?? 0);
  readonly driverId = computed(() => this.currentRoute()?.driverId ?? '');
  readonly warehouseName = computed(() => this.currentRoute()?.warehouse.name ?? '');
  readonly backLink = this.localeRouteService.getLocalizedUrl('logistic');
  readonly activeLanguage = computed(() => this.transloco.getActiveLang() ?? 'en');
  readonly driverUser = computed(() => {
    const driverId = this.currentRoute()?.driverId;

    if (!driverId) {
      return null;
    }

    const driverIdStr = String(driverId);
    return this.usersStore.deliveryUsers().find((user) => String(user.id) === driverIdStr) ?? null;
  });
  readonly driverDisplay = computed(() => {
    const driver = this.driverUser();

    if (driver?.name?.trim()) {
      return driver.name;
    }

    return this.shortId(this.currentRoute()?.driverId ?? '');
  });

  private readonly syncRouteEffect = effect(() => {
    const id = this.requestedRouteId();

    if (!id) {
      this.currentRoute.set(null);
      this.hasRouteNotFound.set(true);
      return;
    }

    const routes = this.logisticStore.routes();
    const found = routes.find((candidate) => String(candidate.id) === id);

    if (found) {
      this.hasRouteNotFound.set(false);
      this.currentRoute.set(found);
      this.mapDeliveries.set(found.deliveries ?? []);
      this.mapRouteOrder.set((found.deliveries ?? []).map((delivery) => delivery.id));

      if (this.visualizedRouteId !== String(found.id)) {
        this.visualizedRouteId = String(found.id);
        void this.prepareRouteVisualization(found);
      }

      return;
    }

    if (!this.logisticStore.routesLoading()) {
      this.currentRoute.set(null);
      this.mapDeliveries.set([]);
      this.mapRouteOrder.set(null);
      this.mapRoutePath.set(null);
      this.mapOrigin.set(null);
      this.hasRouteNotFound.set(true);
    }
  });

  ngOnInit(): void {
    const paramId = this.activatedRoute.snapshot.paramMap.get('id');

    if (paramId) {
      this.requestedRouteId.set(paramId);
    } else {
      this.hasRouteNotFound.set(true);
    }

    if (!this.logisticStore.routes().length && !this.logisticStore.routesLoading()) {
      this.logisticStore.loadRoutes();
    }

    if (!this.usersStore.deliveryUsers().length && !this.usersStore.isLoadingDeliveryUsers()) {
      this.usersStore.loadDeliveryUsers();
    }
  }

  private async prepareRouteVisualization(route: LogisticRoute): Promise<void> {
    const token = this.visualizationToken() + 1;
    this.visualizationToken.set(token);
    const deliveries = route.deliveries ?? [];

    this.mapWarningKey.set(null);
    this.mapRoutePath.set(null);
    this.mapOrigin.set(this.resolveExistingOrigin(route.warehouse));

    if (!deliveries.length) {
      return;
    }

    if (!this.googleMapsApiKey) {
      return;
    }

    this.isComputingPath.set(true);

    try {
      const warehouseLocation = await this.ensureWarehouseLocation(this.googleMapsApiKey, route.warehouse);

      if (!warehouseLocation) {
        this.mapWarningKey.set('logistic.routeDetail.map.missingWarehouseLocation');
      }

      const resolvedDeliveries = await this.resolveDeliveriesLocations(this.googleMapsApiKey, deliveries);

      if (!resolvedDeliveries.length) {
        this.mapWarningKey.set('logistic.routeDetail.map.missingLocations');
        return;
      }

      if (resolvedDeliveries.length !== deliveries.length) {
        this.mapWarningKey.set('logistic.routeDetail.map.partialLocations');
      }

      if (!warehouseLocation) {
        return;
      }

      const waypoints: Location[] = [warehouseLocation, ...resolvedDeliveries.map((item) => item.location)];
      const routeResponse = await this.googleMapsLoader.computeRouteWithWaypoints(this.googleMapsApiKey, waypoints);
      const path = this.extractRoutePath(routeResponse);

      if (!path.length) {
        this.mapWarningKey.set('logistic.routeDetail.map.unableToBuildPath');
        return;
      }

      if (token !== this.visualizationToken()) {
        return;
      }

      this.mapRoutePath.set(path);
      this.mapOrigin.set(this.toOriginMarker(route.warehouse, warehouseLocation));
    } catch (error) {
      console.error('Failed to compose route path for route detail view.', error);
      this.mapWarningKey.set('logistic.routeDetail.map.unableToBuildPath');
    } finally {
      this.isComputingPath.set(false);
    }
  }

  private resolveExistingOrigin(warehouse: Warehouse): MapOriginMarker | null {
    if (!this.isValidLocation(warehouse.location)) {
      return null;
    }

    return this.toOriginMarker(warehouse, warehouse.location);
  }

  private async resolveDeliveriesLocations(
    apiKey: string,
    deliveries: Delivery[]
  ): Promise<Array<{ delivery: Delivery; location: Location }>> {
    const resolved = await Promise.all(
      deliveries.map(async (delivery) => {
        const location = await this.routeComputation.ensureDeliveryLocation(apiKey, delivery, {
          updateDeliveryLocation: (deliveryId, deliveryLocation) =>
            this.logisticStore.updateDeliveryLocation(deliveryId, deliveryLocation),
          getDeliveryById: (deliveryId) =>
            this.logisticStore.deliveries().find((candidate) => candidate.id === deliveryId)
        });

        if (!location) {
          return null;
        }

        return { delivery, location };
      })
    );

    return resolved.filter((item): item is { delivery: Delivery; location: Location } => item !== null);
  }

  private async ensureWarehouseLocation(apiKey: string, warehouse: Warehouse): Promise<Location | null> {
    if (this.isValidLocation(warehouse.location)) {
      return warehouse.location;
    }

    const address = warehouse.address?.trim();

    if (!address) {
      console.warn(`Warehouse "${warehouse.id}" is missing an address. Location cannot be determined.`);
      return null;
    }

    const geoLocation = await this.googleMapsLoader.geocodeAddress(apiKey, address);

    if (!geoLocation) {
      return null;
    }

    const location: Location = {
      latitude: geoLocation.lat,
      longitude: geoLocation.lng
    };

    this.logisticStore.updateWarehouseLocation(warehouse.id, location);

    return location;
  }

  private extractRoutePath(route: GoogleRoute | null): google.maps.LatLngLiteral[] {
    if (!route) {
      return [];
    }

    const directPath = this.toLatLngLiteralPath(route.path);

    if (directPath.length) {
      return directPath;
    }

    const combined: google.maps.LatLngLiteral[] = [];

    if (Array.isArray(route.legs)) {
      for (const leg of route.legs) {
        const legPath = this.toLatLngLiteralPath(leg?.path);

        if (!legPath.length) {
          continue;
        }

        if (!combined.length) {
          combined.push(...legPath);
        } else {
          combined.push(...legPath.slice(1));
        }
      }
    }

    if (combined.length) {
      return combined;
    }

    if (route.polyline?.encodedPolyline) {
      return this.decodePolyline(route.polyline.encodedPolyline);
    }

    return [];
  }

  private toLatLngLiteralPath(path: Array<google.maps.LatLng | google.maps.LatLngLiteral> | undefined): google.maps.LatLngLiteral[] {
    if (!Array.isArray(path) || !path.length) {
      return [];
    }

    const literals: google.maps.LatLngLiteral[] = [];

    for (const point of path) {
      const literal = this.normalizeLatLng(point);

      if (!literal) {
        continue;
      }

      if (!literals.length || literal.lat !== literals[literals.length - 1].lat || literal.lng !== literals[literals.length - 1].lng) {
        literals.push(literal);
      }
    }

    return literals;
  }

  private decodePolyline(encoded: string | undefined): google.maps.LatLngLiteral[] {
    if (!encoded) {
      return [];
    }

    const coordinates: google.maps.LatLngLiteral[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let result = 0;
      let shift = 0;
      let byte: number;

      do {
        if (index >= encoded.length) {
          break;
        }

        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = (result & 1) ? ~(result >> 1) : result >> 1;
      lat += deltaLat;

      result = 0;
      shift = 0;

      do {
        if (index >= encoded.length) {
          break;
        }

        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = (result & 1) ? ~(result >> 1) : result >> 1;
      lng += deltaLng;

      coordinates.push({
        lat: lat * 1e-5,
        lng: lng * 1e-5
      });
    }

    return coordinates;
  }

  private toOriginMarker(warehouse: Warehouse, location: Location | null): MapOriginMarker | null {
    if (!location) {
      return null;
    }

    return {
      id: warehouse.id,
      label: warehouse.name,
      position: this.toLatLngLiteral(location)
    };
  }

  private toLatLngLiteral(location: Location): google.maps.LatLngLiteral {
    return {
      lat: location.latitude,
      lng: location.longitude
    };
  }

  private normalizeLatLng(value: google.maps.LatLng | google.maps.LatLngLiteral | null | undefined): google.maps.LatLngLiteral | null {
    if (!value) {
      return null;
    }

    if (value instanceof google.maps.LatLng) {
      const json = value.toJSON();

      return { lat: json.lat, lng: json.lng };
    }

    if (
      typeof value.lat === 'number' &&
      typeof value.lng === 'number' &&
      Number.isFinite(value.lat) &&
      Number.isFinite(value.lng)
    ) {
      return { lat: value.lat, lng: value.lng };
    }

    return null;
  }

  private isValidLocation(value: Location | null | undefined): value is Location {
    return (
      typeof value?.latitude === 'number' &&
      Number.isFinite(value.latitude) &&
      typeof value.longitude === 'number' &&
      Number.isFinite(value.longitude)
    );
  }

  shortId(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    const id = String(value);
    return id.length <= 6 ? id : id.slice(-6);
  }
}
