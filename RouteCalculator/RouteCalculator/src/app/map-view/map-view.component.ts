import { HttpClient } from '@angular/common/http';
import polyline from '@mapbox/polyline'
import { AfterViewInit, Component, DestroyRef, inject, OnChanges, OnInit, signal, effect } from '@angular/core';
import * as L from 'leaflet';
@Component({
  selector: 'app-map-view',
  imports: [],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.css'
})
export class MapViewComponent implements AfterViewInit, OnInit {

  private httpClient = inject(HttpClient)
  private destroyRef = inject(DestroyRef)

  private map:any;
  private points = signal<string[]>([])
  
  private apiURL = "http://localhost:8080/api/routes/45.535905/-73.335379/10000"

  constructor() {
    effect(() => {
      const currentPoints = this.points(); // Read the signal to ensure tracking
      console.log('[MapView] Effect triggered. Number of points in signal:', currentPoints.length);
      this.updateMap(currentPoints)
    });
  }

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

  ngOnInit(): void {
    const subscription = this.httpClient.get<any[]>(this.apiURL).subscribe(routes => {
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
