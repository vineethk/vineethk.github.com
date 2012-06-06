---
layout: template
title: "Scala's Automatic Semicolon Inference  -- Beware of Potential Bugs"
---

Scala has automatic semicolon inference, so one need not end every statement in a semicolon. Which makes it nicer looking (?), saves a bunch of typing. But it can come back and bite you in the trickiest ways :)

I have had to fix bugs both in my code as well as someone elses, that have had to do with automatic semicolon inference. And mind you, these are very tricky to find, since the code tends to look immaculate in the first, and next few glances, unless you are specifically looking for this bug. 


		case class Foo(veryLongNameForThisThingWhateverItIs: Int,
                   anotherveryLongNameForThisThingWhateverItIs: Int) {
  
  		def sum = veryLongNameForThisThingWhateverItIs
             + anotherveryLongNameForThisThingWhateverItIs

 	 	def anotherSum = { veryLongNameForThisThingWhateverItIs
                     + anotherveryLongNameForThisThingWhateverItIs }

		}

Now, if you call this:


		Foo(1, 2).sum

It returns 1, as it is equivalent to the code: 	
	

		def sum = veryLongNameForThisThingWhateverItIs;
  
   		//empty statement in the constructor, like saying "+5;"
		+ anotherveryLongNameForThisThingWhateverItIs;

And if you call this:
	

		Foo(1, 2).anotherSum

It returns 2, as it is equivalent to the code: 


		def anotherSum = { veryLongNameForThisThingWhateverItIs;
   	                       return +anotherveryLongNameForThisThingWhateverItIs }
	 

Of course the right way of writing this is to make it unambiguous that you did not mean to end at line break: 


		def sum = veryLongNameForThisThingWhateverItIs + // cannot insert ; here
   	              anotherveryLongNameForThisThingWhateverItIs

