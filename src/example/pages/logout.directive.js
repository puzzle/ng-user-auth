export default function logoutDirective() {
  var directive = {
    scope: {},
    controller: LogoutController,
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;
}

/** @ngInject */
function LogoutController($state, ngUserAuthService) {
  activate();

  ////////////

  function activate() {
    ngUserAuthService.logout().then(function () {
      $state.go('login');
    });
  }
}
