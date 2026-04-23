import React from 'react';
import { useNavigate } from 'react-router-dom';
import RandomImageBackground from '../components/RandomImageBackground';
import './Faq.css';

const FAQS = [
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

const Faq: React.FC = () => {
  const navigate = useNavigate();

  return (
    <RandomImageBackground
      containerClassName="faq-container"
      overlayClassName="faq-overlay"
    >
      <div className="faq-card">
        <div className="faq-header">
          <h1 className="faq-title">FAQ</h1>
          <p className="faq-subtitle">Find answers to common questions about using vCHITR and managing your notes.</p>
        </div>

        <div className="faq-content">
          {FAQS.map((faq, index) => (
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
    </RandomImageBackground>
  );
};

export default Faq;
