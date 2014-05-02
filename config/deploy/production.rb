set :stage, :production
set :rails_env, :production

server 'http://107.170.248.80', user: 'deploy', port: 12345, roles: %w{web app db}, primary: true