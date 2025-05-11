import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapViewComponent } from './map-view/map-view.component';
import { InputFormComponent } from './input-form/input-form.component';
import { FormsData } from './forms-data.model';
import { LoginComponent } from "./login/login.component";
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [MapViewComponent, InputFormComponent, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'RouteCalculator';
  http = inject(HttpClient)
  auth = inject(AuthService)
  formsData = signal<FormsData>({latitude:30.047992, longitude:  -94.3357433, distance: 10000})
  
  onFormOutput(formsData: FormsData){
    this.formsData.set(formsData)
  }

  logout(){
    this.auth.logout()
  }
 
}
