import React, { useState } from "react";
import { decodeCode } from "../utils/codeUtils.js";

export default function DecodeForm() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleDecode = () => {
    try {
      const res = decodeCode(input);
      setResult(res);
      setError("");
    } catch (e) {
      setError(e.message);
      setResult(null);
    }
  };

  return (
    <section className="card">
      <h2>Decode Code</h2>
      <input
        type="text"
        placeholder="Enter code"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button className="btn" onClick={handleDecode}>
        Decode
      </button>
      {error && <div className="bad">{error}</div>}
      {result && (
        <div className="ok" style={{ marginTop: "10px" }}>
          ✅ Valid<br />
          Store: {result.storeId}<br />
          Date: {result.dateYmd}<br />
          Transaction: {result.txnNum}
        </div>
      )}
    </section>
  );
}
