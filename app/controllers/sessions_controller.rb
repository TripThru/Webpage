class SessionsController < ApplicationController
  def new
  end

  def create
    username = params[:session][:username].downcase
    password = params[:session][:password]
    user_login = User.where(UserName: username).first
    passwordSalt = BCrypt::Engine.hash_secret password, user_login.password_digest.scan(/.{1,29}/)[0]
    puts '##############################'
    puts passwordSalt
      if !user_login.nil? and passwordSalt == user_login.password_digest
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
