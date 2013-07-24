
The expression problem is an interesting software design issue that comes up more often that you would imagine. I was made to realize that an issue we were trying to tackle was in essence an expression problem, which made me look closely into it. In this blog, we explore a few solutions to it in Scala. Note that none of these are solutions that I came up with: these are taken from papers that I have linked to at the end of the blog. 

The expression problem deals with adding both new data variants and new operations in an extensible way. A slightly more precise definition expects a solution to the expression problem to satisfy the following:
1. Allows adding new data variants and operations, and extend existing operations. 
2. Statically type check operations applied to data variants. 
3. Does not duplicate or modify existing code, and does not need recompilation of existing code.  
4. Allows combining extensions in an independent manner. 

### Language of Arithmetic Expressions

It would be easier to explain the expression problem with an example, so let's get right to it. Consider a language of arithmetic expressions, and how we would implement it in Scala:

```
    // Code Snippet: 1

    trait Exp {
      def eval: Value
    }

    case class Lit(x: Int) extends Exp {
      override def eval = VInt(x)
    }

    case class Add(l: Exp, r: Exp) extends Exp {
      override def eval = VInt(l.eval.getInt + r.eval.getInt)
    }

    trait Value {
      def getInt: Int
    }

    case class VInt(x: Int) extends Value {
      override def getInt = x
    }
```

We have expressed a very simple grammar for arithmetic expressions here: an expression can either be a literal number, or an addition of two expressions. We have also implemented an `eval` method on expressions which evaluate an expression down to a `Value`. Its easy to add new data variants to this code: for example, adding subtraction expressions would be straightforward (just add a new `case class Sub`, that extends `Exp`). However, adding new operations is quite hard. Say for example, we need to add a new `print` operation, then we will have to modify the `Exp` trait to add the `print` method, and then change all its inherited classes to implement this method. 

### Visitor Pattern

