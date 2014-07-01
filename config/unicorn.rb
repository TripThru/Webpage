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
  if rails_env != 'production'
    ActiveRecord::Base.connection.disconnect!
  end

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
  if rails_env != 'production'
    ActiveRecord::Base.establish_connection
  end
end