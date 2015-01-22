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

    match_origin_by = 'originatingPartnerId'
    match_service_by = 'servicingPartnerId'
    origin_id = params[:originatingNetworkId]
    service_id = params[:servicingNetworkId]
    local_id = params[:localNetworkId]

    if params[:originatingFleetId] != nil and params[:originatingFleetId] != 'all'
      match_origin_by = 'originatingFleetId'
      origin_id = params[:originatingFleetId]
    end
    if params[:servicingFleetId] != nil and params[:servicingFleetId] != 'all'
      match_service_by = 'servicingFleetId'
      service_id = params[:servicingFleetId]
    end
    if params[:localFleetId] != nil and params[:localFleetId] != 'all'
      local_id = params[:localFleetId]
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
            'servicingFleetId' => 1,
            'originatingFleetId' => 1,
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
      if service_id == nil and origin_id == nil and local_id == nil
        service_id = userId
        origin_id = userId
        local_id = userId
      end
      if service_id != nil
        service_id = userId
      end
      if origin_id != nil
        origin_id = userId
      end
    end

    if (service_id != nil or origin_id != nil) and
        (service_id != 'all' and origin_id != 'all')

      if service_id != nil and origin_id != nil
        if params[:localNetworkId] != nil
          match['$match']['$or'] = [
              {match_service_by => service_id},
              {match_origin_by => origin_id}
          ]
        else
          match['$match']['$and'] = [
              {'$or' => [
                  {match_service_by => service_id},
                  {match_origin_by => origin_id}
              ]
              },
              {'$or' => [
                  {match_service_by => {'$ne' => service_id}},
                  {match_origin_by => {'$ne' => origin_id}}
              ]}
          ]
        end
      elsif service_id != nil
        if params[:localNetworkId] != nil
          match['$match']['$or'] = [
              {match_service_by => service_id},
              {'$and' => [
                  {match_service_by => service_id},
                  {match_origin_by => service_id}
              ]
              }
          ]
        else
          match['$match']['$and'] = [
              {match_service_by => service_id},
              match_origin_by => {'$ne' => service_id}
          ]
        end
      elsif origin_id != nil
        if params[:localNetworkId] != nil
          match['$match']['$or'] = [
              {match_origin_by => origin_id},
              {'$and' => [
                  {match_service_by => origin_id},
                  {match_origin_by => origin_id}
              ]}
          ]
        else
          match['$match']['$and'] = [
              {match_origin_by => origin_id},
              {match_service_by => {'$ne' => origin_id}}
          ]
        end
      end
    else
      if local_id == 'all' and service_id == nil and origin_id == nil
        project['$project']['isLocal'] = { '$eq' => [ '$' + match_service_by, '$' + match_origin_by ] }
        match['$match']['isLocal'] = true
      else
        if local_id != nil and local_id != 'all'
          match['$match']['$and'] = [
              {match_service_by => local_id},
              {match_origin_by => local_id}
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

    match_origin_by = 'originatingPartnerId'
    match_service_by = 'servicingPartnerId'
    origin_id = params[:originatingNetworkId]
    service_id = params[:servicingNetworkId]
    local_id = params[:localNetworkId]

    if params[:originatingFleetId] != nil and params[:originatingFleetId] != 'all'
      match_origin_by = 'originatingFleetId'
      origin_id = params[:originatingFleetId]
    end
    if params[:servicingFleetId] != nil and params[:servicingFleetId] != 'all'
      match_service_by = 'servicingFleetId'
      service_id = params[:servicingFleetId]
    end
    if params[:localFleetId] != nil and params[:localFleetId] != 'all'
      local_id = params[:localFleetId]
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
            'servicingFleetId' => 1,
            'originatingFleetId' => 1,
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
      if service_id == nil and origin_id == nil and local_id == nil
        service_id = userId
        origin_id = userId
        local_id = userId
      end
      if service_id != nil
        service_id = userId
      end
      if origin_id != nil
        origin_id = userId
      end
    end

    if (service_id != nil or origin_id != nil) and
        (service_id != 'all' and origin_id != 'all')

      if service_id != nil and origin_id != nil
        if params[:localNetworkId] != nil
          match['$match']['$or'] = [
              {match_service_by => service_id},
              {match_origin_by => origin_id}
          ]
        else
          match['$match']['$and'] = [
              {'$or' => [
                  {match_service_by => service_id},
                  {match_origin_by => origin_id}
              ]
              },
              {'$or' => [
                  {match_service_by => {'$ne' => service_id}},
                  {match_origin_by => {'$ne' => origin_id}}
              ]}
          ]
        end
      elsif service_id != nil
        if params[:localNetworkId] != nil
          match['$match']['$or'] = [
              {match_service_by => service_id},
              {'$and' => [
                  {match_service_by => service_id},
                  {match_origin_by => service_id}
              ]
              }
          ]
        else
          match['$match']['$and'] = [
              {match_service_by => service_id},
              match_origin_by => {'$ne' => service_id}
          ]
        end
      elsif origin_id != nil
        if params[:localNetworkId] != nil
          match['$match']['$or'] = [
              {match_origin_by => origin_id},
              {'$and' => [
                  {match_service_by => origin_id},
                  {match_origin_by => origin_id}
              ]}
          ]
        else
          match['$match']['$and'] = [
              {match_origin_by => origin_id},
              {match_service_by => {'$ne' => origin_id}}
          ]
        end
      end
    else
      if local_id == 'all' and service_id == nil and origin_id == nil
        project['$project']['isLocal'] = { '$eq' => [ '$' + match_service_by, '$' + match_origin_by ] }
        match['$match']['isLocal'] = true
      else
        if local_id != nil and local_id != 'all'
          match['$match']['$and'] = [
              {match_service_by => local_id},
              {match_origin_by => local_id}
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

  def trips_stats
    match_origin_by = 'originatingPartnerId'
    match_service_by = 'servicingPartnerId'
    origin_id = params[:originatingNetworkId]
    service_id = params[:servicingNetworkId]
    local_id = params[:localNetworkId]

    if params[:originatingFleetId] != nil and params[:originatingFleetId] != 'all'
      match_origin_by = 'originatingFleetId'
      origin_id = params[:originatingFleetId]
    end
    if params[:servicingFleetId] != nil and params[:servicingFleetId] != 'all'
      match_service_by = 'servicingFleetId'
      service_id = params[:servicingFleetId]
    end
    if params[:localFleetId] != nil and params[:localFleetId] != 'all'
      local_id = params[:localFleetId]
    end

    project = {
        '$project' => {
            'id' => 1,
            'status' => 1,
            'servicingPartnerId' => 1,
            'originatingPartnerId' => 1,
            'servicingFleetId' => 1,
            'originatingFleetId' => 1,
            'samplingPercentage' => 1
        }
    }

    if roleUser == 'partner'
      if service_id == nil and origin_id == nil and local_id == nil
        service_id = userId
        origin_id = userId
        local_id = userId
      end
      if service_id != nil
        service_id = userId
      end
      if origin_id != nil
        origin_id = userId
      end
    end

    match = { '$match' => {} }
    if (service_id != nil or origin_id != nil) and
        (service_id != 'all' and origin_id != 'all')

      if service_id != nil and origin_id != nil
        if params[:localNetworkId] != nil
          match['$match']['$or'] = [
              {match_service_by => service_id},
              {match_origin_by => origin_id}
          ]
        else
          match['$match']['$and'] = [
              {'$or' => [
                  {match_service_by => service_id},
                  {match_origin_by => origin_id}
              ]
              },
              {'$or' => [
                  {match_service_by => {'$ne' => service_id}},
                  {match_origin_by => {'$ne' => origin_id}}
              ]}
          ]
        end
      elsif service_id != nil
        if params[:localNetworkId] != nil
          match['$match']['$or'] = [
              {match_service_by => service_id},
              {'$and' => [
                  {match_service_by => service_id},
                  {match_origin_by => service_id}
              ]
              }
          ]
        else
          match['$match']['$and'] = [
              {match_service_by => service_id},
              match_origin_by => {'$ne' => service_id}
          ]
        end
      elsif origin_id != nil
        if params[:localNetworkId] != nil
          match['$match']['$or'] = [
              {match_origin_by => origin_id},
              {'$and' => [
                  {match_service_by => origin_id},
                  {match_origin_by => origin_id}
              ]}
          ]
        else
          match['$match']['$and'] = [
              {match_origin_by => origin_id},
              {match_service_by => {'$ne' => origin_id}}
          ]
        end
      end
    else
      if local_id == 'all' and service_id == nil and origin_id == nil
        project['$project']['isLocal'] = { '$eq' => [ '$' + match_service_by, '$' + match_origin_by ] }
        match['$match']['isLocal'] = true
      else
        if local_id != nil and local_id != 'all'
          match['$match']['$and'] = [
              {match_service_by => local_id},
              {match_origin_by => local_id}
          ]
        end
      end
    end

    group = {
        '$group' => {
            '_id' => { 'status' => '$status' },
            'count' => { '$sum' => 1 }
        }
    }

    parameters = []
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

end
