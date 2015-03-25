# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140511085515) do

  create_table "driver", force: true do |t|
    t.string "driver_id"
    t.string "name"
  end

  create_table "products", force: true do |t|
    t.integer "user_id",         precision: 38, scale: 0
    t.string  "product_id"
    t.string  "name"
    t.decimal "coverage_radius"
    t.decimal "coverage_lat"
    t.decimal "coverage_lng"
  end

  create_table "trips", force: true do |t|
    t.integer  "user_id"
    t.integer  "product_id"
    t.string   "customer_id"
    t.string   "customer_name"
    t.string   "customer_local_id"
    t.string   "customer_phone_number"
    t.string   "driver_id"
    t.string   "driver_name"
    t.string   "driver_local_id"
    t.string   "driver_native_language_id"
    t.string   "trip_id"
    t.string   "servicing_network_id"
    t.string   "servicing_product_id"
    t.decimal  "pickup_location_lat"
    t.decimal  "pickup_location_lng"
    t.datetime "pickup_time"
    t.decimal  "dropoff_location_lat"
    t.decimal  "dropoff_location_lng"
    t.datetime "dropoff_time"
    t.datetime "eta"
    t.decimal  "fare"
    t.string   "status"
    t.datetime "last_update"
    t.boolean  "autodispatch"
    t.decimal  "lateness_milliseconds"
    t.decimal  "sampling_percentage"
    t.integer  "service_level",
    t.decimal  "duration_seconds"
    t.decimal  "distance"
    t.datetime "created_at"
    t.integer  "passengers"
    t.integer  "luggage"

  end

  create_table "users", force: true do |t|
    t.string   "client_id"
    t.string   "name"
    t.string   "full_name"
    t.string   "password_digest"
    t.string   "email"
    t.string   "token"
    t.string   "role"
    t.string   "remember_token"
    t.string   "endpoint_type"
    t.string   "callback_url"
    t.string   "callback_token"
    t.boolean  "must_accept_prescheduled"
    t.boolean  "must_accept_ondemand"
    t.boolean  "must_accept_cash_payments"
    t.boolean  "must_accept_account_payments"
    t.boolean  "must_accept_creditcard_payments"
    t.integer  "min_rating"
    t.string   "routing_strategy"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "trip_locations",force: true do |t|
    t.integer  "trip_id",
    t.float    "lat"
    t.float    "lng"
    t.string   "description"
  end

  create table "currency_codes", force: true do |t|
    t.string  "code"
  end

  create table "user_transaction_types", force: true do |t|
    t.string  "name"
  end

  create table "user_transactions", force: true do |t|
    t.integer    "user_transaction_type_id"
    t.float     "amount"
    t.datetime  "datetime"
  end

  create table "trip_payment", force: true do |t|
    t.integer   "trip_id"
    t.integer   "currency_code_id"
    t.float     "amount"
    t.float     "tip"
    t.boolean   "confirmed"
    t.datetime  "requested_at"
    t.datetime  "confirmed_at"
  end

  create table "network_partnerships", force: true do |t|
    t.integer   "user_id"
    t.integer   "network_id"
  end

  create_table "product_partnerships", force: true do |t|
    t.integer   "user_id"
    t.integer   "product_id"
  end

end
