const http = require("http");
const WebSocket = require("ws");

const server = http.createServer();

const webSocketServer = new WebSocket.Server({ server });

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

const range = (startVal, length) => {
  return [...Array(length).keys()].map((i) => i + startVal);
};

const makeBoard = () => {
  return {
    b: shuffle(range(0, 15)).slice(0, 5),
    i: shuffle(range(0, 15)).slice(0, 5),
    n: shuffle(range(0, 15)).slice(0, 5),
    g: shuffle(range(0, 15)).slice(0, 5),
    o: shuffle(range(0, 15)).slice(0, 5),
  };
};

const makeValues = (key, startFace, length = 15) => {
  return range(startFace, length).map((face, index) => {
    return {
      isCalled: false,
      index,
      key,
      face,
    };
  });
};

const values = {
  b: makeValues("b", 1),
  i: makeValues("i", 16),
  n: makeValues("n", 31),
  g: makeValues("g", 46),
  o: makeValues("o", 61),
};

let spins = Object.keys(values).reduce((acc, key) => {
  return acc.concat(values[key]);
}, []);

shuffle(spins);

let spinIndex = 0;

const broadcast = (message) => {
  webSocketServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

webSocketServer.on("connection", (ws) => {
  ws.on("message", (message) => {
    console.log("received: %s", message);

    let msg = message;
    try {
      const parsed = JSON.parse(message);
      msg = parsed.text;
    } catch (err) {
      console.log(`message cannot be parsed ${message}`);
    }

    switch (msg) {
      case "spin":
        const spin = spins[spinIndex];
        const value = values[spin.key][spin.index];
        value.isCalled = true;
        spinIndex += 1;
        broadcast(
          JSON.stringify({ type: "value", message: { value, values } })
        );
        break;
    }
  });

  ws.send(
    JSON.stringify({ type: "board", message: { board: makeBoard(), values } })
  );
});

server.listen(8080);
