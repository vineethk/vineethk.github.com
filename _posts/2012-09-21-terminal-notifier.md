---
layout: template
title: Using the Terminal Notifier in Mountain Lion
comments: true
---

Mountain Lion come with a nice notification center. 
If you write a whole bunch of scripts and are in the habit of looking back and forth between them to find out if they finished executing or not, then you might find this sweet.

Based off of [this](http://osxdaily.com/2012/08/03/send-an-alert-to-notification-center-from-the-command-line-in-os-x/) webpage, install the `terminal-notifier`. Then you can add something on the order of the following to your scripts:

    $ terminal-notifier -message "Success" -title "Job X"

