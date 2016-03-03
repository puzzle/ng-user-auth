/** @ngInject */
export default function ngUserAuth($rootScope, ngUserAuthInfoService) {
  return {
    link: linkNgUserAuth
  };

  //////////

  function linkNgUserAuth(scope, element, attrs) {
    // make sure that there will never be a property on the scope that matches a role name by providing an
    // empty isolated scope. otherwise the $eval() might have side effects
    var evalScope = $rootScope.$new(true);

    var hasPermission = evalScope.$eval(attrs.hasPermission) || attrs.hasPermission;
    var hasAnyPermission = evalScope.$eval(attrs.hasAnyPermission) || attrs.hasAnyPermission;
    var lacksPermission = evalScope.$eval(attrs.lacksPermission) || attrs.lacksPermission;

    // closure so we can re-calculate when permissions change
    function toggleVisibilityBasedOnPermission() {
      if (ngUserAuthInfoService.checkPermissions(hasPermission, hasAnyPermission, lacksPermission)) {
        element.show();
      } else {
        element.hide();
      }
    }

    toggleVisibilityBasedOnPermission();
    ngUserAuthInfoService.notifyOnAuthChange(toggleVisibilityBasedOnPermission);
  }
}