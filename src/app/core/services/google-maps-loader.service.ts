import { Injectable } from '@angular/core';
import { Location as DeliveryLocation } from '../../shared/models/location.model';

declare global {
  interface Window {
    google?: typeof google;
  }
}

type BootstrapConfig = {
  key: string;
  v?: string;
  language?: string;
  region?: string;
};

type GoogleRoutesLibrary = {
  Route?: {
    computeRoutes(request: GoogleRouteComputeRequest): Promise<GoogleRouteComputeResponse>;
  };
};

type GoogleRouteComputeRequest = {
  origin: google.maps.LatLngLiteral | google.maps.LatLng;
  destination: google.maps.LatLngLiteral | google.maps.LatLng;
  travelMode?: string;
  routingPreference?: string;
  computeAlternativeRoutes?: boolean;
  intermediates?: Array<{ location: google.maps.LatLngLiteral | google.maps.LatLng }>;
  fields?: string[];
  [key: string]: unknown;
};

type GooglePolyline = {
  encodedPolyline?: string;
};

type GoogleRouteLeg = {
  distanceMeters?: number;
  path?: Array<google.maps.LatLng | google.maps.LatLngLiteral>;
  polyline?: GooglePolyline;
};

export type GoogleRoute = {
  distanceMeters?: number;
  legs?: GoogleRouteLeg[];
  polyline?: GooglePolyline;
  path?: Array<google.maps.LatLng | google.maps.LatLngLiteral>;
  viewport?: google.maps.LatLngBoundsLiteral;
  [key: string]: unknown;
};

type GoogleRouteComputeResponse = {
  routes?: GoogleRoute[];
};

export type GoogleMapsModules = {
  maps: google.maps.MapsLibrary;
  geocoding?: google.maps.GeocodingLibrary;
  places?: google.maps.PlacesLibrary;
  marker?: google.maps.MarkerLibrary;
  routes?: GoogleRoutesLibrary;
};

const GOOGLE_MAPS_BOOTSTRAP_SNIPPET = `(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await(a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src="https://maps."+c+"apis.com/maps/api/js?"+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));const s=m.querySelector("script[nonce]");a.nonce=s?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})`;

let hasBootstrapped = false;

