---
layout: template
comments: true
title: "Scala's Type Erasure -- Some Pain Points"
---

Because Scala programs run on the JVM, some of the rich type information available at compile time is lost at runtime. This is unfortunate, because we cannot write code like the following.

Say that you want to cast a value from type Any to type String, but do this in a safe manner, you could write the following function:

	def getIfString(e: Any): Option[String] = {
	  if (e.isInstanceOf[String]) Some(e.asInstanceOf[String])
	  else None
	}

Or a bit more elegant:

	def betterGetIfString(e: Any): Option[String] = {
	  e match {
		  case str: String => Some(str)
		  case _ => None
		}
	}

So that we would get the following outputs:

	getIfString(5)           ====> None
	getIfString("foo")       ====> Some("foo")
	betterGetIfString(5)     ====> None
	betterGetIfString("foo") ====> Some("foo")
	
Now, say you want similar functionality for Int, Boolean, and in general for any type T, you could write: 

	def getIf[T](e: Any): Option[T] = {
	  if (e.isInstanceOf[T]) Some(e.asInstanceOf[T])
	  else None
	}
	
Or again, add a bit of elegance to it: 

	def betterGetIf[T](e: Any): Option[T] = {
	  e match {
	    case t: T => Some(t)
	    case _ => None
	  }
	}

Running scala with the -unchecked option gives us the following warning: "abstract type T in type T is unchecked since it is eliminated by erasure".

And as warned, when you run this, you do not get required behavior, as shown by the following outputs:

	getIf[String](5)       ====> Some(5)
	betterGetIf[String](5) ====> Some(5)

The type information `T` from the type-parameterized functions `getIf` and `betterGetIf` are lost during runtime, and thus, although Scala allows us write these elegant programs, they won't run correctly on the JVM. 

**Update**

Inspired by [Rajiv Kurian's](http://www.linkedin.com/pub/rajiv-kurian/14/7a1/296) comments below, on being able to use [Manifests](http://stackoverflow.com/questions/3213510/what-is-a-manifest-in-scala-and-when-do-you-need-it) to get around type erasure, I came up with the following mechanism of implementing `getIf`. Its not quite what I desired, but gets close. 

	def getIf[A: Manifest, B: Manifest](a: A, b: B)  : Option[A] = {
	  if (manifest[B] <:< manifest[A])
	    Some(b.asInstanceOf[A])	
	  else 
	    None
	 }
	 
The `getIf	` function is used as follows:

	getIf("", 1) // returns None 
	getIf("", "blah") // returns Some("blah")  
	
That is, the first argument is a dummy value of a type that we want the second argument to be converted into if possible (and wrapped inside a `Some`), else we want `None` indicating the second argument cannot be converted to the same type as that of the first argument. 

I say it gets close as to what I wanted, because we have to provide a dummy instance of the type we want something to be converted into, rather than being able to provide the type directly, as in `getIf[String](1)`. I would love to know about it if someone comes up with a way to do this! 	
