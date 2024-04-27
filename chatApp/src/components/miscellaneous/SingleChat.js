import { Box, FormControl, IconButton, Input, Spinner, Text, useToast, ButtonGroup } from '@chakra-ui/react';
import React, { useContext, useEffect, useState } from 'react'
import AppContext from '../../context/AppContext';
import { getProfile, getSender } from '../../config/ChatLogic';
import { ArrowBackIcon, PhoneIcon, PlusSquareIcon } from '@chakra-ui/icons';
import ProfileModal from './ProfileModal';
import UpdateGroupChatModal from './UpdateGroupChatModal';
import axios from 'axios';
import ScrollableChat from './ScrollableChat';

import io from "socket.io-client"
import { encryptWithAES } from '../../config/Secure';
import Call from '../../Pages/Call';
import { useNavigate } from 'react-router-dom';
const END_POINT = "http://localhost:4000";
var socket,selectedChatCompare;
const SingleChat = () => {
  const {user, selectedChat, setselectedChat, fetchAgain,setfetchAgain} = useContext(AppContext);
  const [Messages, setMessages] = useState([]);
  const [loading, setLoading] = useState();
  const [newMessage, setNewMessage] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  // for socket setup
  useEffect(() => {
    socket = io(END_POINT);
    socket.emit('setup', user.user);
    socket.on('connected',()=>{
      setSocketConnected(true);
    })
  }, []);

  const fetchMessages = async()=>{
    if(!selectedChat) return;
    try {
      const config = {
        headers:{
          Authorization : `Bearer ${user.token}`
        }
      }
      setLoading(true);
      const {data} = await axios.get(`http://localhost:4000/message/${selectedChat._id}`,config);
      setMessages(data);
    socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
    setLoading(false);
  }
  const sendMessage = async(event)=>{
    if(event.key === "Enter" && newMessage){
      try {
        const config = {
          headers:{
            "Content-Type" : "application/json",
            Authorization : `Bearer ${user.token}`
          }
        }
        setNewMessage("");
        const {data} = await axios.post("http://localhost:4000/message",{
          content: encryptWithAES(newMessage),
          chatId : selectedChat._id
        },config);

        socket.emit("new message",data);
        setMessages([...Messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom",
      });
      }
    }
  }
  const typingHandler = (e)=>{
    setNewMessage(e.target.value);
  }

  // fetch all messages for chat
  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat])
  

  useEffect(()=>{
    socket.on("message recieved", (newMessageRecieved)=>{
      if(!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id){
        // notification
      }
      else{
        setMessages([...Messages, newMessageRecieved])
      }
    })
  })
  const handleVideoCall = ()=>{
    navigate("/call");
    console.log("Hello how are you ", selectedChat);
  }
  const handleAudioCall = ()=>{
    console.log("I am clearly fine", selectedChat);
  }
  return (
    <>
    {selectedChat?(
        <>
        <Text
        fontSize={{base:"28px", md:"30px"}}
        pb={3}
        px={2}
        w={"100%"}
        display={"flex"}
        justifyContent={{base:"space-between"}}
        alignItems={"center"}>
            <IconButton
            display={{base:"flex", md:"none"}}
            icon={<ArrowBackIcon/>}
            onClick={()=>{setselectedChat("")}}/>
            {selectedChat.isGroupChat?
           ( 
           <>
           {selectedChat.chatName}
           <UpdateGroupChatModal/>
           </>
            ):(
            <>
                {getSender(user.user,selectedChat.users)}
                <Box>
              <ButtonGroup>
                <IconButton icon={<PlusSquareIcon />} colorScheme="teal" mr={2} onClick={handleVideoCall}/>
                <IconButton icon={<PhoneIcon />} colorScheme="teal" onClick={handleAudioCall}/>
              </ButtonGroup>
            </Box>
                <ProfileModal user={getProfile(user.user,selectedChat.users)}/>
            </>
            )}
            </Text>
            <Box
            display={"flex"}
            flexDir={"column"}
            justifyContent={"flex-end"}
            p={3}
            bg={"#E8E8E8"}
            w={"100%"}
            h='100%'
            borderRadius={"lg"}
            overflowY={"hidden"}>
            {/* messages */}
            {loading?(
              <Spinner
              size={"xl"}
              w={20}
              h={20}
            alignSelf={"center"}
            margin={"auto"}/>
            ):(
            <>
            <div className="messages" style={{display:"flex", flexDirection:"column",overflowY:"scroll", scrollbarWidth:"none"}}>
              <ScrollableChat messages = {Messages}/>
            </div>
            </>)
            }
            {/* input message */}
            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              <Input 
              variant={"filled"}
              bg={"#E0E0E0"}
              placeholder='Enter a Message ...'
              onChange={typingHandler}
              value={newMessage}/>
            </FormControl>
            </Box>
        </>
    ):(
    <Box
    display="flex"
    alignItems={'center'}
    justifyContent="center"
    h="100%">
    <Text fontSize={"3xl"} pb={3}> 
    Click on a user to start chating
    </Text>
    </Box>
    )}
    </>
  )
}

export default SingleChat