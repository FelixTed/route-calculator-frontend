import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapViewComponent } from './map-view/map-view.component';
import { InputFormComponent } from './input-form/input-form.component';
import { FormsData } from './forms-data.model';

@Component({
  selector: 'app-root',
  imports: [MapViewComponent, InputFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'RouteCalculator';
  formsData = signal<FormsData>({latitude:30.047992, longitude:  -94.3357433, distance: 10000})
  
  onFormOutput(formsData: FormsData){
    this.formsData.set(formsData)
  }
}
