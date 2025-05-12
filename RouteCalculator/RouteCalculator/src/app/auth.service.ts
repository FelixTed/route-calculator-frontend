import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSignal= signal<any>(null)
  private authReadySubject = new BehaviorSubject<boolean>(false);
  authReady$ = this.authReadySubject.asObservable();

  constructor(private http: HttpClient){
    this.fetchUser()
  }

  get user(){
    return this.userSignal.asReadonly()
  }

  isAuthenticated = computed(() => this.userSignal())

  private fetchUser(){
    this.http.get('http://localhost:8080/api/userinfo', { withCredentials: true }).subscribe({
    next: data =>{
      console.log(data)
      this.userSignal.set(data) 
      this.authReadySubject.next(true);

    },
    error: () => {
      console.log("OPSIE")
      this.userSignal.set(null)
      this.authReadySubject.next(true)
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
