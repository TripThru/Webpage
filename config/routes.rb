Rails.application.routes.draw do

  get 'developer', to: 'developer#show'
  get 'developer/dashboard', to: 'developer#dashboard'
  get 'developer/settings', to: 'developer#settings'
  get 'developer/statistics', to: 'developer#statistics'
  get 'developer/api', to: 'developer#api'
  get 'developer/networks', to: 'developer#networks'
  get 'developer/money', to: 'developer#money'
  get 'developer/report', to: 'developer#report'

  root 'static_pages#home'
  get '/home', to: 'static_pages#home'
  get '/about', to: 'static_pages#about'
  get '/faq', to: 'static_pages#faq'
  post '/signup', to: 'static_pages#signup'

  get 'developer/new'
  get 'developer/edit'
  get 'developer/users'
  get 'developer/map'
  post 'developer/saveUserEdit'
  post 'developer/saveUser'
  delete 'developer/destroy'

  get 'settings/new'
  get 'settings/edit'
  get 'settings/users'
  get 'settings/map'
  post 'settings/saveUserEdit'
  post 'settings/saveUser'
  delete 'settings/destroy'

  resources :sessions, only: [:new, :create, :destroy]
  get '/signin',  to: 'sessions#new'
  delete '/signout', to: 'sessions#destroy'
  resources :settings

  resources :tripthru, only: []
  get '/trips_count', to: 'tripthru#trips_count'
  get '/trips_list',  to: 'tripthru#trips_list'
  get '/trips_invoice', to: 'tripthru#trips_invoice'
  get '/invoice_summary', to: 'tripthru#invoice_summary'
  get '/user_balance', to: 'tripthru#user_balance'
  get '/trip_info', to: 'tripthru#trip_info'
  get '/networks', to: 'tripthru#networks'
  post '/partnership_rules', to:'tripthru#update_partnership_rules'
  get '/partnerships', to: 'tripthru#get_partnerships'
  get '/partner_details', to: 'tripthru#get_partner_details'
  get '/user_transactions', to: 'tripthru#user_transactions'
  get '/current_balance', to: 'tripthru#current_balance'
  get '/currency_rates', to: 'tripthru#currency_rates'
  get '/aggregated_detail', to: 'tripthru#aggregated_detail'
  get '/aggregated_total', to: 'tripthru#aggregated_total'

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
