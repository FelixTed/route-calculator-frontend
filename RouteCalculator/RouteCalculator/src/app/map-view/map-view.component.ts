import { HttpClient } from '@angular/common/http';
import polyline from '@mapbox/polyline'
import { AfterViewInit, Component, DestroyRef, inject, OnChanges, OnInit, signal, effect, input, computed } from '@angular/core';
import * as L from 'leaflet';
import { FormsData } from '../forms-data.model';
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

  constructor(){
      effect(() => {
        console.log("FHEFKGHE")
      const currentApiURL = this.apiURL();
      if (currentApiURL && this.map) {
        console.log('Effect triggered: apiURL changed. Fetching route from:', currentApiURL);
        this.getRoute(currentApiURL);
      } else if (!this.map) {
        console.log('Effect for getRoute: Map not yet initialized.');
      }
    });

  
    effect(() => {
      const currentPoints = this.points(); 
      if (this.map) {
        console.log('Effect triggered: points changed. Updating map.');
        this.updateMap(currentPoints);
      } else {
        console.log('Effect for updateMap: Map not yet initialized.');
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

  updateMap(currentPoints: string[]){
        this.map.eachLayer((layer:any) => {
          if (!(layer instanceof L.TileLayer)) {
            this.map.removeLayer(layer);
          }
        });
    console.log("HEY")
    for(const point of currentPoints){
      const pointsDecoded = polyline.decode(point)
      const startMarker = L.marker(pointsDecoded[0]).addTo(this.map);
      startMarker.bindPopup('Start Point').openPopup();
      console.log("HELLO")
      console.log(pointsDecoded)
      const line = L.polyline(pointsDecoded, {color:'blue'}).addTo(this.map)
      this.map.fitBounds(line.getBounds());
    }

  }

  getRoute(apiURL:string): void {
    const subscription = this.httpClient.get<any[]>(apiURL, {withCredentials:true}).subscribe(routes => {
      console.log(routes)
       const newPointsArray: string[] = [];
       let distance = 0
      for (const route of routes) {
          newPointsArray.push(route.paths[0].points);
          distance += route.paths[0].distance
      }
      console.log('distance ' + distance)
      this.points.set(newPointsArray); // Set the signal with the NEW array reference
      
      console.log(this.points())
      //routes?.
    })
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe()
    })
  }
}
