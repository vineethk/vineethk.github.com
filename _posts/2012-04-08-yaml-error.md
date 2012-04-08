---
layout: template
title: YAML Processing Bug
---

Publishing blogs on github pages via [jekyll][1] and [markdown][2] has been fun (as a sidenote, I use [Mou][3] as my markdown editor -- its for OS X). Recently, I started running into an error where the YAML front matter was not getting processed correctly, which one can find by executing the command (as described in [github pages help][4]

	jekyll --pygments --safe
The reason was the YAML to decribe my title was something like:

	title: [HOWTO]: Do something
The ":" in the title messes YAML, it needs to be escaped. The simplest fix to this was to put the entire title within quotes. 

	title: "[HOWTO]: Do something"

[1]: https://github.com/mojombo/jekyll/
[2]: http://daringfireball.net/projects/markdown/
[3]: http://mouapp.com/
[4]: http://help.github.com/pages/