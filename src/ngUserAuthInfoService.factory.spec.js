(function () {
  'use strict';

  describe('ngUserAuth', function () {

    var loggedIn, authInfo;
    var ngUserAuthInfoService, ngUserAuthServiceMock;
    var $rootScope;

    /**
     * Global injects and setups
     */
    beforeEach(function () {
      module('ngUserAuth');

      module(function ($provide) {
        $provide.factory('ngUserAuthService', function ($q) {
          ngUserAuthServiceMock = jasmine.createSpyObj('ngUserAuthService', ['isLoggedIn', 'getUserAuthInfo']);
          ngUserAuthServiceMock.isLoggedIn.and.callFake(function () {
            return loggedIn;
          });
          ngUserAuthServiceMock.getUserAuthInfo.and.callFake(function () {
            return $q.when(authInfo);
          });
          ngUserAuthServiceMock.LOGIN_STATE_CHANGED_EVENT_NAME = 'test:login';
          ngUserAuthServiceMock.AUTH_INFO_CHANGED_EVENT_NAME = 'test:auth';
          return ngUserAuthServiceMock;
        });
      });

      inject(function ($injector) {
        $rootScope = $injector.get('$rootScope');
        ngUserAuthInfoService = $injector.get('ngUserAuthInfoService');
      });
    });

    describe('ngUserAuthInfoService', function () {

      beforeEach(function () {
        loggedIn = false;
        authInfo = {
          user: {
            person: {},
            type: 'SWOA'
          },
          permissions: ['token_read', 'user', 'admin']
        };
        $rootScope.$broadcast(ngUserAuthServiceMock.AUTH_INFO_CHANGED_EVENT_NAME, authInfo);
      });

      it('should change login status on broadcast event', function () {
        // when
        var loginStatus = ngUserAuthInfoService.isLoggedIn();

        // then
        expect(ngUserAuthServiceMock.isLoggedIn).toHaveBeenCalled();
        expect(loginStatus).toBeFalsy();

        // when
        $rootScope.$broadcast(ngUserAuthServiceMock.LOGIN_STATE_CHANGED_EVENT_NAME, true);

        // then
        expect(ngUserAuthInfoService.isLoggedIn()).toBeTruthy();
      });

      it('should resolve ready when ready', function () {
        ngUserAuthInfoService.ready().then(function () {
          expect(ngUserAuthInfoService.getUser()).toEqual(authInfo.user);
        });
      });

      it('should check if user belongs to SWOA', function () {
        // when
        var result = ngUserAuthInfoService.userBelongsTo('SWOA');

        // then
        expect(result).toBeTruthy();
      });

      it('should check the permissions', function () {
        // should pass permission checks
        expect(ngUserAuthInfoService.checkPermissions()).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions(null, null, null, null)).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions(undefined, undefined, undefined, undefined)).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions([], [], [], [])).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions('', '', '', '')).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions(['token_read'])).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions(['token_read', 'user'])).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions([], ['token_read', 'user'])).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions([], ['token_read', 'superman'])).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions([], [], ['superman'])).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions([], [], ['superman', 'batman'])).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions([], [], [], 'SWOA')).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions(['user'], ['admin'], ['superman'], 'SWOA')).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions(['user', 'admin'], ['admin', 'root'], ['superman', 'batman'], 'SWOA')).toBeTruthy();

        // should fail permission checks
        expect(ngUserAuthInfoService.checkPermissions(['superman'], [], [])).toBeFalsy();
        expect(ngUserAuthInfoService.checkPermissions([], ['superman'], [])).toBeFalsy();
        expect(ngUserAuthInfoService.checkPermissions([], [], ['user'])).toBeFalsy();
        expect(ngUserAuthInfoService.checkPermissions([], [], [], 'ASSOCIATION')).toBeFalsy();
      });
    });
  });
})();
