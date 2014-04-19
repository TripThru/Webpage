require 'spec_helper'

describe "Static pages" do

  describe "Home page" do

    it "should have the content 'TripThru'" do
      visit '/static_pages/home'
      expect(page).to have_title('TripThru | Home')
    end
  end
end