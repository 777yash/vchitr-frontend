import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Faq.css';

const Faq: React.FC = () => {
  const navigate = useNavigate();
  const [bgImage, setBgImage] = useState('');

  useEffect(() => {
    const images = [
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1920&auto=format&fit=crop', // Math
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1920&auto=format&fit=crop', // Science
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1920&auto=format&fit=crop', // Comp sci
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop', // Space
      'https://images.unsplash.com/photo-1474511320723-9a56873864b5?q=80&w=1920&auto=format&fit=crop', // Animals (Fox)
      'https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1920&auto=format&fit=crop'  // Animals (Lion)
    ];
    setBgImage(images[Math.floor(Math.random() * images.length)]);
  }, []);

  const faqs = [
    {
      question: "How do I create notes?",
      answer: "Click the open notes button and start typing. vCHITR saves your work automatically as you write. Organize by subject for easy retrieval later."
    },
    {
      question: "Can I access notes offline?",
      answer: "Your notes sync across devices when connected. Check your settings for offline access options. vCHITR keeps your data secure and available."
    },
    {
      question: "How do I organize subjects?",
      answer: "Create folders for each subject you study. Tag notes with relevant keywords for quick searching. The system learns your preferences over time."
    },
    {
      question: "Is my data private?",
      answer: "Your notes are encrypted and stored securely. Only you can access your personal information. vCHITR never shares data with third parties."
    },
    {
      question: "What devices are supported?",
      answer: "vCHITR works on desktop, tablet, and mobile devices. Your notes sync instantly across all platforms. Start on one device and continue on another."
    }
  ];

  return (
    <div 
      className="faq-container"
      style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'none' }}
    >
      <div className="faq-overlay"></div>
      <div className="faq-card">
        <div className="faq-header">
          <h1 className="faq-title">FAQ</h1>
          <p className="faq-subtitle">Find answers to common questions about using vCHITR and managing your notes.</p>
        </div>

        <div className="faq-content">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <h3 className="faq-question">{faq.question}</h3>
              <p className="faq-answer">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="faq-footer">
          <h2>Need more help?</h2>
          <p>Reach out to our support team anytime</p>
          <button className="btn btn-outline-dark" onClick={() => navigate('/contact')}>
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default Faq;
