import gql from 'graphql-tag';

export const IMAGE_UPLOAD_MUTATION = gql`
mutation imageupload($image:Upload){
    imageUpload(imgFile:$image){
      imgUrl
    }
  }
`

export const ALL_BOARD_NAME_SEARCH = gql`
query allboard($name_Istartswith:String){
  allBoard(first:10,name_Istartswith:$name_Istartswith){
    edges{
      node{
        id
        uid
        name
        logo
        abbreviation
        boardType
      }
    }
  }
}
`

export const ALL_BOARD_ABBREVIATION_SEARCH = gql`
query allboard($abbreviation_Istartswith:String){
  allBoard(first:10,abbreviation_Istartswith:$abbreviation_Istartswith){
    edges{
      node{
        id
        uid
        name
        logo
        abbreviation
        boardType
      }
    }
  }
}
`


// ------------------------------------------------------ ACCOUNT ----------------------------------------------------------

export const EMAIL_LOGIN_MUTATION = gql`
mutation login($email:String!, $password:String!){
    tokenAuth(input:{email:$email, password:$password}){
    token
    refreshToken
    errors
    user{
      uid
      email
      username
      firstName
      lastName
      sex
      dob
      age
      location{
        code
        region{
          name
          stateOrProvince{
            name
            country{
              name
              code
            }
          }
        }
      }
      profilePicture{
        id
        image
        imageUrl
        thumnail
        thumnailUrl
        width
        height
      }

      studentprofile{
        id
        nickname
        studentinstitution{
          verified
          institution{
            uid
            name
            abbreviation
            emailDomain
            location{
              region{
                name
                stateOrProvince{
                  country{
                    name
                    code
                  }
                }
              }
            }
            logo{
              id
              image
              imageUrl
              thumnail
              thumnailUrl
              width
              height
            }
          }
        }
        conversationPoints
        locationPreference
        agePreference
        state
        newConversationDisabled
        newConversationTime
        newConversationCount
        relatedstudentinterestkeywordSet{
          edges{
            node{
              interest{
                id
                word
              }
              saved
              count
              averagePercentage
            }
          }
        }
      }
    }
  }
}
`

export const USERNAME_LOGIN_MUTATION = gql`
mutation login($username:String!, $password:String!){
    tokenAuth(input:{username:$username, password:$password}){
    token
    refreshToken
    errors
    user{
      uid
      email
      username
      firstName
      lastName
      sex
      dob
      age
      location{
        code
        region{
          name
          stateOrProvince{
            name
            country{
              name
              code
            }
          }
        }
      }
      profilePicture{
        id
        image
        imageUrl
        thumnail
        thumnailUrl
        width
        height
      }
      studentprofile{
        id
        nickname
        studentinstitution{
          verified
          institution{
            uid
            name
            abbreviation
            emailDomain
            location{
              region{
                name
                stateOrProvince{
                  country{
                    name
                    code
                  }
                }
              }
            }
            logo{
              id
              image
              imageUrl
              thumnail
              thumnailUrl
              width
              height
            }
          }
        }
        conversationPoints
        locationPreference
        agePreference
        state
        newConversationDisabled
        newConversationTime
        newConversationCount
        relatedstudentinterestkeywordSet{
          edges{
            node{
              interest{
                id
                word
              }
              saved
              count
              averagePercentage
            }
          }
        }
      }
    }
  }
}
`

export const LOGOUT_MUTATION = gql`
mutation logout($refresh_token:String!){
    revokeToken(input:{
      refreshToken:$refresh_token
    }){
      revoked
    }
  }
`

export const ME_QUERY = gql`
query{
  me{
    uid
    email
    username
    firstName
    lastName
    sex
    dob
    age
    location{
      code
      region{
        name
        stateOrProvince{
          name
          country{
            name
            code
          }
        }
      }
    }
    profilePicture{
      id
      image
      imageUrl
      thumnail
      thumnailUrl
      width
      height
    }
    studentprofile{
      id
      nickname
      studentinstitution{
        verified
        institution{
          uid
          name
          abbreviation
          emailDomain
          location{
            region{
              name
              stateOrProvince{
                country{
                  name
                  code
                }
              }
            }
          }
          logo{
            id
            image
            imageUrl
            thumnail
            thumnailUrl
            width
            height
          }
        }
      }
      conversationPoints
      locationPreference
      agePreference
      state
      newConversationDisabled
      newConversationTime
      newConversationCount
      relatedstudentinterestkeywordSet{
        edges{
          node{
            interest{
              id
              word
            }
            saved
            count
            averagePercentage
          }
        }
      }
    }
  }
}
`

