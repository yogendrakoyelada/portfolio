import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Save, Download, Edit3, Plus, Trash2, ChevronDown, ChevronUp, AlertCircle, Upload, LogOut } from 'lucide-react';
import { databases, storage, account, DATABASE_ID, COLLECTION_ID, DOCUMENT_ID, BUCKET_ID } from '../lib/appwrite';
import { ID } from 'appwrite';

// ... keeping helpers and DynamicField ...
function setNestedValue(obj, path, value) {
  const newObj = Array.isArray(obj) ? [...obj] : { ...obj };
  let current = newObj;
  for (let i = 0; i < path.length - 1; i++) {
    current[path[i]] = Array.isArray(current[path[i]]) ? [...current[path[i]]] : { ...current[path[i]] };
    current = current[path[i]];
  }
  current[path[path.length - 1]] = value;
  return newObj;
}

// Helper to add item to array
function addArrayItem(obj, path, templateItem) {
  const newObj = Array.isArray(obj) ? [...obj] : { ...obj };
  let current = newObj;
  for (let i = 0; i < path.length; i++) {
    current[path[i]] = Array.isArray(current[path[i]]) ? [...current[path[i]]] : { ...current[path[i]] };
    current = current[path[i]];
  }
  current.push(templateItem);
  return newObj;
}

// Helper to remove item from array
function removeArrayItem(obj, path, index) {
  const newObj = Array.isArray(obj) ? [...obj] : { ...obj };
  let current = newObj;
  for (let i = 0; i < path.length; i++) {
    current[path[i]] = Array.isArray(current[path[i]]) ? [...current[path[i]]] : { ...current[path[i]] };
    current = current[path[i]];
  }
  current.splice(index, 1);
  return newObj;
}

// Determine if string is long enough for a textarea
const isLongText = (key, val) => {
  if (typeof val !== 'string') return false;
  if (['description', 'overview', 'summary', 'sql', 'dax', 'code'].includes(key.toLowerCase())) return true;
  return val.length > 60;
};

// Generates an empty template object based on the first item in the array
const getEmptyTemplate = (arr) => {
  if (!arr || arr.length === 0) return {};
  const template = {};
  Object.keys(arr[0]).forEach(k => {
    if (k === 'gallery') template[k] = ['', '', '', ''];
    else if (Array.isArray(arr[0][k])) template[k] = [];
    else if (typeof arr[0][k] === 'string') template[k] = '';
    else if (typeof arr[0][k] === 'number') template[k] = 0;
    else template[k] = null;
  });
  return template;
};

