import { 
  ALL_INTERACTION, CHAT, CONVERSE, dev_prod, IMAGE, INTERACTION, INTEREST_KEYWORD, LINK, LINK_PREVIEW, USER_PREFERENCE, 
  VUE_DISCOVERY, DISCOVERY, INSTITUTION, STUDENT_INTERACTION, CONVERSE_CONTEXT, DRAFT_CONVERSE 
} from './constents';
import { FormGroup } from '@angular/forms';
import { isDevMode } from '@angular/core';

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


// Get the host name from any URL
export function getHostName(url) {
  var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
  if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {

    return match[2];
  }
  else {
      return null;
  }
}


// Get the domain name from any URL
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


// calculate amount of time spend from a given time in human friendly works, eg:- 'a day ago'
export function timeSince(date:Date) {

  var seconds = Math.floor((new Date().valueOf() - date.valueOf()) / 1000);

  var interval = seconds / 31536000;
  if (interval > 1) {
    if (Math.floor(interval) == 1){
      return "a year ago";
    }
    return Math.floor(interval) + " years ago";
  }

  interval = seconds / 2592000;
  if (interval > 1) {
    if (Math.floor(interval) == 1){
      return "a month ago";
    }
    return Math.floor(interval) + " months ago";
  }

  interval = seconds / 86400;
  if (interval > 1) {
    if (Math.floor(interval) == 1){
      return "a day ago";
    }
    return Math.floor(interval) + " days ago";
  }

  interval = seconds / 3600;
  if (interval > 1) {
    if (Math.floor(interval) == 1){
      return "a hour ago";
    }
    return Math.floor(interval) + " hours ago";
  }

  interval = seconds / 60;
  if (interval > 1) {
    if (Math.floor(interval) == 1){
      return "a minute ago";
    }
    return Math.floor(interval) + " minutes ago";
  }

  return " just now";
}


// Return an angular time format for a given time
export function timeSinceFormat(date:Date) {

  var seconds = Math.floor((new Date().valueOf() - date.valueOf()) / 1000);

  var interval = seconds / 31536000;
  if (interval > 1) {
    return 'MMM d, y, h:mm a';
  }

  interval = seconds / 2592000;
  if (interval > 1) {
    return 'MMM d, h:mm a';
  }

  interval = seconds / 86400;
  if (interval > 1) {
    return 'MMM d, h:mm a';
  }

  interval = seconds / 3600;
  if (interval > 1) {
    return 'MMM d, h:mm a';
  }

  return 'h:mm a';
}


export function timeAfter(date:Date) {

  var seconds = Math.floor((date.valueOf() - new Date().valueOf()) / 1000);

  var interval = seconds / 31536000;
  if (interval > 1) {
    if (Math.floor(interval) == 1){
      return "a year";
    }
    else{
      return Math.floor(interval) + " years";
    }
  }

  interval = seconds / 2592000;
  if (interval > 1) {
    if (Math.floor(interval) == 1){
      return "a month";
    }
    else{
      return Math.floor(interval) + " months";
    }
  }

  interval = seconds / 86400;
  if (interval > 1) {
    if (Math.floor(interval) == 1){
      return "a day"
    }
    else{
      return Math.floor(interval) + " days";
    }
  }

  interval = seconds / 3600;
  if (interval > 1) {
    if (Math.floor(interval) == 1){
      return "an hour"
    }
    return Math.floor(interval) + " hours";
  }

  interval = seconds / 60;
  if (interval > 1) {
    if (Math.floor(interval) == 1){
      return "a minute"
    }
    else{
      return Math.floor(interval) + " minutes";
    }
  }

  return false;
}


export function timeAfterInHours(date:Date){
  var seconds = Math.floor((date.valueOf() - new Date().valueOf()) / 1000);
  var interval = seconds / 3600;

  if (interval > 1) {
    if (Math.floor(interval) === 1){
      return "an hour"
    }
    return Math.floor(interval) + " hours";
  }
}


export function threeDaysLeft(date:Date){
  var seconds = Math.floor((date.valueOf() - new Date().valueOf()) / 1000);

  var interval = seconds / 86400;
  if (Math.floor(interval) < 4){
    return true;
  }

  return false;
}


