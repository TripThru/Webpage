class DeveloperController < ApplicationController
  layout 'developer'

  def show
    if session[:access_token]
      redirect_to developer_dashboard_path
    else
      redirect_to signin_path
    end
  end

  def dashboard
    if session[:access_token]
      render 'dashboard'
    else
      redirect_to signin_path
    end
  end

  def statistics
    if session[:access_token]
      render 'statistics'
    else
      redirect_to signin_path
    end
  end

  def settings
    if session[:access_token]
      render 'settings'
    else
      redirect_to signin_path
    end
  end
end
