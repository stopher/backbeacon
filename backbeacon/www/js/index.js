/*
window.addEventListener('load', function () {
    new FastClick(document.body);
}, false);
*/

function isBrowser() {
    var is = false;
    var agent = navigator.userAgent.toLowerCase();
    var path = window.location.href;
    var browser = document.URL.match(/^https?:/);

    if (path.indexOf("file://") > -1) {
        return true;
    } else if (path.indexOf("file:///") > -1) {
        return true;
    } 
    else if(browser) {
        return true;
    } else {
        return false;
    }
}

var logToDom = function (message) {
    var e = document.createElement('li');
    e.innerText = message;

    var list = document.getElementById("beacons");
    list.appendChild(e);
};


var uuid = 'f7826da6-4fa2-4e98-8024-bc5b71e0893e';
var identifier = 'Tayq';
var minor = 50385;
var major = 63311;

function startMonitoringBeacons() {
    
    var delegate = new cordova.plugins.locationManager.Delegate().implement({

        didDetermineStateForRegion: function (pluginResult) {

            logToDom('[DOM] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));

            cordova.plugins.locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: '
                + JSON.stringify(pluginResult));
        },

        didStartMonitoringForRegion: function (pluginResult) {
            console.log('didStartMonitoringForRegion:', pluginResult);

            logToDom('didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
        },

        didRangeBeaconsInRegion: function (pluginResult) {
            logToDom('[DOM] didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
        }

    });


    var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

    cordova.plugins.locationManager.setDelegate(delegate);
    cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
        .fail(console.error)
        .done();
}

function stopMonitoring() {

    var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

    cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion)
        .fail(console.error)
        .done();

}

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        var browser = document.URL.match(/^https?:/);
        console.log("we are initializing")
        if(isBrowser()) {            
            console.log("we are browser")
            this.receivedEvent('deviceready');
        }
        else {
            console.log("we are not browser.")
            this.bindEvents();
        }
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        console.log("deviceready!")
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log("receivedEvent:"+id)
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
