/*!
 * Piwik - free/libre analytics platform
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

/**
 * Usage:
 * <piwik-users-manager>
 */
(function () {
    angular.module('piwikApp').component('piwikUsersManager', {
        templateUrl: 'plugins/UsersManager/angularjs/users-manager/users-manager.component.html?cb=' + piwik.cacheBuster,
        bindings: {
            currentUserRole: '<',
            initialSiteName: '@',
            initialSiteId: '@',
            accessLevels: '<',
            filterAccessLevels: '<'

        },
        controller: UsersManagerController
    });

    UsersManagerController.$inject = ['$element', '$scope'];

    function UsersManagerController($element, $scope) {
        var vm = this;
        vm.isEditing = false;
        vm.isCurrentUserSuperUser = true;
        vm.$onInit = $onInit;
        vm.$onDestroy = $onDestroy;
        vm.onDoneEditing = onDoneEditing;

        function $onInit() {
            // TODO: maybe this should go in another directive...
            $element.tooltip({
                track: true,
                content: function() {
                    var title = $(this).attr('title');
                    return piwikHelper.escape(title.replace(/\n/g, '<br />'));
                },
                show: false,
                hide: false
            });


            if (vm.currentUserRole === 'superuser') {
                vm.filterAccessLevels.push({ key: 'superuser', value: 'Superuser' });
            }
        }

        function $onDestroy() {
            try {
                $element.tooltip('destroy');
            } catch (e) {
                // empty
            }
        }

        function onDoneEditing(isUserModified) {
            vm.isEditing = false;
            if (isUserModified) { // if a user was modified, we must reload the users list
                $scope.$broadcast('paged-users-list:reload');
            }
        }
    }
})();