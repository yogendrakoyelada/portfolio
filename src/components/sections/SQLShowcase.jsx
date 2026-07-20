import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { DataContext } from '../../App';

export default function SQLShowcase() {
  const data = useContext(DataContext);
  const snippets = data?.sql || [];

  return (
    <section id="sql" className="section" style={{ position: 'relative', zIndex: 1 }}>
      <div className="container">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontSize: 'clamp(2.7rem, 4.5vw, 4rem)', color: '#fff', marginBottom: '25px', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
        >
          SQL Showcase
          <div style={{ width: '60px', height: '4px', background: 'var(--accent)', borderRadius: '2px', marginTop: '10px' }} />
        </motion.h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {snippets.map((item, idx) => (
            <CollapsibleCard key={idx} item={item} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CollapsibleCard({ item, idx }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      className="glass card" 
      style={{ padding: '25px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
        <div>
          <h3 style={{ color: '#fff', fontSize: '1.5rem', margin: '0 0 10px 0' }}>{item.title}</h3>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', margin: 0, lineHeight: 1.6 }}>{item.description}</p>
        </div>
        <div style={{ 
          color: 'var(--accent)', 
          background: 'rgba(255,122,0,0.1)',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          transition: 'transform 0.3s ease, background 0.3s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0, marginTop: isOpen ? '20px' : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}
      >
        <div style={{ background: '#09080b', padding: '20px', borderRadius: '12px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' }} onClick={(e) => e.stopPropagation()}>
          <pre style={{ margin: 0, color: '#e9eef3', fontSize: '0.9rem', fontFamily: 'monospace', lineHeight: 1.5, textAlign: 'left' }}>
            <code>{item.code}</code>
          </pre>
        </div>
      </motion.div>
    </motion.div>
  );
}
