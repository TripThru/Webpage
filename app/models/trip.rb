class Trip < ActiveRecord::Base
  belongs_to :user, foreign_key: 'user_id', primary_key: 'id'
  belongs_to :user, foreign_key: 'servicing_network_id', primary_key: 'id'
  belongs_to :product, foreign_key: 'product_id', primary_key: 'id'
  belongs_to :product, foreign_key: 'servicing_product_id', primary_key: 'id'
  has_many :trip_locations, foreign_key: 'trip_id', primary_key: 'id'
  has_one :trip_payment, foreign_key: 'trip_id', primary_key: 'id'
end
