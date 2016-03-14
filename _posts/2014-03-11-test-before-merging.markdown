---
layout:     post
title:      "Test changes before merging"
subtitle:   ""
date:       2014-03-11 08:32:30 +0200
author:     "Dan Keder"
redirect_from: "2014/03/11/test-before-merging/"
---

That seems obvious, doesn't it? Why would anyone do it the other way around? I
don't know, but it happens.

Let's say you finished a feature in your project and you want to merge
the feature branch into the master branch of your project's `git` repository.
The master branch is considered stable (i.e. it should always work) and is used
by other developers as a basis for their own work as well as for releasing new
versions.

You also have some sort of automated testing, i.e. Jenkins jobs running unit
and integration tests.

The workflow when you merge your feature branch into the master and publish it
with the aim that your testing system will kick-in and let you know that master
is OK (or not) is flawed by design. After you publish your changes it's already
too late to test it. Anybody who pulls the master branch now will see the
untested commits and will end up with a potentially broken source code. It's not
a big deal for a personal project involving two people. It's a very, very big
problem in a project developed by 50-100 people where most of them work like
this.

Always run tests *before* you merge your feature branch into the master. Design
your tests, build system and/or Jenkins jobs to support this workflow. It will
make your life as a developer a lot easier:

  - Your commits won't break other people's work
  - If you find that your commits break something you can easily fix them or throw
    them away, without reverting anything in master
  - You will have a more stable project and less frustrated colleagues
