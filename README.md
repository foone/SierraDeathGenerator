Sierra Death Screen Generator
=============================

> Try it out: [foone.github.io/SierraDeathGenerator](https://foone.github.io/SierraDeathGenerator)

This creates GAME OVER/YOU DIED screens as seen in Sierra Online's SCI engine.
Right now, it supports:

* Adventures in the Magic Kingdom
* Aero Fighters II
* Ancients 1: Death Watch
* Bad Dudes
* Bio Menace
* Castlevania II: Simon's Quest
* Castlevania: Symphony of the Night (PS1)
* Cave Story
* Codename: ICEMAN
* The Colonel's Bequest (Laura Bow 1)
* Commander Keen 4
* Cosmo's Cosmic Adventure
* Crowtel Renovations
* Deus Ex
* Doom
* DOS text screens
* DOS 6's EDIT.COM text editor
* Duke Nukem 1
* Ecco the Dolphin
* Final Fantasy VII
* Gold Rush!
* Golgo 13: Top Secret Episode
* King's Quest 4
* King's Quest 5
* Legend of Zelda
* Life & Death
* Manhunter: New York
* Metal Gear Solid
* Metroid
* Minit
* Mortal Kombat II
* Roland MT-32 Synth Module LCD
* Ninja Gaiden
* Oregon Trail
* Pokemon Red/Blue/Yellow
* Police Quest 2
* Police Quest 3
* Road Rash (for the Genesis/Megadrive)
* Rygar
* SimCity 2000 Advisors
* Super Mario 64
* Super Mario World
* Super Mario Bros
* Super Metroid
* Space Quest 3
* Space Quest 4
* Stardew Valley
* Star Fox (Starwing in Europe)
* Street Fighter II
* Teenage Mutant Ninja Turtles 1 (NES)
* ToeJam & Earl in Panic on Funkotron (ToeJame & Earl 2)
* Wally Bear and the NO! Gang
* Wrath of the Black Manta\
* Zelda 2: The Adventure of Link
* Zero Wing (Genesis/Megadrive)

Creating a new font
===================

This is mainly a guide for me so I don't forget.

1. Extract the font file from the game using one of the SCI viewers, like SCI Companion or SCI Viewer
2. Run sci-font-extract.py to generate the font file + json file
3. Edit the json file to add the height/origin/box/null-character fields
4. Screenshot a game over in the game, crop the death screen, then edit out the text

TODO
====

* Support more games!
* Add a twitter-safe saving option, for death screens that aren't inherently twitter-safe
* Add options to adjust scaling.
* Let you change the titlebar text?
* Add custom backgrounds, not just the error box?
* Automatic word-wrapping so you don't have to do it manually like a caveman
* A way to automate conversion, so you could do things like make twitterbots out of this?
* Merge the source images?

Other games to add
------------------
* Every SCI game
* AGI games?

