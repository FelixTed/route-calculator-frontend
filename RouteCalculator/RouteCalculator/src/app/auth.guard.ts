import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { filter, Observable, take } from 'rxjs';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.authReady$.pipe(
      filter(ready => ready),
      take(1),
      map(() => {
        if (this.auth.isAuthenticated()) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    
  )
  }
}
