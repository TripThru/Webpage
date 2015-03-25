class ProductPartnerships < ActiveRecord::Base
  belongs_to :user, foreign_key: 'user_id', primary_key: 'id'
  belongs_to :product, foreign_key: 'product_id', primary_key: 'id'
end