// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require swagger/shred.bundle
//= require jquery
//= require swagger/jquery.slideto.min
//= require swagger/jquery.wiggle.min
//= require swagger/jquery.ba-bbq.min
//= require swagger/handlebars-1.0.0
//= require swagger/underscore-min
//= require swagger/backbone-min
//= require swagger/swagger
//= require swagger/swagger-ui
//= require swagger/highlight.7.3.pack
//= require jquery.turbolinks
//= require jquery_ujs
//= require turbolinks
//= require jquery.easing.1.3
//= require bootstrap
//= require prism
//= require jquery-readyselector.js
//= require justgage
//= require raphael.2.1.0.min
//= require json.formatter.js
//= require morris.min
//= require jquery.flexible.stars.js
//= require moment
//= require bootstrap-datetimepicker.min
//= require highcharts
//= require flickerplate.js
//= require jquery-finger-v0.1.0.min.js
//= require modernizr-custom-v2.7.1.min.js
//= require jquery.visible.min.js
//= require jstz-1.0.4.min
//= require socket.io-1.3.5
//= require_tree .

function reset() {
  clearInterval(window.tripthruinterval);
  if(window.socket) {
    window.socket.disconnect();
  }
}

function moveArray(array, old_index, new_index) {
  while (old_index < 0) {
    old_index += array.length;
  }
  while (new_index < 0) {
    new_index += array.length;
  }
  if (new_index >= array.length) {
    var k = new_index - array.length;
    while ((k--) + 1) {
      array.push(undefined);
    }
  }
  array.splice(new_index, 0, array.splice(old_index, 1)[0]);
  return array;
};

Date.prototype.getDayOfYear = function() {
    var onejan = new Date(this.getFullYear(),0,1);
    return Math.ceil((this - onejan) / 86400000);
}

Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(),0,1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
};

function treatAsUTC(date) {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}

function daysBetween(startDate, endDate) {
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
          Math.sin(dLon/2) * Math.sin(dLon/2)
      ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
}

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function sortNumber(a,b) {
  return a - b;
}

function getFrequencyDistribution(values, classes, dataTypeName, prependDataTypeName) {
  values = values.sort(sortNumber);
  var max = values[values.length-1];
  var min = values[0];
  var interval = (max - min) / classes;
  interval = interval > 1 ? Math.ceil(interval) : interval;

  if(max === min) {
    var name = '';
    if(prependDataTypeName) {
      name = '< '+ dataTypeName + max.toFixed(2);
    } else {
      name = '< '+ max.toFixed(2) + ' ' + dataTypeName;
    }
    return {
      name: name,
      value: values.length
    };
  }

  var boundary = min + interval;
  var valuesByClass = [];
  var valueIndex = 0;
  for(var i = 0; i < classes; i++) {
    var valuesInClass = 0;
    var inClass = true;
    while(inClass && valueIndex < values.length) {
      var v = values[valueIndex];
      if(v <= boundary) {
        valuesInClass++;
        valueIndex++;
      } else {
        inClass = false;
      }
    }
    var name = '';
    if(prependDataTypeName) {
      name = '< '+ dataTypeName + boundary.toFixed(2);
    } else {
      name = '< '+ boundary.toFixed(2) + ' ' + dataTypeName;
    }
    valuesByClass.push({
      name: name,
      value: valuesInClass
    });
    boundary += interval;
  }
  return valuesByClass;
}

//
// $('#element').donetyping(callback[, timeout=1000])
// Fires callback when a user has finished typing. This is determined by the time elapsed
// since the last keystroke and timeout parameter or the blur event--whichever comes first.
//   @callback: function to be called when even triggers
//   @timeout:  (default=1000) timeout, in ms, to to wait before triggering event if not
//              caused by blur.
// Requires jQuery 1.7+
//
(function($){
  $.fn.extend({
    donetyping: function(callback,timeout){
      timeout = timeout || 1e3; // 1 second default timeout
      var timeoutReference,
          doneTyping = function(el){
            if (!timeoutReference) return;
            timeoutReference = null;
            callback.call(el);
          };
      return this.each(function(i,el){
        var $el = $(el);
        // Chrome Fix (Use keyup over keypress to detect backspace)
        // thank you @palerdot
        $el.is(':input') && $el.on('keyup keypress',function(e){
          // This catches the backspace button in chrome, but also prevents
          // the event from triggering too premptively. Without this line,
          // using tab/shift+tab will make the focused element fire the callback.
          if (e.type=='keyup' && e.keyCode!=8) return;

          // Check if timeout has been set. If it has, "reset" the clock and
          // start over again.
          if (timeoutReference) clearTimeout(timeoutReference);
          timeoutReference = setTimeout(function(){
            // if we made it here, our timeout has elapsed. Fire the
            // callback
            doneTyping(el);
          }, timeout);
        }).on('blur',function(){
          // If we can, fire the event since we're leaving the field
          doneTyping(el);
        });
      });
    }
  });
})(jQuery);