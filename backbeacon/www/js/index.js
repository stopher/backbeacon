
window.addEventListener('load', function () {
    new FastClick(document.body);
}, false);


// 0.0 0.100
// 100.0 100.100

var pos1 = {"x":0, "y":0, "distance":0};
var pos2= {"x":220, "y":0, "distance":0};
var pos3 = {"x":220, "y":100, "distance":0};

function getTrilateration(position1, position2, position3) {
    var xa = position1.x;
    var ya = position1.y;
    var xb = position2.x;
    var yb = position2.y;
    var xc = position3.x;
    var yc = position3.y;
    var ra = position1.distance;
    var rb = position2.distance;
    var rc = position3.distance;
 
    var S = (Math.pow(xc, 2.) - Math.pow(xb, 2.) + Math.pow(yc, 2.) - Math.pow(yb, 2.) + Math.pow(rb, 2.) - Math.pow(rc, 2.)) / 2.0;
    var T = (Math.pow(xa, 2.) - Math.pow(xb, 2.) + Math.pow(ya, 2.) - Math.pow(yb, 2.) + Math.pow(rb, 2.) - Math.pow(ra, 2.)) / 2.0;
    var y = ((T * (xb - xc)) - (S * (xb - xa))) / (((ya - yb) * (xb - xc)) - ((yc - yb) * (xb - xa)));
    var x = ((y * (ya - yb)) - T) / (xb - xa);
 
    return {
        x: x,
        y: y
    };
}

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

    var list = document.getElementById("messages");
    list.appendChild(e);
    //window.scrollTo(0, window.document.height);
};


//var uuid = 'f7826da6-4fa2-4e98-8024-bc5b71e0893e';
//var identifier = 'Tayq';
//var minor = 50385;
//var major = 63311;
var MONITORING = false;


var beacons = [];

function updateMyPos() {
    console.log("setting pos");
    var MULTIPLIER = 100;
    var pos = getTrilateration(beacons[0].distance*MULTIPLIER, beacons[1].distance*MULTIPLIER, beacons[2].distance*MULTIPLIER);
    $(".marker").css("left", pos.x+"px");
    $(".marker").css("top", pos.y+"px");
}

function updateDistance(index, distance) {
    beacons[index].distance = distance;            
    $(".beacon[data-id='"+beacons[index].identifier+"']").html(distance);
}

function findBeaconIndex(uuid, minor, major, distance) {
    
    for(var y = 0; y < beacons.length; y++) {
        if(uuid === beacons[y].uuid 
            && major === beacons[y].major
            && minor === beacons[y].minor ) {
                return y;
        }
    }
    return -1;
}

function addBeacon(uuid, identifier, minor, major, distance, color, pos) {
    var beac = {
        uuid:uuid,
        identifier:identifier,
        minor:minor,
        major:major,
        distance: distance,
        pos: pos
    };    
    beacons.push(beac);
    var beacElt = $("<div/>");
    beacElt.css("background", color);
    beacElt.addClass("beacon");
    beacElt.attr("data-id", identifier);
    $(".beacons").append(beacElt);
}

function startMonitoringBeacons() {
    if(MONITORING) {
        return false;
    }
    MONITORING = true;    
    logToDom("started monitoring");


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
            //logToDom('[DOM] didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult.beacons[0].UUID));
            logToDom("Length:"+pluginResult.beacons.length+",UUID:"+pluginResult.beacons[0].UUID+",MINOR:"+pluginResult.beacons[0].MINOR+",MAJOR:"+pluginResult.beacons[0].MAJOR+",RSSI:"+pluginResult.beacons[x].ACCURACY+"ACC:"+pluginResult.beacons[x].RSSI);            
            logToDom("Length2:"+pluginResult["beacons"].length);            

            for(var x = 0; x < pluginResult.beacons.length; x++) {

                var index = findBeaconIndex(pluginResult.beacons[x].UUID, pluginResult.beacons[x].MINOR, pluginResult.beacons[x].major);
                if(index >= 0) {
                    updateDistance(index, pluginResult.beacons[x].ACCURACY);
                }
            }
        }
    });


    cordova.plugins.locationManager.setDelegate(delegate);

    for(var x = 0; x < beacons.length; x++) {        
        logToDom("Adding beac:"+x);
        var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(beacons[x].identifier, beacons[x].uuid, beacons[x].major, beacons[x].minor);
        
        cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
            .fail(console.error)
            .done();        
    }

    

    
    //cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
    //    .fail(console.error)
    //   .done();

    //cordova.plugins.locationManager.setDelegate(delegate);

        // required in iOS 8+
        //cordova.plugins.locationManager.requestWhenInUseAuthorization(); 
        // or cordova.plugins.locationManager.requestAlwaysAuthorization()

    setInterval(updateMyPos,2000);

}

function stopMonitoring() {
    if(!MONITORING) {
        return false;
    }
    MONITORING = false;  
    logToDom("stopped monitoring");

    for(var x = 0; x < beacons.length; x++) {        
        var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(beacons[x].identifier, beacons[x].uuid, beacons[x].major, beacons[x].minor);        
        cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion)
        .fail(console.error)
        .done();
    }


/*    var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

    cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion)
        .fail(console.error)
        .done();
*/
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
            logToDom("we are app!");
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

        $("#startbtn").on("click", startMonitoringBeacons);
        $("#stopbtn").on("click", stopMonitoring);

        
        addBeacon('f7826da6-4fa2-4e98-8024-bc5b71e0893e', 'zKz7', 56808, 62981, 0, '#ffbbbb', pos1);
        addBeacon('f7826da6-4fa2-4e98-8024-bc5b71e0893e', 'ck1G', 37022, 48290, 0, '#bbffbb', pos2);
        addBeacon('f7826da6-4fa2-4e98-8024-bc5b71e0893e', 'Tayq', 50385, 63311, 0, '#bbbbff', pos3);


        updateDistance(0, 0);
        updateDistance(2, 0);
        updateDistance(1, 0);

    }
};