function bootstrapGoogleMaps(config: BootstrapConfig): void {
  if (hasBootstrapped || typeof window === 'undefined') {
    return;
  }

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.text = `${GOOGLE_MAPS_BOOTSTRAP_SNIPPET}(${JSON.stringify(config)});`;
  document.head.appendChild(script);

  hasBootstrapped = true;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  private loaderPromise?: Promise<GoogleMapsModules>;
  private modules?: GoogleMapsModules;
  private geocoder?: google.maps.Geocoder;
  private readonly geocodeCache = new Map<string, google.maps.LatLngLiteral>();

  load(apiKey: string): Promise<GoogleMapsModules> {
    if (typeof window === 'undefined') {
      return Promise.resolve({ maps: {} as google.maps.MapsLibrary });
    }

    if (!apiKey) {
      return Promise.reject(new Error('Google Maps API key is missing.'));
    }

    if (this.modules) {
      return Promise.resolve(this.modules);
    }

    if (this.loaderPromise) {
      return this.loaderPromise;
    }

    bootstrapGoogleMaps({ key: apiKey, v: 'weekly' });

    this.loaderPromise = (async () => {
      if (!window.google?.maps?.importLibrary) {
        throw new Error('google.maps.importLibrary is not available.');
      }

      const [maps, geocoding, places, marker, routes] = await Promise.all([
        window.google.maps.importLibrary('maps') as Promise<google.maps.MapsLibrary>,
        window.google.maps.importLibrary('geocoding').catch(() => undefined) as Promise<
          google.maps.GeocodingLibrary | undefined
        >,
        window.google.maps.importLibrary('places').catch(() => undefined) as Promise<
          google.maps.PlacesLibrary | undefined
        >,
        window.google.maps.importLibrary('marker').catch(() => undefined) as Promise<
          google.maps.MarkerLibrary | undefined
        >,
        window.google.maps.importLibrary('routes').catch(() => undefined) as Promise<GoogleRoutesLibrary | undefined>
      ]);

      this.modules = { maps, geocoding, places, marker, routes };

      return this.modules;
    })().catch((error) => {
      this.loaderPromise = undefined;
      throw error;
    });

    return this.loaderPromise;
  }

  async computeRoutesBetween(
    apiKey: string,
    origin: DeliveryLocation,
    destination: DeliveryLocation
  ): Promise<GoogleRoute[] | null> {
    const normalizedOrigin = this.normalizeRouteWaypoint(origin);
    const normalizedDestination = this.normalizeRouteWaypoint(destination);

    if (!normalizedOrigin || !normalizedDestination) {
      return Promise.reject(new Error('Origin and destination are required.'));
    }

    const modules = await this.load(apiKey);
    const routesLibrary = modules.routes;

    if (!routesLibrary?.Route?.computeRoutes) {
      throw new Error('Google Maps routes library is not available.');
    }

    const request: GoogleRouteComputeRequest = {
      origin: normalizedOrigin,
      destination: normalizedDestination,
      travelMode: 'DRIVING',
      computeAlternativeRoutes: false,
      fields: [
        'distanceMeters',
        'legs',
        'path',
        'viewport'
      ]
    };

    const response = await routesLibrary.Route.computeRoutes(request);
    const routes = response.routes ?? null;

    return routes;
  }

  async computeDistanceBetween(
    apiKey: string,
    origin: DeliveryLocation,
    destination: DeliveryLocation,
  ): Promise<number | null> {
    const routes = await this.computeRoutesBetween(apiKey, origin, destination);

    if (!routes?.length) {
      return null;
    }

    const route = routes[0] as {
      distanceMeters?: number;
      legs?: Array<{ distanceMeters?: number | null | undefined }>;
    };

    if (typeof route.distanceMeters === 'number') {
      return route.distanceMeters;
    }

    const legWithDistance = route.legs?.find(
      (leg) => typeof leg?.distanceMeters === 'number'
    );

    return typeof legWithDistance?.distanceMeters === 'number'
      ? legWithDistance.distanceMeters ?? null
      : null;
  }

  async computeRouteWithWaypoints(
    apiKey: string,
    waypoints: DeliveryLocation[]
  ): Promise<GoogleRoute | null> {
    if (waypoints.length < 2) {
      throw new Error('At least two waypoints (origin and destination) are required.');
    }

    const normalizedWaypoints = waypoints.map((point) => this.normalizeRouteWaypoint(point));

    if (normalizedWaypoints.some((point) => !point)) {
      throw new Error('All waypoints must include valid latitude and longitude values.');
    }

    const [origin, ...rest] = normalizedWaypoints as google.maps.LatLngLiteral[];
    const destination = rest.pop();

    if (!destination) {
      throw new Error('A destination waypoint is required.');
    }

    const intermediates = rest.map((location) => ({ location }));
    const modules = await this.load(apiKey);
    const routesLibrary = modules.routes;

    if (!routesLibrary?.Route?.computeRoutes) {
      throw new Error('Google Maps routes library is not available.');
    }

    const request: GoogleRouteComputeRequest = {
      origin,
      destination,
      travelMode: 'DRIVING',
      intermediates,
      fields: [
        'distanceMeters',
        'legs',
        'path',
        'viewport'
      ]
    };

    const response = await routesLibrary.Route.computeRoutes(request);
    const route = response.routes?.[0] ?? null;

    return route ?? null;
  }

  async geocodeAddress(apiKey: string, address: string): Promise<google.maps.LatLngLiteral | null> {
    const normalizedAddress = address?.trim();

    if (!normalizedAddress) {
      return null;
    }

    if (typeof window === 'undefined') {
      return null;
    }

    const cached = this.geocodeCache.get(normalizedAddress);

    if (cached) {
      return cached;
    }

    const modules = await this.load(apiKey);
    const GeocoderConstructor = modules.geocoding?.Geocoder ?? window.google?.maps?.Geocoder;

    if (!GeocoderConstructor) {
      throw new Error('Google Maps geocoding library is not available.');
    }

    if (!this.geocoder || !(this.geocoder instanceof GeocoderConstructor)) {
      this.geocoder = new GeocoderConstructor();
    }

    return new Promise<google.maps.LatLngLiteral | null>((resolve, reject) => {
      this.geocoder!.geocode(
        { address: normalizedAddress },
        (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === 'OK' && results?.[0]?.geometry?.location) {
          const location = results[0].geometry.location.toJSON();

          this.geocodeCache.set(normalizedAddress, location);
          resolve(location);
          return;
        }

        if (status === 'ZERO_RESULTS') {
          console.warn(`Geocode returned zero results for address "${normalizedAddress}".`);
          resolve(null);
          return;
        }

        reject(new Error(`Failed to geocode address "${normalizedAddress}". Status: ${status}`));
      });
    }).catch((error) => {
      console.error(error);
      return null;
    });
  }

  private normalizeRouteWaypoint(value: DeliveryLocation | null | undefined): google.maps.LatLngLiteral | null {
    if (!value) {
      return null;
    }

    const { latitude, longitude } = value;

    if (typeof latitude !== 'number' || typeof longitude !== 'number' || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return null;
    }

    return { lat: latitude, lng: longitude };
  }
}

