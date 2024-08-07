// Model.js
// -----------------------
// @module Case
define("SuiteDynamics.ZoneSubscriptions.ZoneSubscriptions.SS2Model", ["Backbone", "Utils"], function (
    Backbone,
    Utils
) {
    "use strict";

    // @class Case.Fields.Model @extends Backbone.Model
    return Backbone.Model.extend({
        //@property {String} urlRoot
        urlRoot: Utils.getAbsoluteUrl(
            getExtensionAssetsPath(
                "Modules/ZoneSubscriptions/SuiteScript2/ZoneSubscriptions.Service.ss"
            ),
            true
        )
    });
});
