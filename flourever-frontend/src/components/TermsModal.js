import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, ShieldCheckIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

export default function TermsModal({ onClose }) {
  return (
    <motion.div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="bg-brand-light w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative border-4 border-brand-primary/10"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-brand-secondary p-6 flex items-center justify-between border-b border-brand-primary/10">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <ShieldCheckIcon className="w-6 h-6 text-brand-accent" />
            </div>
            <h2 className="text-xl font-bold font-serif text-brand-primary">Terms & Privacy</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-brand-primary/10 rounded-full transition-colors">
            <XMarkIcon className="w-6 h-6 text-brand-primary/60" />
          </button>
        </div>

        {/* Scrollable Content (Parchment Style) */}
        <div className="p-6 h-[60vh] overflow-y-auto custom-scrollbar bg-white/50">
          <div className="prose prose-sm text-brand-primary/80">
            
            <h3 className="font-bold text-lg text-brand-primary mb-2 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5" /> 1. Introduction
            </h3>
            <p className="mb-4">
              Welcome to <strong>FlourEver Bakery</strong>! By creating an account, you agree to become part of our sweet community. We promise to treat your data with the same care we put into our pastries.
            </p>

            <h3 className="font-bold text-lg text-brand-primary mb-2">2. Data Privacy Act of 2012 (RA 10173)</h3>
            <p className="mb-4">
              We value your privacy and are committed to protecting your personal data in compliance with the <strong>Data Privacy Act of 2012</strong> of the Philippines.
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li><strong>Collection:</strong> We collect your name, email, contact number, and address solely for delivering your orders.</li>
              <li><strong>Usage:</strong> Your data is used to process orders, improve our services, and contact you regarding your delivery.</li>
              <li><strong>Protection:</strong> We implement security measures to ensure your data is safe from unauthorized access.</li>
              <li><strong>Rights:</strong> You have the right to access, correct, or request the deletion of your data at any time.</li>
            </ul>

            <h3 className="font-bold text-lg text-brand-primary mb-2">3. User Responsibilities</h3>
            <p className="mb-4">
              You agree to provide accurate information (so our riders don't get lost!) and to keep your password secure. You are responsible for all activities under your account.
            </p>

            <h3 className="font-bold text-lg text-brand-primary mb-2">4. Ordering & Cancellations</h3>
            <p className="mb-4">
              Orders can be cancelled while in "Pending" status. Once baking begins, cancellations are no longer allowed to prevent food waste.
            </p>

            <div className="mt-8 p-4 bg-brand-secondary/30 rounded-xl border border-brand-accent/20 text-center">
              <p className="font-serif italic text-brand-accent">
                "Sweet treats, safe data."
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brand-primary/10 bg-brand-light flex justify-end">
          <button 
            onClick={onClose}
            className="bg-brand-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-accent transition-all shadow-md active:scale-95"
          >
            I Understand
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}