import angular from 'angular';
import 'angular-local-storage';
import lodashWrapper from './lodash.wrapper';

export default angular
  .module('ngUserAuth.service', [
    'LocalStorageModule',
    lodashWrapper,
  ])
  .provider('ngUserAuthService', NgUserAuthServiceProvider)
  .name;

function NgUserAuthServiceProvider() {
  let apiEndpoint = '/authentication';
  let unauthorizedUrl = '/unauthorized';
  let requestedPathParameterName = 'requestedPath';
  let abortRequestsUrlPrefix = '/';
  const logoutActions = [];
  let defaultLoggedInPermissionName = 'token_read';
  let ignoreCaseInRoleNames = false;
  let sessionCheckSettings = {
    enabled: false,
    checkUrl: '/sessioncheck',
    interval: 30000,
    onSessionInvalid() {
    },
  };
  let defaultCurrentRouteResolver = ($injector, lodash) => (path) => {
    const allStates = $injector.get('$state').get();

    const index = lodash.findIndex(allStates, state => state.url === path);

    return allStates[index];
  };

  this.setApiEndpoint = (value) => {
    apiEndpoint = value;
  };

  this.setUnauthorizedUrl = (value) => {
    unauthorizedUrl = value;
  };

  this.setRequestedPathParameterName = (value) => {
    requestedPathParameterName = value;
  };

  this.setAbortRequestsUrlPrefix = (value) => {
    abortRequestsUrlPrefix = value;
  };

  this.addLogoutAction = (callback) => {
    logoutActions.push(callback);
  };

  this.setDefaultLoggedInPermissionName = (permissionName) => {
    defaultLoggedInPermissionName = permissionName;
  };

  this.setIgnoreCaseInRoleNames = (value) => {
    ignoreCaseInRoleNames = value;
  };

  this.setSessionCheckSettings = (value) => {
    sessionCheckSettings = value;
  };

  this.setDefaultCurrentRouteResolver = (resolverFn) => {
    defaultCurrentRouteResolver = resolverFn;
  };

  this.getOtherwiseRouteHandler = (defaultRoute) => {
    let otherwiseRouteRequested = false;

    return ($injector, $location) => {
      const service = $injector.get('ngUserAuthService');
      const currentLocation = $location.path();
      const encodedRoute = encodeURIComponent(defaultRoute);

      // insist on redirecting to default route only if user is logged in or the default route
      // is not yet in the requestedPath parameter of the unautzorized URL
      if (service.isLoggedIn() || (currentLocation.indexOf(defaultRoute) < 0 && currentLocation.indexOf(encodedRoute) < 0)) {
        if (!otherwiseRouteRequested) {
          $location.url(defaultRoute);
          otherwiseRouteRequested = true;
        }
      }
    };
  };

  this.$get = ngUserAuthService;

  // ////////

  /** @ngInject */
  function ngUserAuthService($rootScope, $injector, $location, $interval, lodash, localStorageService) {
    const AUTH_INFO_CHANGED_EVENT_NAME = 'ngUserAuth:userPermissionsChanged';
    const LOGIN_STATE_CHANGED_EVENT_NAME = 'ngUserAuth:userLoginStateChanged';
    const USER_TOKEN_STORAGE_KEY = 'user.token';

    // user and session information
    let userToken,
      userAuthInfoPromise,
      sessionCheckInterval;

    const service = {
      isLoggedIn,
      login,
      logout,
      getApiEndpoint,
      getAbortRequestsUrlPrefix,
      getDefaultLoggedInPermissionName,
      shouldIgnoreCaseInRoleNames,
      getUserToken,
      clearUserToken,
      getUserAuthInfo,
      goToLoginScreen,
      AUTH_INFO_CHANGED_EVENT_NAME,
      LOGIN_STATE_CHANGED_EVENT_NAME,
    };

    activate();

    return service;

    // ////////

    function activate() {
      if (sessionCheckSettings && sessionCheckSettings.enabled === true && isLoggedIn()) {
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
      getHttpService().get(sessionCheckSettings.checkUrl).catch((error) => {
        // forward failure to registered callback
        if (sessionCheckSettings && lodash.isFunction(sessionCheckSettings.onSessionInvalid)) {
          sessionCheckSettings.onSessionInvalid(error);
        }
        stopSessionCheck();
      });
    }

    function getHttpService() {
      // prevent circular dependency ngUserAuthService <- ngUserAuthInterceptor <- $http <- ngUserAuthService by
      // injecting $http only when needed
      return $injector.get('$http');
    }

    function goToLoginScreen(desiredState) {
      // call logout actions so the application can do stuff like close dialog windows, clear local storage or cookies.
      // call the callbacks with the $injector as an argument so they can access other Angular services.
      lodash.forEach(logoutActions, (callback) => {
        callback($injector);
      });
      stopSessionCheck();

      const resolverFn = defaultCurrentRouteResolver($injector, lodash);

      // now redirect to the login page
      const path = $location.path();
      const currentState = resolverFn(path);
      if ($location.$$search[requestedPathParameterName] === '/' && desiredState && desiredState.url) {
        $location.url(`${unauthorizedUrl}?${requestedPathParameterName}=${desiredState.url}`);
      } else if (path.indexOf(unauthorizedUrl) < 0 && (!currentState || !currentState.data || !currentState.data.anonymousAccessAllowed)) {
        $location.url(`${unauthorizedUrl}?${requestedPathParameterName}=${path}`);
      }
    }

    function isLoggedIn() {
      const currentUserToken = getUserToken();
      return !!currentUserToken && lodash.isString(currentUserToken);
    }

    function login(credentials) {
      userAuthInfoPromise = getHttpService().post(apiEndpoint, credentials).then((response) => {
        saveUserAuthInfo(response);
        startSessionCheck();
      });
      return userAuthInfoPromise;
    }

    function logout() {
      stopSessionCheck();
      return getHttpService().delete(apiEndpoint, { noCancelOnRouteChange: true }).finally(() => {
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

    function shouldIgnoreCaseInRoleNames() {
      return ignoreCaseInRoleNames;
    }

    function getUserAuthInfo() {
      if (!userAuthInfoPromise) {
        userAuthInfoPromise = getHttpService().get(apiEndpoint).then(saveUserAuthInfo);
      }
      return userAuthInfoPromise;
    }

    function saveUserAuthInfo(httpResponse) {
      const response = httpResponse.data;

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
      $rootScope.$broadcast(AUTH_INFO_CHANGED_EVENT_NAME, { user: null, permissions: [] });
      userAuthInfoPromise = null;
    }
  }
}
