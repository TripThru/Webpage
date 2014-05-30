require 'mongo'
include Mongo

class MongoDbController < ApplicationController
  skip_before_action :verify_authenticity_token

  def trips
    puts params[:startDate]
    get_trips = '
      function () {
        var startDate = new Date("' + params[:startDate] + '");
        var trips = db.trips.aggregate(
          { $match : { LastUpdate : { $gt: startDate } } },
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
