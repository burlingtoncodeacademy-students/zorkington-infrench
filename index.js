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
// global variables.
// array of player inventory
let playerInv = ["note"];
// index number of item to be dropped
let droppedItemIndex;
// the item to be dropped
let droppedItem;
// index of the item to be removed from a rooms inventory
let removedItemIndex;
// the players status.
let player = {
  name: "",
};

class Room {
  constructor(
    name,
    description,
    inventory = [],
    north = undefined,
    south = undefined,
    east = undefined,
    west = undefined,
    locked
  ) {
    this.name = name;
    this.description = description;
    this.inventory = inventory;
    this.north = north;
    this.south = south;
    this.east = east;
    this.west = west;
    this.locked = locked || false;
  }
  capitalize() {
    let firstLetter = this.name[0];
    let restOfWord = this.name.slice(1);
    return firstLetter.toUpperCase() + restOfWord.toLowerCase();
  }
}

let outside = new Room(
  "outside",
  "You are facing south, looking into the mouth of a dark cave. There are some rocks on the ground, but little else of note. Behind you to the north is the grassy field. either side of you are steep cliff walls.",
  ["rock"],
  undefined,
  "cave"
);
let cave = new Room(
  "cavern",
  "You are in a large, dimly lit cavern. The only light is coming from a tunnel to the east. There is a large pile of rocks in a corner on the west wall. Leaning against a large boulder in the center of the room is a shovel. To the south is a stairway leading to complete darkness.",
  ["boulder", "shovel", "rockpile"],
  "outside",
  "lowercavern",
  "sideroom",
  "hiddenroom"
);

let sideroom = new Room(
  "sideroom",
  "The tunnel widens slightly before ending abruptly. It appears that some time ago this passageway continued, but the ceiling caved in ahead. On the ground is a lantern, the source of light you saw before",
  ["lantern"],
  undefined,
  undefined,
  undefined,
  "cave"
);

let hiddenroom = new Room(
  "hiddenroom",
  "The crevice opens to reveal a small room. Here you see a dusty table littered with old parchments and maps. To the south is a dark, winding tunnel leading downwards.",
  ["key", "desk"],
  undefined,
  "lowercavern",
  "cave",
  undefined,
  true
);

let lowercavern = new Room(
  "lowercavern",
  "description of location",
  [],
  "cave",
  undefined,
  "endroom",
  "hiddenroom"
);

let endroom = new Room(
  "endroom",
  "description of location",
  ["win"],
  undefined,
  undefined,
  undefined,
  "lowercavern",
  true
);

let currentRoom = "outside";

let roomChange = {
  outside: ["cave"],
  cave: ["sideroom", "hiddenroom", "lowercavern", "outside"],
  sideroom: ["cave"],
  hiddenroom: ["cave", "lowercavern"],
  lowercavern: ["cave", "hiddenroom", "endroom"],
};

let roomLookupTable = {
  outside: outside,
  cave: cave,
  sideroom: sideroom,
  hiddenroom: hiddenroom,
  lowercavern: lowercavern,
  endroom: endroom,
};

class Item {
  constructor(name, description, action, takeable) {
    this.name = name;
    this.description = description;
    this.action = action || false;
    this.takeable = takeable || false;
  }

  use() {
    if (this.name === "rock") {
      droppedItemIndex = playerInv.indexOf(this.name);
      playerInv.splice(droppedItemIndex, 1).toString();
      return this.action;
    } else {
      return this.action;
    }
  }

  take() {
    if (this.takeable) {
      if (roomLookupTable[currentRoom].inventory.includes(this.name)) {
        if (this.name === "win") {
          console.log("Congratulations! You win!");
          process.exit();
        } else {
          removedItemIndex = roomLookupTable[currentRoom].inventory.indexOf(
            this.name
          );
          roomLookupTable[currentRoom].inventory.splice(removedItemIndex, 1);
          playerInv.push(this.name);
          return `You picked up ${this.name}`;
        }
      } else {
        return `There is no ${this.name} to take`;
      }
    } else {
      return "You can't take that";
    }
  }

  examine() {
    return this.description;
  }
  drop() {
    droppedItemIndex = playerInv.indexOf(this.name);
    droppedItem = playerInv.splice(droppedItemIndex, 1).toString();
    return `You dropped the ${this.name}`;
  }
}

