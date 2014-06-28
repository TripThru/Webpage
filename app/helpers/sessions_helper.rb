module SessionsHelper
  def sign_in(user)
    remember_token = User.new_remember_token
    cookies.permanent[:remember_token] = remember_token
    user.update_attribute(:remember_token, User.digest(remember_token))
    Mongoid::Sessions.default.use 'per_req_db'
    self.current_user = user
  end
  def signed_in?
    !self.current_user.nil?
  end
  def roleUser
    if signed_in?
     return current_user.Role
    else
      return ''
    end
  end
  def user_Name
    if signed_in?
      return current_user.UserName
    else
      return ''
    end
  end
  def userAccessToken
    if signed_in?
      return current_user.AccessToken
    else
      return nil
    end
  end
  def userId
    if signed_in?
      return current_user.ClientId
    else
      return nil
    end
  end
  def current_user=(user)
    @current_user = user
  end
  def current_user
    remember_token = User.digest(cookies[:remember_token])
    @current_user ||= User.where(remember_token: remember_token).first
  end
  def sign_out
    current_user.update_attribute(:remember_token,
                                  User.digest(User.new_remember_token))
    cookies.delete(:remember_token)
    self.current_user = nil
  end
end