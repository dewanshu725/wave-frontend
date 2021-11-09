export const TRUSTED_DEVICE = "trusted_device";
export const ACCESS_TOKEN = "access_token";
export const REFRESH_TOKEN = "refresh_token";
export const USER_OBJECT = "user_object";
export const STUDENT_STATE="student_state";
export const INTEREST_CATEGORY_OBJECT = "interest_category_object";

export interface USER_OBJ{
  student_profile_id:string,
  uid:string,
  email:string,
  username:string,
  fullName:string,
  nickname:string,
  sex:string,
  dob:string,
  age:number,
  profilePicture:IMAGE,
  institution:INSTITUTION,
  location:LOCATION,

  locationPreference:string,
  agePreference:number,

  conversationPoints:number,
  newConversationDisabled:boolean,
  newConversationTime:Date,
  newConversationCount:number
}

export interface USER_PREFERENCE{
  country?:string,
  country_code?:string,
  region?:string,
  institution?:INSTITUTION,
  locationPreference?:string,
  conversationPoints?:number,
  agePreference?:number,
  age?:number,
  newConversationDisabled?:boolean,
  autoConversationDisabled?:boolean
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
  uid:string,
  name?:string,
  abbreviation?:string,
  email_domain?:string,
  location?:LOCATION_JSON,
  logo?:IMAGE,
  verified:boolean
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
  country_code:string
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
  image?:IMAGE,
  title?:string,
  url?:string,
  domain_url?:string,
  site_name?:string,
  domain_name?:string,
  description?:string,
  interest_keyword?:INTEREST_KEYWORD[],
  created?:string,
  friendly_date?:string,
  viewed?:number,
  saved?:number
  cursor?:string,
  author_id?:string,
  location?:string,
  age?:number,
  active?:boolean,
  conversation_disabled?:boolean,
  conversation_started?:boolean,
  public?:boolean,
  user_opened?:boolean,
  user_saved?:boolean,
  user_disliked?:boolean,
  user_reported?:boolean
}

export interface DISCOVERY{
  id:string,
  title:string,
  last_updated:Date,
  vue_images?:{image:string, thumnail:string}[],
  vues:VUE_DISCOVERY[]
}

export interface VUE_DISCOVERY{
  id:string,
  vue_id:string,
  vue_obj?:LINK_PREVIEW,
  position:number
}

export interface LINK{
  id?:string,
  image?:IMAGE,
  title?:string,
  description?:string,
  url?:string,
  domain_url?:string,
  domain_name?:string,
  site_name?:string,
}

export interface IMAGE{
  id?:string,
  image?:string,
  thumnail?:string,
  width?:number,
  height?:number,
}

export interface CONTENT{
  id:string,
  image:string,
  thumnail:string,
  title:string,
  description:string
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

export interface STUDENT_INFO_CARD_DATA{
  imgUrl:string | null,
  titleText:string,
  contactStatus?:{
    text:string|Date,
    symbol:string,
    highPriority:boolean,
    newMessage:number
  }
  messageText?:string,
  messageStatus?:{
    waiting:boolean,
    highPriority?:boolean,
    hint:string
  } | null
}

export interface STUDENT_PROFILE{
  id:string,
  nickname:string,
  fullname?:string,
  last_seen:Date,
  inactive:boolean,
  deleted:boolean,
  online?:boolean,
  sex?:string,
  dob?:string,
  age?:string,
  profile_picture?:IMAGE,
  country?:string,
  region?:string,
  institution?:INSTITUTION,
  discovery?:DISCOVERY[],
  public_vues?:LINK_PREVIEW[]
}

export interface STUDENT_INTERACTION{
  id:string,
  accepted_connection:boolean,
  blocked:boolean,
  new_conversation_disabled?:boolean,
  typing:boolean,
  profile?:STUDENT_PROFILE
}

export interface CONVERSE_CONTEXT{
  type:string,
  vue_context?:LINK_PREVIEW
}

export interface DRAFT_CONVERSE{
  id:string,
  type:string,
  in_transit:boolean,
  body:string,
  updated:Date
}

export interface CONVERSE_PAGE_INFO{
  hasNextPage:boolean,
  startCursor:string,
  endCursor:string
}

export interface CONVERSE{
  id:string,
  type:string,
  body:string,
  created:Date,
  seen:boolean,
  opened:boolean,
  curser:string,
  student_interaction_id:string,
  sender_user:boolean,
  sender_student:boolean
}

export interface CHAT_PAGE_INFO{
  hasNextPage:boolean,
  startCursor:string,
  endCursor:string
}

export interface CHAT{
  id:string,
  curser:string,
  type:string,
  vue:LINK_PREVIEW,
  link:LINK,
  image:IMAGE,
  context:CHAT,
  body:string,
  truncatedBody:string,
  created:Date,
  newDate:boolean,
  seen:boolean,
  deleted:boolean,
  student_interaction_id:string,
  sender_user:boolean,
  sender_student:boolean,
  selected:boolean
}

export interface INTERACTION{
  id:string,
  converse_context:CONVERSE_CONTEXT,
  user_interaction:STUDENT_INTERACTION,
  student_interaction:STUDENT_INTERACTION,
  expire:Date|null,
  draft_converse:DRAFT_CONVERSE,
  converse_page_info:CONVERSE_PAGE_INFO,
  converse:CONVERSE[],
  chat_page_info:CHAT_PAGE_INFO,
  chat:CHAT[],
  selected:boolean,
  blocked:boolean
}

export interface ALL_INTERACTION{
  explorers:INTERACTION[],
  converse:INTERACTION[],
  draft_converse:INTERACTION[]
}


export interface APP_ACTIVE_PATH{
  interest:{
    active:boolean,
    notification:boolean,
    vue_feed:{
      active:boolean,
      notification:boolean
    },
    vue_history:{
      active:boolean,
      notification:boolean
    },
    vue_save:{
      active:boolean,
      notification:boolean
    },
    your_vue:{
      active:boolean,
      notification:boolean,
    }
  },
  contact:{
    active:boolean,
    notification:boolean,
    explorers:{
      active:boolean,
      notification:boolean,
      chat:{
        active:boolean,
        notification:boolean
      }
      converse:{
        active:boolean,
        notification:boolean
      }
    },
    converse:{
      active:boolean,
      notification:boolean
    },
    draft:{
      active:boolean,
      notification:boolean
    }
  }
}

export interface APP_NOTIFICATION{
  interest_vue_feed?: boolean,
  interest_vue_history?: boolean,
  interest_vue_save?: boolean,
  interest_your_vue?: boolean,
  contact_explorers_chat?: boolean,
  contact_explorers_converse?: boolean,
  contact_converse?: boolean,
  contact_draft?: boolean
}

export interface NOTIFY_DATA{
  title:String, 
  body:string,
  singleAction:boolean,
  action:string,
  actionLoading:boolean,
  notify_context:string
}

export interface DRAFT_EDITOR_CONTEXT{
  converseId:string,
  converseView:boolean, 
  edit:boolean, 
  draftView:boolean,
  converse:boolean
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