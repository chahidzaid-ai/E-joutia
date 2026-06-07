// App entry — minimal state-based navigation between the screens.
//
//   LocationSetupScreen ──(View Nearby Listings)──────────────▶ NearbyListingsScreen
//        │                                                            ▲
//        └────(Choose on map)──▶ MapScreen ──(Search this area)───────┘
//
// Location selection is now flexible:
//   • RANDOM   — "Continue without location" → NearbyListingsScreen falls back
//                to the demo area so results always appear.
//   • GPS      — granted permission centers the map / search on the device.
//   • MANUAL   — MapScreen lets the user tap a pin and tune the radius before
//                searching.
//
// All screens speak the same { latitude, longitude, radius } contract and the
// same backend API response shape.

import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";

import LocationSetupScreen from "./src/screens/LocationSetupScreen";
import MapScreen from "./src/screens/MapScreen";
import NearbyListingsScreen from "./src/screens/NearbyListingsScreen";

export default function App() {
  const [screen, setScreen] = useState("setup"); // "setup" | "map" | "listings"
  const [searchParams, setSearchParams] = useState(null);
  // Seed values handed to the map (GPS coords + radius when available).
  const [mapSeed, setMapSeed] = useState(null);

  const goToListings = (params) => {
    setSearchParams(params);
    setScreen("listings");
  };

  const goToMap = (seed) => {
    setMapSeed(seed || null);
    setScreen("map");
  };

  let content;
  if (screen === "setup") {
    content = (
      <LocationSetupScreen
        onViewListings={goToListings}
        onChooseOnMap={goToMap}
      />
    );
  } else if (screen === "map") {
    content = (
      <MapScreen
        initialLocation={
          mapSeed && mapSeed.latitude != null && mapSeed.longitude != null
            ? { latitude: mapSeed.latitude, longitude: mapSeed.longitude }
            : null
        }
        initialRadius={mapSeed?.radius ?? 10}
        onConfirm={goToListings}
        onBack={() => setScreen("setup")}
      />
    );
  } else {
    content = (
      <NearbyListingsScreen
        params={searchParams}
        onBack={() => setScreen("setup")}
      />
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      {content}
    </>
  );
}
