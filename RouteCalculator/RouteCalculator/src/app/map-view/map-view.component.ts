import { HttpClient } from '@angular/common/http';
import polyline from '@mapbox/polyline'
import 'leaflet-polylinedecorator';
import { AfterViewInit, Component, DestroyRef, inject, OnChanges, OnInit, signal, effect, input, computed, output } from '@angular/core';
import * as L from 'leaflet';
import { FormsData } from '../forms-data.model';
import { single } from 'rxjs';
@Component({
  selector: 'app-map-view',
  imports: [],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.css'
})
export class MapViewComponent implements AfterViewInit {
  formsData = input.required<FormsData>()


  private httpClient = inject(HttpClient)
  private destroyRef = inject(DestroyRef)

  private map:any;
  private points = signal<string[]>([])
  calculatedDistance = output<number>()

  constructor() {
    effect(() => {
      // Remove console.log("FHEFKGHE")
      const data = this.formsData();
      // Check if we have valid data before proceeding
      if (data && data.latitude && data.longitude && data.distance) {
        const currentApiURL = this.apiURL();
        if (currentApiURL && this.map) {
          console.log('Getting route for:', currentApiURL);
          this.getRoute(currentApiURL);
        }
      }
    }, { allowSignalWrites: true }); // Allow signal updates within effect

    effect(() => {
      const currentPoints = this.points();
      if (this.map && currentPoints.length > 0) {
        console.log('Updating map with points:', currentPoints.length);
        this.updateMap(currentPoints);
      }
    });
  }
  
  private apiURL = computed(() => {
    const data = this.formsData();
    return `http://localhost:8080/api/routes/${data.latitude}/${data.longitude}/${data.distance}`;
  })


  

  private initMap(): void {
    this.map = L.map('map', {
      center: [ 39.8282, -98.5795 ],
      zoom: 3
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);

  }

  ngAfterViewInit(){
    this.initMap()
    
  }

  updateMap(currentPoints: string[]) {
    // Clear existing layers
    this.map.eachLayer((layer: any) => {
        if (!(layer instanceof L.TileLayer)) {
            this.map.removeLayer(layer);
        }
    });

    if (currentPoints.length === 0) return;

    // Get the first point of the first segment for the start marker
    const firstSegment = polyline.decode(currentPoints[0]);
    const startPoint = firstSegment[0];
    const startMarker = L.marker([startPoint[0], startPoint[1]]).addTo(this.map);
    startMarker.bindPopup('Start Point', { autoClose: false, closeOnClick: false }).openPopup();

    // Draw all route segments
    let bounds = L.latLngBounds([startPoint]);
    currentPoints.forEach((point, index) => {
        const pointsDecoded = polyline.decode(point);
        
        // Add decoded points to bounds
        pointsDecoded.forEach(p => bounds.extend(p));

        const line = L.polyline(pointsDecoded, {
            weight: 4,
            opacity: 0.8,
        }).addTo(this.map);

        // Add the arrow decorator
        L.polylineDecorator(line, {
            patterns: [
                {
                    offset: '25%',
                    repeat: 50,
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 15,
                        polygon: false,
                        pathOptions: {
                            stroke: true,
                            weight: 3
                        }
                    })
                }
            ]
        }).addTo(this.map);
    });

    // Fit the map to show all points
    this.map.fitBounds(bounds, { padding: [50, 50] });
}

  getRoute(apiURL: string): void {
    console.log('Fetching route from API:', apiURL);
    this.points.set([]); // Clear existing points before new request
    
    const subscription = this.httpClient.get<any[]>(apiURL, { withCredentials: true })
      .subscribe({
        next: (routes) => {
          console.log('Received routes:', routes);
          const newPointsArray: string[] = [];
          let distance = 0;
          
          for (const route of routes) {
            if (route.paths && route.paths[0]) {
              newPointsArray.push(route.paths[0].points);
              distance += route.paths[0].distance;
            }
          }
          
          this.calculatedDistance.emit(distance);
          this.points.set(newPointsArray);
        },
        error: (error) => {
          console.error('Error fetching route:', error);
        }
      });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
