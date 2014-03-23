2048 Solver
-----------

 * original game: http://gabrielecirulli.github.io/2048/
 * autosolver: http://austinmiller.us/2048/ (press one of the buttons on lower left)
 * normal distribution: http://www.wolframalpha.com/input/?i=average+19900+and+standard+deviation+11258



The source code for this game is not mine, and was found on this site: 
http://gabrielecirulli.github.io/2048/

I thought it would be a fun problem to try write a solver.  I refactored the 
original code slightly to make this easier by sticking all of the grid related
concepts in the grid class and creating a means of copying the grid to another
grid as well as refactoring how the game makes a "move".

The code that chooses how to move is in weights.js and this is entirely my code.

You can see the solver try to auto-solve a game by going to my website at this
link: http://austinmiller.us/2048/

Current state as of this upload is only an afternoon writing it and spend an
embarrassing 90 minutes on a silly Javascript feature bug.  The weights are
horrible and the calculation of possible future paths is pretty bad.

I have many ideas for improvement.

I want to create a test scenario to play as the solver for a 1,000 iterations and
come up with stats like standard deviation, mean, max, min, etc.  Then from there
some automatic testing of different weights or maybe even something *gasp* genetic
could be done.
