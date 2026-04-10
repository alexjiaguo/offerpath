'use client';
import React from 'react';
import { TemplateProps, vis, formatDates, getSkills, getTechSkills, paperStyle } from './shared';

const ClassicMinimal: React.FC<TemplateProps> = ({ data, theme, sectionOrder, sectionVisibility }) => {
  const skills = getSkills(data);
  const techSkills = getTechSkills(data);

  const sectionTitle: React.CSSProperties = {
    fontSize: `${theme.sectionTitleSize || 11}px`, fontWeight: 700, color: theme.primaryColor,
    textTransform: 'uppercase', letterSpacing: '1px',
    borderBottom: '1px solid #eee', paddingBottom: '3px', marginBottom: '6px',
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
          <div key={idx} style={{ marginBottom: `${theme.itemSpacing || 8}px`, fontSize: '11px', lineHeight: theme.lineHeight || 1.4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: `${theme.companyFontSize || 11}px`, fontWeight: 600, color: theme.primaryColor }}>
              <span>{item.company}</span>
              <span style={{ color: theme.accentColor, fontWeight: 400 }}>{formatDates(item.start_date, item.end_date, item.current)}</span>
            </div>
            <div style={{ fontStyle: 'italic', fontSize: '11px', marginBottom: '2px' }}>{item.title}</div>
            <ul style={{ paddingLeft: '18px', marginTop: '3px', margin: 0 }}>
              {item.bullets.map((b, i) => (
                <li key={i} style={{ marginBottom: '2px', fontSize: '11px', lineHeight: theme.lineHeight || 1.4 }} dangerouslySetInnerHTML={{ __html: b }} />
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
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px', fontSize: '11px' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 600, fontSize: '12px', color: theme.primaryColor }}>{item.institution}{item.location ? `, ${item.location}` : ''}</span>
              <span style={{ color: theme.textColor, fontStyle: 'italic' }}>— {item.degree}{item.field ? `, ${item.field}` : ''}</span>
            </div>
            <span style={{ color: theme.accentColor, fontWeight: 400, whiteSpace: 'nowrap' }}>{formatDates(item.start_date, item.end_date)}</span>
          </div>
        ))}
      </section>
    ) : null,

    skills: () => skills.length > 0 ? (
      <section key="skills" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        <h2 style={sectionTitle}>Key Skills</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {skills.map((skill) => (
            <span key={skill.id} style={{
              padding: '2px 8px', borderRadius: '3px', fontSize: '11px',
              backgroundColor: skill.isHighlighted ? theme.primaryColor : '#f0f3f6',
              color: skill.isHighlighted ? '#fff' : '#2c3e50',
              fontWeight: skill.isHighlighted ? 600 : 400,
            }}>{skill.name}</span>
          ))}
        </div>
      </section>
    ) : null,

    technicalSkills: () => techSkills.length > 0 ? (
      <section key="technicalSkills" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        <h2 style={sectionTitle}>Technical Skills</h2>
        {techSkills.map((cat) => (
          <div key={cat.id} style={{ marginBottom: '3px', fontSize: '11px' }}>
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
        {showLang && (
          <section>
            <h2 style={sectionTitle}>Languages</h2>
            <div style={{ fontSize: '11px' }}>{data.languages!.join(' · ')}</div>
          </section>
        )}
        {showCert && (
          <section>
            <h2 style={sectionTitle}>Certifications</h2>
            {data.certifications!.map((cert, idx) => (
              <div key={idx} style={{ marginBottom: '3px', fontSize: '11px' }}>{cert}</div>
            ))}
          </section>
        )}
      </div>
    );
  };

  let langCertRendered = false;

  return (
    <div style={{ ...paperStyle(theme) }} className="resume-paper">
      <header style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h1 style={{
          fontSize: `${theme.headerFontSize || 24}px`, fontWeight: 700, color: theme.primaryColor,
          textTransform: 'uppercase', letterSpacing: '2px', lineHeight: 1.2,
        }}>{data.personal?.name}</h1>
        <div style={{ fontSize: '10px', color: '#555', marginTop: '4px' }}>
          {[data.personal?.phone, data.personal?.email, data.personal?.linkedin,
            ...(vis(sectionVisibility, 'portfolio') && data.personal?.portfolio_url ? [data.personal.portfolio_url] : []),
            ...(vis(sectionVisibility, 'visaStatus') && data.personal?.visa_status ? [data.personal.visa_status] : []),
          ].filter(Boolean).join(' · ')}
        </div>
      </header>

      {sectionOrder.map((key) => {
        if (!vis(sectionVisibility, key)) return null;
        if (key === 'languages' || key === 'certifications') {
          if (langCertRendered) return null;
          langCertRendered = true;
          return langCertBlock();
        }
        if (key === 'photo') return null;
        return sections[key]?.() ?? null;
      })}
    </div>
  );
};

export default ClassicMinimal;
