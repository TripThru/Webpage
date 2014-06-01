require 'mongo'
include Mongo

class MongoDbController < ApplicationController
  skip_before_action :verify_authenticity_token

  def trips_seconds
    get_trips = '
      function () {
        var startDate = new Date("' + params[:startDate] + '");
        var trips = db.trips.aggregate(
          { $match : { LastUpdate : { $gt: startDate } } },
          { $project : {
              Status : "$Status",
              Interval : {
                  $divide: [
                        { $add: [
                           { $multiply : [ { $hour : "$LastUpdate"}, 3600 ]},
                           { $multiply : [ { $minute : "$LastUpdate"}, 60 ]},
                           { $second : "$LastUpdate" }
                        ]}, 15
                  ]
              }
            }
          },
          { $group : {
              _id :  {
                  "Status" : "$Status" ,
                  "Interval" : { $subtract : ["$Interval", { $mod : ["$Interval", 1] }] }
              },
              count : { $sum : 1 }
            }
          }
        )
        return trips;
      }
    '

    client = MongoClient.new('SG-TripThru-2816.servers.mongodirector.com', '27017')
    db = client.db('TripThru')
    res = db.eval(get_trips)

    respond_to do |format|
      format.json { render text: res['_firstBatch'].to_json }
    end
  end

  def trips_hours
    get_trips = '
      function () {
        var startDate = new Date("' + params[:startDate] + '");
        var trips = db.trips.aggregate(
          { $match : { LastUpdate : { $gt: startDate } } },
          { $project : {
              Status : "$Status",
              Interval : {
                  $divide: [
                        { $add: [
                           { $multiply : [ { $dayOfYear : "$LastUpdate" }, 24 ] },
                           { $hour : "$LastUpdate"}
                        ]}, 15
                  ]
              }
            }
          },
          { $group : {
              _id :  {
                  "Status" : "$Status" ,
                  "Interval" : { $subtract : ["$Interval", { $mod : ["$Interval", 1] }] }
              },
              count : { $sum : 1 }
            }
          }
        )
        return trips;
      }
    '

    client = MongoClient.new('SG-TripThru-2816.servers.mongodirector.com', '27017')
    db = client.db('TripThru')
    res = db.eval(get_trips)

    respond_to do |format|
      format.json { render text: res['_firstBatch'].to_json }
    end
  end

  def trips_list
    client = MongoClient.new('SG-TripThru-2816.servers.mongodirector.com', '27017')
    db = client.db('TripThru')
    match = { 'LastUpdate' => { '$gte' => Time.at(params[:startDate].to_f) } }
    trips = db.collection('trips').find(match)
    respond_to do |format|
      format.json { render text: trips.to_json }
    end
  end

end
