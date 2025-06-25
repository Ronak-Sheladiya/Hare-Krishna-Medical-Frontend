import React from "react";

const ProfessionalLoading = ({
  size = "md",
  message = "Loading...",
  fullScreen = false,
  overlay = false,
  color = "#e63946",
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case "sm":
        return { logoSize: 40, containerSize: 80, fontSize: "0.9rem" };
      case "lg":
        return { logoSize: 70, containerSize: 140, fontSize: "1.2rem" };
      case "xl":
        return { logoSize: 90, containerSize: 180, fontSize: "1.4rem" };
      default:
        return { logoSize: 55, containerSize: 110, fontSize: "1rem" };
    }
  };

  const { logoSize, containerSize, fontSize } = getSizeConfig();

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    ...(fullScreen && {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: overlay ? "rgba(248, 249, 250, 0.95)" : "#f8f9fa",
      zIndex: 9999,
    }),
    ...(overlay &&
      !fullScreen && {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(248, 249, 250, 0.95)",
        zIndex: 1000,
      }),
    ...(!fullScreen &&
      !overlay && {
        padding: "40px 20px",
      }),
  };

  return (
    <div style={containerStyle}>
      {/* Centered Loading Animation with Logo */}
      <div
        style={{
          position: "relative",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: containerSize + 60,
          height: containerSize + 60,
        }}
      >
        {/* Outer Rotating Ring */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: containerSize + 30,
            height: containerSize + 30,
            border: `3px solid transparent`,
            borderTop: `3px solid ${color}`,
            borderRight: `3px solid ${color}60`,
            borderRadius: "50%",
            animation: "spin 2s linear infinite",
            filter: `drop-shadow(0 4px 12px ${color}40)`,
            zIndex: 1,
          }}
        />

        {/* Company Logo - Perfectly Centered */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: logoSize + 20,
            height: logoSize + 20,
            background: "white",
            borderRadius: "50%",
            border: `3px solid ${color}30`,
            boxShadow: `0 8px 32px ${color}20, 0 4px 16px rgba(0,0,0,0.08)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "logoFloat 2.5s ease-in-out infinite",
            zIndex: 3,
          }}
        >
          <img
            src="https://cdn.builder.io/api/v1/assets/72c59d801d5945d4830160c2c2f8a610/hk-34b526?format=webp&width=800"
            alt="Hare Krishna Medical"
            style={{
              width: logoSize,
              height: logoSize,
              objectFit: "contain",
              animation: "logoSpin 3s ease-in-out infinite",
            }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          {/* Fallback when image fails to load */}
          <div
            style={{
              display: "none",
              width: logoSize,
              height: logoSize,
              background: `linear-gradient(135deg, ${color}, ${color}dd)`,
              borderRadius: "50%",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "900",
              fontSize: logoSize / 2.5,
              fontFamily: "Arial, sans-serif",
            }}
          >
            HK
          </div>
        </div>

        {/* Outer Rotating Ring */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: containerSize + 30,
            height: containerSize + 30,
            border: `3px solid transparent`,
            borderTop: `3px solid ${color}`,
            borderRight: `3px solid ${color}60`,
            borderRadius: "50%",
            animation: "spin 2s linear infinite",
            filter: `drop-shadow(0 4px 12px ${color}40)`,
            zIndex: 1,
          }}
        />

        {/* Decorative Dots */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: containerSize + 50,
            height: containerSize + 50,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {[0, 60, 120, 180, 240, 300].map((rotation, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "8px",
                height: "8px",
                background: `${color}40`,
                borderRadius: "50%",
                transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(-${containerSize / 2 + 25}px)`,
                animation: `fadeInOut 2s ease-in-out infinite ${index * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Loading Message */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            color: "#495057",
            fontSize: fontSize,
            fontWeight: "600",
            marginBottom: "8px",
            animation: "fadeInOut 1.5s ease-in-out infinite",
          }}
        >
          {message}
        </div>
        <div
          style={{
            color: "#6c757d",
            fontSize: "0.85rem",
            opacity: 0.8,
          }}
        >
          Hare Krishna Medical
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
            box-shadow: 0 16px 64px ${color}25, 0 8px 32px rgba(0,0,0,0.1);
          }
          50% {
            transform: translateY(-6px) scale(1.03);
            box-shadow: 0 20px 72px ${color}35, 0 12px 40px rgba(0,0,0,0.15);
          }
        }

        @keyframes logoSpin {
          0%, 100% {
            transform: rotate(0deg) scale(1);
            opacity: 1;
          }
          25% {
            transform: rotate(2deg) scale(1.02);
            opacity: 0.95;
          }
          50% {
            transform: rotate(0deg) scale(1.05);
            opacity: 0.9;
          }
          75% {
            transform: rotate(-2deg) scale(1.02);
            opacity: 0.95;
          }
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalLoading;
