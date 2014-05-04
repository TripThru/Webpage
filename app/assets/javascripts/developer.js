/*
# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

###
class ActiveTripsChart
  chart = null
  activeTripsCount = []

  constructor: () ->
    chart = `new Highcharts.Chart({
                    chart: {
                        renderTo: 'activeTripsChart',
                        type: 'gauge',
                        plotBackgroundColor: null,
                        plotBackgroundImage: null,
                        plotBorderWidth: 0,
                        plotShadow: false,
                        style: {
                            fontFamily: 'Open Sans, sans-serif',
                            color: "#727272"
                        }
                    },
                    exporting: { enabled: false },
                    title: {
                        text: '',
                        style: {
                            fontFamily: 'Open Sans, sans-serif',
                            color: "#727272"
                        }
                    },
                    pane: {
                        startAngle: -150,
                        endAngle: 150,
                        background: [{
                            backgroundColor: {
                                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                                stops: [
                                    [0, '#FFF'],
                                    [1, '#333']
                                ]
                            },
                            borderWidth: 0,
                            outerRadius: '109%'
                        }, {
                            backgroundColor: {
                                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                                stops: [
                                    [0, '#333'],
                                    [1, '#FFF']
                                ]
                            },
                            borderWidth: 1,
                            outerRadius: '107%'
                        }, {
                            // default background
                        }, {
                            backgroundColor: '#DDD',
                            borderWidth: 0,
                            outerRadius: '105%',
                            innerRadius: '103%'
                        }]
                    },

                    // the value axis
                    yAxis: {
                        min: 0,
                        max: 10,

                        minorTickInterval: 'auto',
                        minorTickWidth: 0,
                        minorTickLength: 10,
                        minorTickPosition: 'inside',
                        minorTickColor: '#FFF',

                        tickPixelInterval: 30,
                        tickWidth: 0,
                        tickPosition: 'inside',
                        tickLength: 10,
                        tickColor: '#FFF',
                        labels: {
                            step: 2,
                            rotation: 'auto'
                        },
                        title: {
                            text: 'Trips'
                        },
                        plotBands: [{
                            from: 0,
                            to: 30,
                            color: '#55BF3B'
                        }]
                    },

                    series: [
                        {
                            name: "All trips",
                            data: [0],
                            dial: {
                                radius: "50%",
                                rearLength: "0%"
                            }
                        }, {
                            name: "Selected status",
                            data: [0],
                            dial: {
                                radius: "90%",
                                rearLength: "0%"
                            },
                            dataLabels: {
                                enabled: false
                            }
                        }
                    ]

                });`



class TripStats
  chart = null

  constructor: () ->
    chart = `new Highcharts.Chart({
                    chart: {
                        renderTo: 'stats',
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false
                    },
                    exporting: { enabled: false },
                    title: {
                        text: '',
                        style: {
                            fontFamily: 'Open Sans, sans-serif',
                            color: "#727272"
                        }
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.y}</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false
                            },
                            showInLegend: true
                        }
                    },
                    labels: {
                        items: [{
                            html: 'Last hour',
                            style: {
                                left: '65',
                                top: '15',
                                color: "#727272"
                            }
                        },
                        {
                            html: 'Last 24 hours',
                            style: {
                                left: '55',
                                top: '150',
                                color: "#727272"
                            }
                        },
                        {
                            html: 'All time',
                            style: {
                                left: '70',
                                top: '285',
                                color: "#727272"
                            }
                        }
                        ]
                    },
                    series: [{
                        center: ['50%', '15%'],
                        size: '40%',
                        showInLegend: true,
                        type: 'pie',
                        name: 'Count',
                        data: [
                            {
                                name: 'Completed',
                                y: 0,
                                sliced: true,
                                selected: true,
                                color: '#75C944'
                            },
                            {
                                name: 'Rejections',
                                y: 0,
                                color: '#282963'
                            },
                            {
                                name: 'Cancellations',
                                y: 0,
                                color: '#FFED26'
                            },
                            {
                                name: 'Exceptions',
                                y: 0,
                                color: '#E35D5D'
                            }
                        ]
                    }, {
                        center: ['50%', '50%'],
                        size: '40%',
                        showInLegend: false,
                        type: 'pie',
                        name: 'Count',
                        data: [
                            {
                                name: 'Completed',
                                y: 0,
                                sliced: true,
                                selected: true,
                                color: '#75C944'
                            },
                            {
                                name: 'Rejections',
                                y: 0,
                                color: '#282963'
                            },
                            {
                                name: 'Cancellations',
                                y: 0,
                                color: '#FFED26'
                            },
                            {
                                name: 'Exceptions',
                                y: 0,
                                color: '#E35D5D'
                            }
                        ]
                    },
                    {
                        center: ['50%', '85%'],
                        size: '40%',
                        showInLegend: false,
                        type: 'pie',
                        name: 'Count',
                        data: [
                            {
                                name: 'Completed',
                                y: 0,
                                sliced: true,
                                selected: true,
                                color: '#75C944'
                            },
                            {
                                name: 'Rejections',
                                y: 0,
                                color: '#282963'
                            },
                            {
                                name: 'Cancellations',
                                y: 0,
                                color: '#FFED26'
                            },
                            {
                                name: 'Exceptions',
                                y: 0,
                                color: '#E35D5D'
                            }
                        ]
                    }
                    ]
                }, function (chart) {
                    $(chart.series[0].data).each(function (i, e) {
                        e.legendItem.on('click', function (event) {
                            var legendItem = e.name;

                            event.stopPropagation();

                            $(chart.series).each(function (j, f) {
                                $(this.data).each(function (k, z) {
                                    if (z.name == legendItem) {
                                        if (z.visible) {
                                            z.setVisible(false);
                                        }
                                        else {
                                            z.setVisible(true);
                                        }
                                    }
                                });
                            });

                        });
                    });
                });`

class Counters
  counters = {
    requestsLastHour: 0
    requestsLast24Hrs: 0
    requestsAllTime: 0
    distanceLastHour: 0
    distanceLast24Hrs: 0
    distanceAllTime: 0
    fareLastHour: 0
    fareLast24Hrs: 0
    fareAllTime: 0
  }

  constructor: () ->
    counterImagePath = '/assets/flipCounter-medium.png'
    $("#requestsLastHour").flipCounter({ imagePath: counterImagePath, digitHeight: 20, digitWidth: 15, number: 0 });
    $("#requestsLast24Hrs").flipCounter({ imagePath: counterImagePath, digitHeight: 20, digitWidth: 15, number: 0 });
    $("#requestsAllTime").flipCounter({ imagePath: counterImagePath, digitHeight: 20, digitWidth: 15, number: 0 });
    $("#distanceLastHour").flipCounter({ imagePath: counterImagePath, digitHeight: 20, digitWidth: 15, number: 0 });
    $("#distanceLast24Hrs").flipCounter({ imagePath: counterImagePath, digitHeight: 20, digitWidth: 15, number: 0 });
    $("#distanceAllTime").flipCounter({ imagePath: counterImagePath, digitHeight: 20, digitWidth: 15, number: 0 });
    $("#fareLastHour").flipCounter({ imagePath: counterImagePath, digitHeight: 20, digitWidth: 15, number: 0 });
    $("#fareLast24Hrs").flipCounter({ imagePath: counterImagePath, digitHeight: 20, digitWidth: 15, number: 0 });
    $("#fareAllTime").flipCounter({ imagePath: counterImagePath, digitHeight: 20, digitWidth: 15, number: 0 });



$(document).ready ->
  baseUrl = 'http://app.sandbox.tripthru.com/';

###
*/

