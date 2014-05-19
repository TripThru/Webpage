class DeveloperController < ApplicationController
  layout 'developer'

  def show
    if userAccessToken
      redirect_to developer_dashboard_path
    else
      redirect_to signin_path
    end
  end

  def dashboard
    if userAccessToken
      render 'dashboard'
    else
      redirect_to signin_path
    end
  end

  def statistics
    if userAccessToken
      render 'statistics'
    else
      redirect_to signin_path
    end
  end

  def api
    if userAccessToken
      render 'api'
    else
      redirect_to signin_path
    end
  end

  def settings
    if userAccessToken
      render 'settings'
    else
      redirect_to signin_path
    end
  end
end
