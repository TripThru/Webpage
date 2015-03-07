class User < ActiveRecord::Base
  include ActiveModel::SecurePassword
  has_many :products, foreign_key: 'user_id', primary_key: 'id'
  has_many :trips, foreign_key: 'user_id', primary_key: 'id'
  has_many :trips, foreign_key: 'servicing_network_id', primary_key: 'id'
  has_many :user_transactions, foreign_key: 'user_id', primary_key: 'id'

  validates(:name, :presence => true)
  has_secure_password
  validates :password_digest, length: { minimum: 6 }, :presence => true
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
  validates :email, presence: true, format: { with: VALID_EMAIL_REGEX }

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
