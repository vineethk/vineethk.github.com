---
layout: template
title: How To Check If Someone Read an Email?
comments: true
---

This is a standard technique used by spammers, and people who send promotional email.
It is quite well known, I just thought it would be interesting to write about it. 

Most modern email clients can parse HTML within an email and render it.
This allows an email sender to format their email in a standard manner, and embed images by using the `<img>` tag. 
One can specify the image to be rendered using the `src` attribute of the `<img>` tag, it can be any local or remote URL.

Say that the image was specified as a remote URL. 
Now if the person whom the email was sent to, opened the email, and the mail client parsed and rendered this as HTML, then there would be a network request to fetch the image. 
By creating unique image resources and embdedding it in each email sent, and by monitoring if a network request to this image resource was made, the email sender can infer if the reveiver ever opened the email!
If the sender wants to do this covertly, the image resource can be made unnoticeable (for example, by making it a 1 pixel image).

Spammers can use this technique to figure out if an email id is valid, people who send promotional subscription email can figure out if people are actually reading the emails they are sending out. 

A number of email clients already remedy this by providing an option to the email receiver, whether or not to display images from the sender. 
So next time you see gmail not rendering the images in an email, and asking `Display images below`, you know why. 
