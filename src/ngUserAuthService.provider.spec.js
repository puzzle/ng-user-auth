import angular from 'angular';
import uaService from './ngUserAuthService.provider';

describe('ngUserAuth.provider', () => {
  let ngUserAuthService;

  beforeEach(() => {
    angular.mock.module(uaService);

    angular.mock.module((ngUserAuthServiceProvider) => {
      ngUserAuthServiceProvider.setApiEndpoint('/api');
      ngUserAuthServiceProvider.setUnauthorizedUrl('/illegal');
      ngUserAuthServiceProvider.setRequestedPathParameterName('/what');
      ngUserAuthServiceProvider.setAbortRequestsUrlPrefix('/abort');
      ngUserAuthServiceProvider.addLogoutAction(() => {
      });
      ngUserAuthServiceProvider.setDefaultLoggedInPermissionName('default.permission');
      ngUserAuthServiceProvider.setSessionCheckSettings({});

      expect(ngUserAuthServiceProvider.getOtherwiseRouteHandler()).toEqual(jasmine.any(Function));
    });

    angular.mock.inject(($injector) => {
      ngUserAuthService = $injector.get('ngUserAuthService');
    });
  });

  describe('ngUserAuthService', () => {
    beforeEach(() => {
      ngUserAuthService.clearUserToken();
    });

    it('has the correct default values', () => {
      expect(ngUserAuthService.getApiEndpoint()).toEqual('/api');
      expect(ngUserAuthService.getAbortRequestsUrlPrefix()).toEqual('/abort');
      expect(ngUserAuthService.getDefaultLoggedInPermissionName()).toEqual('default.permission');
    });
  });
});

describe('ngUserAuth.service', () => {
  let ngUserAuthService,
    $httpBackend,
    localStorageService;

  const USER_TOKEN_STORAGE_KEY = 'user.token';
  const USER_TOKEN = 'abcdefgh';
  const ORIGINAL_AUTH_INFO = {
    permissions: ['token_read', 'permission_1', 'permission_2', 'user', 'admin'],
    user: {
      person: {
        forename: 'Hans',
        surname: 'Muster',
      },
    },
  };
  const LOGIN_MOCK_DATA = angular.extend({ token: USER_TOKEN }, ORIGINAL_AUTH_INFO);

  /**
   * Global injects and setups
   */
  beforeEach(() => {
    angular.mock.module(uaService);

    angular.mock.inject(($injector) => {
      ngUserAuthService = $injector.get('ngUserAuthService');
      $httpBackend = $injector.get('$httpBackend');
      localStorageService = $injector.get('localStorageService');
    });
  });

  describe('ngUserAuthService', () => {
    beforeEach(() => {
      ngUserAuthService.clearUserToken();
    });

    it('has the correct default values', () => {
      expect(ngUserAuthService.getApiEndpoint()).toEqual('/authentication');
      expect(ngUserAuthService.getAbortRequestsUrlPrefix()).toEqual('/');
      expect(ngUserAuthService.getDefaultLoggedInPermissionName()).toEqual('token_read');
    });

    it('is not logged in', () => {
      // then
      expect(ngUserAuthService.isLoggedIn()).toBeFalsy();
      expect(ngUserAuthService.getUserToken()).toBeNull();
    });

    describe('login/logout', () => {
      it('should log in', () => {
        // given
        $httpBackend.expectPOST('/authentication').respond(JSON.stringify(LOGIN_MOCK_DATA));

        // when
        ngUserAuthService.login({ username: 'bla', password: 'bla' });
        $httpBackend.flush();

        // then
        expect(ngUserAuthService.isLoggedIn()).toBeTruthy();
        expect(ngUserAuthService.getUserToken()).toBe(LOGIN_MOCK_DATA.token);

        expect(localStorageService.get(USER_TOKEN_STORAGE_KEY)).toBe(LOGIN_MOCK_DATA.token);

        ngUserAuthService.getUserAuthInfo().then((result) => {
          expect(result.user.person.forename).toBe(LOGIN_MOCK_DATA.user.person.forename);
        });
      });

      it('should log out', () => {
        // given
        $httpBackend.expectDELETE('/authentication').respond({});

        // when
        ngUserAuthService.logout();
        $httpBackend.flush();

        // then
        expect(ngUserAuthService.isLoggedIn()).toBeFalsy();
        expect(ngUserAuthService.getUserToken()).toBeNull();
      });
    });

    it('should load authentication with token from local storage', () => {
      // given
      $httpBackend.expectGET('/authentication').respond(JSON.stringify(ORIGINAL_AUTH_INFO));
      localStorageService.set(USER_TOKEN_STORAGE_KEY, LOGIN_MOCK_DATA.token);

      // when
      ngUserAuthService.getUserAuthInfo().then((result) => {
        // then
        expect(ngUserAuthService.isLoggedIn()).toBeTruthy();
        expect(ngUserAuthService.getUserToken()).toBe(LOGIN_MOCK_DATA.token);
        expect(result.user.person.forename).toBe(LOGIN_MOCK_DATA.user.person.forename);
      });

      $httpBackend.flush();
    });
  });
});
