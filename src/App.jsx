import React from "react";
import GenerateForm from "./components/GenerateForm.jsx";
import DecodeForm from "./components/DecodeForm.jsx";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <h1>Resonate — Docket Code (≤9 chars)</h1>
      <p className="hint">Encode/Decode Store, Date, and Transaction #</p>
      <div className="grid">
        <GenerateForm />
        <DecodeForm />
      </div>
    </div>
  );
}
