import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormsData } from '../forms-data.model';


@Component({
  selector: 'app-input-form',
  imports: [FormsModule],
  templateUrl: './input-form.component.html',
  styleUrl: './input-form.component.css'
})
export class InputFormComponent {
  latitude = 30.047992
  longitude = -94.3357433
  distance = 10000
  @Output() formData = new EventEmitter<FormsData>()


  onFormSubmit(){
    this.formData.emit({distance: this.distance, latitude: this.latitude, longitude:this.longitude})
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          console.log('Latitude:', latitude);
          console.log('Longitude:', longitude);

          this.latitude = latitude;
          this.longitude = longitude;
        },
        (error) => {
          console.error('Error getting location', error);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  }


}
