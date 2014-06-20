require 'spec_helper'

describe "users/index" do
  before(:each) do
    assign(:users, [
      stub_model(User,
        :ClientId => "Client",
        :ClientSecret => "Client Secret",
        :UserName => "User Name",
        :password_digest => "Password Digest",
        :Email => "Email",
        :AccessToken => "Access Token",
        :RefreshToken => "Refresh Token",
        :PartnerName => "Partner Name",
        :CallbackUrl => "Callback Url",
        :TripThruAccessToken => "Trip Thru Access Token",
        :Role => "Role",
        :remember_token => "Remember Token"
      ),
      stub_model(User,
        :ClientId => "Client",
        :ClientSecret => "Client Secret",
        :UserName => "User Name",
        :password_digest => "Password Digest",
        :Email => "Email",
        :AccessToken => "Access Token",
        :RefreshToken => "Refresh Token",
        :PartnerName => "Partner Name",
        :CallbackUrl => "Callback Url",
        :TripThruAccessToken => "Trip Thru Access Token",
        :Role => "Role",
        :remember_token => "Remember Token"
      )
    ])
  end

  it "renders a list of users" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => "Client".to_s, :count => 2
    assert_select "tr>td", :text => "Client Secret".to_s, :count => 2
    assert_select "tr>td", :text => "User Name".to_s, :count => 2
    assert_select "tr>td", :text => "Password Digest".to_s, :count => 2
    assert_select "tr>td", :text => "Email".to_s, :count => 2
    assert_select "tr>td", :text => "Access Token".to_s, :count => 2
    assert_select "tr>td", :text => "Refresh Token".to_s, :count => 2
    assert_select "tr>td", :text => "Partner Name".to_s, :count => 2
    assert_select "tr>td", :text => "Callback Url".to_s, :count => 2
    assert_select "tr>td", :text => "Trip Thru Access Token".to_s, :count => 2
    assert_select "tr>td", :text => "Role".to_s, :count => 2
    assert_select "tr>td", :text => "Remember Token".to_s, :count => 2
  end
end
