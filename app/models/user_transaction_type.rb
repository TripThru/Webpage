class UserTransactionType < ActiveRecord::Base
  has_many :user_transactions, foreign_key: 'user_transaction_type_id', primary_key: 'id'
end