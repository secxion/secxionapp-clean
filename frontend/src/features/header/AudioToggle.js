import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { useSound } from '../../Context/SoundContext';

export default function AudioToggle() {
  const { soundEnabled, toggleSound } = useSound();
  return (
    <button
      onClick={toggleSound}
      title={soundEnabled ? 'Disable sound' : 'Enable sound'}
      className="p-2"
    >
      <FontAwesomeIcon icon={soundEnabled ? faVolumeUp : faVolumeMute} />
    </button>
  );
}
