/** @ngInject */
export default function config($httpProvider) {
  // register custom security interceptor
  $httpProvider.interceptors.push('ngUserAuthInterceptor');
}
