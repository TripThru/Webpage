class TripPayment < ActiveRecord::Base
  self.table_name = 'trip_payment'
  belongs_to :trip, foreign_key: 'trip_id', primary_key: 'id'
  belongs_to :currency_code, foreign_key: 'currency_code_id', primary_key: 'id'
end