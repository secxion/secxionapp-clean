import { Routes } from "../constants/routes";

const reverseMap = Object.entries(Routes).reduce((acc, [key, value]) => {
  acc[`/${key.toLowerCase().replace(/_/g, "-")}`] = `/${value}`;
  return acc;
}, {});

/**
 * Automatically maps human-friendly route to obfuscated one
 * e.g. "/home" => "/h-f8a3d9h2f"
 */
export const obscureRoute = (path) => {
  if (!path || typeof path !== "string") return path;

  // Handle dynamic route (e.g., product/:id)
  const basePath = path.split("/")[1];
  const rest = path.slice(basePath.length + 1);

  const slug = reverseMap[`/${basePath}`];
  if (slug?.includes(":")) {
    return `${slug.replace(/:.*$/, "")}${rest}`;
  }

  return slug ? `${slug}${rest ? `/${rest}` : ""}` : path;
};
