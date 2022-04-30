import { COORDINATE, LOCATION_JSON } from './../_helpers/constents';
import { take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private http: HttpClient) { }

  coordinate:COORDINATE;
  location:LOCATION_JSON = {
    postal_code:null,
    region:{
      name:null,
      city:false,
      town:false,
      village:false,
      hamlet:false,
      unknown:false
    },
    coordinate:null,
    state:null,
    country_code:null
  };

  getCoordinate(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position =>{
        this.coordinate = {
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }
        resolve(true);
        },
        error =>{
          resolve(false);
        }
      );
    });

  }

  getLocationFromCoordinate(latitude:string,longitude:string, region?:string): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this.http.get('https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=en&zoom=14&lat='+latitude+'&lon='+longitude).pipe(take(1))
      .subscribe(
        (result:any) =>{
          const address = result.address;
          if (address.hamlet){
            this.location.region.name = address.hamlet;
            this.location.region.hamlet = true;
          }
          else if (address.village){
            this.location.region.name = address.village;
            this.location.region.village = true;
          }
          else if (address.town){
            this.location.region.name = address.town;
            this.location.region.town = true;
          }
          else if (address.city){
            this.location.region.name = address.city;
            this.location.region.city = true;
          }
          else if (address.county){
            this.location.region.name = address.county;
            this.location.region.unknown = true;
          }
          else if (address.district){
            this.location.region.name = address.district;
            this.location.region.unknown = true;
          }
          else if (address.municipality){
            this.location.region.name = address.municipality;
            this.location.region.unknown = true;
          }
          else if (address.suburb){
            this.location.region.name = address.suburb;
            this.location.region.unknown = true;
          }

          if (address.state){
            this.location.state = address.state;
          }
          else if (address.province){
            this.location.state = address.province;
          }
          else{
            this.location.state = region;
          }

          if (address.postcode){
            this.location.postal_code = address.postcode;
          }

          this.location.country_code = address.country_code.toUpperCase();
          this.location.coordinate = {
            latitude:latitude,
            longitude: longitude
          }
          resolve(true);
        },
        error =>{
          resolve(false);
        }
      );
    });
  }


  getLocation(access_gps=false): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      navigator.permissions && navigator.permissions.query({name: 'geolocation'})
      .then(PermissionStatus => {
        if (PermissionStatus.state == 'granted') {
          (async () => {
            const coordinateResult = await this.getCoordinate();
            if (coordinateResult){
              const result = await this.getLocationFromCoordinate(
                this.coordinate.latitude.toString(), this.coordinate.longitude.toString()
              );
              resolve(result);
            }
            else{
              resolve(coordinateResult);
            }

          })();
        }
        else if (access_gps === true) {
          console.log('prompt - not yet grated or denied');
          (async () => {
            const coordinateResult = await this.getCoordinate();
            if (coordinateResult){
              const result = await this.getLocationFromCoordinate(
                this.coordinate.latitude.toString(), this.coordinate.longitude.toString()
              );
              resolve(result);
            }
            else{
              resolve(coordinateResult);
            }

          })();
        }
        else {
          console.log('denied');
          this.getLocationFromIP().pipe(take(1))
          .subscribe(
              (data:any) =>{
              (async () => {
                const result = await this.getLocationFromCoordinate(data.latitude, data.longitude, data.region);
                resolve(result);
              })();
            },
            error =>{
              resolve(false);
            }
          );
        }
      })
      .catch(() =>{
        resolve(false);
      });
    });
  }

  getLocationFromIP(){
    return this.http.get('https://ipapi.co/json/');
  }

  getLocationFromPincode(pincode:string,country_code:string){
    return this.http.get('https://api.worldpostallocations.com/pincode?postalcode='+pincode+'&countrycode='+country_code);
  }

}
