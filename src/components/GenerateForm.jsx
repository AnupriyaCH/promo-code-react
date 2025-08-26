import React, { useState } from "react";
import { generateCode } from "../utils/codeUtils.js";

export default function GenerateForm() {
  const [store, setStore] = useState(1);
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [txn, setTxn] = useState(1);
  const [code, setCode] = useState("");

  const handleGenerate = () => {
    try {
      setCode(generateCode(Number(store), date, Number(txn)));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <section className="card">
      <h2>Generate Code</h2>
      <label>Store (1–200)</label>
      <input
        type="number"
        min="1"
        max="200"
        value={store}
        onChange={(e) => setStore(e.target.value)}
      />
      <label>Date</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <label>Transaction (1–10000)</label>
      <input
        type="number"
        min="1"
        max="10000"
        value={txn}
        onChange={(e) => setTxn(e.target.value)}
      />
      <button className="btn" onClick={handleGenerate}>
        Generate
      </button>
      {code && (
        <div className="mono" style={{ marginTop: "10px" }}>
          Code: <b>{code}</b>
        </div>
      )}
    </section>
  );
}
