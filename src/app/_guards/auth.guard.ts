import { AuthenticationService } from '../_services/authentication.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authenticationService:AuthenticationService, private router: Router) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean>{

    const authenticated = await this.authenticationService.isAuthenticated();
    if (!authenticated) {
      this.router.navigate(['/login'], {queryParams: { next: state.url }});
    }
    return authenticated;
  }

}