export const REFRESH_TOKEN_MUTATION = gql`
mutation Refresh_Token($refresh_token:String!){
    refreshToken(input:{
      refreshToken:$refresh_token
    }){
      success
      errors
      token
      refreshToken
    }
  }
`

export const RESEND_ACTIVATION_EMAIL = gql`
mutation email($email:String!) {
  resendActivationEmail(
    input: {
      email:$email
    }
  ) {
    success,
    errors

  }
}
`

export const PASSWORD_RESET_EMAIL = gql`
mutation email($email:String!) {
  sendPasswordResetEmail(
    input: {
      email: $email
    }
  ) {
    success,
    errors
  }
}
`

export const PASSWORD_CHANGE = gql`
mutation passChange(
  $currentPassword: String!,
  $newPassword: String!,
  $confirmPassword: String!
  ){
  passwordChange(input:{
    oldPassword: $currentPassword,
    newPassword1: $newPassword,
    newPassword2: $confirmPassword
  }){
    success
    errors
    token
    refreshToken
  }
}
`

export const EMAIL_CHECK = gql`
mutation email($email:String!){
  emailUsernameCheck(input:{
    email:$email
  }){
    email
  }
}
`

export const USERNAME_CHECK = gql`
mutation username($username:String!){
  emailUsernameCheck(input:{
    username:$username
  }){
    username
  }
}
`

export const USER_REGISTRATION_WITHOUT_PROFILE_PICTURE = gql`
mutation user_registration(
  $username:String!,
  $email:String!,
  $password1:String!,
  $password2:String!,
  $sex:String!,
  $dob:String!,
  $fullName:String!,
  $location_json:String!,
){
  userRegistration(input:{
    username:$username
    email:$email
    password1:$password1
    password2:$password2
    fullName:$fullName
    sex:$sex
    dob:$dob
    locationJson:$location_json
  }){
    user
  }
}
`

export const USER_REGISTRATION_WITH_PROFILE_PICTURE = gql`
mutation user_registration(
  $username:String!,
  $email:String!,
  $password1:String!,
  $password2:String!,
  $sex:String!,
  $dob:String!,
  $profilePic:Upload,
  $fullName:String!,
  $location_json:String!,
){
  userRegistration(input:{
    username:$username
    email:$email
    password1:$password1
    password2:$password2
    profilePic:$profilePic
    fullName:$fullName
    sex:$sex
    dob:$dob
    locationJson:$location_json
  }){
    user
  }
}
`

export const USER_LOCATION = gql`
query{
  userPostalCode{
    edges{
      node{
        code
        region{
          name
          regionType
          stateOrProvince{
            name
            country{
              code
            }
          }
        }
      }
    }
  }
}
`

export const USER_LOCATION_UPDATE = gql`
mutation locationUpdate(
  $countryCode:String!,
  $stateOrProvince:String!,
  $region:String!,
  $regionType:String!,
  $latitude:String!,
  $longitude:String!,
  $postalCode:String
){
  userLocationUpdate(input:{
    countryCode: $countryCode,
    stateOrProvince: $stateOrProvince,
    region: $region,
    regionType: $regionType,
    latitude: $latitude,
    longitude : $longitude,
    postalCode: $postalCode
  }){
    success
  }
}
`

export const UPDATE_ACCOUNT = gql`
mutation update($fullName:String){
  updateAccount(input:{
    firstName: $fullName
  }){
    success
  }
}
`

export const UPDATE_PROFILE_PIC = gql`
mutation updateProfilePic($profilePic: Upload!){
  updateProfilePic(input:{
    profilePic: $profilePic
  }){
    imgObj{
      id
      width
      height
      image
      imageUrl
      thumnail
      thumnailUrl
    }
  }
}
`

export const DELETE_ACCOUNT = gql`
mutation{
  deleteAccount(input:{}){
    result
  }
}
`

export const UPDATE_STUDENT_PROFILE = gql`
mutation updateStudentProfile($locationPreference: String, $agePreference: Int){
  updateStudentProfile(input:{
    locationPreference: $locationPreference,
    agePreference: $agePreference
  }){
    result
  }
}
`


// ------------------------------------------------------ ACCOUNT ----------------------------------------------------------


// ------------------------------------------------------ INTEREST ----------------------------------------------------------

