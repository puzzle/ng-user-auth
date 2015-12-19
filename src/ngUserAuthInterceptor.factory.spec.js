(function () {
  'use strict';

  describe('ngUserAuth.interceptor', function () {

    var ngUserAuthInterceptor, ngUserAuthServiceMock;
    var $rootScope;

    /**
     * Global injects and setups
     */
    beforeEach(function () {
      module('ngUserAuth.interceptor');

      module(function ($provide) {
        $provide.factory('ngUserAuthService', function () {
          ngUserAuthServiceMock = jasmine.createSpyObj('ngUserAuthService', [
            'getUserToken',
            'clearUserToken',
            'goToLoginScreen',
            'getAbortRequestsUrlPrefix'
          ]);
          ngUserAuthServiceMock.getUserToken.and.returnValue('foo');
          ngUserAuthServiceMock.getAbortRequestsUrlPrefix.and.returnValue('/bar')
          return ngUserAuthServiceMock;
        });
      });

      inject(function ($injector) {
        $rootScope = $injector.get('$rootScope');
        ngUserAuthInterceptor = $injector.get('ngUserAuthInterceptor');
      });
    });

    describe('ngUserAuthInterceptor', function () {

      it('should handle request for canceable call', function () {
        // given
        var config = {
          url: '/bar/baz'
        };

        // when
        var returnedConfig = ngUserAuthInterceptor.request(config);

        // then
        expect(returnedConfig.noCancelOnRouteChange).toBeUndefined();
        expect(returnedConfig.$timeout).toBeDefined();
        expect(returnedConfig.timeout).toBe(returnedConfig.$timeout.promise);
        expect(returnedConfig.headers.Authorization).toEqual('Bearer foo');
      });

      it('should handle response error 401', function () {
        // given
        var response = {
          config: {
            url: '/bar/baz',
            timeout: {}
          },
          status: 401
        };

        // when
        ngUserAuthInterceptor.responseError(response).then(function () {
          expect('should not get here').toBe('should not be called');
        }, function (errorResponse) {

          // then
          expect(ngUserAuthServiceMock.clearUserToken).toHaveBeenCalled();
          expect(ngUserAuthServiceMock.goToLoginScreen).toHaveBeenCalled();
          expect(errorResponse).toBe(response);
        });
        $rootScope.$digest();
      });

      it('should handle response error 403', function () {
        // given
        var response = {
          config: {
            url: '/bar/baz',
            timeout: {}
          },
          status: 403
        };

        // when
        ngUserAuthInterceptor.responseError(response).then(function () {
          expect('should not get here').toBe('should not be called');
        }, function (errorResponse) {

          // then
          expect(errorResponse.hasNoAccess).toBeTruthy();
        });
        $rootScope.$digest();
      });

      it('should cancel calls on error', function () {
        // given
        var responses = [{
          config: {
            url: '/bar/baz'
          },
          status: 200
        }, {
          config: {
            url: '/foo'
          },
          status: 200
        }, {
          config: {
            url: '/bar/baz'
          },
          status: 401
        }];
        responses[0].config = ngUserAuthInterceptor.request(responses[0].config);
        responses[1].config = ngUserAuthInterceptor.request(responses[1].config);
        responses[2].config = ngUserAuthInterceptor.request(responses[2].config);

        // when
        ngUserAuthInterceptor.responseError(responses[2]).then(function () {
          expect('should not get here').toBe('should not be called');
        }, function () {

          // then
          expect(responses[0].config.timeout.isGloballyCancelled).toBeTruthy();
          expect(responses[1].config.timeout).toBeUndefined();
          expect(responses[1].config.noCancelOnRouteChange).toBeTruthy();
        });
        $rootScope.$digest();
      });
    });
  });
})();
