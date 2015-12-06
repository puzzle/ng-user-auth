(function () {
  'use strict';

  describe('ngUserAuth', function () {

    var ngUserAuthService, ngUserAuthServiceMock, $httpBackend, localStorageService;

    var USER_TOKEN_STORAGE_KEY = 'user.token';
    var USER_TOKEN = 'abcdefgh';
    var ORIGINAL_AUTH_INFO = {
      permissions: ['token_read', 'permission_1', 'permission_2', 'user', 'admin'],
      user: {
        person: {
          forename: 'Hans',
          surname: 'Muster'
        }
      }
    };
    var LOGIN_MOCK_DATA = angular.extend({token: USER_TOKEN}, ORIGINAL_AUTH_INFO);

    /**
     * Global injects and setups
     */
    beforeEach(function () {
      module('ngUserAuth');

      inject(function ($injector) {
        ngUserAuthServiceMock = $injector.get('ngUserAuthService');
        $httpBackend = $injector.get('$httpBackend');
        localStorageService = $injector.get('localStorageService');

        // test original service instead of the mocked version!!!
        ngUserAuthService = ngUserAuthServiceMock.original;
      });
    });

    describe('ngUserAuthService', function () {

      beforeEach(function () {
        ngUserAuthService.clearUserToken();
      });

      it('is not logged in', function () {
        // then
        expect(ngUserAuthService.isLoggedIn()).toBeFalsy();
        expect(ngUserAuthService.getUserToken()).toBeNull();
      });

      describe('login/logout', function () {
        it('should log in', function () {
          // given
          $httpBackend.expectPOST('/authentication').respond(JSON.stringify(LOGIN_MOCK_DATA));

          // when
          ngUserAuthService.login({username: 'bla', password: 'bla'});
          $httpBackend.flush();

          // then
          expect(ngUserAuthService.isLoggedIn()).toBeTruthy();
          expect(ngUserAuthService.getUserToken()).toBe(LOGIN_MOCK_DATA.token);

          expect(localStorageService.get(USER_TOKEN_STORAGE_KEY)).toBe(LOGIN_MOCK_DATA.token);

          ngUserAuthService.getUserAuthInfo().then(function (result) {
            expect(result.user.person.forename).toBe(LOGIN_MOCK_DATA.user.person.forename);
          });
        });

        it('should log out', function () {
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

      it('should load authentication with token from local storage', function () {
        // given
        $httpBackend.expectGET('/authentication').respond(JSON.stringify(ORIGINAL_AUTH_INFO));
        localStorageService.set(USER_TOKEN_STORAGE_KEY, LOGIN_MOCK_DATA.token);

        // when
        ngUserAuthService.getUserAuthInfo().then(function (result) {

          // then
          expect(ngUserAuthService.isLoggedIn()).toBeTruthy();
          expect(ngUserAuthService.getUserToken()).toBe(LOGIN_MOCK_DATA.token);
          expect(result.user.person.forename).toBe(LOGIN_MOCK_DATA.user.person.forename);
        });

        $httpBackend.flush();
      });
    });
  });
})();
