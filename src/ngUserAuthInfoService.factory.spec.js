import angular from 'angular';
import uaInfoService from './ngUserAuthInfoService.factory';

describe('ngUserAuthInfo.service', () => {
  let loggedIn,
    authInfo,
    ignoreCase;
  let ngUserAuthInfoService,
    ngUserAuthServiceMock;
  let $rootScope;

  /**
   * Global injects and setups
   */
  beforeEach(() => {
    angular.mock.module(uaInfoService);

    angular.mock.module(($provide) => {
      $provide.factory('ngUserAuthService', ($q) => {
        ngUserAuthServiceMock = jasmine.createSpyObj('ngUserAuthService', [
          'isLoggedIn',
          'getUserAuthInfo',
          'shouldIgnoreCaseInRoleNames',
        ]);
        ngUserAuthServiceMock.isLoggedIn.and.callFake(() => loggedIn);
        ngUserAuthServiceMock.getUserAuthInfo.and.callFake(() => $q.when(authInfo));
        ngUserAuthServiceMock.shouldIgnoreCaseInRoleNames.and.callFake(() => ignoreCase);
        ngUserAuthServiceMock.LOGIN_STATE_CHANGED_EVENT_NAME = 'test:login';
        ngUserAuthServiceMock.AUTH_INFO_CHANGED_EVENT_NAME = 'test:auth';
        return ngUserAuthServiceMock;
      });
    });

    angular.mock.inject(($injector) => {
      $rootScope = $injector.get('$rootScope');
      ngUserAuthInfoService = $injector.get('ngUserAuthInfoService');
    });
  });

  describe('ngUserAuthInfoService', () => {
    beforeEach(() => {
      loggedIn = false;
      ignoreCase = false;
      authInfo = {
        user: {
          person: {},
          type: 'SWOA',
        },
        permissions: ['token_read', 'user', 'admin'],
      };
      $rootScope.$broadcast(ngUserAuthServiceMock.AUTH_INFO_CHANGED_EVENT_NAME, authInfo);
    });

    it('should change login status on broadcast event', () => {
      // when
      const loginStatus = ngUserAuthInfoService.isLoggedIn();

      // then
      expect(ngUserAuthServiceMock.isLoggedIn).toHaveBeenCalled();
      expect(loginStatus).toBeFalsy();

      // when
      $rootScope.$broadcast(ngUserAuthServiceMock.LOGIN_STATE_CHANGED_EVENT_NAME, true);

      // then
      expect(ngUserAuthInfoService.isLoggedIn()).toBeTruthy();
    });

    it('should resolve whenReady when ready', () => {
      ngUserAuthInfoService.whenReady().then(() => {
        expect(ngUserAuthInfoService.getUser()).toEqual(authInfo.user);
      });
    });

    it('should check the permissions', () => {
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

      // fail because of upper case
      expect(ngUserAuthInfoService.checkPermissions(['token_READ'])).toBeFalsy();
      expect(ngUserAuthInfoService.checkPermissions('token_READ')).toBeFalsy();
      expect(ngUserAuthInfoService.checkPermissions([], [], ['superMAN'])).toBeTruthy();
      expect(ngUserAuthInfoService.checkPermissions([], ['USER'], [])).toBeFalsy();
    });
  });

  describe('ngUserAuthInfoService ignore case', () => {
    beforeEach(() => {
      loggedIn = false;
      ignoreCase = true;
      authInfo = {
        user: {
          person: {},
          type: 'SWOA',
        },
        permissions: ['token_read', 'user', 'admin'],
      };
      $rootScope.$broadcast(ngUserAuthServiceMock.AUTH_INFO_CHANGED_EVENT_NAME, authInfo);
    });

    it('should change login status on broadcast event', () => {
      expect(ngUserAuthInfoService.checkPermissions(['token_READ'])).toBeTruthy();
      expect(ngUserAuthInfoService.checkPermissions([], [], ['superMAN'])).toBeTruthy();
      expect(ngUserAuthInfoService.checkPermissions([], ['USER'], [])).toBeTruthy();
      expect(ngUserAuthInfoService.checkPermissions(['token_read', 'USER'])).toBeTruthy();
    });
  });
});
