const app = require('./app');
const connect = require('./config/db');

const server = app.listen(4000,()=>{
    console.log("App is Runnig on Port 4000...");
})

connect();

const io = require('socket.io')(server,{
    pingTimeOut: 600000,
    cors:{
        origin : "http://localhost:3000"
    },
})

io.on("connection",(socket)=>{
    // console.log("Conncted to socket.io");
    
    // set up (user open chat app )
    socket.on('setup',(userData)=>{
        // console.log(userData);
        socket.join(userData._id);
        socket.emit("Connected");
    });

    // open particular chat 
    socket.on("join chat", (room)=>{
        // console.log("room id ", room);
        socket.join(room);
    });

    socket.on("new message", (newMessageRecived)=>{
        var chat = newMessageRecived.chat;
        // console.log("msg");
        if(!chat.users) return console.log("chat users not defined");

        chat.users.forEach(user =>{
            if(user._id == newMessageRecived.sender._id)return;
            socket.in(user._id).emit("message recieved", newMessageRecived);
        })
    })
})