import angular from 'angular';
import uaInterceptor from './ngUserAuthInterceptor.factory';

describe('ngUserAuth.interceptor', () => {
  let ngUserAuthInterceptor,
    ngUserAuthServiceMock;
  let $rootScope;

  /**
   * Global injects and setups
   */
  beforeEach(() => {
    angular.mock.module(uaInterceptor);

    angular.mock.module(($provide) => {
      $provide.factory('ngUserAuthService', () => {
        ngUserAuthServiceMock = jasmine.createSpyObj('ngUserAuthService', [
          'getUserToken',
          'clearUserToken',
          'goToLoginScreen',
          'getAbortRequestsUrlPrefix',
        ]);
        ngUserAuthServiceMock.getUserToken.and.returnValue('foo');
        ngUserAuthServiceMock.getAbortRequestsUrlPrefix.and.returnValue('/bar');
        return ngUserAuthServiceMock;
      });
    });

    angular.mock.inject(($injector) => {
      $rootScope = $injector.get('$rootScope');
      ngUserAuthInterceptor = $injector.get('ngUserAuthInterceptor');
    });
  });

  describe('ngUserAuthInterceptor', () => {
    it('should handle request for canceable call', () => {
      // given
      const config = {
        url: '/bar/baz',
      };

      // when
      const returnedConfig = ngUserAuthInterceptor.request(config);

      // then
      expect(returnedConfig.noCancelOnRouteChange).toBeUndefined();
      expect(returnedConfig.$timeout).toBeDefined();
      expect(returnedConfig.timeout).toBe(returnedConfig.$timeout.promise);
      expect(returnedConfig.headers.Authorization).toEqual('Bearer foo');
    });

    it('should handle response error 401', () => {
      // given
      const response = {
        config: {
          url: '/bar/baz',
          timeout: {},
        },
        status: 401,
      };

      // when
      ngUserAuthInterceptor.responseError(response).then(() => {
        expect('should not get here').toBe('should not be called');
      }, (errorResponse) => {
        // then
        expect(ngUserAuthServiceMock.clearUserToken).toHaveBeenCalled();
        expect(ngUserAuthServiceMock.goToLoginScreen).toHaveBeenCalled();
        expect(errorResponse).toBe(response);
      });
      $rootScope.$digest();
    });

    it('should handle response error 403', () => {
      // given
      const response = {
        config: {
          url: '/bar/baz',
          timeout: {},
        },
        status: 403,
      };

      // when
      ngUserAuthInterceptor.responseError(response).then(() => {
        expect('should not get here').toBe('should not be called');
      }, (errorResponse) => {
        // then
        expect(errorResponse.hasNoAccess).toBeTruthy();
      });
      $rootScope.$digest();
    });

    it('should cancel calls on error', () => {
      // given
      const responses = [{
        config: {
          url: '/bar/baz',
        },
        status: 200,
      }, {
        config: {
          url: '/foo',
        },
        status: 200,
      }, {
        config: {
          url: '/bar/baz',
        },
        status: 401,
      }];
      responses[0].config = ngUserAuthInterceptor.request(responses[0].config);
      responses[1].config = ngUserAuthInterceptor.request(responses[1].config);
      responses[2].config = ngUserAuthInterceptor.request(responses[2].config);

      // when
      ngUserAuthInterceptor.responseError(responses[2]).then(() => {
        expect('should not get here').toBe('should not be called');
      }, () => {
        // then
        expect(responses[0].config.timeout.isGloballyCancelled).toBeTruthy();
        expect(responses[1].config.timeout).toBeUndefined();
        expect(responses[1].config.noCancelOnRouteChange).toBeTruthy();
      });
      $rootScope.$digest();
    });
  });
});
