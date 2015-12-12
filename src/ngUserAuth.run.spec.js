(function () {
  'use strict';

  describe('ngUserAuth', function () {

    var $rootScope, $state, permissionOk, ngUserAuthInfoServiceMock;

    /**
     * Global injects and setups
     */
    beforeEach(function () {
      module('ngUserAuth');

      module(function ($stateProvider, $provide) {
        // default/fallback states
        $stateProvider.state('home', {
          data: {
            anonymousAccessAllowed: true
          }
        });
        $stateProvider.state('forbidden', {
          data: {
            anonymousAccessAllowed: true
          }
        });
        $stateProvider.state('customFallback', {
          data: {
            anonymousAccessAllowed: true
          }
        });

        // states that should be allowed to access
        $stateProvider.state('single_values', {
          data: {
            hasPermission: 'str1',
            hasAnyPermission: 'str2',
            lacksPermission: 'str3'
          }
        });
        $stateProvider.state('multiple_values', {
          data: {
            hasPermission: ['str1', 'str2'],
            hasAnyPermission: ['str3', 'str4'],
            lacksPermission: ['str5', 'str6']
          }
        });

        // states that should redirect somewhere
        $stateProvider.state('will_be_denied_redirect_state', {
          data: {
            hasPermission: 'permission_3',
            redirectTo: 'customFallback'
          }
        });
        $stateProvider.state('will_be_denied_redirect_function', {
          data: {
            hasPermission: 'permission_3',
            redirectTo: function () {
              return 'customFallback';
            }
          }
        });

        $provide.factory('ngUserAuthInfoService', function ($q) {
          ngUserAuthInfoServiceMock = jasmine.createSpyObj('ngUserAuthInfoService', [
            'checkPermissions', 'whenReady', 'isReady', 'isLoggedIn'
          ]);
          ngUserAuthInfoServiceMock.DEFAULT_LOGGED_IN_PERMISSION_NAME = 'token_read';
          ngUserAuthInfoServiceMock.checkPermissions.and.callFake(function () {
            return permissionOk;
          });
          ngUserAuthInfoServiceMock.whenReady.and.returnValue($q.when());
          ngUserAuthInfoServiceMock.isReady.and.returnValue(true);
          ngUserAuthInfoServiceMock.isLoggedIn.and.returnValue(true);
          return ngUserAuthInfoServiceMock;
        });

      });

      inject(function ($injector) {
        $rootScope = $injector.get('$rootScope');
        $state = $injector.get('$state');
      });
    });

    function initStateTo(stateName) {
      $state.transitionTo(stateName, {});
      $rootScope.$digest();
      expect($state.current.name).toBe(stateName);
    }

    describe('run', function () {

      it('should pass state transition on single values', function () {
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

      it('should pass state transition on multiple values', function () {
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

      it('should fail state transitions', function () {
        // given
        initStateTo('home');
        permissionOk = false;

        // when
        $state.go('single_values');
        $rootScope.$digest();

        // then
        expect($state.current.name).toBe('forbidden');
      });

      it('should redirect to custom fallback defined as string', function () {
        // given
        initStateTo('home');
        permissionOk = false;

        // when
        $state.go('will_be_denied_redirect_state');
        $rootScope.$digest();

        // then
        expect($state.current.name).toBe('customFallback');
      });

      it('should redirect to custom fallback defined as function', function () {
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
})();
