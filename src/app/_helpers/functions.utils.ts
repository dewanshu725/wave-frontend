import { USER_PREFERENCE } from './constents';
import { FormGroup } from '@angular/forms';
// Converts Base64 dataURL to Image file
export function dataURLtoFile(dataurl, filename) {

    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, {type:mime});
}

export function getHostName(url) {
  var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
  if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {

    return match[2];
  }
  else {
      return null;
  }
}

export function getDomain(url) {
  var hostName = getHostName(url);
  var domain = hostName;

  if (hostName != null) {
      var parts = hostName.split('.').reverse();

      if (parts != null && parts.length > 1) {
          domain = parts[1] + '.' + parts[0];

          if (hostName.toLowerCase().indexOf('.co.uk') != -1 && parts.length > 2) {
            domain = parts[2] + '.' + domain;
          }
      }
  }

  return domain;
}

export function timeSince(date:Date) {

  var seconds = Math.floor((new Date().valueOf() - date.valueOf()) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return " just now";
}

export function abbreviateNumber(value) {
  var newValue = value;
  if (value >= 1000) {
      var suffixes = ["", "k", "m", "b","t"];
      var suffixNum = Math.floor( (""+value).length/3 );
      var shortValue:any = '';
      for (var precision = 2; precision >= 1; precision--) {
          shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
          var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
          if (dotLessShortValue.length <= 2) { break; }
      }
      if (shortValue % 1 != 0)  shortValue = shortValue.toFixed(1);
      newValue = shortValue+suffixes[suffixNum];
  }
  return newValue;
}

export function truncate(str:string,charLength:number){
  var length = charLength;
  var ending = '...';
  if (str.length > length) {
    return str.substring(0, length - ending.length) + ending;
  }
  else {
    return str;
  }
}

export function removeValidators(form: FormGroup) {
  for (const key in form.controls) {
      form.get(key).clearValidators();
      form.get(key).updateValueAndValidity();
  }
}


export function isVueConverseDisable(user_preference:USER_PREFERENCE, author_preference:USER_PREFERENCE): boolean{
  let locationCheckPassed = false
  let ageCheckPassed = false
  let conversationCheckPassed = false

  let user_conversation_point:number;
  let author_conversation_point:number;

  let higher_conversation_point:number;
  let lower_conversation_point:number;

  if (author_preference.locationPreference === 'country'){
    author_preference.country === user_preference.country ? locationCheckPassed = true : null;
  }
  else if (author_preference.locationPreference === 'region'){
    author_preference.region === user_preference.region && author_preference.country === user_preference.country ? locationCheckPassed = true : null;
  }
  else if (author_preference.locationPreference === 'institution'){
    author_preference.institution.uid === user_preference.institution.uid ? locationCheckPassed = true : null;
  }

  if (
      user_preference.age >= (author_preference.age-author_preference.agePreference) &&
      user_preference.age <= (author_preference.age+author_preference.agePreference)
    ){
      ageCheckPassed = true;
  }


  if (user_preference.conversationPoints >= 100){
    user_conversation_point = 100;
  }
  else{
    user_conversation_point = user_preference.conversationPoints;
  }

  if (author_preference.conversationPoints >= 100){
    author_conversation_point = 100;
  }
  else{
    author_conversation_point = author_preference.conversationPoints;
  }

  if (user_conversation_point > author_conversation_point){
    higher_conversation_point = user_conversation_point;
    lower_conversation_point = author_conversation_point;
  }
  else if (author_conversation_point > user_conversation_point){
    higher_conversation_point = author_conversation_point;
    lower_conversation_point = user_conversation_point;
  }
  else{
    conversationCheckPassed = true;
  }

  if (!conversationCheckPassed){
    if (higher_conversation_point-lower_conversation_point <= 10 || higher_conversation_point-(lower_conversation_point+10) <= 10){
      conversationCheckPassed = true;
    }
  }

  if (locationCheckPassed && ageCheckPassed && conversationCheckPassed){
    return true;
  }
  else{
    return false;
  }
}


export function locationName(user_preference:USER_PREFERENCE, author_preference:USER_PREFERENCE){
  if (user_preference.locationPreference === 'global'){
    return author_preference.country
  }
  else if (user_preference.locationPreference === 'country' || user_preference.locationPreference === 'region'){
    return author_preference.region
  }
  else{
    return user_preference.institution.name
  }
}
