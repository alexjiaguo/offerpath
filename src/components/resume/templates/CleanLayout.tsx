'use client';
import React from 'react';
import { TemplateProps, vis, formatDates, getSkills, getTechSkills, paperStyle } from './shared';

const CleanLayout: React.FC<TemplateProps> = ({ data, theme, sectionOrder, sectionVisibility }) => {
  const skills = getSkills(data);
  const techSkills = getTechSkills(data);

  const sectionTitle: React.CSSProperties = {
    fontSize: `${theme.sectionTitleSize || 11}px`, fontWeight: 700, color: theme.primaryColor,
    textTransform: 'uppercase', letterSpacing: '1.8px',
    borderBottom: `1.5px solid ${theme.primaryColor}`, paddingBottom: '2px', marginBottom: '7px',
  };

  const sections: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <section key="summary" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        <div style={{ fontSize: `${theme.baseFontSize || 11}px`, color: '#3a3a3a', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: data.summary }} />
      </section>
    ) : null,

    experience: () => (data.experience || []).length > 0 ? (
      <section key="experience" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        <h2 style={sectionTitle}>Professional Experience</h2>
        {data.experience!.map((item, idx) => (
          <div key={idx} style={{ marginBottom: `${theme.itemSpacing || 6}px`, fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: theme.primaryColor }}>{item.title}</span>
              <span style={{ fontSize: '11px', color: theme.accentColor, fontWeight: 600 }}>{formatDates(item.start_date, item.end_date, item.current)}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#555', fontStyle: 'italic', marginBottom: '3px' }}>{item.company}</div>
            <ul style={{ paddingLeft: '14px', margin: 0 }}>
              {item.bullets.map((b, i) => (
                <li key={i} style={{ fontSize: '11px', color: '#2e2e4a', marginBottom: '2.5px', lineHeight: theme.lineHeight || 1.4 }} dangerouslySetInnerHTML={{ __html: b }} />
              ))}
            </ul>
          </div>
        ))}
      </section>
    ) : null,

    education: () => (data.education || []).length > 0 ? (
      <section key="education" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        <h2 style={sectionTitle}>Education</h2>
        {data.education!.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
            <span><strong style={{ fontSize: '12px', fontWeight: 700, color: theme.primaryColor }}>{item.institution}{item.location ? `, ${item.location}` : ''}</strong> — <span style={{ fontSize: '11px', color: '#555', fontStyle: 'italic' }}>{item.degree}{item.field ? `, ${item.field}` : ''}</span></span>
            <span style={{ fontSize: '10px', color: theme.accentColor, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: '10px' }}>{formatDates(item.start_date, item.end_date)}</span>
          </div>
        ))}
      </section>
    ) : null,

    skills: () => skills.length > 0 ? (
      <section key="skills" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        <h2 style={sectionTitle}>Core Skills</h2>
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
        <h2 style={sectionTitle}>Technical</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {techSkills.map((cat) => (
            <div key={cat.id} style={{ fontSize: '11px' }}>
              <strong style={{ color: theme.primaryColor }}>{cat.category}:</strong> {cat.skills}
            </div>
          ))}
        </div>
      </section>
    ) : null,
  };

  const langCertBlock = () => {
    const showLang = vis(sectionVisibility, 'languages') && (data.languages || []).length > 0;
    const showCert = vis(sectionVisibility, 'certifications') && (data.certifications || []).length > 0;
    if (!showLang && !showCert) return null;
    return (
      <React.Fragment key="lang-cert">
        {showLang && <section><h3 style={{ ...sectionTitle, fontSize: '11px' }}>Languages</h3><div style={{ fontSize: '11px', color: '#3a3a5c' }}>{data.languages!.join(' · ')}</div></section>}
        {showCert && <section><h3 style={{ ...sectionTitle, fontSize: '11px' }}>Certifications</h3>{data.certifications!.map((c, i) => <div key={i} style={{ marginBottom: '3px', fontSize: '11px', color: '#3a3a5c' }}>{c}</div>)}</section>}
      </React.Fragment>
    );
  };

  let langCertRendered = false;

  return (
    <div style={{ ...paperStyle(theme), display: 'flex', flexDirection: 'column' }} className="resume-paper">
      <header style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        borderBottom: `2px solid ${theme.primaryColor}`, paddingBottom: '12px', marginBottom: `${theme.sectionSpacing || 12}px`,
      }}>
        <h1 style={{ fontSize: `${theme.headerFontSize || 24}px`, fontWeight: 700, color: theme.primaryColor, letterSpacing: '0.3px', marginBottom: '2px', lineHeight: 1.2 }}>{data.personal?.name}</h1>
        <div style={{ fontSize: '11px', color: '#5a5a7a', fontWeight: 500, marginBottom: '6px' }}>{data.personal?.title}</div>
        <div style={{ fontSize: '11px', color: '#555' }}>
          {[data.personal?.location, data.personal?.phone, data.personal?.email, data.personal?.linkedin,
            ...(vis(sectionVisibility, 'portfolio') && data.personal?.portfolio_url ? [data.personal.portfolio_url] : []),
            ...(vis(sectionVisibility, 'visaStatus') && data.personal?.visa_status ? [data.personal.visa_status] : []),
          ].filter(Boolean).join(' | ')}
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

export default CleanLayout;
