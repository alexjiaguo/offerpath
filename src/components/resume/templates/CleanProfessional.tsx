'use client';
import React from 'react';
import { TemplateProps, vis, formatDates, getSkills, getTechSkills, paperStyle, sanitizeHtml } from './shared';

const CleanProfessional: React.FC<TemplateProps> = ({ data, theme, sectionOrder, sectionVisibility }) => {
  const skills = getSkills(data);
  const techSkills = getTechSkills(data);

  const sectionTitle: React.CSSProperties = {
    fontSize: `${theme.sectionTitleSize || 11}px`, fontWeight: 700, color: theme.primaryColor,
    textTransform: 'uppercase', letterSpacing: '1.5px',
    borderBottom: '1px solid #e5e7eb', paddingBottom: '5px', marginBottom: '15px',
  };

  const sections: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <section key="summary" style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: `${theme.baseFontSize || 11}px`, color: '#3a3a3a', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.summary) }} />
      </section>
    ) : null,

    experience: () => (data.experience || []).length > 0 ? (
      <section key="experience" style={{ marginBottom: '25px' }}>
        <h2 style={sectionTitle}>Professional Experience</h2>
        {data.experience!.map((item, idx) => (
          <div key={idx} style={{ marginBottom: '7px', fontSize: `${theme.baseFontSize || 11}px`, lineHeight: theme.lineHeight || 1.4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: theme.primaryColor }}>
              <span>{item.title} — {item.company}</span>
              <span style={{ color: theme.accentColor, fontWeight: 400, fontStyle: 'italic', fontSize: '0.95em' }}>{formatDates(item.start_date, item.end_date, item.current)}</span>
            </div>
            <ul style={{ margin: 0, marginTop: '2px', paddingLeft: '16px' }}>
              {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: '1px', lineHeight: theme.lineHeight || 1.4 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(b) }} />)}
            </ul>
          </div>
        ))}
      </section>
    ) : null,

    education: () => (data.education || []).length > 0 ? (
      <section key="education" style={{ marginBottom: '25px' }}>
        <h2 style={sectionTitle}>Education</h2>
        {data.education!.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
            <span><strong style={{ color: theme.primaryColor, fontSize: '11px', fontWeight: 700 }}>{item.institution}{item.location ? `, ${item.location}` : ''}</strong> — {item.degree}{item.field ? `, ${item.field}` : ''}</span>
            <span style={{ color: theme.accentColor, fontStyle: 'italic', fontSize: '0.95em', whiteSpace: 'nowrap', marginLeft: '10px' }}>{formatDates(item.start_date, item.end_date)}</span>
          </div>
        ))}
      </section>
    ) : null,

    skills: () => skills.length > 0 ? (
      <section key="skills" style={{ marginBottom: '25px' }}>
        <h2 style={sectionTitle}>Key Skills</h2>
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
      <section key="technicalSkills" style={{ marginBottom: '25px' }}>
        <h2 style={sectionTitle}>Technical Skills</h2>
        {techSkills.map((cat) => (
          <div key={cat.id} style={{ marginBottom: '3px' }}>
            <strong style={{ color: theme.primaryColor }}>{cat.category}:</strong> {cat.skills}
          </div>
        ))}
      </section>
    ) : null,
  };

  const langCertBlock = () => {
    const showLang = vis(sectionVisibility, 'languages') && (data.languages || []).length > 0;
    const showCert = vis(sectionVisibility, 'certifications') && (data.certifications || []).length > 0;
    if (!showLang && !showCert) return null;
    return (
      <div key="lang-cert" style={{ display: 'grid', gridTemplateColumns: showLang && showCert ? '1fr 1fr' : '1fr', gap: '20px', marginBottom: '25px' }}>
        {showLang && <section><h2 style={sectionTitle}>Languages</h2><div style={{ fontSize: '11px' }}>{data.languages!.join(' · ')}</div></section>}
        {showCert && <section><h2 style={sectionTitle}>Certifications</h2>{data.certifications!.map((c, i) => <div key={i} style={{ marginBottom: '3px', fontSize: '11px' }}>{c}</div>)}</section>}
      </div>
    );
  };

  let langCertRendered = false;

  return (
    <div style={{ ...paperStyle(theme), display: 'flex', flexDirection: 'column' }} className="resume-paper">
      <header style={{ textAlign: 'center', marginBottom: '35px' }}>
        <h1 style={{ fontSize: `${theme.headerFontSize || 32}px`, fontWeight: 700, color: theme.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px', lineHeight: 1.2 }}>{data.personal?.name}</h1>
        <div style={{ fontSize: '16px', color: '#6b7280', fontWeight: 500, marginBottom: '15px' }}>{data.personal?.title}</div>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', fontSize: '10px', color: '#4b5563' }}>
          {data.personal?.phone && <span>{data.personal.phone}</span>}
          {data.personal?.email && <span>{data.personal.email}</span>}
          {data.personal?.location && <span>{data.personal.location}</span>}
          {data.personal?.linkedin && <span>{data.personal.linkedin}</span>}
          {vis(sectionVisibility, 'portfolio') && data.personal?.portfolio_url && <span>{data.personal.portfolio_url}</span>}
          {vis(sectionVisibility, 'visaStatus') && data.personal?.visa_status && <span>{data.personal.visa_status}</span>}
        </div>
      </header>

      {sectionOrder.map((key) => {
        if (!vis(sectionVisibility, key)) return null;
        if (key === 'languages' || key === 'certifications') { if (langCertRendered) return null; langCertRendered = true; return langCertBlock(); }
        if (key === 'photo') return null;
        return sections[key]?.() ?? null;
      })}
    </div>
  );
};

export default CleanProfessional;
