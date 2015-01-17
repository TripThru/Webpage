set :stage, :production
set :rails_env, :production

server '107.170.248.80', user: 'deploy', port: 22, roles: %w{web app db}, primary: true