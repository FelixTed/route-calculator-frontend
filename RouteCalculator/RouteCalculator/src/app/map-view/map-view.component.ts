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
    let count = 0


    for(const point of currentPoints){
      const pointsDecoded = polyline.decode(point)
      if (count==0){
        const startMarker = L.marker(pointsDecoded[0]).addTo(this.map);
        startMarker.bindPopup('Start Point', {autoClose:false, closeOnClick:false}).openPopup();
        console.log(pointsDecoded[0])
      }
      if(count ==currentPoints.length - 1){
        // const endMarker = L.marker(pointsDecoded[pointsDecoded.length-1]).addTo(this.map);
        // endMarker.bindPopup('Ending Point', {autoClose:false, closeOnClick:false}).openPopup();
        console.log(pointsDecoded[pointsDecoded.length-1])
      }
      console.log("HELLO")
      console.log(pointsDecoded[pointsDecoded.length-1]);
      const line = L.polyline(pointsDecoded, {
                  weight: 4,
                  opacity: 0.8,
              }).addTo(this.map);
      
      // Add the arrow decorator separately
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
      }).addTo(this.map);this.map.fitBounds(line.getBounds());
      count++;
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
      this.calculatedDistance.emit(distance)
      this.points.set(newPointsArray);
      
      console.log(this.points())
      //routes?.
    })
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe()
    })
  }
}
