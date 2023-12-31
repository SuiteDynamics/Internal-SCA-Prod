<div class="subscriptions-addon-details-main-content">
    <div class="subscriptions-addon-details-content-header-wrapper">
        <h2 class="subscriptions-addon-details-content-header-title">{{displayName}}</h2>
        <span data-view="Status.View"></span>
    </div>
    <div class="subscriptions-addon-details-col">
        <div class="subscriptions-addon-details-row">
        <div class="subscriptions-addon-details-left-col">
            <div class="subscriptions-addon-details-image-gallery-container">
                <div id="banner-image-top" class="subscriptions-addon-details-content-banner"></div>
                <div class="subscriptions-addon-details-image-gallery">
                    <img class="subscriptions-addon-details-center-block" src="{{imageUrl}}" alt="" itemprop="image" data-loader="false" data-id="{{internalId}}">
                </div>
            </div>
        </div>
        {{#if hasPriceIntervals}}
        <div class="subscriptions-addon-details-right-col">
            <div data-view="Pricing.View"></div>
        </div>
        {{/if}}
        </div>

        {{#if hasDescription}}
        <div class="subscriptions-addon-details-description">
            <h3>{{translate 'Description'}}</h3>
            <p>{{{description}}}</p>
        </div>
        {{/if}}

    </div>
    <div class="subscriptions-addon-details-summary">
        <div data-view="Quantity.Amount"></div>
        <div class="subscriptions-addon-details-summary-container" data-view="Summary.View"></div>
        {{#if showContinueButton}}
            <div class="subscriptions-addon-details-row-fluid">
                <button class="subscriptions-addon-details-button-continue" data-action="placeOrder">
                    {{#if isAddingLine}}
                        {{translate 'Purchase Add-On'}}
                    {{else}}
                        {{translate 'Update Add-On'}}
                    {{/if}}
                </button>
            </div>
        {{/if}}
        {{#if showCancelButton}}
        <button class="subscriptions-addon-details-button-cancel" data-action="cancel">Cancel Add-On</button>
        {{/if}}
        {{#if showInfoMessage}}
            <p class="subscriptions-addon-details-summary-message-info">{{translate 'Costs will be prorated to the current subscription billing period'}}</p>
        {{/if}}
    </div>
</div>

