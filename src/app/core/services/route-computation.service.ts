import { inject, Injectable } from '@angular/core';
import { Delivery } from '../../shared/models/delivery.model';
import { Location } from '../../shared/models/location.model';
import { DeliveryRouteNode } from '../../shared/types/deliveryRouteNode';
import { OptimalRoute } from '../../shared/types/optimalRoute';
import { RouteSegment } from '../../shared/types/routeSegment';
import { GoogleMapsLoaderService, GoogleRoute } from './google-maps-loader.service';

type RouteOriginOption = {
  id?: Delivery['id'] | string;
  location: Location;
};

type RouteComputationOptions = {
  origin?: RouteOriginOption;
  preferredStartDeliveryId?: Delivery['id'];
  updateDeliveryLocation?: (deliveryId: Delivery['id'], location: Location | null | undefined) => void;
  getDeliveryById?: (deliveryId: Delivery['id']) => Delivery | undefined;
};

export type RouteComputationResult = {
  optimalRoute: OptimalRoute;
  routePath: google.maps.LatLngLiteral[];
  routeSegments: Map<string, RouteSegment>;
  origin?: RouteOriginOption;
};

@Injectable({
  providedIn: 'root'
})
export class RouteComputationService {
  private readonly googleMapsLoader = inject(GoogleMapsLoaderService);
  private readonly populatingDeliveryLocations = new Map<Delivery['id'], Promise<Location | null>>();

  async computeRoute(
    apiKey: string,
    deliveries: Delivery[],
    options: RouteComputationOptions = {}
  ): Promise<RouteComputationResult | null> {
    const nodes: DeliveryRouteNode[] = [];

    for (const delivery of deliveries) {
      const location = await this.ensureDeliveryLocation(apiKey, delivery, options);

      if (!location) {
        console.warn(`Skipping delivery "${delivery.id}" because its location could not be determined.`);
        continue;
      }

      nodes.push({ delivery, location });
    }

    if (nodes.length < 2) {
      console.warn('Unable to compute routes because fewer than two deliveries have valid locations.');
      return null;
    }

    const routeSegments = await this.buildRouteSegments(apiKey, nodes);

    if (!routeSegments.size) {
      console.warn('Unable to compute routes: no paths were returned for the selected deliveries.');
      return null;
    }

    const preferredStartId =
      options.preferredStartDeliveryId && nodes.some((node) => node.delivery.id === options.preferredStartDeliveryId)
        ? options.preferredStartDeliveryId
        : undefined;

    const optimalRoute = this.findOptimalRoute(nodes, routeSegments, preferredStartId);

    if (!optimalRoute) {
      console.warn('Unable to compute an optimal route with the available data.');
      return null;
    }

    const routePath = await this.resolveRenderedRoutePath(
      apiKey,
      optimalRoute,
      routeSegments,
      options.origin?.location
    );

    if (!routePath?.length) {
      console.warn('Unable to render the computed route because no path coordinates were available.');
      return null;
    }

    return {
      optimalRoute,
      routePath,
      routeSegments,
      origin: options.origin
    };
  }

