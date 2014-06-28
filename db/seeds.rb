# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

o = [('a'..'z'), ('A'..'Z')].map { |i| i.to_a }.flatten
c = (0...50).map { o[rand(o.length)] }.join
tripthru_access_token = c
include BCrypt
User.create!(
    ClientId: 'TripThru',
    UserName: 'tripthru',
    password_digest: BCrypt::Password.create('optimize'),
    Email: 'tripthru@tripthru.com',
    AccessToken: tripthru_access_token,
    RefreshToken: '',
    PartnerName: '',
    CallbackUrl: '',
    TripThruAccessToken: tripthru_access_token,
    Role: 'admin',
    remember_token: '',
    created_at: Date.today,
    updated_at: Date.today
)

User.create!(
    ClientId: 'netro@tripthru.com',
    UserName: 'netro',
    password_digest: BCrypt::Password.create('netro'),
    Email: 'netro@tripthru.com',
    AccessToken: 'GDOXwcwzgLCAltqzRIrEeMLbmqLmDBTZsotoeOXFvMWMOakLSS',
    RefreshToken: '',
    PartnerName: 'Netro',
    CallbackUrl: 'TripThru.Netro/',
    TripThruAccessToken: 'GDOXwcwzgLCAltqzRIrEeMLbmqLmDBTZsotoeOXFvMWMOakLSS',
    Role: 'partner',
    remember_token: '',
    created_at: Date.today,
    updated_at: Date.today
)

User.create!(
    ClientId: 'miamitaxi@tripthru.com',
    UserName: 'miamitaxi',
    password_digest: BCrypt::Password.create('miamitaxi'),
    Email: 'miamitaxi@tripthru.com',
    AccessToken: 'qkPHjrHxWHrCnBvkSMMhCxgfiuoqCOvSqEzdzZhwQHhXPlXwNr',
    RefreshToken: '',
    PartnerName: 'Miami Taxi',
    CallbackUrl: 'TripThru.MiamiTaxi/',
    TripThruAccessToken: 'qkPHjrHxWHrCnBvkSMMhCxgfiuoqCOvSqEzdzZhwQHhXPlXwNr',
    Role: 'partner',
    remember_token: '',
    created_at: Date.today,
    updated_at: Date.today
)

User.create!(
    ClientId: 'mellow@tripthru.com',
    UserName: 'mellow',
    password_digest: BCrypt::Password.create('mellow'),
    Email: 'mellow@tripthru.com',
    AccessToken: 'QBIHCRwsfffCKPdVtbeHGheVyyZRNkcJyGPKGNSLlljVwIdSCO',
    RefreshToken: '',
    PartnerName: 'Mellow',
    CallbackUrl: 'TripThru.Mellow/',
    TripThruAccessToken: 'QBIHCRwsfffCKPdVtbeHGheVyyZRNkcJyGPKGNSLlljVwIdSCO',
    Role: 'partner',
    remember_token: '',
    created_at: Date.today,
    updated_at: Date.today
)

User.create!(
    ClientId: 'hubai@tripthru.com',
    UserName: 'hubai',
    password_digest: BCrypt::Password.create('hubai'),
    Email: 'hubai@tripthru.com',
    AccessToken: 'vgpKiwzASYpnWhHscmeNMjsSUScsFUWJMNHSRmZDylWRNqWhyP',
    RefreshToken: '',
    PartnerName: 'Hubai Taxi Corporation',
    CallbackUrl: 'TripThru.HubaiTaxiCorporation/',
    TripThruAccessToken: 'vgpKiwzASYpnWhHscmeNMjsSUScsFUWJMNHSRmZDylWRNqWhyP',
    Role: 'partner',
    remember_token: '',
    created_at: Date.today,
    updated_at: Date.today
)

User.create!(
    ClientId: 'los@tripthru.com',
    UserName: 'lostaxiblus',
    password_digest: BCrypt::Password.create('lostaxiblus'),
    Email: 'los@tripthru.com',
    AccessToken: 'lbxQSMwsRstKAjbHfemZuyhDQDUzODxPtygDYfMJgnhcaixuIt',
    RefreshToken: '',
    PartnerName: 'Los Taxi Blus',
    CallbackUrl: 'TripThru.LosTaxiBlus/',
    TripThruAccessToken: 'lbxQSMwsRstKAjbHfemZuyhDQDUzODxPtygDYfMJgnhcaixuIt',
    Role: 'partner',
    remember_token: '',
    created_at: Date.today,
    updated_at: Date.today
)

User.create!(
    ClientId: 'tuxor@tripthru.com',
    UserName: 'tuxor',
    password_digest: BCrypt::Password.create('tuxor'),
    Email: 'tuxor@tripthru.com',
    AccessToken: 'dIOEVOwGYgnyjSCwxuNmLMPqQAPHjeijdynibQPvaLYhscGczR',
    RefreshToken: '',
    PartnerName: 'Tuxor',
    CallbackUrl: 'TripThru.Tuxor/',
    TripThruAccessToken: 'dIOEVOwGYgnyjSCwxuNmLMPqQAPHjeijdynibQPvaLYhscGczR',
    Role: 'partner',
    remember_token: '',
    created_at: Date.today,
    updated_at: Date.today
)

User.create!(
    ClientId: 'tampacab@tripthru.com',
    UserName: 'tampacab',
    password_digest: BCrypt::Password.create('tampacab'),
    Email: 'tampacab@tripthru.com',
    AccessToken: 'kemscAtgywuQkSEMDThBjjUyvREwUzdGitzrSQaznGCSKZpCcS',
    RefreshToken: '',
    PartnerName: 'Tampa Cab',
    CallbackUrl: 'TripThru.TampaCab/',
    TripThruAccessToken: 'kemscAtgywuQkSEMDThBjjUyvREwUzdGitzrSQaznGCSKZpCcS',
    Role: 'partner',
    remember_token: '',
    created_at: Date.today,
    updated_at: Date.today
)

User.create!(
    ClientId: 'nytaxi@tripthru.com',
    UserName: 'nytaxi',
    password_digest: BCrypt::Password.create('nytaxi'),
    Email: 'nytaxi@tripthru.com',
    AccessToken: 'BHMRfjKXDowLrlCdVPdUJfcwkHQqedLxtWWJSTtMrWTlJpwlVw',
    RefreshToken: '',
    PartnerName: 'NY Taxi',
    CallbackUrl: 'TripThru.NYTaxi/',
    TripThruAccessToken: 'BHMRfjKXDowLrlCdVPdUJfcwkHQqedLxtWWJSTtMrWTlJpwlVw',
    Role: 'partner',
    remember_token: '',
    created_at: Date.today,
    updated_at: Date.today
)