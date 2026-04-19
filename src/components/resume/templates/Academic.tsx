'use client';
import React from 'react';
import { TemplateProps, vis, formatDates, getSkills, getTechSkills, paperStyle, sanitizeHtml } from './shared';

const Academic: React.FC<TemplateProps> = ({ data, theme, sectionOrder, sectionVisibility }) => {
  const skills = getSkills(data);
  const techSkills = getTechSkills(data);

  const sectionTitle: React.CSSProperties = {
    fontSize: `${theme.sectionTitleSize || 11}px`, fontWeight: 700, color: theme.primaryColor,
    textTransform: 'uppercase', letterSpacing: '1.5px',
    borderBottom: `1px solid ${theme.accentColor}`, paddingBottom: '2px', marginBottom: '6px',
  };

  const sections: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <section key="summary" style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: `${theme.baseFontSize || 11}px`, color: '#3a3a3a', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.summary) }} />
      </section>
    ) : null,

    experience: () => (data.experience || []).length > 0 ? (
      <section key="experience" style={{ marginBottom: '12px' }}>
        <div style={sectionTitle}>Professional Experience</div>
        {data.experience!.map((item, idx) => (
          <div key={idx} style={{ marginBottom: '7px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: `${theme.companyFontSize || 10.5}px`, fontWeight: 600, color: theme.primaryColor }}>
              <span>{item.title} — {item.company}{item.location ? `, ${item.location}` : ''}</span>
              <span style={{ color: theme.accentColor, fontWeight: 400, fontStyle: 'italic', fontSize: '0.95em' }}>{formatDates(item.start_date, item.end_date, item.current)}</span>
            </div>
            <ul style={{ paddingLeft: '16px', marginTop: '2px', margin: 0 }}>
              {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: '1px', lineHeight: theme.lineHeight || 1.4 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(b) }} />)}
            </ul>
          </div>
        ))}
      </section>
    ) : null,

    education: () => (data.education || []).length > 0 ? (
      <section key="education" style={{ marginBottom: '12px' }}>
        <div style={sectionTitle}>Education</div>
        {data.education!.map((item, idx) => (
          <div key={idx} style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700, color: theme.primaryColor, fontSize: `${theme.companyFontSize || 10.5}px` }}>
                {item.institution}{item.location ? `, ${item.location}` : ''}
              </span>
              <span style={{ color: theme.accentColor, fontStyle: 'italic', fontSize: '0.95em' }}>{formatDates(item.start_date, item.end_date)}</span>
            </div>
            <div style={{ fontSize: '1em', marginTop: '1px' }}>
              {item.degree}{item.field ? `, ${item.field}` : ''}
              {item.gpa ? ` | GPA: ${item.gpa}` : ''}
            </div>
          </div>
        ))}
      </section>
    ) : null,

    skills: () => skills.length > 0 ? (
      <section key="skills" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        <div style={sectionTitle}>Key Skills</div>
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
      <section key="technicalSkills" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        <div style={sectionTitle}>Technical Skills</div>
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
      <div key="lang-cert" style={{ display: 'grid', gridTemplateColumns: showLang && showCert ? '1fr 1fr' : '1fr', gap: '20px', marginBottom: `${theme.sectionSpacing || 12}px` }}>
        {showLang && <section><div style={sectionTitle}>Languages</div><div style={{ fontSize: '11px' }}>{data.languages!.join(' · ')}</div></section>}
        {showCert && <section><div style={sectionTitle}>Certifications</div>{data.certifications!.map((c, i) => <div key={i} style={{ marginBottom: '3px', fontSize: '11px' }}>{c}</div>)}</section>}
      </div>
    );
  };

  let langCertRendered = false;

  return (
    <div style={{ ...paperStyle(theme), fontFamily: theme.fontFamily || "'EB Garamond', serif", position: 'relative' }} className="resume-paper">
      <header style={{ textAlign: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: `2px solid ${theme.primaryColor}` }}>
        <h1 style={{ fontSize: `${theme.headerFontSize || 24}px`, fontWeight: 700, color: theme.primaryColor, letterSpacing: '1.5px', marginBottom: '2px', lineHeight: 1.2 }}>{data.personal?.name}</h1>
        <div style={{ fontSize: '0.95em', color: '#555', marginTop: '4px' }}>
          {[
            data.personal?.phone,
            data.personal?.email,
            data.personal?.linkedin,
            data.personal?.location,
            ...(vis(sectionVisibility, 'portfolio') && data.personal?.portfolio_url ? [data.personal.portfolio_url] : []),
            ...(vis(sectionVisibility, 'visaStatus') && data.personal?.visa_status ? [data.personal.visa_status] : []),
          ].filter(Boolean).join(' · ')}
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

export default Academic;
