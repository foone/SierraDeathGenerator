## Dev info

Building this generator took about 5 hours, in one sitting.

No new tools were made or changes to the generator, though I did have an idea for a tool:

A de-gridder! to take an image which has gridlines and removes them.

I got around the lack of this tool by using the following set of commands:

```
$ linearize.py font.png (W+1) H+1
$ delinearize.py --spacing 1 --across N font-linear.png W H
$ linearize.py font-linear-rect.png W H 
```

But it should definitely be possible to do this in one script without much work.

## Tools used:

* mame 0.202, primarily the tile tool (F4)
* FBA-RR 0.0.7 + [this TAS](http://tasvideos.org/3253M.html) to get screenshots of the end of the game
* paint.net for image wrangling

## Twitter thread

* [Launch thread](https://twitter.com/Foone/status/1057597420735844352)
* [Preview/rant thread](https://twitter.com/Foone/status/1057553217024745473)