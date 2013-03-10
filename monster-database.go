/**
 * This app is an in-memory databse of monster locations. Monsters will continuously move around.
 * A Node.js app will subscribe to these events, by reporting the latitude and longitude positions
 * of players. This go app will then only report locations of monsters near those players.
 *
 * This app will be pretty simple, and should be pretty fast.
 * Not sure if it should use inter-process communication, or a TCP port listening on localhost.
 */
package main

import (
	"fmt"
	"time"
	"encoding/json"
	"os"
	"net"
)

const (
	MAX_MONSTERS = 100000 // Upper limit of monsters to have in the world
	MONSTER_EXP_INCREASE = 1 // EXP Points
	MONSTER_EXP_TIMING = 5 // Seconds
	MONSTER_EXPIRATION = 60 * 60 * 12 // Seconds
)

/**
 * Latitude and Longitude pair
 */
type Location struct {
	lat float32 // Latitude
	lon float32 // Longitude
}

/**
 * Information about a player
 */
type Player struct {
	id uint
	loc Location
}

/**
 * A slice of all the players
 */
var players []Player

/**
 * Information about a monster
 */
type Monster struct {
	id uint
	loc Location
	mtype uint32 // Monster Type
	level uint32 // Monster Level (some equation to go from EXP to LVL)
	exp uint64 // Monster EXP
	persist bool // Should we keep this monster around even if he hasn't been seen in a while
	last_seen int64 // Time
	created int64 // Time
}

/**
 * A slice of all the monsters
 */
var monsters []Monster

func main() {
	listener, err := net.Listen("tcp", "0.0.0.0:6666")

	if err != nil {
		println("error listening:", err.Error())
		os.Exit(1)
	}

	for {
		conn, err := listener.Accept()
		if err != nil {
			println("Error accept:", err.Error())
			return
		}
		go EchoFunc(conn)
	}
	// Setup TCP Socket
	// Setup event intervals
	// Load monsters from disk?

	harryTheMonster := Monster{
		id: 1,
		loc: Location{
			lat: 10.0,
			lon: 10.0,
		},
		mtype: 100,
		level: 30,
		exp: 3200,
		persist: true,
		last_seen: time.Now().Unix(),
		created: time.Now().Unix(),
	}

	monsters = append(monsters, harryTheMonster)
	monsters = append(monsters, harryTheMonster)
	monsters = append(monsters, harryTheMonster)

	fmt.Println("Hello, 世界")
	fmt.Println(uint32(time.Now().Unix()))

	b, err := json.Marshal(monsters)
	if err != nil {
		fmt.Println("error:", err)
	}
	fmt.Println(b)
}

func EchoFunc(conn net.Conn) {
	buf := make([]byte, 1024)
	n, err := conn.Read(buf)
	if err != nil {
		println("Error reading:", err.Error())
		return
	}
	println("received ", n, " bytes of data =", string(buf))

	//send reply
	_, err = conn.Write(buf)
	if err != nil {
		println("Error send reply:", err.Error())
	}else {
		println("Reply sent")
	}
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

// Kill the server. Might want to persist monsters to disk?
func input_kill_server() {

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
