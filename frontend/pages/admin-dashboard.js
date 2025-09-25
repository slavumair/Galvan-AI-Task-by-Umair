import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ first_name:'', last_name:'', email:'', password:'', mobile_number:'' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;

  useEffect(() => {
    if (!token || role !== 'superadmin') router.push('/login');
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      router.push('/login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/');
  };

  const handleCreateUser = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/admin/users', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewUser({ first_name:'', last_name:'', email:'', password:'', mobile_number:'' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating user');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert('Error deleting user');
    }
  };

  if (loading) return <p style={{ textAlign:'center', marginTop:'50px' }}>Loading...</p>;

  return (
    <div style={{ padding:'20px', fontFamily:'Arial' }}>
      <h1>Super Admin Dashboard</h1>
      <button onClick={handleLogout} style={{ ...buttonStyle, marginBottom:'20px' }}>Logout</button>

      <h2>Create User</h2>
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px' }}>
        <input placeholder="First Name" value={newUser.first_name} onChange={e=>setNewUser({...newUser, first_name:e.target.value})} />
        <input placeholder="Last Name" value={newUser.last_name} onChange={e=>setNewUser({...newUser, last_name:e.target.value})} />
        <input placeholder="Email" value={newUser.email} onChange={e=>setNewUser({...newUser, email:e.target.value})} />
        <input placeholder="Password" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})} />
        <input placeholder="Mobile Number" value={newUser.mobile_number} onChange={e=>setNewUser({...newUser, mobile_number:e.target.value})} />
        <button onClick={handleCreateUser} style={buttonStyle}>Create</button>
      </div>

      <h2>Users</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Mobile</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.first_name} {u.last_name}</td>
              <td>{u.email}</td>
              <td>{u.mobile_number}</td>
              <td>
                <button onClick={() => handleDelete(u.id)} style={buttonStyle}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const buttonStyle = {
  padding:'5px 10px',
  cursor:'pointer',
  border:'none',
  borderRadius:'5px',
  backgroundColor:'#0070f3',
  color:'white'
};
