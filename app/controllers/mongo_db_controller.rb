require 'mongo'
include Mongo

class MongoDbController < ApplicationController
  skip_before_action :verify_authenticity_token

  def trips_count
    interval = ''
    match = ''

    case params[:interval]
      when 'second'
        interval = '$divide: [
                        { $add: [
                           { $multiply : [ { $hour : "$LastUpdate"}, 3600 ]},
                           { $multiply : [ { $minute : "$LastUpdate"}, 60 ]},
                           { $second : "$LastUpdate" }
                        ]}, ' + params[:bucketSize] + '
                    ]'
      when 'minute'
        interval = '$divide: [
                        { $add: [
                           { $multiply : [ { $hour : "$LastUpdate"}, 60 ]},
                           { $minute : "$LastUpdate"}
                        ]}, ' + params[:bucketSize] + '
                    ]'
      when 'hour'
        interval = '$divide: [
                        { $add: [
                           { $multiply : [ { $dayOfYear : "$LastUpdate"}, 24 ]},
                           { $hour : "$LastUpdate" }
                        ]}, ' + params[:bucketSize] + '
                    ]'
      when 'day'
        interval = '$dayOfYear : "$LastUpdate"'
      when 'week'
        interval = '$week : "$LastUpdate"'
    end

    if params[:endDate] != nil
      match = '{ $match : { LastUpdate : { $gte: startDate, $lte: endDate } } }'
    else
      match = '{ $match : { LastUpdate : { $gte: startDate } } }'
    end

    get_trips = '
      function () {
        var startDate = new Date("' + params[:startDate] + '");
        var endDate = new Date("' + (params[:endDate] != nil ? params[:endDate] : '') + '");
        var trips = db.trips.aggregate(
          ' + match + ',
          { $sort: { LastUpdate : 1 } },
          { $project : {
              Status : "$Status",
              Interval : { ' + interval +' }
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
