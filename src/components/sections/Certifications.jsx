import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { DataContext } from '../../App';

export default function Certifications() {
  const data = useContext(DataContext);
  const certs = data?.certifications || [];

  return (
    <section id="certifications" className="section" style={{ position: 'relative', zIndex: 1 }}>
      <div className="container">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontSize: 'clamp(2.7rem, 4.5vw, 4rem)', color: '#fff', marginBottom: '40px', textShadow: '0 10px 30px rgba(0,0,0,0.5)', textAlign: 'center' }}
        >
          Certifications
          <div style={{ width: '60px', height: '4px', background: 'var(--accent)', borderRadius: '2px', margin: '10px auto 0' }} />
        </motion.h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
          {certs.map((cert, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass card" 
              style={{ display: 'flex', alignItems: 'center', gap: '25px', padding: '30px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div style={{ width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,122,0,0.1)', borderRadius: '16px' }}>
                <span style={{ fontSize: '32px' }}>🏆</span>
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', margin: '0 0 8px 0' }}>{cert.title}</h3>
                <p style={{ color: 'var(--accent)', fontSize: '1rem', margin: '0 0 8px 0', fontWeight: 600 }}>{cert.period}</p>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>{cert.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
