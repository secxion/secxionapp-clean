import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link
      to="/home"
      className="hidden md:flex items-center text-transparent text-2xl font-bold bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 tracking-wide"
    >
      <span className="font-extrabold">SXN</span>
    </Link>
  );
}