  async buildRouteSegments(apiKey: string, nodes: DeliveryRouteNode[]): Promise<Map<string, RouteSegment>> {
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
          const routes = await this.googleMapsLoader.computeRoutesBetween(apiKey, origin.location, destination.location);
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

  async resolveRenderedRoutePath(
    apiKey: string,
    optimalRoute: OptimalRoute,
    routeSegments: Map<string, RouteSegment>,
    origin?: Location
  ): Promise<google.maps.LatLngLiteral[] | null> {
    const orderedWaypoints = optimalRoute.order.map((node) => node.location);

    if (origin) {
      orderedWaypoints.unshift(origin);
    }

    if (orderedWaypoints.length >= 2) {
      try {
        const fullRoute = await this.googleMapsLoader.computeRouteWithWaypoints(apiKey, orderedWaypoints);
        const computedPath = fullRoute ? this.resolveRoutePath(fullRoute) : [];

        if (computedPath.length) {
          return computedPath;
        }
      } catch (error) {
        console.warn('Failed to compute a full route with waypoints from Google Maps.', error);
      }
    }

    const fallbackPath = this.composeRoutePathFromSegments(optimalRoute.order, routeSegments);

    if (!fallbackPath?.length) {
      return null;
    }

    if (!origin) {
      return fallbackPath;
    }

    const firstNode = optimalRoute.order[0];

    if (!firstNode) {
      return fallbackPath;
    }

    try {
      const originRoutes = await this.googleMapsLoader.computeRoutesBetween(apiKey, origin, firstNode.location);
      const primaryRoute = originRoutes?.[0];
      const originPath = primaryRoute ? this.resolveRoutePath(primaryRoute) : [];

      if (!originPath.length) {
        return fallbackPath;
      }

      const combined = [...originPath];

      if (
        combined.length &&
        fallbackPath.length &&
        combined[combined.length - 1].lat === fallbackPath[0].lat &&
        combined[combined.length - 1].lng === fallbackPath[0].lng
      ) {
        combined.push(...fallbackPath.slice(1));
      } else {
        combined.push(...fallbackPath);
      }

      return combined;
    } catch (error) {
      console.warn('Failed to compute route segment between origin and first delivery.', error);
      return fallbackPath;
    }
  }

  composeRoutePathFromSegments(
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

  async ensureDeliveryLocation(
    apiKey: string,
    delivery: Delivery,
    options: RouteComputationOptions = {}
  ): Promise<Location | null> {
    if (this.isValidRouteLocation(delivery.location)) {
      return delivery.location;
    }

    const populated = await this.tryPopulateDeliveryLocation(apiKey, delivery, options.updateDeliveryLocation);

    if (this.isValidRouteLocation(populated)) {
      return populated;
    }

    const refreshed = options.getDeliveryById?.(delivery.id)?.location ?? delivery.location;

    return this.isValidRouteLocation(refreshed) ? refreshed : null;
  }

  async tryPopulateDeliveryLocation(
    apiKey: string,
    delivery: Delivery,
    updateDeliveryLocation?: (deliveryId: Delivery['id'], location: Location | null | undefined) => void
  ): Promise<Location | null> {
    if (this.isValidRouteLocation(delivery.location)) {
      return delivery.location;
    }

    const inFlight = this.populatingDeliveryLocations.get(delivery.id);

    if (inFlight) {
      return inFlight;
    }

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

          updateDeliveryLocation?.(delivery.id, location);

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

      if (
        !literals.length ||
        literal.lat !== literals[literals.length - 1].lat ||
        literal.lng !== literals[literals.length - 1].lng
      ) {
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

  private toLatLngLiteral(location: Location): google.maps.LatLngLiteral {
    return {
      lat: location.latitude,
      lng: location.longitude
    };
  }

  private isValidRouteLocation(value: Location | null | undefined): value is Location {
    return (
      typeof value?.latitude === 'number' &&
      Number.isFinite(value.latitude) &&
      typeof value.longitude === 'number' &&
      Number.isFinite(value.longitude)
    );
  }

  private findOptimalRoute(
    nodes: DeliveryRouteNode[],
    routeSegments: Map<string, RouteSegment>,
    preferredStartDeliveryId?: Delivery['id']
  ): OptimalRoute | null {
    if (nodes.length < 2) {
      return { order: nodes, totalDistance: 0 };
    }

    const exactThreshold = 8;

    if (nodes.length <= exactThreshold) {
      const exact = this.findExactOptimalRoute(nodes, routeSegments, preferredStartDeliveryId);

      if (exact) {
        return exact;
      }
    }

    return this.findGreedyRoute(nodes, routeSegments, preferredStartDeliveryId);
  }

  private findExactOptimalRoute(
    nodes: DeliveryRouteNode[],
    routeSegments: Map<string, RouteSegment>,
    preferredStartDeliveryId?: Delivery['id']
  ): OptimalRoute | null {
    const used = new Array(nodes.length).fill(false);
    const currentOrder: DeliveryRouteNode[] = [];
    let bestOrder: DeliveryRouteNode[] | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    const preferredStartIndex =
      preferredStartDeliveryId !== undefined
        ? nodes.findIndex((node) => node.delivery.id === preferredStartDeliveryId)
        : -1;

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

    if (preferredStartIndex >= 0) {
      used[preferredStartIndex] = true;
      currentOrder.push(nodes[preferredStartIndex]);
      backtrack(0);
      currentOrder.pop();
      used[preferredStartIndex] = false;
    } else {
      backtrack(0);
    }

    return bestOrder ? { order: bestOrder, totalDistance: bestDistance } : null;
  }

  private findGreedyRoute(
    nodes: DeliveryRouteNode[],
    routeSegments: Map<string, RouteSegment>,
    preferredStartDeliveryId?: Delivery['id']
  ): OptimalRoute | null {
    if (!nodes.length) {
      return null;
    }

    let startNode: DeliveryRouteNode | null =
      preferredStartDeliveryId !== undefined
        ? nodes.find((node) => node.delivery.id === preferredStartDeliveryId) ?? null
        : null;
    let bestAverageDistance = Number.POSITIVE_INFINITY;

    if (!startNode) {
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
    } else {
      let totalDistance = 0;
      let connections = 0;

      for (const target of nodes) {
        if (target === startNode) {
          continue;
        }

        const segment = routeSegments.get(this.composeRouteCacheKey(startNode.delivery.id, target.delivery.id));

        if (!segment) {
          continue;
        }

        totalDistance += segment.distance;
        connections += 1;
      }

      if (!connections) {
        startNode = null;
      } else {
        bestAverageDistance = totalDistance / connections;
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
}
