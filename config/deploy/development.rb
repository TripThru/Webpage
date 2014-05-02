set :stage, :development
set :rails_env, :development

server 'http://33.33.33.33', user: 'deploy', port: 12345, roles: %w{web app db}, primary: true