(function () {
	'use strict';

	angular.module('myApp').directive('statdirDirective', statdirDirective);

	function statdirDirective() {
		return {
			restrict: 'E',
			controller: 'StatDirController',
			controllerAs: 'tc',
			templateUrl: 'components/directives/stat/statDir.html'
		};
	}
})();