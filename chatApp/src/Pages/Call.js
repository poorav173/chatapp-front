import React, { useState, useEffect, useRef, useContext } from 'react';
import { Button, Grid, GridItem, Input, Box, Flex } from '@chakra-ui/react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import AppContext from '../context/AppContext';

const socket = io('http://localhost:4000'); // Replace with your server URL

const Call = () => {
  const {user, selectedChat, setselectedChat, fetchAgain,setfetchAgain} = useContext(AppContext);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [remoteUserId, setRemoteUserId] = useState('');
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const navigate = useNavigate();
    console.log(user, selectedChat, setselectedChat, fetchAgain, setfetchAgain, "call message .......");
    useEffect(() => {
        // Get local audio and video stream
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then(stream => {
                setLocalStream(stream);
                localVideoRef.current.srcObject = stream;
            })
            .catch(error => console.error('Error accessing media devices: ', error));

        // Listen for incoming stream from peer
        socket.on('stream', (stream, userId) => {
            setRemoteStream(stream);
            remoteVideoRef.current.srcObject = stream;
            setRemoteUserId(userId);
        });

        return () => {
            // Clean up
            socket.disconnect();
        };
    }, []);

    const startCall = () => {
        // Send local stream to peer
        socket.emit('stream', localStream);
    };

    const handleConnect = () => {
        socket.emit('connectToUser', remoteUserId);
    };

    const handleChange = (event) => {
        setRemoteUserId(event.target.value);
    };
    const endCall = ()=>{
        navigate("/chats");
    }

    return (
        <Flex justify="center" align="center" w="100vw" h="100vh">
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <GridItem>
                    <video ref={localVideoRef} autoPlay muted style={{ width: '100%', height: '100%', objectFit: 'cover' }}></video>
                </GridItem>
                <GridItem>
                    <video ref={remoteVideoRef} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }}></video>
                    {remoteUserId && <Box mt={2}>Connected with user: {remoteUserId}</Box>}
                </GridItem>
                <GridItem>
                    <Input placeholder="Enter user ID" value={remoteUserId} onChange={handleChange} />
                    <Button onClick={handleConnect} mt={2}>Connect</Button>
                </GridItem>
                <GridItem>
                    <Button onClick={startCall}>Start Call</Button>
                    <Button onClick={endCall}>End Call</Button>
                </GridItem>
            </Grid>
        </Flex>
    );
};

export default Call;