export const ALL_INTEREST_KEYWORD = gql`
query{
  allInterestKeyword{
    edges{
      node{
        word
      }
    }
  }
}
`

export const ALL_INTEREST_CATEGORY = gql`
query{
  allInterestCategory{
    edges{
      node{
        name
        interestkeywordSet{
          edges{
            node{
              id
              word
            }
          }
        }
      }
    }
  }
}
`

export const INTEREST_KEYWORD_MUTATION = gql`
mutation save_interest($selected_keyword:String!){
  interestKeywordMutation(input:{
    selectedInterests:$selected_keyword
  }){
    result
  }
}
`

export const ALL_STUDENT_INTEREST = gql`
query{
  allStudentInterest{
    edges{
      node{
        interest{
          id
          word
        }
        saved
        count
        averagePercentage
      }
    }
  }
}
`

export const STUDENT_INTEREST_SNAPSHOT = gql`
mutation{
  studentInterestSnapshot(input:{}){
    result
  }
}
`

// ------------------------------------------------------ INTEREST ----------------------------------------------------------


// ------------------------------------------------------ VUE ----------------------------------------------------------

export const VUE_PUBLISH = gql`
mutation vuePublish($vueJson:String!){
  vuePublish(input:{
    vueJson: $vueJson
  }){
    result{
      id
      title
      description
      url
      conversationDisabled
      public
      create
      image{
        id
        image
        thumnail
        thumnailUrl
        width
        height
      }
      domain{
        domainUrl
        domainName
        siteName
      }
      vueinterestSet{
        edges{
          node{
            interestKeyword{
              id
              word
            }
          }
        }
      }
      vuestudentsSet{
        edges{
          node{
            opened
            saved
          }
        }
      }
    }
  }
}
`

export const MY_VUE = gql`
query{
  allMyVue{
    edges{
      node{
        id
        title
        description
        url
        conversationDisabled
        public
        create
        image{
          id
          image
          thumnail
          thumnailUrl
          width
          height
        }
        domain{
          domainUrl
          domainName
          siteName
        }
        vueinterestSet{
          edges{
            node{
              interestKeyword{
                id
                word
              }
            }
          }
        }
        vuestudentsSet{
          edges{
            node{
              opened
              saved
            }
          }
        }
      }
    }
  }
}
`

export const MY_VUE_CURSOR = gql`
mutation myVueCursor($myVueId: ID!){
  myVueCursor(input:{
    myVueId: $myVueId
  }){
    cursor
  }
}
`

export const VUE_CONVERSATION_UPDATE = gql`
mutation conversation($vueID:ID!){
  vueConversationUpdate(input:{
    vueId: $vueID
  }){
    result
  }
}
`

export const VUE_PUBLIC_UPDATE = gql`
mutation vuePublicUpdate($vueID:ID!){
  vuePublicUpdate(input:{
    vueId: $vueID
  }){
    result
  }
}
`

export const VUE_DELETE = gql`
mutation delete($vueId:ID!){
  vueDelete(input:{
    vueId:$vueId
  }){
    result
  }
}
`

export const VUE_FEED_IDS = gql`
mutation vueFeedIds($locationPreference: String!){
  vueFeedIds(input:{
    locationPreference: $locationPreference
  }){
    vueFeedIds
  }
}
`

export const GET_VUE_FEED_FROM_IDS = gql`
mutation getVueFeedFromIds($vueFeedIds: [String]!){
  getVueFeedFromIds(input:{
    vueFeedIds: $vueFeedIds
  }){
    vueFeedObjs{
      id
      title
      description
      url
      create
      conversationDisabled
      image{
        id
        image
        thumnail
        thumnailUrl
        width
        height
      }
      author{
        id
        conversationPoints
        newConversationDisabled
        autoConversationDisabled
        locationPreference
        agePreference
        age
        lastSeen
        country
        region
        studentinstitution{
          verified
          institution{
            uid
          }
        }
      }
      domain{
        domainUrl
        domainName
        siteName
      }
      vueinterestSet{
        edges{
          node{
            interestKeyword{
              id
              word
            }
          }
        }
      }
    }
  }
}
`

