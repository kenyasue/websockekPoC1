
// create a connection
// subscribe to message event
let ws = null;

const connect = (url)=>{
    ws = new WebSocket(url);
    ws.onmessage = message => {
        console.log(`Received: ${message.data}`);
    };
}


const subscribe = (channel)=>{
    console.log(channel);
    ws.send(JSON.stringify({
        type: "connect",
        channel: channel
    }));
}


const sendMessage = (username, message, channel)=>{
    ws.send(JSON.stringify({
        type: "message",
        username: username,
        message: message,
        channel: channel
    }));
}


// send a message