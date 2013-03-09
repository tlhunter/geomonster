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
import "time"

const (
	MAX_MONSTERS = 100000 // Upper limit of monsters to have in the world
	MONSTER_EXP_INCREASE = 1 // EXP Points
	MONSTER_EXP_TIMING = 5 // Seconds
	MONSTER_EXPIRATION = 60 * 60 * 12 // Seconds
)

type Player struct {
	id int
	lat float64
	lon float64
}

type Monster struct {
	id int
	lat float64
	long float64
	mtype int
	level int
	exp int
	persist bool
	last_seen int // Time
	created int // Time
}

func main() {
	fmt.Println("Hello, 世界")
	fmt.Println(int32(time.Now().Unix()))
}

// Information about a player has been updated
func input_player() {

}

// A player should be removed from our list
func input_player_remove() {

}

// The server is manually adding a monster, possibly for an event or a company special
func input_add_monster() {

}

// A monster should be removed from our list
func input_remove_monster() {

}

// Iterate through each monster, deleting them if LAST_SEEN > 12 hours AND !persist
func event_delete_old_monsters() {

}

// Iterate through each monster, incrementing their exp by one point, increasing level if applicable
func event_monster_experience() {

}

// Iterate through each monster, moving them slightly
func event_monster_movement() {

}

// Send the information about a monster to the other server, aka their position or level probably changed
func output_monster_info(id int) {

}

// Send the information about a monster being removed to the other server
func output_monster_remove(id int) {

}
