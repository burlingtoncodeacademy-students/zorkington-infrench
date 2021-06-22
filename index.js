const readline = require("readline");
const readlineInterface = readline.createInterface(
  process.stdin,
  process.stdout
);

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });
}
// !-------------------------------- global variables.
// array of player inventory
let playerInv = ["note"];
// index number of item to be dropped
let droppedItemIndex;
// the item to be dropped
let droppedItem;
// index of the item to be removed from a rooms inventory
let removedItemIndex;
// the current location
let currentRoom = "outside";
// the players status
let player = {
  name: "",
  location: currentRoom,
};

//  !-------------------------------- room class.
class Room {
  constructor(
    name,
    description,
    inventory = [],
    // the room in the direction relative to this room
    north = undefined,
    south = undefined,
    east = undefined,
    west = undefined
  ) {
    this.name = name;
    this.description = description;
    this.inventory = inventory;
    this.north = north;
    this.south = south;
    this.east = east;
    this.west = west;
  }
  // capitalize room name
  capitalize() {
    let firstLetter = this.name[0];
    let restOfWord = this.name.slice(1);
    return firstLetter.toUpperCase() + restOfWord.toLowerCase();
  }
}
// !--------------------------------- room objects
let outside = new Room(
  "outside",
  "You are facing south, looking into the mouth of a dark cave. There are some rocks on the ground, but little else of note. Behind you to the north is the grassy field. either side of you are steep cliff walls.",
  ["rock"],
  undefined,
  "cave"
);
let cave = new Room(
  "cave",
  "You are in a large, dimly lit cavern. The only light is coming from a tunnel to the east. There is a large pile of rocks in a corner on the west wall. Leaning against a large boulder near the center of the room is a shovel. To the south is a stairway leading down to complete darkness.",
  ["boulder", "shovel", "rocks"],
  "outside",
  "lowercavern",
  "tunnel",
  "hiddenroom"
);

let tunnel = new Room(
  "tunnel",
  "The tunnel widens slightly before ending abruptly. It appears that some time ago this passageway continued, but the ceiling caved in ahead. On the ground is a lantern, the source of light you saw before",
  ["lantern"],
  undefined,
  undefined,
  undefined,
  "cave"
);

let hiddenroom = new Room(
  "hiddenroom",
  "The crevice opens to reveal a small room. Here you see a dusty table littered with old parchments and maps.",
  ["key", "table"],
  undefined,
  undefined,
  "cave",
  undefined
);

let lowercavern = new Room(
  "lowercavern",
  "You are in a cavern that looks much like the one above. It is completely barren aside from a heavy wooden door on the east wall.",
  ["door"],
  "cave",
  undefined,
  "deadend"
);

let deadend = new Room(
  "deadend",
  "You are in a small chamber. Far away moonlight is coming through a hole in the ceiling. In the far corner, you see a rope on the ground.",
  ["rope"],
  undefined,
  undefined,
  undefined,
  "lowercavern"
);
// object for location state machine
let roomChange = {
  outside: ["cave"],
  cave: ["tunnel", "hiddenroom", "lowercavern", "outside"],
  tunnel: ["cave"],
  hiddenroom: ["cave"],
  lowercavern: ["cave", "deadend"],
  deadend: ["lowercavern"],
};
// room lookup table
let roomLookupTable = {
  outside: outside,
  cave: cave,
  tunnel: tunnel,
  hiddenroom: hiddenroom,
  lowercavern: lowercavern,
  deadend: deadend,
};
// !-------------------------------- item class
class Item {
  constructor(name, description, action, takeable) {
    this.name = name;
    this.description = description;
    this.action = action || false;
    this.takeable = takeable || false;
  }
  // function for use action
  use() {
    if (this.name === "rock") {
      droppedItemIndex = playerInv.indexOf(this.name);
      playerInv.splice(droppedItemIndex, 1).toString();
      return this.action;
    } else if (
      this.name === "shovel" &&
      currentRoom === "cave" &&
      roomLookupTable[currentRoom].inventory.includes("rocks")
    ) {
      removedItemIndex =
        roomLookupTable[currentRoom].inventory.indexOf("rocks");
      roomLookupTable[currentRoom].inventory.splice(removedItemIndex, 1);
      return "You clear the rocks on the west wall to see a passageway leading to a hidden room.";
    } else {
      return this.action;
    }
  }
  // function for take action
  take() {
    if (this.takeable) {
      if (roomLookupTable[currentRoom].inventory.includes(this.name)) {
        removedItemIndex = roomLookupTable[currentRoom].inventory.indexOf(
          this.name
        );
        roomLookupTable[currentRoom].inventory.splice(removedItemIndex, 1);
        playerInv.push(this.name);
        return `You picked up ${this.name}`;
      } else {
        return `There is no ${this.name} to take`;
      }
    } else {
      return "You can't take that";
    }
  }
  // function for examine action
  examine() {
    return this.description;
  }
  // function for drop action
  drop() {
    droppedItemIndex = playerInv.indexOf(this.name);
    droppedItem = playerInv.splice(droppedItemIndex, 1).toString();
    return `You dropped the ${this.name}`;
  }

