class UserTransaction < ActiveRecord::Base
  belongs_to :user, foreign_key: 'user_id', primary_key: 'id'
  belongs_to :user_transaction_type, foreign_key: 'user_transaction_type_id', primary_key: 'id'

end