(function () {
  'use strict';

  angular
    .module('ngUserAuth.service', ['ngLodash', 'LocalStorageModule'])
    .provider('ngUserAuthService', NgUserAuthServiceProvider);

  function NgUserAuthServiceProvider() {

    var apiEndpoint = '/authentication';
    var unauthorizedUrl = '/unauthorized';
    var requestedPathParameterName = 'requestedPath';
    var abortRequestsUrlPrefix = '/';
    var logoutActions = [];
    var defaultLoggedInPermissionName = 'token_read';
    var sessionCheckSettings = {
      enabled: false,
      checkUrl: '/sessioncheck',
      interval: 30000,
      onSessionInvalid: function () {}
    };

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

    this.addLogoutAction = function (callback) {
      logoutActions.push(callback);
    };

    this.setDefaultLoggedInPermissionName = function (permissionName) {
      defaultLoggedInPermissionName = permissionName;
    };

    this.setSessionCheckSettings = function (value) {
      sessionCheckSettings = value;
    };

    this.getOtherwiseRouteHandler = function (defaultRoute) {
      var otherwiseRouteRequested = false;

      return function ($injector, $location) {
        var ngUserAuthService = $injector.get('ngUserAuthService');
        var currentLocation = $location.path();
        var encodedRoute = encodeURIComponent(defaultRoute);

        // insist on redirecting to default route only if user is logged in or the default route
        // is not yet in the requestedPath parameter of the unautzorized URL
        if (ngUserAuthService.isLoggedIn() || (currentLocation.indexOf(defaultRoute) < 0 && currentLocation.indexOf(encodedRoute) < 0)) {
          if (!otherwiseRouteRequested) {
            $location.url(defaultRoute);
            otherwiseRouteRequested = true;
          }
        }
      }
    };

    this.$get = ngUserAuthService;

    //////////

    /** @ngInject */
    function ngUserAuthService($rootScope, $injector, $location, $interval, lodash, localStorageService) {

      var AUTH_INFO_CHANGED_EVENT_NAME = 'ngUserAuth:userPermissionsChanged';
      var LOGIN_STATE_CHANGED_EVENT_NAME = 'ngUserAuth:userLoginStateChanged';
      var USER_TOKEN_STORAGE_KEY = 'user.token';

      // user and session information
      var userToken, userAuthInfoPromise, sessionCheckInterval;

      var service = {
        isLoggedIn: isLoggedIn,
        login: login,
        logout: logout,
        getApiEndpoint: getApiEndpoint,
        getAbortRequestsUrlPrefix: getAbortRequestsUrlPrefix,
        getDefaultLoggedInPermissionName: getDefaultLoggedInPermissionName,
        getUserToken: getUserToken,
        clearUserToken: clearUserToken,
        getUserAuthInfo: getUserAuthInfo,
        goToLoginScreen: goToLoginScreen,
        AUTH_INFO_CHANGED_EVENT_NAME: AUTH_INFO_CHANGED_EVENT_NAME,
        LOGIN_STATE_CHANGED_EVENT_NAME: LOGIN_STATE_CHANGED_EVENT_NAME
      };

      activate();

      return service;

      //////////

      function activate() {
        if (sessionCheckSettings && sessionCheckSettings.enabled === true) {
          startSessionCheck();
        }
      }

      function startSessionCheck() {
        sessionCheckInterval = $interval(checkSession, sessionCheckSettings.interval);
      }

      function stopSessionCheck() {
        if (sessionCheckInterval) {
          $interval.cancel(sessionCheckInterval);
        }
      }

      function checkSession() {
        getHttpService().get(sessionCheckSettings.checkUrl).catch(function (error) {
          // forward failure to registered callback
          if (sessionCheckSettings && lodash.isFunction(sessionCheckSettings.onSessionInvalid)) {
            sessionCheckSettings.onSessionInvalid(error);
          }
          stopSessionCheck();
        });
      }

      function getHttpService() {
        // prevent circular dependency ngUserAuthService <- ngUserAuthInterceptor <- $http <- ngUserAuthService by injecting $http only when needed
        return $injector.get('$http');
      }

      function goToLoginScreen(desiredState) {
        // call logout actions so the application can do stuff like close dialog windows, clear local storage or cookies.
        // call the callbacks with the $injector as an argument so they can access other Angular services.
        lodash.forEach(logoutActions, function (callback) {
          callback($injector);
        });
        stopSessionCheck();

        // now redirect to the login page
        var path = $location.path();
        var currentState = findCurrentStateByUrl(path);
        if ($location.$$search[requestedPathParameterName] === '/' && desiredState && desiredState.url) {
          $location.url(unauthorizedUrl + '?' + requestedPathParameterName + '=' + desiredState.url);
        } else {
          if (path.indexOf(unauthorizedUrl) < 0 && (!currentState || !currentState.data || !currentState.data.anonymousAccessAllowed)) {
            $location.url(unauthorizedUrl + '?' + requestedPathParameterName + '=' + path);
          }
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
        userAuthInfoPromise = getHttpService().post(apiEndpoint, credentials).then(function (response) {
          saveUserAuthInfo(response);
          startSessionCheck();
        });
        return userAuthInfoPromise;
      }

      function logout() {
        stopSessionCheck();
        return getHttpService().delete(apiEndpoint, {noCancelOnRouteChange: true}).finally(function () {
          clearUserToken();
        });
      }

      function getApiEndpoint() {
        return apiEndpoint;
      }

      function getAbortRequestsUrlPrefix() {
        return abortRequestsUrlPrefix;
      }

      function getDefaultLoggedInPermissionName() {
        return defaultLoggedInPermissionName;
      }

      function getSessionCheckSettings() {
        return sessionCheckSettings;
      }

      function getUserAuthInfo() {
        if (!userAuthInfoPromise) {
          userAuthInfoPromise = getHttpService().get(apiEndpoint).then(saveUserAuthInfo);
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
