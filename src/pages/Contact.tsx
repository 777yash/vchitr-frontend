import type { FormEvent } from 'react';
import LearningReveal from '../components/LearningReveal';

export default function Contact() {
  function compose(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = `${data.get('message')}\n\nFrom: ${data.get('name')}\nReply to: ${data.get('email')}`;
    window.location.href = 'mailto:Help@vCHITR.com?subject=' + encodeURIComponent('vCHITR enquiry') + '&body=' + encodeURIComponent(body);
  }
  return <main className="info-page"><LearningReveal><p className="course-eyebrow">Contact</p><h1>Let’s make learning better.</h1><div className="info-columns"><aside><p>Questions, feedback or a concept that needs a clearer explanation.</p><a href="mailto:Help@vCHITR.com">Help@vCHITR.com ↗</a></aside><form className="contact-message" onSubmit={compose}><label htmlFor="contact-name">Name</label><input id="contact-name" name="name" autoComplete="name" required maxLength={100} /><label htmlFor="contact-email">Email</label><input id="contact-email" name="email" type="email" autoComplete="email" required /><label htmlFor="contact-message">Message</label><textarea id="contact-message" name="message" rows={5} required maxLength={3000} /><button className="course-button primary">Compose email ↗</button><p className="course-muted">Opens your email app.</p></form></div></LearningReveal></main>;
}
