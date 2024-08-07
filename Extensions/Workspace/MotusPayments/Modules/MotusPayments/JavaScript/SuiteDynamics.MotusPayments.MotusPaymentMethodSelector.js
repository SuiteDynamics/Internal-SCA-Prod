/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// OrderWizard.Module.PaymentMethod.Invoice.js
// --------------------------------
//MAYBE DO NOT NEED THIS FILE
define(
	'SuiteDynamics.MotusPayments.MotusPaymentMethodSelector'
,	[	'OrderWizard.Module.PaymentMethod'
	,	'Transaction.Paymentmethod.Model'
	,   'Transaction.Model'
	,   'Wizard.StepModule'
	,   'SuiteDynamics.MotusPayments.MotusPayments.Collection'
	,   'SuiteDynamics.MotusPayments.MotusPayments.Model'
	,   'SuiteDynamics.MotusPayments.AddToken.View'
	,   'SuiteDynamics.MotusPayments.PaymentMethodList.View'
	,   'SuiteDynamics.MotusPayments.RemoveToken.View'
	,   'SuiteDynamics.MotusPayments.ShowPayment.View'

	,	'suitedynamics_motuspayments_paymentmethod.tpl'

	,	'Backbone.CollectionView'
	,	'backbone_collection_view_row.tpl'
	,	'backbone_collection_view_cell.tpl'
	,	'underscore'
	,   'Utils'
	,	'jQuery'
	]
,	function (
		OrderWizardModulePaymentMethod
	,	TransactionPaymentmethodModel
	,   TransactionModel
	,	WizardStepModule
	,	MotusPaymentsCollection
	,	MotusPaymentsModel
	,   MotusPaymentsAddTokenView
	,   MotusPaymentsPaymentMethodListView
	,   MotusPaymentsRemoveTokenView
	,   MotusPaymentsShowPaymentView

	,	suitedynamics_motuspayments_paymentmethod_tpl

	,	BackboneCollectionView
	,	backbone_collection_view_row_tpl
	,	backbone_collection_view_cell_tpl
	,	_
	,   Utils
	,	jQuery
	)
{
	'use strict';

	return OrderWizardModulePaymentMethod.extend({

		template: suitedynamics_motuspayments_paymentmethod_tpl

	,	events: {
			'change [data-action="change-motus-payment"]': 'changeMotusPayment',
			'click [data-action="motus-add-token"]': 'addMotusPayment',
			'click [data-action="sensepass-modal-pay"]': 'payMotus'
		}

    ,	errors: ['ERR_WS_INVALID_CARD', 'ERR_CHK_INVALID_CARD']
    ,	childViews: {
			'MotusPayments.List': function () {

				return new BackboneCollectionView({
					collection: this.options.collection,
					childView: MotusPaymentsPaymentMethodListView,
					childViewOptions: {
						collection: this.options.collection,
						userProfile: this.userProfile,
						orderWizard: this,
						images: this.options.paymentmethod.imagesrc
					},
					viewsPerRow:
						this.itemsPerRow ||
						(Utils.isDesktopDevice() ? 2 : Utils.isTabletDevice() ? 2 : 1),
					cellTemplate: backbone_collection_view_cell_tpl,
					rowTemplate: backbone_collection_view_row_tpl
				});
			},
	}
	,	initialize: function()
		{

			var self = this;
	
			var checkout = this.options.checkout
			checkout.on("afterShowContent", function() {
				checkout.getCurrentStep().then(function(step) {
					if (step.step_group_name == "Payment") {
						self.options.collection.fetch(
							{ data: { salesOrderId: "1" } }
			
						).done(function(result) {
							console.log('result', result)
							self.render();
						  })
					}
				});
			});
			
			this.layout = this.options.layout

			this.options.layout.addChildView('PaymentMethods.Collection', function () {
				return new MotusPaymentsShowPaymentView({
					motus: self
				});
			});
		
			this.options.container.getComponent("UserProfile").getUserProfile().done(function(result){
				self.userProfile = result
			})

			OrderWizardModulePaymentMethod.prototype.initialize.apply(this, arguments);
			WizardStepModule.WizardStepModule.prototype.initialize.apply(this, arguments);
			
			self.on('afterViewRender', function(){
				
				let selectedInitialPayment = _.findWhere(self.$el.find("#motus-payments-dropdown")[0],{ selected: true });

				if(selectedInitialPayment){
					self.setInitial(selectedInitialPayment.id)
				}

				this.options.container.getComponent("UserProfile").getUserProfile().done(function(result){
					self.userProfile = result
				})
				
			}, this);

			this.options.collection.on('reset sync add remove change destroy', function (model) {	
			
				self.render()
			});

		}

	,	render: function ()
		{

			const options = this.options.model && this.options.model.get('options');
			var modelSelected = this.options.collection.where({'active': true})[0]

			//if no model is active, just grab the default
			if(!modelSelected){
				modelSelected = this.options.collection.where({'default_card': true})[0]
			}
			//If no active or default, grab the first model
			if(!modelSelected){
				modelSelected = this.options.collection.first()
			}

			if (options) {
				_.extend(this.options, options);
			}
			if(this.options.paymentmethod.name == 'Motus' && modelSelected){
				this.motusActive = true;
				this.motusSelected = modelSelected.get('id')
				this.setMotusPaymentMethod();
			}else if (modelSelected) {
				this.setPaymentMethod();
			}
			this.showInModal();
			this._render();
			
		}

	,	setInitial: function (initial)
		{
			if(initial){
				
				this.setActive(initial)
				this.setMotusPaymentMethod();
				OrderWizardModulePaymentMethod.prototype.submit.apply(this, arguments);

				this.setTransactionFields(initial);
			}
		}

	,	setMotusPaymentMethod: function ()
		{

			if(!this.paymentMethod){
				this.paymentMethod = new TransactionPaymentmethodModel({
					type: 'external_checkout',
					isexternal: this.options.paymentmethod.isexternal,
					internalid: this.options.paymentmethod.internalid,
					name: this.options.paymentmethod.name,
					key: 8,
				});
			}
		}

	,	setActive: function(paymentSelected)
	{

		var modelSelected = this.options.collection.where({'id': paymentSelected})[0]

		//If no model is selected, grab the first one instead. 
		if(!modelSelected){
			modelSelected = this.options.collection.first()
		}

		modelSelected.set('active', true)
		modelSelected.set('default_card', true)
		//Profile information
		modelSelected.set('first_name', this.userProfile.firstname);
		modelSelected.set('last_name', this.userProfile.firstname);
		if(this.userProfile.phoneinfo){
			modelSelected.set('phone', this.userProfile.phoneinfo.phone);
		}else{
			modelSelected.set('phone', "");
		}
		modelSelected.set('email', this.userProfile.email);
		modelSelected.set('motus_id', _.findWhere(this.userProfile.customfields,{ id: "custentity_profile_id_motus" }).value);
		//Order information
		modelSelected.set('amount', this.model.get('summary').total);
		
		//reset the other defaults so other cards aren't active
		this.options.collection.each(function(token) {

			if(token.get('id') !== paymentSelected){
				token.set('active', false)
				token.set('default_card', false)
			}
		});

	}


	,	changeMotusPayment: function(e)
	{
		this.removeActive();

		var paymentSelected = _.findWhere(e.target,{ selected: true }).id
		this.setActive(paymentSelected)

		var modelSelected = this.options.collection.where({'id': paymentSelected})[0]

		modelSelected.save({internalid: paymentSelected , data: {submit: false}}).then(function(result){


		})
	
		this.setMotusPaymentMethod();
		OrderWizardModulePaymentMethod.prototype.submit.apply(this, arguments);

		this.wizard.motusActive = true
		this.wizard.motusSelected = paymentSelected

	}

	,	removeActive: function()
	{
		var activeCards = this.options.collection.where({'active': true})
		_.each(activeCards, function(card) {
			card.set('active', false)
		});
		
	}

	,	setTransactionFields: function(paymentSelected)
	{
		console.log('set field', paymentSelected)
		this.model.set('options', _.extend(this.model.get('options'), {'custbody_sd_select_mt_card': paymentSelected}));

		//put in wizard because it isn't being reflected in model on review page
		this.wizard.motusActive = true
		this.wizard.motusSelected = paymentSelected
	}

	,	addMotusPayment: function(e)
	{
		console.log('addMotusPayment', this.options.collection.models[0].get('clientkey'))
		console.log('crypto', crypto.randomUUID())
		$("#sensepass-modal-close").click(function(){
			$(".sensepass-modal").fadeOut();
		  });

		$(".sensepass-modal").fadeIn();

        PTPayment.setup({
			styles:
			 {
			  'code': {
			   'font_color':'#404F5E',
			   'font_size':'13pt',
			  },
			  'cc': {
				'font_color':'#404F5E',
				'font_size':'13pt'
			  },
			  'exp': {
				'font_color':'#404F5E',
				'font_size':'13pt'
			  },
			  'body': {
			   'background_color':'white'
			  }
			 },    
            authorization: { clientKey: this.options.collection.models[0].get('clientkey') }
          }
		  
		 
		  ).then(function(instance){
               console.log('instance', instance)
              //use instance object to process and tokenize sensitive data payment fields.
          });


	}
	,	payMotus: function (e)
	{
		var self = this;
		console.log('pay');
		e.preventDefault();
		e.stopPropagation();
		console.log(PTPayment)
		// To trigger the validation of sensitive data payment fields within the iframe before calling the tokenization process:
		PTPayment.validate(function(validationErrors) {
			console.log(validationErrors)
		if (validationErrors.length >= 1) {
			if (validationErrors[0]['responseCode'] == '35') {
			// Handle validation Errors here
			// This is an example of using dynamic styling to show the Credit card number entered is invalid
			PTPayment.style({'cc': {'border_color': 'red'}});
			}
		} else {
			// no error so tokenize
			$('#sensepass-pay-button').attr('disabled','disabled');
			var iFrameDOM = $("iframe#hpf_casper").contents();

			PTPayment.process()
			.then( (r) => submitPayment(r) )
			.catch( (err) => handleError(err) );
		}
		});
		function handleError(res){
			console.log('error', res)
		};
		function submitPayment(res){
			$(".sensepass-modal").fadeOut();
			console.log('submit', res);
			console.log('submit self', self);
			
			 var order = self.wizard.model
	
			var userProfile = self.userProfile
	
			var newPaymentModel = new MotusPaymentsModel()
	
			//Card Information
			newPaymentModel.set('enc_key', res.message.enc_key);
			newPaymentModel.set('hpf_token', res.message.hpf_token);
			newPaymentModel.set('uuid', crypto.randomUUID());

			// //Profile information
			newPaymentModel.set('first_name', userProfile.firstname);
			newPaymentModel.set('last_name', userProfile.lastname);
			newPaymentModel.set('phone', userProfile.phoneinfo.phone);
			newPaymentModel.set('email', userProfile.email);
			newPaymentModel.set('userid', userProfile.internalid);

			//Order information
			newPaymentModel.set('amount', order.get('summary').total);
	

			//Billing Address
			var billAddress = self.model.get('addresses').where({'internalid': self.model.get('billaddress')})
			var billingAddrObj = {
				"name": billAddress[0].get('fullname'),
				"street_address": billAddress[0].get('addr1'),
				"street_address2": billAddress[0].get('addr2'),
				"city": billAddress[0].get('city'),
				"state": billAddress[0].get('state'),
				"zip": billAddress[0].get('zip'),
				"country": billAddress[0].get('country')
			}
			console.log('billingAddrObj', billingAddrObj)
			newPaymentModel.set('billingAddr', billingAddrObj);

			console.log('newPaymentModel', newPaymentModel)
	
			//disable continue button to prevent order submit until card is submitted in service
			$('.order-wizard-step-button-continue').prop("disabled",true);
			$('.btn').prop("disabled",true);
			self.collection.add(newPaymentModel, { at: self.collection.length - 1 }).save().then(function(result){
				console.log('token result 1', result);
				console.log('token result 2', result.cardDetails.response.customers[0].credit_card.expiration_month);
				if(result.status == 'Success'){
	
					self.removeActive();
					newPaymentModel.set('exp_month', result.cardDetails.response.customers[0].credit_card.expiration_month.toString());
					newPaymentModel.set('exp_year', result.cardDetails.response.customers[0].credit_card.expiration_year.toString());
					newPaymentModel.set('last_four', result.cardDetails.response.customers[0].credit_card.masked_number.slice(-4));
					newPaymentModel.set('active', true);

					self.$containerModal &&
					self.$containerModal
						.removeClass('fade')
						.modal('hide')
						.data('bs.modal', null);
				
					$('.order-wizard-step-button-continue').prop("disabled",false);
					$('.btn').prop("disabled",false);
					console.log('set wizard', self)
					self.wizard.motusActive = true
					self.wizard.motusSelected = result.id
	
				}else{
	
					console.log('display fail marks', self);
					self.$containerModal &&
					self.$containerModal
						.removeClass('fade')
						.modal('hide')
						.data('bs.modal', null);
	
					var $alert_warn = $('#motus-fail-message');
					console.log($alert_warn)
					$alert_warn.html(
						new GlobalViewsMessageView({
							message: 'Card failure. Please try a different card',
							type: 'error',
							closable: true
						}).render().$el
					);
	
					$('.order-wizard-step-button-continue').prop("disabled",false);
				}
	
				newPaymentModel.set('card_type', result.type);
	
			})
		};
	}

	,	getContext: function ()
	{

	}
	});
});
