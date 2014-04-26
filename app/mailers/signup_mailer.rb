class SignupMailer < ActionMailer::Base
  default from: 'tripthrusignup@outlook.com'

  def signup(email)
    mail(to: 'tripthrusignup@outlook.com', subject: email)
  end
end
