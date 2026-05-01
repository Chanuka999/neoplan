import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("visualizer/:id", "./routes/visualizer.$id.tsx"),
  // Catch-all 404 route
  route("*", "./routes/NotFound.tsx"),
] satisfies RouteConfig;
