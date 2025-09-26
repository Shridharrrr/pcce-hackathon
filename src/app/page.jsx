"use client";

import React from "react";
// Use the new context hook
import { useAuthContext } from "@/context/AuthContext";
import AuthForm from "@/app/auth/page";
import DataEntryForm from "@/components/DataEntryForm";
import RecommendationDashboard from "@/components/RecommendationDashboard";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home() {
  // Get data from the context provider
  const { user, hasProfile, profileData, loading, setHasProfile } =
    useAuthContext();

  const handleDataSubmit = (data) => {
    setHasProfile(true);
    // The dashboard will now use the profileData from the context
    console.log("Profile created with data:", data);
  };

  if (loading) {
    return (
      <LoadingSpinner message="Initializing your college savings planner..." />
    );
  }

  if (!user) {
    // onAuthSuccess is no longer needed as the context handles state changes
    return <AuthForm />;
  }

  if (!hasProfile) {
    return <DataEntryForm onDataSubmit={handleDataSubmit} />;
  }

  // Pass the profileData from the context to the dashboard
  return <RecommendationDashboard userData={profileData} />;
}
