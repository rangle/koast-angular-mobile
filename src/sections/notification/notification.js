'use strict';

angular.module('koast.mobile.notifications', ['ngCordova', 'koast.logger'])
.factory('notifier', ['$q', '$window', '$cordovaPush', '$cordovaDevice', '_koastLogger',
  function($q, $window, $cordovaPush, $cordovaDevice, _koastLogger) {
    // TODO: do we need these fields in service or at all?
    var service = {
      isRegistered: false,
      simulateOnWeb: true
    };

    var registeredDeferred = $q.defer();

    var supportedPlatforms = {
      ANDROID: 'android',
      IOS: 'ios'
    };

    // Check whether the current platform matches the argument.

    // Get the lower-case platform name if we're on a supported platform,
    // or 'web-simulation' if that flag is enabled.
    function getDeviceType() {
      var platform = $cordovaDevice.getPlatform().toLowerCase();
      if (platform === supportedPlatforms.ANDROID || 
          platform === supportedPlatforms.IOS) {
        return platform;
      } else if (service.simulateOnWeb) {
        return 'web-simulation';
      }
    }

    // Result contains any success message sent from the plugin call on Android
    function successHandler(result) {
      _koastLogger.info('CORDOVA', 'Device registered successfully ' + result);
    };

    // Result contains any error description text returned from the plugin call
    function errorHandler(error) {
      _koastLogger.fail('CORDOVA', 'Device registration failed ' + error);

      registeredDeferred.reject(error);
    };

    // The iOS and Android push server needs to know the token before it can 
    // push to this device, so we need to keep the token around for later use
    function tokenHandler(token) {
      var result = {
        deviceToken: token,
        deviceType: getPlatform()
      };

      _koastLogger.success('CORDOVA', 'Device token: ' + token);
      _koastLogger.success('CORDOVA', 'result: ' + result);
      service.isRegistered = true;

      registeredDeferred.resolve(result);
    };

    // This function callback gets called on Android upon registration as
    // well as when we receive a message. The plugin requires that this
    // function is attached directly to window. However, since we are
    // defining it inside the service, we have access to the service's scope
    // here. On successful registration "event" will have a "regid"
    // property, which we will need to save to the database to later push
    // notifications to this device.
    $window.onNotificationGCM = function(event) {
      _koastLogger.info('NOTIFIER', 'GCM notification');
      _koastLogger.info('NOTIFIER', JSON.stringify(event));
      if (event.event === 'registered' && event.regid) {
        _koastLogger.info('NOTIFIER', 'Got a GCM registration id: ' + event.regid);
        tokenHandler(event.regid);
      }
    };

    // This function callbacks gets called on iOS upon when we receive a
    // message. The plugin requires that this function is attached directly
    // to window. However, since we are defining it inside the service, we
    // have access to the service's scope here.
    $window.onNotificationAPN = function(event) {
      _koastLogger.info('NOTIFIER', 'APN notification');
      _koastLogger.info('NOTIFIER', JSON.stringify(event));
    };

    /**
     * Return a promise that resolves to the device token once the app is 
     * finished registering for push notifications.
     */
    service.whenRegistered = function() {
      return registeredDeferred.promise;
    }

    /**
     * Register to receive push notifications. The senderID is our project #
     * required to register for Android notifications. This needs to be the same
     * project whose API key we'll be using to push notifications.
     *
     * @param {string} senderID Our project # required to register for Android
     *                          notifications, e.g. "257711697722"
     * @return {promise}        A promise that resolves when the registration
     *                          process completes
     */
    service.register = function(senderID) {
      _koastLogger.info('CORDOVA', 'Registering with push-notification');
      var deviceType = getDeviceType();
      if (deviceType === supportedPlatforms.ANDROID) {
        //TODO: change to $cordovaPush.register(config).then(succ,fail)
        $window.plugins.pushNotification.register(
          successHandler,
          errorHandler, {
            "senderID": senderID,
            "ecb": 'onNotificationGCM'
          });
      } else if (deviceType === supportedPlatforms.IOS) {
        $window.plugins.pushNotification.register(
          tokenHandler,
          errorHandler, {
            "badge": "true",
            "sound": "true",
            "alert": "true",
            "ecb": "onNotificationAPN"
          });
      } else if (service.simulateOnWeb) {
        // Simulating iOS registration
        _koastLogger.info('SIM', 'Simulating IOS push notification registration');
        tokenHandler('simulated-device-id');
      }

      return registeredDeferred.promise;
    };

    return service;
  }
]);
