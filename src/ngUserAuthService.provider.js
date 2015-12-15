(function () {
  'use strict';

  angular
    .module('ngUserAuth')
    .provider('ngUserAuthService', NgUserAuthServiceProvider);

  function NgUserAuthServiceProvider() {
    var apiEndpoint = '/authentication';
    var unauthorizedUrl = '/unauthorized';
    var requestedPathParameterName = 'requestedPath';
    var abortRequestsUrlPrefix = '/';

    this.setApiEndpoint = function (value) {
      apiEndpoint = value;
    };

    this.setUnauthorizedUrl = function (value) {
      unauthorizedUrl = value;
    };

    this.setRequestedPathParameterName = function (value) {
      requestedPathParameterName = value;
    };

    this.setAbortRequestsUrlPrefix = function (value) {
      abortRequestsUrlPrefix = value;
    };

    this.$get = ngUserAuthService;

    //////////

    /** @ngInject */
    function ngUserAuthService($rootScope, lodash, localStorageService, $location, $http) {

      var AUTH_INFO_CHANGED_EVENT_NAME = 'ngUserAuth:userPermissionsChanged';
      var LOGIN_STATE_CHANGED_EVENT_NAME = 'ngUserAuth:userLoginStateChanged';
      var USER_TOKEN_STORAGE_KEY = 'user.token';

      // user and session information
      var userToken, userAuthInfoPromise;

      var service = {
        isLoggedIn: isLoggedIn,
        login: login,
        logout: logout,
        getApiEndpoint: getApiEndpoint,
        getAbortRequestsUrlPrefix: getAbortRequestsUrlPrefix,
        getUserToken: getUserToken,
        clearUserToken: clearUserToken,
        getUserAuthInfo: getUserAuthInfo,
        goToLoginScreen: goToLoginScreen,
        AUTH_INFO_CHANGED_EVENT_NAME: AUTH_INFO_CHANGED_EVENT_NAME,
        LOGIN_STATE_CHANGED_EVENT_NAME: LOGIN_STATE_CHANGED_EVENT_NAME
      };

      return service;

      //////////

      function goToLoginScreen() {
        var path = $location.path();
        var currentState = findCurrentStateByUrl(path);
        if (path.indexOf(unauthorizedUrl) < 0 && (!currentState || !currentState.data || !currentState.data.anonymousAccessAllowed)) {
          $location.url(unauthorizedUrl + '?' + requestedPathParameterName + '=' + path);
        }
      }
      
      function findCurrentStateByUrl(path) {
        var allStates = $injector.get('$state').get();
  
        var index = lodash.findIndex(allStates, function (state) {
          return state.url === path;
        });
  
        return allStates[index];
      }

      function isLoggedIn() {
        var userToken = getUserToken();
        return !!userToken && lodash.isString(userToken);
      }

      function login(credentials) {
        userAuthInfoPromise = $http.post(apiEndpoint, credentials).then(saveUserAuthInfo);
        return userAuthInfoPromise;
      }

      function logout() {
        return $http.delete(apiEndpoint).then(function () {
          clearUserToken();
        });
      }

      function getApiEndpoint() {
        return apiEndpoint;
      }

      function getAbortRequestsUrlPrefix() {
        return abortRequestsUrlPrefix;
      }

      function getUserAuthInfo() {
        if (!userAuthInfoPromise) {
          userAuthInfoPromise = $http.get(apiEndpoint).then(saveUserAuthInfo);
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
        $rootScope.$broadcast(AUTH_INFO_CHANGED_EVENT_NAME, {user: null, permissions: []});
        userAuthInfoPromise = null;
      }
    }
  }
})();
