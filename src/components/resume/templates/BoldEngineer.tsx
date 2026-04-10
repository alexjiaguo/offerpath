'use client';
import React from 'react';
import { TemplateProps, vis, formatDates, getSkills, getTechSkills, paperStyle } from './shared';

const BoldEngineer: React.FC<TemplateProps> = ({ data, theme, sectionOrder, sectionVisibility }) => {
  const skills = getSkills(data);
  const techSkills = getTechSkills(data);

  const secHeader = (title: string): React.ReactNode => (
    <div style={{
      background: theme.primaryColor, color: '#fff',
      fontSize: `${theme.sectionTitleSize || 11}px`, fontWeight: 800,
      padding: '6px 15px', borderRadius: '4px', marginBottom: '15px',
      textTransform: 'uppercase', letterSpacing: '1px',
    }}>{title}</div>
  );

  const contactLabel: React.CSSProperties = {
    background: '#000', color: '#fff', padding: '2px 8px', borderRadius: '4px',
    fontWeight: 700, textTransform: 'uppercase', fontSize: '9px',
  };

  const sections: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <section key="summary" style={{ marginBottom: `${theme.sectionSpacing || 25}px` }}>
        <div style={{ fontSize: `${theme.baseFontSize || 11}px`, lineHeight: theme.lineHeight || 1.4, marginBottom: '5px' }} dangerouslySetInnerHTML={{ __html: data.summary }} />
      </section>
    ) : null,

    experience: () => (data.experience || []).length > 0 ? (
      <section key="experience" style={{ marginBottom: `${theme.sectionSpacing || 25}px` }}>
        {secHeader('Professional Experience')}
        {data.experience!.map((item, idx) => (
          <div key={idx} style={{ marginBottom: `${theme.itemSpacing || 7}px`, fontSize: `${theme.baseFontSize || 11}px`, lineHeight: theme.lineHeight || 1.4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: `${theme.companyFontSize || 11}px`, fontWeight: 600, color: theme.primaryColor }}>
              <span>{item.title} — {item.company}{item.location ? `, ${item.location}` : ''}</span>
              <span style={{ color: theme.accentColor, fontWeight: 400, fontStyle: 'italic', fontSize: '0.95em' }}>{formatDates(item.start_date, item.end_date, item.current)}</span>
            </div>
            <ul style={{ paddingLeft: '16px', marginTop: '2px', margin: 0 }}>
              {item.bullets.map((b, i) => (
                <li key={i} style={{ marginBottom: '1px', lineHeight: theme.lineHeight || 1.4 }} dangerouslySetInnerHTML={{ __html: b }} />
              ))}
            </ul>
          </div>
        ))}
      </section>
    ) : null,

    education: () => (data.education || []).length > 0 ? (
      <section key="education" style={{ marginBottom: `${theme.sectionSpacing || 25}px` }}>
        {secHeader('Education')}
        {data.education!.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: `${theme.itemSpacing || 6}px` }}>
            <span><strong style={{ fontWeight: 700, color: theme.primaryColor, fontSize: `${theme.companyFontSize || 11}px` }}>{item.institution}{item.location ? `, ${item.location}` : ''}</strong> — <span>{item.degree}{item.field ? `, ${item.field}` : ''}</span></span>
            <span style={{ color: theme.accentColor, fontStyle: 'italic', fontSize: '0.95em', whiteSpace: 'nowrap', marginLeft: '10px' }}>{formatDates(item.start_date, item.end_date)}</span>
          </div>
        ))}
      </section>
    ) : null,

    skills: () => skills.length > 0 ? (
      <section key="skills" style={{ marginBottom: `${theme.sectionSpacing || 25}px` }}>
        {secHeader('Key Skills')}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {skills.map((s) => (
            <span key={s.id} style={{
              padding: '2px 8px', borderRadius: '3px', fontSize: `${theme.baseFontSize || 11}px`,
              backgroundColor: s.isHighlighted ? theme.primaryColor : '#f0f3f6',
              color: s.isHighlighted ? '#fff' : '#2c3e50', fontWeight: s.isHighlighted ? 600 : 400,
            }}>{s.name}</span>
          ))}
        </div>
      </section>
    ) : null,

    technicalSkills: () => techSkills.length > 0 ? (
      <section key="technicalSkills" style={{ marginBottom: `${theme.sectionSpacing || 25}px` }}>
        {secHeader('Technical Skills')}
        {techSkills.map((cat) => (
          <div key={cat.id} style={{ marginBottom: '3px', fontSize: `${theme.baseFontSize || 11}px` }}>
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
      <div key="lang-cert" style={{ display: 'grid', gridTemplateColumns: showLang && showCert ? '1fr 1fr' : '1fr', gap: '30px', marginBottom: `${theme.sectionSpacing || 25}px` }}>
        {showLang && <section>{secHeader('Languages')}<div style={{ fontSize: `${theme.baseFontSize || 11}px` }}>{data.languages!.join(' · ')}</div></section>}
        {showCert && <section>{secHeader('Certifications')}{data.certifications!.map((c, i) => <div key={i} style={{ marginBottom: '3px', fontSize: `${theme.baseFontSize || 11}px` }}>{c}</div>)}</section>}
      </div>
    );
  };

  let langCertRendered = false;

  return (
    <div style={{ ...paperStyle(theme), fontFamily: theme.fontFamily || "'Roboto', sans-serif", display: 'flex', flexDirection: 'column' }} className="resume-paper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: `${theme.sectionSpacing || 25}px` }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: `${theme.headerFontSize || 36}px`, color: theme.primaryColor, fontWeight: 900, lineHeight: 1, marginBottom: '2px' }}>{data.personal?.name}</h1>
          <div style={{ fontSize: '18px', color: '#555', fontWeight: 500, marginBottom: '5px' }}>{data.personal?.title}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto 1fr', gap: '4px 8px', alignItems: 'center' }}>
            <span style={contactLabel}>Phone</span><span style={{ fontSize: '10px' }}>{data.personal?.phone}</span>
            <span style={contactLabel}>Email</span><span style={{ fontSize: '10px' }}>{data.personal?.email}</span>
            <span style={contactLabel}>LinkedIn</span><span style={{ fontSize: '10px' }}>{data.personal?.linkedin}</span>
            <span style={contactLabel}>Location</span><span style={{ fontSize: '10px' }}>{data.personal?.location}</span>
            {vis(sectionVisibility, 'portfolio') && data.personal?.portfolio_url && <><span style={contactLabel}>{data.personal.portfolio_label || 'Portfolio'}</span><span style={{ fontSize: '10px' }}>{data.personal.portfolio_url}</span></>}
            {vis(sectionVisibility, 'visaStatus') && data.personal?.visa_status && <><span style={contactLabel}>{data.personal.visa_label || 'Visa'}</span><span style={{ fontSize: '10px' }}>{data.personal.visa_status}</span></>}
          </div>
        </div>
        {vis(sectionVisibility, 'photo') && (
          <div style={{ width: `${theme.headshotSize || 130}px`, height: `${theme.headshotSize || 130}px`, borderRadius: `${theme.headshotRadius || 4}px`, overflow: 'hidden', backgroundColor: '#eee', flexShrink: 0 }}>
            {data.personal?.photo_url ? <img src={data.personal.photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Photo</div>}
          </div>
        )}
      </div>

      {sectionOrder.map((key) => {
        if (!vis(sectionVisibility, key)) return null;
        if (key === 'languages' || key === 'certifications') { if (langCertRendered) return null; langCertRendered = true; return langCertBlock(); }
        if (key === 'photo') return null;
        return sections[key]?.() ?? null;
      })}
    </div>
  );
};

export default BoldEngineer;
