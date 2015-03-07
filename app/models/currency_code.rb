class CurrencyCode < ActiveRecord::Base
  has_many :trip_payments, foreign_key: 'currency_code_id', primary_key: 'id'
end