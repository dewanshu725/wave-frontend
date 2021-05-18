import { INTEREST_KEYWORD } from './../../../../../../_helpers/constents';
import { ResponsiveService } from './../../../../../../_services/responsive.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { LINK_VALIDATION_MUTATION } from './../../../../../../_helpers/graphql.query';
import { GraphqlService } from './../../../../../../_services/graphql.service';
import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AppDataShareService } from './../../../../../../_services/app-data-share.service';
import { LINK_ERROR, LINK_PREVIEW } from 'src/app/_helpers/constents';
import { getDomain, truncate } from 'src/app/_helpers/functions.utils';

@Component({
  selector: 'app-create-vue',
  templateUrl: './create-vue.component.html',
  styleUrls: ['./create-vue.component.scss']
})
export class CreateVueComponent implements OnInit, OnDestroy {

  constructor(
    private appDataShareService:AppDataShareService,
    private graphqlService:GraphqlService,
    private responsiveService:ResponsiveService,
    private http:HttpClient
    ) { }

  isMobile:boolean;

  appContainerHeight:string;
  webLinkInputError = false;
  webLinkDistabled = false;


  linkValidationLoading = false;
  @Output() linkResultStatus = new EventEmitter();
  @Output() vueConstructed = new EventEmitter();
  @Output() vueSubmited = new EventEmitter();

  currentSelectedInterest:INTEREST_KEYWORD[] = [];
  selectedInterestUnsub: Subscription;

  linkError:LINK_ERROR = {
    error:false,
    blacklist:false,
    sentence_filler:"",
    error_message:""
  }

  linkPreview:LINK_PREVIEW;
  linkPreviewResult = new BehaviorSubject<boolean>(null);
  linkPreviewResultSuccess = false;
  createVue = true;

  inputChange(){
    this.webLinkInputError = this.webLinkInputError ? false : false;
  }

  linkPreviewApi(link){
    const postData = {
      key:"ebf51b5b1f009deb57bd0b5f7879f541",
      q:link
    }
    this.http.post("https://api.linkpreview.net",postData)
    .toPromise().then((data:any) =>{
      const domain_url = getDomain(link);

      this.linkPreview = {
        image: data.image ? data.image : null,
        image_height: null,
        title: data.title ? data.title : null,
        truncated_title: data.title ? truncate(data.title, 34) : null,
        url: link,
        domain_url: domain_url,
        domain_name: domain_url.split('.')[0],
        site_name: null,
      }
      this.linkPreviewResult.next(true);
    })
    .catch((error:HttpErrorResponse) =>{
      if (error.status === 0){
        this.linkResultStatus.emit("");
        this.linkValidationLoading = false;
        if (this.graphqlService.internetStatus){
          this.linkError = {
            error:true,
            blacklist:false,
            sentence_filler:"Universe is unpredictable",
            error_message:error.statusText
          }
        }
        else{
          this.linkError = {
            error:true,
            blacklist:false,
            sentence_filler:"You don't have",
            error_message:"Proper Internet"
          }
        }
      }
      else{
        const domain_url = getDomain(link);

        this.linkPreview = {
          image: null,
          image_height: null,
          title: null,
          truncated_title: null,
          url: link,
          domain_url: domain_url,
          domain_name: domain_url.split('.')[0],
          site_name: null,
        }
        this.linkPreviewResult.next(true);
      }
    })

  }

  fbLinkPreviewApi(link){
    const postData = {
      linkpreview:true,
      id:link,
      access_token:"531959037948716%7CY6r4GuUxW8txZ_fkaq21cf0ZIKM"
    }
    this.http.post("https://graph.facebook.com/v9.0/",postData)
    .toPromise().then((data:any) =>{
      if (data.image && data.title){
        const domain_url = getDomain(link);

        this.linkPreview = {
          image: data.image[0].url,
          image_height: null,
          title: data.title,
          truncated_title: truncate(data.title, 34),
          url: postData.id,
          domain_url: domain_url,
          domain_name: domain_url.split('.')[0],
          site_name: data.site_name ? data.site_name : null
        }
        this.linkPreviewResult.next(true);
      }
      else{
        this.linkPreviewApi(postData.id);
      }
    })
    .catch((error:HttpErrorResponse) =>{
      if (error.status === 0){
        this.linkResultStatus.emit("");
        this.linkValidationLoading = false;
        if (this.graphqlService.internetStatus){
          this.linkError = {
            error:true,
            blacklist:false,
            sentence_filler:"Universe is unpredictable",
            error_message:error.statusText
          }
        }
        else{
          this.linkError = {
            error:true,
            blacklist:false,
            sentence_filler:"You don't have",
            error_message:"Proper Internet"
          }
        }
      }
      else{
        this.linkPreviewApi(postData.id);
      }
    });
  }

