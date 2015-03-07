class TripLocations < ActiveRecord::Base
  belongs_to :trip, foreign_key: 'trip_id', primary_key: 'id'
end