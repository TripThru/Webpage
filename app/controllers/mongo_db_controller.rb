require 'mongo'
include Mongo

class MongoDbController < ApplicationController
  skip_before_action :verify_authenticity_token

  ##Queries currently assume that servicing and originating will be the same (if both are not nil)

  def trips_count
    documents_limit = 200000
    by_status = false

    date_field = 'lastUpdate'
    if params[:by_creation_time] == 'true'
      date_field = 'creation'
    end

    if params[:by_status] != nil
      by_status = params[:by_status] == 'true' ? true : false
    end

    geo_near = { }
    if params[:centerLat] != nil and params[:centerLng] != nil and params[:centerRadius] != nil
      geo_near['$geoNear'] = {
          'near' => [ params[:centerLng].to_f, params[:centerLat].to_f ],
          'distanceField' => 'dist.calculated',
          'maxDistance' => params[:centerRadius].to_f / 3959,
          'spherical' => true,
          'limit' => documents_limit
      }
    end

    interval = { }
    case params[:interval]
      when 'second'
        interval['$divide'] = [
            { '$add' => [
                { '$multiply' => [ { '$hour' => '$'+date_field }, 3600] },
                { '$multiply' => [ { '$minute' => '$'+date_field }, 60] },
                { '$second' => '$'+date_field }
            ]},
            params[:bucketSize].to_f
        ]
      when 'minute'
        interval['$divide'] = [
            { '$add' => [
                { '$multiply' => [ { '$hour' => '$'+date_field }, 60] },
                { '$minute' => '$'+date_field }
            ]},
            params[:bucketSize].to_f
        ]
      when 'hour'
        interval['$divide'] = [
            { '$add' => [
                { '$multiply' => [ { '$dayOfYear' => '$'+date_field }, 24] },
                { '$hour' => '$'+date_field }
            ]},
            params[:bucketSize].to_f
        ]
      when 'day'
        interval = { '$dayOfYear' => '$'+date_field }
      when 'week'
        interval = { '$week' => '$'+date_field }
    end


    project = {
        '$project' => {
            'id' => 1,
            'status' => 1,
            date_field => 1,
            'latenessMilliseconds' => 1,
            'servicingPartnerId' => 1,
            'originatingPartnerId' => 1,
            'samplingPercentage' => 1,
            'interval' => interval
        }
    }

    match = { '$match' => {} }
    if by_status
      match['$match']['$or'] = [{'status' => 'complete'}, {'status' => 'rejected'}, {'status' => 'cancelled'}]
    end

    if params[:startDate] != nil or params[:endDate] != nil
      match['$match'] = { date_field => { } }
      if params[:startDate] != nil
        match['$match'][date_field]['$gte'] = Time.at(params[:startDate].to_f)
      end
      if params[:endDate] != nil
        match['$match'][date_field]['$lte'] = Time.at(params[:endDate].to_f)
      end
    end

    if roleUser == 'partner'
      if params[:servicingNetworkId] == nil and params[:originatingNetworkId] == nil and params[:localNetworkId] == nil
        params[:servicingNetworkId] = userId
        params[:originatingNetworkId] = userId
        params[:localNetworkId] = userId
      end
      if params[:servicingNetworkId] != nil
        params[:servicingNetworkId] = userId
      end
      if params[:originatingNetworkId] != nil
        params[:originatingNetworkId] = userId
      end
    end

    if (params[:servicingNetworkId] != nil or params[:originatingNetworkId] != nil) and
        (params[:servicingNetworkId] != 'all' and params[:originatingNetworkId] != 'all')

      if params[:servicingNetworkId] != nil and params[:originatingNetworkId] != nil
        if params[:localNetworkId] != nil
          match['$match']['$or'] = [
              {'servicingPartnerId' => params[:servicingNetworkId]},
              {'originatingPartnerId' => params[:originatingNetworkId]}
          ]
        else
          match['$match']['$and'] = [
              {'$or' => [
                  {'servicingPartnerId' => params[:servicingNetworkId]},
                  {'originatingPartnerId' => params[:originatingNetworkId]}
              ]
              },
              {'$or' => [
                  {'servicingPartnerId' => {'$ne' => params[:servicingNetworkId]}},
                  {'originatingPartnerId' => {'$ne' => params[:originatingNetworkId]}}
              ]}
          ]
        end
      elsif params[:servicingNetworkId] != nil
        if params[:localNetworkId] != nil
          match['$match']['$or'] = [
              {'servicingPartnerId' => params[:servicingNetworkId]},
              {'$and' => [
                  {'servicingPartnerId' => params[:servicingNetworkId]},
                  {'originatingPartnerId' => params[:servicingNetworkId]}
              ]
              }
          ]
        else
          match['$match']['$and'] = [
              {'servicingPartnerId' => params[:servicingNetworkId]},
              'originatingPartnerId' => {'$ne' => params[:servicingNetworkId]}
          ]
        end
      elsif params[:originatingNetworkId] != nil
        if params[:localNetworkId] != nil
          match['$match']['$or'] = [
              {'originatingPartnerId' => params[:originatingNetworkId]},
              {'$and' => [
                  {'servicingPartnerId' => params[:originatingNetworkId]},
                  {'originatingPartnerId' => params[:originatingNetworkId]}
              ]}
          ]
        else
          match['$match']['$and'] = [
              {'originatingPartnerId' => params[:originatingNetworkId]},
              {'servicingPartnerId' => {'$ne' => params[:originatingNetworkId]}}
          ]
        end
      end
    else
      if params[:localNetworkId] == 'all' and params[:servicingNetworkId] == nil and params[:originatingNetworkId] == nil
        project['$project']['isLocal'] = { '$eq' => [ '$servicingPartnerId', '$originatingPartnerId' ] }
        match['$match']['isLocal'] = true
      else
        if params[:localNetworkId] != nil and params[:localNetworkId] != 'all'
          match['$match']['$and'] = [
              {'servicingPartnerId' => params[:localNetworkId]},
              {'originatingPartnerId' => params[:localNetworkId]}
          ]
        end
      end
    end

    id = {}
    if by_status
      id['status'] = '$status'
    end
    id['interval'] = {
        '$subtract' => [
            '$interval',
            { '$mod' => [ '$interval', 1 ] }
        ]
    }

    group = {
        '$group' => {
          '_id' => id,
          'lateness' => { '$avg' => '$latenessMilliseconds'},
          'count' => { '$sum' => {'$divide' => [1, '$samplingPercentage']} }
        }
    }

    limit = {'$limit' => documents_limit}

    parameters = []
    if geo_near.length > 0
      parameters << geo_near
    else
      parameters << limit
    end
    parameters << project
    if match.length > 0
      parameters << match
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
    geo_near = { }
    documents_limit = 200000

    date_field = 'lastUpdate'
    if params[:by_creation_time] == 'true'
      date_field = 'creation'
    end

    group_by = nil
    if params[:group_by] == 'pickup'
      group_by = 'pickup'
    elsif params[:group_by] == 'dropoff'
      group_by = 'dropoff'
    end

    if params[:centerLat] != nil and params[:centerLng] != nil and params[:centerRadius] != nil
      geo_near['$geoNear'] = {
          'near' => [ params[:centerLng].to_f, params[:centerLat].to_f ],
          'distanceField' => 'dist.calculated',
          'maxDistance' => params[:centerRadius].to_f / 3959,
          'spherical' => true,
          'limit' => documents_limit
      }
    end


    project = {
        '$project' => {
            'id' => 1,
            'status' => 1,
            date_field => 1,
            'servicingPartnerId' => 1,
            'originatingPartnerId' => 1,
            'pickupLocation' => 1,
            'dropoffLocation' => 1,
            'passenger' => 1,
            'latenessMilliseconds' => 1
        }
    }

    match_status_or = {'$or' => [{'status' => 'complete'}, {'status' => 'rejected'}, {'status' => 'cancelled'}] }
    match = { '$match' => {} }
    if params[:startDate] != nil or params[:endDate] != nil
      match['$match'][date_field] = { }
      if params[:startDate] != nil
        match['$match'][date_field]['$gte'] = Time.at(params[:startDate].to_f)
      end
      if params[:endDate] != nil
        match['$match'][date_field]['$lte'] = Time.at(params[:endDate].to_f)
      end
    end

    if roleUser == 'partner'
      if params[:servicingNetworkId] == nil and params[:originatingNetworkId] == nil and params[:localNetworkId] == nil
        params[:servicingNetworkId] = userId
        params[:originatingNetworkId] = userId
        params[:localNetworkId] = userId
      end
      if params[:servicingNetworkId] != nil
        params[:servicingNetworkId] = userId
      end
      if params[:originatingNetworkId] != nil
        params[:originatingNetworkId] = userId
      end
      if params[:localNetworkId] != nil
        params[:localNetworkId] = userId
      end
    end

    if (params[:servicingNetworkId] != nil or params[:originatingNetworkId] != nil) and
        (params[:servicingNetworkId] != 'all' and params[:originatingNetworkId] != 'all')

      if params[:servicingNetworkId] != nil and params[:originatingNetworkId] != nil
        if params[:localNetworkId] != nil
          match['$match']['$and'] = [
              { '$or' => [
                {'servicingPartnerId' => params[:servicingNetworkId]},
                {'originatingPartnerId' => params[:originatingNetworkId]}
              ]},
              match_status_or
          ]
        else
          match['$match']['$and'] = [
              {'$or' => [
                  {'servicingPartnerId' => params[:servicingNetworkId]},
                  {'originatingPartnerId' => params[:originatingNetworkId]}
              ]
              },
              {'$or' => [
                  {'servicingPartnerId' => {'$ne' => params[:servicingNetworkId]}},
                  {'originatingPartnerId' => {'$ne' => params[:originatingNetworkId]}}
              ]},
              match_status_or
          ]
        end
      elsif params[:servicingNetworkId] != nil
        if params[:localNetworkId] != nil
          match['$match']['$and'] = [
                {'servicingPartnerId' => params[:servicingNetworkId]},
                {'$and' => [
                    {'servicingPartnerId' => params[:servicingNetworkId]},
                    {'originatingPartnerId' => params[:servicingNetworkId]}
                ]},
                match_status_or
          ]
        else
          match['$match']['$and'] = [
              {'servicingPartnerId' => params[:servicingNetworkId]},
              {'originatingPartnerId' => {'$ne' => params[:servicingNetworkId]}},
              match_status_or
          ]
        end
      elsif params[:originatingNetworkId] != nil
        if params[:localNetworkId] != nil
          match['$match']['$and'] = [
              {'originatingPartnerId' => params[:originatingNetworkId]},
              {'$and' => [
                  {'servicingPartnerId' => params[:originatingNetworkId]},
                  {'originatingPartnerId' => params[:originatingNetworkId]}
              ]},
              match_status_or
          ]
        else
          match['$match']['$and'] = [
              {'originatingPartnerId' => params[:originatingNetworkId]},
              {'servicingPartnerId' => {'$ne' => params[:originatingNetworkId]}},
              match_status_or
          ]
        end
      end
    else
      match['$match']['$or'] = match_status_or['$or']
      if params[:localNetworkId] == 'all' and params[:servicingNetworkId] == nil and params[:originatingNetworkId] == nil
        project['$project']['isLocal'] = { '$eq' => [ '$servicingPartnerId', '$originatingPartnerId' ] }
        match['$match']['isLocal'] = true
      else
        if params[:localNetworkId] != nil and params[:localNetworkId] != 'all'
          match['$match']['$and'] = [
              {'servicingPartnerId' => params[:localNetworkId]},
              {'originatingPartnerId' => params[:localNetworkId]}
          ]
        end
      end
    end

    limit = {'$limit' => documents_limit}

    group = {}
    if group_by != nil
      id = {'status' => '$status'}
      if group_by == 'dropoff'
        id['location'] = '$dropoffLocation'
      else
        id['location'] = '$pickupLocation'
      end
      group = {
          '$group' => {
              '_id' => id,
              'lateness' => { '$avg' => '$latenessMilliseconds'},
              'count' => { '$sum' => 1 }
          }
      }
    end

    parameters = []
    if geo_near.length > 0
      parameters << geo_near
    else
      parameters << limit
    end
    parameters << project
    if match.length > 0
      parameters << match
    end
    if group.length > 0
      parameters << group
    end

    res = Trip.collection.aggregate(parameters)

    puts parameters
    puts 'Results count: ' + res.length.to_s
    respond_to do |format|
      format.json { render text: res.to_json }
    end
  end

end
