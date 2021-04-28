const http = require("http");
const ws = require("websocket");
const redis = require("redis");
const path = require("path");
const express = require("express");


const app = express();

app.use(express.static(__dirname + "/static"));

app.get("/", async (req, res) => {
  res.sendFile(__dirname + "/static/index.html");
});


const APPID = process.env.APPID;
const WebSocketServer = ws.server;

let channelsToConnectionsMap = {};

const subscriber = redis.createClient({
  port: 6379,
  host: "redis",
});

const publisher = redis.createClient({
  port: 6379,
  host: "redis",
});


const httpserver = http.createServer(app);

const websocket = new WebSocketServer({
  httpServer: httpserver,
});

httpserver.listen(APPID, () =>
  console.log("My server is listening on port " + APPID)
);


subscriber.on("message", function (channel, message) {
  try {
    console.log(
      `Server ${APPID} received message in channel ${channel} msg: ${message}`
    );
    channelsToConnectionsMap[channel].forEach((con) => con.send(message));
  } catch (ex) {
    console.log("ERR::" + ex);
  }
});


/*websocket.on("request", (request) => {
  const con = request.accept(null, request.origin);
  con.on("open", () => console.log("opened"));
  con.on("close", () => console.log("CLOSED!!!"));
  con.on("message", (message) => {
    //publish the message to redis
    console.log(`${APPID} Received message ${message.utf8Data}`);
    publisher.publish("livechat", message.utf8Data);
  });

  connections.push(con);
});
*/

websocket.on("request", (request) => {
  const con = request.accept(null, request.origin);
  con.on("open", () => console.log("opened"));
  con.on("close", () => console.log("CLOSED!!!"));
  con.on("message", (payload) => {

    
    console.log(payload);
    const message = JSON.parse(payload.utf8Data);
    if(message.type=="connect"){
      console.log("connection!", message.channel);
      if(!channelsToConnectionsMap[message.channel]){
        channelsToConnectionsMap[message.channel] = new Set();
      }
      channelsToConnectionsMap[message.channel].add(con);

      subscriber.subscribe(message.channel);
      
      console.log(channelsToConnectionsMap);
      console.log();
      console.log();
      console.log();
    }


    else if(message.type=="message"){
      //check connection first?
      
      console.log(`${APPID} Received message ${message.message}`);
      console.log("Before publish")
      console.log(typeof(message.channel), typeof(message.message))
      publisher.publish(message.channel, payload.utf8Data);
      console.log("After publish");
    }

  });

 
});



/*
    //code clean up after closing connection
    subscriber.unsubscribe();
    subscriber.quit();
    publisher.quit();
    */




/*
  defining message types
  type = [connect, message, disconnect]
    - connect - username, room
    - message - username, room, message
    - disconnect - username, room    
    
    let connectMessage = {
      type: "connect",
      username: "username123"
      room: "roomid",
    }

    let payloadMessage = {
      type: "message",
      username: "username123",
      room: "roomid",
      message: "Hello world!"
    }


    WS
    - kad dobijem poruku, pogledati da li je to connect ili message
      - ako je connect
        - onda subscribam taj server na taj kanal (subscriber.subscribe)
        - spreman sam za slanje poruka i primanje poruka na tom kanalu
      - ako je message
        - nadem kanal na koji moram poslati i posaljem (publisher.publish)
  
    REDIS
    - kad dobijem poruku na kanal sam ju proslijedim svim subscriberima


    - need a connection mapping for channel-connection



    later
      - management of redis channels

*/