  onLinkSubmit(event){
    const webLink = event.target.webLink.value;
    const validURL = webLink.match(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,10}(:[0-9]{1,10})?(\/.*)?$/g);
    if (validURL){
      this.webLinkDistabled = true;
      this.linkValidationLoading = true;
      this.linkResultStatus.emit("Validating...");

      const mutationArrgs = {
        "link": webLink
      }

      this.graphqlService.graphqlMutation(LINK_VALIDATION_MUTATION, mutationArrgs).pipe(take(1))
      .subscribe((result:any) =>{
        if(result.errors){
          this.linkResultStatus.emit("");
          this.linkValidationLoading = false;
          this.linkError = {
            error:true,
            blacklist:false,
            sentence_filler:"something went wrong",
            error_message:"On Our End"
          }
        }
        else{
          const data = result.data.linkValidation;
          if (data.error){
            this.linkValidationLoading = false;
            this.linkError.error = true;
            this.linkResultStatus.emit("");

            if (data.error === 'INVALID_LINK'){
              this.linkError.sentence_filler = "your web link is";
              this.linkError.error_message = "Invalide";
            }
            else if (data.error === 'TIMEOUT'){
              this.linkError.sentence_filler = "your web link is taking";
              this.linkError.error_message = "Too Much Time To Respond";
            }
            else if (data.error === 'TOO_MANY_REDIRECTS'){
              this.linkError.sentence_filler = "your web link has";
              this.linkError.error_message = "Too Many Redirects";
            }
            else if (data.error === 'BROKEN_LINK'){
              this.linkError.sentence_filler = "your web link is";
              this.linkError.error_message = "Not Responding";
            }
          }
          else if (data.blackList){
            this.linkValidationLoading = false;
            this.linkResultStatus.emit("");
            this.linkError.error = true;
            this.linkError.blacklist = true;
            this.linkError.sentence_filler = "your web link points to";

            if (data.blackList === 'ADULT'){
              this.linkError.error_message = "Adult Content";
            }
            else if(data.blackList === 'GAMBLING'){
              this.linkError.error_message = "Gambling Website";
            }
            else if(data.blackList === 'SHOPPING'){
              this.linkError.error_message = "Shopping Website";
            }
          }
          else{
            this.linkResultStatus.emit("Preparing your Vue...")
            const link = data.resolvedUrl;
            this.fbLinkPreviewApi(link);

            this.linkPreviewResult.pipe(take(2))
            .subscribe(result =>{
              if (result){
                this.linkResultStatus.emit("");
                this.vueConstructed.emit(true);
                this.linkValidationLoading = false;
                this.linkPreviewResultSuccess = true;
              }
            });
          }
        }
      },
      error =>{
        this.linkResultStatus.emit("");
        this.linkValidationLoading = false;
        if (this.graphqlService.internetStatus){
          this.linkError = {
            error:true,
            blacklist:false,
            sentence_filler:"something went wrong",
            error_message:"On Our End"
          }
        }
        else{
          this.linkError = {
            error:true,
            blacklist:false,
            sentence_filler:"You don't have",
            error_message:"Proper Internet"
          }
        }
      });
    }
    else{
      this.webLinkInputError = true;
    }
  }

  tryAgain(){
    this.webLinkDistabled = false;
    this.linkError = {
      error:false,
      blacklist:false,
      sentence_filler:"",
      error_message:""
    }
  }

  ngOnInit(): void {
    this.appContainerHeight = (this.appDataShareService.appContainerHeight - 59 - 10 - 10 - 16 - 45) + 'px';

    this.isMobile = this.responsiveService.isMobile;

    this.currentSelectedInterest = this.appDataShareService.currentSelectedInterestArray;

      this.selectedInterestUnsub = this.appDataShareService.currentSelectedInterest()
      .subscribe(result =>{
        this.currentSelectedInterest = this.appDataShareService.currentSelectedInterestArray;
      });
  }

  ngOnDestroy(){
    this.selectedInterestUnsub.unsubscribe();
    this.currentSelectedInterest = [];
  }

}
