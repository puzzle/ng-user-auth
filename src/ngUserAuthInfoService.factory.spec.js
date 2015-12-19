(function () {
  'use strict';

  describe('ngUserAuthInfo.service', function () {

    var loggedIn, authInfo;
    var ngUserAuthInfoService, ngUserAuthServiceMock;
    var $rootScope;

    /**
     * Global injects and setups
     */
    beforeEach(function () {
      module('ngUserAuthInfo.service');

      module(function ($provide) {
        $provide.factory('ngUserAuthService', function ($q) {
          ngUserAuthServiceMock = jasmine.createSpyObj('ngUserAuthService', [
            'isLoggedIn', 'getUserAuthInfo'
          ]);
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

      it('should resolve whenReady when ready', function () {
        ngUserAuthInfoService.whenReady().then(function () {
          expect(ngUserAuthInfoService.getUser()).toEqual(authInfo.user);
        });
      });

      it('should check the permissions', function () {
        // should pass permission checks
        expect(ngUserAuthInfoService.checkPermissions()).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions(null, null, null)).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions(undefined, undefined, undefined)).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions([], [], [])).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions('', '', '')).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions(['token_read'])).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions(['token_read', 'user'])).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions([], ['token_read', 'user'])).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions([], ['token_read', 'superman'])).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions([], [], ['superman'])).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions([], [], ['superman', 'batman'])).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions([], [], [])).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions(['user'], ['admin'], ['superman'])).toBeTruthy();
        expect(ngUserAuthInfoService.checkPermissions(['user', 'admin'], ['admin', 'root'], ['superman', 'batman'])).toBeTruthy();

        // should fail permission checks
        expect(ngUserAuthInfoService.checkPermissions(['superman'], [], [])).toBeFalsy();
        expect(ngUserAuthInfoService.checkPermissions([], ['superman'], [])).toBeFalsy();
        expect(ngUserAuthInfoService.checkPermissions([], [], ['user'])).toBeFalsy();
      });
    });
  });
})();
