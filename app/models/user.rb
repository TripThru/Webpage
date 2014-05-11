class User < ActiveRecord::Base
  validates(:UserName, :presence => true)
  has_secure_password
  validates :password_digest, length: { minimum: 6 }, :presence => true
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
  validates :Email, presence: true, format: { with: VALID_EMAIL_REGEX }

  def User.new_remember_token
    SecureRandom.urlsafe_base64
  end

  def User.digest(token)
    Digest::SHA1.hexdigest(token.to_s)
  end

  private

  def create_remember_token
    self.remember_token = User.digest(User.new_remember_token)
  end
end
