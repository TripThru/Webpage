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
//= require jquery
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
//= require morris-0.4.1.min.js
//= require jquery.flexible.stars.js
//= require swagger/underscore-min.js
//= require swagger/backbone-min.js
//= require swagger/handlebars-1.0.rc.1.js
//= require swagger/highlight.7.3.pack.js
//= require swagger/swagger.js
//= require swagger/swagger-ui.min.js
//= require bootstrap-datepicker
//= require highcharts
//= require flickerplate.js
//= require jquery-finger-v0.1.0.min.js
//= require modernizr-custom-v2.7.1.min.js
//= require_tree .


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
