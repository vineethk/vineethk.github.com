---
layout: template
title: "[HOWTO]: Do efficient command line command editing"
comments: true
---

Have you ever felt frustrated while editing a long command on a command line of a shell? Or say you are in Scala's REPL, and you want to go back to the middle of the line to edit something? 

This [blog][commands] provides an awesome set of tricks you can add to your bag for efficient command line editing. Particularly:

* __Ctrl + a__ to move the beginning of the command line
* __Ctrl + e__ to move to the end of the command line
* __Esc__ then __b__ to move back a word
* __Esc__ then __f__ to move a word further
* __Ctrl + l__ to clear the screen and reprint current line at top
* **Ctrl + _** to undo

Neat, huh?

**Addendum**: Found [this][unix] recently, it allows one to get into `vi` mode, and then you can use any of the `vi` commands to edit command line.
Incredibly useful for those who spend a lot of time editing command lines. 

[commands]: http://www.math.utah.edu/docs/info/features_7.html#SEC52
[unix]: http://fog.ccsf.cc.ca.us/~pwood/unixedit.html
