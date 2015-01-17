class Location
  include Mongoid::Document

  field :Lat, type: BigDecimal
  field :Lng, type: BigDecimal
end
