---
layout: template
title: Mountain Lion fixed Unicodes in my Terminal 
comments: true
---

One of the pleasant surprises that was waiting for me with the Mountain Lion (OS X 10.8) update was that it fixed my unicode display in terminal. 
With a trend started by my [Professor](http://www.cs.ucsb.edu/~benh/), we, at the Programming Languages Lab at UCSB, started using unicode characters heavily in our Scala code. 
It took a while to get used to: essentially, setting up key bindings in my editors.
I use [Sublime Text 2](http://www.sublimetext.com/2) which has the `snippets` feature that allows me to easily configure entering unicode characters I want.
I also use [IntelliJ Idea 11](http://www.jetbrains.com/idea/) with a Scala plugin, and use the `Live Templates` to make it easy to type in unicode.
Once these were setup, I could write seemingly beautiful code with ρ, σ, κ, ζ, τ, ⊤, ⊥, ⇒ and so on. 

One major issue that remained was the [iTerm 2](http://www.iterm2.com/#/section/home) not being to display unicode characters. 
So when there was compiler error or a debug message printed that involved unicode characters, I got a lame `?` instead. 
I mucked around the internet to fix it, but could not find an easy solution. 
I tried living with it for a while, and voila!, after my upgrade to Mountain Lion, this seems to have been fixed!
 