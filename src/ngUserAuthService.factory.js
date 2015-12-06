(function () {
  'use strict';

  angular
    .module('ngUserAuth')
    .factory('ngUserAuthService', ngUserAuthService);

  /** @ngInject */
  function ngUserAuthService($rootScope, lodash, $injector, localStorageService, $location, $http) {

    // user and session information
    var userToken, userAuthInfoPromise;

    var AUTH_INFO_CHANGED_EVENT_NAME = 'ngUserAuth:userPermissionsChanged';
    var LOGIN_STATE_CHANGED_EVENT_NAME = 'ngUserAuth:userLoginStateChanged';
    var USER_TOKEN_STORAGE_KEY = 'user.token';

    var service = {
      isLoggedIn: isLoggedIn,
      login: login,
      logout: logout,
      getUserToken: getUserToken,
      clearUserToken: clearUserToken,
      getUserAuthInfo: getUserAuthInfo,
      goToLoginScreen: goToLoginScreen,
      AUTH_INFO_CHANGED_EVENT_NAME: AUTH_INFO_CHANGED_EVENT_NAME,
      LOGIN_STATE_CHANGED_EVENT_NAME: LOGIN_STATE_CHANGED_EVENT_NAME
    };

    return service;

    ////////////

    function goToLoginScreen() {
      $injector.get('$mdDialog').hide();
      var path = $location.path();
      if (path.indexOf('unauthorized') < 0) {
        $location.url('/unauthorized?requestedPath=' + $location.path());
      }
    }

    function isLoggedIn() {
      var userToken = getUserToken();
      return !!userToken && lodash.isString(userToken);
    }

    function login(credentials) {
      userAuthInfoPromise = $http.post('/authentication', credentials).then(saveUserAuthInfo);
      return userAuthInfoPromise;
    }

    function logout() {
      return $http.delete('/authentication').then(function () {
        clearUserToken();
      });
    }

    function getUserAuthInfo() {
      if (!userAuthInfoPromise) {
        userAuthInfoPromise = $http.get('/authentication').then(saveUserAuthInfo);
      }
      return userAuthInfoPromise;
    }

    function saveUserAuthInfo(httpResponse) {
      var response = httpResponse.data;

      // save token and permissions
      if (response.token) {
        userToken = response.token;
        localStorageService.set(USER_TOKEN_STORAGE_KEY, userToken);
        $rootScope.$broadcast(LOGIN_STATE_CHANGED_EVENT_NAME, true);
      }
      $rootScope.$broadcast(AUTH_INFO_CHANGED_EVENT_NAME, response);
      return response;
    }


    function getUserToken() {
      // if we don't have a valid token see if there is something in the local storage
      if (!userToken || lodash.isEmpty(userToken) || !lodash.isString(userToken)) {
        userToken = localStorageService.get(USER_TOKEN_STORAGE_KEY);

        // if we have a token in the local storage, then we assume the user is logged in
        if (userToken) {
          $rootScope.$broadcast(LOGIN_STATE_CHANGED_EVENT_NAME, true);
        }
      }
      return userToken;
    }

    function clearUserToken() {
      userToken = null;
      localStorageService.remove(USER_TOKEN_STORAGE_KEY);
      $rootScope.$broadcast(LOGIN_STATE_CHANGED_EVENT_NAME, false);
      userAuthInfoPromise = null;
    }
  }
})();
