# angular-help-me [![Build Status](https://travis-ci.org/marshal003/angular-help-me.svg?branch=master)](https://travis-ci.org/marshal003/angular-help-me)

I have discussed the philosophy of this component in [this blog](http://codepen.io/marshal003/post/angular-helpme-component).

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.githubusercontent.com/marshal003/angular-help-me/master/dist/angular-help-me.min.js
[max]: https://raw.githubusercontent.com/marshal003/angular-help-me/master/dist/angular-help-me.js

In your web page:

```html
<script src="angular.js"></script>
<script src="dist/angular-help-me.min.js"></script>
```

### Install Using Bower

```js
bower install angular-help-me

OR from github as

bower install marshal003/git@github.com:marshal003/angular-help-me.git
```

## Steps to use it

1. Install component by following one of the above mentioned step.
2. Inject **hiComponents.helpMe** module as dependency in your angular app. eg.
   ```js
   angular.module('myApp', ['hiComponents.helpMe'])
   ```
3. Define your help text database. You can define this in multiple ways. Here are my preferred ways.

    3.1. **Using Value Provider** : If I have to define my help texts in front end, then I will use Angular's value provider way.
    eg.
    ```js
    angular.module('myApp').value('myHelpDB', {
        'whatIsSSN': 'SSN is your social security number .....',
        'whatIsAreacode': 'Area Code is unique identity number ....'
    })
    ```
    3.2. **Loading from backend**: If I have to define my help texts in backend and I want to load them using http module then will write my service as -
    ```js
    angular.module('myApp').service('loadHelpTextService', ['$http', function($http){
      return {
        get: function(){
          return $http.get("/api/v1/help-texts");
        }
      };
    }]);
    ```

4. Extend HelpMe component by using angular's decorator service.

    4.1. If you have followed **3.1** step to set up help text database then use decorator to decorate **hiHelpDB**.
    eg.
    ```js
    angular.module('myApp').config(function($provide){
      $provide.decorator('hiHelpDB',
      ['$delegate',  'myHelpDB', function($delegate, myHelpDB){
          return myHelpDB;
      }]);
    }
    ```

    4.2 If you have followed **3.2** step to setup help text database then use decorator to decorate **hiHelpDBService**.
    eg.
    ```js
    angular.module('myApp').config(function($provide){
      $provide.decorator('hiHelpDBService',
      ['$delegate',  'loadHelpTextService', function($delegate, myHelpDB){
          return loadHelpTextService;
      }]);
    }
    ```

    **NOTE**: In realty we are monkey patching the default **hiHelpDB** or **hiHelpDBService** of angular-help-me component. But I found this as the best way to create a reusable component

5. Now you are ready to use it, just use **hi-help-text** directive as attribute on html element by specifying for what key you want to render help text. as `hi-help-text="whatIsAreaCode"`
eg.
```html
<div class="form-group" hi-help-text="whatIsAreaCode">
  <label class="control-label" >Area Code</label>
  <input type="text" class="form-control" placeholder="Enter Area Code" />
</div>
```

### Few Important Tips:

**Default Template**: By default help texts will be rendered using default template, which is
```html
<span class="help-block" ng-show="showHelpText" ng-bind="helpText"></span>
```
here help `help-block` is css class defined in bootstrap, if you are not using bootstrap then please define a css property as -
```css
.help-block {
    display: block;
    margin-top: 5px;
    margin-bottom: 10px;
    color: #737373;
}
```
**Custom Help Template**: If you want to render help texts using some custom template then you can do in two ways :

  - **Override default template**: Help component put default component in angular's $templateCache, but before doing this, it checks if there is any component defined with default key(**helpMe.directiveHTML**). So, we can easily override the default component by defining our own template with same key.
  
    ```html
      <script type="text/ng-template" id="helpMe.directiveHTML">
        <span class="glyphicon glyphicon-question-sign" ng-show="showHelpText">
          <i data-ng-bind="helpText"></i>
        </span>
      </script>
    ```
  - **Defining New Template**: You can also define one or more new help templates and in html you can specify which template should be used to render help text using **hi-help-tpl**.

    Please note that **hi-help-tpl** is not a directive, its just a html property and hence should be specified on same html element on which you have specified the **hi-help-text** directive.
    eg.
    ```html
    <div class="form-group">
      <label class="control-label">Area Code</label>
      <a hi-help-text="whatIsAreaCode" hi-help-tpl="tooltip"></a>
      <input type="text" class="form-control" placeholder="Enter Area Code" />
    </div>

    <!-- In this way you can define one or more template -->
    <script type="text/ng-template" id="tooltip">
      <span class="glyphicon glyphicon-question-sign"
            ng-show="showHelpText">
        <i data-ng-bind="helpText"></i>
      </span>
    </script>
    ```
**Using helpDesk**: Help Desk is the central controlling service of helpMe component, it provide multiple APIs that can be used to enhance and control the helpMe component. So, you can include this service as dependency in your controller and play with some its APIs.

eg. Few APIs are
 - **addHelpText**: To add new help text in database after initialization.

 - **setLocale**: To set the current locale. If you have help texts  in  multiple locales, then you can use it to set the current locale.

 - **setHelpMode**: To turn display of all help texts on or off. It accepts a (true / false). True to show help text and false to hide.

 Please look at source code for more details.

## Examples
1. [Simple one, without locale and with default template ](http://codepen.io/marshal003/pen/JYLEjg)

2. [Example with two locales and custom template](http://codepen.io/marshal003/pen/vNRBqG)

3. [Example with remote help text load](http://codepen.io/marshal003/pen/xwWggx)

4. [Example to render help text as tooltip](http://codepen.io/marshal003/full/eZwBgw/) 
