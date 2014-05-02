namespace :setup do

  desc "Upload database.yml file."
  task :upload_yml do
    on roles(:app) do
      execute "mkdir -p #{shared_path}/config"
      upload! StringIO.new(File.read("config/database.yml")), "#{shared_path}/config/database.yml"
      upload! StringIO.new(File.read("config/nginx.conf")), "#{shared_path}/config/database.yml"
      upload! StringIO.new(File.read("config/unicorn.rb")), "#{shared_path}/config/database.yml"
      upload! StringIO.new(File.read("config/unicorn_init.sh")), "#{shared_path}/config/database.yml"
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

end