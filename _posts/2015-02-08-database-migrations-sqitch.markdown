---
layout:     post
title:      "Automating DB schema updates"
subtitle:   "How to automate database schema updates."
date:       2015-03-02 18:00:00 +0200
author:     "Dan Keder"
# header-img: "img/post-bg-01.jpg"
---

Some time ago I've been searching for a tool for automating PostgreSQL database
updates. You know the drill - creating new tables, adding columns, renaming
stuff, etc. Doing these things by hand is error prone and cumbersome, and
sometimes not even possible, especially if you have more than one database or if
you need to share your changes with more developers. Add to that the distributed
nature of development these days and you can have a lot of fun trying to figure
out what a column is supposed to be called like after three different developers
renamed it at the same time.

Apparently, there are a
[lot](http://flywaydb.org/)
[of](https://alembic.readthedocs.org/en/latest/)
[tools](http://www.liquibase.org/)
out there trying to solve the problem of "DB schema migration". But as I
unfortunately found out after evaluating many of them, most of them did not suit
my needs:

- Ability to use simple `*.sql` files; no complicated ORM or XML bullshit please
- Simple interface - I don't want to type a kilometer-long command to get
  something done
- Database should "know" what version it is in, new changes should be applied
  seamlessly
- Ability to bring a pre-existing database under the change management
- Ability to revert applied changes
- Play nice with git, which means it should generate as few conflicts as
  possible when merging branches and resolving these conflicts should be easy
- The tool shouldn't be bound to a particular programming language or framework
- No Java

So I kept on searching, until I stumbled upon [Sqitch](http://sqitch.org/). It
turned out that Sqitch covered most of the things in the list above.

Additionally, it supports many SQL databases (including PostgreSQL). It does not
assume almost anything about the workflow it's used in, which makes it very easy
to integrate with deployment tools such as
[Ansible](http://www.ansible.com/how-ansible-works). Performing the actual
update of the database schema is as simple as running `sqitch --engine pg
deploy`. To learn how to use it I only had to read through the
[Tutorial](https://metacpan.org/pod/distribution/App-Sqitch/lib/sqitchtutorial.pod)
- so "thumbs up", another problem solved :-).
