== Sierra Death Screen Generator

This creates GAME OVER/YOU DIED screens as seen in Sierra Online's SCI engine.
Right now, it only supports Police Quest 2

== Creating a new font ==

This is mainly a guide for me so I don't forget.

1. Extract the font file from the game using one of the SCI viewers, like SCI Companion or SCI Viewer
2. Run sci-font-extract.py to generate the font file + json file
3. Edit the json file to add the height/origin/box/null-character fields
4. Screenshot a game over in the game, crop the death screen, then edit out the text

== TODO ==

* Actually support games other than PQ2?
* Add a twitter-safe saving option, for death screens that aren't inherently twitter-safe
* Add options to adjust scaling.
* Let you change the titlebar text?
* Add custom backgrounds, not just the error box?

=== Other games to add ===
* Every SCI game
* AGI games?
* SimCity 2000 (YOU CAN'T CUT BACK ON FUNDING YOU WILL REGRET THIS!)