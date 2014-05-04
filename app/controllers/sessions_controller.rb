class SessionsController < ApplicationController
  def new
  end

  def create
    username = params[:session][:username].downcase
    password = params[:session][:password]
    if username == 'tripthru' and password == 'optimize'
      session[:access_token] = 'jaosid1201231'
      redirect_to home_path
    else
      flash.now[:message] = 'Invalid username/password combination'
      render 'new'
    end
  end

  def destroy
    session[:access_token] = ''
    redirect_to home_path
  end
end
