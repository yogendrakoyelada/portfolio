import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { DataContext } from '../../App';

export default function About() {
  const data = useContext(DataContext);
  const profile = data?.profile;

  if (!profile) return null;

  return (
    <section id="about" className="section" style={{ position: 'relative', zIndex: 1 }}>
      <div className="container">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontSize: 'clamp(2.7rem, 4.5vw, 4rem)', color: '#fff', marginBottom: '40px', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
        >
          About
          <div style={{ width: '60px', height: '4px', background: 'var(--accent)', borderRadius: '2px', marginTop: '10px' }} />
        </motion.h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass card" 
            style={{ flex: '1 1 500px', padding: '50px', borderRadius: '30px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <h3 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '20px' }}>{profile.name}</h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '1rem' }}>{profile.summary}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass card" 
            style={{ flex: '1 1 300px', padding: '50px', borderRadius: '30px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <h3 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '20px' }}>Contact Info</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '15px', fontSize: '1rem' }}><strong>Email:</strong> {profile.email}</p>
            <p style={{ color: 'var(--muted)', marginBottom: '15px', fontSize: '1rem' }}><strong>Phone:</strong> {profile.phone}</p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              {profile.socials?.map((social, idx) => (
                <a key={idx} href={social.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                  {social.icon} {social.name}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
