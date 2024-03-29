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
      if experimentalFeaturesEnabled
        render 'statistics'
      else
        redirect_to developer_dashboard_path
      end
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
      if experimentalFeaturesEnabled
        render 'settings'
      else
        redirect_to developer_dashboard_path
      end
    else
      redirect_to signin_path
    end
  end

  def networks
    if userAccessToken
      if experimentalFeaturesEnabled
        render 'networks'
      else
        redirect_to developer_dashboard_path
      end
    else
      redirect_to signin_path
    end
  end

  def money
    if userAccessToken
      if experimentalFeaturesEnabled
        render 'money'
      else
        redirect_to developer_dashboard_path
      end
    else
      redirect_to signin_path
    end
  end

  def report
    if userAccessToken
      if experimentalFeaturesEnabled
        render 'report'
      else
        redirect_to developer_dashboard_path
      end
    else
      redirect_to signin_path
    end
  end

  def users
    if roleUser == 'admin'
      @users = User.all
    else
      redirect_to new_session_path
    end
  end

  def destroy
    if roleUser == 'admin'
      User.find(params[:id]).delete
      redirect_to settings_users_path
    else
      redirect_to session_path
    end

  end
  def map
  end

end
