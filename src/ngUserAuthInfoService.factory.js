import angular from 'angular';
import lodashWrapper from './lodash.wrapper';
import uaService from './ngUserAuthService.provider';

export default angular
  .module('ngUserAuthInfo.service', [
    lodashWrapper,
    uaService,
  ])
  .factory('ngUserAuthInfoService', ngUserAuthInfoService)
  .name;

/** @ngInject */
function ngUserAuthInfoService($q, ngUserAuthService, $rootScope, lodash) {
  // user and session information
  let loggedIn,
    user,
    userPermissions,
    readyPromise,
    ready;

  const service = {
    notifyOnAuthChange,
    isLoggedIn,
    isReady,
    whenReady,
    getUser,
    userHasPermission: hasPermission,
    userHasAnyPermission: hasAnyPermission,
    userLacksPermission: lacksPermission,
    checkPermissions,
  };

  activate();

  return service;

  // ////////

  function activate() {
    // trigger initial load
    loggedIn = ngUserAuthService.isLoggedIn();
    $rootScope.$on(ngUserAuthService.LOGIN_STATE_CHANGED_EVENT_NAME, (event, isLoggedInNow) => {
      loggedIn = isLoggedInNow;
    });

    // expose the user to the root scope
    readyPromise = $q.defer();
    ready = false;
    ngUserAuthService.getUserAuthInfo().then(setAuthInfo, handleError);
    notifyOnAuthChange(setAuthInfo);
  }

  function notifyOnAuthChange(fn) {
    $rootScope.$on(ngUserAuthService.AUTH_INFO_CHANGED_EVENT_NAME, (event, authInfo) => {
      fn(authInfo);
    });
  }

  function isLoggedIn() {
    return loggedIn;
  }

  function whenReady() {
    return readyPromise.promise;
  }

  function isReady() {
    return ready;
  }

  function getUser() {
    return user;
  }

  function setAuthInfo(authInfo) {
    // signal everybody who wants to know that we're whenReady
    readyPromise.resolve();
    ready = true;

    user = authInfo.user;
    userPermissions = authInfo.permissions;
  }

  function handleError(error) {
    readyPromise.reject(error);
    ready = true;
  }

  function hasPermission(requiredPermissions) {
    const permissions = sanitizePermissionArray(requiredPermissions);

    if (permissions.length === 0) {
      return true;
    }
    return allPermissionsPresent(permissions);
  }

  function hasAnyPermission(requiredPermissions) {
    const permissions = sanitizePermissionArray(requiredPermissions);

    if (permissions.length === 0) {
      return true;
    }
    return somePermissionsPresent(permissions);
  }

  function lacksPermission(forbiddenPermissions) {
    const permissions = sanitizePermissionArray(forbiddenPermissions);

    if (permissions.length === 0) {
      return true;
    }
    return !somePermissionsPresent(permissions);
  }

  function allPermissionsPresent(permissions) {
    return lodash.every(permissions, value => lodash.includes(userPermissions, value));
  }

  function somePermissionsPresent(permissions) {
    return lodash.some(permissions, value => lodash.includes(userPermissions, value));
  }

  function sanitizePermissionArray(permissionArray) {
    if (permissionArray === undefined || lodash.isEmpty(permissionArray)) {
      return [];
    }

    if (!lodash.isArray(permissionArray)) {
      return [permissionArray];
    }

    return permissionArray;
  }

  function checkPermissions(checkHasPermission, checkHasAnyPermission, checkLacksPermission) {
    // hide if user does not have all required permissions
    return hasPermission(checkHasPermission) &&
      // hide if user does not have at least one of the permissions
      hasAnyPermission(checkHasAnyPermission) &&
      // hide if user does have some of the forbidden permissions
      lacksPermission(checkLacksPermission);
  }
}
