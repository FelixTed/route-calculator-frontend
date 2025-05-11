import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  login(){
    window.location.href = 'http://localhost:8080/login/oauth2/code/google'

  }
}
