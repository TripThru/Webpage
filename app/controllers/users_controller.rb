class UsersController < ApplicationController
  layout 'developer'

  def index
  end

  def new
    if roleUser == 'Admin'
      @user = User.new
    else
      redirect_to new_session_path
    end
    render :partial => 'new', :locals => {:user => User.new, :edit => false}
  end

  def saveUser
    if roleUser == 'Admin'
      user = User.new(UserName: params[:user][:UserName].downcase, password_digest: BCrypt::Password.create(params[:user][:password_digest]), Email: params[:user][:Email].downcase, Role: params[:user][:Role])
      if user.Role == 'Partner'
        user.PartnerName=params[:user][:PartnerName]
        user.CallbackUrl=params[:user][:CallbackUrl]
        user.TripThruAccessToken=params[:user][:TripThruAccessToken]
      end
      o = [('a'..'z'), ('A'..'Z')].map { |i| i.to_a }.flatten
      c = (0...50).map { o[rand(o.length)] }.join
      user.RefreshToken=c
      o = [('a'..'z'), ('A'..'Z')].map { |i| i.to_a }.flatten
      c = (0...50).map { o[rand(o.length)] }.join
      user.AccessToken=c
      user.save
      if user.valid?
        redirect_to users_users_path
      else
        redirect_to users_new_path
      end
    else
      redirect_to session_path
    end

  end

  def users
    if roleUser == 'Admin'
      @users = User.all
    else
      redirect_to new_session_path
    end
  end

  def edit
    if roleUser == 'Admin'
      user = User.find(params[:id])
      render :partial => 'new', :locals => {:user => user, :edit => true}
    else
      redirect_to session_path
    end
  end

  def update
    if roleUser == 'Admin'
      user = User.find_by_UserName(params[:user][:UserName])
      user.password_digest = BCrypt::Password.create(params[:user][:password_digest])
      user.Email = params[:user][:Email]
      user.Role = params[:user][:Role]
      user.PartnerName = params[:user][:PartnerName]
      user.CallbackUrl = params[:user][:CallbackUrl]
      user.TripThruAccessToken = params[:user][:TripThruAccessToken]
      user.save
      redirect_to users_users_path
    else
      redirect_to session_path
    end

  end

  def destroy
    if roleUser == 'Admin'
      User.find(params[:id]).delete
      redirect_to users_users_path
    else
      redirect_to session_path
    end

  end
end