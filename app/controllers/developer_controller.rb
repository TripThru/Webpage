class DeveloperController < ApplicationController
  layout 'developer'

  def show
    if session[:access_token]
      render 'show'
    else
      redirect_to signin_path
    end
  end
end
