export default function loginDirective() {
  var directive = {
    templateUrl: 'pages/login.html',
    scope: {},
    controller: LoginController,
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;
}

/** @ngInject */
function LoginController($location, $state, $stateParams, ngUserAuthService) {
  var vm = this;

  vm.login = login;
  vm.credentials = {
    username: 'alice',
    password: 'bob'
  };
  vm.loginError = false;

  ////////////

  function login() {
    vm.loginError = false;
    ngUserAuthService.login(vm.credentials).then(function () {
      // success, try to redirect to the desired page
      if ($stateParams.requestedPath) {
        $location.url($stateParams.requestedPath);
      } else {
        $state.go('home');
      }
    }, function () {
      // error
      vm.loginError = true;
    });
  }
}
