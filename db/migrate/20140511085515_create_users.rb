class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :ClientId
      t.string :ClientSecret
      t.string :UserName
      t.string :password_digest
      t.string :Email
      t.string :AccessToken
      t.string :RefreshToken
      t.string :PartnerName
      t.string :CallbackUrl
      t.string :TripThruAccessToken
      t.string :Role
      t.string :remember_token

      t.timestamps
    end
  end
end
