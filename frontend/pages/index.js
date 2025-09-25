import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '3rem', marginBottom: '40px' }}>GALVAN AI</h1>
      <div style={buttonContainer}>
        <button style={buttonStyle} onClick={() => router.push('/login')}>Login</button>
        <button style={buttonStyle} onClick={() => router.push('/register')}>Register</button>
      </div>
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  fontFamily: 'Arial',
};

const buttonContainer = {
  display: 'flex',
  gap: '20px'
};

const buttonStyle = {
  padding: '15px 30px',
  fontSize: '1.2rem',
  cursor: 'pointer',
  borderRadius: '5px',
  border: 'none',
  backgroundColor: '#0070f3',
  color: 'white',
};
