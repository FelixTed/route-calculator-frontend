import { Component, EventEmitter, input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormsData } from '../forms-data.model';


@Component({
  selector: 'app-input-form',
  imports: [FormsModule],
  templateUrl: './input-form.component.html',
  styleUrl: './input-form.component.css'
})
export class InputFormComponent {
  latitude = 0
  longitude = 0
  distance = 10000
  calculatedDistance = input<number>()

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
