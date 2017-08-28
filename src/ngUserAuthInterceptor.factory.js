import angular from 'angular';
import uaService from './ngUserAuthService.provider';

export default angular
  .module('ngUserAuth.interceptor', [
    uaService,
  ])
  .factory('ngUserAuthInterceptor', ngUserAuthInterceptor)
  .name;

/** @ngInject */
function ngUserAuthInterceptor($q, ngUserAuthService) {
  // promises needed to cancel $http calls that have been intercepted
  const cancelPromises = [];

  return {
    request: handleRequest,
    response: handleResponse,
    responseError: handleResponseError,
  };

  // ////////

  function handleRequest(configParam) {
    const config = configParam || {};
    const abortPrefix = ngUserAuthService.getAbortRequestsUrlPrefix();

    // we only want to cancel requests where the response status matters (e.g. only REST API calls).
    // otherwise don't cancel the request on routhe change
    if (abortPrefix && config.url.indexOf(abortPrefix) < 0) {
      config.noCancelOnRouteChange = true;
    }

    // add a timeout promise to each request so we can cancel them if we intercept a 401/403 response.
    // inspiration found on https://github.com/AlbertBrand/angular-cancel-on-navigate, optimized it for this module
    if (config.timeout === undefined && !config.noCancelOnRouteChange) {
      config.$timeout = newTimeout();
      config.timeout = config.$timeout.promise;
    }

    // if we have a token, add it to the header
    const userToken = ngUserAuthService.getUserToken();
    if (userToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${userToken}`;
    }
    return config;
  }

  function handleResponse(response) {
    completeRequest(response.config);
    return response;
  }

  function handleResponseError(response) {
    // if the request has been cancelled, don't do anything
    if (response.config && response.config.timeout && response.config.timeout.isGloballyCancelled) {
      return $q.defer().promise;
    }
    completeRequest(response.config);


    // HTTP 401 means unauthorized, so the token is invalid or nonexistent --> log in the user again
    // HTTP 403 means the server could authenticate the user but he does not have the right to access the
    // requested URL --> show an error message to the user
    if (response.status === 401) {
      // cancel all pending requests
      cancelAll();

      // notify UI that the user is no longer logged in
      ngUserAuthService.clearUserToken();

      // change to the login page
      ngUserAuthService.goToLoginScreen();
    } else if (response.status === 403) {
      response.hasNoAccess = true;
    }
    return $q.reject(response);
  }

  // create a new timeout promise that can be resolved if needed (and therefore cancel the underlying $http call)
  function newTimeout() {
    const cancelPromise = $q.defer();
    cancelPromises.push(cancelPromise);
    return cancelPromise;
  }

  function completeRequest(config) {
    if (config && config.$timeout) {
      const index = cancelPromises.indexOf(config.$timeout);
      if (index >= 0) {
        cancelPromises.splice(index, 1);
      }
    }
  }

  // cancel all pending $http calls by resolving their timeout promise
  function cancelAll() {
    angular.forEach(cancelPromises, (cancelPromise) => {
      cancelPromise.promise.isGloballyCancelled = true;
      cancelPromise.resolve();
    });
    cancelPromises.length = 0;
  }
}