function DynamicField({ label, value, path, onChange, onAdd, onRemove }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [uploading, setUploading] = useState([false, false, false, false]);

  const handleFileUpload = async (e, index, galleryItems) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });

    try {
      const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), file);
      // Construct the file view URL natively since the SDK might return an object
      const fileUrl = storage.getFileView(BUCKET_ID, uploadedFile.$id).href || storage.getFileView(BUCKET_ID, uploadedFile.$id);
      
      const newGallery = [...galleryItems];
      newGallery[index] = typeof fileUrl === 'string' ? fileUrl : fileUrl.toString();
      onChange(path, newGallery);
    } catch (error) {
      console.error('File upload failed', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(prev => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
    }
  };

  if (Array.isArray(value)) {
    // Special Case: Project Gallery should have 4 image upload fields
    if (label === 'gallery') {
      const galleryItems = [...value, '', '', '', ''].slice(0, 4);
      return (
        <div className="form-group" style={{ marginBottom: '20px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <label style={{ display: 'block', color: 'var(--accent)', marginBottom: '15px', fontSize: '1rem', textTransform: 'capitalize' }}>Project Images (Gallery)</label>
          <div style={{ display: 'grid', gap: '15px' }}>
            {galleryItems.map((imgUrl, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {imgUrl ? (
                  <div style={{ width: '60px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: '#000' }}>
                    <img src={imgUrl} alt={`Preview ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ width: '60px', height: '40px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '0.7rem' }}>
                    Empty
                  </div>
                )}
                
                <div style={{ flex: 1 }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.85rem', display: 'block', marginBottom: '5px' }}>Image {i+1}</span>
                  {uploading[i] ? (
                    <span style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>Uploading...</span>
                  ) : (
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#fff', background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
                      <Upload size={14} /> Upload Image
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={(e) => handleFileUpload(e, i, galleryItems)}
                      />
                    </label>
                  )}
                </div>
                {imgUrl && (
                  <button 
                    onClick={() => {
                      const newGallery = [...galleryItems];
                      newGallery[i] = '';
                      onChange(path, newGallery);
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '5px' }}
                    title="Remove Image"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Normal Array of Primitives (e.g. tech, industries)
    if (value.length === 0 || typeof value[0] === 'string' || typeof value[0] === 'number') {
      return (
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: 'var(--accent)', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'capitalize' }}>{label}</label>
          <input 
            type="text" 
            value={value.join(', ')} 
            onChange={(e) => {
              const arr = e.target.value.split(',').map(s => s.trim());
              onChange(path, arr);
            }}
            placeholder="Comma separated values"
            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.95rem' }}
          />
        </div>
      );
    }
    
    // Array of Objects (e.g. Projects, Experience)
    return (
      <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: 'var(--accent)', textTransform: 'capitalize', fontSize: '1.2rem' }}>{label} ({value.length})</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setIsExpanded(!isExpanded)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            <button 
              onClick={() => onAdd(path, getEmptyTemplate(value))} 
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,122,0,0.2)', color: 'var(--accent)', border: '1px solid rgba(255,122,0,0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              <Plus size={16} /> Add Item
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              {value.map((item, idx) => (
                <div key={idx} style={{ padding: '20px', marginBottom: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '3px solid var(--accent)', position: 'relative' }}>
                  <button 
                    onClick={() => onRemove(path, idx)}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '5px' }}
                    title="Remove Item"
                  >
                    <Trash2 size={18} />
                  </button>
                  <p style={{ margin: '0 0 15px 0', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Item {idx + 1}</p>
                  
                  {Object.keys(item).map(key => (
                    <DynamicField 
                      key={key} 
                      label={key} 
                      value={item[key]} 
                      path={[...path, idx, key]} 
                      onChange={onChange} 
                      onAdd={onAdd}
                      onRemove={onRemove}
                    />
                  ))}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Object
  if (typeof value === 'object' && value !== null) {
    return (
      <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#fff', textTransform: 'capitalize' }}>{label}</h4>
        {Object.keys(value).map(key => (
          <DynamicField 
            key={key} 
            label={key} 
            value={value[key]} 
            path={[...path, key]} 
            onChange={onChange} 
            onAdd={onAdd}
            onRemove={onRemove}
          />
        ))}
      </div>
    );
  }

  // Primitive (String, Number)
  return (
    <div className="form-group" style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', color: 'var(--muted)', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'capitalize' }}>{label}</label>
      {isLongText(label, value) ? (
        <textarea 
          value={value || ''} 
          onChange={(e) => onChange(path, e.target.value)}
          rows={5}
          style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.95rem', resize: 'vertical', fontFamily: ['code', 'sql', 'dax'].includes(label.toLowerCase()) ? 'monospace' : 'inherit' }}
        />
      ) : (
        <input 
          type="text" 
          value={value || ''} 
          onChange={(e) => onChange(path, e.target.value)}
          placeholder={label === 'video' ? "https://youtube.com/watch?v=..." : ""}
          style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.95rem' }}
        />
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [fullData, setFullData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const tabs = ['profile', 'skills', 'projects', 'experience', 'certifications', 'sql', 'dax'];

  useEffect(() => {
    // Check Auth
    account.get()
      .then(() => setIsAuthenticated(true))
      .catch(() => navigate('/login'));
      
    // Fetch Data
    databases.getDocument(DATABASE_ID, COLLECTION_ID, DOCUMENT_ID)
      .then(response => {
        const parsedData = JSON.parse(response.jsonString);
        if (parsedData.profile && parsedData.profile.pixelPeakLink === undefined) {
          parsedData.profile.pixelPeakLink = '';
        }
        setFullData(parsedData);
      })
      .catch(err => {
        console.error('Failed to load from Appwrite, falling back to local json', err);
        fetch('/data/data.json')
          .then(res => res.json())
          .then(data => {
            if (data.profile && data.profile.pixelPeakLink === undefined) {
              data.profile.pixelPeakLink = '';
            }
            setFullData(data);
          });
      });
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleChange = (path, newValue) => {
    setFullData(prev => setNestedValue(prev, path, newValue));
  };

  const handleAddItem = (path, template) => {
    setFullData(prev => addArrayItem(prev, path, template));
  };

  const handleRemoveItem = (path, index) => {
    setFullData(prev => removeArrayItem(prev, path, index));
  };

  const handleSaveToCloud = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      await databases.updateDocument(
        DATABASE_ID, 
        COLLECTION_ID, 
        DOCUMENT_ID, 
        { jsonString: JSON.stringify(fullData) }
      );
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (!fullData) return <div style={{ color: '#fff', padding: '100px', textAlign: 'center' }}>Loading CMS...</div>;

  const currentTabData = fullData[activeTab];

  return (
    <div className="container" style={{ position: 'relative', zIndex: 1, padding: '40px 0' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass card" 
        style={{ 
          background: 'rgba(20,20,25,0.7)', 
          backdropFilter: 'blur(20px)', 
          padding: '40px', 
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '80vh'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <h2 style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Edit3 size={28} color="var(--accent)" /> Content Management System
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {saveStatus === 'success' && <span style={{ color: '#4ade80', fontSize: '0.9rem', fontWeight: 600 }}>Saved to Cloud!</span>}
            {saveStatus === 'error' && <span style={{ color: '#ff4d4d', fontSize: '0.9rem', fontWeight: 600 }}>Failed to save</span>}
            <button 
              onClick={handleSaveToCloud} 
              disabled={saving}
              className="btn btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: saving ? 'var(--muted)' : 'var(--accent)', color: '#000', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600 }}
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save to Cloud'}
            </button>
            <button 
              onClick={handleLogout} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontWeight: 600 }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'rgba(255,122,0,0.1)' : 'transparent',
                color: activeTab === tab ? 'var(--accent)' : 'var(--muted)',
                border: activeTab === tab ? '1px solid rgba(255,122,0,0.3)' : '1px solid transparent',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontWeight: activeTab === tab ? 600 : 400,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, paddingRight: '10px' }}>
          {Array.isArray(currentTabData) ? (
            <DynamicField 
              label={activeTab} 
              value={currentTabData} 
              path={[activeTab]} 
              onChange={handleChange}
              onAdd={handleAddItem}
              onRemove={handleRemoveItem}
            />
          ) : (
            Object.keys(currentTabData || {}).map(key => (
              <DynamicField 
                key={key} 
                label={key} 
                value={currentTabData[key]} 
                path={[activeTab, key]} 
                onChange={handleChange}
                onAdd={handleAddItem}
                onRemove={handleRemoveItem}
              />
            ))
          )}
        </div>

      </motion.div>
    </div>
  );
}
