require 'spec_helper'

describe "users/edit" do
  before(:each) do
    @user = assign(:user, stub_model(User,
      :ClientId => "MyString",
      :ClientSecret => "MyString",
      :UserName => "MyString",
      :password_digest => "MyString",
      :Email => "MyString",
      :AccessToken => "MyString",
      :RefreshToken => "MyString",
      :PartnerName => "MyString",
      :CallbackUrl => "MyString",
      :TripThruAccessToken => "MyString",
      :Role => "MyString",
      :remember_token => "MyString"
    ))
  end

  it "renders the edit user form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", user_path(@user), "post" do
      assert_select "input#user_ClientId[name=?]", "user[ClientId]"
      assert_select "input#user_ClientSecret[name=?]", "user[ClientSecret]"
      assert_select "input#user_UserName[name=?]", "user[UserName]"
      assert_select "input#user_password_digest[name=?]", "user[password_digest]"
      assert_select "input#user_Email[name=?]", "user[Email]"
      assert_select "input#user_AccessToken[name=?]", "user[AccessToken]"
      assert_select "input#user_RefreshToken[name=?]", "user[RefreshToken]"
      assert_select "input#user_PartnerName[name=?]", "user[PartnerName]"
      assert_select "input#user_CallbackUrl[name=?]", "user[CallbackUrl]"
      assert_select "input#user_TripThruAccessToken[name=?]", "user[TripThruAccessToken]"
      assert_select "input#user_Role[name=?]", "user[Role]"
      assert_select "input#user_remember_token[name=?]", "user[remember_token]"
    end
  end
end
