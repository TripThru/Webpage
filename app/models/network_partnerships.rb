class NetworkPartnerships < ActiveRecord::Base
  belongs_to :user, foreign_key: 'user_id', primary_key: 'id'
  belongs_to :user, foreign_key: 'network_id', primary_key: 'id'
end