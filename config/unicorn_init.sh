#!/bin/sh

cd /var/www/tripthru/current
rbenv exec bundle exec unicorn -c config/unicorn.rb -D -E production