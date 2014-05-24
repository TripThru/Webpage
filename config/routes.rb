Rails.application.routes.draw do

  get 'developer', to: 'developer#show'
  get 'developer/dashboard', to: 'developer#dashboard'
  get 'developer/settings', to: 'developer#settings'
  get 'developer/statistics', to: 'developer#statistics'
  get 'developer/api', to: 'developer#api'
  get 'developer/partners', to: 'developer#partners'
  get 'developer/mapstatistics', to: 'developer#mapstatistics'
  get 'developer/money', to: 'developer#money'

  root 'static_pages#home'
  get '/home', to: 'static_pages#home'
  get '/about', to: 'static_pages#about'
  get '/faq', to: 'static_pages#faq'
  post '/signup', to: 'static_pages#signup'

  get 'users/new'
  get 'users/edit'
  get 'users/users'
  post 'users/saveUserEdit'
  post 'users/saveUser'
  delete 'users/destroy'

  resources :sessions, only: [:new, :create, :destroy]
  get '/signin',  to: 'sessions#new'
  delete '/signout', to: 'sessions#destroy'
  resources :users

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
