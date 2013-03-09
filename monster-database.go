/**
 * This app is an in-memory databse of monster locations. Monsters will continuously move around.
 * A Node.js app will subscribe to these events, by reporting the latitude and longitude positions
 * of players. This go app will then only report locations of monsters near those players.
 *
 * This app will be pretty simple, and should be pretty fast.
 * Not sure if it should use inter-process communication, or a TCP port listening on localhost.
 */
package main

import "fmt"

func main() {
	fmt.Println("Hello, 世界")
}

// DATA: Players: ID(bigint), LAT(float), LON(float)
// DATA: Monsters: ID(bigint), LAT(float), LON(float), TYPE(int), LEVEL(int), EXP(bigint), LAST_SEEN(datetime), PERSIST(bool), CREATED(datetime)

// INPUT: Function to update player location
// INPUT: Function to remove player
// INPUT: Function to manually add a monster

// INTERVAL: Delete monsters when their LAST_SEEN > 12 hours AND !PERSIST
// INTERVAL: Slowly increase monster EXP, level them up
// INTERVAL: Continuously move monsters around

// OUTPUT: Monster Info (location changed, level up)
// OUTPUT: Monster has been destroyed
