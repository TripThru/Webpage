class TripthruController < ApplicationController
  skip_before_action :verify_authenticity_token

  def networks
    users = User.where(:role => 'network')
    response = []
    users.each do |user|
      u = {}
      u[:id] = user[:id]
      u[:client_id] = user[:client_id]
      u[:full_name] = user[:full_name]
      u[:must_accept_prescheduled] = user[:must_accept_prescheduled]
      u[:must_accept_ondemand] = user[:must_accept_ondemand]
      u[:must_accept_cash_payment] = user[:must_accept_cash_payment]
      u[:must_accept_account_payment] = user[:must_accept_account_payment]
      u[:must_accept_creditcard_payment] = user[:must_accept_creditcard_payment]
      u[:min_rating] = user[:min_rating]
      u[:routing_strategy] = user[:routing_strategy]
      u[:products] = Product.where(:user_id => user[:id])
      response << u
    end

    respond_to do |format|
      format.json { render text: response.to_json }
    end
  end

  def get_partnerships
    response = {
        :network_partnerships => NetworkPartnerships.where(user_id: userId),
        :product_partnerships => ProductPartnerships.where(user_id: userId)
    }
    respond_to do |format|
      format.json { render text: response.to_json }
    end
  end

  def update_partnership_rules
    user = User.find_by(id: userId)
    user.update(
        must_accept_prescheduled: params[:must_accept_prescheduled],
        must_accept_ondemand: params[:must_accept_ondemand],
        must_accept_cash_payment: params[:must_accept_cash_payment],
        must_accept_account_payment: params[:must_accept_account_payment],
        must_accept_creditcard_payment: params[:must_accept_creditcard_payment],
        min_rating: params[:min_rating],
        routing_strategy: params[:routing_strategy]
    )
    NetworkPartnerships.where(user_id: userId).delete_all
    ProductPartnerships.where(user_id: userId).delete_all
    if params[:partner_network_ids] != nil and params[:partner_network_ids].size > 0
      network_partnerships = []
      params[:partner_network_ids].each { |id| network_partnerships << NetworkPartnerships.create(user_id: userId, network_id: id) }
    end
    if params[:partner_product_ids] != nil and params[:partner_product_ids].size > 0
      product_partnerships = []
      params[:partner_product_ids].each { |id| product_partnerships << ProductPartnerships.create(user_id: userId, product_id: id) }
    end
    respond_to do |format|
      format.json { render text: '{"result_code": 200}' }
    end
  end

  def get_partner_details
    query = get_query_from_params(params)
    res = Trip.select('service_level, count(*) as count')
              .where('service_level >= 0')
              .where(servicing_network_id: params[:servicing_network_id])
              .where("created_at BETWEEN '#{query[:start_date]}' AND '#{query[:end_date]}'")
              .group(:service_level)
    respond_to do |format|
      format.json { render text: res.to_json }
    end
  end

  def trips_list
    query = get_query_from_params(params)
    if query[:location_field] != nil
      fields = "status, count(*) as count, AVG(lateness_milliseconds) as lateness_average
                , #{query[:location_field]}_lat as location_lat, #{query[:location_field]}_lng as location_lng,
                  concat(#{query[:location_field]}_lat, #{query[:location_field]}_lng) as location_id"
    else
      fields = 'trips.*,
                (SELECT amount from trip_payment where trips.id = trip_payment.trip_id) as fare,
                (SELECT client_id from users where trips.user_id = users.id) as user_client_id,
                (SELECT client_id from products where trips.product_id = products.id) as product_client_id,
                (SELECT client_id from users where trips.servicing_network_id = users.id) as servicing_network_client_id,
                (SELECT client_id from products where trips.servicing_product_id = products.id) as servicing_product_client_id,
                driver_name,
                customer_name'
    end

    res = build_common_trip_query(fields, query)
    if query[:location_field] != nil
      res = res.group('`location_id`').group(:status)
    end
    respond_to do |format|
      format.json { render text: res.to_json }
    end
  end

  def trips_count
    query = get_query_from_params(params)
    fields = 'COUNT(*) AS count, AVG(lateness_milliseconds) as lateness_average'
    interval = nil
    if query[:by_status]
      fields += ', status'
    end
    if query[:interval]
      interval = get_interval_query(query[:interval], query[:date_field], query[:bucket_size])
      fields += ", #{query[:date_field]}  AS `interval`"
    end

    res = build_common_trip_query(fields, query)
    if query[:by_status]
      res = res.group(:status)
    end
    if query[:interval]
      res = res.group(interval).order(interval)
    end

    respond_to do |format|
      format.json { render text: res.to_json }
    end
  end

  def invoice_summary
    query = get_query_from_params(params)
    id = if roleUser == 'network' then
           userId
         else
           query[:origin_id] != nil ? query[:origin_id] : query[:service_id]
         end
    requested_field = query[:origin_id] != nil ? 'trips.user_id' : 'trips.servicing_network_id'
    group_by = query[:interval] == 'day' ? 'dayofyear' : 'month'
    date_field = "convert_tz(requested_at, 'GMT', '#{query[:tz]}')"
    res = TripPayment.select("SUM(amount) as total, concat(year(#{date_field}),'-',lpad(month(#{date_field}), 2, '0'),'-',lpad(day(#{date_field}), 2, '0')) as date_id")
    res = res.joins('inner join trips on trips.id = trip_payment.trip_id')
    res = res.where("#{requested_field} = #{id}")
    res = res.where("#{date_field} BETWEEN '#{query[:start_date]}' AND '#{query[:end_date]}'")
    res = res.group("#{group_by}(#{date_field})")
    respond_to do |format|
      format.json { render text: res.to_json }
    end
  end

  def user_balance
    query = get_query_from_params(params)
    id = if roleUser == 'network' then
           userId
         else
           query[:origin_id] != nil ? query[:origin_id] : query[:service_id]
         end
    date_field = "convert_tz(user_transactions.datetime, 'GMT', '#{query[:tz]}')"
    res = UserTransaction.select("available_balance, concat(year(#{date_field}),'-',lpad(month(#{date_field}), 2, '0'),'-01') as date_id")
    res = res.joins("INNER JOIN
                    (
                        SELECT  MIN(#{date_field}) datetime, concat(year(#{date_field}),'-',lpad(month(#{date_field}), 2, '0'),'-1') as date_id
                        FROM    user_transactions
                        GROUP   BY date_id
                    ) b")
    res = res.where('b.date_id = date_id')
    res = res.where(:user_id => id)
    respond_to do |format|
      format.json { render text: res.to_json }
    end
  end

  def trips_invoice
    query = get_query_from_params(params)
    fields = 'trips.duration_seconds, trips.distance, trips.service_level, trip_payment.amount'
    res = build_common_trip_query(fields, query)
    res = res.joins('INNER JOIN trip_payment ON trips.id = trip_payment.trip_id')
    res = res.where("trips.status like 'completed'")
    respond_to do |format|
      format.json { render text: res.to_json }
    end
  end

  def trip_info
    fields = 'trips.*,
              (SELECT amount from trip_payment where trips.id = trip_payment.trip_id) as fare,
              (SELECT client_id from users where trips.user_id = users.id) as user_client_id,
              (SELECT client_id from products where trips.product_id = products.id) as product_client_id,
              (SELECT client_id from users where trips.servicing_network_id = users.id) as servicing_network_client_id,
              (SELECT client_id from products where trips.servicing_product_id = products.id) as servicing_product_client_id,
              driver_name,
              customer_name'
    res = Trip.select(fields)
    if params[:id] != nil
      res = res.where(:id => params[:id])
    else
      res = res.where(:trip_id => params[:trip_id])
    end
    if roleUser == 'network'
      res = res.where("user_id = '#{userId}' OR servicing_network_id = '#{userId}' ")
    end
    locations = TripLocations.where(:trip_id => params[:id] != nil ? params[:id] : res[0].id)
    response = res[0]
    if response != nil
      response = response.attributes
      response[:location_updates] = locations
    end
    respond_to do |format|
      format.json { render text: response.to_json }
    end
  end

  private

  def get_interval_query(interval, date_field, bucket_size)
    case interval
      when 'second'
        return "unix_timestamp(#{date_field}) div (#{bucket_size})"
      when 'minute'
        return "unix_timestamp(#{date_field}) div (60*#{bucket_size})"
      when 'hour'
        return "year(#{date_field}), dayofyear(#{date_field}), hour(#{date_field})"
      when 'day'
        return "year(#{date_field}), dayofyear(#{date_field})"
      when 'week'
        return "year(#{date_field}), weekofyear(#{date_field})"
      else
        return ""
    end
  end

  def build_common_trip_query(select, query)
    res = Trip.select(select)
    if query[:local_id] != nil
      res = res.where(query[:match_origin_by] => query[:local_id]).where(query[:match_service_by] => query[:local_id])
    else
      where = ''
      if query[:origin_id] != nil
        where = "trips.#{query[:match_origin_by]} = #{query[:origin_id].to_s}"
      end
      if query[:service_id] != nil
        if query[:origin_id] != nil
          if roleUser == 'network' and query[:origin_id] != query[:service_id]
            where += ' AND '
          else
            where += ' OR '
          end
        end
        where += "trips.#{query[:match_service_by]} = #{query[:service_id].to_s}"
      end
      res = res.where(where)
    end
    if query[:start_date] != nil
      res = res.where("convert_tz(trips.#{query[:date_field]}, 'GMT', '#{query[:tz]}')  >=  '#{query[:start_date]}'")
    end
    if query[:end_date] != nil
      res = res.where("convert_tz(trips.#{query[:date_field]}, 'GMT', '#{query[:tz]}')  <=  '#{query[:end_date]}'")
    end
    if query[:status_type] != nil
      case query[:status_type]
        when 'new'
          res = res.where("trips.status = 'new' OR status = 'queued'")
        when 'completed'
          res = res.where("trips.status = 'completed' OR status = 'rejected' OR status = 'cancelled'")
        when 'active'
          res = res.where("trips.status = 'picked_up' OR status = 'en_route' OR status = 'accepted'")
      end
    elsif query[:status] != nil
      res = res.where(:status => query[:status])
    end
    if query[:limit] != nil
      res = res.limit(query[:limit])
    end

    return res
  end

  def get_query_from_params(params)
    query = {
      :by_status => false,
      :status_type => nil,
      :date_field => 'last_update',
      :match_origin_by => 'user_id',
      :match_service_by => 'servicing_network_id',
      :origin_id => params[:originating_network_id],
      :service_id => params[:servicing_network_id],
      :local_id => params[:local_network_id],
      :location_field => nil,
      :tz => params[:tz]
    }
    if params[:originating_network_id] == 'all'
      query[:origin_id] = roleUser == 'network' ? userId : nil
    elsif params[:originating_network_id] != nil
      query[:origin_id] = Integer(params[:originating_network_id])
    end
    if params[:servicing_network_id] == 'all'
      query[:service_id] = roleUser == 'network' ? userId : nil
    elsif params[:servicing_network_id] != nil
      query[:service_id] = Integer(params[:servicing_network_id])
    end
    if params[:local_id] != nil
      query[:local_id] = Integer(query[:local_id])
    end
    if params[:by_creation_time] == 'true'
      query[:date_field] = 'created_at'
    end
    if params[:by_status] != nil
      query[:by_status] = (params[:by_status] == 'true' ? true : false)
    end
    if params[:originating_product_id] != nil and params[:originating_product_id] != 'all'
      query[:match_origin_by] = 'product_id'
      query[:origin_id] = Integer(params[:originating_product_id])
    end
    if params[:servicing_product_id] != nil and params[:servicing_product_id] != 'all'
      query[:match_service_by] = 'servicing_product_id'
      query[:service_id] = Integer(params[:servicing_product_id])
    end
    if params[:local_product_id] != nil and params[:local_product_id] != 'all'
      query[:local_id] = Integer(params[:local_product_id])
    end
    '''
    if roleUser == network
      if query[:service_id] == nil and query[:origin_id] == nil and query[:local_id] == nil
        query[:service_id] = userId
        query[:origin_id] = userId
      elsif query[:local_id] != nil and query[:local_id] != userId and query[:service_id] == nil and query[:origin_id] == nil
        query[:local_id] = userId
      elsif query[:service_id] != nil and query[:origin_id] != nil and query[:service_id] != userId and query[:origin_id] != userId
        query[:service_id] = userId
        query[:origin_id] = userId
        query[:local_id] = nil
      elsif query[:service_id] != nil and query[:service_id] != userId and query[:origin_id] == nil
        query[:origin_id] = userId
      elsif query[:origin_id] != nil and query[:origin_id] != userId and query[:service_id] == nil
        query[:service_id] = userId
      end
    end
    '''
    if params[:start_date] != nil
      query[:start_date] = params[:start_date]
    end
    if params[:end_date] != nil
      query[:end_date] = params[:end_date]
    end
    if params[:start_date] != nil or params[:end_date] != nil
      if params[:interval] != nil
        query[:interval] = params[:interval]
      end
      if params[:bucket_size] != nil
        query[:bucket_size] = params[:bucket_size]
      end
    end
    if params[:center_radius] != nil and params[:center_lat] != nil and params[:center_lng] != nil
      query[:center] = {
          :radius => params[:center_radius],
          :lat => params[:center_lat],
          :lng => params[:center_lng]
      }
    end
    if params[:by_pickup_location] != nil
      if params[:by_pickup_location] == 'true'
        query[:location_field] = 'pickup_location'
      else
        query[:location_field] = 'dropoff_location'
      end
    end
    if params[:status_type] != nil
      query[:status_type] = params[:status_type]
    elsif params[:status] != nil
      query[:status] = params[:status]
    end
    if params[:limit] != nil
      query[:limit] = params[:limit]
    end

    return query
  end

end