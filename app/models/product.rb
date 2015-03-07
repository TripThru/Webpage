class Product < ActiveRecord::Base
  belongs_to :user, foreign_key: 'user_id', primary_key: 'id'
  has_many :trips, foreign_key: 'product_id', primary_key: 'id'
  has_many :trips, foreign_key: 'servicing_product_id', primary_key: 'id'
end