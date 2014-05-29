require 'mongo'
include Mongo

class MongoDbController < ApplicationController
  skip_before_action :verify_authenticity_token

  def trip
    db = MongoClient.new('SG-TripThru-2816.servers.mongodirector.com', '27017')
    respond_to do |format|
      format.json { render text: db.database_names }
    end
  end

  def paramstest
    respond_to do |format|
      format.json { render text: params[:id]}
    end
  end

end
