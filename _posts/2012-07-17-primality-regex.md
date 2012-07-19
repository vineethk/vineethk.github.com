---
layout: template
title: Checking for Primality using Regular Expressions
comments: true
---

I bumped into [this][1] awesome post that shows how to use a regular expression in order to check if a number is prime or not. 
The number N being checked for primality must be represented as a string of N 1s, for example, 5 is represented as "11111".
The function `convert` does that:

	function convert(i) {
		var s = "";
		for (var x = 0; x < i; ++x) {
			s += "1";
		}
		return s;
	}

Now consider the regex `composite`:

	var notprime = /^1?$|^(11+)\1+$/;

It is made up of two parts:

1. `^1?$` matches empty string and "1" these are not prime. 
2. The interesting part is `^(11+)\1+$`. The subpattern `(11+)` matches "11", "111", and so on. The `\1+` matches if the subpattern can be matched again. So the regex matching works as follows -- first, it matches "11", and then sees if it can match one or more "11" until the end of the string (if it can, then it matched a number divisible by two), else it backtracks and does the same with "111", and so on. Thus the whole regex matches if it is divisible by 2 or a greater number. 

You can test this by copying this code and run it in your browser or nodejs. Ofcourse, this can be awfully slow (it can cause nodejs to crash for larger numbers due to memory allocation failures), but isn't it fun?

	console.log(!(notprime.test(convert(24)))); // false -- is not a prime
	console.log(!(notprime.test(convert(47)))); // true -- is a prime


[1]: http://zmievski.org/2010/08/the-prime-that-wasnt

