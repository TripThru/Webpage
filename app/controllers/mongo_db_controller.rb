require 'mongo'
include Mongo

class MongoDbController < ApplicationController
  skip_before_action :verify_authenticity_token

  ##Queries currently assume that servicing and originating will be the same (if both are not nil)

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


    project = {
        '$project' => {
            'Status' => 1,
            'LastUpdate' => 1,
            'ServicingPartnerId' => 1,
            'OriginatingPartnerId' => 1,
            'Interval' => interval
        }
    }

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

    if (params[:servicingNetworkId] != nil or params[:originatingNetworkId] != nil) and
        (params[:servicingNetworkId] != 'all' and params[:originatingNetworkId] != 'all')
      if roleUser == 'partner'
        if params[:servicingNetworkId] != nil
          params[:servicingNetworkId] = userId
        end
        if params[:originatingNetworkId] != nil
          params[:originatingNetworkId] = userId
        end
      end

      if params[:servicingNetworkId] != nil and params[:originatingNetworkId] != nil
        if params[:localNetworkId] != nil
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
        if params[:localNetworkId] != nil
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
        if params[:localNetworkId] != nil
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
      if params[:localNetworkId] == 'all' and params[:servicingNetworkId] == nil and params[:originatingNetworkId] == nil
        project['$project']['isLocal'] = { '$eq' => [ '$ServicingPartnerId', '$OriginatingPartnerId' ] }
        match['$match']['isLocal'] = true
      else
        if params[:localNetworkId] != nil and params[:localNetworkId] != 'all'
          match['$match']['$and'] = [
              {'ServicingPartnerId' => params[:localNetworkId]},
              {'OriginatingPartnerId' => params[:localNetworkId]}
          ]
        end
      end
    end

    sort = { '$sort' => { 'LastUpdate' => 1 } }

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
    parameters << project
    if match.length > 0
      parameters << match
    end
    if geo_near.length == 0
      parameters << sort
    end
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

    only_local = false
    if (params[:servicingNetworkId] != nil or params[:originatingNetworkId] != nil) and
        (params[:servicingNetworkId] != 'all' and params[:originatingNetworkId] != 'all')
      if roleUser == 'partner'
        if params[:servicingNetworkId] != nil
          params[:servicingNetworkId] = userId
        end
        if params[:originatingNetworkId] != nil
          params[:originatingNetworkId] = userId
        end
      end

      if params[:servicingNetworkId] != nil and params[:originatingNetworkId] != nil
        if params[:localNetworkId] != nil
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
        if params[:localNetworkId] != nil
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
        if params[:localNetworkId] != nil
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
      if params[:localNetworkId] == 'all' and params[:servicingNetworkId] == nil and params[:originatingNetworkId] == nil
        only_local = true
      end
      if params[:localNetworkId] != nil and params[:localNetworkId] != 'all'
        match['$and'] = [
            {'ServicingPartnerId' => params[:localNetworkId]},
            {'OriginatingPartnerId' => params[:localNetworkId]}
        ]
      end
    end

    puts match
    trips = Trip.where(match)
    if only_local
      trips = trips.select{ |t| t.OriginatingPartnerId == t.ServicingPartnerId }
    end

    respond_to do |format|
      format.json { render text: trips.to_json }
    end
  end

end
