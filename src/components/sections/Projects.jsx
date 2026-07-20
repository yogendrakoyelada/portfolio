import React, { useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DataContext } from '../../App';
import { X, Play, ChevronLeft, ChevronRight } from 'lucide-react';

// Helper to convert standard youtube links to embed links
const getEmbedUrl = (url) => {
  if (!url) return '';
  let videoId = '';
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1];
    const ampersandPosition = videoId.indexOf('&');
    if (ampersandPosition !== -1) {
      videoId = videoId.substring(0, ampersandPosition);
    }
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1];
    const questionPosition = videoId.indexOf('?');
    if (questionPosition !== -1) {
      videoId = videoId.substring(0, questionPosition);
    }
  } else if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  
  return url;
};

// Image Carousel Component
const ImageCarousel = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const validImages = images ? images.filter(img => img && img.trim() !== '') : [];

  useEffect(() => {
    if (validImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [validImages.length]);

  if (validImages.length === 0) return null;

  return (
    <div style={{ aspectRatio: '16/9', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', position: 'relative', background: 'rgba(0,0,0,0.2)' }}>
      <AnimatePresence initial={false} mode="wait">
        <motion.img 
          key={currentIndex}
          src={validImages[currentIndex]} 
          alt={`${title} screenshot ${currentIndex + 1}`} 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} 
        />
      </AnimatePresence>
      
      {validImages.length > 1 && (
        <div style={{ position: 'absolute', bottom: '15px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 10 }}>
          {validImages.map((_, i) => (
            <div 
              key={i} 
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === currentIndex ? 'var(--accent)' : 'rgba(255,255,255,0.4)', transition: 'background 0.3s' }} 
            />
          ))}
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)', pointerEvents: 'none', zIndex: 5 }} />
    </div>
  );
};

// Video Modal Portal Component
const VideoModal = ({ activeVideo, onClose }) => {
  if (!activeVideo) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(10px)',
        zIndex: 99999, // Extremely high z-index to stay above everything
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{ width: '100%', maxWidth: '1000px', aspectRatio: '16/9', position: 'relative', background: '#000', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
        >
          <X size={24} />
        </button>
        <iframe 
          src={activeVideo} 
          title="Project Insights" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          style={{ width: '100%', height: '100%' }}
        />
      </motion.div>
    </div>,
    document.body
  );
};

export default function Projects() {
  const data = useContext(DataContext);
  const projects = data?.projects || [];
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <section id="projects" className="section" style={{ position: 'relative', zIndex: 1 }}>
      <div className="container">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontSize: 'clamp(2.7rem, 4.5vw, 4rem)', color: '#fff', marginBottom: '40px', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
        >
          Projects
          <div style={{ width: '60px', height: '4px', background: 'var(--accent)', borderRadius: '2px', marginTop: '10px' }} />
        </motion.h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
          {projects.map((project, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass card" 
              style={{ display: 'flex', flexDirection: 'column', padding: '30px', borderRadius: '30px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <ImageCarousel images={project.gallery} title={project.title} />
              
              <h3 style={{ color: '#fff', fontSize: '1.6rem', margin: '15px 0 10px 0' }}>{project.title}</h3>
              <p style={{ color: 'var(--accent)', fontSize: '1rem', marginBottom: '15px', fontWeight: 600 }}>
                {project.industries?.join(', ')}
              </p>
              
              <p style={{ color: 'var(--muted)', fontSize: '1rem', flex: 1, lineHeight: 1.6 }}>
                <strong>Business Problem:</strong> {project.businessProblem}
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px', marginBottom: '25px' }}>
                {project.technologies?.map((tech, i) => (
                  <span key={i} style={{ padding: '4px 10px', background: 'rgba(255,122,0,0.1)', color: 'var(--accent)', borderRadius: '99px', fontSize: '0.8rem', border: '1px solid rgba(255,122,0,0.2)' }}>
                    {tech}
                  </span>
                ))}
              </div>

              {project.video && (
                <button 
                  onClick={() => setActiveVideo(getEmbedUrl(project.video))}
                  className="btn btn-primary"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px', 
                    width: '100%', 
                    padding: '14px', 
                    borderRadius: '12px', 
                    background: 'var(--accent)', 
                    color: '#000', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontWeight: 'bold', 
                    fontSize: '1rem' 
                  }}
                >
                  <Play size={18} fill="#000" /> View Insights
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <VideoModal activeVideo={activeVideo} onClose={() => setActiveVideo(null)} />
    </section>
  );
}
