// App.jsx - Actualizado con todas las aplicaciones
import React, { useState } from "react";
import "./App.css";
import HomePage from "./components/HomePage.jsx";
import NdviApp from "./components/NdviApp.jsx";
import TimeSeriesTrendApp from "./components/TimeSeriesTrendApp.jsx";
import ThresholdAnalysisApp from "./components/ThresholdAnalysisApp.jsx";
import ThresholdCalculatorApp from "./components/ThresholdCalculatorApp.jsx";
import MultiIndexComparison from "./components/MultiIndexComparison.jsx";
import ChangeDetectionApp from "./components/ChangeDetectionApp.jsx";
import CompositorApp from "./components/CompositorApp.jsx";
import Navbar from "./components/Navbar.jsx";
import BackendStatusIndicator from "./components/BackendStatusIndicator.jsx";
import ContactoApp from "./components/ContactoApp.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { COLORS, TYPOGRAPHY } from "./styles/designTokens.js";

function AppContent() {
  const [currentApp, setCurrentApp] = useState("home");

  // Obtener API URL desde el servicio
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

  const centeredWrapperStyle = {
    flex: 1,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "0",
    overflowY: "auto",
    background:
      "linear-gradient(135deg, #fafaf9 0%, #f5f5f4 50%, #fafaf9 100%)",
  };

  const renderApp = () => {
    switch (currentApp) {
      case "compositor":
        return <CompositorApp setCurrentApp={setCurrentApp} />;

      case "ndvi":
        return <NdviApp setCurrentApp={setCurrentApp} />;

      case "timeseries":
        return <TimeSeriesTrendApp setCurrentApp={setCurrentApp} />;

      case "thresholds":
        return <ThresholdAnalysisApp setCurrentApp={setCurrentApp} />;

      case "thresholds-calculator":
        return <ThresholdCalculatorApp setCurrentApp={setCurrentApp} />;

      case "change-detection":
        return <ChangeDetectionApp setCurrentApp={setCurrentApp} />;

      case "multiindex":
        return <MultiIndexComparison setCurrentApp={setCurrentApp} />;

      // case "test":
      //   return (
      //     <div style={centeredWrapperStyle}>
      //       <TestApp setCurrentApp={setCurrentApp} />
      //     </div>
      //   );

      case "contact":
        return (
          <div style={centeredWrapperStyle}>
            <ContactoApp setCurrentApp={setCurrentApp} />
          </div>
        );

      case "home":
      default:
        return (
          <div style={centeredWrapperStyle}>
            <HomePage setCurrentApp={setCurrentApp} />
          </div>
        );
    }
  };

  const mainAppStyle = {
    backgroundColor: COLORS.BACKGROUND,
    fontFamily: TYPOGRAPHY.FONT_FAMILY,
  };

  return (
    <div className="app-container" style={mainAppStyle}>
      <BackendStatusIndicator apiUrl={API_URL} />
      <Navbar setCurrentApp={setCurrentApp} currentApp={currentApp} />
      <div className="content-container">{renderApp()}</div>
    </div>
  );
}

// Wrap with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
