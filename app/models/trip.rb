class Trip
  include Mongoid::Document

  field :id, type:String
  field :loc, type:Locpoint
  field :lastStatusChange, type: String
  field :originatingPartner, type: Identity
  field :servicingPartner, type: Identity
  field :originatingPartnerId, type: String
  field :servicingPartnerId, type: String
  field :passenger, type: Identity
  field :pickupLocation, type: Location
  field :dropoffLocation, type: Location
  field :pickupTime, type: DateTime
  field :occupiedTime, type: String
  field :enrouteTime, type: String
  field :idleTime, type: String
  field :enrouteDistance, type: String
  field :lastUpdate, type: DateTime
  field :serviceGoalMet, type: Boolean
  field :lateness, type: String

end
