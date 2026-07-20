import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { DataContext } from '../../App';

export default function Experience() {
  const data = useContext(DataContext);
  const experience = data?.experience || [];

  return (
    <section id="experience" className="section" style={{ position: 'relative', zIndex: 1 }}>
      <div className="container">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontSize: 'clamp(2.7rem, 4.5vw, 4rem)', color: '#fff', marginBottom: '40px', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
        >
          Experience
          <div style={{ width: '60px', height: '4px', background: 'var(--accent)', borderRadius: '2px', marginTop: '10px' }} />
        </motion.h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {experience.map((job, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass card" 
              style={{ position: 'relative', padding: '40px', borderRadius: '30px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderLeft: '6px solid var(--accent)' }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '1.6rem', margin: '0 0 10px 0' }}>{job.title}</h3>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '1rem', margin: 0, padding: '6px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '30px', fontWeight: 600 }}>
                  {job.period}
                </p>
              </div>
              <p style={{ color: 'var(--muted)', lineHeight: 1.8, margin: 0, fontSize: '1rem' }}>
                {job.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
