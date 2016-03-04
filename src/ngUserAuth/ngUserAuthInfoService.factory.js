/** @ngInject */
export default function ngUserAuthInfoService($q, ngUserAuthService, $rootScope, lodash) {

  // user and session information
  var loggedIn, user, userPermissions, readyPromise, ready;

  var service = {
    notifyOnAuthChange: notifyOnAuthChange,
    isLoggedIn: isLoggedIn,
    isReady: isReady,
    whenReady: whenReady,
    getUser: getUser,
    userHasPermission: hasPermission,
    userHasAnyPermission: hasAnyPermission,
    userLacksPermission: lacksPermission,
    checkPermissions: checkPermissions
  };

  activate();

  return service;

  //////////

  function activate() {
    // trigger initial load
    loggedIn = ngUserAuthService.isLoggedIn();
    $rootScope.$on(ngUserAuthService.LOGIN_STATE_CHANGED_EVENT_NAME, function (event, isLoggedIn) {
      loggedIn = isLoggedIn;
    });

    // expose the user to the root scope
    readyPromise = $q.defer();
    ready = false;
    ngUserAuthService.getUserAuthInfo().then(setAuthInfo, handleError);
    notifyOnAuthChange(setAuthInfo);
  }

  function notifyOnAuthChange(fn) {
    $rootScope.$on(ngUserAuthService.AUTH_INFO_CHANGED_EVENT_NAME, function (event, authInfo) {
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
    var permissions = sanitizePermissionArray(requiredPermissions);

    if (permissions.length === 0) {
      return true;
    } else {
      return allPermissionsPresent(permissions);
    }
  }

  function hasAnyPermission(requiredPermissions) {
    var permissions = sanitizePermissionArray(requiredPermissions);

    if (permissions.length === 0) {
      return true;
    } else {
      return somePermissionsPresent(permissions);
    }
  }

  function lacksPermission(forbiddenPermissions) {
    var permissions = sanitizePermissionArray(forbiddenPermissions);

    if (permissions.length === 0) {
      return true;
    } else {
      return !somePermissionsPresent(permissions);
    }
  }

  function allPermissionsPresent(permissions) {
    return lodash.every(permissions, function (value) {
      return lodash.includes(userPermissions, value);
    });
  }

  function somePermissionsPresent(permissions) {
    return lodash.some(permissions, function (value) {
      return lodash.includes(userPermissions, value);
    });
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
    var checkOk = true;

    // hide if user does not have all required permissions
    if (!hasPermission(checkHasPermission)) {
      checkOk = false;
    }

    // hide if user does not have at least one of the permissions
    if (!hasAnyPermission(checkHasAnyPermission)) {
      checkOk = false;
    }

    // hide if user does have some of the forbidden permissions
    if (!lacksPermission(checkLacksPermission)) {
      checkOk = false;
    }

    return checkOk;
  }
}
