import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@ngneat/transloco';
import { LogisticStore } from '../../state/logistic.store';
import { UnassignedDeliveries } from '../../ui/unassigned-deliveries/unassigned-deliveries';
import { Delivery } from '../../../../shared/models/delivery.model';
import { Location } from '../../../../shared/models/location.model';
import { CreateRoute } from '../../../../shared/models/createRoute.model';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Maps } from '../../../../shared/components/maps/maps';
import { GoogleMapsLoaderService, GoogleRoute } from '../../../../core/services/google-maps-loader.service';
import { environment } from '../../../../../environments/environment';

type DeliveryRouteNode = {
  delivery: Delivery;
  location: Location;
};

type RouteSegment = {
  distance: number;
  path?: google.maps.LatLngLiteral[];
};

type OptimalRoute = {
  order: DeliveryRouteNode[];
  totalDistance: number;
};

@Component({
  selector: 'app-add-route',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslocoDirective,
    UnassignedDeliveries,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule,
    Maps
  ],
  templateUrl: './add-route.html',
  styleUrl: './add-route.scss'
})
export class AddRoute implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly logisticStore = inject(LogisticStore);
  private readonly googleMapsLoader = inject(GoogleMapsLoaderService);
  private readonly googleMapsApiKey = environment.googleMapsApiKey;
  private readonly populatingDeliveryLocations = new Map<Delivery['id'], Promise<Location | null>>();

  readonly routeForm = this.fb.group({
    date: this.fb.control<Date | null>(null, { validators: Validators.required }),
    driverId: this.fb.control<string>('', { validators: Validators.required, nonNullable: true }),
    deliveries: this.fb.control<Delivery[]>([], { validators: Validators.required, nonNullable: true })
  });

  readonly deliveries = this.logisticStore.deliveries;
  readonly isLoading = this.logisticStore.isLoading;
  readonly error = this.logisticStore.error;
  readonly selectedDeliveryIds = signal<Delivery['id'][]>([]);
  private readonly routeDate = signal<Date | null>(null);
  readonly isCalculatingRoutes = signal(false);
  readonly calculatedRoutePath = signal<google.maps.LatLngLiteral[] | null>(null);
  readonly calculatedRouteOrder = signal<Delivery['id'][] | null>(null);

  readonly selectedDeliveries = computed(() => {
    const selectedIds = new Set(this.selectedDeliveryIds());

    return this.deliveries().filter((delivery) => selectedIds.has(delivery.id));
  });
  readonly selectedDeliveriesCount = computed(() => this.selectedDeliveries().length);
  readonly availableDeliveries = computed(() => {
    const selectedIds = new Set(this.selectedDeliveryIds());
    const routeDate = this.routeDate();

    return this.deliveries().filter((delivery) => {
      if (selectedIds.has(delivery.id)) {
        return false;
      }

      if (!routeDate) {
        return true;
      }

      const deliveryDate = this.getDateOnly(delivery.deliveryDate);

      return deliveryDate ? this.isSameDay(deliveryDate, routeDate) : false;
    });
  });
  private readonly syncSelectedDeliveries = effect(() => {
    const deliveries = this.selectedDeliveries();

    this.routeForm.controls.deliveries.setValue(deliveries, { emitEvent: false });
  });

  ngOnInit(): void {
    this.routeForm.controls.date.disable({ emitEvent: false });

    if (!this.deliveries().length) {
      this.logisticStore.loadMockDeliveries();
    }
  }

  async onCalculateRoutes(): Promise<void> {
    if (this.isCalculatingRoutes()) {
      return;
    }

    const apiKey = this.googleMapsApiKey?.trim();

    if (!apiKey) {
      console.warn('Cannot compute routes without a Google Maps API key.');
      return;
    }

    const deliveries = this.selectedDeliveries();

    if (deliveries.length < 2) {
      console.warn('Select at least two deliveries to compute routes.');
      this.resetCalculatedRoute();
      return;
    }

    this.isCalculatingRoutes.set(true);
    this.resetCalculatedRoute();

    try {
      const nodes: DeliveryRouteNode[] = [];

      for (const delivery of deliveries) {
        const location = await this.ensureDeliveryLocation(delivery);

        if (!location) {
          console.warn(`Skipping delivery "${delivery.id}" because its location could not be determined.`);
          continue;
        }

        nodes.push({ delivery, location });
      }

      if (nodes.length < 2) {
        console.warn('Unable to compute routes because fewer than two deliveries have valid locations.');
        return;
      }

      const routeSegments = await this.buildRouteSegments(apiKey, nodes);

      if (!routeSegments.size) {
        console.warn('Unable to compute routes: no paths were returned for the selected deliveries.');
        return;
      }

      const optimalRoute = this.findOptimalRoute(nodes, routeSegments);

      if (!optimalRoute) {
        console.warn('Unable to compute an optimal route with the available data.');
        return;
      }

      const routePath = await this.resolveRenderedRoutePath(apiKey, optimalRoute, routeSegments);

      if (!routePath?.length) {
        console.warn('Unable to render the computed route because no path coordinates were available.');
        return;
      }

      const orderedIds = optimalRoute.order.map((node) => node.delivery.id);

      this.calculatedRouteOrder.set(orderedIds);
      this.calculatedRoutePath.set(routePath);
      console.info('Optimal delivery route computed.', {
        orderedDeliveries: optimalRoute.order.map((node) => node.delivery.id),
        totalDistanceMeters: optimalRoute.totalDistance
      });
    } catch (error) {
      console.error('Failed to compute routes between deliveries.', error);
    } finally {
      this.isCalculatingRoutes.set(false);
    }
  }

  async onDeliveryToggled(delivery: Delivery): Promise<void> {
    const current = this.selectedDeliveryIds();
    const exists = current.includes(delivery.id);
    const deliveryDate = this.getDateOnly(delivery.deliveryDate);

    this.resetCalculatedRoute();

    if (!deliveryDate) {
      return;
    }

    if (exists) {
      const updated = current.filter((id) => id !== delivery.id);

      this.selectedDeliveryIds.set(updated);

      if (!updated.length) {
        this.routeDate.set(null);
        this.routeForm.controls.date.setValue(null, { emitEvent: false });
      }

      return;
    }

    const routeDate = this.routeDate();

    if (routeDate && !this.isSameDay(routeDate, deliveryDate)) {
      return;
    }

    if (!routeDate) {
      this.routeDate.set(deliveryDate);
      this.routeForm.controls.date.setValue(deliveryDate, { emitEvent: false });
    }

    this.selectedDeliveryIds.set([...current, delivery.id]);

    await this.tryPopulateDeliveryLocation(delivery);
  }

  onSubmit(): void {
    if (this.routeForm.valid) {
      const { date, driverId, deliveries } = this.routeForm.getRawValue();
      const payload: CreateRoute = {
        date: date ? date.toISOString().split('T')[0] : '',
        driverId,
        deliveries
      };
      console.info('Route draft', payload);
    }
  }

  private async buildRouteSegments(apiKey: string, nodes: DeliveryRouteNode[]): Promise<Map<string, RouteSegment>> {
    const segments = new Map<string, RouteSegment>();

    for (const origin of nodes) {
      for (const destination of nodes) {
        if (origin.delivery.id === destination.delivery.id) {
          continue;
        }

        const key = this.composeRouteCacheKey(origin.delivery.id, destination.delivery.id);

        if (segments.has(key)) {
          continue;
        }

        try {
          const routes = await this.googleMapsLoader.computeRoutesBetween(
            apiKey,
            origin.location,
            destination.location
          );
          const primaryRoute = routes?.[0] as GoogleRoute | undefined;

          if (!primaryRoute) {
            console.warn(
              `No route returned between deliveries "${origin.delivery.id}" and "${destination.delivery.id}".`
            );
            continue;
          }

          const segment = this.buildRouteSegmentFromResponse(primaryRoute, origin.location, destination.location);

          if (!segment) {
            console.warn(
              `Route between deliveries "${origin.delivery.id}" and "${destination.delivery.id}" is missing required data.`
            );
            continue;
          }

          segments.set(key, segment);
        } catch (error) {
          console.error(
            `Failed to calculate route between deliveries "${origin.delivery.id}" and "${destination.delivery.id}".`,
            error
          );
        }
      }
    }

    return segments;
  }

  private composeRouteCacheKey(originId: Delivery['id'], destinationId: Delivery['id']): string {
    return `${originId}::${destinationId}`;
  }

  private buildRouteSegmentFromResponse(
    route: GoogleRoute,
    origin: Location,
    destination: Location
  ): RouteSegment | null {
    const distance = this.resolveRouteDistance(route);

    if (typeof distance !== 'number' || !Number.isFinite(distance)) {
      return null;
    }

    let path = this.resolveRoutePath(route);

    if (!path.length) {
      path = [this.toLatLngLiteral(origin), this.toLatLngLiteral(destination)];
    }

    return {
      distance,
      path
    };
  }

  private resolveRouteDistance(route: GoogleRoute): number | null {
    if (typeof route.distanceMeters === 'number' && Number.isFinite(route.distanceMeters)) {
      return route.distanceMeters;
    }

    if (!Array.isArray(route.legs) || !route.legs.length) {
      return null;
    }

    let total = 0;
    let hasLegDistance = false;

    for (const leg of route.legs) {
      if (typeof leg?.distanceMeters === 'number' && Number.isFinite(leg.distanceMeters)) {
        total += leg.distanceMeters;
        hasLegDistance = true;
      }
    }

    return hasLegDistance ? total : null;
  }

  private resolveRoutePath(route: GoogleRoute): google.maps.LatLngLiteral[] {
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
      const decoded = this.decodePolyline(route.polyline.encodedPolyline);

      if (decoded.length) {
        return decoded;
      }
    }

    return [];
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

  private toLatLngLiteralPath(
    path: Array<google.maps.LatLng | google.maps.LatLngLiteral> | undefined
  ): google.maps.LatLngLiteral[] {
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

  private normalizeLatLng(
    value: google.maps.LatLng | google.maps.LatLngLiteral | null | undefined
  ): google.maps.LatLngLiteral | null {
    if (!value) {
      return null;
    }

    if (value instanceof google.maps.LatLng) {
      const json = value.toJSON();

      return { lat: json.lat, lng: json.lng };
    }

    if (typeof value.lat === 'number' && typeof value.lng === 'number' && Number.isFinite(value.lat) && Number.isFinite(value.lng)) {
      return { lat: value.lat, lng: value.lng };
    }

    return null;
  }

  private toLatLngLiteral(location: Location): google.maps.LatLngLiteral {
    return {
      lat: location.latitude,
      lng: location.longitude
    };
  }

  private findOptimalRoute(
    nodes: DeliveryRouteNode[],
    routeSegments: Map<string, RouteSegment>
  ): OptimalRoute | null {
    if (nodes.length < 2) {
      return { order: nodes, totalDistance: 0 };
    }

    const exactThreshold = 8;

    if (nodes.length <= exactThreshold) {
      const exact = this.findExactOptimalRoute(nodes, routeSegments);

      if (exact) {
        return exact;
      }
    }

    return this.findGreedyRoute(nodes, routeSegments);
  }

  private findExactOptimalRoute(
    nodes: DeliveryRouteNode[],
    routeSegments: Map<string, RouteSegment>
  ): OptimalRoute | null {
    const used = new Array(nodes.length).fill(false);
    const currentOrder: DeliveryRouteNode[] = [];
    let bestOrder: DeliveryRouteNode[] | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    const backtrack = (currentDistance: number) => {
      if (currentOrder.length === nodes.length) {
        if (currentDistance < bestDistance) {
          bestDistance = currentDistance;
          bestOrder = [...currentOrder];
        }

        return;
      }

      for (let index = 0; index < nodes.length; index++) {
        if (used[index]) {
          continue;
        }

        const candidate = nodes[index];
        let segmentDistance = 0;

        if (currentOrder.length) {
          const previous = currentOrder[currentOrder.length - 1];
          const segment = routeSegments.get(
            this.composeRouteCacheKey(previous.delivery.id, candidate.delivery.id)
          );

          if (!segment) {
            continue;
          }

          segmentDistance = segment.distance;
        }

        const nextDistance = currentDistance + segmentDistance;

        if (nextDistance >= bestDistance) {
          continue;
        }

        used[index] = true;
        currentOrder.push(candidate);
        backtrack(nextDistance);
        currentOrder.pop();
        used[index] = false;
      }
    };

    backtrack(0);

    return bestOrder ? { order: bestOrder, totalDistance: bestDistance } : null;
  }

  private findGreedyRoute(
    nodes: DeliveryRouteNode[],
    routeSegments: Map<string, RouteSegment>
  ): OptimalRoute | null {
    if (!nodes.length) {
      return null;
    }

    let startNode: DeliveryRouteNode | null = null;
    let bestAverageDistance = Number.POSITIVE_INFINITY;

    for (const candidate of nodes) {
      let totalDistance = 0;
      let connections = 0;

      for (const target of nodes) {
        if (target === candidate) {
          continue;
        }

        const segment = routeSegments.get(this.composeRouteCacheKey(candidate.delivery.id, target.delivery.id));

        if (!segment) {
          continue;
        }

        totalDistance += segment.distance;
        connections += 1;
      }

      if (!connections) {
        continue;
      }

      const average = totalDistance / connections;

      if (average < bestAverageDistance) {
        bestAverageDistance = average;
        startNode = candidate;
      }
    }

    if (!startNode) {
      return null;
    }

    const remaining = new Set<DeliveryRouteNode>(nodes);
    remaining.delete(startNode);

    const order: DeliveryRouteNode[] = [startNode];
    let totalDistance = 0;
    let current = startNode;

    while (remaining.size) {
      let nextNode: DeliveryRouteNode | null = null;
      let nextDistance = Number.POSITIVE_INFINITY;

      for (const candidate of remaining) {
        const segment = routeSegments.get(this.composeRouteCacheKey(current.delivery.id, candidate.delivery.id));

        if (!segment) {
          continue;
        }

        if (segment.distance < nextDistance) {
          nextDistance = segment.distance;
          nextNode = candidate;
        }
      }

      if (!nextNode) {
        return null;
      }

      totalDistance += nextDistance;
      order.push(nextNode);
      remaining.delete(nextNode);
      current = nextNode;
    }

    return { order, totalDistance };
  }

  private async resolveRenderedRoutePath(
    apiKey: string,
    optimalRoute: OptimalRoute,
    routeSegments: Map<string, RouteSegment>
  ): Promise<google.maps.LatLngLiteral[] | null> {
    const orderedWaypoints = optimalRoute.order.map((node) => node.location);

    try {
      const fullRoute = await this.googleMapsLoader.computeRouteWithWaypoints(apiKey, orderedWaypoints);
      const computedPath = fullRoute ? this.resolveRoutePath(fullRoute) : [];

      if (computedPath.length) {
        return computedPath;
      }
    } catch (error) {
      console.warn('Failed to compute a full route with waypoints from Google Maps.', error);
    }

    return this.composeRoutePathFromSegments(optimalRoute.order, routeSegments);
  }

  private composeRoutePathFromSegments(
    order: DeliveryRouteNode[],
    routeSegments: Map<string, RouteSegment>
  ): google.maps.LatLngLiteral[] | null {
    if (order.length < 2) {
      return null;
    }

    const coordinates: google.maps.LatLngLiteral[] = [];

    for (let index = 0; index < order.length - 1; index++) {
      const current = order[index];
      const next = order[index + 1];
      const segment = routeSegments.get(this.composeRouteCacheKey(current.delivery.id, next.delivery.id));

      if (!segment?.path?.length) {
        return null;
      }

      if (!coordinates.length) {
        coordinates.push(...segment.path);
      } else {
        coordinates.push(...segment.path.slice(1));
      }
    }

    return coordinates.length ? coordinates : null;
  }

  private resetCalculatedRoute(): void {
    this.calculatedRouteOrder.set(null);
    this.calculatedRoutePath.set(null);
  }

  private getDateOnly(value: string | Date | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  private isSameDay(dateA: Date, dateB: Date): boolean {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  }

  private async tryPopulateDeliveryLocation(delivery: Delivery): Promise<Location | null> {
    if (this.isValidRouteLocation(delivery.location)) {
      return delivery.location;
    }

    const inFlight = this.populatingDeliveryLocations.get(delivery.id);

    if (inFlight) {
      return inFlight;
    }

    const apiKey = this.googleMapsApiKey?.trim();
    const address = delivery.address?.trim();

    if (!apiKey) {
      console.warn('Cannot resolve delivery location without a Google Maps API key.');
      return null;
    }

    if (!address) {
      console.warn(`Delivery "${delivery.id}" is missing an address. Location cannot be populated.`);
      return null;
    }

    const populatePromise = (async (): Promise<Location | null> => {
      try {
        const geoLocation = await this.googleMapsLoader.geocodeAddress(apiKey, address);

        if (geoLocation) {
          const location: Location = {
            latitude: geoLocation.lat,
            longitude: geoLocation.lng
          };

          this.logisticStore.updateDeliveryLocation(delivery.id, location);

          return location;
        }

        return null;
      } catch (error) {
        console.error(`Failed to populate location for delivery "${delivery.id}".`, error);
        return null;
      } finally {
        this.populatingDeliveryLocations.delete(delivery.id);
      }
    })();

    this.populatingDeliveryLocations.set(delivery.id, populatePromise);

    return populatePromise;
  }

  private isValidRouteLocation(value: Location | null | undefined): value is Location {
    return (
      typeof value?.latitude === 'number' &&
      Number.isFinite(value.latitude) &&
      typeof value.longitude === 'number' &&
      Number.isFinite(value.longitude)
    );
  }

  private async ensureDeliveryLocation(delivery: Delivery): Promise<Location | null> {
    if (this.isValidRouteLocation(delivery.location)) {
      return delivery.location;
    }

    const populated = await this.tryPopulateDeliveryLocation(delivery);

    if (this.isValidRouteLocation(populated)) {
      return populated;
    }

    const refreshed = this.deliveries().find((candidate) => candidate.id === delivery.id)?.location;

    return this.isValidRouteLocation(refreshed) ? refreshed : null;
  }
}
