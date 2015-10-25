/**
 * @name angular-help-me
 *
 * @fileoverview This is an Angular module for rendering help blocks in UI-forms.
 * Putting help content for end user is pretty common, but is repeatable
 * and is complicated to change. This module tries to solve this problem
 * in angular way(i.e making it declarative and DRY).
 *
 * @author Vinit Kumar Rai
 */


'use strict';

/*jshint multistr: true */
angular.module('hiComponents.helpMe', [])

/**
 * A Sample Value provider that provides Object as Help Database. User of this
 * module can easily overrite this provider to configure their own database.
 *
 * @param  {String} 'hiHelpDB'  - Name of help database. This is being used in hiHelpDBService.
 */
.value('hiHelpDB', {
  aboutHelp: 'The help DB will contain a JSON of key value pair, that would be used \
      to display help content. Use help-text directive by passing the key to get the help content.'
})

/**
 * Service Provider for Help Database. It only has 'get' method which returns 'hiHelpDB' (value provider)
 * @param  {string} 'hiHelpDBService' - Name of angular service (database service)
 * @param  {string} 'hiHelpDB'        - Value Provider dependency
 * @param  {function} function(hiHelpDB) - Inner Function, that returns object.
 */
.service('hiHelpDBService', ['hiHelpDB', function(hiHelpDB) {
  return {
    get: function() {
      return hiHelpDB;
    }
  };
}])

/**
 * Help Desk Service, which allows you to define helpDatabase(JSON),
 * that can be used by hiHelpText directive to display help text
 * for elements.
 *
 * It provide helper methods to access get and populate the helpDb.
 * Currently, it uses helpDb(value provider of angular) to initialize
 * the database. Howevere it also, provides interface to dynamically add
 * help content.
 */
