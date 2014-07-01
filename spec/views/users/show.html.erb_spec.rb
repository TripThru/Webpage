require 'spec_helper'

describe "users/show" do
  before(:each) do
    @user = assign(:user, stub_model(User,
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
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Client/)
    rendered.should match(/Client Secret/)
    rendered.should match(/User Name/)
    rendered.should match(/Password Digest/)
    rendered.should match(/Email/)
    rendered.should match(/Access Token/)
    rendered.should match(/Refresh Token/)
    rendered.should match(/Partner Name/)
    rendered.should match(/Callback Url/)
    rendered.should match(/Trip Thru Access Token/)
    rendered.should match(/Role/)
    rendered.should match(/Remember Token/)
  end
end
