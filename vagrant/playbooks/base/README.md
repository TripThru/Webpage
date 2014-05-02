# Base

This playbook setups a new Ubuntu Linux development machine with basic security.

The aim is to provide a stable/standardized base machine on which to install other components.

It mostly follows the guide given here on securing linux servers.

http://plusbryan.com/my-first-5-minutes-on-a-server-or-essential-security-for-linux-servers

Developer login can be done via the deploy user and requires public key access rather than password login.

```
ssh deploy@33.33.33.10
```

## Run the playbook

```
ansible-playbook -i hosts playbooks/base/setup.yml
```

To run against a Vagrant box you'll need the insecure private key from vagrant i.e

```
ansible-playbook -i hosts playbooks/base/setup.yml --private-key ~/.vagrant.d/insecure_private_key
```

