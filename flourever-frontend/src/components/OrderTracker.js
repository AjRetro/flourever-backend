import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardDocumentCheckIcon, CakeIcon, TruckIcon, HomeIcon, 
  StarIcon, XMarkIcon, HandThumbDownIcon, HandThumbUpIcon, CheckCircleIcon
} from '@heroicons/react/24/solid';
import api from '../api/axiosConfig'; 

const stages = [
  { id: 'Pending', label: 'Placed', icon: ClipboardDocumentCheckIcon },
  { id: 'Baking', label: 'Baking', icon: CakeIcon },
  { id: 'Out for Delivery', label: 'On the Way', icon: TruckIcon },
  { id: 'Delivered', label: 'Delivered', icon: HomeIcon },
];

// --- UPDATED PROPS: Added 'rating' and 'issueReported' ---
export default function OrderTracker({ status, orderId, rating, issueReported, onFeedbackSubmitted }) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const getCurrentStageIndex = () => {
    const statusMap = { 'Pending': 0, 'Baking': 1, 'Out for Delivery': 2, 'Delivered': 3, 'Cancelled': -1 };
    return statusMap[status] !== undefined ? statusMap[status] : 0;
  };

  const currentStageIndex = getCurrentStageIndex();

  // --- LOGIC FIX: Check database data (props) AND local state ---
  const hasExistingFeedback = rating !== null || issueReported !== null;
  const isComplete = hasExistingFeedback || hasSubmitted;

  // Only show button if Delivered AND NOT Cancelled AND NOT Complete
  const showConfirmButton = status === 'Delivered' && !isComplete;

  if (status === 'Cancelled') {
    return (
      <div className="w-full py-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
          <XMarkIcon className="w-6 h-6 text-red-600" />
        </div>
        <p className="text-red-600 font-medium">Order Cancelled</p>
      </div>
    );
  }

  return (
    <div className="w-full py-4" onClick={(e) => e.stopPropagation()}>
      {/* TRACKER UI */}
      <div className="relative flex items-center justify-between mb-6">
        <div className="absolute left-0 top-5 w-full h-1 bg-brand-primary/10 rounded-full" />
        
        <motion.div 
          className="absolute left-0 top-5 h-1 bg-brand-accent rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index <= currentStageIndex;
          const isCurrent = index === currentStageIndex;
          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                  backgroundColor: isActive ? '#835834' : '#fdf8f0',
                  color: isActive ? '#fdf8f0' : '#ae6f44',
                  borderColor: isActive ? '#835834' : '#ae6f44'
                }}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors duration-500`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <p className={`mt-2 text-xs font-medium ${isActive ? 'text-brand-primary' : 'text-brand-primary/50'}`}>
                {stage.label}
              </p>
              
              {isCurrent && status !== 'Delivered' && (
                 <span className="absolute -top-1 -right-1 flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-accent"></span>
                 </span>
              )}
            </div>
          );
        })}
      </div>

      {/* "Confirm Order Received" Button */}
      <AnimatePresence>
        {showConfirmButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowFeedbackModal(true);
            }}
            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ClipboardDocumentCheckIcon className="w-5 h-5" />
            Confirm Order Received
          </motion.button>
        )}
      </AnimatePresence>

      {/* Success Message (Persistent) */}
      {isComplete && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`text-center text-sm font-bold p-2 rounded-lg border ${issueReported ? 'text-red-600 bg-red-50 border-red-100' : 'text-green-600 bg-green-50 border-green-100'}`}
        >
          {issueReported ? "Issue Reported" : "Order Received & Rated"}
        </motion.div>
      )}

      {/* FEEDBACK MODAL */}
      <FeedbackModal 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
        orderId={orderId}
        onSuccess={() => {
          setHasSubmitted(true);
          setShowFeedbackModal(false);
          if(onFeedbackSubmitted) onFeedbackSubmitted();
        }}
      />
    </div>
  );
}

// --- FEEDBACK MODAL SUB-COMPONENT (Unchanged) ---
const FeedbackModal = ({ isOpen, onClose, orderId, onSuccess }) => {
  const [step, setStep] = useState('ask'); 
  const [rating, setRating] = useState(1); 
  const [feedback, setFeedback] = useState('');
  const [issue, setIssue] = useState('');
  const [redeliver, setRedeliver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post(`/orders/${orderId}/feedback`, {
        received: step === 'yes',
        rating: step === 'yes' ? rating : null,
        feedback,
        issue: step === 'no' ? issue : null,
        requestRedelivery: step === 'no' ? redeliver : false
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Something went wrong submitting feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentClick = (e) => { e.stopPropagation(); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
            onClick={handleContentClick}
          >
            <div className="bg-brand-secondary p-4 flex justify-between items-center border-b border-brand-primary/10">
              <h3 className="font-serif font-bold text-brand-primary text-lg">Order Feedback</h3>
              <button onClick={onClose} className="p-1 hover:bg-brand-primary/10 rounded-full transition-colors">
                <XMarkIcon className="w-6 h-6 text-brand-primary/50" />
              </button>
            </div>

            <div className="p-6">
              {step === 'ask' && (
                <div className="text-center space-y-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-brand-light w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                    <TruckIcon className="w-10 h-10 text-brand-accent" />
                  </motion.div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Did you receive your order?</h4>
                    <p className="text-gray-500 text-sm mt-2">Please verify if the order has arrived safely.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setStep('no')} className="flex flex-col items-center justify-center p-4 border-2 border-red-100 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all group">
                      <HandThumbDownIcon className="w-8 h-8 text-red-400 group-hover:text-red-600 mb-2 transition-colors" />
                      <span className="font-bold text-red-600">No, I didn't</span>
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setStep('yes')} className="flex flex-col items-center justify-center p-4 border-2 border-green-100 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all group">
                      <HandThumbUpIcon className="w-8 h-8 text-green-400 group-hover:text-green-600 mb-2 transition-colors" />
                      <span className="font-bold text-green-600">Yes, I did!</span>
                    </motion.button>
                  </div>
                </div>
              )}

              {step === 'yes' && (
                <div className="space-y-6 text-center">
                  <motion.h4 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-bold text-brand-primary">How was the delivery?</motion.h4>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button key={star} onClick={() => setRating(star)} whileHover={{ scale: 1.2, rotate: 10 }} whileTap={{ scale: 0.8, rotate: -10 }} className="focus:outline-none">
                        <StarIcon className={`w-10 h-10 transition-colors duration-300 ${rating >= star ? 'text-yellow-400 drop-shadow-md' : 'text-gray-200 hover:text-yellow-200'}`} />
                      </motion.button>
                    ))}
                  </div>
                  <motion.p key={rating} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-bold text-brand-accent">
                    {rating === 5 ? "Awesome!" : rating === 4 ? "Great!" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
                  </motion.p>
                  <textarea placeholder="Tell us what you loved (or what we can improve)..." value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent transition-shadow text-sm" rows={3} />
                  <motion.button onClick={handleSubmit} disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-brand-accent text-white font-bold py-3 rounded-xl shadow-md hover:bg-brand-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </motion.button>
                </div>
              )}

              {step === 'no' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-red-600">We're sorry to hear that.</h4>
                    <p className="text-sm text-gray-500">Let us know what happened so we can fix it.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">What went wrong?</label>
                    <select className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" value={issue} onChange={(e) => setIssue(e.target.value)}>
                      <option value="">Select an issue...</option>
                      <option value="Order not arrived">Order never arrived</option>
                      <option value="Wrong items">Received wrong items</option>
                      <option value="Damaged/Spilled">Food damaged/spilled</option>
                      <option value="Missing items">Missing items</option>
                    </select>
                  </div>
                  <textarea placeholder="Additional details..." value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow text-sm" rows={2} />
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={redeliver} onChange={(e) => setRedeliver(e.target.checked)} className="w-5 h-5 text-red-600 rounded focus:ring-red-500" />
                    <span className="text-sm font-medium text-gray-700">I would like to request a redelivery</span>
                  </label>
                  <motion.button onClick={handleSubmit} disabled={isSubmitting || !issue} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-red-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-red-700 transition-all disabled:opacity-50">
                    {isSubmitting ? 'Sending...' : 'Submit Report'}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};