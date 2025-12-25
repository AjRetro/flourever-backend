import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PencilIcon, PhotoIcon, MapPinIcon, CalendarDaysIcon, 
  EnvelopeIcon, ArrowRightOnRectangleIcon, ShoppingBagIcon
} from '@heroicons/react/24/solid';

// --- Cloudinary Upload Details ---
const CLOUDINARY_CLOUD_NAME = "dbcjwlgwm";
const CLOUDINARY_UPLOAD_PRESET = "flourever_preset";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 50, damping: 15 }
  },
  hover: { 
    y: -5, 
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { type: "spring", stiffness: 400, damping: 10 }
  }
};

export default function ProfilePage() {
  const { user, loading, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', description: '', profileImageUrl: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
      return;
    }
    if (user) {
      const fetchData = async () => {
        try {
          const res = await api.get('/profile');
          setProfileData(res.data);
          setFormData({
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            description: res.data.description || '',
            profileImageUrl: res.data.profileImageUrl || 'https://placehold.co/400x400/ffe4b5/ae6f44?text=User'
          });
          setIsLoading(false);
        } catch (err) {
          console.error(err);
          setError('Failed to load profile.');
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user, loading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    
    setIsSaving(true);
    setError('');
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST', body: uploadData,
      });
      if (!res.ok) throw new Error('Image upload failed.');
      const data = await res.json();
      setFormData(prev => ({ ...prev, profileImageUrl: data.secure_url }));
    } catch (err) {
      setError('Image upload failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const res = await api.put('/profile', formData);
      updateUser(res.data); 
      setProfileData(prev => ({ ...prev, ...formData }));
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen py-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- Header --- */}
        <motion.div 
          variants={cardVariants}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold font-serif text-brand-primary">My Profile</h1>
            <p className="text-brand-primary/70 mt-1 font-medium">Manage your account and delivery details.</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="mt-4 sm:mt-0 flex items-center gap-2 text-red-600 font-bold hover:text-red-800 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors shadow-sm bg-white border border-red-100"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Sign Out
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN --- */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Identity Card */}
            <motion.div 
              variants={cardVariants}
              whileHover="hover"
              className="bg-brand-light rounded-3xl shadow-xl border border-brand-primary/10 overflow-hidden"
            >
              <div className="p-8 text-center">
                
                {/* Avatar Area */}
                <div className="relative w-36 h-36 mx-auto mb-6 group">
                  <motion.div 
                    className="absolute inset-0 rounded-full bg-brand-accent opacity-0 group-hover:opacity-10 transition-opacity"
                    animate={{ rotate: isSaving ? 360 : 0 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  />
                  <img 
                    src={formData.profileImageUrl} 
                    alt="Profile" 
                    className={`relative w-36 h-36 rounded-full object-cover border-[6px] border-white shadow-md ${isSaving ? 'opacity-50 grayscale' : ''}`}
                  />
                  
                  {isEditing && (
                    <motion.label 
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute bottom-1 right-1 bg-brand-primary text-white p-2.5 rounded-full cursor-pointer shadow-lg z-10"
                    >
                      <PhotoIcon className="w-5 h-5" />
                      <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={isSaving} />
                    </motion.label>
                  )}

                  {isSaving && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full z-0">
                      <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"/>
                    </div>
                  )}
                </div>

                <motion.h2 layout className="text-2xl font-bold font-serif text-brand-primary mb-1">
                  {formData.firstName} {formData.lastName}
                </motion.h2>
                
                <div className="flex justify-center items-center gap-2 text-sm text-brand-primary/70 mb-6 bg-white/60 py-1 px-3 rounded-full inline-flex mx-auto">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>{profileData.email}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 pt-6 border-t border-brand-primary/10">
                  <div className="text-center">
                    <p className="text-2xl font-black text-brand-accent">{profileData.completedOrders}</p>
                    <p className="text-[10px] font-bold uppercase text-brand-primary/50 tracking-wider flex items-center justify-center gap-1">
                      <ShoppingBagIcon className="w-3 h-3" /> Orders
                    </p>
                  </div>
                  <div className="text-center border-l border-brand-primary/10">
                    <p className="text-2xl font-black text-brand-accent">{new Date(profileData.createdAt).getFullYear()}</p>
                    <p className="text-[10px] font-bold uppercase text-brand-primary/50 tracking-wider flex items-center justify-center gap-1">
                      <CalendarDaysIcon className="w-3 h-3" /> Member
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Saved Location Card */}
            <motion.div 
              variants={cardVariants}
              whileHover="hover"
              className="bg-brand-light rounded-3xl shadow-lg border border-brand-primary/10 p-6"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-brand-primary/5">
                <div className="bg-brand-secondary/30 p-2 rounded-xl text-brand-accent">
                  <MapPinIcon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-brand-primary text-sm uppercase tracking-wide">Default Delivery</h3>
              </div>

              {profileData.default_address ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-brand-primary/50 font-bold uppercase mb-1">Address</p>
                    <p className="text-sm text-brand-primary/90 font-medium leading-relaxed bg-white p-3 rounded-xl border border-brand-primary/5">
                      {profileData.default_address}
                    </p>
                  </div>
                  {profileData.default_instructions && (
                    <div>
                      <p className="text-xs text-brand-primary/50 font-bold uppercase mb-1">Note</p>
                      <p className="text-sm text-brand-accent italic bg-brand-secondary/10 p-3 rounded-xl border border-brand-secondary/20">
                        "{profileData.default_instructions}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-brand-primary/20 rounded-xl bg-white/50">
                  <p className="text-brand-primary/60 text-sm">No location saved yet.</p>
                  <p className="text-xs text-brand-primary/40 mt-1">Order once to save your spot!</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* --- RIGHT COLUMN: Edit Form --- */}
          <div className="lg:col-span-2">
            <motion.div 
              variants={cardVariants}
              className="bg-brand-light rounded-3xl shadow-xl border border-brand-primary/10 h-full flex flex-col"
            >
              <div className="p-8 border-b border-brand-primary/10 flex justify-between items-center">
                <h3 className="text-xl font-bold font-serif text-brand-primary">Personal Details</h3>
                {!isEditing && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="group flex items-center gap-2 text-sm font-bold text-brand-accent hover:text-brand-primary transition-colors px-4 py-2 rounded-xl bg-white border border-brand-primary/5 shadow-sm"
                  >
                    <PencilIcon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Edit Profile
                  </motion.button>
                )}
              </div>

              <div className="p-8 flex-1">
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-200 text-sm font-medium flex items-center gap-2"
                    >
                       <span className="w-1 h-1 bg-red-500 rounded-full" /> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSaveProfile} className="h-full flex flex-col">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <motion.div layout>
                      <label className="block text-xs font-bold text-brand-primary/60 uppercase tracking-wider mb-2 ml-1">First Name</label>
                      <input 
                        type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} 
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none font-medium text-brand-primary
                          ${isEditing 
                            ? 'border-brand-primary/20 bg-white focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10' 
                            : 'border-transparent bg-brand-secondary/20 cursor-default'}`}
                        readOnly={!isEditing} 
                      />
                    </motion.div>
                    <motion.div layout>
                      <label className="block text-xs font-bold text-brand-primary/60 uppercase tracking-wider mb-2 ml-1">Last Name</label>
                      <input 
                        type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} 
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none font-medium text-brand-primary
                          ${isEditing 
                            ? 'border-brand-primary/20 bg-white focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10' 
                            : 'border-transparent bg-brand-secondary/20 cursor-default'}`}
                        readOnly={!isEditing} 
                      />
                    </motion.div>
                  </div>

                  <motion.div layout className="mb-8">
                    <label className="block text-xs font-bold text-brand-primary/60 uppercase tracking-wider mb-2 ml-1">About Me</label>
                    <textarea 
                      name="description" value={formData.description} onChange={handleInputChange} rows="6"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none font-medium text-brand-primary resize-none
                        ${isEditing 
                          ? 'border-brand-primary/20 bg-white focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10' 
                          : 'border-transparent bg-brand-secondary/20 cursor-default'}`}
                      readOnly={!isEditing}
                      placeholder={isEditing ? "Share a sweet fact about yourself..." : "No description added yet."}
                    />
                  </motion.div>

                  <AnimatePresence>
                    {isEditing && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, y: 10 }} 
                        animate={{ opacity: 1, height: 'auto', y: 0 }} 
                        exit={{ opacity: 0, height: 0, y: 10 }}
                        className="flex justify-end gap-3 pt-6 border-t border-brand-primary/10 mt-auto"
                      >
                        <motion.button 
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          type="button" 
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              firstName: profileData.firstName,
                              lastName: profileData.lastName,
                              description: profileData.description || '',
                              profileImageUrl: profileData.profileImageUrl || 'https://placehold.co/400x400/ffe4b5/ae6f44?text=User'
                            });
                            setError('');
                          }}
                          className="px-6 py-2.5 rounded-xl font-bold text-brand-primary/70 hover:bg-brand-primary/5 transition-colors"
                        >
                          Cancel
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          type="submit" 
                          disabled={isSaving}
                          className="px-8 py-2.5 bg-brand-accent text-white rounded-xl font-bold hover:bg-brand-primary transition-all shadow-lg shadow-brand-accent/20 disabled:opacity-50 flex items-center gap-2"
                        >
                          {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
                          Save Changes
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}