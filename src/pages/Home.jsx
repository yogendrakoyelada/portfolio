import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { DataContext } from '../App';

import About from '../components/sections/About';
import Skills from '../components/sections/Skills';
import Projects from '../components/sections/Projects';
import Experience from '../components/sections/Experience';
import Certifications from '../components/sections/Certifications';
import SQLShowcase from '../components/sections/SQLShowcase';
import DAXShowcase from '../components/sections/DAXShowcase';
import Contact from '../components/sections/Contact';

export default function Home() {
  const data = useContext(DataContext);
  const profile = data?.profile;

  return (
    <>
      <div className="section-align-left">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <section id="home" className="section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', padding: '15px 0 0 0' }}>
          <div className="hero-content" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
            
            <motion.div 
              className="hero-left" 
              style={{ flex: '1 1 280px' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 style={{ fontSize: 'clamp(2.5rem, 4.3vw, 3.6rem)', marginBottom: '1.2rem', textShadow: '0 10px 30px rgba(255,122,0,0.2)' }}>
                {profile?.name || 'Yogendra Koyelada'}
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
                {profile?.tagline || 'Transforming Data into Business Decisions'}
              </p>
              <p style={{ fontWeight: 600, color: '#fff', marginBottom: '1.2rem', fontSize: '0.9rem' }}>
                {profile?.role || 'Business Intelligence Developer'} — <span style={{ color: 'var(--accent)' }}>{profile?.tech?.join(' | ') || 'Power BI | SQL | DAX | Power Query'}</span>
              </p>
              <p style={{ color: 'var(--muted)', lineHeight: 1.8, maxWidth: '600px', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
                {profile?.summary}
              </p>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '2.5rem' }}>
                <a href={profile?.resumeUrl || '#'} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '14px 28px', borderRadius: '12px', background: 'var(--accent)', color: '#000', textDecoration: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                  Download Resume
                </a>
                <a href="#projects" className="btn btn-ghost" style={{ padding: '14px 28px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', backdropFilter: 'blur(10px)', fontSize: '0.9rem' }}>
                  View Projects
                </a>
              </div>

              <div className="hide-on-mobile" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div className="glass card" style={{ padding: '20px 28px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <h3 style={{ fontSize: '1.8rem', margin: 0, color: '#fff' }}>3.5+</h3>
                  <p style={{ color: 'var(--muted)', margin: '8px 0 0 0', fontSize: '0.8rem' }}>Years Experience</p>
                </div>
                <div className="glass card" style={{ padding: '20px 28px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <h3 style={{ fontSize: '1.8rem', margin: 0, color: '#fff' }}>15+</h3>
                  <p style={{ color: 'var(--muted)', margin: '8px 0 0 0', fontSize: '0.8rem' }}>Dashboards Created</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      </div>

      <div className="section-align-right"><About /></div>
      <div className="section-align-left"><Skills /></div>
      <div className="section-align-right"><Projects /></div>
      <div className="section-align-left"><Experience /></div>
      <div className="section-align-center"><SQLShowcase /></div>
      <div className="section-align-center"><DAXShowcase /></div>
      <div className="section-align-center"><Certifications /></div>
      <div className="section-align-center"><Contact /></div>
    </>
  );
}
