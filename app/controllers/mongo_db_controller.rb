require 'mongo'
include Mongo

class MongoDbController < ApplicationController
  skip_before_action :verify_authenticity_token

  ##Queries currently assume that servicing and originating will be the same (if both are not nil)
  ##Todo: Fix match query when we need servicing == originating when servicing and originating are not specified

  def trips_count
    geo_near = { }
    if params[:centerLat] != nil and params[:centerLng] != nil and params[:centerRadius] != nil
      geo_near['$geoNear'] = {
          'near' => [ params[:centerLng].to_f, params[:centerLat].to_f ],
          'distanceField' => 'dist.calculated',
          'maxDistance' => params[:centerRadius].to_f / 3959,
          'spherical' => true
      }
    end

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

    if params[:servicingNetworkId] != nil or params[:originatingNetworkId] != nil
      if roleUser == 'partner'
        if params[:servicingNetworkId] != nil
          params[:servicingNetworkId] = userId
        end
        if params[:originatingNetworkId] != nil
          params[:originatingNetworkId] = userId
        end
      end

      if params[:servicingNetworkId] != nil and params[:originatingNetworkId] != nil
        if params[:local] != nil
          match['$match']['$or'] = [
              {'ServicingPartnerId' => params[:servicingNetworkId]},
              {'OriginatingPartnerId' => params[:originatingNetworkId]}
          ]
        else
          match['$match']['$and'] = [
              {'$or' => [
                  {'ServicingPartnerId' => params[:servicingNetworkId]},
                  {'OriginatingPartnerId' => params[:originatingNetworkId]}
              ]
              },
              {'$or' => [
                  {'ServicingPartnerId' => {'$ne' => params[:servicingNetworkId]}},
                  {'OriginatingPartnerId' => {'$ne' => params[:originatingNetworkId]}}
              ]}
          ]
        end
      elsif params[:servicingNetworkId] != nil
        if params[:local] != nil
          match['$match']['$or'] = [
              {'ServicingPartnerId' => params[:servicingNetworkId]},
              {'$and' => [
                  {'ServicingPartnerId' => params[:servicingNetworkId]},
                  {'OriginatingPartnerId' => params[:servicingNetworkId]}
              ]
              }
          ]
        else
          match['$match']['$and'] = [
              {'ServicingPartnerId' => params[:servicingNetworkId]},
              'OriginatingPartnerId' => {'$ne' => params[:servicingNetworkId]}
          ]
        end
      elsif params[:originatingNetworkId] != nil
        if params[:local] != nil
          match['$match']['$or'] = [
              {'OriginatingPartnerId' => params[:originatingNetworkId]},
              {'$and' => [
                  {'ServicingPartnerId' => params[:originatingNetworkId]},
                  {'OriginatingPartnerId' => params[:originatingNetworkId]}
              ]}
          ]
        else
          match['$match']['$and'] = [
              {'OriginatingPartnerId' => params[:originatingNetworkId]},
              {'ServicingPartnerId' => {'$ne' => params[:originatingNetworkId]}}
          ]
        end
      end
    else
      if params[:local] != nil
        if params[:local] == 'all'
          match['$match']['ServicingPartnerId'] = '$OriginatingNetwork'
        else
          match['$match']['$and'] = [
              {'ServicingPartnerId' => params[:local]},
              {'OriginatingPartnerId' => params[:local]}
          ]
        end
      end
    end

    sort = { '$sort' => { 'LastUpdate' => 1 } }

    project = {
        '$project' => {
            'Status' => 1,
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

    res = Trip.collection.aggregate(parameters)
    puts parameters
    puts 'Results count: ' + res.length.to_s
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

    if params[:servicingNetworkId] != nil or params[:originatingNetworkId] != nil
      if params[:servicingNetworkId] != nil and params[:originatingNetworkId] != nil
        if params[:local] != nil
          match['$or'] = [
              {'ServicingPartnerId' => params[:servicingNetworkId]},
              {'OriginatingPartnerId' => params[:originatingNetworkId]}
          ]
        else
          match['$and'] = [
              {'$or' => [
                  {'ServicingPartnerId' => params[:servicingNetworkId]},
                  {'OriginatingPartnerId' => params[:originatingNetworkId]}
              ]
              },
              {'$or' => [
                  {'ServicingPartnerId' => {'$ne' => params[:servicingNetworkId]}},
                  {'OriginatingPartnerId' => {'$ne' => params[:originatingNetworkId]}}
              ]}
          ]
        end
      elsif params[:servicingNetworkId] != nil
        if params[:local] != nil
          match['$or'] = [
              {'ServicingPartnerId' => params[:servicingNetworkId]},
              {'$and' => [
                  {'ServicingPartnerId' => params[:servicingNetworkId]},
                  {'OriginatingPartnerId' => params[:servicingNetworkId]}
              ]
              }
          ]
        else
          match['$and'] = [
              {'ServicingPartnerId' => params[:servicingNetworkId]},
              'OriginatingPartnerId' => {'$ne' => params[:servicingNetworkId]}
          ]
        end
      elsif params[:originatingNetworkId] != nil
        if params[:local] != nil
          match['$or'] = [
              {'OriginatingPartnerId' => params[:originatingNetworkId]},
              {'$and' => [
                  {'ServicingPartnerId' => params[:originatingNetworkId]},
                  {'OriginatingPartnerId' => params[:originatingNetworkId]}
              ]}
          ]
        else
          match['$and'] = [
              {'OriginatingPartnerId' => params[:originatingNetworkId]},
              {'ServicingPartnerId' => {'$ne' => params[:originatingNetworkId]}}
          ]
        end
      end
    else
      if params[:local] != nil
        if params[:local] == 'all'
          match['ServicingPartnerId'] = '$OriginatingNetwork'
        else
          match['$and'] = [
              {'ServicingPartnerId' => params[:local]},
              {'OriginatingPartnerId' => params[:local]}
          ]
        end
      end
    end

    puts match
    trips = Trip.where(match)

    respond_to do |format|
      format.json { render text: trips.to_json }
    end
  end

end
