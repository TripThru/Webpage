# config valid only for Capistrano 3.1
lock '3.1.0'


desc "Upload database.yml file."
task :upload_yml do
on roles(:app) do
  execute "mkdir -p #{shared_path}/config"
  upload! StringIO.new(File.read("config/database.yml")), "#{shared_path}/config/database.yml"
end
end

desc "Upload nginx.conf file."
task :upload_nginx do
on roles(:app) do
  execute "mkdir -p #{shared_path}/config"
  upload! StringIO.new(File.read("config/nginx.conf")), "#{shared_path}/config/nginx.conf"
end
end

desc "Upload unicorn.rb file."
task :upload_unicorn do
on roles(:app) do
  execute "mkdir -p #{shared_path}/config"
  upload! StringIO.new(File.read("config/unicorn.rb")), "#{shared_path}/config/unicorn.rb"
end
end

desc "Upload unicorn_init file."
task :upload_unicorn_init do
on roles(:app) do
  execute "mkdir -p #{shared_path}/config"
  upload! StringIO.new(File.read("config/unicorn_init.sh")), "#{shared_path}/config/unicorn_init.sh"
end
end

desc "Symlinks config files for Nginx and Unicorn."
task :symlink_config do
on roles(:app) do
  execute "ln -nfs #{current_path}/config/nginx.conf /etc/nginx/sites-enabled/#{fetch(:application)}"
  execute "ln -nfs #{current_path}/config/nginx.conf /etc/nginx/sites-available/#{fetch(:application)}"
  execute "ln -nfs #{current_path}/config/unicorn_init.sh /etc/init.d/unicorn_#{fetch(:application)}"
end
end

set :application, "tripthru"
set :deploy_to, "/var/www/#{fetch(:application)}"
set :deploy_via, :remote_cache
set :use_sudo, false
set :ssh_options, {:forward_agent => true}

set :scm, "git"
set :repo_url, "git@github.com:TripThru/Webpage.git"
set :branch, "master"

set :rbenv_type, :user # or :system, depends on your rbenv setup
set :rbenv_ruby, "2.1.1"
set :rbenv_prefix, "RBENV_ROOT=#{fetch(:rbenv_path)} RBENV_VERSION=#{fetch(:rbenv_ruby)} #{fetch(:rbenv_path)}/bin/rbenv exec"
set :rbenv_map_bins, %w{rake gem bundle ruby rails}
set :rbenv_roles, :all # default value

set :linked_files, %w{config/database.yml}
set :linked_files, %w{config/nginx.conf}
set :linked_files, %w{config/unicorn.rb}
set :linked_files, %w{config/unicorn_init.sh}

set :linked_dirs, %w{bin log tmp/pids tmp/cache tmp/sockets vendor/bundle public/system}

set :keep_releases, 5
