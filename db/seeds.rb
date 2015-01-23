# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

include BCrypt

o = [('a'..'z'), ('A'..'Z')].map { |i| i.to_a }.flatten
c = (0...50).map { o[rand(o.length)] }.join
token = c
User.create!(
    id: 'tripthru@tripthru.com',
    name: 'tripthru',
    password_digest: BCrypt::Password.create('optimize'),
    email: 'tripthru@tripthru.com',
    token: token,
    role: 'admin',
    remember_token: '',
    created_at: Date.today,
    updated_at: Date.today
)