export function modifyDateByDay(date:Date, days:number, add=false){
  let modifiedDate;
  if (add){
    modifiedDate = date.setDate(date.getDate() + days);
  }
  else{
    modifiedDate = date.setDate(date.getDate() - days);
  }

  return modifiedDate
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
  let length = charLength;
  let ending = '...';

  if (str != null){
    if (str.length > length) {
      return str.substring(0, length - ending.length) + ending;
    }
    else {
      return str;
    }
  }
  else{
    return '';
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

  if (author_preference.newConversationDisabled || author_preference.autoConversationDisabled){
    return false;
  }

  if (author_preference.locationPreference === 'COUNTRY'){
    author_preference.country === user_preference.country ? locationCheckPassed = true : null;
  }
  else if (author_preference.locationPreference === 'REGION'){
    author_preference.region === user_preference.region && author_preference.country === user_preference.country ? locationCheckPassed = true : null;
  }
  else if (author_preference.locationPreference === 'INSTITUTION'){
    if (user_preference.institution != null){
      if (author_preference.institution.uid === user_preference.institution.uid && user_preference.institution.verified){
        locationCheckPassed = true;
      }
    }
  }
  else{
    locationCheckPassed = true;
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
    if (author_conversation_point >= 30){
      conversationCheckPassed = true;
    }
  }
  else if (author_conversation_point > user_conversation_point){
    if (author_conversation_point-user_conversation_point <= 10){
      conversationCheckPassed = true;
    }
  }
  else{
    conversationCheckPassed = true;
  }


  
  if (locationCheckPassed && ageCheckPassed && conversationCheckPassed){
    return true;
  }
  else{
    return false;
  }
}


export function isConversationStarted(authorId:string, allInteraction:ALL_INTERACTION){
  const explorersIndex = allInteraction.explorers.findIndex(interaction => interaction.student_interaction.profile.id === authorId);
  const converseIndex = allInteraction.converse.findIndex(interaction => interaction.student_interaction.profile.id === authorId);
  const draftIndex = allInteraction.draft_converse.findIndex(interaction => interaction.student_interaction.profile.id === authorId);

  if (explorersIndex > -1 || converseIndex > -1 || draftIndex > -1){
    return true;
  }
  else{
    return false;
  }
}


export function locationName(user_preference:USER_PREFERENCE, author_preference:USER_PREFERENCE){
  if (user_preference.country === author_preference.country){
    return `${author_preference.region}, ${user_preference.country_code}`;
  }
  else{
    return author_preference.country;
  }
}


export function placeholderImage(width:number, height:number){
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3C/svg%3E`
}


export function isVisible(ele, container){

  if ("getBoundingClientRect" in container){
    const { bottom, height, top } = ele.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return top <= containerRect.top ? (containerRect.top - top <= height) : (bottom - containerRect.bottom <= height);
  }
  else{
    const eleTop = ele.offsetTop;
    const eleBottom = eleTop + ele.clientHeight;

    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;

    return (eleTop < containerTop && containerTop < eleBottom) || (eleTop < containerBottom && containerBottom < eleBottom);
  }
}


export function createVueObj(linkPreview:LINK_PREVIEW, vueFeedId:string): LINK_PREVIEW{
  const vue_obj:LINK_PREVIEW = {
    vue_feed_id: vueFeedId,
    id: linkPreview.id,
    image: linkPreview.image,
    title: linkPreview.title,
    url: linkPreview.url,
    domain_name: linkPreview.domain_name,
    site_name: linkPreview.site_name,
    description: linkPreview.description,
    interest_keyword: linkPreview.interest_keyword,
    created: linkPreview.created,
    friendly_date: linkPreview.friendly_date,
    author_id: linkPreview.author_id,
    location: linkPreview.location,
    age: linkPreview.age,
    active: linkPreview.active,
    conversation_disabled: linkPreview.conversation_disabled,
    conversation_started: linkPreview.conversation_started,
    cursor: null,
    user_saved: linkPreview.user_saved,
    user_opened: linkPreview.user_opened
  }

  return vue_obj;
}


export function createMyVueObj(myVue){
  const vue_interest_tags:INTEREST_KEYWORD[] = [];
  let image:IMAGE = null;
  let vueOpenedCount = 0;
  let vueSavedCount = 0;
  let myVueObj:LINK_PREVIEW;

  if (myVue.image != null){
    image = {
      id: myVue.image.id,
      image: myVue.image.image,
      thumnail: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ myVue.image.thumnail : myVue.image.thumnailUrl,
      width: myVue.image.width,
      height: myVue.image.height
    }
  }

  myVue.vueinterestSet.edges.forEach(interest => {
    vue_interest_tags.push({
      id: interest.node.interestKeyword.id,
      name: interest.node.interestKeyword.word,
      selected: false
    });
  });

  if (myVue.vuestudentsSet != undefined){
    if (myVue.vuestudentsSet.edges.length != 0){
      myVue.vuestudentsSet.edges.forEach(studentCount => {
        studentCount.node.opened ? vueOpenedCount +=1 : null;
        studentCount.node.saved ? vueSavedCount +=1 : null;
      });
    }
  }

  myVueObj = {
    id: myVue.id,
    image: image,
    title: myVue.title,
    url: myVue.url,
    domain_name: myVue.domain?.domainName,
    site_name: myVue.domain?.siteName,
    description: myVue.description,
    interest_keyword: vue_interest_tags,
    conversation_disabled: myVue.conversationDisabled,
    public: myVue.public,
    created: myVue.create,
    active: true,
    friendly_date: timeSince(new Date(myVue.create)),
    viewed: abbreviateNumber(vueOpenedCount),
    saved: abbreviateNumber(vueSavedCount),
    cursor: null
  }

  return myVueObj
}


export function createMyDiscoveryObj(myDiscovery, myVue:LINK_PREVIEW[]){
  let myDiscoveryObj:DISCOVERY;
  let vueDiscovery:VUE_DISCOVERY[] = [];
  let vueImages:{image:string, thumnail:string}[] = [];

  if (myDiscovery.vuediscoverySet != null){
    myDiscovery.vuediscoverySet.edges.forEach(discoveryVue => {
      const myVueIndex = myVue.findIndex(vue => vue.id === discoveryVue.node.vue.id);
      if (myVueIndex > -1){

        vueDiscovery.push({
          id: discoveryVue.node.id,
          vue_id: discoveryVue.node.vue.id,
          vue_obj: myVue[myVueIndex],
          position: null
        });

      }
    });
  }

  if (vueDiscovery.length != 0){
    vueDiscovery.forEach(discoveryVue => {
      const myVueIndex = myVue.findIndex(vue => vue.id === discoveryVue.vue_id && vue.image != null);
      if (myVueIndex > -1){
        vueImages.push({
          image: myVue[myVueIndex].image.image,
          thumnail: myVue[myVueIndex].image.thumnail
        });
      }
    });
  }

  myDiscoveryObj = {
    id: myDiscovery.id,
    title: myDiscovery.title,
    last_updated: new Date(myDiscovery.updated),
    vue_images: vueImages,
    vues: vueDiscovery
  }

  return myDiscoveryObj
}


export function createChatMessage(chatMessage, interaction:INTERACTION){
  let chat_link:LINK = null;
  let chat_vue:LINK_PREVIEW = null;
  let chat_image:IMAGE = null;
  let context:CHAT = null;

  if (chatMessage.link != null && chatMessage.attachementType === 'LINK'){
    chat_link = {
      id: chatMessage.link.id,
      image: chatMessage.link.image === null ? null : {
        id: chatMessage.link.image.id,
        image: chatMessage.link.image.image,
        thumnail: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ chatMessage.link.image.thumnail : chatMessage.link.image.thumnailUrl,
        width: chatMessage.link.image.width,
        height: chatMessage.link.image.height
      },
      title: truncate(chatMessage.link.title, 100),
      description: null,
      url: chatMessage.link.url,
      domain_url: chatMessage.link.domain?.domainUrl,
      domain_name: chatMessage.link.domain?.domainName,
      site_name: chatMessage.link.domain?.siteName
    }
  }
  else if (chatMessage.vue != null && chatMessage.attachementType === 'VUE'){
    chat_vue = {
      id: chatMessage.vue.id,
      image: chatMessage.vue.image === null ? null : {
        id: chatMessage.vue.image.id,
        image: chatMessage.vue.image.image,
        thumnail: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ chatMessage.vue.image.thumnail : chatMessage.vue.image.thumnailUrl,
        width: chatMessage.vue.image.width,
        height: chatMessage.vue.image.height
      },
      title: chatMessage.vue.title,
      description: chatMessage.vue.description,
      url: chatMessage.vue.url,
      domain_url: chatMessage.vue.domain?.domainUrl,
      domain_name: chatMessage.vue.domain?.domainName,
      site_name: chatMessage.vue.domain?.siteName
    }
  }
  else if (chatMessage.image != null && chatMessage.attachementType === 'IMAGE'){
    chat_image = {
      id: chatMessage.image.id,
      image: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ chatMessage.image.image : chatMessage.image.imageUrl,
      thumnail: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ chatMessage.image.thumnail : chatMessage.image.thumnailUrl,
      width: chatMessage.image.width,
      height: chatMessage.image.height
    }
  }


  if (chatMessage.context != null){
    let context_link:LINK = null;
    let context_vue:LINK_PREVIEW = null;
    let context_image:IMAGE = null;

    if (chatMessage.context.link != null && chatMessage.context.attachementType === 'LINK'){
      context_link = {
        id: chatMessage.context.link.id,
        image: chatMessage.context.link.image === null ? null : {
          id: chatMessage.context.link.image.id,
          image: chatMessage.context.link.image.image,
          thumnail: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ chatMessage.context.link.image.thumnail : chatMessage.context.link.image.thumnailUrl,
          width: chatMessage.context.link.image.width,
          height: chatMessage.context.link.image.height
        },
        title: truncate(chatMessage.context.link.title, 100),
        description: null,
        url: chatMessage.context.link.url,
        domain_name: chatMessage.context.link.domain?.domainName,
        domain_url: chatMessage.context.link.domain?.domainUrl,
        site_name: chatMessage.context.link.domain?.siteName
      }
    }
    else if (chatMessage.context.vue != null && chatMessage.context.attachementType === 'VUE'){
      context_vue = {
        id: chatMessage.context.vue.id,
        image: chatMessage.context.vue.image === null ? null : {
          id: chatMessage.context.vue.image.id,
          image: chatMessage.context.vue.image.image,
          thumnail: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ chatMessage.context.vue.image.thumnail : chatMessage.context.vue.image.thumnailUrl,
          width: chatMessage.context.vue.image.width,
          height: chatMessage.context.vue.image.height
        },
        title: chatMessage.context.vue.title,
        description: chatMessage.context.vue.description,
        url: chatMessage.context.vue.url,
        domain_name: chatMessage.context.vue.domain?.domainName,
        domain_url: chatMessage.context.vue.domain?.domainUrl,
        site_name: chatMessage.context.vue.domain?.siteName
      }
    }
    else if (chatMessage.context.image != null && chatMessage.context.attachementType === 'IMAGE'){
      context_image = {
        id: chatMessage.context.image.id,
        image: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ chatMessage.context.image.image : chatMessage.context.imageUrl,
        thumnail: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ chatMessage.context.image.thumnail : chatMessage.context.image.thumnailUrl,
        width: chatMessage.context.image.width,
        height: chatMessage.context.image.height
      }
    }

    context = {
      curser: null,
      id: chatMessage.context.id,
      type: chatMessage.context.attachementType,
      image: context_image,
      link: context_link,
      vue: context_vue,
      body: chatMessage.context.body,
      truncatedBody: chatMessage.context.body?.length > 700 ? truncate(chatMessage.context.body, 700) : null,
      context: null,
      created: new Date(chatMessage.context.created),
      newDate: false,
      seen: chatMessage.context.seen,
      deleted: chatMessage.context.deleted,
      student_interaction_id: chatMessage.context.sender.id,
      sender_user: chatMessage.context.sender.id === interaction.user_interaction.id ? true : false,
      sender_student: chatMessage.context.sender.id === interaction.student_interaction.id ? true : false,
      selected: false
    }
  }

  const chat_obj:CHAT = {
    curser: null,
    id: chatMessage.id,
    type: chatMessage.attachementType,
    image: chat_image,
    link: chat_link,
    vue: chat_vue,
    context: context,
    body: chatMessage.body,
    truncatedBody: chatMessage.body?.length > 700 ? truncate(chatMessage.body, 700) : null,
    created: new Date(chatMessage.created),
    newDate: null,
    seen: chatMessage.seen,
    deleted: chatMessage.deleted,
    student_interaction_id: chatMessage.sender.id,
    sender_user: chatMessage.sender.id === interaction.user_interaction.id ? true : false,
    sender_student: chatMessage.sender.id === interaction.student_interaction.id ? true : false,
    selected: false
  }

  return chat_obj;
}


export function createConverseMessage(converseMessage, interaction:INTERACTION){
  const converse_obj:CONVERSE = {
    curser: null,
    id: converseMessage.id,
    type: converseMessage.messageType,
    created: new Date(converseMessage.created),
    seen: converseMessage.seen,
    opened: converseMessage.opened,
    body: converseMessage.body,
    student_interaction_id: converseMessage.sender.id,
    sender_user: converseMessage.sender.id === interaction.user_interaction.id ? true : false,
    sender_student: converseMessage.sender.id === interaction.student_interaction.id ? true : false
  }

  return converse_obj
}


export function createInteraction(interactionObj, studentProfileId:string, queryType:string){
  let interaction:INTERACTION;
  let user_interaction:STUDENT_INTERACTION;
  let student_interaction:STUDENT_INTERACTION;
  let converse_context:CONVERSE_CONTEXT;
  let draft_converse:DRAFT_CONVERSE;

  interactionObj.studentinteractionSet.edges.forEach(studentInteractionElement => {

    if (studentProfileId === studentInteractionElement.node.student.id){
      user_interaction = {
        id: studentInteractionElement.node.id,
        started_interaction: studentInteractionElement.node.startedInteraction,
        accepted_connection: studentInteractionElement.node.acceptedConnection,
        blocked: studentInteractionElement.node.blockedInteraction,
        new_conversation_disabled: studentInteractionElement.node.student.newConversationDisabled,
        typing: false,
        profile:{
          id: studentInteractionElement.node.student.id,
          nickname: studentInteractionElement.node.student.nickname,
          last_seen: new Date(studentInteractionElement.node.student.lastSeen),
          inactive: new Date(studentInteractionElement.node.student.lastSeen) >= modifyDateByDay(new Date, 10) ? false : true,
          deleted: false
        }
      }

      if (queryType === 'allInteractionExplorers'){
        user_interaction.profile.fullname = studentInteractionElement.node.student.fullName;
        user_interaction.profile.online = studentInteractionElement.node.student.online;
      }
    }
    else{
      student_interaction = {
        id: studentInteractionElement.node.id,
        started_interaction: studentInteractionElement.node.startedInteraction,
        accepted_connection: studentInteractionElement.node.acceptedConnection,
        blocked: studentInteractionElement.node.blockedInteraction,
        new_conversation_disabled: studentInteractionElement.node.student.newConversationDisabled,
        typing: false,
        profile:{
          id: studentInteractionElement.node.student.id,
          nickname: studentInteractionElement.node.student.nickname,
          last_seen: new Date(studentInteractionElement.node.student.lastSeen),
          inactive: new Date(studentInteractionElement.node.student.lastSeen) >= modifyDateByDay(new Date, 10) ? false : true,
          deleted: studentInteractionElement.node.student.deleted
        }
      }

      if (!studentInteractionElement.node.student.deleted){
        if (queryType === 'allInteractionExplorers'){
          student_interaction.profile.fullname = studentInteractionElement.node.student?.fullName;
          student_interaction.profile.online = studentInteractionElement.node.student.online;
          student_interaction.profile.sex = studentInteractionElement.node.student?.sex.toLowerCase();
          student_interaction.profile.dob = studentInteractionElement.node.student?.dob;
          student_interaction.profile.age = studentInteractionElement.node.student?.age;
          student_interaction.profile.profile_picture = {
            id:null,
            width: null,
            height: null,
            image: studentInteractionElement.node.student.profilePicture != null ? isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ studentInteractionElement.node.student?.profilePicture : studentInteractionElement.node.student?.profilePictureUrl : null,
            thumnail:null
          }
          student_interaction.profile.public_vues = [];
          student_interaction.profile.discovery = [];
        }

        student_interaction.profile.region = studentInteractionElement.node.student?.region;
        student_interaction.profile.country = studentInteractionElement.node.student?.countryCode;
      }
    }
    
  });

  converse_context = {
    type: interactionObj.conversecontext.contextType,
    vue_context: interactionObj.conversecontext.vue === null ? null : {
      id: interactionObj.conversecontext.vue.id,
      author_id: interactionObj.conversecontext.vue.author?.id,
      image: interactionObj.conversecontext.vue.image === null ? null : {
        id: interactionObj.conversecontext.vue.image.id,
        image: interactionObj.conversecontext.vue.image.image,
        thumnail: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ interactionObj.conversecontext.vue.image.thumnail : interactionObj.conversecontext.vue.image.thumnailUrl,
        width: interactionObj.conversecontext.vue.image.width,
        height: interactionObj.conversecontext.vue.image.height
      },
      title: interactionObj.conversecontext.vue.title,
      description: interactionObj.conversecontext.vue.description,
      url: interactionObj.conversecontext.vue.url,
      site_name: interactionObj.conversecontext.vue.domain?.siteName,
      domain_name: interactionObj.conversecontext.vue.domain?.domainName,
      location: `${interactionObj.conversecontext.vue.author?.region}, ${interactionObj.conversecontext.vue.author?.countryCode}`,
      age: interactionObj.conversecontext.vue.author?.age,
      active: true
    }
  }

  draft_converse = {
    id: interactionObj.draftconversemessageSet.edges[0].node.id,
    type: interactionObj.draftconversemessageSet.edges[0].node.messageType,
    in_transit: interactionObj.draftconversemessageSet.edges[0].node.inTransit,
    body: interactionObj.draftconversemessageSet.edges[0].node.body,
    updated: new Date(interactionObj.draftconversemessageSet.edges[0].node.updated)
  }

  interaction = {
    id: interactionObj.id,
    expire: interactionObj.expire != null ? new Date(interactionObj.expire) : null,
    converse_context: converse_context,
    user_interaction: user_interaction,
    student_interaction: student_interaction,
    draft_converse: draft_converse,
    converse_page_info: null,
    converse: [],
    chat_page_info: null,
    chat: [],
    selected: false,
    blocked: interactionObj.blocked
  }

  return interaction;
}


export function createInstitution(institutionObj, verified){
  const institution:INSTITUTION = {
    uid: institutionObj.uid,
    name: institutionObj.name,
    abbreviation: institutionObj.abbreviation,
    email_domain: institutionObj.emailDomain,
    verified: verified,

    location: institutionObj.location != null ? {
      postal_code: null,
      region:{name: institutionObj.location.region.name},
      coordinate: null,
      state: null,
      country_code: institutionObj.location.region.stateOrProvince.country.code
    } : null,

    logo: institutionObj.logo != null ? {
      id: institutionObj.logo.id,
      image: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ institutionObj.logo.image : institutionObj.logo.imageUrl,
      thumnail: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ institutionObj.logo.thumnail : institutionObj.logo.thumnailUrl,
      width: institutionObj.logo.width,
      height: institutionObj.logo.height
    } : null
  }

  return institution;
}













/* polyfills */

export function composedPath (el) {

  var path = [];

  while (el) {

    path.push(el);

    if (el.tagName === 'HTML') {

      path.push(document);
      path.push(window);

      return path;
    }

    el = el.parentElement;
  }
}

/* polyfills */

/*
(async () => {
  await # some Promise() #;
})();
*/

/*
this.http.post()
.toPromise().then((data:any) =>{

})
.catch((error:HttpErrorResponse) =>{
  if (error.status === 0){

  }
  else{

  }
})
*/