export const VUE_HISTORY = gql`
query vue_history($first:Int, $after:String){
  vueOpened(first: $first, after: $after){
    pageInfo{
      hasNextPage
      startCursor
      endCursor
    }
    edges{
      cursor
      node{
        id
        saved
        vue{
          id
          title
          description
          url
          create
          conversationDisabled
          image{
            id
            image
            thumnail
            thumnailUrl
            width
            height
          }
          author{
            id
            conversationPoints
            newConversationDisabled
            autoConversationDisabled
            locationPreference
            agePreference
            age
            lastSeen
            country
            region
            studentinstitution{
              verified
              institution{
                uid
              }
            }
          }
          domain{
            domainUrl
            domainName
            siteName
          }
          vueinterestSet{
            edges{
              node{
                interestKeyword{
                  id
                  word
                }
              }
            }
          }
        }
      }
    }
  }
}
`

export const VUE_HISTORY_CURSOR = gql`
mutation vueHistoryCursor($vueOpenedId: ID!){
  vueOpenedCursor(input:{
    vueOpenedId: $vueOpenedId
  }){
    cursor
  }
}
`

export const VUE_SAVED = gql`
query vue_saved($first:Int, $after:String){
  vueSaved(first: $first, after: $after){
    pageInfo{
      hasNextPage
      startCursor
      endCursor
    }
    edges{
      cursor
      node{
        id
        opened
        vue{
          id
          title
          description
          url
          create
          conversationDisabled
          image{
            id
            image
            thumnail
            thumnailUrl
            width
            height
          }
          author{
            id
            conversationPoints
            newConversationDisabled
            autoConversationDisabled
            locationPreference
            agePreference
            age
            lastSeen
            country
            region
            studentinstitution{
              verified
              institution{
                uid
              }
            }
          }
          domain{
            domainUrl
            domainName
            siteName
          }
          vueinterestSet{
            edges{
              node{
                interestKeyword{
                  id
                  word
                }
              }
            }
          }
        }
      }
    }
  }
}
`

export const VUE_SAVED_CURSOR = gql`
mutation vueSvedCursor($vueSavedId: ID!){
  vueSavedCursor(input:{
    vueSavedId: $vueSavedId
  }){
    cursor
  }
}
`

export const UPDATE_VUE_FEED = gql`
mutation update_vue_feed(
  $vueId: ID!,
  $opened: Boolean,
  $saved: Boolean,
  $disliked: Boolean
){
  updateVueFeed(input:{
    vueId: $vueId
    opened: $opened
    saved: $saved
    disliked: $disliked
  }){
    result
  }
}
`

export const REPORT_VUE = gql`
mutation report_vue(
  $vueId: ID!,
  $adultSite: Boolean!,
  $shoppingSite: Boolean!,
  $gamblingSite: Boolean!,
  $misleading: Boolean!,
  $clickbait: Boolean!,
  $dangerous: Boolean!,
  $others: Boolean!
){
  reportVue(input:{
    vueId: $vueId,
    adultSite: $adultSite,
    gamblingSite: $gamblingSite,
    shoppingSite: $shoppingSite,
    misleading: $misleading,
    dangerous: $dangerous,
    clickbait: $clickbait,
    others: $others
  }){
    result
  }
}
`

export const GET_PROFILE_DATA = gql`
mutation getProfileData($studentInteractionId: ID!){
  getProfileData(input:{
    studentInteractionId: $studentInteractionId
  }){
    publicVues{
      id
      title
      description
      url
      create
      conversationDisabled
      public
      image{
        id
        image
        thumnail
        thumnailUrl
        width
        height
      }
      domain{
        domainUrl
        domainName
        siteName
      }
      vueinterestSet{
        edges{
          node{
            interestKeyword{
              id
              word
            }
          }
        }
      }
    }
    discoveries{
      id
      title
      updated
      vuediscoverySet{
        edges{
          node{
            id
            vue{
              id
            }
          }
        }
      }
    }
  }
}
`

// ------------------------------------------------------ VUE ---------------------------------------------------------------



// ------------------------------------------------------ DISCOVERY ---------------------------------------------------------------

export const MY_DISCOVERY = gql`
query{
  allMyDiscovery{
    edges{
      node{
        id
        title
        updated
        vuediscoverySet{
          edges{
            node{
              id
              vue{
                id
              }
            }
          }
        }
      }
    }
  }
}
`

export const DISCOVERY_PUBLISH = gql`
mutation discoveryPublish($title: String!, $vueIds: [ID]!){
  discoveryPublish(input:{
    title: $title,
    vueIds: $vueIds
  }){
    discovery{
      id
      title
      updated
      vuediscoverySet{
        edges{
          node{
            id
            vue{
              id
            }
          }
        }
      }
    }
  }
}
`

