import { Link } from 'react-router-dom';
import LearningReveal from '../components/LearningReveal';

const questions = [
  ['What can I study?', 'Start with the complete NCERT Class 10 maths course: 14 chapters, worked examples, chapter tests and focused practice. Other education levels are coming soon.'],
  ['How is my learning level chosen?', 'Your education level is saved per subject. Explanation depth and practice difficulty adjust using recent chapter answers and your learning profile when enough evidence is available. Change your education level in Profile.'],
  ['When does the final test unlock?', 'Submit a test for every chapter. No minimum score is required. Focused practice does not count toward this requirement.'],
  ['Can I retake a test?', 'Yes. Your last score, best score and attempt history stay in your account. New chapter sets can adjust to your learning tier. Reset test results from the course overview.'],
  ['Where do my notes go?', 'Save a completed tutor answer to Notes. Your saved explanations are available when signed in, with course and chapter filters. An internet connection is required.'],
  ['What if the AI tutor is unavailable?', 'Study material and tests remain available. AI answers can contain mistakes: compare worked solutions with the NCERT textbook and flag an answer when it needs review.'],
];
export default function Faq() {
  return <main className="info-page"><LearningReveal><p className="course-eyebrow">About your study space</p><h1>A few useful answers.</h1><div className="info-columns"><aside><p>Learn at your pace. Keep your progress. Come back to what matters.</p><Link className="course-button" to="/subjects/learning">Open learning ↗</Link></aside><section className="faq-list" aria-label="Frequently asked questions">{questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section></div></LearningReveal></main>;
}
