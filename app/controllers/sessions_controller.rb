class SessionsController < ApplicationController
  def new
  end

  def create
    username = params[:session][:username].downcase
    password = params[:session][:password]
    user_login = User.where(name: username).first
    password_salt = ''
    if user_login != nil and username != nil and password != nil and password != ''
      password_salt = BCrypt::Engine.hash_secret password, user_login.password_digest.scan(/.{1,29}/)[0]
    end
    if password_salt != '' and password_salt == user_login.password_digest
      sign_in user_login
      redirect_to developer_dashboard_path
    else
      @message = 'Invalid username/password combination'
      render 'new'
    end
  end
  def destroy
    sign_out
    redirect_to home_path
  end
end
