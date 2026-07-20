import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, LogIn, AlertCircle } from 'lucide-react';
import { account } from '../lib/appwrite';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    account.get()
      .then(() => navigate('/admin'))
      .catch(() => { /* not logged in, stay on page */ });
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await account.createEmailPasswordSession(email, password);
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass card"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px',
          borderRadius: '24px',
          background: 'rgba(20,20,25,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,122,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={28} color="var(--accent)" />
          </div>
        </div>
        
        <h2 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '1.8rem' }}>Admin Access</h2>
        <p style={{ color: 'var(--muted)', margin: '0 0 30px 0', fontSize: '0.9rem' }}>Sign in to manage your portfolio</p>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'left' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '8px', fontSize: '0.85rem' }}>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '14px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem' }}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '8px', fontSize: '0.85rem' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '14px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              width: '100%', 
              padding: '14px', 
              borderRadius: '8px', 
              background: loading ? 'var(--muted)' : 'var(--accent)', 
              color: '#000', 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              fontWeight: 600,
              fontSize: '1rem',
              marginTop: '10px'
            }}
          >
            {loading ? 'Authenticating...' : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
