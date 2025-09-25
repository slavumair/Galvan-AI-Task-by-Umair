import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token) return router.push('/login');
    if (role === 'superadmin') return router.push('/admin-dashboard');

    const fetchUser = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        router.push('/login');
      }
    };
    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/');
  };

  if (!user) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;

  return (
    <div style={containerStyle}>
      <h1>GALVAN AI</h1>
      <p>Welcome, {user.first_name}</p>
      <button onClick={logout} style={buttonStyle}>Logout</button>
    </div>
  );
}

const containerStyle = {
  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Arial'
};

const buttonStyle = {
  padding: '10px 20px',
  fontSize: '1rem',
  cursor: 'pointer',
  borderRadius: '5px',
  border: 'none',
  backgroundColor: '#0070f3',
  color: 'white',
};
