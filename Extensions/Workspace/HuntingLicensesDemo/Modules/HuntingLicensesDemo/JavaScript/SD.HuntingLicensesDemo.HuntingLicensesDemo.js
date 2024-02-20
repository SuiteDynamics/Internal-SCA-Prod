
define(
	'SD.HuntingLicensesDemo.HuntingLicensesDemo'
,   [
		'SD.HuntingLicensesDemo.HuntingLicensesDemo.View'
	]
,   function (
		HuntingLicensesDemoView
	)
{
	'use strict';

	return  {
		mountToApp: function mountToApp (container)
		{

			// console.log('hunting licenses')
			// using the 'Layout' component we add a new child view inside the 'Header' existing view 
			// (there will be a DOM element with the HTML attribute data-view="Header.Logo")
			// more documentation of the Extensibility API in
			// https://system.netsuite.com/help/helpcenter/en_US/APIs/SuiteCommerce/Extensibility/Frontend/index.html
			
			/** @type {LayoutComponent} */
			var layout = container.getComponent('Layout');
			
			if(layout)
			{
			// 	layout.addChildView('Header.Logo', function() { 
			// 		return new HuntingLicensesDemoView({ container: container });
			// 	});
			 }

		}
	};
});