  read() {
    if (this.name === "note") {
      return this.description;
    } else {
      return "You can't read that";
    }
  }
}
// !------------------------------- item objects
let note = new Item(
  "note",
  `A hastily written note containing what seems to be rules to something. Strange. It reads:\n"You can interact with your surroundings by typing an [action] followed by a [target]. Acceptable actions are [use, take, examine, drop, walk, enter, inventory]. [use, take] are followed by an item. You can 'examine' an item or a room. You can 'walk' in a cardinal direction. You can 'enter' a room. You can check your inventory with 'i', 'inventory', or 'take inventory'. Type items and rooms exactly how they appear. Good luck."`,
  `A hastily written note containing what seems to be rules to something. Strange. It reads:\n"You can interact with your surroundings by typing an [action] followed by a [target]. Acceptable actions are [use, take, examine, drop, walk, enter, inventory]. [use, take] are followed by an item. You can 'examine' an item or a room. You can 'walk' in a cardinal direction. You can 'enter' a room. You can check your inventory with 'i', 'inventory', or 'take inventory'. Type items and rooms exactly how they appear. Good luck."`,
  true
);

let shovel = new Item(
  "shovel",
  "A rusty old shovel. Doesn't look like anyone has used it in a while.",
  "There is nothing here to use this shovel on",
  true
);

let key = new Item(
  "key",
  "A small brass key",
  "This probably unlocks something...",
  true
);

let lantern = new Item(
  "lantern",
  "A glass oil lantern. May it be a light to you in dark places when all other lights go out",
  "The lantern is already lit",
  true
);

let rock = new Item(
  "rock",
  "a small rock",
  "you throw the rock. now it's gone. good job",
  true
);

let boulder = new Item("boulder", "A very large rock. Seems immovable");

let rocks = new Item(
  "rocks",
  "a pile of rocks. There appears to be something behind it. If only you had some way to clear this..."
);

let table = new Item("table", "amongst the papers on the table, you see a key");

let door = new Item("door", "a heavy wooden door with a keyhole.");

