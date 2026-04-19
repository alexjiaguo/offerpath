'use client';
import React from 'react';
import { TemplateProps, vis, formatDates, getSkills, getTechSkills, paperStyle, sanitizeHtml } from './shared';

const PhotoHeader: React.FC<TemplateProps> = ({ data, theme, sectionOrder, sectionVisibility }) => {
  const skills = getSkills(data);
  const techSkills = getTechSkills(data);

  const sectionTitle = (title: string): React.ReactNode => (
    <div style={{
      display: 'flex', alignItems: 'center',
      fontSize: `${theme.sectionTitleSize || 11}px`, fontWeight: 700, color: theme.primaryColor,
      textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px',
      borderBottom: `1.5px solid ${theme.accentColor}`, paddingBottom: '5px',
    }}>
      <span>{title}</span>
      <span style={{ flex: 1, height: '1.5px', background: '#eee', marginLeft: '10px' }} />
    </div>
  );

  const sidebarKeys = new Set(['summary', 'education', 'technicalSkills', 'skills', 'languages', 'certifications']);
  const mainKeys = new Set(['experience']);

  const sidebarSections: Record<string, () => React.ReactNode> = {
    summary: () => data.summary ? (
      <section key="summary-s" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        {sectionTitle('About Me')}
        <div style={{ fontSize: '11px', lineHeight: 1.5, color: '#555' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.summary) }} />
      </section>
    ) : null,

    education: () => (data.education || []).length > 0 ? (
      <section key="edu-s" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        {sectionTitle('Education')}
        {data.education!.map((item, idx) => (
          <div key={idx} style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 700, color: theme.primaryColor, marginBottom: '2px', fontSize: '11px' }}>{item.degree}{item.field ? `, ${item.field}` : ''}</div>
            <div style={{ color: '#555', fontSize: '11px' }}>{item.institution}{item.location ? `, ${item.location}` : ''}</div>
            <div style={{ color: theme.accentColor, fontSize: '10px', fontWeight: 600 }}>{formatDates(item.start_date, item.end_date)}</div>
          </div>
        ))}
      </section>
    ) : null,

    skills: () => skills.length > 0 ? (
      <section key="skills-s" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        {sectionTitle('Key Skills')}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {skills.map((s) => (
            <span key={s.id} style={{
              padding: '2px 8px', borderRadius: '3px', fontSize: '11px',
              background: s.isHighlighted ? theme.primaryColor : '#f0f3f6',
              color: s.isHighlighted ? '#fff' : '#2c3e50', fontWeight: s.isHighlighted ? 600 : 400,
            }}>{s.name}</span>
          ))}
        </div>
      </section>
    ) : null,

    technicalSkills: () => techSkills.length > 0 ? (
      <section key="tech-s" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        {sectionTitle('Technical Skills')}
        {techSkills.map((cat) => (
          <div key={cat.id} style={{ marginBottom: '4px', fontSize: '11px' }}>
            <strong style={{ color: theme.primaryColor }}>{cat.category}:</strong> {cat.skills}
          </div>
        ))}
      </section>
    ) : null,

    languages: () => (data.languages || []).length > 0 ? (
      <section key="lang-s" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        {sectionTitle('Languages')}
        {data.languages!.map((l, i) => <div key={i} style={{ fontSize: '11px', marginBottom: '3px' }}>{l}</div>)}
      </section>
    ) : null,

    certifications: () => (data.certifications || []).length > 0 ? (
      <section key="certs-s" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        {sectionTitle('Certifications')}
        {data.certifications!.map((c, i) => <div key={i} style={{ marginBottom: '3px', fontSize: '11px' }}>{c}</div>)}
      </section>
    ) : null,
  };

  const mainSections: Record<string, () => React.ReactNode> = {
    experience: () => (data.experience || []).length > 0 ? (
      <section key="experience" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
        {sectionTitle('Professional Experience')}
        {data.experience!.map((item, idx) => (
          <div key={idx} style={{ paddingLeft: '20px', borderLeft: '2px solid #eee', position: 'relative', marginBottom: '15px' }}>
            <div style={{ position: 'absolute', left: '-6px', top: '0', width: '10px', height: '10px', background: theme.accentColor, borderRadius: '50%', border: '2px solid #fff' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
              <span style={{ fontWeight: 700, color: theme.primaryColor, fontSize: '11px' }}>{item.title}</span>
              <span style={{ fontSize: '10px', background: '#eee', color: '#666', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>{formatDates(item.start_date, item.end_date, item.current)}</span>
            </div>
            <div style={{ fontStyle: 'italic', color: '#555', marginBottom: '6px', fontSize: `${theme.companyFontSize || 11}px` }}>{item.company}{item.location ? `, ${item.location}` : ''}</div>
            <ul style={{ paddingLeft: '15px', marginTop: '5px', margin: 0 }}>
              {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: '4px', fontSize: '11px', lineHeight: theme.lineHeight || 1.4 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(b) }} />)}
            </ul>
          </div>
        ))}
      </section>
    ) : null,
  };

  return (
    <div style={{ ...paperStyle(theme), display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }} className="resume-paper">
      <header style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '25px', background: '#f0f2f5', padding: '25px 30px', borderRadius: '4px' }}>
        {vis(sectionVisibility, 'photo') && (
          <div style={{ width: `${theme.headshotSize || 140}px`, height: `${theme.headshotSize || 140}px`, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '5px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', backgroundColor: '#eee' }}>
            {data.personal?.photo_url ? <img src={data.personal.photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Photo</div>}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: `${theme.headerFontSize || 28}px`, color: theme.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '3px', lineHeight: 1.1 }}>{data.personal?.name}</h1>
          <div style={{ fontSize: '16px', color: theme.accentColor, fontWeight: 500, marginBottom: '6px' }}>{data.personal?.title}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px', fontSize: '10px', color: '#555', marginTop: '6px' }}>
            {data.personal?.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: theme.accentColor, fontWeight: 'bold' }}>📞</span>{data.personal.phone}</div>}
            {data.personal?.email && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: theme.accentColor, fontWeight: 'bold' }}>✉</span>{data.personal.email}</div>}
            {data.personal?.location && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: theme.accentColor, fontWeight: 'bold' }}>📍</span>{data.personal.location}</div>}
            {data.personal?.linkedin && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: theme.accentColor, fontWeight: 'bold' }}>🌐</span>{data.personal.linkedin}</div>}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', gap: `${theme.pagePadding || 30}px`, flex: 1 }}>
        <aside style={{ width: '35%', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {sectionOrder.map((key) => { if (!vis(sectionVisibility, key) || !sidebarKeys.has(key)) return null; return sidebarSections[key]?.() ?? null; })}
        </aside>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {sectionOrder.map((key) => { if (!vis(sectionVisibility, key) || !mainKeys.has(key)) return null; return mainSections[key]?.() ?? null; })}
        </main>
      </div>
    </div>
  );
};

export default PhotoHeader;
