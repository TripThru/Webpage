class StaticPagesController < ApplicationController
  def home
  end
  
  def faq
  end

  def about
  end

  def signup
    email = params[:email]
    SignupMailer.signup(email).deliver
    redirect_to static_pages_home_path
  end
end
