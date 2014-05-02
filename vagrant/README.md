# Vagrant Rails

This will provision a Rails box suitable for production use running Nginx, Unicorn and
Postgres on a cloud Ubuntu server or local Vagrant environment.

It should allow you to have a development environment that is identical to your production environment.

## Stack

+ Rails
+ Nginx
+ Unicorn
+ Rbenv
+ Node.js
+ Postgres or MySQL

## Use

For local Vagrant development

```
vagrant up
./deploy.sh
ssh deploy@33.33.33.3
```

Use Capistrano to deploy your web application to your Vagrant box or cloud server

## Advanced

Set file permissions on /var/www

```
sudo adduser deploy www-data
sudo chown -R www-data:www-data /var/www
sudo chmod -R g+rw /var/www
```

Configure nginx

```
sudo rm /etc/nginx/sites-enabled/default
sudo rm /etc/nginx/sites-available/default
sudo ln -s /var/www/sitename/current/config/nginx.conf /etc/nginx/sites-enabled/sitename.com
sudo ln -s /var/www/sitename/current/config/nginx.conf /etc/nginx/sites-available/sitename.com
sudo service nginx restart

cd /var/www/sitename/current
rbenv exec bundle exec unicorn -c config/unicorn.rb -D -E production
```

Nginx config

```nginx
upstream unicorn {
  server unix:/var/www/sitename/current/tmp/sockets/unicorn.sock fail_timeout=0;
}
 
server {
  listen 80 default deferred;
  root /var/www/sitename/current/public;
  
  try_files $uri/maintenance.html $uri/index.html $uri @unicorn;
  
  location @unicorn {
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    proxy_redirect off;
    proxy_pass http://unicorn;
  }
 
  location ~ ^/(assets)/  {  
    root /var/www/sitename/current/public;
    gzip_static on;
    expires     max;
    add_header  Cache-Control public;
  }
  	
  location = /favicon.ico {
    expires    max;
    add_header Cache-Control public;
  }
  
  error_page 500 502 503 504 /500.html;
  client_max_body_size 4G;
  keepalive_timeout 10;
}
```

Unicorn.rb (config/unicorn.rb)

```ruby
# SET YOUR HOME DIR HERE
 
APP_ROOT = File.expand_path(File.dirname(File.dirname(__FILE__)))
 
worker_processes 2
working_directory APP_ROOT
preload_app true
timeout 30
rails_env = ENV['RAILS_ENV'] || 'production'
 
listen APP_ROOT + "/tmp/sockets/unicorn.sock", :backlog => 64
pid APP_ROOT + "/tmp/pids/unicorn.pid"
 
stderr_path APP_ROOT + "/log/unicorn.stderr.log"
stdout_path APP_ROOT + "/log/unicorn.stdout.log"
 
before_fork do |server, worker|
  ActiveRecord::Base.connection.disconnect!
  
  old_pid = APP_ROOT + '/tmp/pids/unicorn.pid.oldbin'
  if File.exists?(old_pid) && server.pid != old_pid
    begin
      Process.kill("QUIT", File.read(old_pid).to_i)
    rescue Errno::ENOENT, Errno::ESRCH
      puts "Old master already dead"
    end
  end
end
 
after_fork do |server, worker|
  ActiveRecord::Base.establish_connection
end
```
