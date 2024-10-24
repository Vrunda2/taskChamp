import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { auth, realDb } from "../firebase";
import { ref, onValue, get } from "firebase/database";

const Chat = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedChatPartner, setSelectedChatPartner] = useState(null);
  const [recentChats, setRecentChats] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Retrieve userId from localStorage
  const userId = localStorage.getItem("userId");

  // Function to fetch username from Firebase
  const fetchUsername = async (userId) => {
    const userRef = ref(realDb, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();
      return userData.username || `User ${userId.slice(0, 5)}`;
    }
    return `User ${userId.slice(0, 5)}`; // Fallback if username doesn't exist
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (userId) {
        // Fetch the username using userId from localStorage
        const username = await fetchUsername(userId);
        setCurrentUser({ uid: userId, username });

        // Fetch all users except the current user
        const usersRef = ref(realDb, "users");
        get(usersRef).then((snapshot) => {
          if (snapshot.exists()) {
            const usersData = snapshot.val();
            const usersList = Object.keys(usersData).map((uid) => ({
              uid,
              username: usersData[uid].username || `User ${uid.slice(0, 5)}`,
            }));
            setAllUsers(usersList.filter((u) => u.uid !== userId));
          }
        });

        // Fetch recent chats of the current user
        const recentChatsRef = ref(realDb, `users/${userId}/recentChats`);
        onValue(recentChatsRef, (snapshot) => {
          const recentChatsData = snapshot.val() || {};
          const formattedRecentChats = Object.values(recentChatsData);
          setRecentChats(formattedRecentChats);
        });
      } else {
        setCurrentUser(null);
        setRecentChats([]);
        setAllUsers([]);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        currentUser={currentUser}
        recentChats={recentChats}
        allUsers={allUsers}
        onSelectChat={setSelectedChatPartner}
      />

      {currentUser && selectedChatPartner && (
        <ChatWindow
          currentUser={currentUser}
          chatPartner={selectedChatPartner}
        />
      )}
    </div>
  );
};

export default Chat;
