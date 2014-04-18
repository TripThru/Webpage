shopt -s nocaseglob
set -e

#Create user
user=tripservice
password=Tr1PServ1CeSt@Ck
pass=$(perl -e 'print crypt($ARGV[0], "password")' $password)
sudo useradd -m -p $pass $user
usermod -G users $user
usermod -G sudo $user
sudo echo yourhostname > /etc/hostname
sudo apt-get update -y

ruby_version="2.1.1"
ruby_version_string="2.1.1"
ruby_source_url="http://cache.ruby-lang.org/pub/ruby/2.1/ruby-2.1.1.tar.gz"
ruby_source_tar_name="ruby-2.1.1.tar.gz"
ruby_source_dir_name="ruby-2.1.1"
script_runner=$(whoami)
railsready_path=/home/tripservice/railsready
log_file="$railsready_path/install.log"
system_os=`uname | env LANG=C LC_ALL=C LC_CTYPE=C tr '[:upper:]' '[:lower:]'`

control_c()
{
  echo -en "\n\n*** Exiting ***\n\n"
  exit 1
}

# trap keyboard interrupt (control-c)
trap control_c SIGINT

clear

echo "#################################"
echo "########## Rails Ready ##########"
echo "#################################"

distro="ubuntu"

echo -e "\n\n"
echo "run tail -f $log_file in a new terminal to watch the install"

echo -e "\n"
echo "What this script gets you:"
echo " * Ruby $ruby_version_string"
echo " * libs needed to run Rails (sqlite, mysql, etc)"
echo " * Bundler, Passenger, and Rails gems"
echo " * Git"

echo -e "\nThis script is always changing."
echo "Make sure you got it from https://github.com/joshfng/railsready"

# Check if the user has sudo privileges.
sudo -v >/dev/null 2>&1 || { echo $script_runner has no sudo privileges ; exit 1; }

echo -e "\n\n!!! Set to install RVM for user: $script_runner !!! \n"

echo -e "\n=> Creating install dir..."
sudo -i -H -u $user bash -c 'cd /home/tripservice && mkdir -p railsready/src && cd railsready && touch install.log'
echo "==> done..."

# Install build tools
echo -e "\n=> Installing build tools..."
sudo apt-get -y install \
    wget curl build-essential clang \
    bison openssl zlib1g \
    libxslt1.1 libssl-dev libxslt1-dev \
    libxml2 libffi-dev libyaml-dev \
    libxslt-dev autoconf libc6-dev \
    libreadline6-dev zlib1g-dev libcurl4-openssl-dev \
    libtool nodejs expect >> $log_file 2>&1
echo "==> done..."

echo -e "\n=> Installing libs needed for sqlite and mysql..."
sudo apt-get -y install libsqlite3-0 sqlite3 libsqlite3-dev libmysqlclient-dev >> $log_file 2>&1
echo "==> done..."

echo -e "\n=> Installing RVM the Ruby enVironment Manager http://rvm.beginrescueend.com/rvm/install/ \n"
sudo -i -H -u $user bash -c "\curl -L https://get.rvm.io | bash >> $log_file 2>&1"
echo -e "\n=> Setting up RVM to load with new shells..."
#if RVM is installed as user root it goes to /usr/local/rvm/ not ~/.rvm
if [ -f /home/tripservice/.bash_profile ] ; then
  if [ -f /home/tripservice/.profile ] ; then
    sudo -i -H -u $user bash -c "echo 'source /home/tripservice/.profile' >> '/home/tripservice/.bash_profile'"
  fi
fi
echo "==> done..."
echo "=> Loading RVM..."
if [ -f /home/tripservice/.profile ] ; then
  sudo -i -H -u $user bash -c "source /home/tripservice/.profile"
fi
if [ -f /home/tripservice/.bashrc ] ; then
  sudo -i -H -u $user bash -c "source /home/tripservice/.bashrc"
fi
if [ -f /home/tripservice/.bash_profile ] ; then
  sudo -i -H -u $user bash -c "source /home/tripservice/.bash_profile"
fi
if [ -f /etc/profile.d/rvm.sh ] ; then
  sudo -i -H -u $user bash -c "source /etc/profile.d/rvm.sh"
fi
sudo -i -H -u $user bash -c "source /home/tripservice/.rvm/scripts/rvm"

echo "==> done..."
echo -e "\n=> Installing Ruby $ruby_version_string (this will take a while)..."
echo -e "=> More information about installing rubies can be found at http://rvm.beginrescueend.com/rubies/installing/ \n"
sudo expect -c "
        set timeout 240
        spawn sudo -i -H -u $user bash -c \"rvm install $ruby_version\"
        expect \"*?assword required for*\"
        send \"$password\r\"
        expect \"901ooin3doi2no29309dj23\"
        interact" >> $log_file 2>&1
echo -e "\n==> done..."
echo -e "\n=> Using $ruby_version and setting it as default for new shells..."
echo "=> More information about Rubies can be found at http://rvm.beginrescueend.com/rubies/default/"
sudo expect -c "
        spawn sudo -i -H -u $user bash -c \"/bin/bash --login\"
        expect \":~$\"
        send \"rvm --default use $ruby_version\r\"
        expect \":~$\"
        send \"exit\"" >> $log_file 2>&1
echo "==> done..."

# Reload bash
echo -e "\n=> Reloading shell so ruby and rubygems are available..."
if [ -f /home/tripservice/.bashrc ] ; then
  sudo -i -H -u $user bash -c "source /home/tripservice/.bashrc"
fi
echo "==> done..."

echo -e "\n=> Updating Rubygems..."
sudo expect -c "
        spawn sudo -i -H -u $user bash -c \"/bin/bash --login\"
        expect \":~$\"
        send \"gem update --system --no-ri --no-rdoc\r\"
        expect \":~$\"
        send \"exit\"" >> $log_file 2>&1
echo "==> done..."

echo -e "\n=> Installing Bundler, Passenger and Rails..."
sudo expect -c "
        set timeout 180
        spawn sudo -i -H -u $user bash -c \"/bin/bash --login\"
        expect \":~$\"
        send \"gem install bundler passenger rails --no-ri --no-rdoc -f\r\"
        expect \":~$\"
        send \"exit\"" >> $log_file 2>&1
echo "==> done..."
