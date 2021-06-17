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

let playerInv = ["note"];
let droppedItemIndex;
let droppedItem;
let removedItemIndex;

class Room {
  constructor(name, description, inventory = [], locked) {
    this.name = name;
    this.description = description;
    this.inventory = inventory;
    this.locked = locked || false;
  }
}

let entrance = new Room(
  "entrance",
  "You are facing south, looking into the mouth of a dark cave. Behind you to the north is the grassy field. either side of you are steep cliff walls.",
  ["rock"]
);
let cave = new Room("cavern", "description of location", [
  "boulder",
  "shovel",
  "rockpile",
]);

let sideroom = new Room("sideroom", "description of location", ["key"]);

let hiddenroom = new Room(
  "hiddenroom",
  "description of location",
  ["lantern"],
  true
);

let lowercavern = new Room("lowercavern", "description of location");

let endroom = new Room("endroom", "description of location", [], true);

let currentRoom = "entrance";

let roomChange = {
  entrance: ["cave"],
  cave: ["sideroom", "hiddenroom", "lowercavern", "entrance"],
  sideroom: ["cave"],
  hiddenroom: ["cave", "lowercavern"],
  lowercavern: ["cave", "hiddenroom", "endroom"],
};

let roomLookupTable = {
  entrance: entrance,
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
    this.takeable = takeable || "you can't take this.";
  }

  use() {
    if (this.name === "rockpile" && playerInv.includes("shovel")) {
      return "you clear the rocks. behind is a passageway.";
    } else if (this.name === "rock") {
      droppedItemIndex = playerInv.indexOf(this.name);
      playerInv.splice(droppedItemIndex, 1).toString();
      return this.action;
    } else {
      return this.action;
    }
  }

  take() {
    if (this.takeable) {
      playerInv.push(this.name);
      return `You picked up ${this.name}`;
    } else {
      return "You can't take that";
    }
  }

  examine() {}
  drop() {
    droppedItemIndex = playerInv.indexOf(this.name);
    droppedItem = playerInv.splice(droppedItemIndex, 1).toString();
    console.log(droppedItem);
    return `You dropped ${this.name}`;
  }
}

let note = new Item("note", "instructions", "instructions", true);

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
  "you throw the rock. good job",
  true
);

let boulder = new Item("boulder", "A very large rock. Seems immovable");

let rockpile = new Item(
  "rockpile",
  "a loose pile of rocks",
  "if only I had some way to clear this..."
);

let itemLookupTable = {
  key: key,
  shovel: shovel,
  lantern: lantern,
  rock: rock,
  boulder: boulder,
  note: note,
  rockpile: rockpile,
};

async function start() {
  let answer = await ask("What would you like to do?\n>_");
  let inputArray = answer.toLowerCase().split(" ");
  let action = inputArray[0];
  let target = inputArray[1];
  if (action === "take") {
    if (roomLookupTable[currentRoom].inventory.includes(target)) {
      removedItemIndex = roomLookupTable[currentRoom].inventory.indexOf(target);
      console.log(removedItemIndex);
      roomLookupTable[currentRoom].inventory.splice(removedItemIndex, 1);
      console.log(roomLookupTable[currentRoom].inventory);
      console.log(itemLookupTable[target].take());
    } else {
      console.log(`There is no ${target} to take.`);
    }
  } else if (action === "use") {
    if (!playerInv.includes(target)) {
      console.log("You can't use what you don't have!");
    } else {
      console.log(itemLookupTable[target].use());
    }
  } else if (action === "examine") {
  } else if (action === "drop") {
    if (playerInv.includes(target)) {
      console.log(itemLookupTable[target].drop());
      roomLookupTable[currentRoom].inventory.push(droppedItem);
      console.log(roomLookupTable[currentRoom].inventory);
    } else {
      console.log("You can't drop what you don't have!");
    }
  } else if (action === "walk") {
  } else if (action === "enter") {
    console.log(roomLookupTable[currentRoom].inventory);
    if (roomChange[currentRoom].includes(target)) {
      if (target === "endroom" && !playerInv.includes("key")) {
        console.log(`The door is locked.`);
      } else if (target === "endroom" && playerInv.includes("key")) {
        console.log(`You open the door with your key.\n You enter ${target}`);
        currentRoom = target;
        console.log(roomLookupTable[currentRoom].description);
      } else if (
        target === "hiddenroom" &&
        cave.inventory.includes("rockpile")
      ) {
        console.log("There seems to be a pile of rocks in the way");
      } else {
        console.log(`You enter ${target}`);
        currentRoom = target;
        console.log(roomLookupTable[currentRoom].description);
      }
    } else if (currentRoom === target) {
      console.log(`You're already in ${target}`);
    } else {
      console.log(`you can't enter ${target} from this location`);
    }
  } else if (
    action === "inventory" ||
    action === "i" ||
    target === "inventory"
  ) {
    if (playerInv === []) {
      console.log("Your inventory is empty");
    } else {
      console.log(playerInv.join("\n"));
    }
  } else {
    console.log("You can't do that.");
  }
  return start();
}
console.log(`Cave Entrance.
You awaken on the edge of a great plain at the foot of a mountain. 
You are facing the mouth of a dark cave leading into the roots of the mountain.
You don't remember how you got here or why you are here, but you feel something in your pocket. 
The sun is setting and its getting cold...
`);
start();
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

// find index of an item that is input by user. find the .indexof user input. assign that idex number to a variable. input variable name to the slice[variable]. or somethihng
