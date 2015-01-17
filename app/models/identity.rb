class Identity
  include Mongoid::Document

  field :id, type:String
  field :name, type:String
end