let note = new Item(
  "note",
  `A hastily written note containing what seems to be rules to something. Strange. It reads:\n"You can interact with your surroundings by typing an [action] followed by a [target]. Acceptable actions are [use, take, examine, drop, walk, enter, inventory]. [use, take] are followed by an item. You can 'examine' an item or a room. You can 'walk' in a cardinal direction. You can 'enter' a room. You can check your inventory with 'i', 'inventory', or 'take inventory'. Type items and rooms exactly how they appear. Good luck."`,
  `A hastily written note containing what seems to be rules to something. Strange. It reads:\n"You can interact with your surroundings by typing an [action] followed by a [target]. Acceptable actions are [use, take, examine, drop, walk, enter, inventory]. [use, take] are followed by an item. You can 'examine' an item or a room. You can 'walk' in a cardinal direction. You can 'enter' a room. You can check your inventory with 'i', 'inventory', or 'take inventory'. Type items and rooms exactly how they appear. Good luck."`,
  true
);

let shovel = new Item(
  "shovel",
  "A rusty old shovel. Doesn't look like anyone has used it in a while.",
  "This may be useful for something.",
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
  "the lantern lights, filling the room with a warm glow",
  true
);

let rock = new Item(
  "rock",
  "a small rock",
  "you throw the rock. now it's gone. good job",
  true
);

let boulder = new Item("boulder", "A very large rock. Seems immovable");

let rockpile = new Item(
  "rockpile",
  "a loose pile of rocks. There appears to be something behind it. If only you had some way to clear this..."
);

let win = new Item("win", "take this and you win", "you win", true);

let itemLookupTable = {
  key: key,
  shovel: shovel,
  lantern: lantern,
  rock: rock,
  boulder: boulder,
  note: note,
  rockpile: rockpile,
  win: win,
};

