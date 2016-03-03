export default function NgUserAuthServiceProvider() {
  var apiEndpoint = '/authentication';
  var unauthorizedUrl = '/unauthorized';
  var requestedPathParameterName = 'requestedPath';
  var abortRequestsUrlPrefix = '/';
  var logoutActions = [];
  var defaultLoggedInPermissionName = 'token_read';

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
    };
  };

  this.$get = ngUserAuthService;

  //////////

  /** @ngInject */
  function ngUserAuthService($rootScope, lodash, $injector, localStorageService, $location) {

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
      getDefaultLoggedInPermissionName: getDefaultLoggedInPermissionName,
      getUserToken: getUserToken,
      clearUserToken: clearUserToken,
      getUserAuthInfo: getUserAuthInfo,
      goToLoginScreen: goToLoginScreen,
      AUTH_INFO_CHANGED_EVENT_NAME: AUTH_INFO_CHANGED_EVENT_NAME,
      LOGIN_STATE_CHANGED_EVENT_NAME: LOGIN_STATE_CHANGED_EVENT_NAME
    };

    return service;

    //////////

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
      userAuthInfoPromise = getHttpService().post(apiEndpoint, credentials).then(saveUserAuthInfo);
      return userAuthInfoPromise;
    }

    function logout() {
      return getHttpService().delete(apiEndpoint).then(function () {
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
