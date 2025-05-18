import { HttpClient } from '@angular/common/http';
import polyline from '@mapbox/polyline';
import 'leaflet-polylinedecorator';
import { AfterViewInit, Component, inject, signal, effect, input, output } from '@angular/core';
import * as L from 'leaflet';
import { FormsData } from '../forms-data.model';
import { computed } from '@angular/core';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.css',
  standalone: true,
  imports: []
})
export class MapViewComponent implements AfterViewInit {
  formsData = input.required<FormsData>();

  private httpClient = inject(HttpClient);

  private map: L.Map | undefined;
  private points = signal<string[]>([]);
  calculatedDistance = output<number>();

  private routeLayers: L.LayerGroup = new L.LayerGroup();


  constructor() {
    effect(() => {
      const data = this.formsData();
      if (data && data.latitude && data.longitude && data.distance && data.latitude !== 0 && data.longitude !== 0) {
        const currentApiURL = this.apiURL();
        if (currentApiURL && this.map) {
          console.log('Getting route for:', currentApiURL);
          this.getRoute(currentApiURL);
        }
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const currentPoints = this.points();
      if (this.map && currentPoints.length > 0) {
        console.log('Updating map with points:', currentPoints.length);
        this.updateMapWithConsolidatedPolyline(currentPoints);
      } else if (this.map) {
        this.routeLayers.clearLayers();
      }
    });
  }

  private apiURL = computed(() => {
    const data = this.formsData();
    if (data && data.latitude != null && data.longitude != null && data.distance != null) {
        return `http://localhost:8080/api/routes/${data.latitude}/${data.longitude}/${data.distance}`;
    }
    return '';
  });

  private initMap(): void {
    if (this.map) {
        this.map.remove();
    }
    this.map = L.map('map', {
      center: [39.8282, -98.5795],
      zoom: 3
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.routeLayers.addTo(this.map);
  }

  ngAfterViewInit() {
    this.initMap();
    const initialData = this.formsData();
    if (initialData && initialData.latitude && initialData.longitude && initialData.distance && this.map) {
        const currentApiURL = this.apiURL();
        if (currentApiURL) {
            this.getRoute(currentApiURL);
        }
    }
  }

  updateMapWithConsolidatedPolyline(encodedSegments: string[]) {
    if (!this.map) return;

    this.routeLayers.clearLayers();

    if (encodedSegments.length === 0) return;

    let allDecodedLatLngs: L.LatLngExpression[] = [];
    let firstPoint: L.LatLngTuple | null = null;
    let lastPointOfLastSegment: L.LatLngTuple | null = null;

    // Merging the segments... could be cleaner if done by backend
    encodedSegments.forEach((segment, index) => {
      const decodedSegment = polyline.decode(segment) as L.LatLngTuple[];

      if (decodedSegment.length > 0) {
        if (index === 0) {
          firstPoint = decodedSegment[0];
        }
        if (index === encodedSegments.length - 1) {
          lastPointOfLastSegment = decodedSegment[decodedSegment.length - 1];
        }

        if (allDecodedLatLngs.length > 0 && decodedSegment.length > 0) {
            const lastOverallPoint = allDecodedLatLngs[allDecodedLatLngs.length -1] as L.LatLngTuple;
            const firstCurrentSegmentPoint = decodedSegment[0];
            if(lastOverallPoint[0] === firstCurrentSegmentPoint[0] && lastOverallPoint[1] === firstCurrentSegmentPoint[1]){
                allDecodedLatLngs.push(...decodedSegment.slice(1));
            } else {
                 allDecodedLatLngs.push(...decodedSegment);
            }
        } else {
            allDecodedLatLngs.push(...decodedSegment);
        }
      }
    });

    if (allDecodedLatLngs.length === 0) return;

    console.log("Consolidated Start:", allDecodedLatLngs[0]);
    console.log("Consolidated End:", allDecodedLatLngs[allDecodedLatLngs.length - 1]);


    const mainRouteLine = L.polyline(allDecodedLatLngs, {
      weight: 4,
      opacity: 0.8,
      color: 'blue' // Example color
    }).addTo(this.routeLayers);

    L.polylineDecorator(mainRouteLine, {
      patterns: [
        {
          offset: '25%',
          repeat: '100px', // Adjust repeat as needed, e.g., '50px' or 100
          symbol: L.Symbol.arrowHead({
            pixelSize: 15,
            polygon: false,
            pathOptions: {
              stroke: true,
              weight: 2, // Slightly thinner for arrows can look cleaner
              color: 'blue'
            }
          })
        }
      ]
    }).addTo(this.routeLayers);

    // Add Start Marker (which is also the end marker for a round trip)
    if (firstPoint) {
      const startMarker = L.marker([firstPoint[0], firstPoint[1]]).addTo(this.routeLayers);
      startMarker.bindPopup('Start/End Point', { autoClose: false, closeOnClick: false }).openPopup();
    }

    // Fit the map to show the entire route
    if (allDecodedLatLngs.length > 0) {
      const bounds = L.latLngBounds(allDecodedLatLngs);
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }


  getRoute(apiURL: string): void {
    console.log('Fetching route from API:', apiURL);
    // this.points.set([]); // Clear points immediately if you want visual feedback of loading
                        // Or clear them only on new successful response for smoother transitions.
                        // Current effect for points already handles clearing layers if points become empty.

    // HttpClient subscriptions are often auto-unsubscribed by Angular when the component is destroyed,
    // especially with async pipe. If you're using inject(DestroyRef), it's a good practice for explicit cleanup.
    const subscription = this.httpClient.get<any[]>(apiURL, { withCredentials: true })
      .subscribe({
        next: (routes) => {
          console.log('Received routes:', routes);
          const newPointsArray: string[] = [];
          let distance = 0;

          for (const route of routes) {
            if (route.paths && route.paths[0] && route.paths[0].points) { // Added check for points existence
              newPointsArray.push(route.paths[0].points);
              distance += route.paths[0].distance;
            }
          }

          this.calculatedDistance.emit(distance);
          this.points.set(newPointsArray); // This will trigger the effect to call updateMap
        },
        error: (error) => {
          console.error('Error fetching route:', error);
          this.points.set([]); // Clear points on error to clear the map
        }
      });

    // If you are NOT using async pipe for this subscription AND this component can be created/destroyed multiple times
    // inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
    // However, Angular's HttpClient typically completes or errors, so direct unsubscription
    // is often not needed unless it's a long-lived stream you want to cut short.
    // For typical GET requests, it's less critical.
  }
}