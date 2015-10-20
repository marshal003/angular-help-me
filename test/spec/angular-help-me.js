'use strict';

describe('hiHelpText', function() {

  var ele, scope, helpService;
  beforeEach(function() {
    module('hiComponents.helpMe', function($provide) {
      /**
       * Default help element uses ng-show to show & hide element.
       * However, for our test case, we want to use ng-if. Using decorator
       * we ca easily tweak this behavior.
       */
      $provide.decorator('hiHelpDesk', function($delegate) {
        $delegate.setHelpTemplate('<span class="help-block" ng-if="showHelpText"></span>');
        return $delegate;
      });
    });
  });

  beforeEach(inject(function($rootScope, $compile, hiHelpDesk) {
    scope = $rootScope.$new();
    helpService = hiHelpDesk;
    ele = angular.element('<div class="form-group"><input type="text" hi-help-text="aboutHelp"></div>');
    $compile(ele)(scope);
    scope.$digest();
  }));

  describe('Use HelpDesk Service to control visibility help block', function() {
    it('should visible in default', function() {
      var helpElement = ele.find('span'); // JQLite's find is limited to tag only.
      expect(helpElement.length).toEqual(1);
    });

    it('should hide help-block when we turn off helpMode', function() {
      helpService.setHelpMode(false);
      scope.$apply();
      var helpElement = ele.find('span'); // JQLite's find is limited to tag only.
      expect(helpElement.length).toEqual(0);
    });

    it('should show help-block by turn-on help-mode', function() {
      helpService.setHelpMode(true);
      scope.$apply();
      var helpElement = ele.find('span'); // JQLite's find is limited to tag only.
      expect(helpElement.length).toEqual(1);
    });
  });
});
