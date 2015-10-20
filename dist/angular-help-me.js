'use strict';
/**
 * @author Marshal
 *
 * HelpMe( angular component) - this provides an alternative and efficient way
 * to add help texts. It also also handle locale based help text in an efficient manner.
 *
 * Please Read the README and look at the code for more details.
 */
/*jshint multistr: true */
angular.module('hiComponents.helpMe', []).value('hiHelpDB', { aboutHelp: 'The help DB will contain a JSON of key value pair, that would be used       to display help content. Use help-text directive by passing the key to get the help content.' }).service('hiHelpDBService', [
  'hiHelpDB',
  function (hiHelpDB) {
    return {
      get: function () {
        return hiHelpDB;
      }
    };
  }
]).service('hiHelpDesk', [
  '$rootScope',
  '$templateCache',
  'hiHelpDBService',
  '$q',
  function ($rootScope, $templateCache, helpDBService, $q) {
    /**
     * @author Marshal
     *
     * Help Desk Service, which allows you to define helpDatabase(JSON),
     * that can be used by hiHelpText directive to display help text
     * for elements.
     *
     * It provide helper methods to access get and populate the helpDb.
     * Currently, it uses helpDb(value provider of angular) to initialize
     * the database. But it also, provides interface to dynamically add
     * help content.
     */
    var helpDatabase = {}, showHelpText = true, _locale = null, helpTemplateKey = 'helpMe.directiveHTML';
    var _isInitialized = function () {
      return helpTemplateKey in $templateCache;
    };
    /**
     * Function to return help text for the given query(key)
     *
     * @param key {String} Key of which you wan the help text
     * @returns {String} Help Text message
     */
    var getHelpForKey = function (key) {
      if (angular.isDefined(_locale) && _locale in helpDatabase) {
        return helpDatabase[_locale][key];
      }
      return helpDatabase[key];
    };
    /**
     * Toggle display of all help texts. It broadcasts the flag
     * which will be listened by hiHelpText directive to act upon it.
     */
    var toggleHelpText = function () {
      showHelpText = !showHelpText;
      $rootScope.$broadcast('hihelpMe-toggle-help-text');
    };
    /**
     * Check whether to display the help text or not.
     * @returns {boolean}
     */
    var isHelpModeOn = function () {
      return showHelpText;
    };
    /**
     * Set whether to display help text or not.
     * @param {boolean} mode
     */
    var setHelpMode = function (mode) {
      showHelpText = mode;
      $rootScope.$broadcast('hihelpMe-toggle-help-text');
    };
    /**
     * Setter for template to be used in rendering help text.
     * @param {string} template
     */
    var setHelpTemplate = function (template) {
      $templateCache.put(helpTemplateKey, template);
    };
    /**
     * Getter for help text template
     * @returns {String} Template
     */
    var getHelpTemplate = function () {
      return $templateCache.get(helpTemplateKey);
    };
    var _initialize = function () {
      setHelpTemplate('<span class="help-block" ng-show="showHelpText"></span>');
      setHelpDatabase(helpDBService.get());
    };
    /**
     * Setter for locale. This will broadcast an event to let hiHelpText directive to
     * re-render it self with the new text contents.
     * Eg. if locale has been changed from english to french, then message corresponding to
     * french should be used.
     *
     * @param {String} locale
     */
    var setLocale = function (locale) {
      _locale = locale;
      $rootScope.$broadcast('hihelpMe-on-locale-change');
    };
    /**
     * Recursively Merge two objects.
     *
     * @param dst Object
     * @param src Object
     * @private
     */
    var _merge = function (dst, src) {
      for (var key in src) {
        if (key in dst && angular.isObject(src[key])) {
          _merge(dst[key], src[key]);
        } else
          dst[key] = src[key];
      }
    };
    /**
     * Setter for helpDb, this provides another way to set help database.
     * This can be used to set db obtained from AJAX call. It will take
     * care of promise object.
     *
     * @param helpDB Object
     */
    var setHelpDatabase = function (helpDB) {
      $q.when(helpDB).then(function (db) {
        _merge(helpDatabase, db);
        $rootScope.$broadcast('hihelpMe-on-db-change');
      });
    };
    /**
     * Function to add help text to the helpDB. This can be used to add more
     * help texts if the helpDB doesn't contain the required one.
     *
     * @param key Key where help text will be stored
     * @param text help text message to be stored
     */
    var addHelpText = function (key, text, locale) {
      if (angular.isDefined(locale)) {
        if (!(locale in helpDatabase)) {
          helpDatabase[locale] = {};
        }
        helpDatabase[locale][key] = text;
      } else {
        helpDatabase[key] = text;
      }
      $rootScope.$broadcast('hihelpMe-on-db-update');
    };
    _initialize();
    return {
      addHelpText: addHelpText,
      getHelpForKey: getHelpForKey,
      toggleHelpText: toggleHelpText,
      isHelpModeOn: isHelpModeOn,
      setHelpMode: setHelpMode,
      setHelpTemplate: setHelpTemplate,
      getHelpTemplate: getHelpTemplate,
      setHelpDatabase: setHelpDatabase,
      setLocale: setLocale
    };
  }
]).directive('hiHelpText', function () {
  /**
   * @author Marshal
   *
   * This directive can be used to display help text for a particular
   * form element. It uses HelpDesk Service to get the help-text.
   * User of this directive has to pass a valid key, corresponding
   * to which help text will be queried from helpDesk Service.
   *
   * NOTE: To display help text, currently it uses bootstrap's 'help-block'
   * class on span element.
   *
   */
  return {
    scope: true,
    controller: [
      '$scope',
      '$compile',
      'hiHelpDesk',
      '$log',
      function ($scope, $compile, helpDesk, $log) {
        $scope.helpKey = '';
        $scope.getHelpElement = function (helpKey) {
          $scope.helpKey = helpKey;
          $scope.helpText = helpDesk.getHelpForKey(helpKey);
          $scope.showHelpText = helpDesk.isHelpModeOn();
          var helpElement = angular.element(helpDesk.getHelpTemplate());
          helpElement.attr('data-ng-bind', 'helpText');
          return $compile(helpElement)($scope);
        };
        // Listen for toggle help text on scope broad-casted from helpDesk
        // and act accordingly.
        $scope.$on('hihelpMe-toggle-help-text', function () {
          $scope.showHelpText = helpDesk.isHelpModeOn();
        });
        $scope.$on('hihelpMe-on-locale-change', function () {
          $scope.helpText = helpDesk.getHelpForKey($scope.helpKey);
        });
        $scope.$on('hihelpMe-on-db-change', function () {
          $scope.helpText = helpDesk.getHelpForKey($scope.helpKey);
        });
        $scope.$on('hihelpMe-on-db-update', function (event, data) {
          if (data.key === $scope.helpKey) {
            $scope.helpText = helpDesk.getHelpForKey($scope.helpKey);
          }
        });
      }
    ],
    link: function (scope, element, attrs) {
      if (attrs.hiHelpText === '') {
        return;  // do nothing if it doesn't have key
      }
      var isContainerElement = function () {
        var nonContainerElements = [
            'input',
            'select',
            'textarea'
          ], tagName = element.prop('tagName').toLowerCase();
        return nonContainerElements.indexOf(tagName) === -1;
      };
      var addHelpElement = function () {
        var helpElement = scope.getHelpElement(attrs.hiHelpText);
        if (isContainerElement(element)) {
          element.append(helpElement);
        } else {
          element.after(helpElement);
        }
      };
      addHelpElement();
    }
  };
});