import React from 'react';

const Confetti: React.FC = () => {
  return (
    <div className="confetti-container">
      {[...Array(50)].map((_, i) => (
        <div key={i} className="confetti"></div>
      ))}
    </div>
  );
};

export default Confetti;