An alternative way of designing this implementation is by using the visitor pattern. This requires changing the `Exp` trait to include an `accept` method. We call the visitor type used by the `accept` methods `Algebra`, since it corresponds to object algebras (which we won't get into in this blog, for a more detailed explanation, see the [paper][1]). 

```
    // Code Snippet: 2

    trait Exp {
      def accept[A](vis: Algebra[A]): A
    }

    case class Lit(x: Int) extends Exp {
      override def accept[A](vis: Algebra[A]): A = 
        vis.lit(x)
    }

    case class Add(l: Exp, r: Exp) extends Exp {
      override def accept[A](vis: Algebra[A]): A = 
        vis.add(l.accept(vis), r.accept(vis))
      
    }

    trait Algebra[A] {
      def lit(x: Int): A
      def add(e1: A, e2: A): A
    }

    class Eval extends Algebra[Value] {
      def lit(x: Int) = VInt(x)

      def add(e1: Value, e2: Value) = VInt(e1.getInt + e2.getInt)
    }
```    

It's very easy to add new operations using this setting. For example, adding the print operation can be done in a straightforward manner:

```
    // Code Snippet: 3
    
    class Printer extends Algebra[String] {
      def lit(x: Int) = x.toString

      def add(e1: String, e2: String) = "(%s + %s)".format(e1, e2)
    }
```

The visitor pattern, however, has some drawbacks as well: it is difficult to add new data variants! For example, if we want to add a subtraction expression `Sub`, then we need to modify the trait `Algebra`, and all its implementations to include a method `sub`. In addition, we had to modify the original `Exp` interface to include an `accept` method: this might not be `accept`able in several situations. 

### Factory using Object Algebra

As mentioned before, the trait `Algebra` is an object algebra interface, and any implementation of it is an object algebra. Interestingly, we can implement an expression factory (with `Exp` not having any special `accept` methods) using the same interface as shown below:

```
    // Code Snippet: 4

    trait Exp 

    case class Lit(x: Int) extends Exp
    case class Add(e1: Exp, e2: Exp) extends Exp 

    trait Algebra[A] {
      def lit(x: Int): A
      def add(e1: A, e2: A): A
    }

    class Factory extends Algebra[Exp] {
      def lit(x: Int) = Lit(x)

      def add(e1: Exp, e2: Exp) = Add(e1, e2)
    }
```

Using this `Factory`, we can create an `Exp` as follows: `f.add(f.lit(1), f.lit(2))`, where `f` is an instance of `Factory`. One can also imagine a `parse` function in a similar spirit: 

```
    // Code Snippet: 5

    def parse[A](alg: Algebra[A], s: String): A = {
      if (s == "0") alg.lit(0)
      else ...
    }
```
If we pass an instance of `Factory` as `alg` to `parse`, we would get back an expression parsed from the string. 

### Retroactive Implementations

Say that we want to add printing operation to `Exp` in code snippet 4. Without requiring any modifications to the exisiting code, here is how to do it using object algebras: 

```
    // Code Snippet: 6

    trait IPrint {
      def print: String
    }

    class Printer extends Algebra[IPrint] {
      def lit(x: Int) =  {
        new IPrint {
          def print = x.toString
        }
      }

      def add(e1: IPrint, e2: IPrint) = {
        new IPrint {
          def print = e1.print + " + " + e2.print
        }
      }
    }
```  

By passing an instance of `Printer` defined above as the first parameter to the `parse` function in code snippet 5, and calling `print` on what `parse` returns, we can print out the expression parsed. 

We can also extend the code snippet 4, to include evaluators over `Exp`:

```
    // Code Snippet: 7

    trait IEval {
      def eval: Value
    }

    class Evaluator extends Algebra[IEval] {
      def lit(x: Int) = {
        new IEval {
          def eval = VInt(x)
        }
      }

      def add(e1: IEval, e2: IEval) = {
        new IEval {
          def eval = VInt(e1.eval.getInt + e2.eval.getInt)
        }
      }
    }
```    

### Adding New Operations

Code snippet 3 can be combined with code snippet 4 to implement printing for expressions. The difference between this, and the version of printing described in code snippet 6 is that, in code snippet 6, an intermediate object is created (of type `IPrint`), on which the `print` is invoked, where as by using `Printer` directly, the intermediate object creation can be avoided. Essentially, we have used visitors as object algebras, and this is useful for bottom-up style computations (essentially, for operations that can be encoded as folds). Notice that adding a new operation did not require any modifications to the original code (in code snippet 4).

### Adding New Data Variants

It is easy to add new data variants to code snippet 4. First, let us add booleans and conditional expressions:

```
    // Code Snippet: 8
    case class Bool(b: Boolean) extends Exp
    case class Iff(e1: Exp, e2: Exp, e3: Exp) extends Exp
```

We then extend the `Algebra` to include support for these new expressions:

```
    // Code Snipptet: 9
    trait ExtendedAlgebra[A] extends Algebra[A] {
      def bool(b: Boolean): A
      def iff(e1: A, e2: A, e3: A): A
    }
```

Finally, we extend the `Factory` to manufacture the new expressions as well:

```
    // Code Snippet: 10
    class ExtendedFactory extends Factory with ExtendedAlgebra[Exp] {
      def bool(b: Boolean) = Bool(b)

      def iff(e1: Exp, e2: Exp, e3: Exp) = Iff(e1, e2, e3)
    }
```

That's it! We have now added new data invariants, without having to modify any of the original code. We can extend the printing operation in code snippet 3 to deal with the new extentions:

```
    class ExtendedPrinter extends Printer with ExtendedAlgebra[String] {
      def bool(b: Boolean) = b.toString

      def iff(e1: String, e2: String, e3: String) = 
        "if (" + e1 + ") then " + e2 + " else " + e3
    }
```


### References 
[Extensibility for the Masses: Practical Extensibility with Object Algebras.][1]
[1]: Extensibility for the Masses: Practical Extensibility with Object Algebras. Bruno C. d. S. Oliveira and William R. Cook. 