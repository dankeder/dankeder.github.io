---
layout:     post
title:      "How to remove ads in Android"
subtitle:   ""
date:       2014-03-11 08:32:37 +0200
author:     "Dan Keder"
---

This is a very simple yet effective way to get rid of advertisements
in Android apps -- without rooting the device. In principle it is the
same method that the Android AdBlock app uses: resolve all DNS queries for
various ad servers to `127.0.0.1`. But AdBlock app requires a rooted device, which
not everyone is able or wants to do.

So instead of mocking DNS queries on the phone or tablet we do it on the "next
hop" device - i.e. home or company router. That will affect *all* devices
connected to that network - all phones, tablets and computers. But this method
also has a drawback - you need a capable router, ideally with root SSH access to
it. What I use (and recommend) is a Raspberry PI with Raspbian.

Just put the following simple script into `/etc/hosts.d/update.sh`, make it executable and run it. You
may have to create the directory `/etc/hosts.d` first. You can also run the script in cron so everything updates regularly.

    #!/bin/bash

    curl 'http://adaway.sufficientlysecure.org/hosts.txt' > /etc/hosts.d/01hosts
    curl 'http://winhelp2002.mvps.org/hosts.txt'> /etc/hosts.d/02hosts
    curl 'http://hosts-file.net/.\ad_servers.txt'> /etc/hosts.d/03hosts
    curl 'http://pgl.yoyo.org/adservers/serverlist.php?hostformat=hosts&showintro=0&mimetype=plaintext' > /etc/hosts.d/04hosts


Raspbian uses `dnsmasq` to handle DNS queries so we need to tell it to consult
the files in `/etc/hosts.d` before contacting the real DNS servers. To do it add
the following lines into `/etc/dnsmasq.conf`:

    # Disable ads in android apps
    addn-hosts=/etc/hosts.d/01hosts
    addn-hosts=/etc/hosts.d/02hosts
    addn-hosts=/etc/hosts.d/03hosts
    addn-hosts=/etc/hosts.d/04hosts

And restart the dnsmasq service:

    /etc/init.d/dnsmasq restart

And that's it, now you shouldn't see any of the annoying ads anymore.
