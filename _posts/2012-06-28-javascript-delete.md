---
layout: template
title: JavaScript delete is not C++ delete  
---

For a project I am working on, I was looking through some of the JavaScript code in Firefox addons (aka extensions). 
I found the following code pattern in a few addons:

	function baz() {
	  var foo = new bar();
	  /* some code ... */
	  delete foo;
	}	
	
This seemed like an ill-informed C++ programmer writing JavaScript code (matching every `new` with a `delete`). 
`delete` in JavaScript has a very different semantics than `delete` in C++.
Since JavaScript is a garbage collected language, you do not need to manage memory. 
The `delete` operator is used for removing fields from an object, not freeing any memory. 
In particular, the `delete` operation above is a no-op, because you cannot `delete` local variables.  