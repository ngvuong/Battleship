# Battleship

https://ngvuong.github.io/Battleship/

A simple Battleship game played against a computer. On desktop, deploy your fleet by draging and dropping ships on the board. Otherwise, to quickly start a game, simply click randomize and start your game.

## Technologies and key concepts

Using plain javascript, html, and css, this project reinforces best practices coupled with testing to make sure the game logic is soundly crafted. The Pubsub pattern was used heavily to enable separation of code where appropriate. This allows DOM manipulation to be completely detached from the game logic.

Testing: Jest testing with main components logic
Drag and drop API: Configure events for draggable objects and dropzones
Debugging: Diagnose and fix bugs within a system with randomness at play
