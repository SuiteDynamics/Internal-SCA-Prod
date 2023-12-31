<div class="subscriptions-details">

    <header class="subscriptions-details-top-header">
            <h2>{{name}}</h2>
            <span data-view="StatusView"></span>
    </header>

    <section class="subscriptions-details-top-info">
            {{#if hasStartDate}}
            <div class="subscriptions-details-header-container subscriptions-details-activation-date">
                <span class="subscriptions-details-line-label">{{translate 'Activation'}}</span><br/>
                <span class="subscriptions-details-line-value">{{startDate}}</span>
            </div>
            {{/if}}
            {{#if hasLastBillDate}}
            <div class="subscriptions-details-header-container subscriptions-details-last-bill">
                <span class="subscriptions-details-line-label">{{translate 'Last Billing'}}</span><br/>
                <span class="subscriptions-details-line-value">{{lastBillDate}}</span>
            </div>
            {{/if}}
            {{#if hasNextBillCycleDate}}
            <div class="subscriptions-details-header-container subscriptions-details-next-bill">
                <span class="subscriptions-details-line-label">{{translate 'Next Billing'}}</span><br/>
                <span class="subscriptions-details-line-value">{{nextBillCycleDate}}</span>
            </div>
            {{/if}}
            {{#if hasNextRenewalStartDate}}
            <div class="subscriptions-details-header-container subscriptions-details-renewal">
                <span class="subscriptions-details-line-label">{{translate 'Renewal'}}</span><br/>
                <span class="subscriptions-details-line-value">{{nextRenewalStartDate}}</span>
            </div>
            {{/if}}
    </section>

    {{#if isRequiredLinesCountGreaterThan0}}
    <section class="subscriptions-details-plan">
        <div data-view='Required.Lines.Collection' class="subscriptions-details-required-lines-list"></div>
    </section>
    {{/if}}

    {{#if isOptionalLinesCountGreaterThan0}}
    <section class="subscriptions-details-lines">
	    <div class="subscriptions-details-lines-header">
                <h3>{{translate 'Add-ons'}}</h3>
	    </div>
        <div data-view='Optional.Lines.Collection' class="subscriptions-details-optional-lines-list"></div>
    </section>
    {{/if}}

    <div class="subscriptions-details-buttons-container">

        {{#if isNonIncludedLinesCountGreaterThan0}}
        <button data-action="goToAddOnsMarket" class="subscriptions-details-addons-button">
            {{translate 'View all Add-ons'}}
        </button>
        {{/if}}
        <br>
        <hr>
        {{#if canBeSuspended}}
        <button class="subscriptions-details-cancel-button" data-action="cancel-subscription">{{translate 'Cancel Subscription'}}</button>
        {{/if}}
        {{#if canBeReactivated}}
        <button class="subscriptions-details-reactivate-button" data-action="reactivate-subscription">{{translate 'Reactivate Subscription'}}</button>
        {{/if}}
    </div>

</div>

{{!----
Use the following context variables when customizing this template:
	isOptionalLinesCountGreaterThan0 (Boolean)
	isRequiredLinesCountGreaterThan0 (Boolean)
	isNonIncludedLinesCountGreaterThan0 (Boolean)
----}}

