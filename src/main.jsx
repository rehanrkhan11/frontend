// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      {/* Toast notifications — tweak position/style as needed */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "DM Sans, sans-serif",
            fontSize: "14px",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          },
          success: { iconTheme: { primary: "#0d9488", secondary: "#fff" } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
