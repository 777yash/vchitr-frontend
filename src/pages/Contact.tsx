import React from 'react';
import RandomImageBackground from '../components/RandomImageBackground';
import './Contact.css';

const Contact: React.FC = () => {
  return (
    <RandomImageBackground
      containerClassName="contact-container"
      overlayClassName="contact-overlay"
    >
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
              Send
            </button>
          </form>
        </div>
      </div>
    </RandomImageBackground>
  );
};

export default Contact;
