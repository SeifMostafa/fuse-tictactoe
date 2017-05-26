# Tic-Tac-Toe

A simple example of a tic-tac-toe game written with [Fuse](https://fusetools.com/)

![Screenshot](https://cloud.githubusercontent.com/assets/1308999/26492933/0c37d2c0-4217-11e7-8502-51fed254cb3f.png)


## Gameplay

This is a local two-player game. Players take turns tapping the screen to place their mark. The person who gets three in a row wins.


## Mechanics

The game state is maintained in JavaScript. `Observable` is used to expose variables that need to be reflected in visual updates.

The visuals are managed with UX. Updates are done via reactive programming -- changes in the game state are automatically reflected in the interface.

