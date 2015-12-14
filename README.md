# ng-user-auth

[![Build Status](https://img.shields.io/travis/puzzle/ng-user-auth.svg)](https://travis-ci.org/puzzle/ng-user-auth)

User authentication and authorization module for AngularJS.

This is work in progress, please be patient. We'll add a HOW TO USE section here as soon as the module is ready to be used.

## Installation

* npm install -g bower
* npm install
* bower install

## Run example/demo page

* npm start

## Configuration

    myApp.config(["ngUserAuthServiceProvider", function(ngUserAuthServiceProvider) {
      ngUserAuthServiceProvider.setApiEndpoint('/authentication');
      ngUserAuthServiceProvider.setUnauthorizedUrl('/unauthorized');
      ngUserAuthServiceProvider.setRequestedPathParameterName('requestedPath');
      ngUserAuthServiceProvider.setAbortRequestsUrlPrefix('/');
    }]);

#### Todo
* document config values
* goToLoginScreen: make configurable, for example hide dialogs
