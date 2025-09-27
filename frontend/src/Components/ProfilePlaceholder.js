// src/components/ProfilePlaceholder.js
import React from 'react';

const ProfilePlaceholder = () => {
  return (
    <div style={styles.container}>
      <div style={styles.avatarPlaceholder}>
        {/* You might use an actual avatar image here later */}
        <div style={styles.initials}>
          {/* Dynamically display initials based on the user's name */}
          {/* Example: "John Doe" -> "JD" */}
          JD
        </div>
      </div>
      <div style={styles.infoContainer}>
        <div style={styles.namePlaceholder}>
          <div style={styles.shimmer}></div>
        </div>
        <div style={styles.tagPlaceholder}>
          <div style={styles.shimmer}></div>
        </div>
        {/* You can add more placeholders for other details if needed */}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  avatarPlaceholder: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#d3d3d3',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.5em',
    fontWeight: 'bold',
    color: '#555',
    marginRight: '15px',
  },
  initials: {
    // Styles for the initials within the avatar
  },
  infoContainer: {
    flexGrow: 1,
  },
  namePlaceholder: {
    backgroundColor: '#e0e0e0',
    height: '24px',
    width: '60%',
    borderRadius: '4px',
    marginBottom: '8px',
    overflow: 'hidden', // To contain the shimmer effect
  },
  tagPlaceholder: {
    backgroundColor: '#e0e0e0',
    height: '18px',
    width: '40%',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  shimmer: {
    background:
      'linear-gradient(to right, #f0f0f0 8%, #dbdbdb 18%, #f0f0f0 33%)',
    backgroundSize: '800px 100%',
    height: '100%',
    width: '100%',
    animation: 'shimmer 1.5s infinite linear',
  },
};

// Define the shimmer animation (you might want to put this in a separate CSS file later)
const keyframes = `
  @keyframes shimmer {
    0% {
      background-position: -468px 0;
    }
    100% {
      background-position: 468px 0;
    }
  }
`;

const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = keyframes;
document.head.appendChild(styleSheet);

export default ProfilePlaceholder;
