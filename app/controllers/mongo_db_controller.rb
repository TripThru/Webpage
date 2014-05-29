require 'mongo'
include Mongo

class MongoDbController < ApplicationController
  skip_before_action :verify_authenticity_token

  def trips
    get_trips = '
      function () {
        var last30Minutes = new Date();
        last30Minutes.setMinutes(last30Minutes.getMinutes()-30);

        var trips = db.trips.aggregate(
          { $match : { LastUpdate : { $gt: last30Minutes } } },
          { $project : {
              Status : "$Status",
              Interval : {
                  $add: [
                           { $dayOfYear : "$LastUpdate" },
                           { $hour : "$LastUpdate" },
                           { $minute : "$LastUpdate" }
                        ]
              }
            }
          },
          { $group : {
              _id :  {
                  "Status" : "$Status" ,
                  "Interval" : "$Interval"
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

end
