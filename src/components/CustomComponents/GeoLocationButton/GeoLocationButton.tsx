import * as React from 'react';

interface Props {
  isActive: boolean;
  onClick: () => void;
}

const GeoLocationButton: React.FC<Props> = ({ isActive, onClick }) => {
  return (
    <button
      className="geo-btn"
      onClick={onClick}
      title="מיקום"
    >
      <img
        src={
          isActive
            ? require('../../../assets/icons/locationIFilterButtonActive.svg') 
            : require('../../../assets/icons/locationIFilterButton.svg')    
        }
        alt="מיקום"
        className="geo-icon"
      />
    </button>
  );
};

export default GeoLocationButton;
