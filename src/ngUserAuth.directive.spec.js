(function () {
  'use strict';

  describe('ngUserAuth', function () {

    var ngUserAuthInfoServiceMock, permissionOk, callback;
    var $compile, $rootScope, element;

    /**
     * Global injects and setups
     */
    beforeEach(function () {
      module('ngUserAuth');

      module(function ($provide) {
        $provide.factory('ngUserAuthInfoService', function () {
          ngUserAuthInfoServiceMock = jasmine.createSpyObj('ngUserAuthInfoService', ['checkPermissions', 'notifyOnAuthChange']);
          ngUserAuthInfoServiceMock.checkPermissions.and.callFake(function () {
            return permissionOk;
          });
          ngUserAuthInfoServiceMock.notifyOnAuthChange.and.callFake(function (fn) {
            callback = fn;
          });
          return ngUserAuthInfoServiceMock;
        });
      });

      inject(function ($injector) {
        $compile = $injector.get('$compile');
        $rootScope = $injector.get('$rootScope');
      });
    });

    function setupDirective(template) {
      element = $compile(template)($rootScope);
      $rootScope.$digest();
    }

    describe('ngUserAuth', function () {

      beforeEach(function () {
        permissionOk = true;
        callback = null;
      });

      it('checks nothing on empty values', function () {
        // when
        setupDirective('<div ng-user-auth></div>');

        // then
        expect(element.css('display')).toBe('block');
        expect(ngUserAuthInfoServiceMock.checkPermissions).toHaveBeenCalledWith(undefined, undefined, undefined, undefined);
      });

      it('checks all attributes on single values', function () {
        // when
        setupDirective('<div ng-user-auth has-permission="str1" has-any-permission="str2" ' +
          'lacks-permission="str3" is-user-type="str4"></div>');

        // then
        expect(element.css('display')).toBe('block');
        expect(ngUserAuthInfoServiceMock.checkPermissions).toHaveBeenCalledWith('str1', 'str2', 'str3', 'str4');
      });

      it('checks all attributes on multiple values', function () {
        // when
        setupDirective('<div ng-user-auth has-permission="[\'str1\', \'str2\']" ' +
          'has-any-permission="[\'str3\', \'str4\']" lacks-permission="[\'str5\', \'str6\']" is-user-type="str7"></div>');

        // then
        expect(element.css('display')).toBe('block');
        expect(ngUserAuthInfoServiceMock.checkPermissions)
          .toHaveBeenCalledWith(['str1', 'str2'], ['str3', 'str4'], ['str5', 'str6'], 'str7');
      });

      it('toggles the element when permissions change', function () {
        // when
        setupDirective('<div ng-user-auth lacks-permission="user"></div>');

        // then
        expect(element.css('display')).toBe('block');
        expect(ngUserAuthInfoServiceMock.checkPermissions).toHaveBeenCalledWith(undefined, undefined, 'user', undefined);
        expect(callback).toEqual(jasmine.any(Function));

        // when
        permissionOk = false;
        callback();

        // then
        expect(element.css('display')).toBe('none');
      });
    });
  });
})();
