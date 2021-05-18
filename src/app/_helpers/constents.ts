export const TRUSTED_DEVICE = "trusted_device";
export const ACCESS_TOKEN = "access_token";
export const REFRESH_TOKEN = "refresh_token";
export const USER_OBJECT = "user_object";
export const STUDENT_STATE="student_state";
export const INTEREST_CATEGORY_OBJECT = "interest_category_object";

export interface USER_OBJ{
  uid:string,
  email:string,
  username:string,
  fullName:string,
  sex:string,
  dob:string,
  age:number,
  profilePictureUrl:string,
  institution:INSTITUTION,
  location:LOCATION,
  locationPreference:string,
  conversationPoints:number,
  agePreference:number
}

export interface USER_PREFERENCE{
  country?:string,
  region?:string,
  institution?:INSTITUTION,
  locationPreference?:string,
  conversationPoints?:number,
  agePreference?:number,
  age?:number
}

export interface COORDINATE{
  latitude:string,
  longitude:string,
}

export interface LOCATION{
  postal_code:number,
  region:string,
  state_or_province:string,
  country_name?:string,
  country_code?:string
}

export interface INSTITUTION{
  uid?:string,
  name?:string
}

export interface REGION{
    name:string,
    city?:boolean,
    town?:boolean,
    village?:boolean,
    hamlet?:boolean,
    unknown?:boolean
}

export interface LOCATION_JSON{
  postal_code?:string,
  region:REGION,
  coordinate:COORDINATE,
  state:string,
  country_code:string,
}

export interface STUDENT_STATE_OBJ{
  initial_setup_done:boolean
}

export interface INTEREST_KEYWORD{
  id:string,
  name?:string,
  selected?:boolean,
  saved?:boolean,
  count?:number,
  average_percent?:number
}

export interface INTEREST_CATEGORY{
    name:string,
    interest_keyword:INTEREST_KEYWORD[]
  }

export interface LINK_ERROR{
  error:boolean,
  blacklist:boolean,
  sentence_filler:string,
  error_message:string
}

export interface LINK_PREVIEW{
  vue_feed_id?:string,
  id?:string,
  image?:string,
  image_height?:number,
  title?:string,
  truncated_title?:string,
  url:string,
  domain_url?:string,
  site_name?:string,
  domain_name:string,
  description?:string,
  interest_keyword?:INTEREST_KEYWORD[],
  created?:string,
  friendly_date?:string,
  viewed?:number,
  saved?:number
  cursor?:string,
  location?:string,
  age?:number,
  conversation_disabled?:boolean,
  priority?:string,
  user_opened?:boolean,
  user_saved?:boolean,
  user_disliked?:boolean,
  user_reported?:boolean

}

export interface ALERT_BOX{
  open:boolean,
  message:string,
}

export interface PAGE_INFO{
  hasNextPage:boolean,
  hasPreviousPage:boolean,
  startCursor:string,
  endCursor:string
}

export const dev_prod = {
  httpServerUrl_dev: "http://127.0.0.1:8000/",
  httpServerUrl_prod: "https://we.pinekown.com/",
  wsServerUrl_dev: "ws://127.0.0.1:8000/",
  wsServerUrl_prod: "wss://we.pinekown.com:8001/",
  staticUrl_prod: "https://sgp1.digitaloceanspaces.com/wave-static/wave-static/frontend/"
}

export const state_language = {
  JK:"ہِندوستان भारत",
  HP:"भारत",
  PB:"ਭਾਰਤ",
  CH:"भारत",
  UT:"भारत",
  HR:"भारत",
  DL:"भारत",
  RJ:"भारत",
  UP:"भारत",
  BR:"भारत",
  SK:"भारत",
  AR:"India",
  NL:"India",
  MN:"ভারত",
  MZ:"India",
  TR:"ভারত",
  ML:"India",
  AS:"ভাৰত",
  WB:"ভারত",
  JH:"भारत",
  OR:"ଭାରତ",
  CT:"भारत",
  MP:"भारत",
  GJ:"ભારત",
  DD:"ભારત",
  DN:"ભારત",
  MH:"भारत",
  AP:"భారత",
  KA:"ಭಾರತ",
  GA:"भारत",
  LD:"ഭാരതം",
  KL:"ഭാരതം",
  TN:"பாரதம்",
  PY:"பாரதம்",
  AN:"भारत",
  TG:"భారత بھارت"
}


/*
(async () => {
  await # some Promise() #;
})();
*/
