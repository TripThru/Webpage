class Trip
  include Mongoid::Document

  field :_id, type:String
  field :loc, type:Locpoint
  field :LastStatusChange, type: String
  field :OriginatingPartnerName, type: String
  field :OriginatingPartnerId, type: String
  field :PassengerName, type: String
  field :PickupLocation, type: Location
  field :DropoffLocation, type: Location
  field :PickupTime, type: DateTime
  field :OccupiedTime, type: String
  field :EnrouteTime, type: String
  field :IdleTime, type: String
  field :EnrouteDistance, type: String
  field :LastUpdate, type: DateTime
  field :ServiceGoalMet, type: Boolean
  field :Lateness, type: String

end
