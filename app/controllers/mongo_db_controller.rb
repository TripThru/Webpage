require 'mongo'
include Mongo

class MongoDbController < ApplicationController
  skip_before_action :verify_authenticity_token

  def trips
    get_trips = '
      function () {
        var trips = db.trips.aggregate(
          { $project : {
               Status : "$Status",
               Interval : { $divide : [ { $add : [ { $multiply : [ { $dayOfYear : "$LastUpdate" }, 1440 ] }, { $multiply : [ { $hour : "$LastUpdate" }, 60 ] }, { $minute : "$LastUpdate" } ] }, 60 ]}
            }
          },
          { $group : {
              _id :  { "Status" : "$Status" , "Interval" : { $subtract : ["$Interval", { $mod : ["$Interval", 1] }] } },
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

end
