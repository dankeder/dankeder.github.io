---
layout:     post
title:      "Dump a sample of data from PostgreSQL"
subtitle:   ""
date:       2016-06-05 13:00:00 +0200
author:     "Dan Keder"
---

Some time ago I needed to get a small sample of data for development and testing
from a huge (production) PostgreSQL database &ndash; something like "select these 100
users and their data from other tables and dump it into a file".

The standard `pg_dump` tool is not good for this. It can only dump the whole
database or just some of the tables, but not a subset of rows from particular
tables. After looking around the net for a while I didn't find an easy way to do
it.

So as part of my recent efforts to learn [Go](https://golang.org/) I created a
small tool called [`pg_dump_sample`](https://github.com/dankeder/pg_dump_sample)
that does that. You tell it which tables it should dump and how and it creates
a dump file containing the dataset. Because the manifest file which specifies
what tables should be dumped can be reused it's a matter of running the tool
again to get a fresh dump. The resulting dump file can be loaded into
an empty database by `psql` or a similar tool. I found this approach to be a
very convenient way to keep the dev and testing environments up-to-date.

And the last thing - you can find [`pg_dump_sample`](https://github.com/dankeder/pg_dump_sample) on
[Github](https://github.com/dankeder/pg_dump_sample), along with a bit of
documentation and examples of use.
