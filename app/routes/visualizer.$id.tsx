import React from "react";

export const loader = async ({ params }) => {
  // You can fetch data here using params.id if needed
  return null;
};

export default function VisualizerIdRoute() {
  return <div>Visualizer route is working! (id page)</div>;
}
