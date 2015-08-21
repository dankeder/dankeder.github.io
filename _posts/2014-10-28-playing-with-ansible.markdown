---
layout:     post
title:      "Playing with Ansible"
subtitle:   "Learn how to automate deployment with Ansible."
date:       2014-10-28 12:02:19 +0200
author:     "Dan Keder"
---

I've been working with [Ansible](http://www.ansible.com/) for several weeks now.
It's a very powerful tool for automating server deployment (like Chef or
Puppet). It's very easy to use, the only thing that it expects from the server
is a working SSH access. Also it has a pretty good [documentation](http://docs.ansible.com).

Ansible is modular - in fact it uses modules for doing all the heavy lifting.
There are a lot of [modules](http://docs.ansible.com/modules.html), and you can
also write your own. All modules are idempotent, which means that they first
check what needs to be done and only do their thing if it's really needed.
Troubleshooting is easy - the modules are simple and quite low-level 
that you always know what is going. On the other hand, the lack of abstractions is a double-edged
sword: Ansible playbooks are usually bound to the specific environment they were
written for, e.g. you can't just take any playbook written for Debian and use it
in Centos, because they use completely different packaging systems and Ansible
has specialized modules for installing packages - in this case `yum` and `apt`.

What? Where?
------------

The thing that makes Ansible very powerful is the separation of "what" from
"where". [Playbooks](http://docs.ansible.com/playbooks.html)
specify what you want to do (e.g. install a package, generate a config
file from a template, start the service), but they don't know where will
they actually run - because they can run anywhere. The information about "where" is stored in
[inventory files](http://docs.ansible.com/intro_inventory.html). They are simple
text files that contain hostnames or IP addresses of hosts where the playbooks
shall run. Entries in the inventory file can be grouped - for instance, you can
have a group for www servers and a group for loadbalancers.

You can have many inventory files for various use cases, for example an
inventory files for production servers and another one for virtual machines used
for development.

Real Example (well, almost)
---------------------------

But this is just talking, so let's try something real. Say we want to
deploy [this simple web application](https://github.com/mitsuhiko/flask/tree/0.10.1/examples/flaskr)
to a virtual machine running CentOS 7 and put HAProxy in front of it. How do we
do that?

### Create a virtual machine

First, create a virtual machine running [Centos
7](http://www.centos.org/download/) so we have something to work with.
Install VirtualBox or something similar and create yourself one. Also make sure you can
SSH to it with an SSH key.

### Clone the Flask repo
Then clone the official Flask repo, it contains our example web application
(checkout the last stable version):

    git clone https://github.com/mitsuhiko/flask.git /path/to/flask.git
    cd /path/to/flask.git && git checkout -b v0.10.1 0.10.1

### Inventory files

Now we can create the deployment procedure. We will use the directory layout from
[Ansible Best Practices](http://docs.ansible.com/playbooks_best_practices.html),
because it makes things nicely organized and has a couple of convenient properties
like not having to type full file paths in playbooks.

First, we create the inventory file `inventory/hosts`. Put the IP address of
your virtual machine to it, my VM had `192.168.56.170`:

    [webservers]
    192.168.56.170

    [haproxy]
    192.168.56.170

### Playbook files

Now we can create the playbooks. Create the `site.yml` with the following contents:

    ---
    - include: webservers.yml
    - include: haproxy.yml

This is a very simple Ansible playbook, it just includes two other playbooks for setting up the webserver
and haproxy. This is just a convenience file we will use later for deploying the whole "site".

The contents of `webservers.yml` is more interesting:

    ---
    - hosts: webservers
      remote_user: root
      roles:
        - webserver

Here we say that the playbook operates on a group of hosts called `webservers`
and fulfills the role of "webserver".

### Roles

By convention, roles are stored in subdirectories in `roles/`. Tasks for
setting up the webserver role are stored in file `roles/webserver/tasks/main.yml`:

    ---
    - name: create user
      user: name="{{ flaskr_user }}" shell="/sbin/nologin" state="present"
    
    - name: install python-flask
      yum: name="python-flask" state="present"
    
    - name: install rsync
      yum: name="rsync" state="present"
    
    - name: copy flaskr
      synchronize: src="{{ flaskr_dir }}/" dest="{{ flaskr_home }}/" recursive="yes" delete="yes" rsync_opts="--exclude *.swp, --exclude *.swo" owner="no" group="no"
      notify:
        - restart flaskr
    
    - name: generate flaskr.cfg
      template: src="flaskr.cfg.j2" dest="{{ flaskr_home}}/flaskr.cfg" owner="flaskr" group="flaskr" mode="644"
      notify:
        - restart flaskr
    
    - name: generate flaskr.service
      template: src="flaskr.service.j2" dest="/etc/systemd/system/flaskr.service" owner="root" group="root" mode="644"
      notify:
        - reload systemd
    
    - name: start flaskr
      service: name="flaskr" state="started"

It's pretty self-explanatory, isn't it? It will create a user that the app will run
under, install Flask, copy the app over, generate config and start the app. Easy.

Ansible can use [Jinja2](http://jinja.pocoo.org/docs/dev/) templates to generate
config files. So no more *ad-hoc awk\`ing* of config files and wondering why it
doesn't work. Templates for the "webserver" role are usually stored in
`role/webserver/templates/`. For example, a systemd service file for the flaskr
`flaskr.service.j2` looks like this:

    [Unit]
    Description=Flaskr - a minimal blog application
    
    [Service]
    Type=simple
    Environment="FLASKR_SETTINGS={{ flaskr_home }}/flaskr.cfg"
    ExecStart=/usr/bin/python {{ flaskr_home }}/flaskr.py
    User={{ flaskr_user }}
    Group={{ flaskr_group }}
    Restart=always
    
    [Install]
    WantedBy=multi-user.target

You can use any Jinja2 syntax there, including control flow statements.
Config files can have logic now!

The values of variables can come from several places, I recommend looking at
[Playbook Variables docs](http://docs.ansible.com/playbooks_variables.html) to
get the idea. In this case we have a YAML file `group_vars/webservers` which
contains the variables for the hosts group `webservers`:

    ---
    flaskr_user: flaskr
    flaskr_group: flaskr
    flaskr_home: /home/flaskr

The `haproxy` role is very similar, there's no need to cut-n-paste it here. If
you are intersted you can find the complete example on
[Github](https://github.com/dankeder/ansible-example).

### That's it!

After you have everything set, you can run the `site.yml` playbook:

    ansible-playbook site.yml -i inventory/hosts -e "flaskr_dir=/path/to/flask.git/examples/flaskr/"

So to sum it up - I would say that the initial effort put into writing playbooks
pays off very quickly. Also you should store the deployment procedure in a git
repo, so you can easily keep track of all configuration changes.
