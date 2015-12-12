(function () {
  'use strict';

  angular
    .module('ngUserAuth')
    .decorator('ngUserAuthService', ngUserAuthServiceDecorator);

  /** @ngInject */
  function ngUserAuthServiceDecorator($delegate, lodash, $q, $rootScope) {
    var mock = ngUserAuthService(lodash, $q, $rootScope);
    mock.original = $delegate;
    return mock;
  }

  function ngUserAuthService(lodash, $q) {
    var AUTH_INFO_CHANGED_EVENT_NAME = 'ngUserAuth:userPermissionsChanged';
    var LOGIN_STATE_CHANGED_EVENT_NAME = 'ngUserAuth:userLoginStateChanged';

    var ORIGINAL_AUTH_INFO = {
      permissions: ['token_read', 'permission_1', 'permission_2', 'user', 'admin'],
      user: {
        person: {
          forename: 'Hans',
          surname: 'Muster'
        }
      }
    };

    // user and session information
    var userToken = 'abcdefgh';
    var userAuthInfoPromise = $q.when(ORIGINAL_AUTH_INFO);

    var service = {
      // mock only
      authInfoMockData: ORIGINAL_AUTH_INFO,
      loginMockData: angular.extend({token: userToken}, ORIGINAL_AUTH_INFO),

      // normal API
      isLoggedIn: isLoggedIn,
      getUserToken: getUserToken,
      getUserAuthInfo: getUserAuthInfo,
      clearUserToken: clearUserToken,
      AUTH_INFO_CHANGED_EVENT_NAME: AUTH_INFO_CHANGED_EVENT_NAME,
      LOGIN_STATE_CHANGED_EVENT_NAME: LOGIN_STATE_CHANGED_EVENT_NAME
    };

    return service;

    ////////////

    function isLoggedIn() {
      var userToken = getUserToken();
      return !!userToken && lodash.isString(userToken);
    }

    function getUserToken() {
      return userToken;
    }

    function getUserAuthInfo() {
      return userAuthInfoPromise;
    }

    function clearUserToken() {
      userToken = null;
      userAuthInfoPromise = null;
    }
  }

})();
