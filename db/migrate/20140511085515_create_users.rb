class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :client_id, index: true
      t.string :name, index: true
      t.string :full_name
      t.string :password_digest
      t.string :email
      t.string :token
      t.string :role
      t.string :remember_token
      t.string :endpoint_type
      t.string :callback_url
      t.string :callback_token
      t.boolean :must_accept_prescheduled
      t.boolean :must_accept_ondemand
      t.boolean :must_accept_cash_payments
      t.boolean :must_accept_account_payments
      t.boolean :must_accept_creditcard_payments
      t.boolean :experimental_features_enabled
      t.timestamps
    end

    create_table :products do |t|
      t.references :user
      t.string :product_id, index: true
      t.string :name
      t.float  :coverage_radius
      t.float  :coverage_lat
      t.float  :coverage_lng
    end

    create_table :trips do |t|
      t.references :user
      t.references :product
      t.string :trip_id, index: true
      t.integer :servicing_network_id
      t.integer :servicing_product_id
      t.float :pickup_location_lat
      t.float :pickup_location_lng
      t.datetime :pickup_time
      t.float :dropoff_location_lat
      t.float :dropoff_location_lng
      t.datetime :dropoff_time
      t.datetime :eta
      t.float :fare
      t.string :status
      t.datetime :last_update
      t.boolean :autodispatch
      t.float :lateness_milliseconds
      t.float :sampling_percentage
      t.integer :service_level
      t.float :duration_seconds
      t.float :distance
      t.timestamps
    end

    create_table :trip_locations do |t|
      t.references :trips
      t.float :lat
      t.float :lng
      t.string :description
    end

    create_table :currency_codes do |t|
      t.string :code
    end

    create_table :currency_rates do |t|

    end

    create_table :user_transactions do |t|
      t.references  :user
      t.reference   :user_transaction_types
      t.float       :amount
      t.datetime    :datetime
    end

    create_table :user_transaction_types do |t|
      t.string  :name
    end

    create_table :trip_payment do |t|
      t.references  :trips
      t.references  :currency_codes
      t.float       :amount
      t.float       :tip
      t.boolean     :confirmed
      t.datetime    :requested_at
      t.datetime    :confirmed_at
    end
  end
end