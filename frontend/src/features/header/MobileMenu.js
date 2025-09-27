import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

export default function MobileMenuButton({ open, onToggle }) {
  return (
    <button onClick={onToggle} className="md:hidden p-2">
      <FontAwesomeIcon icon={faBars} className="text-xl" />
    </button>
  );
}