export const DISCOVERY_EDIT = gql`
mutation discoveryEdit($discoveryId: ID!, $title: String!, $vueIds: [ID]!){
  discoveryEdit(input:{
    discoveryId: $discoveryId,
    title: $title,
    vueIds: $vueIds
  }){
    discovery{
      id
      title
      updated
      vuediscoverySet{
        edges{
          node{
            id
            vue{
              id
            }
          }
        }
      }
    }
  }
}
`

export const DISCOVERY_DELETE = gql`
mutation discoveryDelete($discoveryId: ID!){
  discoveryDelete(input:{
    discoveryId: $discoveryId
  }){
    result
  }
}
`


// ------------------------------------------------------ DISCOVERY ---------------------------------------------------------------



// ------------------------------------------------------ EXPLORERS ----------------------------------------------------------

export const ALL_INTERACTION_EXPLORERS = gql`
query allInteractionExplorers{
  allInteraction(converseRemoved:false, explorers:true){
    edges{
      node{
        id
        expire
        blocked
        conversecontext{
          contextType
          vue{
            id
            title
            description
            url
            image{
              id
              image
              thumnail
              thumnailUrl
              width
              height
            }
            author{
              id
              region
              age
            }
            domain{
              domainUrl
              domainName
              siteName
            }
          }
        }
        studentinteractionSet{
          edges{
            node{
              id
              acceptedConnection
              blockedInteraction
              student{
                id
                fullName
                nickname
                lastSeen
                online
                deleted
                sex
                dob
                age
                profilePicture
                profilePictureUrl
                region
                country
              }
            }
          }
        }
        chatmessageSet(first:10){
          pageInfo{
            hasNextPage
            startCursor
            endCursor
          }
          edges{
            cursor
            node{
              id
              attachementType
              image{
                id
                image
                imageUrl
                thumnail
                thumnailUrl
                width
                height
              }
              link{
                id
                title
                description
                url
                image{
                  id
                  image
                  thumnail
                  thumnailUrl
                  width
                  height
                }
                domain{
                  domainUrl
                  domainName
                  siteName
                }
              }
              vue{
                id
            		title
               	description
            		url
                image{
                  id
                  image
                  thumnail
                  thumnailUrl
                  width
                  height
                }
                domain{
                  domainUrl
                  domainName
                  siteName
                }
              }
              body
              created
              seen
              deleted
              sender{
                id
              }
              context{
                id
                attachementType
                image{
                  id
                  image
                  imageUrl
                  thumnail
                  thumnailUrl
                  width
                  height
                }
                link{
                  id
                  title
                  description
                  url
                  image{
                    id
                    image
                    thumnail
                    thumnailUrl
                    width
                    height
                  }
                  domain{
                    domainUrl
                    domainName
                    siteName
                  }
                }
                vue{
                  id
                  title
                  description
                  url
                  image{
                    id
                    image
                    thumnail
                    thumnailUrl
                    width
                    height
                  }
                  domain{
                    domainUrl
                    domainName
                    siteName
                  }
                }
                body
                created
                seen
                deleted
                sender{
                  id
                }
              }
            }
          }
        }
        conversemessageSet(first:3){
          pageInfo{
            hasNextPage
            startCursor
            endCursor
          }
          edges{
            cursor
            node{
              id
              messageType
              created
              seen
              opened
              body
              sender{
                id
              }
            }
          }
        }
        draftconversemessageSet{
          edges{
            node{
              id
              messageType
              inTransit
              body
              updated
            }
          }
        }
      }
    }
  }
}
`

export const ALL_CHAT = gql`
query allConverse($interactionId: ID!, $first: Int, $after: String){
  interaction(id: $interactionId){
    chatmessageSet(first: $first, after: $after){
      pageInfo{
        hasNextPage
        startCursor
        endCursor
      }
      edges{
        cursor
        node{
          id
          attachementType
          image{
            id
            image
            imageUrl
            thumnail
            thumnailUrl
            width
            height
          }
          link{
            id
            image{
              id
              image
              thumnail
              thumnailUrl
              width
              height
            }
            title
            description
            url
            domain{
              domainUrl
              domainName
              siteName
            }
          }
          vue{
            id
            title
            description
            url
            image{
              id
              image
              thumnail
              thumnailUrl
              width
              height
            }
            domain{
              domainUrl
              domainName
              siteName
            }
          }
          body
          created
          seen
          deleted
          sender{
            id
          }
          context{
            id
            attachementType
            image{
              id
              image
              imageUrl
              thumnail
              thumnailUrl
              width
              height
            }
            link{
              id
              image{
                id
                image
                thumnail
                thumnailUrl
                width
                height
              }
              title
              description
              url
              domain{
                domainUrl
                domainName
                siteName
              }
            }
            vue{
              id
              title
              description
              url
              image{
                id
                image
                thumnail
                thumnailUrl
                width
                height
              }
              domain{
                domainUrl
                domainName
                siteName
              }
            }
            body
            created
            seen
            deleted
            sender{
              id
            }
          }
        }
      }
    }
  }
}
`

