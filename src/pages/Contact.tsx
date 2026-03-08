import React, { useState, useEffect } from 'react';
import './Contact.css';

const Contact: React.FC = () => {
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

  return (
    <div 
      className="contact-container"
      style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'none' }}
    >
      <div className="contact-overlay"></div>
      <div className="contact-card">
        <div className="contact-content">
          <p className="contact-preheading">Connect</p>
          <h1 className="contact-title">Get in touch</h1>
          <p className="contact-email">Help@vCHITR.com</p>

          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" placeholder="Your name" />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="Your email address" />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={6} placeholder="Your message"></textarea>
            </div>

            <div className="form-checkbox">
              <input type="checkbox" id="privacy" name="privacy" />
              <label htmlFor="privacy">I agree to the privacy policy</label>
            </div>

            <button type="submit" className="btn btn-dark">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
