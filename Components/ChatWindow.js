import React, { useState, useEffect } from "react";
import { ref, onValue, push, set } from "firebase/database";
import { realDb } from "../firebase";
import Message from "./Message";

const ChatWindow = ({ currentUser, chatPartner }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const TEST_USER_ID = "user_1725465375818";

  useEffect(() => {
    if (currentUser && chatPartner && currentUser.uid && chatPartner.uid) {
      const chatRoomId = generateChatRoomId(currentUser.uid, chatPartner.uid);
      const messagesRef = ref(realDb, `chats/${chatRoomId}/messages`);

      const unsubscribe = onValue(messagesRef, (snapshot) => {
        const chatMessages = [];
        snapshot.forEach((childSnapshot) => {
          chatMessages.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        setMessages(chatMessages);
        console.log("Fetched messages:", chatMessages);
      });

      return () => unsubscribe();
    }
  }, [currentUser, chatPartner]);

  const generateChatRoomId = (uid1, uid2) => {
    return uid1 === TEST_USER_ID || uid2 === TEST_USER_ID
      ? `${TEST_USER_ID}_${uid1 === TEST_USER_ID ? uid2 : uid1}`
      : uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  };

  const sendMessage = () => {
    console.log("Send button clicked");
    console.log("Current User:", currentUser);
    console.log("Chat Partner:", chatPartner);
    console.log("Message Text:", messageText);

    if (messageText.trim() === "") {
      console.log("Message text is empty.");
    }
    if (!currentUser) {
      console.log("Current user is not set.");
    }
    if (!chatPartner) {
      console.log("Chat partner is not set.");
    }
    if (!currentUser.uid) {
      console.log("Current user UID is not set.");
    }
    if (!chatPartner.uid) {
      console.log("Chat partner UID is not set.");
    }

    if (messageText.trim() === "" || !currentUser || !chatPartner || !currentUser.uid || !chatPartner.uid) {
      console.log("Message not sent: invalid data");
      return;
    }

    const chatRoomId = generateChatRoomId(currentUser.uid, chatPartner.uid);
    const newMessage = {
      text: messageText,
      sender: currentUser.uid,
      timestamp: Date.now(),
    };

    const newMessageRef = push(ref(realDb, `chats/${chatRoomId}/messages`));
    set(newMessageRef, newMessage)
      .then(() => {
        console.log("Message sent successfully");
        updateRecentChat(currentUser.uid, chatPartner);
        updateRecentChat(chatPartner.uid, currentUser);
        setMessageText("");
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  };

  const updateRecentChat = (userId, partner) => {
    if (!userId || !partner || !partner.uid || !partner.username) return;

    const recentChatRef = ref(realDb, `users/${userId}/recentChats/${partner.uid}`);
    set(recentChatRef, {
      uid: partner.uid,
      username: partner.username,
      lastMessageTime: Date.now()
    });
  };

  if (!chatPartner || !chatPartner.username) {
    return <div>Please select a chat partner</div>;
  }

  return (
    <div>
      <h3>Chat with {chatPartner.username}</h3>
      <div className="chat-messages" style={{ maxHeight: "300px", overflowY: "auto" }}>
        {messages.map((msg) => (
          <Message
            key={msg.id}
            message={msg}
            isSentByCurrentUser={msg.sender === currentUser.uid}
          />
        ))}
      </div>
      <input
        type="text"
        placeholder="Type a message..."
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatWindow;
