import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState('register'); // register | verify
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    mobile_number: ''
  });
  const [otp, setOtp] = useState('');
  const [otpReference, setOtpReference] = useState('');
  const [error, setError] = useState('');

  const backendURL = 'http://127.0.0.1:5000';

  const handleChange = e => setForm({...form, [e.target.name]: e.target.value});

  const sendOtp = async () => {
    try {
      const res = await axios.post(`${backendURL}/register/request`, form);
      setOtpReference(res.data.otp_reference);
      setStep('verify');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Network error');
    }
  };

  const verifyOtp = async () => {
    try {
      await axios.post(`${backendURL}/register/verify`, { otp_reference: otpReference, otp });
      router.push('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Network error');
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: '30px' }}>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {step === 'register' && (
        <>
          <input style={inputStyle} placeholder="First Name" name="first_name" value={form.first_name} onChange={handleChange} />
          <input style={inputStyle} placeholder="Last Name" name="last_name" value={form.last_name} onChange={handleChange} />
          <input style={inputStyle} placeholder="Email" name="email" value={form.email} onChange={handleChange} />
          <input style={inputStyle} placeholder="Password" type="password" name="password" value={form.password} onChange={handleChange} />
          <input style={inputStyle} placeholder="Mobile Number" name="mobile_number" value={form.mobile_number} onChange={handleChange} />
          <button style={buttonStyle} onClick={sendOtp}>Send OTP</button>
        </>
      )}

      {step === 'verify' && (
        <>
          <input style={inputStyle} placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} />
          <button style={buttonStyle} onClick={verifyOtp}>Verify OTP</button>
        </>
      )}

      <p style={{ marginTop: '20px', cursor: 'pointer', color: '#0070f3' }} onClick={() => router.push('/login')}>
        Already have an account? Login
      </p>
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  fontFamily: 'Arial'
};

const inputStyle = {
  margin: '5px 0',
  padding: '10px',
  width: '250px',
  fontSize: '1rem'
};

const buttonStyle = {
  padding: '10px 20px',
  marginTop: '15px',
  fontSize: '1rem',
  cursor: 'pointer',
  borderRadius: '5px',
  border: 'none',
  backgroundColor: '#0070f3',
  color: 'white',
};
