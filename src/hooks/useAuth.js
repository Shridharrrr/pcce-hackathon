"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const docRef = doc(db, "userProfiles", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setHasProfile(true);
            setProfileData(docSnap.data());
          } else {
            setHasProfile(false);
            setProfileData(null);
          }
        } catch (error) {
          console.error("Error checking user profile:", error);
          setHasProfile(false);
          setProfileData(null);
        }
      } else {
        setHasProfile(false);
        setProfileData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Add a logout function

  const logout = () => {
    return signOut(auth);
  }; // Return the logout function along with other state

  return { user, hasProfile, profileData, loading, setHasProfile, logout };
};
