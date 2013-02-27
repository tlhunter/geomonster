# GeoMonsters

A project by Jon Kuperman, Kelly King, and Thomas Hunter.

## Gameplay Overview

GeoMonsters is a game about combating and collecting monsters, similar to Pokémon. The big difference
though is that the game is entirely based on geolocation. Each player of the game has an avatar in the
game which is in the same location as the player in the real world (or, at least, their mobile
device or computer). Players will be able to see monsters on their computing device, approach them, 
and engage in combat. Players will also be able to see other players playing the game.

We don't want to stop this at physical location though; lets make the game able to consume other
aspetcs of the world around us. For example, some monsters may only come out at night, others when it
is winter or a certain temperature or while it is raining. That information can all be taken from
various API's providing information such as weather and sunset times. We can also look at things such
as the environment maps, see which areas represent forests, which are bodies of water, etc.

Imagine, a kid wanting to take a boat ride to the middle of lake Michigan to catch an extremely rare
water monster. Or, going to death valley to capture an overpowered fire monster. Perhaps going into a
cemetary at night to capture an evil monster. Or maybe a cemetary, at night, during a full moon. This
could easily become one of the most addictive games ever played.

## Platforms

We'll start off as an HTML5 application, as it works everywhere. Eventually we'll want to go native.

* Browser
* Android
* iOS

## Technologies

* Node.js for all your server needs
* REDIS for persisting monster and player locations
* SQL for persisting game mechanics and rules

## Monetization

* Microtransactions
 * Purchase in-game currency
 * Personalize your avatar
 * Buy a skill so that your monster can retrieve incapacitated monsters
* Partnerships
 * Make your business a monster hospital
 * Stage fights at your school or business
