import gql from 'graphql-tag';

export const IMAGE_UPLOAD_MUTATION = gql`
mutation imageupload($image:Upload){
    imageUpload(imgFile:$image){
      imgUrl
    }
  }
`

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
      profilePictureUrl
      studentprofile{
        institution{
          uid
          name
        }
        conversationPoints
        locationPreference
        agePreference
        state
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
      profilePictureUrl
      studentprofile{
        institution{
          uid
          name
        }
        conversationPoints
        locationPreference
        agePreference
        state
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

export const USER_SUBSCERIBTION_QUERY = gql`
subscription{
userCreated{
    id
    email
    firstName
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
    profilePictureUrl
    studentprofile{
      institution{
        uid
        name
      }
      conversationPoints
      locationPreference
      agePreference
      state
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

export const VUE_PUBLISH = gql`
mutation publish($vueJson:String!){
  vuePublish(input:{
    vueJson: $vueJson
  }){
    result
  }
}
`

export const MY_VUE = gql`
query myvue($first:Int, $after:String){
  allMyVue(first: $first, after: $after){
    pageInfo{
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    edges{
      cursor
      node{
        id
        truncatedTitle
        description
        domainName
        url
        conversationDisabled
        siteName
        image
        imageHeight
        create
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

export const VUE_CONVERSATION_UPDATE = gql`
mutation conversation($vueID:ID!){
  vueConversationUpdate(input:{
    vueId: $vueID
  }){
    result
  }
}
`

export const VUE_DESCRIPTION_UPDATE = gql`
mutation description($vueId:ID!, $description:String!){
  vueDescriptionUpdate(input:{
    vueId:$vueId
    description:$description
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

export const STUDENT_INTEREST_SNAPSHOT = gql`
mutation{
  studentInterestSnapshot(input:{}){
    result
  }
}
`

export const VUE_FEED = gql`
query vue_feed($first:Int, $after:String){
  vueFeed(first: $first, after: $after, opened: false, saved: false){
    pageInfo{
      hasNextPage
      startCursor
      endCursor
    }
    edges{
      cursor
      node{
        id
        priority
        opened
        saved
        conversationStarted
        vue{
          id
          truncatedTitle
          description
          domainName
          url
          siteName
          image
          imageHeight
          create
          country
          region
          institution
          locationPreference
          age
          agePreference
          conversationPoint
          conversationDisabled
          newConversationDisabled
          autoConversationDisabled
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
          truncatedTitle
          description
          domainName
          url
          siteName
          image
          imageHeight
          create
          country
          region
          institution
          locationPreference
          age
          agePreference
          conversationPoint
          conversationDisabled
          newConversationDisabled
          autoConversationDisabled
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
                conversationStarted
              }
            }
          }
        }
      }
    }
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
          truncatedTitle
          description
          domainName
          url
          siteName
          image
          imageHeight
          create
          country
          region
          institution
          locationPreference
          age
          agePreference
          conversationPoint
          conversationDisabled
          newConversationDisabled
          autoConversationDisabled
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
                conversationStarted
              }
            }
          }
        }
      }
    }
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
