require 'spec_helper'

describe "Static pages" do

  describe "Home page" do

    it "should have the content 'TripThru | Home'" do
      visit '/static_pages/home'
      expect(page).to have_title('TripThru | Home')
    end
  end
end

describe "Static pages" do

  describe "Faq" do

    it "should have the content 'TripThru | Faq'" do
      visit '/static_pages/faq'
      expect(page).to have_title('TripThru | Faq')
    end
  end
end

describe "Static pages" do

  describe "About us" do

    it "should have the content 'TripThru | About us'" do
      visit '/static_pages/about'
      expect(page).to have_title('TripThru | About us')
    end
  end
end