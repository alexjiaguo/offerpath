'use client';
import React from 'react';
import { TemplateProps, vis, formatDates, getSkills, getTechSkills, paperStyle } from './shared';

const ElegantTwoColumn: React.FC<TemplateProps> = ({ data, theme, sectionOrder, sectionVisibility }) => {
  const skills = getSkills(data);
  const techSkills = getTechSkills(data);

  const sectionTitle = (title: string): React.ReactNode => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      fontFamily: "'Montserrat', sans-serif",
      fontSize: `${theme.sectionTitleSize || 11}px`, fontWeight: 700, color: theme.primaryColor,
      textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px',
    }}>
      <span>{title}</span>
      <span style={{ height: '1px', background: '#ecf0f1', flex: 1 }} />
    </div>
  );

  const leftKeys = new Set(['experience']);
  const rightKeys = new Set(['summary', 'education', 'skills', 'technicalSkills', 'languages', 'certifications']);

  const rightSections: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <section key="summary-r" style={{ marginBottom: '25px' }}>
        {sectionTitle('Profile')}
        <div style={{ fontSize: '11px', lineHeight: 1.5, color: '#555' }} dangerouslySetInnerHTML={{ __html: data.summary }} />
      </section>
    ) : null,

    education: () => (data.education || []).length > 0 ? (
      <section key="edu-r" style={{ marginBottom: '25px' }}>
        {sectionTitle('Education')}
        {data.education!.map((item, idx) => (
          <div key={idx} style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700, color: theme.primaryColor, fontSize: `${theme.companyFontSize || 11}px` }}>{item.institution}</span>
              <span style={{ color: theme.accentColor, fontStyle: 'italic', fontSize: '0.95em' }}>{formatDates(item.start_date, item.end_date)}</span>
            </div>
            <div style={{ fontSize: '1em', marginTop: '1px' }}>{item.degree}{item.field ? `, ${item.field}` : ''}{item.location ? `, ${item.location}` : ''}</div>
          </div>
        ))}
      </section>
    ) : null,

    skills: () => skills.length > 0 ? (
      <section key="skills-r" style={{ marginBottom: '25px' }}>
        {sectionTitle('Skills')}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {skills.map((s) => (
            <span key={s.id} style={{
              padding: '2px 8px', borderRadius: '3px', fontSize: '11px',
              backgroundColor: s.isHighlighted ? theme.primaryColor : '#f0f3f6',
              color: s.isHighlighted ? '#fff' : '#2c3e50', fontWeight: s.isHighlighted ? 600 : 400,
            }}>{s.name}</span>
          ))}
        </div>
      </section>
    ) : null,

    technicalSkills: () => techSkills.length > 0 ? (
      <section key="tech-r" style={{ marginBottom: '25px' }}>
        {sectionTitle('Technical Skills')}
        {techSkills.map((cat) => (
          <div key={cat.id} style={{ marginBottom: '3px', fontSize: '11px' }}>
            <strong style={{ color: theme.primaryColor }}>{cat.category}:</strong> {cat.skills}
          </div>
        ))}
      </section>
    ) : null,

    languages: () => (data.languages || []).length > 0 ? (
      <section key="lang-r" style={{ marginBottom: '25px' }}>
        {sectionTitle('Languages')}
        {data.languages!.map((l, i) => <div key={i} style={{ fontSize: '11px', marginBottom: '3px' }}>{l}</div>)}
      </section>
    ) : null,

    certifications: () => (data.certifications || []).length > 0 ? (
      <section key="certs-r" style={{ marginBottom: '25px' }}>
        {sectionTitle('Certifications')}
        {data.certifications!.map((c, i) => <div key={i} style={{ marginBottom: '3px', fontSize: '11px' }}>{c}</div>)}
      </section>
    ) : null,
  };

  const leftSections: Record<string, () => React.ReactNode> = {
    experience: () => (data.experience || []).length > 0 ? (
      <section key="experience" style={{ marginBottom: '25px' }}>
        {sectionTitle('Professional Experience')}
        {data.experience!.map((item, idx) => (
          <div key={idx} style={{ position: 'relative', paddingLeft: '20px', borderLeft: '1px solid #ecf0f1', marginBottom: '18px' }}>
            <div style={{ position: 'absolute', left: '-3.5px', top: '0', width: '6px', height: '6px', background: theme.accentColor, borderRadius: '50%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontWeight: 700, color: theme.primaryColor, fontSize: '1em' }}>{item.title}</span>
              <span style={{ color: theme.accentColor, fontWeight: 600, fontSize: '9px' }}>{formatDates(item.start_date, item.end_date, item.current)}</span>
            </div>
            <span style={{ fontStyle: 'italic', color: '#7f8c8d', fontSize: `${theme.companyFontSize || 11}px`, display: 'block', marginBottom: '6px' }}>{item.company}{item.location ? `, ${item.location}` : ''}</span>
            <ul style={{ paddingLeft: '15px', listStyleType: 'circle', margin: 0 }}>
              {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: '5px', fontSize: '11px', lineHeight: theme.lineHeight || 1.4 }} dangerouslySetInnerHTML={{ __html: b }} />)}
            </ul>
          </div>
        ))}
      </section>
    ) : null,
  };

  return (
    <div style={{ ...paperStyle(theme), display: 'flex', flexDirection: 'column' }} className="resume-paper">
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `2.5px solid ${theme.accentColor}`, paddingBottom: '25px', marginBottom: '35px' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: `${theme.headerFontSize || 28}px`, color: theme.primaryColor, letterSpacing: '1px', marginBottom: '5px', lineHeight: 1.1 }}>{data.personal?.name}</h1>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '16px', color: theme.accentColor, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '3px' }}>{data.personal?.title}</div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '4px', fontSize: '10px', color: '#7f8c8d' }}>
          {data.personal?.phone && <div>📞 {data.personal.phone}</div>}
          {data.personal?.email && <div>✉ {data.personal.email}</div>}
          {data.personal?.location && <div>📍 {data.personal.location}</div>}
          {data.personal?.linkedin && <div>🔗 {data.personal.linkedin}</div>}
          {vis(sectionVisibility, 'portfolio') && data.personal?.portfolio_url && <div>💻 {data.personal.portfolio_url}</div>}
          {vis(sectionVisibility, 'visaStatus') && data.personal?.visa_status && <div>🛂 {data.personal.visa_status}</div>}
        </div>
      </header>

      <div style={{ display: 'flex', gap: '40px', flex: 1 }}>
        <div style={{ flex: 1.3, display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {sectionOrder.map((key) => { if (!vis(sectionVisibility, key) || !leftKeys.has(key)) return null; return leftSections[key]?.() ?? null; })}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {sectionOrder.map((key) => { if (!vis(sectionVisibility, key) || !rightKeys.has(key) || key === 'photo') return null; return rightSections[key]?.() ?? null; })}
        </div>
      </div>
    </div>
  );
};

export default ElegantTwoColumn;
