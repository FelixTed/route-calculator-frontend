import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, DestroyRef, inject, OnInit } from '@angular/core';
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
  private routes:string = ''
  
  private apiURL = "http://localhost:8080/api/routes/45.509062/-73.553363/10000"


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

  ngOnInit(): void {
    const subscription = this.httpClient.get<string>(this.apiURL).subscribe(routes => {
      this.routes = routes
      console.log(this.routes)
    })
    console.log(this.routes)
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe()
    })
  }
}
