// App entry — minimal state-based navigation between the two Member 1 screens.
//
//   LocationSetupScreen  --(View Nearby Listings)-->  NearbyListingsScreen
//
// The Map module (another member) can plug in here, consuming the same
// { latitude, longitude, radius } params and the API response shape.

import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";

import LocationSetupScreen from "./src/screens/LocationSetupScreen";
import NearbyListingsScreen from "./src/screens/NearbyListingsScreen";

export default function App() {
  const [screen, setScreen] = useState("setup"); // "setup" | "listings"
  const [searchParams, setSearchParams] = useState(null);

  const goToListings = (params) => {
    setSearchParams(params);
    setScreen("listings");
  };

  return (
    <>
      <StatusBar style="dark" />
      {screen === "setup" ? (
        <LocationSetupScreen onViewListings={goToListings} />
      ) : (
        <NearbyListingsScreen
          params={searchParams}
          onBack={() => setScreen("setup")}
        />
      )}
    </>
  );
}
