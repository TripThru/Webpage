class SessionsController < ApplicationController
  def new
  end

  def create
    username = params[:session][:username].downcase
    password = params[:session][:password]
    user_login = User.find_by_UserName(username)
      if !user_login.nil? and user_login.authenticate(password)
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