async function yourName() {
  player.name = await ask("What is your name?\n>_");
  console.log(
    `Now you remember. You are ${player.name}. \nYou feel something in your pocket(inventory).\nThe sun is setting and it's getting cold...`
  );
  start();
}
async function start() {
  let answer = await ask("What would you like to do?\n>_");
  let inputArray = answer.toLowerCase().split(" ");
  let action = inputArray[0];
  let target = inputArray[1];
  let obj = inputArray[2];

  if (action === "take") {
    if (target === "inventory") {
      if (playerInv.length === 0) {
        console.log("Your inventory is empty");
      } else {
        console.log(playerInv.join("\n"));
      }
    } else if (!itemLookupTable[target]) {
      console.log(`You can't take ${target}`);
    } else {
      console.log(itemLookupTable[target].take());
    }
  } else if (action === "use") {
    if (!playerInv.includes(target)) {
      console.log("You can't use what you don't have!");
    } else if (
      roomLookupTable[currentRoom].inventory.includes(obj) &&
      obj === "rockpile" &&
      target === "shovel"
    ) {
      removedItemIndex = roomLookupTable[currentRoom].inventory.indexOf(obj);
      roomLookupTable[currentRoom].inventory.splice(removedItemIndex, 1);
      console.log(
        "You clear the rocks to see a passageway leading to a hidden room."
      );
    } else {
      console.log(itemLookupTable[target].use());
    }
  } else if (action === "examine") {
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
  } else if (action === "drop") {
    if (playerInv.includes(target)) {
      console.log(itemLookupTable[target].drop());
      roomLookupTable[currentRoom].inventory.push(droppedItem);
    } else {
      console.log("You can't drop what you don't have!");
    }
  } else if (action === "walk") {
    if (target === "north") {
      if (currentRoom === "outside") {
        console.log(
          "You walk away from the cave into the open field. As the sun sets, darkness envelops you. It becomes cold. Very cold. You die."
        );
        process.exit();
      } else if (roomLookupTable[currentRoom].north === undefined) {
        console.log("You can't walk north");
      } else {
        currentRoom = roomLookupTable[currentRoom].north;
        console.log(
          roomLookupTable[currentRoom].capitalize(),
          "\n",
          roomLookupTable[currentRoom].description
        );
      }
    }
    if (target === "south") {
      if (roomLookupTable[currentRoom].south === undefined) {
        console.log("You can't walk south");
      } else if (currentRoom === "cave" && !playerInv.includes("lantern")) {
        console.log(
          `You descend the stairs into complete darkness. You can't see anything. As you're walking down, your foot hits something and you trip down the stairs. You died.`
        );
        process.exit();
      } else if (currentRoom === "cave" && playerInv.includes("lantern")) {
        currentRoom = roomLookupTable[currentRoom].south;
        console.log(
          roomLookupTable[currentRoom].capitalize(),
          "\n",
          roomLookupTable[currentRoom].description
        );
      } else {
        currentRoom = roomLookupTable[currentRoom].south;
        console.log(
          roomLookupTable[currentRoom].capitalize(),
          "\n",
          roomLookupTable[currentRoom].description
        );
      }
    }
    if (target === "east") {
      if (roomLookupTable[currentRoom].east === undefined) {
        console.log("You can't walk east");
      } else if (currentRoom === "lowercavern" && !playerInv.includes("key")) {
        console.log(`The door is locked.`);
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
      } else {
        currentRoom = roomLookupTable[currentRoom].east;
        console.log(
          roomLookupTable[currentRoom].capitalize(),
          "\n",
          roomLookupTable[currentRoom].description
        );
      }
    }
    if (target === "west") {
      if (roomLookupTable[currentRoom].west === undefined) {
        console.log("You can't walk west");
      } else if (
        currentRoom === "cave" &&
        cave.inventory.includes("rockpile")
      ) {
        console.log("There seems to be a pile of rocks in the way");
      } else {
        currentRoom = roomLookupTable[currentRoom].west;
        console.log(
          roomLookupTable[currentRoom].capitalize(),
          "\n",
          roomLookupTable[currentRoom].description
        );
      }
    }
  } else if (action === "enter") {
    if (roomChange[currentRoom].includes(target)) {
      if (target === "endroom" && !playerInv.includes("key")) {
        console.log(`The door is locked.`);
      } else if (target === "endroom" && playerInv.includes("key")) {
        console.log(`You open the door with your key.\n You enter ${target}`);
        currentRoom = target;
        console.log(
          roomLookupTable[currentRoom].capitalize(),
          "\n",
          roomLookupTable[currentRoom].description
        );
      } else if (
        target === "hiddenroom" &&
        cave.inventory.includes("rockpile")
      ) {
        console.log("There seems to be a pile of rocks in the way");
      } else {
        currentRoom = target;
        console.log(
          roomLookupTable[currentRoom].capitalize(),
          "\n",
          roomLookupTable[currentRoom].description
        );
      }
    } else if (currentRoom === target) {
      console.log(`You're already in ${target}`);
    } else {
      console.log(`you can't enter ${target} from this location`);
    }
  } else if (action === "inventory" || action === "i") {
    if (playerInv.length === 0) {
      console.log("Your inventory is empty");
    } else {
      console.log(playerInv.join("\n"));
    }
  } else {
    console.log("You can't do that.");
  }
  return start();
}
console.log(`Outside.
You awaken on the edge of a great plain at the foot of a mountain. 
You are facing the mouth of a dark cave leading into the roots of the mountain.
You don't remember who you are or how you got here.`);

yourName();

// global variable: inventory
// classes: item, room
// each room needs inventory
// item lookupTable
// room lookupTable
// room state machine
// item state machine
// awaken confused.
// room 1. mouth of cave. compelled to continue. if go back, leave gameYou are facing south, looking into the mouth of a dark cave.
// behind you to the north is the plain. either side of you are steep cliff walls.
// You do not know where you are or how you got here, but something compels you to enter this cave...
// room 1 inventory
// room 2. entrance cavern. passage east. staircase south. hidden passage west.
// room 2 inventory
// room 3. east of room 2. small room.
// room 3 inventory: key or lightsource?
// room 4. west of room 2. hidden room. passage south leading southeast and down to room 5.
// room 4 inventory: key?
// room 5. south of entrance cavern. lower cavern.
// room 5 inventory
// room 6. east of room 5. victory room

// find index of an item that is input by user. find the .indexof user input. assign that idex number to a variable. roominventory.splice[variable]. or somethihng
