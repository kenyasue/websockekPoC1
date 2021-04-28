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
let connections = [];
const WebSocketServer = ws.server;

const subscriber = redis.createClient({
  port: 6379,
  host: "redis",
});

const publisher = redis.createClient({
  port: 6379,
  host: "redis",
});

subscriber.on("subscribe", function (channel, count) {
  //console.log(`Server ${APPID} subscribed successfully to livechat`)
  console.log(channel);
  publisher.publish("livechat", `${APPID} just subscribed!`);
});

subscriber.on("message", function (channel, message) {
  try {
    console.log(
      `Server ${APPID} received message in channel ${channel} msg: ${message}`
    );
    connections.forEach((c) => c.send(message));
  } catch (ex) {
    console.log("ERR::" + ex);
  }
});

subscriber.subscribe("livechat");

/*const requestListener = function (req, res) {
    res.writeHead(200);
    //res.sendFile('./static/index.html')
    res.end('Hello from ' + APPID);
  }
*/

//create a raw http server (this will help us create the TCP which will then pass to the websocket to do the job)       (requestListener)
const httpserver = http.createServer();

httpserver.on("request", app);

//pass the httpserver object to the WebSocketServer library to do all the job, this class will override the req/res
const websocket = new WebSocketServer({
  httpServer: httpserver,
});

httpserver.listen(APPID, () =>
  console.log("My server is listening on port " + APPID)
);

//when a legit websocket request comes listen to it and get the connection .. once you get a connection thats it!
websocket.on("request", (request) => {
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


    Ok moram imati neki message type property u message da mogu razlikovati connect i message, i moram imati room property da mogu razlikovati u koji room poslati poruku
    

    later
      - management of redis channels
      
*/