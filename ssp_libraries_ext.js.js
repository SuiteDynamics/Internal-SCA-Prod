
try{
    function _getDomain(){
        var session = nlapiGetWebContainer().getShoppingSession();
        var domain;
        if(_.isFunction(session.getEffectiveShoppingDomain)){
            domain = session.getEffectiveShoppingDomain();
        }
        else{
            var home = session.getSiteSettings(['touchpoints']).touchpoints.home;
            var home_match = home.match(/https?:\/\/([^#?\/]+)[#?\/]?/);
            if(!home_match){
                home_match = home.match(/\?btrgt=https?%3A%2F%2F([^#?\/]+)[#?\/]?/);
            }
            domain = home_match[1];
        }
        return domain;
    }
    var current_domain = _getDomain();
    var Configuration = require('Configuration');
    Configuration.overwriteByDomain({"www.suitedynamics.co":{"StitchPayments":{"config":"Default config example"},"blog":{"blogHomeTitle":"Blog","readMoreLabel":"Read More","allArticlesTaxonomyName":"All Articles","showFeaturedArticlesInPagination":true,"moreArticlesLabel":"More Articles","searchLabel":"Search This Blog","searchHint":"Search","searchResultsLabel":"Search Results","noSearchResultsLabel":"Not many results for [[term]]","noResultsArticleSuggestionMessage":"Search again or see these articles:","searchCloseButtonLabel":"Close","taxonomyNavigationTitle":"Categories","paginationLabel":"Read More Articles","backToTopLabel":"Back To Top","largeImageResizeId":"zoom","thumbnailImageResizeId":"zoom","articlesByPage":"20","emptyStateLabel":"Articles are coming soon!","emptyStateMessage":"Meanwhile, visit our shop","emptyStateButtonLabel":"Shop Now","showLatestPostsSection":true,"latestPostsLabel":"Latest Articles","latestPostsCarouselInterval":"5 sec","showRssFeedLink":false}}});
    require('SCA');
    var extensions = {};
     var srcDefine = define;
      ProxyPolyfill = function(target, handler) {
          var proxy = this;
            const getter = handler.get ? function(prop) {
             return handler.get(this, prop, proxy);
            } : function(prop) {
             return this[prop];
          };
          const propertyNames = Object.getOwnPropertyNames(target);
          propertyNames.forEach(function(prop) {
              const desc = {
                  get: getter.bind(target, prop)
              };
              Object.defineProperty(proxy, prop, desc);
          });
          return proxy;
      };
    extensions['SuiteDynamics.StitchPayments.1.0.0'] = function(extensionName){
      var define = function(moduleName, dependencies, callback) {
          for (var i = 0; i < dependencies.length; i++){
              var dep = dependencies[i];
              if (dep === 'Application' && dep.indexOf(extensionName + '.Plugin!') === -1) {
                  dependencies[i] = extensionName + '.Plugin!' + dep;
              }
          }
          return srcDefine(moduleName, dependencies, callback);
      };
      define(extensionName + '.Plugin', [], function (){
          return {
                load: function (name, req, onload, config){
                  try{
                        req(
                          [name],
                          function (value) {
                              const proxy = new ProxyPolyfill(value, {
                                  get: function (target, prop, receiver){
                                      var targetProp = target[prop];
                                      if(typeof targetProp === 'function'){
                                          targetProp = function() {
                                              var args = Array.prototype.slice.call(arguments)
                                              if(prop === 'getComponent'){
                                                  args.push(extensionName);
                                              }
                                              return target[prop].apply(target, args);
                                          }
                                      }                                  return targetProp;
                                  }
                              });
                              onload(proxy);
                          },
                          function () {
                              onload(null);
                          });
                  }catch (e) {}
              }
          };
      });
        // Model.js
        // -----------------------
        // @module SezzleSdk.Model
        define("StitchPayments.Model",  [
            "SC.Model",
            "SC.Models.Init",
            "LiveOrder.Model",
            "Application",
            "underscore"
            ], function(
            SCModel,
            ModelsInit,
            LiveOrderModel,
            Application,
            _
        ) {
            "use strict";
            // @class SezzleSdk.Model @extends SC.Model
            return SCModel.extend({
            
                name: "StitchPayments.Model",
                getTokens: function()
                {
                    nlapiLogExecution('DEBUG', 'getTokens', nlapiGetUser());
                    var filters = [
                                    ["custrecord_stitch_cc_token_customer","anyof", nlapiGetUser()], 
                                    "AND", 
                                    ["isinactive","is","F"]
                                  ];
                    var columns = [
                        new nlobjSearchColumn('custrecord_sd_stitch_cc_last_4'),
                        new nlobjSearchColumn('custrecord_stitch_cc_token_card_type'),
                        new nlobjSearchColumn('custrecord_stitch_cc_token_card_name'),
                        new nlobjSearchColumn('custrecord_sd_stitch_is_default_card'),
                        new nlobjSearchColumn('custrecord_stitch_cc_token_exp_month'),
                        new nlobjSearchColumn('custrecord_stitch_cc_token_exp_year'),
                        new nlobjSearchColumn('internalid')
                    ];
                    var search_results = Application.getAllSearchResults('customrecord_stitch_cc_token', filters, columns);
                    nlapiLogExecution('DEBUG', 'search_results', search_results);
                    var stitchCardsArr = [];
                    if(search_results && search_results.length){
                    search_results.forEach(function (card) {
                        var stitch_card = {};
                        stitch_card.last_four = card.getValue('custrecord_sd_stitch_cc_last_4');
                        stitch_card.card_type = card.getValue('custrecord_stitch_cc_token_card_type');
                        stitch_card.card_name = card.getValue('custrecord_stitch_cc_token_card_name');
                        stitch_card.exp_month = card.getValue('custrecord_stitch_cc_token_exp_month');
                        stitch_card.exp_year = card.getValue('custrecord_stitch_cc_token_exp_year');
                        stitch_card.token = card.getValue('custrecord_stitch_cc_token_token');
                        stitch_card.id = card.getValue('internalid');
                        stitch_card.active = false;
                
                        if(card.getValue('custrecord_sd_stitch_is_default_card') == 'T'){
                            stitch_card.default_card = true 
                        }else{
                            stitch_card.default_card = false 
                        }
                        stitchCardsArr.push(stitch_card)
                    })
                    }
                    return JSON.stringify(stitchCardsArr);
                },
                submitToken: function(data){
                    nlapiLogExecution('DEBUG', 'submit', JSON.stringify(data));
                    var userId = nlapiGetUser();
                    //var authResponse = this.submitTokenAuth(data,userId)

                    // if(authResponse.status !== 'Success'){
                    //     nlapiLogExecution('ERROR', 'ERR_NS_AUTH_FAILURE', JSON.stringify({
                    //         message: JSON.stringify(authResponse),
                    //         user: userId,
                    //         action: 'Auth failure, no authorization or Netsuite token created'
                    //     }));
                    //     return{
                    //         status: 'Failed to create token'
                    //     }
                    // }

                    var stitchProfileSubmit = this.submitCustomerProfile(data, userId);
                   
                   

                    if(stitchProfileSubmit.status == 'Success'){

                        try{    
                            var customerUpdate = {
                                internalid: parseInt(nlapiGetUser(), 10),
                                custentity_sd_stitch_profile_id:stitchProfileSubmit.profileid
                            };
                            ModelsInit.customer.updateProfile(customerUpdate);
                            var tokenRec = this.createTokenRecord(data, stitchProfileSubmit.response)

                        }catch(e){
                            nlapiLogExecution('ERROR', 'ERR_NS_TOKEN_CREATE_FAILURE', JSON.stringify({
                                message: e,
                                user: userId,
                                action: 'Token created in CardPointe, Netsuite token record failure'
                            }));
                            return{
                                status: 'Failed to create token'
                            }
                        }
                    }else{
                        nlapiLogExecution('ERROR', 'ERR_CARDPOINTE_TOKEN_CREATE_FAILURE', {
                            message: stitchProfileSubmit,
                            user: userId,
                            action: 'Token not created.'
                        });
                        return{
                            status: 'Failed to create token'
                        }
                    }

                    if(tokenRec){
                        try{
                            //Since we will want to make the new card the default card, we will need to remove the default from the other card
                            this.resetTokenDefaults(userId,tokenRec);
                            return{
                                status: 'Success'
                            }
                        }catch(e){
                            nlapiLogExecution('ERROR', 'ERR_NS_TOKEN_CREATE_FAILURE', JSON.stringify({
                                message: e,
                                user: userId,
                                action: 'Token created in CardPointe, Netsuite token record created, failed to restore defaults'
                            }));
                            return{
                                status: 'Failed to reset defaults'
                            }

                        }

                    }

                },
                updateTokens: function(data){
                    nlapiLogExecution('DEBUG', 'update', 'update');
                    return {'Test': 'test'};
                },
                deleteToken: function(id)
                {
                    nlapiLogExecution('DEBUG', 'deleteToken', id);
                    try{

                        nlapiDeleteRecord('customrecord_stitch_cc_token', id)
                        return{
                            status: 'Success'
                        }

                    }catch(e){

                        nlapiLogExecution('ERROR', 'ERR_TOKEN_DELETE_FAILURE', JSON.stringify({
                            message: e,
                            user: nlapiGetUser(),
                            action: 'Token not Deleted'
                        }));
                    }
                    
                    return {'Test': 'test'};
                },
                submitCustomerProfile: function(data, user){
                    nlapiLogExecution('DEBUG', 'submit', JSON.stringify(data));
                    var stitchCredentials = this.getStitchCredentials(user)
                    //var custInfo = nlapiLookupField('customer', user, ['firstname','lastname','phone']);
                    // //Build body object
                    var stitchBody = {
                        "phone"		: data.phone,
                        "email"		: data.email,
                        "expiry"	: data.expiry,
                        "merchid"	: stitchCredentials.merchantId,
                        "name"		: data.first_name + " " + data.last_name,
                        "account"	: data.token
                    }
                    //Build header object
                    var headerObj = {
                        "Authorization" : stitchCredentials.tokenKey,
                        "Access-Control-Allow-Origin": "*",
                        "Accept": "application/json",
                        "Accept-Encoding": "gzip, deflate, br",
                        "Content-Type": "application/json"
                    }
                    var stitchPaymentsApiUrl = stitchCredentials.baseurl + '/profile'
                    nlapiLogExecution('DEBUG', 'body', JSON.stringify(stitchBody));
                    nlapiLogExecution('DEBUG', 'stitchPaymentsApiUrl', stitchPaymentsApiUrl);
                    nlapiLogExecution('DEBUG', 'headers', JSON.stringify(headerObj));
                    // var response = nlapiRequestURL(stitchPaymentsApiUrl, body, headerObj)
                    nlapiLogExecution('DEBUG', 'submit', JSON.stringify(stitchBody));
                    var response = nlapiRequestURL(stitchPaymentsApiUrl, JSON.stringify(stitchBody), headerObj, 'POST')
                    // var response = nlapiRequestURL(url, body, header, null, "POST");
                    
                    var responseBody = JSON.parse(response.getBody());
                    nlapiLogExecution('DEBUG', 'PROFILE_RESPONSE', JSON.stringify(responseBody));
                    if (response.getCode() == 200 && responseBody.respcode == "09") {
                    
                        return{
                            status: 'Success',
                            response: responseBody
                        }
                        
                    }else{
                        nlapiLogExecution('ERROR', 'CUST_PROFILE_ERR', JSON.stringify(responseBody));
                        return{
                            status: 'Error',
                            response: responseBody
                        }
                    }
                },
                createTokenRecord: function(tokenData, profileData){
                    nlapiLogExecution('DEBUG', 'createTokenRecord', JSON.stringify(profileData));
                    stitchTokenRecord = nlapiCreateRecord('customrecord_stitch_cc_token');
                    stitchTokenRecord.setFieldValue('custrecord_stitch_cc_token_customer', nlapiGetUser());
                    stitchTokenRecord.setFieldValue('custrecord_stitch_cc_token_card_type', profileData.accttype);
                    stitchTokenRecord.setFieldValue('custrecord_stitch_cc_token_exp_month', tokenData.exp_month);
                    stitchTokenRecord.setFieldValue('custrecord_stitch_cc_token_exp_year', tokenData.exp_year);
                    stitchTokenRecord.setFieldValue('custrecord_stitch_cc_token_token', tokenData.token);
                    stitchTokenRecord.setFieldValue('custrecord_sd_stitch_cc_last_4', tokenData.last_four);
                    stitchTokenRecord.setFieldValue('custrecord_sd_stitch_cc_per_token_json', profileData);
                    stitchTokenRecord.setFieldValue('custrecord_sd_stitch_is_default_card', 'T');
                    stitchTokenRecord.setFieldValue('name', profileData.accttype + " " + tokenData.last_four);
        
                    newRec = nlapiSubmitRecord(stitchTokenRecord);
                    nlapiLogExecution('DEBUG', 'newRec id', newRec);
                    return newRec;
                },
                submitTokenAuth: function(data, user){
                    nlapiLogExecution('DEBUG', 'submittokenauth', JSON.stringify(data));
                    var credentials_object = this.getStitchCredentials()
                    if (credentials_object) {
                        var stitchPaymentsApiUrl = credentials_object.baseurl + '/auth'
                        //var orderid = newRecord.getValue('transactionnumber');
                        var customerId = user;

                        var headerObj = {
                            'Authorization': credentials_object.tokenKey,
                            "Access-Control-Allow-Origin": "*",
                            "Accept": "application/json",
                            "Accept-Encoding": "gzip, deflate, br",
                            "Content-Type": "application/json"
                        };

                        var requestBody = {
                            "merchid": credentials_object.merchantId,
                            "account": data.token,
                            "expiry": data.expiry,
                            "ecomind": "E",
                            "amount": data.amount,
                            "name": data.first_name + " " + data.last_name,
                            "email": data.email,
                            "phone": data.phone,
                        }
                        nlapiLogExecution('DEBUG', 'stitchPaymentsApiUrl', stitchPaymentsApiUrl);
                        var stringifyObj = JSON.stringify(requestBody);
                        var response = nlapiRequestURL(stitchPaymentsApiUrl, JSON.stringify(requestBody), headerObj, 'POST')
                        // var myresponse_body = response.body;
                        nlapiLogExecution('DEBUG', 'RAW_RESPONSE', JSON.stringify(response));
                        var responseBody = JSON.parse(response.getBody());
                        nlapiLogExecution('DEBUG', 'AUTH_RESPONSE', JSON.stringify(responseBody));
                        var myresponse_code = response.getCode();
                        if (myresponse_code == 201 || myresponse_code == '201' || myresponse_code == 200 || myresponse_code == '200') {
                            
                            return{
                                status: 'Success',
                                response: responseBody
                            }
                        }else{
                            return{
                                status: 'Error',
                                response: responseBody
                            }
                        }
                    }
                },

                voidAuth: function(auth){
                    if (auth.merchid && auth.retref) {

                        var credentials_object = this.getStitchCredentials();
                        var stitchVoidApiUrl = credentials_object.baseurl + '/void'
                        var headerObj = {
                            'Authorization': credentials_object.tokenKey,
                            "Access-Control-Allow-Origin": "*",
                            "Accept": "application/json",
                            "Accept-Encoding": "gzip, deflate, br",
                            "Content-Type": "application/json"
                        };
            
                        var requestBody = {
                            "merchid": auth.merchid,
                            "retref": auth.retref
                        }
                        nlapiLogExecution('DEBUG', 'void requestBody', JSON.stringify(requestBody));
                        //log.audit('stringifyObj98', stringifyObj)
                        var voidResponse = nlapiRequestURL(stitchVoidApiUrl, JSON.stringify(requestBody), headerObj, 'POST')
                        // var myresponse_body = response.body;
                        nlapiLogExecution('DEBUG', 'RAW_VOID_RESPONSE', JSON.stringify(voidResponse));
                        var responseBody = JSON.parse(voidResponse.getBody());
                        nlapiLogExecution('DEBUG', 'RAW_VOID_RESPONSE_BODY', JSON.stringify(responseBody));
                    }
                },

                resetTokenDefaults: function(user,newTokenRec){
                    nlapiLogExecution('DEBUG', 'resetTokenDefaults', newTokenRec);
                    var filters = [
                        ["custrecord_stitch_cc_token_customer","anyof", user], 
                        "AND", 
                        ["custrecord_sd_stitch_is_default_card","is","T"],
                        "AND", 
                        ["internalid","noneof",newTokenRec]
                      ];
                    var columns = [
                        new nlobjSearchColumn('internalid')
                    ];
                    var search_results = Application.getAllSearchResults('customrecord_stitch_cc_token', filters, columns);
                    if(search_results && search_results.length){
                    search_results.forEach(function (card) {
                        var removeDefaultId = card.getValue('internalid');
                        nlapiLogExecution('DEBUG', 'remove default card', removeDefaultId);
                        nlapiSubmitField('customrecord_stitch_cc_token', removeDefaultId, 'custrecord_sd_stitch_is_default_card', 'F');
                    })
                    }
                    return;
                },
                getStitchCredentials: function(){
                    var stitchCreds = nlapiSearchRecord(
                        'customrecord_stitch_credentials',
                        null,
                        null,
                        [
                        new nlobjSearchColumn('custrecord_stitch_cred_token_key'),
                        new nlobjSearchColumn('custrecord_sd_stitch_merchantid'),
                        new nlobjSearchColumn('custrecord_stitch_cred_base_url')
                        // new nlobjSearchColumn('id')
                        ]
                    );

                    var result = {};
                    if(stitchCreds.length > 0){
                        for (var i = 0; i < stitchCreds.length; i++) {
                            nlapiLogExecution('DEBUG', 'result', stitchCreds[i].getValue("custrecord_stitch_cred_base_url"));
                            result.baseurl = stitchCreds[i].getValue("custrecord_stitch_cred_base_url");
                            result.tokenKey = stitchCreds[i].getValue("custrecord_stitch_cred_token_key");
                            result.merchantId = stitchCreds[i].getValue("custrecord_sd_stitch_merchantid");
                        }
                    }
                   // var sitchCreds = nlapiLookupField('customrecord_stitch_credentials', 1, ['custrecord_stitch_cred_base_url','custrecord_stitch_cred_token_key','custrecord_sd_stitch_merchantid']);
                    nlapiLogExecution('DEBUG', 'get credentials', JSON.stringify(result));
                    return result;
                },
                updateToken: function(data){
                    //nlapiLogExecution('DEBUG', 'put', JSON.stringify(data));
                    var userId = nlapiGetUser();
                   // var authResponse = this.submitTokenAuth(data,userId)
                   var authResponse = {"status":"Success","response":{"respproc":"PPS","amount":"0.00","resptext":"Invalid card","bintype":"","cardproc":"RPCT","commcard":"N","retref":"349596054924","respstat":"C","respcode":"11","entrymode":"ECommerce","account":"","merchid":"800000001560"}}
                    nlapiLogExecution('DEBUG', 'authResponse', JSON.stringify(authResponse));
                    if(authResponse.status !== 'Success'){
                        nlapiLogExecution('ERROR', 'ERR_NS_AUTH_FAILURE', JSON.stringify({
                            message: JSON.stringify(authResponse),
                            user: userId,
                            action: 'Auth failure, no authorization or Netsuite token created'
                        }));
                        return{
                            status: 'Failed to create token'
                        }
                    }else{


                        //TODO:Get Working
                        // var customBodyFields = {};
                        // customBodyFields.options = {
                        //     'custbody_sd_select_st_card': data.id,
                        //     'custbody_sd_stitch_token_response': authResponse
                        //     // 'paymentoption':8
                        // };
                        
                        //LiveOrderModel.setTransactionBodyField(customBodyFields);
                        // ModelsInit.order.setPayment({
                        //     paymentterms: '',
                        //     paymentmethod: 8
                        // });
                        return{
                            status: 'Success',
                            response: authResponse
                        }
                    }

                    if(data.activeAuth){
                        //We need to void any other Authorizations put on other tokens
                        var voidAuth = this.voidAuth(data.activeAuth.authData.response)


                    }    

                }
            });
            
        });

    define("SuiteDynamics.StitchPayments.StitchPayments.ServiceController", ["ServiceController", "StitchPayments.Model", "LiveOrder.Model","underscore"], function(
      ServiceController,
      StitchPaymentsModel,
      LiveOrderModel,
      _
    ) {
      "use strict";
      return ServiceController.extend({
        name: "SuiteDynamics.StitchPayments.StitchPayments.ServiceController",
        // The values in this object are the validation needed for the current service.
        options: {
          common: {}
        },
        get: function get() {
            nlapiLogExecution('DEBUG', 'get', 'get');
          return StitchPaymentsModel.getTokens();
        },
        post: function post() {
            nlapiLogExecution('DEBUG', 'post', 'post');
            return StitchPaymentsModel.submitToken(this.data);
          // not implemented
        },
        put: function put() {
            nlapiLogExecution('DEBUG', 'put', JSON.stringify(this.data));
            //Here we will update the token and submit Authorization
            return StitchPaymentsModel.updateToken(this.data);
          // not implemented
        },
        delete: function() {
            nlapiLogExecution('DEBUG', 'delete', this.request.getParameter('id'));
            return StitchPaymentsModel.deleteToken(this.request.getParameter('id'));
          // not implemented
        }
      });
    });
    // SuiteDynamics.StitchPayments.StitchPayments.js
    // Load all your starter dependencies in backend for your extension here
    // ----------------
    define('SuiteDynamics.StitchPayments.StitchPayments'
    ,	[
            'LiveOrder.Model',
            'SC.Models.Init',
            'underscore'
        ]
    ,	function (
            LiveOrderModel,
            ModelsInit,
            _
        )
    {
        'use strict';
        nlapiLogExecution('DEBUG', 'start backend module', 'start backend module');

        _.extend(LiveOrderModel, {
            setPaymentMethods: function setPaymentMethods(data) {
                // Because of an api issue regarding Gift Certificates, we are going to handle them separately
                var gift_certificate_methods = _.where(data.paymentmethods, {
                    type: 'giftcertificate'
                });
                const non_certificate_methods = _.difference(
                    data.paymentmethods,
                    gift_certificate_methods
                );
    
                // Payment Methods non gift certificate
                if (
                    this.isSecure &&
                    non_certificate_methods &&
                    non_certificate_methods.length &&
                    ModelsInit.session.isLoggedIn2()
                ) {
                    _.each(non_certificate_methods, function (paymentmethod) {
                        if (paymentmethod.type === 'creditcard' && paymentmethod.creditcard) {
                            const credit_card = paymentmethod.creditcard;
                            const require_cc_security_code =
                                ModelsInit.session.getSiteSettings(['checkout']).checkout
                                .requireccsecuritycode === 'T';
                            const cc_obj = credit_card && {
                                ccnumber: credit_card.ccnumber,
                                ccname: credit_card.ccname,
                                ccexpiredate: credit_card.ccexpiredate,
                                expmonth: credit_card.expmonth,
                                expyear: credit_card.expyear,
                                paymentmethod: {
                                    internalid:
                                        credit_card.paymentmethod.internalid ||
                                        credit_card.paymentmethod,
                                    name: credit_card.paymentmethod.name,
                                    creditcard: credit_card.paymentmethod.creditcard ? 'T' : 'F',
                                    ispaypal: credit_card.paymentmethod.ispaypal ? 'T' : 'F',
                                    key: credit_card.paymentmethod.key
                                }
                            };
    
                            if (credit_card.internalid !== '-temporal-') {
                                cc_obj.internalid = credit_card.internalid;
                            } else {
                                cc_obj.internalid = null;
                                cc_obj.savecard = 'F';
                            }
    
                            if (credit_card.ccsecuritycode) {
                                cc_obj.ccsecuritycode = credit_card.ccsecuritycode;
                            }
    
                            if (
                                !require_cc_security_code ||
                                (require_cc_security_code && credit_card.ccsecuritycode)
                            ) {
                                // the user's default credit card may be expired so we detect this using try & catch and if it is we remove the payment methods.
                                try {
                                    // if the credit card is not temporal or it is temporal and the number is complete then set payment method.
                                    if (
                                        cc_obj.internalid ||
                                        (!cc_obj.internalid && !~cc_obj.ccnumber.indexOf('*'))
                                    ) {
                                        ModelsInit.order.removePayment();
    
                                        const cc_parameter = {
                                            paymentterms: 'CreditCard',
                                            creditcard: {
                                                internalid: cc_obj.internalid,
                                                ccsecuritycode: cc_obj.ccsecuritycode,
                                                paymentmethod: {
                                                    internalid: cc_obj.paymentmethod.internalid
                                                }
                                            }
                                        };
                                        if (!cc_obj.internalid) {
                                            cc_parameter.creditcard.ccnumber = cc_obj.ccnumber;
                                            cc_parameter.creditcard.ccname = cc_obj.ccname;
                                            cc_parameter.creditcard.expmonth = cc_obj.expmonth;
                                            cc_parameter.creditcard.expyear = cc_obj.expyear;
                                            cc_parameter.creditcard.savecard = cc_obj.savecard;
                                        }
                                        ModelsInit.order.setPayment(cc_parameter);
    
                                        ModelsInit.context.setSessionObject('paypal_complete', 'F');
                                    }
                                } catch (e) {
                                    if (e && e.code && e.code === 'ERR_WS_INVALID_PAYMENT') {
                                        ModelsInit.order.removePayment();
                                    }
                                    throw e;
                                }
                            }
                            // if the the given credit card don't have a security code and it is required we just remove it from the order
                            else if (require_cc_security_code && !credit_card.ccsecuritycode) {
                                ModelsInit.order.removePayment();
                            }
                        } else if (paymentmethod.type === 'invoice') {
                            ModelsInit.order.removePayment();
    
                            try {
                                ModelsInit.order.setPayment({
                                    paymentterms: 'Invoice'
                                });
                            } catch (e) {
                                if (e && e.code && e.code === 'ERR_WS_INVALID_PAYMENT') {
                                    ModelsInit.order.removePayment();
                                }
                                throw e;
                            }
    
                            ModelsInit.context.setSessionObject('paypal_complete', 'F');
                        } else if (paymentmethod.type === 'paypal') {
                            if (ModelsInit.context.getSessionObject('paypal_complete') !== 'T') {
                                ModelsInit.order.removePayment();
                                const paypal = _.findWhere(ModelsInit.session.getPaymentMethods(), {
                                    ispaypal: 'T'
                                });
                                paypal &&
                                    ModelsInit.order.setPayment({
                                        paymentterms: '',
                                        paymentmethod: paypal.key
                                    });
                            }
                        } else if (
                            paymentmethod.type &&
                            ~paymentmethod.type.indexOf('external_checkout')
                        ) {
                            ModelsInit.order.removePayment();
                            nlapiLogExecution('DEBUG', 'set external', 'set external');
                            nlapiLogExecution('DEBUG', 'paymentmethod', paymentmethod.key);

                            ModelsInit.order.setPayment({
                                paymentmethod: paymentmethod.key,
                                thankyouurl: paymentmethod.thankyouurl,
                                errorurl: paymentmethod.errorurl,
                                merchantid: paymentmethod.merchantid
                            });
                        } else {
                            ModelsInit.order.removePayment();
                        }
                    });
                } else if (this.isSecure && ModelsInit.session.isLoggedIn2()) {
                    ModelsInit.order.removePayment();
                }
    
                gift_certificate_methods = _.map(gift_certificate_methods, function (gift_certificate) {
                    return gift_certificate.giftcertificate;
                });
    
                this.setGiftCertificates(gift_certificate_methods);
            }
        });



    });
    };
    extensions['CXExtensibility.CoreContent.1.0.5'] = function(extensionName){
      var define = function(moduleName, dependencies, callback) {
          for (var i = 0; i < dependencies.length; i++){
              var dep = dependencies[i];
              if (dep === 'Application' && dep.indexOf(extensionName + '.Plugin!') === -1) {
                  dependencies[i] = extensionName + '.Plugin!' + dep;
              }
          }
          return srcDefine(moduleName, dependencies, callback);
      };
      define(extensionName + '.Plugin', [], function (){
          return {
                load: function (name, req, onload, config){
                  try{
                        req(
                          [name],
                          function (value) {
                              const proxy = new ProxyPolyfill(value, {
                                  get: function (target, prop, receiver){
                                      var targetProp = target[prop];
                                      if(typeof targetProp === 'function'){
                                          targetProp = function() {
                                              var args = Array.prototype.slice.call(arguments)
                                              if(prop === 'getComponent'){
                                                  args.push(extensionName);
                                              }
                                              return target[prop].apply(target, args);
                                          }
                                      }                                  return targetProp;
                                  }
                              });
                              onload(proxy);
                          },
                          function () {
                              onload(null);
                          });
                  }catch (e) {}
              }
          };
      });
    define('CXExtensibility.CoreContent.CoreContentModule', [], function (CoreContentModuleServiceController) {
        'use strict';
    });
    };
    var coreLanguages = {"checkout":["cs_CZ","da_DK","de_DE","en_AU","en_CA","en_GB","en_US","es_AR","es_ES","fi_FI","fr_CA","fr_FR","id_ID","it_IT","ja_JP","ko_KR","nb_NO","nl_NL","no_NO","pt_BR","ru_RU","sv_SE","th_TH","tr_TR","vi_VN","zh_CN","zh_TW"],"myaccount":["cs_CZ","da_DK","de_DE","en_AU","en_CA","en_GB","en_US","es_AR","es_ES","fi_FI","fr_CA","fr_FR","id_ID","it_IT","ja_JP","ko_KR","nb_NO","nl_NL","no_NO","pt_BR","ru_RU","sv_SE","th_TH","tr_TR","vi_VN","zh_CN","zh_TW"],"shopping":["cs_CZ","da_DK","de_DE","en_AU","en_CA","en_GB","en_US","es_AR","es_ES","fi_FI","fr_CA","fr_FR","id_ID","it_IT","ja_JP","ko_KR","nb_NO","nl_NL","no_NO","pt_BR","ru_RU","sv_SE","th_TH","tr_TR","vi_VN","zh_CN","zh_TW"]};
     
    var SiteSettings = require('SiteSettings.Model').get();
    var website_id = SiteSettings.siteid;
    var key_mapping = {
        '2': {
            'www.suitedynamics.co': '1'
        }
    };
    var key;
    var ctx = nlapiGetContext();
    var subsidiary = ctx.getSubsidiary();
    var location = ctx.getLocation();
    var subsidiary_key = current_domain + '-' + subsidiary;
    var location_key = subsidiary_key + '-' + location;
    if(website_id === 2 && key_mapping[website_id]){
        var mapping = key_mapping[website_id];
        if(mapping[location_key]){
            key = mapping[location_key];
        }
        else if(mapping[subsidiary_key]){
            key = mapping[subsidiary_key];
        }
        else if(mapping[current_domain]){
            key = mapping[current_domain];
        }
        else if(mapping['activation_id']){
            key = mapping['activation_id'];
        }
    }
    if(key === '1'){
    try{
        extensions['CXExtensibility.CoreContent.1.0.5']('CXExtensibility.CoreContent.1.0.5');
        require('CXExtensibility.CoreContent.CoreContentModule');
    }
    catch(error){
        nlapiLogExecution('ERROR', 'ERROR_SSP_LIBRARIES_EXT', JSON.stringify(error));
    }
    try{
        extensions['SuiteDynamics.StitchPayments.1.0.0']('SuiteDynamics.StitchPayments.1.0.0');
        require('SuiteDynamics.StitchPayments.StitchPayments');
    }
    catch(error){
        nlapiLogExecution('ERROR', 'ERROR_SSP_LIBRARIES_EXT', JSON.stringify(error));
    }
    }
    var include_mapping = {
        "2": {
            "1": {
                "shopping": {
                    "templates": [
                        "extensions/shopping-templates_1.js"
                    ],
                    "js": [
                        "javascript/shopping.js",
                        "extensions/shopping_1.js"
                    ],
                    "css": [
                        "extensions/shopping_1.css"
                    ],
                    "translations": {},
                    "core": {},
                    "ie": []
                },
                "myaccount": {
                    "templates": [
                        "extensions/myaccount-templates_1.js"
                    ],
                    "js": [
                        "javascript/myaccount.js",
                        "extensions/myaccount_1.js"
                    ],
                    "css": [
                        "extensions/myaccount_1.css"
                    ],
                    "translations": {},
                    "core": {},
                    "ie": []
                },
                "checkout": {
                    "templates": [
                        "extensions/checkout-templates_1.js"
                    ],
                    "js": [
                        "javascript/checkout.js",
                        "extensions/checkout_1.js"
                    ],
                    "css": [
                        "extensions/checkout_1.css"
                    ],
                    "translations": {},
                    "core": {},
                    "ie": []
                }
            }
        }
    };
    var theme_assets_paths = {
        "1": "extensions/SuiteDynamics/SuiteDynamics_Custom_Theme/0.1.0/"
    };
    var Application = require('Application');
    var app_includes;
    var isExtended = false;
    var themeAssetsPath = '';
    if(include_mapping[website_id] && include_mapping[website_id][key]){
        app_includes = include_mapping[website_id][key];
      isExtended = true;
      themeAssetsPath = theme_assets_paths[key];
    }
    else{
        app_includes = {
        "shopping": {
            "templates": [
                "shopping-templates.js"
            ],
            "js": [
                "javascript/shopping.js"
            ],
            "css": [
                "css/shopping.css"
            ],
            "core": {},
            "ie": []
        },
        "myaccount": {
            "templates": [
                "myaccount-templates.js"
            ],
            "js": [
                "javascript/myaccount.js"
            ],
            "css": [
                "css/myaccount.css"
            ],
            "core": {},
            "ie": []
        },
        "checkout": {
            "templates": [
                "checkout-templates.js"
            ],
            "js": [
                "javascript/checkout.js"
            ],
            "css": [
                "css/checkout.css"
            ],
            "core": {},
            "ie": []
        }
    };
        _.each(app_includes, function(app){
            app.templates = _.map(app.templates, function(file){
                return Application.getNonManageResourcesPathPrefix() + file;
            });
            app.css = _.map(app.css, function(file){
                return Application.getNonManageResourcesPathPrefix() + file;
            });
            if(Configuration.get().unmanagedResourcesFolderName)
            {
                app.js.unshift('backward-compatibility-amd-unclean.js');
            }
        });
    }
    _.each(app_includes, function(app, app_name){
        app.js = app.templates.concat(app.js);
        app.core.translations = coreLanguages[app_name];
    });
    var embEndpointUrl = {
        url: 'https://7050356.app.netsuite.com' + nlapiResolveURL('SUITELET', 'customscript_ext_mech_emb_endpoints', 'customdeploy_ext_mech_emb_endpoints') + '&callback=?'
    ,	method: 'GET'
    ,	dataType: 'jsonp'
    ,	data: {
            domain: current_domain
            }
    };
    }catch(error){ nlapiLogExecution('ERROR', 'ERROR_SSP_LIBRARIES_EXT', JSON.stringify(error)); }
    