import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSignal= signal<any>(null)

  constructor(private http: HttpClient){
    this.fetchUser()
  }

  get user(){
    return this.userSignal.asReadonly()
  }

  isAuthenticated = computed(() => !!this.userSignal())

  private fetchUser(){
    this.http.get('http://localhost:8080/api/userinfo', { withCredentials: true }).subscribe({
    next: data => this.userSignal.set(data),
    error: () => {
      console.log("OPSIE")
      this.userSignal.set(null)
    }
  });
  }

  logout(){
    this.http.get('http://localhost:8080/api/auth/logout', { withCredentials: true }).subscribe( {
      next:() => this.userSignal.set(null),
      error: (res) => {
        this.userSignal.set(null)
        console.log(res);
      }
    } );
  }
}
