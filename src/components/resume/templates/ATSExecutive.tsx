'use client';
import React from 'react';
import { TemplateProps, vis, formatDates, getSkills, getTechSkills, paperStyle, sanitizeHtml } from './shared';

const ATSExecutive: React.FC<TemplateProps> = ({ data, theme, sectionOrder, sectionVisibility }) => {
 const skills = getSkills(data);
 const techSkills = getTechSkills(data);

 const sectionTitle: React.CSSProperties = {
 fontSize: `${theme.sectionTitleSize || 12}px`, fontWeight: 700, color: theme.primaryColor,
 textTransform: 'uppercase', letterSpacing: '1.5px',
 borderBottom: '1px solid #d0d5dd', paddingBottom: '2px', marginBottom: '6px',
 };

 const sections: Record<string, () => React.ReactNode> = {
 summary: () => data.summary ? (
 <section key="summary" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
 <div style={{ fontSize: '10px', color: '#3a3a3a', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.summary) }} />
 </section>
 ) : null,

 experience: () => (data.experience || []).length > 0 ? (
 <section key="experience" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
 <h2 style={sectionTitle}>Professional Experience</h2>
 {data.experience!.map((item, idx) => (
 <div key={idx} style={{ marginBottom: `${theme.itemSpacing || 6}px`, lineHeight: theme.lineHeight || 1.3 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
 <span style={{ fontWeight: 700, color: theme.primaryColor }}>{item.title}</span>
 <span style={{ fontSize: '10px', color: theme.accentColor, fontWeight: 600 }}>{formatDates(item.start_date, item.end_date, item.current)}</span>
 </div>
 <div style={{ marginBottom: '4px' }}><strong style={{ color: theme.accentColor }}>{item.company}</strong>{item.location ? ` - ${item.location}` : ''}</div>
 <ul style={{ listStyleType: 'disc', paddingLeft: '16px', margin: '2px 0 0 0' }}>
 {item.bullets.map((b, i) => (
 <li key={i} style={{ fontSize: '10px', color: theme.textColor, marginBottom: '4px', lineHeight: theme.lineHeight || 1.3 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(b) }} />
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
 <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '3px' }}>
 <span><strong style={{ color: theme.primaryColor }}>{item.institution}{item.location ? `, ${item.location}` : ""}</strong>, <em>{item.degree}{item.field ? `, ${item.field}` : ""}</em></span>
 <span style={{ color: theme.accentColor, whiteSpace: 'nowrap' }}>{formatDates(item.start_date, item.end_date)}</span>
 </div>
 ))}
 </section>
 ) : null,

 skills: () => skills.length > 0 ? (
 <section key="skills" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
 <h2 style={sectionTitle}>Key Skills</h2>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
 {skills.map((s) => (
 <span key={s.id} style={{
 padding: '2px 8px', borderRadius: '3px', fontSize: '10px',
 backgroundColor: s.isHighlighted ? theme.primaryColor : '#f0f3f6',
 color: s.isHighlighted ? '#fff' : '#2c3e50',
 fontWeight: s.isHighlighted ? 600 : 400,
 }}>{s.name}</span>
 ))}
 </div>
 </section>
 ) : null,

 technicalSkills: () => techSkills.length > 0 ? (
 <section key="technicalSkills" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
 <h2 style={sectionTitle}>Technical Skills</h2>
 {techSkills.map((cat) => (
 <div key={cat.id} style={{ marginBottom: '3px', fontSize: '10px' }}>
 <strong style={{ color: theme.primaryColor }}>{cat.category}:</strong> {cat.skills}
 </div>
 ))}
 </section>
 ) : null,

 projects: () => (data.projects || []).length > 0 ? (
 <section key="projects" style={{ marginBottom: `${theme.sectionSpacing || 12}px` }}>
 <h2 style={sectionTitle}>Projects</h2>
 {data.projects!.map((item, idx) => (
 <div key={idx} style={{ marginBottom: `${theme.itemSpacing || 6}px`, fontSize: `${theme.baseFontSize || 10}px`, lineHeight: theme.lineHeight || 1.3 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
 <span style={{ fontWeight: 600, color: theme.primaryColor }}>
 {item.url ? <a href={item.url} style={{ color: theme.primaryColor, textDecoration: 'none' }}>{item.name}</a> : item.name}
 </span>
 {(item.tech || []).length > 0 && <span style={{ fontSize: '10px', color: theme.accentColor }}>{item.tech!.join(' / ')}</span>}
 </div>
 {item.description && <div style={{ marginTop: '2px', color: '#3a3a3a' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description) }} />}
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
 <h3 style={{ ...sectionTitle, fontSize: '10px' }}>Languages</h3>
 <div style={{ fontSize: '10px' }}>{data.languages!.join(' · ')}</div>
 </section>
 )}
 {showCert && (
 <section>
 <h3 style={{ ...sectionTitle, fontSize: '10px' }}>Certifications</h3>
 {data.certifications!.map((c, i) => (
 <div key={i} style={{ marginBottom: '3px', fontSize: '10px' }}>{c}</div>
 ))}
 </section>
 )}
 </div>
 );
 };

 let langCertRendered = false;

 return (
 <div style={{ ...paperStyle(theme) }} className="resume-paper">
 <header style={{ marginBottom: `${theme.sectionSpacing || 12}px`, paddingBottom: '10px', borderBottom: `2px solid ${theme.primaryColor}` }}>
 <h1 style={{ fontSize: `${theme.headerFontSize || 28}px`, fontWeight: 700, color: theme.primaryColor, letterSpacing: '0.3px', marginBottom: '1px', lineHeight: 1.2 }}>{data.personal?.name}</h1>
 <div style={{ fontSize: '12px', color: theme.accentColor, fontWeight: 600, marginBottom: '4px' }}>{data.personal?.title}</div>
 <div style={{ fontSize: '10px', color: '#555' }}>
 {data.personal?.phone}<span style={{ color: theme.accentColor }}> · {data.personal?.email}</span> · {data.personal?.linkedin}
 {vis(sectionVisibility, 'portfolio') && data.personal?.portfolio_url && <> · {data.personal.portfolio_url}</>}
 {vis(sectionVisibility, 'visaStatus') && data.personal?.visa_status && <> · {data.personal.visa_status}</>}
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

export default ATSExecutive;
