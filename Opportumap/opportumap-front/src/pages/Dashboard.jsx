import React from "react";
import RecommendationList from "../components/RecommendationCard";

export default function Dashboard() {
  return (
    <div>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 5vw" }}>
        <RecommendationList />
      </main>
    </div>
  );
}
