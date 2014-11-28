/*global describe,beforeEach,it,inject,chai*/
/*jshint expr:true*/

'use strict';
var expect = chai.expect;

describe('mobile notifications', function () {

  beforeEach(module('koast.mobile.notifications'));

  beforeEach(module(function($provide) {
    // Mock $window
    $provide.service('$window', function() {
      return {
        plugins: {
          pushNotification: {}
        }
      };
    });

    // Mock $cordovaPush
    $provide.service('$cordovaPush', function () {
      var service = {};
      service.register = function () {
        return Q.when("ok");
      };
      service.unregister = function() {
        return Q.when("ok");
      }
      service.setBadgeNumber = function() {
        return Q.when("ok");
      }
      return service;
    });

    // Mock $cordovaDevice
    $provide.service('$cordovaDevice', function () {
      var service = {};
      service.getPlatform = function () {
        return "Android";
      };
      return service;
    });

    // Mock _koastLogger
    $provide.service('_koastLogger', function () {
      var service = {};

      service.info = console.log;
      service.fail = console.log;
      service.success = console.log;

      return service;
    });  

    // Mock $q to avoid digest cycle problems
    $provide.service('$q', function() {
      return Q;
    });
  }));

  it('get an instance of the notifier service', function () {
    inject(function (notifier) {
      expect(notifier).to.not.be.undefined;
    });
  });

});
