class Locpoint
  include Mongoid::Document
  field :type, type: String
  field :coordinates, type: Array
end