let rope = new Item(
  "rope",
  "a long rope with a grappling hook fixed to one end",
  "there is nowhere to use this here",
  true
);
// item lookup table
let itemLookupTable = {
  key: key,
  shovel: shovel,
  lantern: lantern,
  rock: rock,
  boulder: boulder,
  note: note,
  rocks: rocks,
  table: table,
  door: door,
  rope: rope,
};
// asks the user for a name and adds it to the name property in the player status object
async function yourName() {
  player.name = await ask("What is your name?\n>_");
  console.log(
    `Ah yes. You are ${player.name}. \nThe sun is setting and it's getting cold. You know that to turn back now would be certain death... \nYou feel something in your pocket(inventory)...`
  );
  // calls the function to run the rest of the game
  start();
}
// the main function that runs the game
async function start() {
  // takes user input. lowercases and turns input into an array. first word in array becomes the action, second becomes the target.
  let answer = await ask("What would you like to do?\n>_");
  let inputArray = answer.toLowerCase().split(" ");
  let action = inputArray[0];
  let target = inputArray[1];
  // 'take' action
  if (action === "take") {
    // if target is inventory, show inventory
    if (target === "inventory") {
      if (playerInv.length === 0) {
        console.log("Your inventory is empty");
      } else {
        // turns inventory into a string
        console.log(playerInv.join("\n"));
      }
      // checks if the item is in the lookup table
    } else if (!itemLookupTable[target]) {
      console.log(`You can't take ${target}`);
      // runs take function from the item class on the target
    } else {
      console.log(itemLookupTable[target].take());
    }
    // 'use' action
  } else if (action === "use") {
    // checks if the target is in the user's inventory
    if (!playerInv.includes(target)) {
      console.log("You can't use what you don't have!");
    } else if (target === "rope" && currentRoom === "deadend") {
      console.log(
        `Impressively, you throw the rope up into the hole in the ceiling, where it hooks to the opening far above. You give it a firm tug and it seems to be sturdy. As you begin to climb, you can smell the fresh air coming from above and you know that you will finally make it through this mountain. Now, to continue your journey...\nCongratulations! You Win!`
      );
      process.exit();
      // runs use function on the target
    } else {
      console.log(itemLookupTable[target].use());
    }
    // 'examine' action
  } else if (action === "examine") {
    // if the target is in the player inventory or the current room inventory, run the examine function on the target
    if (
      roomLookupTable[currentRoom].inventory.includes(target) ||
      playerInv.includes(target)
    ) {
      console.log(itemLookupTable[target].examine());
    } else if (currentRoom.includes(target)) {
      console.log(roomLookupTable[currentRoom].description);
    } else {
      console.log(`there is no ${target} to examine`);
    }
    // drop action
  } else if (action === "drop") {
    // if player inventory includes target item, run drop function and add the item to the rooms inventory
    if (playerInv.includes(target)) {
      console.log(itemLookupTable[target].drop());
      roomLookupTable[currentRoom].inventory.push(droppedItem);
    } else {
      console.log("You can't drop what you don't have!");
    }
    // 'read' action
  } else if (action === "read") {
    if (playerInv.includes(target)) {
      console.log(itemLookupTable[target].read());
    } else {
      console.log("You can only read something if it's in your inventory");
    }
    // walk action. takes a direction as target
  } else if (action === "walk") {
    // north
    if (target === "north") {
      // if you are outside, end game if user walks north
      if (currentRoom === "outside") {
        console.log(
          "You walk away from the cave into the open field. As the sun sets, darkness envelops you. It becomes cold. Very cold. You died."
        );
        process.exit();
        // checks if the current room has no room to the north
      } else if (roomLookupTable[currentRoom].north === undefined) {
        console.log("You can't walk north");
        // change current room to the room north
      } else {
        currentRoom = roomLookupTable[currentRoom].north;
        // print new room name and description
        console.log(
          roomLookupTable[currentRoom].capitalize(),
          "\n",
          roomLookupTable[currentRoom].description
        );
      }
      // south
    } else if (target === "south") {
      // same check as above
      if (roomLookupTable[currentRoom].south === undefined) {
        console.log("You can't walk south");
        // if the user is in the first cave room and tries to walk to the lower cavern without light, game ends.
      } else if (currentRoom === "cave" && !playerInv.includes("lantern")) {
        console.log(
          `You descend the stairs into complete darkness. You can't see anything. As you're walking down, your foot hits something and you trip down the stairs. You died.`
        );
        process.exit();
        // allows user to enter lower cavern if they have light
      } else if (currentRoom === "cave" && playerInv.includes("lantern")) {
        currentRoom = roomLookupTable[currentRoom].south;
        console.log(
          roomLookupTable[currentRoom].capitalize(),
          "\n",
          roomLookupTable[currentRoom].description
        );
        // change current room to the room south
      } else {
        currentRoom = roomLookupTable[currentRoom].south;
        console.log(
          roomLookupTable[currentRoom].capitalize(),
          "\n",
          roomLookupTable[currentRoom].description
        );
      }
      // east
    } else if (target === "east") {
      if (roomLookupTable[currentRoom].east === undefined) {
        console.log("You can't walk east");
        // doesn't let user enter the final room without the key
      } else if (currentRoom === "lowercavern" && !playerInv.includes("key")) {
        console.log(`The door is locked.`);
        // allows user to enter the final room with key and prints specific message
      } else if (currentRoom === "lowercavern" && playerInv.includes("key")) {
        currentRoom = roomLookupTable[currentRoom].east;
        console.log(
          `You open the door with your key.\n You enter ${currentRoom}`
        );
        console.log(
          roomLookupTable[currentRoom].capitalize(),
          "\n",
          roomLookupTable[currentRoom].description
        );
        // change current room to room east
      } else {
        currentRoom = roomLookupTable[currentRoom].east;
        console.log(
          roomLookupTable[currentRoom].capitalize(),
          "\n",
          roomLookupTable[currentRoom].description
        );
      }
      // west
    } else if (target === "west") {
      if (roomLookupTable[currentRoom].west === undefined) {
        console.log("You can't walk west");
        // doesn't allow user to enter hiddenroom if the cave inventory includes rocks.
      } else if (currentRoom === "cave" && cave.inventory.includes("rocks")) {
        console.log("There seems to be a pile of rocks in the way");
        // change current room to room west
      } else {
        currentRoom = roomLookupTable[currentRoom].west;
        console.log(
          roomLookupTable[currentRoom].capitalize(),
          "\n",
          roomLookupTable[currentRoom].description
        );
      }
    } else {
      console.log("That is not a direction you can walk in");
    }
    // enter action. takes a room name as a target
  } else if (action === "enter") {
    // checks state machine lookup table
    if (roomChange[currentRoom].includes(target)) {
      // doesn't allow user to enter final room without key
      if (target === "deadend" && !playerInv.includes("key")) {
        console.log(`The door is locked.`);
      } else if (target === "deadend" && playerInv.includes("key")) {
        console.log(`You open the door with your key.\nYou enter ${target}`);
        currentRoom = target;
        console.log(
          roomLookupTable[currentRoom].capitalize(),
          "\n",
          roomLookupTable[currentRoom].description
        );
        // doesnt allow user to enter hidden room if the cave inventory includes rocks
      } else if (target === "hiddenroom" && cave.inventory.includes("rocks")) {
        console.log("There seems to be a pile of rocks in the way");
        // changes current room to target room
      } else {
        currentRoom = target;
        console.log(
          roomLookupTable[currentRoom].capitalize(),
          "\n",
          roomLookupTable[currentRoom].description
        );
      }
      // checks if player is already in the target room
    } else if (currentRoom === target) {
      console.log(`You're already in ${target}`);
      // doesnt allow player to enter a room that is not adjacent or invalid input
    } else {
      console.log(`you can't enter ${target} from this location`);
    }
    // inventory action. allows user to check inventory by typing just i or inventory
  } else if (action === "inventory" || action === "i") {
    // checks if inventory is empty
    if (playerInv.length === 0) {
      console.log("Your inventory is empty");
      // prints inventory as a string with line breaks in between
    } else {
      console.log(playerInv.join("\n"));
    }
    // checks if the input is valid
  } else if (
    action === "check" &&
    (target === "pocket" || target === "inventory")
  ) {
    if (playerInv.length === 0) {
      console.log("Your inventory is empty");
      // prints inventory as a string with line breaks in between
    } else {
      console.log(playerInv.join("\n"));
    }
  } else {
    console.log(`You don't know how to ${action}`);
  }
  // calls the function after every input
  return start();
}
// welcome message
console.log(`Outside.
After many days of travel, you reach the end of a great plain where a mountain range blocks your path.
The only way to continue your journey is to go through the mountains. 
You are facing the mouth of a dark cave leading into the roots of the mountains.
`);
// calls the function to ask name
yourName();
