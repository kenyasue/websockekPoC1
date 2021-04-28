
let username = window.prompt("Please enter username!");
let channel = window.prompt("Please enter channel name!");

let messageDiv = document.getElementById("usermsg");
let channelDiv = document.getElementById("channel");
channelDiv.innerHTML = channel;


const send = ()=>{
    
    let message = messageDiv.value;
    
    sendMessage(username, message, channel);
}

console.log("Main works!");

const url = "ws://localhost:8080";
connect(url);
ws.onopen =()=>{
    console.log(channel);
    subscribe(channel);
}






if(!username)username=Math.random().toString();
let usernameDiv = document.getElementById("welcome");

usernameDiv.innerHTML+=" "+username;

const chatbox = document.getElementById("chatbox");

// We can override default onmessage behaviour because ws is defined before

 ws.onmessage = (message) => {
    console.log(message);
    console.log(`Received in main: ${message.data}`);
    
    const json = JSON.parse(message.data);
    console.log(json);
    chatbox.innerHTML+="<br>"+json.username+": "+json.message;
    messageDiv.value="";
 };