# Postgresql

A playbook that installs Postgres

## Run the playbook

```
ansible-playbook -i hosts playbooks/postgresql/setup.yml
```

To run against a Vagrant box you'll need the insecure private key from vagrant i.e

```
ansible-playbook -i hosts playbooks/postgresql/setup.yml --private-key ~/.vagrant.d/insecure_private_key
```