.service('hiHelpDesk', ['$rootScope', '$templateCache', 'hiHelpDBService', '$q',

  function($rootScope, $templateCache, helpDBService, $q) {

    var helpDatabase = {},
      showHelpText = true,
      _locale = null,
      defaultTemplateKey = 'helpMe.directiveHTML';


    /**
     * Function to return help text for the given query(key)
     *
     * @param key {String} - Key of which you wan the help text
     * @returns {String}   - Help Text message
     */
    var getHelpForKey = function(key) {
      if (angular.isDefined(_locale) && _locale in helpDatabase) {
        return helpDatabase[_locale][key];
      }
      return helpDatabase[key];
    };

    /**
     * Toggle display of all help texts. It broadcasts the flag
     * which will be listened by hiHelpText directive to act upon it.
     */
    var toggleHelpText = function() {
      showHelpText = !showHelpText;
      $rootScope.$broadcast('hihelpMe-toggle-help-text');
    };

    /**
     * Check whether to display the help text or not.
     * @returns {boolean}
     */
    var isHelpModeOn = function() {
      return showHelpText;
    };

    /**
     * Set whether to display help text or not.
     * @param {boolean} mode
     */
    var setHelpMode = function(mode) {
      showHelpText = mode;
      $rootScope.$broadcast('hihelpMe-toggle-help-text');
    };

    /**
     * Setter for template to be used in rendering help text.
     * @param {string} template
     */
    var setHelpTemplate = function(template) {
      $templateCache.put(defaultTemplateKey, template);
    };

    /**
     * Getter for help text template.
     * @returns {String} Template
     */
    var getHelpTemplate = function(key) {
      if (!key) {
        key = defaultTemplateKey;
      }
      return $templateCache.get(key);
    };

    /**
     * Initializer function which get executed on service initialization.
     * Here we register our default help-text template only when there is no
     * template already registered by user. This actually allows user to override
     * the default template.
     *
     * It also initializes the help database using helpDBService.
     */
    var _initialize = function() {
      if (!$templateCache.get(defaultTemplateKey)) {
        setHelpTemplate('<span class="help-block" ng-show="showHelpText" ng-bind="helpText"></span>');
      }
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
    var setLocale = function(locale) {
      _locale = locale;
      $rootScope.$broadcast('hihelpMe-on-locale-change');
    };

    /**
     * Utility Function to merge two objects, this will be used for updating
     * database after service initialization.
     *
     * @todo Move this method into an independent utility service.
     *
     * @param  {object} dst - Destination Object, in which we need to merge
     * @param  {object} src - Source Object, which needs to be merged in dst.
     * @return {undefined}  - Nothing
     */
    var _merge = function(dst, src) {
      for (var key in src) {
        if ((key in dst) && angular.isObject(src[key])) {
          _merge(dst[key], src[key]);
        } else
          dst[key] = src[key];
      }
    };

    /**
     * Function to reset / update the existing help database.
     * On DB update it will broadcast 'hihelpMe-on-db-change' event
     * that let hiHelpText directive to re-render itself with new help content.
     *
     * @param  {object} helpDB - object with help content.
     */
    var setHelpDatabase = function(helpDB) {
      $q.when(helpDB).then(function(db) {
        _merge(helpDatabase, db);
        $rootScope.$broadcast('hihelpMe-on-db-change');
      });
    };

    /**
     * Function to add help text to the helpDB. This can be used to add more
     * help texts if the helpDB doesn't contain the required one.
     *
     * @param {string} key  - Key where help text will be stored
     * @param {string} text - help text message to be stored
     * @param {string} locale - locale for which we need to display the help text.
     */
    var addHelpText = function(key, text, locale) {
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
])

/**
 * This directive can be used to display help text for a particular
 * form element. It uses HelpDesk Service to get the help-text.
 * User of this directive has to pass a valid key, corresponding
 * to which help text will be queried from helpDesk Service.
 *
 * NOTE: To display help text, currently it uses bootstrap's 'help-block'
 * class on span element.
 *
 */
.directive('hiHelpText', function() {

  return {
    scope: true,
    restrict: 'A',
    controller: ['$scope', '$compile', 'hiHelpDesk', '$log',
      function($scope, $compile, helpDesk, $log) {

        $scope.helpKey = '';
        $scope.getHelpElement = function(helpKey, tplKey) {
          $scope.helpKey = helpKey;
          $scope.helpText = helpDesk.getHelpForKey(helpKey);
          $scope.showHelpText = helpDesk.isHelpModeOn() && $scope.helpText;
          var helpElement = angular.element(helpDesk.getHelpTemplate(tplKey));
          return $compile(helpElement)($scope);
        };

        /**
         * @listens 'hihelpMe-toggle-help-text' and toggle display of help text.
         */
        $scope.$on('hihelpMe-toggle-help-text', function() {
          $scope.showHelpText = helpDesk.isHelpModeOn() && ($scope.helpText);
        });

        /**
         * @listens 'hihelpMe-on-locale-change' and update help text.
         */
        $scope.$on('hihelpMe-on-locale-change', function() {
          $scope.helpText = helpDesk.getHelpForKey($scope.helpKey);
          $scope.showHelpText = helpDesk.isHelpModeOn() && $scope.helpText;
        });

        /**
         * @listens 'hihelpMe-on-db-change' and update help text as per locale.
         * It also hide the help-element if help text in another locale is not present.
         */
        $scope.$on('hihelpMe-on-db-change', function() {
          $scope.helpText = helpDesk.getHelpForKey($scope.helpKey);
          $scope.showHelpText = helpDesk.isHelpModeOn() && $scope.helpText;
        });

        /**
         * @listens 'hihelpMe-on-db-change' rerender help text on help db change.
         */
        $scope.$on('hihelpMe-on-db-update', function(event, data) {
          if (data.key === $scope.helpKey) {
            $scope.helpText = helpDesk.getHelpForKey($scope.helpKey);
            $scope.showHelpText = helpDesk.isHelpModeOn() && $scope.helpText;
          }
        });
      }
    ],
    link: function(scope, element, attrs) {
      if (attrs.hiHelpText === '') {
        return; // do nothing if it doesn't have key
      }

      /**
       * Check if the element on which this directive has been applied is a
       * wrapper element or not.
       *
       * @todo - Check is it a good way to find wrapper element.
       * If this method fails to correctly identify the wrapper element,
       * then this will become a single point of failure.
       *
       * @todo - Better to move this part in utility service, so that this could
       * be overriden if required.
       *
       * @return {boolean} - Return true if the element is a wrapper element.
       */
      var isContainerElement = function() {
        var nonContainerElements = ['input', 'select', 'textarea'],
          tagName = element.prop('tagName').toLowerCase();
        return nonContainerElements.indexOf(tagName) === -1;
      };

      /**
       * Function to add help element in DOM. Here it checks if the current element
       * is wrapper element then it tries to append the help element to it, else
       * if it simply put help element after current element in DOM.
       */
      var addHelpElement = function() {
        var helpElement = scope.getHelpElement(attrs.hiHelpText, attrs.hiHelpTpl);
        if (isContainerElement()) {
          element.append(helpElement);
        } else {
          element.after(helpElement);
        }
      };
      addHelpElement();
    }
  };
});
