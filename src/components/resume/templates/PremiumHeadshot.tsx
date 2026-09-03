'use client';
import React from 'react';
import { TemplateProps, vis, getSkills, getTechSkills, getStructuredContactItems, keyElement } from './shared';
import { EditableText, ProjectEntryContent, TwoLineEduEntry } from '../editable/EditableText';
import { EditableDateRange } from '../editable/EditableDateRange';
import { EntryActions, DragHandle, DropZone, AddEntryButton, BulletDelete, AddBulletButton, EditableSkillChip, HeadshotUpload } from '../editable/InlineControls';

const PremiumHeadshot: React.FC<TemplateProps> = ({ data, theme, sectionOrder, sectionVisibility }) => {
	const skills = getSkills(data);
	const techSkills = getTechSkills(data);
	const sbBg = theme.sidebarBg && theme.sidebarBg !== '#f8fafc' ? theme.sidebarBg : '#16213e';
	const sbText = theme.sidebarText && theme.sidebarText !== '#334155' ? theme.sidebarText : '#d0d0dc';
	const sbAccent = theme.sidebarAccent && theme.sidebarAccent !== '#3b82f6' ? theme.sidebarAccent : '#7ec8e3';
	const bulletGap = `${theme.bulletSpacing ?? 4}px`;

	const sbTitle: React.CSSProperties = {
		fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.8px',
		color: sbAccent, borderBottom: '1px solid rgba(126, 200, 227, 0.2)',
		paddingBottom: '3px', marginBottom: '7px', fontWeight: 700,
	};

	const mainTitle: React.CSSProperties = {
		fontSize: `${theme.sectionTitleSize ?? 12}px`, fontWeight: 700,
		color: theme.primaryColor, textTransform: 'uppercase', letterSpacing: '1.8px',
		borderBottom: `1.5px solid ${theme.primaryColor}`, paddingBottom: '2px', marginBottom: '6px',
	};

	const sidebarSections: Record<string, () => React.ReactNode> = {
		education: () => (data.education || []).length > 0 ? (
			<section key="edu" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
				<h3 style={sbTitle}>Education</h3>
				{data.education!.map((item, idx) => (
					<DropZone key={idx} section="education" index={idx}>
						<TwoLineEduEntry item={item} index={idx} theme={theme} isDarkSidebar={true} />
					</DropZone>
				))}
				<AddEntryButton section="education" label="Add education" />
			</section>
		) : <AddEntryButton section="education" label="Add education" />,
		skills: () => skills.length > 0 ? (
			<section key="skills" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
				<h3 style={sbTitle}>Key Skills</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', fontSize: '10px' }}>
        {skills.map((s, si) => <EditableSkillChip key={s.id} field={`skills[${si}].name`} value={s.name} section="skills" index={si} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '2px', background: s.isHighlighted ? 'rgba(126, 200, 227, 0.2)' : 'rgba(126, 200, 227, 0.1)', color: s.isHighlighted ? '#fff' : '#a8c8d8', border: '1px solid rgba(126, 200, 227, 0.12)', fontWeight: s.isHighlighted ? 600 : 400 }} />)}
        <AddEntryButton section="skills" label="Add skill" />
      </div>
    </section>
  ) : <AddEntryButton section="skills" label="Add skill" />,
  languages: () => (data.languages || []).length > 0 ? (
    <section key="lang" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
      <h3 style={sbTitle}>Languages</h3>
      {(data.languages || []).map((lang, idx) => <div key={idx} style={{ fontSize: '10px', color: '#c0c0cc', marginBottom: `${Math.max(0, (theme.itemSpacing ?? 8) - 4)}px`, lineHeight: 1.4 }}><EditableText field={`languages[${idx}]`} value={lang} /></div>)}
      <AddEntryButton section="languages" label="Add language" />
    </section>
  ) : <AddEntryButton section="languages" label="Add language" />,
  technicalSkills: () => techSkills.length > 0 ? (
    <section key="techSkills" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
      <h3 style={sbTitle}>Technical Skills</h3>
      {techSkills.map((cat, ti) => (<div key={cat.id} style={{ marginBottom: `${Math.max(0, (theme.itemSpacing ?? 8) - 4)}px`, fontSize: '10px', lineHeight: 1.4 }}><span style={{ color: sbAccent, fontWeight: 600 }}><EditableText field={`technicalSkills[${ti}].category`} value={cat.category} style={{ color: sbAccent, fontWeight: 600 }} />:</span> <span style={{ color: '#c0c0cc' }}><EditableText field={`technicalSkills[${ti}].skills`} value={cat.skills} /></span><EntryActions section="technicalSkills" index={ti} /></div>))}
      <AddEntryButton section="technicalSkills" label="Add category" />
    </section>
  ) : <AddEntryButton section="technicalSkills" label="Add category" />,
  certifications: () => (data.certifications || []).length > 0 ? (
    <section key="certs" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
      <h3 style={sbTitle}>Certifications</h3>
      {(data.certifications || []).map((cert, idx) => <div key={idx} style={{ marginBottom: `${Math.max(0, (theme.itemSpacing ?? 8) - 4)}px`, fontSize: '10px', lineHeight: 1.4, color: '#c0c0cc' }}><EditableText field={`certifications[${idx}]`} value={cert} /></div>)}
      <AddEntryButton section="certifications" label="Add cert" />
    </section>
  ) : <AddEntryButton section="certifications" label="Add cert" />,
  projects: () => (data.projects || []).length > 0 ? (
    <section key="projects" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
      <h2 style={mainTitle}>Projects</h2>
      {data.projects!.map((item, idx) => (
        <DropZone key={idx} section="projects" index={idx}>
          <ProjectEntryContent item={item} index={idx} theme={theme} />
        </DropZone>
      ))}
      <AddEntryButton section="projects" label="Add project" />
    </section>
  ) : <AddEntryButton section="projects" label="Add project" />,
 };

 const mainSections: Record<string, () => React.ReactNode> = {
 summary: () => data.summary ? (<div key="summary" style={{ fontSize: '10px', color: '#3a3a5c', lineHeight: 1.38, marginBottom: '8px', padding: '6px 9px', background: '#f5f6fa', borderLeft: `2.5px solid ${theme.primaryColor}` }}><EditableText field="summary" value={data.summary} html style={{ fontSize: '10px', color: '#3a3a5c', lineHeight: 1.38 }} /></div>) : null,
 experience: () => (data.experience || []).length > 0 ? (
 <section key="experience" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
 <h2 style={mainTitle}>Professional Experience</h2>
 {data.experience!.map((item, idx) => (
 <DropZone key={idx} section="experience" index={idx}>
 <div key={idx} style={{ marginBottom: `${theme.itemSpacing ?? 8}px`, fontSize: '10px', lineHeight: 1.38, position: 'relative' }}>
 <DragHandle section="experience" index={idx} />
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
 <span style={{ fontWeight: 700, color: theme.primaryColor }}><EditableText field={`experience[${idx}].title`} value={item.title} style={{ fontWeight: 700, color: theme.primaryColor }} /></span>
 <span style={{ fontSize: '10px', color: theme.accentColor, fontWeight: 600, whiteSpace: 'nowrap' }}><EditableDateRange pathPrefix={`experience[${idx}]`} start={item.start_date} end={item.end_date} current={item.current} style={{ fontSize: '10px', color: theme.accentColor, fontWeight: 600, whiteSpace: 'nowrap' }} /></span>
 </div>
 <div style={{ marginBottom: '4px' }}><strong style={{ color: theme.accentColor }}><EditableText field={`experience[${idx}].company`} value={item.company} style={{ color: theme.accentColor }} /></strong>{item.location ? ` — ` : ''}{item.location && <EditableText field={`experience[${idx}].location`} value={item.location} />}<EntryActions section="experience" index={idx} /></div>
 <ul style={{ listStyleType: 'disc', paddingLeft: '13px', margin: 0 }}>
 {item.bullets.map((b, i) => <li key={i} style={{ fontSize: '10px', color: theme.textColor, marginBottom: bulletGap }}><EditableText field={`experience[${idx}].bullets[${i}]`} value={b} html style={{ fontSize: '10px', color: theme.textColor }} /><BulletDelete expIndex={idx} bulletIndex={i} /></li>)}
 <AddBulletButton expIndex={idx} />
 </ul>
 </div>
 </DropZone>
 ))}
 <AddEntryButton section="experience" label="Add experience" />
 </section>
 ) : <AddEntryButton section="experience" label="Add experience" />,
 };

  const sidebarKeys = new Set(['education', 'skills', 'languages', 'technicalSkills', 'certifications']);
  // Projects live in the main column (sidebar is too narrow for entries).
  // Previously omitted from BOTH sets, so projects silently vanished here.
  const mainKeys = new Set(['summary', 'experience', 'projects']);
 const contactItems = getStructuredContactItems(data, sectionVisibility);
 const sbWidthCss = theme.sidebarWidth ? (theme.sidebarWidth <= 50 ? `${theme.sidebarWidth}%` : `${theme.sidebarWidth}px`) : '218px';

 return (
 <div style={{ fontFamily: theme.fontFamily || "'Inter', sans-serif", fontSize: `${theme.baseFontSize ?? 10}px`, lineHeight: theme.lineHeight ?? 1.28, color: theme.textColor, backgroundColor: theme.backgroundColor, width: '210mm', minHeight: '297mm', boxShadow: '0 2px 16px rgba(0, 0, 0, 0.1)', margin: '0 auto', display: 'grid', gridTemplateColumns: `${sbWidthCss} 1fr`, overflow: 'hidden' }} className="resume-paper">
 <aside style={{ backgroundColor: sbBg, color: sbText, paddingTop: '20px', paddingLeft: '22px', paddingRight: '16px', paddingBottom: '14px', display: 'flex', flexDirection: 'column' }}>
 {vis(sectionVisibility, 'photo') && (<div style={{ textAlign: 'center', marginBottom: '15px' }}><div style={{ position: 'relative', width: `${theme.headshotSize ?? 80}px`, height: `${theme.headshotSize ?? 80}px`, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', display: 'block', margin: '0 auto', backgroundColor: '#fff' }}><HeadshotUpload size={theme.headshotSize ?? 80} radius={0} photoUrl={data.personal?.photo_url} circular /></div></div>)}
 <div style={{ textAlign: 'center', marginBottom: '16px' }}>
 <h1 style={{ fontSize: `${theme.headerFontSize ?? 28}px`, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}><EditableText field="personal.name" value={data.personal?.name} style={{ fontSize: `${theme.headerFontSize ?? 28}px`, fontWeight: 700, color: '#fff', lineHeight: 1.2 }} /></h1>
 <div style={{ fontSize: '10px', color: sbAccent, fontWeight: 600, marginTop: '2px', letterSpacing: '0.2px' }}><EditableText field="personal.title" value={data.personal?.title} style={{ fontSize: '10px', color: sbAccent, fontWeight: 600, letterSpacing: '0.2px' }} /></div>
 </div>
 <section style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
 <h3 style={sbTitle}>Contact</h3>
 {contactItems.map((item) => (
    <div key={item.key} style={{ fontSize: '10px', marginBottom: '4px', color: '#c0c0cc', lineHeight: 1.4, wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '10px', width: '12px', textAlign: 'center', flexShrink: 0, opacity: 0.9 }}>{item.icon}</span>
      <EditableText field={item.field} value={item.value} />
    </div>
  ))}
 </section>
 {sectionOrder.map((key) => { if (!vis(sectionVisibility, key)) return null; if (!sidebarKeys.has(key)) return null; return keyElement(sidebarSections[key]?.(), key); })}
 <div style={{ flex: 1 }} />
 </aside>

 <main style={{ paddingTop: '20px', paddingRight: '24px', paddingBottom: '14px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', color: theme.textColor, fontSize: `${theme.baseFontSize ?? 10}px` }}>
 {sectionOrder.map((key) => { if (!vis(sectionVisibility, key)) return null; if (!mainKeys.has(key)) return null; return keyElement(mainSections[key]?.(), key); })}
 <div style={{ flex: 1 }} />
 </main>
 </div>
 );
};

export default PremiumHeadshot;