export const CHAT_MESSAGE_CURSOR = gql`
mutation chatMessageCursor($chatMessageId: ID!){
  chatMessageCursor(input:{
    chatMessageId: $chatMessageId
  }){
    cursor
  }
}
`

export const CHAT_MESSAGE = gql`
query chatMessage($chatMessageId: ID!){
  chatMessage(id: $chatMessageId){
    attachementType
    image{
      id
      image
      imageUrl
      thumnail
      thumnailUrl
      width
      height
    }
    link{
      id
      title
      description
      url
      image{
        id
        image
        thumnail
        thumnailUrl
        width
        height
      }
      domain{
        domainUrl
        domainName
        siteName
      }
    }
    vue{
      id
      title
      description
      url
      image{
        id
        image
        thumnail
        thumnailUrl
        width
        height
      }
      domain{
        domainUrl
        domainName
        siteName
      }
    }
    body
    created
    seen
    deleted
    sender{
      id
    }
  }
}
`

export const SEND_CHAT_MESSAGE = gql`
mutation sendChatMessage(
  $interactionId: ID!,
  $message: String,
  $messageContextId: ID,
  $linkImageUrl: String,
  $linkImageWidth: Int,
  $linkImageHeight: Int,
  $linkTitle: String,
  $linkUrl: String,
  $linkDomainName: String,
  $linkSiteName: String,
  $imageFile: Upload
){
  sendChatMessage(input:{
    interactionId: $interactionId,
    message: $message,
    messageContextId: $messageContextId,
    linkImageUrl: $linkImageUrl,
    linkImageWidth: $linkImageWidth,
    linkImageHeight: $linkImageHeight,
    linkTitle: $linkTitle,
    linkUrl: $linkUrl,
    linkDomainName: $linkDomainName,
    linkSiteName: $linkSiteName,
    imageFile: $imageFile
  }){
    chatMessage{
      id
      attachementType
      image{
        id
        image
        imageUrl
        thumnail
        thumnailUrl
        width
        height
      }
      link{
        id
        image{
          id
          image
          thumnail
          thumnailUrl
          width
          height
        }
        title
        description
        url
        domain{
          domainUrl
          domainName
          siteName
        }
      }
      vue{
        id
        title
        description
        url
        image{
          id
          image
          thumnail
          thumnailUrl
          width
          height
        }
        domain{
          domainUrl
          domainName
          siteName
        }
      }
      body
      created
      seen
      deleted
      sender{
        id
      }
      context{
        id
        attachementType
        image{
          id
          image
          imageUrl
          thumnail
          thumnailUrl
          width
          height
        }
        link{
          id
          image{
            id
            image
            thumnail
            thumnailUrl
            width
            height
          }
          title
          description
          url
          domain{
            domainUrl
            domainName
            siteName
          }
        }
        vue{
          id
          title
          description
          url
          image{
            id
            image
            thumnail
            thumnailUrl
            width
            height
          }
          domain{
            domainUrl
            domainName
            siteName
          }
        }
        body
        created
        seen
        deleted
        sender{
          id
        }
      }
    }
  }
}
`

export const MARK_CHAT_MESSAGE_SEEN = gql`
mutation markChatMessageSeen($interactionId: ID!){
  markChatMessageSeen(input:{
    interactionId: $interactionId
  }){
    result
  }
}
`

export const DELETE_CHAT_MESSAGE = gql`
mutation deleteChatMessage($chatMessageId: ID!){
  deleteChatMessage(input:{
    chatMessageId: $chatMessageId
  }){
    result
  }
}
`

