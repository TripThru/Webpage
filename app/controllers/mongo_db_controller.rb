require 'mongo'
include Mongo

class MongoDbController < ApplicationController
  skip_before_action :verify_authenticity_token

  def trips_count
    geo_near = { }
    if params[:centerLat] != nil and params[:centerLng] != nil and params[:centerRadius] != nil
      geo_near['$geoNear'] = {
          'near' => [ params[:centerLng].to_f, params[:centerLat].to_f ],
          'distanceField' => 'dist.calculated',
          'maxDistance' => params[:centerRadius].to_f,
          'spherical' => true,
          'distanceMultiplier' => 3959
      }
    end

    match = { }
    if params[:startDate] != nil or params[:endDate] != nil
      match['$match'] = { 'LastUpdate' => {} }
      if params[:startDate] != nil
        match['$match']['LastUpdate']['$gte'] = Time.at(params[:startDate].to_f)
      end
      if params[:endDate] != nil
        match['$match']['LastUpdate']['$lte'] = Time.at(params[:endDate].to_f)
      end
    end
    if params[:servicingNetworkId] != nil and params[:originatingNetworkId] != nil
      match['$match']['$or'] = [
          {'ServicingPartnerId' => params[:servicingNetworkId]},
          {'OriginatingPartnerId' => params[:originatingNetworkId]}
      ]
    elsif params[:servicingNetworkId] != nil
      match['$match']['ServicingPartnerId'] = params[:servicingNetworkId]
    elsif params[:originatingNetworkId] != nil
      match['$match']['OriginatingPartnerId'] = params[:originatingNetworkId]
    end

    sort = { '$sort' => { 'LastUpdate' => 1 } }

    interval = { }
    case params[:interval]
      when 'second'
        interval['$divide'] = [
            { '$add' => [
                { '$multiply' => [ { '$hour' => '$LastUpdate' }, 3600] },
                { '$multiply' => [ { '$minute' => '$LastUpdate' }, 60] },
                { '$second' => '$LastUpdate' }
            ]},
            params[:bucketSize].to_f
        ]
      when 'minute'
        interval['$divide'] = [
            { '$add' => [
                { '$multiply' => [ { '$hour' => '$LastUpdate' }, 60] },
                { '$minute' => '$LastUpdate' }
            ]},
            params[:bucketSize].to_f
        ]
      when 'hour'
        interval['$divide'] = [
            { '$add' => [
                { '$multiply' => [ { '$dayOfYear' => '$LastUpdate' }, 24] },
                { '$hour' => '$LastUpdate' }
            ]},
            params[:bucketSize].to_f
        ]
      when 'day'
        interval = { '$dayOfYear' => '$LastUpdate' }
      when 'week'
        interval = { '$week' => '$LastUpdate' }
    end

    project = {
        '$project' => {
            'Status' => '$Status',
            'Interval' => interval
        }
    }

    group = {
        '$group' => {
          '_id' => {
              'Status' => '$Status',
              'Interval' => {
                  '$subtract' => [
                      '$Interval',
                      { '$mod' => [ '$Interval', 1 ] }
                  ]
              }
          },
          'count' => { '$sum' => 1 }
        }
    }

    parameters = []
    if geo_near.length > 0
      parameters << geo_near
    end
    if match.length > 0
      parameters << match
    end
    if geo_near.length == 0
      parameters << sort
    end
    parameters << project
    parameters << group

    client = MongoClient.new('SG-TripThru-2816.servers.mongodirector.com', '27017')
    db = client.db('TripThru')
    res = db.collection('trips').aggregate(parameters)
    #puts parameters
    #puts 'Results count: ' + res.length.to_s
    respond_to do |format|
      format.json { render text: res.to_json }
    end
  end

  def trips_list
    match = { 'LastUpdate' => { '$gte' => Time.at(params[:startDate].to_f) } }
    if params[:endDate] != nil
      match['LastUpdate']['$lte'] = Time.at(params[:endDate].to_f)
    end

    if params[:centerLat] != nil and params[:centerLng] != nil and params[:centerRadius] != nil
      match['loc'] = { '$geoWithin' =>
                        { '$centerSphere' =>
                              [
                                [ params[:centerLng].to_f, params[:centerLat].to_f ] ,
                                params[:centerRadius].to_f / 3959
                              ]
                        }
                      }
    end

    if params[:servicingNetworkId] != nil and params[:originatingNetworkId] != nil
      match['$or'] = [
          {'ServicingPartnerId' => params[:servicingNetworkId]},
          {'OriginatingPartnerId' => params[:originatingNetworkId]}
      ]
    elsif params[:servicingNetworkId] != nil
      match['ServicingPartnerId'] = params[:servicingNetworkId]
    elsif params[:originatingNetworkId] != nil
      match['OriginatingPartnerId'] = params[:originatingNetworkId]
    end

    client = MongoClient.new('SG-TripThru-2816.servers.mongodirector.com', '27017')
    db = client.db('TripThru')
    trips = db.collection('trips').find(match)
    respond_to do |format|
      format.json { render text: trips.to_json }
    end
  end

end
