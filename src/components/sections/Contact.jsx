import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { DataContext } from '../../App';

export default function Contact() {
  const data = useContext(DataContext);
  const profile = data?.profile;

  // Format Gmail Compose URL
  const mailToUrl = profile?.email 
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(profile.email)}`
    : '#';

  return (
    <section id="contact" className="section" style={{ position: 'relative', zIndex: 1 }}>
      <div className="container">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontSize: 'clamp(2.7rem, 4.5vw, 4rem)', color: '#fff', marginBottom: '40px', textShadow: '0 10px 30px rgba(0,0,0,0.5)', textAlign: 'center' }}
        >
          Let's Work Together
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass card" 
          style={{ maxWidth: '700px', margin: '0 auto', padding: '60px 40px', borderRadius: '32px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}
        >
          <p style={{ color: 'var(--muted)', fontSize: '1.25rem', marginBottom: '40px', lineHeight: 1.6 }}>
            I'm currently open to new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
          </p>

          <a 
            href={mailToUrl} 
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{ display: 'inline-block', padding: '16px 36px', borderRadius: '16px', background: 'linear-gradient(90deg, var(--accent), #ff9b4d)', color: '#000', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.25rem' }}
          >
            Say Hello
          </a>
        </motion.div>
      </div>
    </section>
  );
}
