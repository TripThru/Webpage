# config valid only for Capistrano 3.1
lock '3.1.0'

set :application, "tripthru"
set :repo_url, "https://github.com/TripThru/Gateway.git"

set :deploy_to, "/var/www/#{fetch(:application}"
set :deploy_user, "deploy"

set :rbenv_type, :user # or :system, depends on your rbenv setup
set :rbenv_ruby, "2.1.1"
set :rbenv_prefix, "RBENV_ROOT=#{fetch(:rbenv_path)} RBENV_VERSION=#{fetch(:rbenv_ruby)} #{fetch(:rbenv_path)}/bin/rbenv exec"
set :rbenv_map_bins, %w{rake gem bundle ruby rails}
set :rbenv_roles, :all # default value

set :linked_files, %w{config/database.yml}
set :linked_files, %w{config/nginx.conf}
set :linked_files, %w{config/unicorn.rb}

set :linked_dirs, %w{bin log tmp/pids tmp/cache tmp/sockets vendor/bundle public/system}

set :keep_releases, 5
