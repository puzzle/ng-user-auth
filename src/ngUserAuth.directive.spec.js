import angular from 'angular';
import uaDirective from './ngUserAuth.directive';

describe('ngUserAuth.directive', () => {
  let ngUserAuthInfoServiceMock,
    permissionOk,
    callback;
  let $compile,
    $rootScope,
    element;

  /**
   * Global injects and setups
   */
  beforeEach(() => {
    angular.mock.module(uaDirective);

    angular.mock.module(($provide) => {
      $provide.factory('ngUserAuthInfoService', () => {
        ngUserAuthInfoServiceMock = jasmine.createSpyObj('ngUserAuthInfoService', [
          'checkPermissions',
          'userHasPermission',
          'userHasAnyPermission',
          'userLacksPermission',
          'notifyOnAuthChange',
        ]);
        ngUserAuthInfoServiceMock.checkPermissions.and.callFake(() => permissionOk);
        ngUserAuthInfoServiceMock.userHasPermission.and.callFake(() => permissionOk);
        ngUserAuthInfoServiceMock.userHasAnyPermission.and.callFake(() => permissionOk);
        ngUserAuthInfoServiceMock.userLacksPermission.and.callFake(() => permissionOk);
        ngUserAuthInfoServiceMock.notifyOnAuthChange.and.callFake((fn) => {
          callback = fn;
        });
        return ngUserAuthInfoServiceMock;
      });
    });

    angular.mock.inject(($injector) => {
      $compile = $injector.get('$compile');
      $rootScope = $injector.get('$rootScope');
    });
  });

  function setupDirective(template) {
    element = $compile(template)($rootScope);
    $rootScope.$digest();
  }

  describe('ngUserAuth', () => {
    beforeEach(() => {
      permissionOk = true;
      callback = null;
    });

    it('checks nothing on empty values', () => {
      // when
      setupDirective('<div ua-permission></div>');

      // then
      expect(element.css('display')).toBe('');
      expect(ngUserAuthInfoServiceMock.userHasPermission).toHaveBeenCalledWith('');
    });

    it('checks all attributes on single values', () => {
      // when
      setupDirective('<div ua-permission="str1" ua-any-permission="str2" ua-lacks-permission="str3"></div>');

      // then
      expect(element.css('display')).toBe('');
      expect(ngUserAuthInfoServiceMock.userHasPermission).toHaveBeenCalledWith('str1');
      expect(ngUserAuthInfoServiceMock.userHasAnyPermission).toHaveBeenCalledWith('str2');
      expect(ngUserAuthInfoServiceMock.userLacksPermission).toHaveBeenCalledWith('str3');
    });

    it('checks all attributes on multiple values', () => {
      // when
      setupDirective(`<div ua-permission="['str1', 'str2']"
                           ua-any-permission="['str3', 'str4']"
                           ua-lacks-permission="['str5', 'str6']">
                      </div>`);

      // then
      expect(element.css('display')).toBe('');
      expect(ngUserAuthInfoServiceMock.userHasPermission).toHaveBeenCalledWith(['str1', 'str2']);
      expect(ngUserAuthInfoServiceMock.userHasAnyPermission).toHaveBeenCalledWith(['str3', 'str4']);
      expect(ngUserAuthInfoServiceMock.userLacksPermission).toHaveBeenCalledWith(['str5', 'str6']);
    });

    it('toggles the element when permissions change', () => {
      // when
      setupDirective('<div ua-lacks-permission="user"></div>');

      // then
      expect(element.css('display')).toBe('');
      expect(ngUserAuthInfoServiceMock.userLacksPermission).toHaveBeenCalledWith('user');
      expect(callback).toEqual(jasmine.any(Function));

      // when
      permissionOk = false;
      callback();

      // then
      expect(element.css('display')).toBe('none');
    });
  });
});

