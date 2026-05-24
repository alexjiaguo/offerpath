'use client';
import React from 'react';
import Image from 'next/image';
import { TemplateProps, vis, formatDates, getSkills, getTechSkills, sanitizeHtml } from './shared';

const PremiumHeadshot: React.FC<TemplateProps> = ({ data, theme, sectionOrder, sectionVisibility }) => {
  const skills = getSkills(data);
  const techSkills = getTechSkills(data);
  const sbAccent = theme.sidebarAccent || '#7ec8e3';

  const sbTitle: React.CSSProperties = {
    fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.8px',
    color: sbAccent, borderBottom: '1px solid rgba(126, 200, 227, 0.2)',
    paddingBottom: '3px', marginBottom: '7px', fontWeight: 700,
  };

  const mainTitle: React.CSSProperties = {
    fontSize: `${theme.sectionTitleSize || 12}px`, fontWeight: 700,
    color: theme.primaryColor, textTransform: 'uppercase', letterSpacing: '1.8px',
    borderBottom: `1.5px solid ${theme.primaryColor}`, paddingBottom: '2px', marginBottom: '6px',
  };

  const sidebarSections: Record<string, () => React.ReactNode> = {
    education: () => (data.education || []).length > 0 ? (
      <section key="edu" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        <h3 style={sbTitle}>Education</h3>
        {data.education!.map((item, idx) => (
          <div key={idx} style={{ marginBottom: '8px', fontSize: '11px', lineHeight: 1.4 }}>
            <div style={{ fontSize: '11px', color: sbAccent, fontWeight: 600 }}>{formatDates(item.start_date, item.end_date)}</div>
            <div style={{ fontSize: '11px', color: '#fff', fontWeight: 600 }}>{item.degree}{item.field ? `, ${item.field}` : ''}</div>
            <div style={{ fontSize: '11px', color: '#a0a0b4' }}>{item.institution}{item.location ? `, ${item.location}` : ''}</div>
          </div>
        ))}
      </section>
    ) : null,

    skills: () => skills.length > 0 ? (
      <section key="skills" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        <h3 style={sbTitle}>Key Skills</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', fontSize: '11px' }}>
          {skills.map((s) => (
            <span key={s.id} style={{
              fontSize: '11px', padding: '2px 6px', borderRadius: '2px',
              background: s.isHighlighted ? 'rgba(126, 200, 227, 0.2)' : 'rgba(126, 200, 227, 0.1)',
              color: s.isHighlighted ? '#fff' : '#a8c8d8',
              border: '1px solid rgba(126, 200, 227, 0.12)', fontWeight: s.isHighlighted ? 600 : 400,
            }}>{s.name}</span>
          ))}
        </div>
      </section>
    ) : null,

    languages: () => (data.languages || []).length > 0 ? (
      <section key="lang" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        <h3 style={sbTitle}>Languages</h3>
        {data.languages!.map((lang, idx) => (
          <div key={idx} style={{ fontSize: '11px', color: '#c0c0cc', marginBottom: '3px', lineHeight: 1.4 }}>{lang}</div>
        ))}
      </section>
    ) : null,

    technicalSkills: () => techSkills.length > 0 ? (
      <section key="techSkills" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        <h3 style={sbTitle}>Technical Skills</h3>
        {techSkills.map((cat) => (
          <div key={cat.id} style={{ marginBottom: '3px', fontSize: '11px', lineHeight: 1.4 }}>
            <span style={{ color: sbAccent, fontWeight: 600 }}>{cat.category}:</span>{' '}
            <span style={{ color: '#c0c0cc' }}>{cat.skills}</span>
          </div>
        ))}
      </section>
    ) : null,

    certifications: () => (data.certifications || []).length > 0 ? (
      <section key="certs" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        <h3 style={sbTitle}>Certifications</h3>
        {data.certifications!.map((cert, idx) => (
          <div key={idx} style={{ marginBottom: '3px', fontSize: '11px', lineHeight: 1.4, color: '#c0c0cc' }}>{cert}</div>
        ))}
      </section>
    ) : null,
  };

  const mainSections: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <div key="summary" style={{
        fontSize: '11px', color: '#3a3a5c', lineHeight: 1.38,
        marginBottom: '8px', padding: '6px 9px',
        background: '#f5f6fa', borderLeft: `2.5px solid ${theme.primaryColor}`,
      }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.summary) }} />
    ) : null,

    experience: () => (data.experience || []).length > 0 ? (
      <section key="experience" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        <h2 style={mainTitle}>Professional Experience</h2>
        {data.experience!.map((item, idx) => (
          <div key={idx} style={{ marginBottom: `${theme.itemSpacing || 6}px`, fontSize: '11px', lineHeight: 1.38 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: theme.primaryColor }}>{item.company}</span>
              <span style={{ fontSize: '11px', color: theme.accentColor, fontWeight: 600, whiteSpace: 'nowrap' }}>{formatDates(item.start_date, item.end_date, item.current)}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#555', fontStyle: 'italic', marginBottom: '3px' }}>{item.title}</div>
            <ul style={{ paddingLeft: '13px', margin: 0 }}>
              {item.bullets.map((b, i) => (
                <li key={i} style={{ fontSize: '11px', color: theme.textColor, marginBottom: '2px' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(b) }} />
              ))}
            </ul>
          </div>
        ))}
      </section>
    ) : null,
  };

  const sidebarKeys = new Set(['education', 'skills', 'languages', 'technicalSkills', 'certifications']);
  const mainKeys = new Set(['summary', 'experience']);

  return (
    <div style={{
      fontFamily: theme.fontFamily || "'Inter', sans-serif", fontSize: `${theme.baseFontSize || 11}px`,
      lineHeight: theme.lineHeight || 1.28, color: theme.textColor,
      backgroundColor: theme.backgroundColor, width: '210mm', minHeight: '297mm',
      boxShadow: '0 2px 16px rgba(0, 0, 0, 0.1)', margin: '0 auto',
      display: 'grid', gridTemplateColumns: `${theme.sidebarWidth || 218}px 1fr`, overflow: 'hidden',
    }} className="resume-paper">
      {/* SIDEBAR */}
      <aside style={{
        backgroundColor: theme.sidebarBg || '#16213e', color: theme.sidebarText || '#d0d0dc',
        paddingTop: '20px', paddingLeft: '22px', paddingRight: '16px', paddingBottom: '14px',
        display: 'flex', flexDirection: 'column',
      }}>
        {vis(sectionVisibility, 'photo') && (
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <div style={{
              position: 'relative',
              width: `${theme.headshotSize || 80}px`, height: `${theme.headshotSize || 80}px`,
              borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)',
              display: 'block', margin: '0 auto', backgroundColor: '#fff',
            }}>
              {data.personal?.photo_url ? (
                <Image src={data.personal.photo_url} alt="Profile" fill style={{ objectFit: 'cover' }} unoptimized />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '11px' }}>Photo</div>
              )}
            </div>
          </div>
        )}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: `${theme.headerFontSize || 24}px`, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{data.personal?.name}</h1>
          <div style={{ fontSize: '11px', color: sbAccent, fontWeight: 600, marginTop: '2px', letterSpacing: '0.2px' }}>{data.personal?.title}</div>
        </div>
        <section style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
          <h3 style={sbTitle}>Contact</h3>
          {[
            { icon: '📧', val: data.personal?.email },
            { icon: '📞', val: data.personal?.phone },
            { icon: '📍', val: data.personal?.location },
            { icon: '🔗', val: data.personal?.linkedin },
            ...(vis(sectionVisibility, 'portfolio') && data.personal?.portfolio_url ? [{ icon: '🌐', val: data.personal.portfolio_url }] : []),
            ...(vis(sectionVisibility, 'visaStatus') && data.personal?.visa_status ? [{ icon: '🛂', val: data.personal.visa_status }] : []),
          ].map((c, i) => (
            <div key={i} style={{ fontSize: '11px', marginBottom: '4px', color: '#c0c0cc', display: 'flex', alignItems: 'center', gap: '6px', lineHeight: 1.4 }}>
              <span style={{ color: sbAccent, fontSize: '11px', width: '12px', textAlign: 'center', flexShrink: 0 }}>{c.icon}</span>
              <span style={{ wordBreak: 'break-all' }}>{c.val}</span>
            </div>
          ))}
        </section>
        {sectionOrder.map((key) => {
          if (!vis(sectionVisibility, key)) return null;
          if (!sidebarKeys.has(key)) return null;
          return sidebarSections[key]?.() ?? null;
        })}
        <div style={{ flex: 1 }} />
      </aside>

      {/* MAIN */}
      <main style={{
        paddingTop: '20px', paddingRight: '24px', paddingBottom: '14px', paddingLeft: '16px',
        display: 'flex', flexDirection: 'column', color: theme.textColor, fontSize: `${theme.baseFontSize || 11}px`,
      }}>
        {sectionOrder.map((key) => {
          if (!vis(sectionVisibility, key)) return null;
          if (!mainKeys.has(key)) return null;
          return mainSections[key]?.() ?? null;
        })}
        <div style={{ flex: 1 }} />
      </main>
    </div>
  );
};

export default PremiumHeadshot;
