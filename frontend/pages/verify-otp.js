import { useState } from "react";
import { useRouter } from "next/router";

export default function VerifyOTP() {
  const router = useRouter();
  const [otpReference, setOtpReference] = useState(""); // Will get from query or localStorage
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  // If you stored otp_reference in localStorage
  if (typeof window !== "undefined" && !otpReference) {
    const storedRef = localStorage.getItem("otp_reference");
    if (storedRef) setOtpReference(storedRef);
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://127.0.0.1:5000/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp_reference: otpReference, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Registration successful! You can now login.");
        localStorage.removeItem("otp_reference");
        router.push("/"); // Redirect to login page
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      setMessage("Network error");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", fontFamily: "Arial" }}>
      <h2>Verify OTP</h2>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", margin: "5px 0" }}
        />
        <button type="submit" style={{ width: "100%", padding: "10px", marginTop: "10px" }}>
          Verify
        </button>
      </form>
      {message && <p style={{ marginTop: "15px", color: "red" }}>{message}</p>}
    </div>
  );
}
