import { Component, inject, signal } from '@angular/core';
import { InputFormComponent } from '../input-form/input-form.component';
import { MapViewComponent } from '../map-view/map-view.component';
import { HttpClient } from '@angular/common/http';
import { FormsData } from '../forms-data.model';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [InputFormComponent, MapViewComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  title = 'RouteCalculator';
  http = inject(HttpClient)
  auth = inject(AuthService)
  router = inject(Router)
  formsData = signal<FormsData>({latitude:30.047992, longitude:  -94.3357433, distance: 10000})
  
  onFormOutput(formsData: FormsData){
    this.formsData.set(formsData)
  }

  logout(){
    this.auth.logout()
    this.router.navigate(['/login'])
  }
 
}
