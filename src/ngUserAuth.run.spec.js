import angular from 'angular';
import 'angular-ui-router';
import uaRun from './ngUserAuth.run';

describe('ngUserAuth.run', () => {
  let $rootScope,
    $state,
    permissionOk,
    ngUserAuthServiceMock,
    ngUserAuthInfoServiceMock;

  /**
   * Global injects and setups
   */
  beforeEach(() => {
    angular.mock.module('ui.router');
    angular.mock.module(uaRun);

    angular.mock.module(($stateProvider, $provide) => {
      // default/fallback states
      $stateProvider.state('home', {
        data: {
          anonymousAccessAllowed: true,
        },
      });
      $stateProvider.state('forbidden', {
        data: {
          anonymousAccessAllowed: true,
        },
      });
      $stateProvider.state('customFallback', {
        data: {
          anonymousAccessAllowed: true,
        },
      });

      // states that should be allowed to access
      $stateProvider.state('single_values', {
        data: {
          hasPermission: 'str1',
          hasAnyPermission: 'str2',
          lacksPermission: 'str3',
        },
      });
      $stateProvider.state('multiple_values', {
        data: {
          hasPermission: ['str1', 'str2'],
          hasAnyPermission: ['str3', 'str4'],
          lacksPermission: ['str5', 'str6'],
        },
      });

      // states that should redirect somewhere
      $stateProvider.state('will_be_denied_redirect_state', {
        data: {
          hasPermission: 'permission_3',
          redirectTo: 'customFallback',
        },
      });
      $stateProvider.state('will_be_denied_redirect_function', {
        data: {
          hasPermission: 'permission_3',
          redirectTo() {
            return 'customFallback';
          },
        },
      });

      $provide.factory('ngUserAuthInfoService', ($q) => {
        ngUserAuthInfoServiceMock = jasmine.createSpyObj('ngUserAuthInfoService', [
          'checkPermissions', 'whenReady', 'isReady', 'isLoggedIn', 'getDefaultLoggedInPermissionName',
        ]);
        ngUserAuthInfoServiceMock.getDefaultLoggedInPermissionName.and.returnValue('token_read');
        ngUserAuthInfoServiceMock.checkPermissions.and.callFake(() => permissionOk);
        ngUserAuthInfoServiceMock.whenReady.and.returnValue($q.when());
        ngUserAuthInfoServiceMock.isReady.and.returnValue(true);
        ngUserAuthInfoServiceMock.isLoggedIn.and.returnValue(true);
        return ngUserAuthInfoServiceMock;
      });

      $provide.factory('ngUserAuthService', ($injector) => {
        ngUserAuthServiceMock = jasmine.createSpyObj('ngUserAuthServiceMock', [
          'getStateChangeEventName', 'getStateChangeFunction', 'getDefaultLoggedInPermissionName',
        ]);
        ngUserAuthServiceMock.getStateChangeEventName.and.returnValue('$stateChangeStart');
        ngUserAuthServiceMock.getStateChangeFunction.and.callFake(() => $injector.get('$state').go);
        ngUserAuthServiceMock.getDefaultLoggedInPermissionName.and.returnValue('token_read');
        return ngUserAuthServiceMock;
      });
    });

    angular.mock.inject(($injector) => {
      $rootScope = $injector.get('$rootScope');
      $state = $injector.get('$state');
    });
  });

  function initStateTo(stateName) {
    $state.transitionTo(stateName, {});
    $rootScope.$digest();
    expect($state.current.name).toBe(stateName);
  }

  describe('run', () => {
    it('should pass state transition on single values', () => {
      // given
      initStateTo('home');
      permissionOk = true;

      // when
      $state.go('single_values');
      $rootScope.$digest();

      // then
      expect($state.current.name).toBe('single_values');
      expect(ngUserAuthInfoServiceMock.checkPermissions).toHaveBeenCalledWith(['str1', 'token_read'], 'str2', 'str3');
    });

    it('should pass state transition on multiple values', () => {
      // given
      initStateTo('home');
      permissionOk = true;

      // when
      $state.go('multiple_values');
      $rootScope.$digest();

      // then
      expect($state.current.name).toBe('multiple_values');
      expect(ngUserAuthInfoServiceMock.checkPermissions)
        .toHaveBeenCalledWith(['str1', 'str2', 'token_read'], ['str3', 'str4'], ['str5', 'str6']);
    });

    it('should fail state transitions', () => {
      // given
      initStateTo('home');
      permissionOk = false;

      // when
      $state.go('single_values');
      $rootScope.$digest();

      // then
      expect($state.current.name).toBe('forbidden');
    });

    it('should redirect to custom fallback defined as string', () => {
      // given
      initStateTo('home');
      permissionOk = false;

      // when
      $state.go('will_be_denied_redirect_state');
      $rootScope.$digest();

      // then
      expect($state.current.name).toBe('customFallback');
    });

    it('should redirect to custom fallback defined as function', () => {
      // given
      initStateTo('home');
      permissionOk = false;

      // when
      $state.go('will_be_denied_redirect_function');
      $rootScope.$digest();

      // then
      expect($state.current.name).toBe('customFallback');
    });
  });
});