export const CHAT_MESSAGE_CREATED = gql`
subscription chatMessageCreated($token: String!){
  chatMessageCreated(token: $token){
    id
    attachementType
    image{
      id
      image
      imageUrl
      thumnail
      thumnailUrl
      width
      height
    }
    link{
      id
      image{
        id
        image
        thumnail
        thumnailUrl
        width
        height
      }
      title
      description
      url
      domain{
        domainUrl
        domainName
        siteName
      }
    }
    vue{
      id
      title
      description
      url
      image{
        id
        image
        thumnail
        thumnailUrl
        width
        height
      }
      domain{
        domainUrl
        domainName
        siteName
      }
    }
    body
    created
    seen
    deleted
    sender{
      id
    }
    context{
      id
      attachementType
      image{
        id
        image
        imageUrl
        thumnail
        thumnailUrl
        width
        height
      }
      link{
        id
        image{
          id
          image
          thumnail
          thumnailUrl
          width
          height
        }
        title
        description
        url
        domain{
          domainUrl
          domainName
          siteName
        }
      }
      vue{
        id
        title
        description
        url
        image{
          id
          image
          thumnail
          thumnailUrl
          width
          height
        }
        domain{
          domainUrl
          domainName
          siteName
        }
      }
      body
      created
      seen
      deleted
      sender{
        id
      }
    }
  }
}
`

export const CHAT_MESSAGE_UPDATED = gql`
subscription chatMessageUpdated($token: String!){
  chatMessageUpdated(token: $token){
    id
    seen
    deleted
    interaction{
      id
    }
    sender{
      id
    }
  }
}
`

export const TYPING_STATUS_UPDATED = gql`
subscription typingStatusUpdated($token: String!){
  typingStatusUpdated(token: $token){
    id
    interaction{
      id
    }
    typing
  }
}
`

// ------------------------------------------------------ EXPLORERS ----------------------------------------------------------


// ------------------------------------------------------ CONVERSE -----------------------------------------------------------

export const ALL_INTERACTION_CONVERSE = gql`
query allInteractionConverse{
  allInteraction(blocked:false, converseRemoved:false, converse:true){
    edges{
      node{
        id
        expire
        blocked
        conversecontext{
          contextType
          vue{
            id
            title
            description
            url
            image{
              id
              image
              thumnail
              thumnailUrl
              width
              height
            }
            author{
              id
              region
              age
            }
            domain{
              domainUrl
              domainName
              siteName
            }
          }
        }
        studentinteractionSet{
          edges{
            node{
              id
              acceptedConnection
              blockedInteraction
              student{
                id
                nickname
                lastSeen
                deleted
              }
            }
          }
        }
        conversemessageSet(first:3){
          pageInfo{
            hasNextPage
            startCursor
            endCursor
          }
          edges{
            cursor
            node{
              id
              messageType
              created
              seen
              opened
              body
              sender{
                id
              }
            }
          }
        }
        draftconversemessageSet{
          edges{
            node{
              id
              messageType
              inTransit
              body
              updated
            }
          }
        }
      }
    }
  }
}
`

export const ALL_CONVERSE = gql`
query allConverse($interactionId: ID!, $first: Int, $after: String){
  interaction(id: $interactionId){
    conversemessageSet(first: $first, after: $after){
      pageInfo{
        hasNextPage
        startCursor
        endCursor
      }
      edges{
        cursor
        node{
          id
          messageType
          created
          seen
          opened
          body
          sender{
            id
          }
        }
      }
    }
  }
}
`

export const CONVERSE_MESSAGE_CURSOR = gql`
mutation converseMessageCursor($converseMessageId: ID!){
  converseMessageCursor(input:{
    converseMessageId: $converseMessageId
  }){
    cursor
  }
}
`

export const SEND_CONVERSATION = gql`
mutation sendConversation($messageType: String!, $studentInteractionId: ID!){
  sendConversation(input:{
    messageType: $messageType,
    studentInteractionId: $studentInteractionId
  }){
    result
  }
}
`

export const REMOVE_CONVERSATION = gql`
mutation removeConversation($studentInteractionId: ID!){
  removeConversation(input:{
    studentInteractionId: $studentInteractionId
  }){
    result
  }
}
`

export const TOUCH_CONVERSATION = gql`
mutation touchConverse($converseMessageId: ID!, $converseSeen: Boolean!){
  touchConversation(input:{
    converseMessageId: $converseMessageId,
    converseSeen: $converseSeen
  }){
    result
  }
}
`

export const BECOME_EXPLORERS = gql`
mutation explorers($userInteractionId: ID!){
  becomeExplorers(input:{
    studentInteractionId: $userInteractionId
  }){
    result
  }
}
`

export const CONVERSE_MESSAGE_UPDATED = gql`
subscription converseMessageUpdated($token: String!){
  converseMessageUpdated(token: $token){
    id
    messageType
    created
    seen
    opened
    body
    interaction{
      id
      explorers
      converse
    }
    sender{
      id
    }
  }
}
`

