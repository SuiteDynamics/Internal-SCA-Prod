define('SuiteDynamics.SDWebsiteCCTs.MainTitleCCT',
	[
		'SuiteDynamics.SDWebsiteCCTs.MainTitleCCT.View'
	],
	function MainTitleCCTView (
		MainTitleCCTView
	)
{
	'use strict';

	return  {
		mountToApp: function(container) {
			container.getComponent('CMS').registerCustomContentType({
				id: 'sd_cct_maintitle',
				view: MainTitleCCTView,
				options: {
					container: container
				}
			});
		}
	};
});
