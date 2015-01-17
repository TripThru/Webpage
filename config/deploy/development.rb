set :stage, :development
set :rails_env, :development

server '33.33.33.33', user: 'deploy', port: 22, roles: %w{web app db}, primary: true