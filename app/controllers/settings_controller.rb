class SettingsController < ApplicationController
  layout 'developer'

  def index
  end

  def new
    if roleUser == 'admin'
      @user = User.new
    else
      redirect_to new_session_path
    end
    render :partial => 'new', :locals => {:user => User.new, :edit => false}
  end

  def saveUser
    if roleUser == 'admin'
      user = User.new(name: params[:user][:name].downcase, full_name: params[:user][:full_name], password_digest: BCrypt::Password.create(params[:user][:password_digest]), email: params[:user][:email].downcase, role: params[:user][:role])
      user.client_id = params[:user][:name].downcase + '@tripthru.com'
      o = [('a'..'z'), ('A'..'Z')].map { |i| i.to_a }.flatten
      c = (0...50).map { o[rand(o.length)] }.join
      user.token = c
      user.save
      if user.valid?
        redirect_to settings_users_path
      else
        redirect_to settings_new_path
      end
    else
      redirect_to session_path
    end

  end

  def users
    if roleUser == 'admin'
      @users = User.all
    else
      redirect_to new_session_path
    end
  end

  def edit
    if roleUser == 'admin'
      user = User.find(params[:id])
      render :partial => 'new', :locals => {:user => user, :edit => true}
    else
      redirect_to session_path
    end
  end

  def update
    if roleUser == 'admin'
      name = params[:user][:name]
      user = User.where(name: name).first
      user.password_digest = BCrypt::Password.create(params[:user][:password_digest])
      user.full_name = params[:user][:full_name]
      user.email = params[:user][:email]
      user.role = params[:user][:role]
      user.save
      redirect_to settings_users_path
    else
      redirect_to session_path
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
