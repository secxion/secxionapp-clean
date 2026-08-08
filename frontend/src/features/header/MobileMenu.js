import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

export default function MobileMenuButton({ open, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="inline-flex h-11 w-11 min-w-11 max-w-11 shrink-0 basis-11 items-center justify-center p-0 md:hidden"
      aria-label={open ? 'Close menu' : 'Open menu'}
    >
      <FontAwesomeIcon icon={faBars} className="h-5 w-5 shrink-0" />
    </button>
  );
}
