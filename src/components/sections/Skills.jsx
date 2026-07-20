import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { DataContext } from '../../App';

export default function Skills() {
  const data = useContext(DataContext);
  const skills = data?.skills || [];

  return (
    <section id="skills" className="section" style={{ position: 'relative', zIndex: 1 }}>
      <div className="container">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontSize: 'clamp(2.7rem, 4.5vw, 4rem)', color: '#fff', marginBottom: '30px', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
        >
          Skills
          <div style={{ width: '60px', height: '4px', background: 'var(--accent)', borderRadius: '2px', marginTop: '10px' }} />
        </motion.h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
          {skills.map((skill, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="glass card" 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 10px', borderRadius: '15px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{skill.icon}</div>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: '0 0 5px 0' }}>{skill.name}</h3>
              <p style={{ color: 'var(--accent)', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>{skill.level}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