export const NEW_CONVERSATION_UPDATE = gql`
mutation newConversationUpdate($value: Boolean!){
  newConversationUpdate(input:{
    value: $value
  }){
    result
  }
}
`

// ------------------------------------------------------ CONVERSE -----------------------------------------------------------

// ------------------------------------------------------ DRAFT --------------------------------------------------------------

export const ALL_INTERACTION_DRAFT_CONVERSE = gql`
query allInteractionDraftConverse{
  allInteraction(blocked:false, converseRemoved:false, draftConverse:true){
    edges{
      node{
        id
        expire
        blocked
        conversecontext{
          contextType
          vue{
            id
            title
            description
            url
            image{
              id
              image
              thumnail
              thumnailUrl
              width
              height
            }
            author{
              id
              region
              age
            }
            domain{
              domainUrl
              domainName
              siteName
            }
          }
        }
        studentinteractionSet{
          edges{
            node{
              id
              acceptedConnection
              blockedInteraction
              student{
                id
                nickname
                newConversationDisabled
                lastSeen
                deleted
              }
            }
          }
        }
        draftconversemessageSet{
          edges{
            node{
              id
              messageType
              inTransit
              body
              updated
            }
          }
        }
      }
    }
  }
}
`

export const SAVE_DRAFT_MESSAGE = gql`
mutation saveDraft($draftId: ID!, $message: String!){
  saveDraftConversation(input:{
    draftConverseMessageId: $draftId,
    message: $message
  }){
    result
  }
}
`

// ------------------------------------------------------ DRAFT --------------------------------------------------------------


// ------------------------------------------------------ INSTITUTION --------------------------------------------------------

export const SEARCH_INSTITUTION = gql`
query institutionByName($name:String, $acronym:String){
  allInstitution(name_Istartswith: $name, abbreviation_Istartswith: $acronym){
    edges{
      node{
        uid
        name
        emailDomain
        abbreviation
        location{
          region{
            name
            stateOrProvince{
              country{
                name
                code
              }
            }
          }
        }
        logo{
          id
          image
          imageUrl
          thumnail
          thumnailUrl
          width
          height
        }
      }
    }
  }
}
`

export const CONNECT_INSTITUTION = gql`
mutation connectInstitution($institutionUid: String!, $email: String!){
  connectInstitution(input:{
    institutionUid: $institutionUid,
    email: $email
  }){
    result
  }
}
`

export const RESEND_OTP_CONNECT_INSTITUTION = gql`
mutation resendOtpConnectInstitution($key: String!){
  resendOtpConnectInstitution(input:{
    key: $key
  }){
    result
  }
}
`

export const VERIFY_CONNECT_INSTITUTION = gql`
mutation verifyConnectInstitution($key: String!, $verificationCode: Int!){
	verifyConnectInstitution(input:{
    key: $key,
    verificationCode: $verificationCode
  }){
    result
  }
}
`

// ------------------------------------------------------ INSTITUTION --------------------------------------------------------

export const ONLINE_STATUS_UPDATED = gql`
subscription online($token: String!){
  onlineStatus(token: $token){
    id
    lastSeen
    online
  }
}
`

export const LINK_VALIDATION_MUTATION = gql`
mutation link_validation($link:String!){
  linkValidation(input:{
    link:$link
  }){
    redirect
    resolvedUrl
    connection
    blackList
    error
    linkPreview
  }
}
`

export const GENERATE_LINK_PREVIEW = gql`
mutation linkPreview($link: String!){
  generateLinkPreview(input:{
    link: $link
  }){
    image,
    title,
    siteName,
    url
    error
  }
}
`

export const START_CONVERSATION = gql`
mutation startConverse($vueId: ID!){
  startConversation(input:{
    vueId: $vueId
  }){
    result
  }
}
`

export const DELETE_INTERACTION = gql`
mutation deleteInteraction($interactionId: ID!){
  deleteInteraction(input:{
    interactionId: $interactionId
  }){
    result
  }
}
`

export const DECLINE_INTERACTION = gql`
mutation declineInteraction($userInteractionId: ID!, $report: Boolean!){
  declineInteraction(input:{
    studentInteractionId: $userInteractionId,
    report: $report
  }){
    result
  }
}
`

export const RESTART_INTERACTION = gql`
mutation restartInteraction($studentInteractionId: ID!){
  restartInteraction(input:{
    studentInteractionId: $studentInteractionId
  }){
    result
  }
}
`