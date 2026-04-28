import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from '../components/Icons';
import Helpr from '../components/Helpr';
import './Learning.css';

const SUBJECT_CHAPTERS: Record<string, string[]> = {
  Mathematics:        ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Probability'],
  Science:            ['Physics', 'Chemistry', 'Biology', 'Earth Science', 'Astronomy'],
  English:            ['Grammar', 'Literature', 'Writing', 'Comprehension', 'Vocabulary'],
  'Computer Science': ['Data Structures', 'Algorithms', 'Operating Systems', 'Networks', 'Databases'],
  History:            ['Ancient History', 'Medieval History', 'Modern History', 'World Wars', 'Cold War'],
  Geography:          ['Physical Geography', 'Human Geography', 'Cartography', 'Climate', 'Ecosystems'],
};

const PLACEHOLDER_SUBMODULES = ['Introduction', 'Core Concepts', 'Examples', 'Practice Problems'];

function getChapters(subject: string): string[] {
  if (SUBJECT_CHAPTERS[subject]) return SUBJECT_CHAPTERS[subject];
  const key = Object.keys(SUBJECT_CHAPTERS).find(
    (k) => k.toLowerCase() === subject.toLowerCase()
  );
  return key ? SUBJECT_CHAPTERS[key] : [];
}

const Learning: React.FC = () => {
  const { subjectName } = useParams<{ subjectName: string }>();
  const subject = subjectName ? decodeURIComponent(subjectName) : 'Subject';
  const chapters = getChapters(subject);

  const [chapterProgress] = useState<Record<string, number>>(
    () => Object.fromEntries(chapters.map((ch) => [ch, 0]))
  );

  const overallProgress =
    chapters.length === 0
      ? 0
      : Math.round(
          chapters.reduce((sum, ch) => sum + (chapterProgress[ch] ?? 0), 0) / chapters.length
        );

  const [activeChapter, setActiveChapter] = useState<string | null>(
    chapters.length > 0 ? chapters[0] : null
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="learning-page">
      <div
        className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`learning-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      >
        <div className="lsb-header">
          <div className="lsb-top-row">
            <h2 className="lsb-subject">{subject}</h2>
            <button
              className="collapse-btn"
              onClick={() => { setSidebarCollapsed(true); setMobileOpen(false); }}
              title="Collapse sidebar"
            >
              {PanelLeftCloseIcon({ size: 16 })}
            </button>
          </div>

          <div className="lsb-overall">
            <div className="lsb-progress-meta">
              <span className="lsb-progress-label">Overall Progress</span>
              <span className="lsb-progress-pct">{overallProgress}%</span>
            </div>
            <div className="lsb-track">
              <div className="lsb-fill" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="lsb-chapters">
          {chapters.length === 0 ? (
            <div className="lsb-empty">No chapters defined for this subject.</div>
          ) : (
            chapters.map((ch) => {
              const prog = chapterProgress[ch] ?? 0;
              const isActive = activeChapter === ch;
              return (
                <div
                  key={ch}
                  className={`lsb-chapter ${isActive ? 'active' : ''}`}
                  onClick={() => { setActiveChapter(ch); setMobileOpen(false); }}
                >
                  <div className="lsb-chapter-meta">
                    <span className="lsb-chapter-name">{ch}</span>
                    <span className="lsb-chapter-pct">{prog}%</span>
                  </div>
                  <div className="lsb-chapter-track">
                    <div className="lsb-chapter-fill" style={{ width: `${prog}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      <button
        className={`sidebar-toggle-btn ${sidebarCollapsed ? 'visible' : ''}`}
        onClick={() => { setSidebarCollapsed(false); setMobileOpen(true); }}
        title="Open sidebar"
      >
        {PanelLeftOpenIcon({ size: 16 })}
      </button>

      <Helpr />
      <main className="lc-main">
        {activeChapter ? (
          <div className="lc-chapter-content">
            <div className="lc-chapter-header">
              <h1 className="lc-chapter-title">{activeChapter}</h1>
              <p className="lc-chapter-meta-text">{subject} · {chapters.indexOf(activeChapter) + 1} of {chapters.length}</p>
            </div>

            <div className="lc-submodules">
              {PLACEHOLDER_SUBMODULES.map((sm) => (
                <div key={sm} className="lc-submodule-card">
                  <div className="lc-sm-title">{sm}</div>
                  <div className="lc-sm-body">
                    <div className="lc-placeholder-line" />
                    <div className="lc-placeholder-line short" />
                    <div className="lc-placeholder-line" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="lc-empty">
            <div className="lc-empty-icon">✎</div>
            <h3>Select a chapter</h3>
            <p>Choose a chapter from the sidebar to view its content.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Learning;
