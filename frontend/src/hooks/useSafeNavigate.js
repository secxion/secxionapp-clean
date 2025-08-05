import { useNavigate } from "react-router-dom";
import { obscureRoute } from "../utils/obscureRoute";

const useSafeNavigate = () => {
  const navigate = useNavigate();
  return (path, options) => navigate(obscureRoute(path), options);
};

export default useSafeNavigate;
