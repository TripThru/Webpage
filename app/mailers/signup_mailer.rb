class SignupMailer < ActionMailer::Base
  default from: 'tripthrusignup@gmail.com'

  def signup(email)
    mail(to: 'tripthrusignup@gmail.com', subject: email + ' sign up request')
  end
end
