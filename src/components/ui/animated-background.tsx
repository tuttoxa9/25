import React from 'react';

export function AnimatedBackground() {
  return (
    <div className="orbs-container" style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: -1 }}>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <style>{`
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(50px);
          opacity: 0.5;
          z-index: -1;
        }
        .orb-1 {
          width: 1400px;
          height: 1400px;
          background-color: #9370DB;
          top: -700px;
          left: -700px;
          animation: float-1 60s infinite ease-in-out;
        }
        .orb-2 {
          width: 1200px;
          height: 1200px;
          background-color: #DDA0DD;
          bottom: -600px;
          right: -600px;
          animation: float-2 50s infinite ease-in-out;
        }
        .orb-3 {
          width: 1000px;
          height: 1000px;
          background-color: #E6E6FA;
          top: -500px;
          left: 300px;
          animation: float-3 70s infinite ease-in-out;
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(70vw, 20vh); }
          40% { transform: translate(20vw, 70vh); }
          60% { transform: translate(80vw, 60vh); }
          80% { transform: translate(10vw, 30vh); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-60vw, -30vh); }
          50% { transform: translate(-20vw, -60vh); }
          75% { transform: translate(-70vw, -20vh); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(40vw, -20vh); }
          50% { transform: translate(-30vw, 30vh); }
          75% { transform: translate(10vw, -50vh); }
        }
      `}</style>
    </div>
  );
}
