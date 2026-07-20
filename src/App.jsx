import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID, DOCUMENT_ID } from './lib/appwrite';
import ThreeCanvas from './components/ThreeCanvas';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

export const DataContext = createContext(null);

export default function App() {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Scroll tracking
    const handleScroll = () => {
      const sections = ['home', 'about', 'skills', 'projects', 'experience', 'sql', 'dax', 'certifications', 'contact'];
      let current = '';

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 3) {
            current = section;
            break;
          }
        }
      }
      
      if (current && current !== activeSection) {
        setActiveSection(current);
      }

      // Check if reached bottom
      const bottomReached = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 200;
      setIsAtBottom(bottomReached);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  useEffect(() => {
    // Fetch unified data from Appwrite
    databases.getDocument(DATABASE_ID, COLLECTION_ID, DOCUMENT_ID)
      .then(response => {
        const parsedData = JSON.parse(response.jsonString);
        setPortfolioData(parsedData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load from Appwrite, falling back to local json', err);
        // Fallback for development if appwrite fails
        fetch('/data/data.json')
          .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
          })
          .then(data => {
            setPortfolioData(data);
            setLoading(false);
          })
          .catch(fallbackErr => {
            console.error('Fallback failed', fallbackErr);
            setError('Failed to load portfolio data. Please try again later.');
            setLoading(false);
          });
      });
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff', fontSize: '1.2rem' }}>Loading Portfolio...</div>;
  }

  if (error) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#ff7a00', fontSize: '1.2rem' }}>{error}</div>;
  }

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'sql', label: 'SQL' },
    { id: 'dax', label: 'DAX' },
    { id: 'certifications', label: 'Certs' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <DataContext.Provider value={portfolioData}>
      <Router>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {/* The 3D Canvas sits in the background */}
          <ThreeCanvas />
          
          {/* Content sits on top */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <header className="site-header">
              <nav className="nav">
                <div className="nav-inner container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Link to="/" className="brand">YK</Link>
                  
                  {/* Desktop Nav */}
                  <div className="desktop-nav" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {navItems.map(item => (
                      <a 
                        key={item.id} 
                        href={`/#${item.id}`} 
                        style={{ 
                          color: activeSection === item.id ? '#fff' : 'var(--muted)', 
                          textDecoration: 'none', 
                          fontSize: '0.9rem', 
                          padding: '5px 8px',
                          borderBottom: activeSection === item.id ? '2px solid var(--accent)' : '2px solid transparent',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>

                  {/* Mobile Hamburger Button */}
                  <button 
                    className="mobile-menu-btn" 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'none', padding: '10px' }}
                  >
                    <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`} style={{ display: 'block', width: '24px', height: '2px', background: '#fff', marginBottom: '6px', transition: '0.3s' }}></span>
                    <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`} style={{ display: 'block', width: '24px', height: '2px', background: '#fff', marginBottom: '6px', transition: '0.3s' }}></span>
                    <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`} style={{ display: 'block', width: '24px', height: '2px', background: '#fff', transition: '0.3s' }}></span>
                  </button>
                </div>
              </nav>

              {/* Mobile Dropdown Menu */}
              {isMobileMenuOpen && (
                <div className="mobile-dropdown" style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(15px)', position: 'absolute', top: '100%', left: 0, width: '100%', borderBottom: '1px solid rgba(255,122,0,0.2)', padding: '20px 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    {navItems.map(item => (
                      <a 
                        key={item.id} 
                        href={`/#${item.id}`} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{ 
                          color: activeSection === item.id ? '#fff' : 'var(--muted)', 
                          textDecoration: 'none', 
                          fontSize: '1.2rem', 
                          padding: '5px 10px',
                          borderBottom: activeSection === item.id ? '2px solid var(--accent)' : '2px solid transparent',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </header>

            <main style={{ marginTop: '75px' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </main>
          </div>

          {(() => {
            let link = portfolioData?.profile?.pixelPeakLink;
            if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
              link = 'https://' + link;
            }
            const BadgeTag = link ? 'a' : 'div';
            return (
              <BadgeTag 
                href={link ? link : undefined}
                target={link ? "_blank" : undefined}
                rel={link ? "noopener noreferrer" : undefined}
                className={`pixelpeak-badge ${isAtBottom ? 'visible-on-mobile' : ''}`}
                style={{
                  position: 'fixed',
                  bottom: '20px',
                  right: '20px',
                  zIndex: 50,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(5, 5, 7, 0.8)',
                  backdropFilter: 'blur(10px)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  pointerEvents: 'auto',
                  textDecoration: 'none',
                  cursor: link ? 'pointer' : 'default'
                }}>
                <span>Product by PixelPeak</span>
                <img src="/assets/images/pixelpeak.png" alt="PixelPeak Logo" style={{ height: '24px', width: 'auto' }} />
              </BadgeTag>
            );
          })()}
        </div>
      </Router>
    </DataContext.Provider>
  );
}
