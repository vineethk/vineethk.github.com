---
layout: template
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

And as warned, when you run this, you do not get required behaviour, as shown by the following outputs:

	getIf[String](5)       ====> Some(5)
	betterGetIf[String](5) ====> Some(5)

The type information `T` from the type-parameterized functions `getIf` and `betterGetIf` are lost during runtime, and thus, although Scala allows us write these elegant programs, they won't run correctly on the JVM. 


		 