$(document).ready(function () {
    var baseUrl = 'http://54.201.134.194/TripThru.TripThruGateway/';
    var accessToken = $('#access_token').val();
    var stats = null;
    var activeTripsChart = null;
    var activeTripsCount = [];
    var activeTrips = [];
    var tripsInfo = [];
    var activeTripsInfo = {};
    var selectedStatus = $("#triplog_selector option:selected").val();
    var currentTripLogs = [];
    var counters = {
        requestsLastHour: 0,
        requestsLast24Hrs: 0,
        requestsAllTime: 0,
        distanceLastHour: 0,
        distanceLast24Hrs: 0,
        distanceAllTime: 0,
        fareLastHour: 0,
        fareLast24Hrs: 0,
        fareAllTime: 0
    };

    $.ajaxSetup({
        // Disable caching of AJAX responses
        cache: false
    });
    $("#requestsLastHour").flipCounter({ imagePath: "/assets/flipCounter-medium.png", digitHeight: 20, digitWidth: 15, number: 0 });
    $("#requestsLast24Hrs").flipCounter({ imagePath: "/assets/flipCounter-medium.png", digitHeight: 20, digitWidth: 15, number: 0 });
    $("#requestsAllTime").flipCounter({ imagePath: "/assets/flipCounter-medium.png", digitHeight: 20, digitWidth: 15, number: 0 });
    $("#distanceLastHour").flipCounter({ imagePath: "/assets/flipCounter-medium.png", digitHeight: 20, digitWidth: 15, number: 0 });
    $("#distanceLast24Hrs").flipCounter({ imagePath: "/assets/flipCounter-medium.png", digitHeight: 20, digitWidth: 15, number: 0 });
    $("#distanceAllTime").flipCounter({ imagePath: "/assets/flipCounter-medium.png", digitHeight: 20, digitWidth: 15, number: 0 });
    $("#fareLastHour").flipCounter({ imagePath: "/assets/flipCounter-medium.png", digitHeight: 20, digitWidth: 15, number: 0 });
    $("#fareLast24Hrs").flipCounter({ imagePath: "/assets/flipCounter-medium.png", digitHeight: 20, digitWidth: 15, number: 0 });
    $("#fareAllTime").flipCounter({ imagePath: "/assets/flipCounter-medium.png", digitHeight: 20, digitWidth: 15, number: 0 });

    var updatedTripAudio = document.createElement('audio');
    updatedTripAudio.setAttribute('src', 'http://soundfxnow.com/soundfx/quick-blip.mp3');

    function getContainerTripId(tripId) {
        return tripId.replace(new RegExp("@", 'g'), "").replace(".", "");
    }

    $("#triplog_selector").change(function () {
        selectedStatus = $("#triplog_selector option:selected").val();
        updateTrips();
    });

    var updatingTrips = false;

    function updateTrips() {
        if (!updatingTrips) {
            updatingTrips = true;
            if (activeTrips.length == 0) {
                $("#noTrips").fadeOut();
                $("#loadingTripsContainer").fadeIn();
            }
            $.get(baseUrl + 'trips?format=json&access_token=' + accessToken, function (data) {
                if (data.result == "OK") {
                    var trips = [];
                    var selectedStatusCount = 0;
                    if (selectedStatus != 'All') {
                        data.trips.forEach(function (trip) {
                            if (trip.status == selectedStatus) {
                                selectedStatusCount++;
                                trips.push(trip);
                            }
                        });
                    } else {
                        selectedStatusCount = data.trips.length;
                        trips = data.trips;
                    }
                    if (activeTripsChart != null) {
                        activeTripsCount.push(selectedStatusCount);
                        var max = Math.max.apply(Math, activeTripsCount);
                        max = (max < 10) ? 10 : max * 1.4;
                        activeTripsChart.yAxis[0].setExtremes(0, max);
                        activeTripsChart.series[0].points[0].update(data.trips.length);
                        activeTripsChart.series[1].points[0].update(selectedStatusCount);
                    }
                    updateSelectedStatusTrips(trips);

                }

                if (activeTrips.length > 0) {
                    $("#loadingTripsContainer").fadeOut();
                    $("#noTrips").fadeOut();
                } else {
                    $("#loadingTripsContainer").fadeOut();
                    $("#noTrips").fadeIn();
                }
                updatingTrips = false;
            }, "JSON").error(function (xhr, status, error) {
                if (activeTrips.length > 0) {
                    $("#loadingTripsContainer").fadeOut();
                    $("#noTrips").fadeOut();
                } else {
                    $("#loadingTripsContainer").fadeOut();
                    $("#noTrips").fadeIn();
                }
                updatingTrips = false;
            });


        }
    }

    function updateSelectedStatusTrips(trips) {
        var dataTrips = [];
        trips.forEach(function (trip) {
            dataTrips.push(trip.id);
            if ($.inArray(trip.id, activeTrips) == -1) {
                activeTrips.push(trip.id);
                activeTripsInfo[trip.id] = trip;
                var tripContainerId = getContainerTripId(trip.id);
                var pickupAddress = activeTripsInfo[trip.id].pickupLocation.address ? activeTripsInfo[trip.id].pickupLocation.address : getAddress(trip.pickupLocation.lat, trip.pickupLocation.lng);
                ;
                $("#triplog_trips").prepend("<div style='display:none;' class='trip' id='" + tripContainerId + "'>" +
                        "<h2>" + trip.id + "</h2>" +
                        "<p><span style='font-weight: bold;'>Passenger: </span><span id='passengerName" + tripContainerId + "'>" + trip.passengerName + "</span></p>" +
                        "<p><span style='font-weight: bold;'>Time: </span><span id='pickupTime" + tripContainerId + "'>" + trip.pickupTime.split(".")[0] + "</span></p>" +
                        "<p><span style='font-weight: bold;'>Pickup: </span><span id='pickupLocation" + tripContainerId + "'>" + pickupAddress + "</span></p>" +
                        "<input type='hidden' id='tripId' name='tripId' value='" + trip.id + "' />" +
                        "</div>"
                );
                $("#" + tripContainerId).slideDown();
                $('#triplog_trips').off('click', "#" + tripContainerId).on('click', "#" + tripContainerId, function () {

                    if (directionsDisplay != null) {
                        directionsDisplay.setMap(null);
                        directionsDisplay = null;
                    }
                    if (directionsDisplay2 != null) {
                        directionsDisplay2.setMap(null);
                        directionsDisplay2 = null;
                    }
                    driverPreviousLocation = null;

                    if (!$("#" + tripContainerId).hasClass("activeTrip")) {
                        $("#triplog_trips>div.activeTrip").removeClass("activeTrip");
                        $("#" + tripContainerId).addClass("activeTrip");
                        setTripInfo(activeTripsInfo[trip.id]);
                        updateSelectedTrip();
                        clearLogs();
                    } else {
                        $("#" + tripContainerId).removeClass("activeTrip");
                        clearTripInfo();
                        clearLogs();
                    }

                });


            }
        });
        activeTrips.forEach(function (trip) {
            if ($.inArray(trip, dataTrips) == -1) {
                activeTrips = $.grep(activeTrips, function (value) {
                    return value != trip;
                });
                var tripId = $(".activeTrip").find("#tripId").val();
                if (trip != tripId) {
                    $("#" + getContainerTripId(trip)).slideUp().remove();
                }
            }
        });
    }

    var updatingSelectedTrip = false;
    var updatingTripId = "";

    function updateSelectedTrip() {
        var tripId = $(".activeTrip").find("#tripId").val();
        if (tripId && (!updatingSelectedTrip || tripId != updatingTripId)) {
            updatedTripAudio.pause();
            updatingSelectedTrip = true;
            updatingTripId = tripId;
            if (tripId) {
                var tripContainerId = getContainerTripId(tripId);
                $("#updatingTripContainer").fadeIn();

                if (activeTripsInfo[tripId] != null) {
                    setTripInfo(activeTripsInfo[tripId]);
                }

                $.get(baseUrl + 'tripstatus' + "?format=json&access_token=" + accessToken + "&tripid=" + tripId, function (data) {
                    if (data.result == "OK") {

                        if (activeTripsInfo[tripId].driverLocation == null) {
                            activeTripsInfo[tripId].driverLocation = data.driverLocation;
                        }

                        if (activeTripsInfo[tripId].pickupLocation.address == null) {
                            activeTripsInfo[tripId].pickupLocation.address = getAddress(data.pickupLocation.lat, data.pickupLocation.lng);
                        }
                        if (activeTripsInfo[tripId].dropoffLocation.address == null) {
                            activeTripsInfo[tripId].dropoffLocation.address = getAddress(data.dropoffLocation.lat, data.dropoffLocation.lng);
                        }

                        if (activeTripsInfo[tripId].driverLocation != null) {
                            if (activeTripsInfo[tripId].driverLocation.address == null || activeTripsInfo[tripId].driverLocation.lat != data.driverLocation.lat || activeTripsInfo[tripId].driverLocation.lng != data.driverLocation.lng) {
                                data.driverLocation.address = getAddress(data.driverLocation.lat, data.driverLocation.lng);
                            }
                        }

                        if (data.status != activeTripsInfo[tripId].status) {
                            updatedTripAudio.play();
                        }

                        activeTripsInfo[tripId].fleetId = data.fleetId;
                        activeTripsInfo[tripId].fleetName = data.fleetName;
                        activeTripsInfo[tripId].driverId = data.driverId;
                        activeTripsInfo[tripId].driverName = data.driverName;
                        activeTripsInfo[tripId].driverLocation = data.driverLocation;
                        activeTripsInfo[tripId].driverInitialLocation = data.driverInitialLocation;

                        activeTripsInfo[tripId].status = data.status;
                        activeTripsInfo[tripId].price = data.price;
                        activeTripsInfo[tripId].distance = data.distance;
                        activeTripsInfo[tripId].eta = data.eta;

                        if (data.status === "Completed") {
                            activeTrips = $.grep(activeTrips, function (value) {
                                if (value != tripId) {
                                    console.log("TripId: " + tripId);
                                    console.log("trip: " + trip);
                                    $("#selectedTripStatus").hide().html('Completed').fadeIn();
                                    return true;
                                }
                                return false;
                            });
                        }

                        setTripInfo(activeTripsInfo[tripId]);
                        updateTripLog();
                    }
                    updatingSelectedTrip = false;
                    $("#updatingTripContainer").fadeOut();
                },  "json" ).error(function () {
                    updatingSelectedTrip = false;
                    $("#updatingTripContainer").fadeOut();
                });
            } else {
                updatingSelectedTrip = false;
            }
        }
    }


    var passengerMarker = null;
    var destinationMarker = null;
    var driverMarker = null;
    var initialMarker = null;
    var map = null;
    var mapOptions = null;
    var directionsDisplay = null;
    var directionsDisplay2 = null;
    var driverPreviousLocation = null;
    var setTripInfoBool = false;
    $(".tracking-map").text("Select a trip");

    function setTripInfo(trip) {
        if (setTripInfoBool == true) {
            return;
        }
        setTripInfoBool = true;
        var tripId = $(".activeTrip").find("#tripId").val();
        if (trip.id == tripId) {

            if (driverPreviousLocation == null || trip.driverLocation.lat != driverPreviousLocation.lat || trip.driverLocation.lng != driverPreviousLocation.lng) {

                driverPreviousLocation = trip.driverLocation;

                var tripId = $(".activeTrip").find("#tripId").val();
                var passengerName = trip.passengerName ? trip.passengerName : 'Not available';
                var pickupTime = trip.pickupTime ? trip.pickupTime.split(".")[0] : 'Passenger waiting';
                var status = trip.status ? trip.status : 'Not available';
                var eta = trip.eta ? trip.eta.split(".")[0] : 'Not available';
                var fare = trip.price ? Math.round(trip.price).toFixed(2) : 'Not available';
                var driverName = trip.driverName ? trip.driverName : 'Not available';

                var pickupLocationName = trip.pickupLocation ? trip.pickupLocation.address : 'Not available';
                var dropoffLocationName = trip.dropoffLocation ? trip.dropoffLocation.address : 'Not available';
                var driverLocationName = trip.driverLocation ? trip.driverLocation.address : "Not available";


                var originatingPartnerName = trip.originatingPartnerName ? trip.originatingPartnerName : 'Not available';
                var servicingPartnerName = trip.servicingPartnerName ? trip.servicingPartnerName : 'Not available';

                $("#selectedTripID").hide().html(tripId).fadeIn();
                $("#selectedTripPassengerName").hide().html(passengerName).fadeIn();
                $("#selectedTripPickupTime").hide().html(pickupTime).fadeIn();
                $("#selectedTripPickupLocation").hide().html(pickupLocationName).fadeIn();
                $("#selectedTripStatus").hide().html(status).fadeIn();
                $("#selectedTripETA").hide().html(eta).fadeIn();
                $("#selectedTripFare").hide().html(fare).fadeIn();
                $("#selectedTripDropoffLocation").hide().html(dropoffLocationName).fadeIn();
                $("#selectedTripDriverName").hide().html(driverName).fadeIn();
                $("#selectedTripDriverLocation").hide().html(driverLocationName).fadeIn();
                $("#selectedTripOriginatingPartner").hide().html(originatingPartnerName).fadeIn();
                $("#selectedTripServicingPartner").hide().html(servicingPartnerName).fadeIn();


                var pickupLocation = trip.pickupLocation;
                var driverLocation = trip.driverLocation;
                var dropoffLocation = trip.dropoffLocation;
                var driverInitialLocation = trip.driverInitialLocation;

                if (pickupLocation || driverLocation) {
                    var passengerLocation = null;
                    var driverCurrentLocation = null;
                    var destinationLocation = null;
                    var initialLocation = null;

                    if (dropoffLocation) {
                        destinationLocation = new google.maps.LatLng(dropoffLocation.lat, dropoffLocation.lng);
                        if (destinationMarker != null) {
                            destinationMarker.setMap(map);
                            destinationMarker.setPosition(destinationLocation);
                        }
                    }

                    if (pickupLocation) {
                        passengerLocation = new google.maps.LatLng(pickupLocation.lat, pickupLocation.lng);
                        if (passengerMarker != null) {
                            passengerMarker.setMap(map);
                            passengerMarker.setPosition(passengerLocation);
                        }
                    }

                    if (driverLocation) {
                        driverCurrentLocation = new google.maps.LatLng(driverLocation.lat, driverLocation.lng);
                        if (driverMarker != null) {
                            driverMarker.setMap(map);
                            driverMarker.setPosition(driverCurrentLocation);
                        }
                    }
                    if (driverInitialLocation) {
                        initialLocation = new google.maps.LatLng(driverInitialLocation.lat, driverInitialLocation.lng);
                        if (initialMarker != null) {
                            initialMarker.setMap(map);
                            initialMarker.setPosition(driverInitialLocation);
                        }
                    }

                    if (map == null) {
                        mapOptions = {
                            center: driverCurrentLocation != null ? driverCurrentLocation : passengerLocation,
                            zoom: 15,
                            mapTypeControl: false,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };
                        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
                    }

                    if (passengerLocation != null && passengerMarker == null) {
                        passengerMarker = new google.maps.Marker({
                            position: passengerLocation,
                            map: map,
                            icon: "http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=home|FFFF00",
                            title: 'Pickup'
                        });
                    }
                    if (initialLocation != null && initialMarker == null) {
                        initialMarker = new google.maps.Marker({
                            position: driverInitialLocation,
                            map: map,
                            icon: "http://www.mricons.com/store/png/113267_25418_16_flag_icon.png",
                            title: 'Initial'
                        });
                    }

                    if (driverLocation != null && driverMarker == null) {
                        driverMarker = new google.maps.Marker({
                            position: driverCurrentLocation,
                            map: map,
                            icon: "http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=taxi|FFFF00",
                            title: 'Driver'
                        });
                    }
                    if (destinationLocation != null && destinationMarker == null) {
                        destinationMarker = new google.maps.Marker({
                            position: dropoffLocation,
                            map: map,
                            icon: "http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=cafe|FFFF00",
                            title: 'Destination'
                        });
                    }


                    if (driverLocation != null && pickupLocation != null && dropoffLocation != null) {

                        var routes = [];
                        switch (trip.status) {
                            case "Enroute":
                                routes = [
                                    { origin: initialLocation, destination: driverCurrentLocation }
                                ];
                                break;
                            case "PickedUp":
                                routes = [
                                    { origin: initialLocation, destination: passengerLocation },
                                    { origin: passengerLocation, destination: driverCurrentLocation }
                                ];
                                break;
                            case "Complete":
                                routes = [
                                    { origin: initialLocation, destination: passengerLocation },
                                    { origin: passengerLocation, destination: destinationLocation }
                                ];
                                break;
                        }

                        var rendererOptions = {
                            preserveViewport: true,
                            suppressMarkers: true,
                            polylineOptions: {
                                strokeColor: "#8B0000",
                                strokeOpacity: 0.8,
                                strokeWeight: 5
                            }
                        };

                        var rendererOptions2 = {
                            preserveViewport: true,
                            suppressMarkers: true,
                            polylineOptions: {
                                strokeColor: "#008000",
                                strokeOpacity: 0.8,
                                strokeWeight: 5
                            }
                        };
                        var directionsService = new google.maps.DirectionsService();
                        var directionsService2 = new google.maps.DirectionsService();

                        var boleanFirst = true;

                        if (directionsDisplay != null) {
                            directionsDisplay.setMap(null);
                            directionsDisplay = null;
                        }
                        if (directionsDisplay2 != null) {
                            directionsDisplay2.setMap(null);
                            directionsDisplay2 = null;
                        }

                        routes.forEach(function (route) {
                            var request = {
                                origin: route.origin,
                                destination: route.destination,
                                travelMode: google.maps.TravelMode.DRIVING
                            };

                            if (boleanFirst) {
                                directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
                                directionsDisplay.setMap(map);
                            }
                            else {
                                directionsDisplay2 = new google.maps.DirectionsRenderer(rendererOptions2);
                                directionsDisplay2.setMap(map);
                            }

                            if (boleanFirst) {
                                directionsService.route(request, function (result, status) {
                                    if (status == google.maps.DirectionsStatus.OK && directionsDisplay != null) {
                                        directionsDisplay.setDirections(result);
                                    }
                                });
                                boleanFirst = false;
                            } else {
                                directionsService2.route(request, function (result, status) {
                                    if (status == google.maps.DirectionsStatus.OK && directionsDisplay2 != null) {
                                        directionsDisplay2.setDirections(result);
                                    }
                                });
                            }
                        });
                    }
                    map.setCenter(driverCurrentLocation != null ? driverCurrentLocation : passengerLocation);
                }
            }
        }
        setTripInfoBool = false;
    }

    function clearTripInfo() {
        $("#selectedTripID").hide().html('').fadeIn();
        $("#selectedTripPassengerName").hide().html('').fadeIn();
        $("#selectedTripPickupTime").hide().html('').fadeIn();
        $("#selectedTripPickupLocation").hide().html('').fadeIn();
        $("#selectedTripStatus").hide().html('').fadeIn();
        $("#selectedTripETA").hide().html('').fadeIn();
        $("#selectedTripFare").hide().html('').fadeIn();
        $("#selectedTripDropoffLocation").hide().html('').fadeIn();
        $("#selectedTripDriverName").hide().html('').fadeIn();
        $("#selectedTripDriverLocation").hide().html('').fadeIn();
        $("#selectedTripOriginatingPartner").hide().html('').fadeIn();
        $("#selectedTripServicingPartner").hide().html('').fadeIn();

        if (passengerMarker != null) {
            passengerMarker.setMap(null);
        }
        if (driverMarker != null) {
            driverMarker.setMap(null);
        }
        if (destinationMarker != null) {
            destinationMarker.setMap(null);
        }
        if (initialMarker != null) {
            initialMarker.setMap(null);
        }

        driverPreviousLocation = null;

    }

    function clearLogs() {
        currentTripLogs = [];
        $("#triplogs_logs").html('');
    }

    var updatingTripLog = false;
    var updatingTripLogId = "";

    function updateTripLog() {
        var tripId = $(".activeTrip").find("#tripId").val();
        if (!tripId) tripId = 'All';
        if (!updatingTripLog) {
            updatingTripLog = true;
            updatingTripLogId = tripId;
            tripId = tripId == 'All' ? '' : '&tripid=' + tripId;
            $.get(baseUrl + 'log?format=json&access_token=' + accessToken + tripId, function (data) {
                if (data.result == "OK") {
                    var logs = [];
                    var initLog = false;

                    //filter only new logs
                    if (currentTripLogs.length > 0) {
                        var last = currentTripLogs[currentTripLogs.length - 1].time;
                        for (j = 0; j < data.logList.length; j++) {
                            var log = data.logList[j];
                            if (Date.parse(log.time) > Date.parse(last)) {
                                logs.push(log);
                                currentTripLogs.push(log);
                            }
                        }
                    } else {
                        initLog = true;
                        logs = data.logList;
                        currentTripLogs = data.logList;
                        $("#triplogs_logs").html('');
                    }

                    if (logs.length > 0) {
                        var logString = '';
                        if (initLog) {
                            logString = '<ul class="request_list tree">';
                        }
                        for (j = logs.length - 1; j >= 0; j--) {
                            var log = logs[j];
                            if (log.messages.length > 0) {
                                logString += '<li class="request_block"> <span class="handle collapsed"></span>';
                                logString += log.time + " | " + log.messages[0].text;
                                logString += '<ul style="display: none;">';
                                if (log.request) {
                                    logString += '<li><span class="handle collapsed"></span> Request <ul style="display: none;"><li><pre><code class="language-javascript">' + FormatJSON(JSON.parse(log.request)) + '</code></pre></li></ul></li>';
                                }
                                if (log.messages.length > 1) {
                                    for (i = 1; i < log.messages.length; i++) {
                                        var padding = log.messages[i].indent > 0 ? "padding-left:" + log.messages[i].indent + "px;" : "";
                                        logString += '<li style="' + padding + '">';

                                        if (log.messages[i].json) {
                                            logString += '<span class="handle collapsed"></span>';
                                        }

                                        logString += '<p>' + log.messages[i].text + '</p>';

                                        if (log.messages[i].json) {
                                            var hasResponse = ((i + 1) < (log.messages.length - 1)) && log.messages[i + 1].text.indexOf('Response') != -1 && log.messages[(i + 1)].json;
                                            var title = hasResponse ? 'Request: \n' : '';
                                            logString += '<ul style="display: none;"><li><pre><code class="language-javascript">' + title + FormatJSON(JSON.parse(log.messages[i].json));
                                            if (hasResponse) {
                                                i++;
                                                logString += '\n\nResponse: \n' + FormatJSON(JSON.parse(log.messages[i].json));
                                            }
                                            logString += '</code></pre></li></ul>';
                                        }
                                        logString += '</li>';
                                    }
                                }
                                logString += '</ul></li>';
                            }
                        }
                        if (initLog) {
                            logString += '</ul>';
                            $("#triplogs_logs").append(logString);
                        } else {
                            $('.request_list').prepend(logString);
                        }

                        $(".tree li:has(ul)").children(":first-child").off('click').on('click', function () {
                            $(this).toggleClass("collapsed expanded").siblings("ul").fadeToggle();
                        });

                        Prism.highlightAll();
                    }
                }
                updatingTripLog = false;
                $("#updatingTripLog").fadeOut();
            },  "json" ).error(function () {
                updatingTripLog = false;
                $("#updatingTripLog").fadeOut();
            });
        }
    }

    function initCharts(data) {
        stats = new Highcharts.Chart({
            chart: {
                renderTo: 'stats',
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            exporting: { enabled: false },
            title: {
                text: '',
                style: {
                    fontFamily: 'Open Sans, sans-serif',
                    color: "#727272"
                }
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.y}</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            labels: {
                items: [
                    {
                        html: 'Last hour',
                        style: {
                            left: '65',
                            top: '15',
                            color: "#727272"
                        }
                    },
                    {
                        html: 'Last 24 hours',
                        style: {
                            left: '55',
                            top: '150',
                            color: "#727272"
                        }
                    },
                    {
                        html: 'All time',
                        style: {
                            left: '70',
                            top: '285',
                            color: "#727272"
                        }
                    }
                ]
            },
            series: [
                {
                    center: ['50%', '15%'],
                    size: '40%',
                    showInLegend: true,
                    type: 'pie',
                    name: 'Count',
                    data: [
                        {
                            name: 'Completed',
                            y: data.tripsLastHour,
                            sliced: true,
                            selected: true,
                            color: '#75C944'
                        },
                        {
                            name: 'Rejections',
                            y: data.rejectsLastHour,
                            color: '#282963'
                        },
                        {
                            name: 'Cancellations',
                            y: data.cancelsLastHour,
                            color: '#FFED26'
                        },
                        {
                            name: 'Exceptions',
                            y: data.exceptionsLastHour,
                            color: '#E35D5D'
                        }
                    ]
                },
                {
                    center: ['50%', '50%'],
                    size: '40%',
                    showInLegend: false,
                    type: 'pie',
                    name: 'Count',
                    data: [
                        {
                            name: 'Completed',
                            y: data.tripsLast24Hrs,
                            sliced: true,
                            selected: true,
                            color: '#75C944'
                        },
                        {
                            name: 'Rejections',
                            y: data.rejectsLast24Hrs,
                            color: '#282963'
                        },
                        {
                            name: 'Cancellations',
                            y: data.cancelsLast24Hrs,
                            color: '#FFED26'
                        },
                        {
                            name: 'Exceptions',
                            y: data.exceptionsLast24Hrs,
                            color: '#E35D5D'
                        }
                    ]
                },
                {
                    center: ['50%', '85%'],
                    size: '40%',
                    showInLegend: false,
                    type: 'pie',
                    name: 'Count',
                    data: [
                        {
                            name: 'Completed',
                            y: data.tripsAllTime,
                            sliced: true,
                            selected: true,
                            color: '#75C944'
                        },
                        {
                            name: 'Rejections',
                            y: data.rejectsAllTime,
                            color: '#282963'
                        },
                        {
                            name: 'Cancellations',
                            y: data.cancelsAllTime,
                            color: '#FFED26'
                        },
                        {
                            name: 'Exceptions',
                            y: data.exceptionsAllTime,
                            color: '#E35D5D'
                        }
                    ]
                }
            ]
        }, function (chart) {
            $(chart.series[0].data).each(function (i, e) {
                e.legendItem.on('click', function (event) {
                    var legendItem = e.name;

                    event.stopPropagation();

                    $(chart.series).each(function (j, f) {
                        $(this.data).each(function (k, z) {
                            if (z.name == legendItem) {
                                if (z.visible) {
                                    z.setVisible(false);
                                }
                                else {
                                    z.setVisible(true);
                                }
                            }
                        });
                    });

                });
            });
        });

        activeTripsCount.push(data.activeTrips);
        activeTripsChart = new Highcharts.Chart({
            chart: {
                renderTo: 'activeTripsChart',
                type: 'gauge',
                plotBackgroundColor: null,
                plotBackgroundImage: null,
                plotBorderWidth: 0,
                plotShadow: false,
                style: {
                    fontFamily: 'Open Sans, sans-serif',
                    color: "#727272"
                }
            },
            exporting: { enabled: false },
            title: {
                text: '',
                style: {
                    fontFamily: 'Open Sans, sans-serif',
                    color: "#727272"
                }
            },
            pane: {
                startAngle: -150,
                endAngle: 150,
                background: [
                    {
                        backgroundColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [
                                [0, '#FFF'],
                                [1, '#333']
                            ]
                        },
                        borderWidth: 0,
                        outerRadius: '109%'
                    },
                    {
                        backgroundColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [
                                [0, '#333'],
                                [1, '#FFF']
                            ]
                        },
                        borderWidth: 1,
                        outerRadius: '107%'
                    },
                    {
                        // default background
                    },
                    {
                        backgroundColor: '#DDD',
                        borderWidth: 0,
                        outerRadius: '105%',
                        innerRadius: '103%'
                    }
                ]
            },

            // the value axis
            yAxis: {
                min: 0,
                max: (data.activeTrips < 10) ? 10 : data.activeTrips * 1.4,

                minorTickInterval: 'auto',
                minorTickWidth: 0,
                minorTickLength: 10,
                minorTickPosition: 'inside',
                minorTickColor: '#FFF',

                tickPixelInterval: 30,
                tickWidth: 0,
                tickPosition: 'inside',
                tickLength: 10,
                tickColor: '#FFF',
                labels: {
                    step: 2,
                    rotation: 'auto'
                },
                title: {
                    text: 'Trips'
                },
                plotBands: [
                    {
                        from: 0,
                        to: 30,
                        color: '#55BF3B'
                    }
                ]
            },

            series: [
                {
                    name: "All trips",
                    data: [data.activeTrips],
                    dial: {
                        radius: "50%",
                        rearLength: "0%"
                    }
                },
                {
                    name: "Selected status",
                    data: [data.activeTrips],
                    dial: {
                        radius: "90%",
                        rearLength: "0%"
                    },
                    dataLabels: {
                        enabled: false
                    }
                }
            ]

        });
    }

    var updatingCharts = false;

    function updateCharts() {
        if (!updatingCharts) {
            updatingCharts = true;
            $.get(baseUrl + 'stats?format=json&access_token=' + accessToken, function (data) {
                try {
                    if (data.result == "OK") {
                        if (stats == null || activeTripsChart == null) {
                            initCharts(data);
                        } else {
                            stats.series[2].data[3].update(data.exceptionsAllTime, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.series[2].data[2].update(data.cancelsAllTime, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.series[2].data[1].update(data.rejectsAllTime, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.series[2].data[0].update(data.tripsAllTime, false, {
                                duration: 1500,
                                easing: 'swing'
                            });

                            stats.series[1].data[3].update(data.exceptionsLast24Hrs, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.series[1].data[2].update(data.cancelsLast24Hrs, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.series[1].data[1].update(data.rejectsLast24Hrs, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.series[1].data[0].update(data.tripsLast24Hrs, false, {
                                duration: 1500,
                                easing: 'swing'
                            });

                            stats.series[0].data[3].update(data.exceptionsLastHour, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.series[0].data[2].update(data.cancelsLastHour, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.series[0].data[1].update(data.rejectsLastHour, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.series[0].data[0].update(data.tripsLastHour, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.redraw();
                        }
                        updateCounters(data);
                    }
                } catch (err) {
                }
                updatingCharts = false;
            },  "json" ).error(function (xhr, ajaxOptions, thrownError) {
                updatingCharts = false;
            });
        }
    }

    function updateCounters(data) {
        updateCounter("requestsLastHour", data.requestsLastHour);
        updateCounter("requestsLast24Hrs", data.requestsLast24Hrs);
        updateCounter("requestsAllTime", Math.ceil(data.requestsAllTime));
        updateCounter("distanceLastHour", data.distanceLastHour);
        updateCounter("distanceLast24Hrs", data.distanceLast24Hrs);
        updateCounter("distanceAllTime", Math.ceil(data.distanceAllTime));
        updateCounter("fareLastHour", data.fareLastHour);
        updateCounter("fareLast24Hrs", data.fareLast24Hrs);
        updateCounter("fareAllTime", Math.ceil(data.fareAllTime));
    }

    function updateCounter(id, number) {
        if (counters[id] == 0 && number == 0) {
            $("#" + id).flipCounter("setNumber", 0);
        } else {
            $("#" + id).flipCounter(
                "startAnimation", // scroll counter from the current number to the specified number
                {
                    number: counters[id], // the number we want to scroll from
                    end_number: number, // the number we want the counter to scroll to
                    easing: jQuery.easing.easeOutCubic, // this easing function to apply to the scroll.
                    duration: 2000 // number of ms animation should take to complete
                }
            );
        }
        var x = counters;
        counters[id] = number;
        x = counters;
    }

    updateCharts();
    updateTrips();
    updateSelectedTrip();
    updateTripLog();

    setInterval(function () {
        updateCharts();
        updateTrips();
        updateSelectedTrip();
        updateTripLog();
    }, 10000);

    //JSON formatter
    function RealTypeOf(v) {
        if (typeof (v) == "object") {
            if (v === null) return "null";
            if (v.constructor == (new Array).constructor) return "array";
            if (v.constructor == (new Date).constructor) return "date";
            if (v.constructor == (new RegExp).constructor) return "regex";
            return "object";
        }
        return typeof (v);
    }

    function FormatJSON(oData, sIndent) {
        if (arguments.length < 2) {
            var sIndent = "";
        }
        var sIndentStyle = "    ";
        var sDataType = RealTypeOf(oData);

        // open object
        if (sDataType == "array") {
            if (oData.length == 0) {
                return "[]";
            }
            var sHTML = "[";
        } else {
            var iCount = 0;
            $.each(oData, function () {
                iCount++;
                return;
            });
            if (iCount == 0) { // object is empty
                return "{}";
            }
            var sHTML = "{";
        }

        // loop through items
        var iCount = 0;
        $.each(oData, function (sKey, vValue) {
            if (iCount > 0) {
                sHTML += ",";
            }
            if (sDataType == "array") {
                sHTML += ("\n" + sIndent + sIndentStyle);
            } else {
                sHTML += ("\n" + sIndent + sIndentStyle + "\"" + sKey + "\"" + ": ");
            }

            // display relevant data type
            switch (RealTypeOf(vValue)) {
                case "array":
                case "object":
                    sHTML += FormatJSON(vValue, (sIndent + sIndentStyle));
                    break;
                case "boolean":
                case "number":
                    sHTML += vValue.toString();
                    break;
                case "null":
                    sHTML += "null";
                    break;
                case "string":
                    sHTML += ("\"" + vValue + "\"");
                    break;
                default:
                    sHTML += ("TYPEOF: " + typeof (vValue));
            }

            // loop
            iCount++;
        });

        // close object
        if (sDataType == "array") {
            sHTML += ("\n" + sIndent + "]");
        } else {
            sHTML += ("\n" + sIndent + "}");
        }

        // return
        return sHTML;
    }

    function getAddress(lat, lng) {
        var urlJson = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&sensor=false";
        var json;

        $.ajax({
            url: urlJson,
            dataType: 'json',
            async: false,
            success: function (data) {
                json = data;
            }
        });
        if (json.status === "OK") {
            return json.results[0].formatted_address;
        }
        return "undefine";
    }
});