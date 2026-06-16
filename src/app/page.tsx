"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";

export default function Home() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    setError("");
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!paste) return;
    const newOtp = [...otp];
    paste.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    setError("");
    const nextEmpty = paste.length < 6 ? paste.length : 5;
    inputRefs.current[nextEmpty]?.focus();
  };

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Masukkan 6 digit kode OTP terlebih dahulu.");
      const firstEmpty = otp.findIndex((v) => v === "");
      inputRefs.current[firstEmpty]?.focus();
      return;
    }
    setLoading(true);
    setError("");
    // TODO: ganti dengan logika autentikasi kamu
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    alert(`Kode OTP: ${code.slice(0, 3)}-${code.slice(3)} dikirim!`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #dce8f8 0%, #e8ecf8 50%, #dce8f8 100%)" }}>
      <div className="bg-white rounded-3xl shadow-sm p-10 w-full max-w-md text-center">

        {/* Icon */}
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "#e8eeff" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5B8DEF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-xl font-bold text-gray-900 mb-2">Masuk ke Portal Suara</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Masukkan 6 digit kode OTP yang telah<br />diberikan oleh panitia pemilihan.
        </p>

        {/* OTP Inputs */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otp[i]}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center text-lg font-semibold border rounded-xl outline-none transition-all duration-150 focus:ring-2"
              style={{
                borderColor: error ? "#f87171" : "#d1d5db",
                boxShadow: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#5B8DEF")}
              onBlur={(e) => (e.target.style.borderColor = error ? "#f87171" : "#d1d5db")}
            />
          ))}

          <span className="text-gray-400 text-xl mx-1 select-none">—</span>

          {[3, 4, 5].map((i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otp[i]}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center text-lg font-semibold border rounded-xl outline-none transition-all duration-150"
              style={{
                borderColor: error ? "#f87171" : "#d1d5db",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#5B8DEF")}
              onBlur={(e) => (e.target.style.borderColor = error ? "#f87171" : "#d1d5db")}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-500 mb-4 -mt-2">{error}</p>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 rounded-full text-white font-medium text-base transition-all duration-150 disabled:opacity-70"
          style={{ background: loading ? "#93b4f5" : "#5B8DEF" }}
          onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.background = "#4a7de0"); }}
          onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.background = "#5B8DEF"); }}
        >
          {loading ? "Memverifikasi..." : "Masuk"}
        </button>

        {/* Help text */}
        <p className="mt-6 text-sm text-gray-400 flex items-center justify-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Butuh bantuan? Hubungi panitia.
        </p>
      </div>
    </main>
  );
}