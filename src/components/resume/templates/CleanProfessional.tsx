'use client';
import React from 'react';
import { TemplateProps, vis, getSkills, getTechSkills, getStructuredContactItems, paperStyle, keyElement } from './shared';
import { EditableText, ProjectEntryContent, TwoLineEduEntry } from '../editable/EditableText';
import { EditableDateRange } from '../editable/EditableDateRange';
import { EntryActions, DragHandle, DropZone, AddEntryButton, BulletDelete, AddBulletButton, EditableSkillChip } from '../editable/InlineControls';

const CleanProfessional: React.FC<TemplateProps> = ({ data, theme, sectionOrder, sectionVisibility }) => {
	const skills = getSkills(data);
	const techSkills = getTechSkills(data);
	const bulletGap = `${theme.bulletSpacing ?? 4}px`;

	const sectionTitle: React.CSSProperties = {
		fontSize: `${theme.sectionTitleSize ?? 12}px`, fontWeight: 700, color: theme.primaryColor,
		textTransform: 'uppercase', letterSpacing: '1.5px',
		borderBottom: '1px solid #e5e7eb', paddingBottom: '5px', marginBottom: '15px',
	};

	const sections: Record<string, () => React.ReactNode> = {
		summary: () => data.summary ? (
			<section key="summary" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
				<EditableText field="summary" value={data.summary} html style={{ fontSize: `${theme.baseFontSize ?? 10}px`, color: '#3a3a3a', lineHeight: 1.5 }} />
			</section>
		) : null,

		experience: () => (data.experience || []).length > 0 ? (
			<section key="experience" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
				<h2 style={sectionTitle}>Professional Experience</h2>
				{data.experience!.map((item, idx) => (
					<DropZone key={idx} section="experience" index={idx}>
						<div style={{ marginBottom: `${theme.itemSpacing ?? 8}px`, fontSize: `${theme.baseFontSize ?? 10}px`, lineHeight: theme.lineHeight ?? 1.3, position: 'relative' }}>
							<DragHandle section="experience" index={idx} />
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
								<span style={{ fontWeight: 700, color: theme.primaryColor }}><EditableText field={`experience[${idx}].title`} value={item.title} style={{ fontWeight: 700, color: theme.primaryColor }} /></span>
								<span style={{ color: theme.accentColor, fontWeight: 400, fontStyle: 'italic', fontSize: '0.95em' }}><EditableDateRange pathPrefix={`experience[${idx}]`} start={item.start_date} end={item.end_date} current={item.current} style={{ color: theme.accentColor, fontWeight: 400, fontStyle: 'italic', fontSize: '0.95em' }} /></span>
							</div>
							<div style={{ marginBottom: '4px' }}><strong style={{ color: theme.accentColor }}><EditableText field={`experience[${idx}].company`} value={item.company} style={{ color: theme.accentColor }} /></strong>{item.location ? ` — ` : ''}{item.location && <EditableText field={`experience[${idx}].location`} value={item.location} />}<EntryActions section="experience" index={idx} /></div>
							<ul style={{ listStyleType: 'disc', margin: 0, marginTop: '2px', paddingLeft: '16px' }}>
								{item.bullets.map((b, i) => <li key={i} style={{ marginBottom: bulletGap, lineHeight: theme.lineHeight ?? 1.3 }}><EditableText field={`experience[${idx}].bullets[${i}]`} value={b} html style={{ lineHeight: theme.lineHeight ?? 1.3 }} /><BulletDelete expIndex={idx} bulletIndex={i} /></li>)}
								<AddBulletButton expIndex={idx} />
							</ul>
						</div>
					</DropZone>
				))}
				<AddEntryButton section="experience" label="Add experience" />
			</section>
		) : <AddEntryButton section="experience" label="Add experience" />,

		education: () => (data.education || []).length > 0 ? (
			<section key="education" style={{ marginBottom: `${theme.sectionSpacing ?? 20}px` }}>
				<h2 style={sectionTitle}>Education</h2>
				{data.education!.map((item, idx) => (
					<DropZone key={idx} section="education" index={idx}>
						<TwoLineEduEntry item={item} index={idx} theme={theme} />
					</DropZone>
				))}
				<AddEntryButton section="education" label="Add education" />
			</section>
		) : <AddEntryButton section="education" label="Add education" />,

 skills: () => skills.length > 0 ? (
 <section key="skills" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
 <h2 style={sectionTitle}>Key Skills</h2>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
 {skills.map((s, si) => <EditableSkillChip key={s.id} field={`skills[${si}].name`} value={s.name} section="skills" index={si} style={{ padding: '2px 8px', borderRadius: '3px', fontSize: '10px', backgroundColor: s.isHighlighted ? theme.primaryColor : '#f0f3f6', color: s.isHighlighted ? '#fff' : '#2c3e50', fontWeight: s.isHighlighted ? 600 : 400 }} />)}
 <AddEntryButton section="skills" label="Add skill" />
 </div>
 </section>
 ) : <AddEntryButton section="skills" label="Add skill" />,

 technicalSkills: () => techSkills.length > 0 ? (
 <section key="technicalSkills" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
 <h2 style={sectionTitle}>Technical Skills</h2>
 {techSkills.map((cat, ti) => (<div key={cat.id} style={{ marginBottom: `${Math.max(0, (theme.itemSpacing ?? 8) - 4)}px`, fontSize: '10px' }}><strong style={{ color: theme.primaryColor }}><EditableText field={`technicalSkills[${ti}].category`} value={cat.category} style={{ color: theme.primaryColor }} />:</strong> <EditableText field={`technicalSkills[${ti}].skills`} value={cat.skills} /><EntryActions section="technicalSkills" index={ti} /></div>))}
 <AddEntryButton section="technicalSkills" label="Add category" />
 </section>
 ) : <AddEntryButton section="technicalSkills" label="Add category" />,

    projects: () => (data.projects || []).length > 0 ? (
      <section key="projects" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
        <h2 style={sectionTitle}>Projects</h2>
        {data.projects!.map((item, idx) => (
          <DropZone key={idx} section="projects" index={idx}>
              <ProjectEntryContent item={item} index={idx} theme={theme} />
            </DropZone>
        ))}
        <AddEntryButton section="projects" label="Add project" />
      </section>
    ) : <AddEntryButton section="projects" label="Add project" />,
 };

 const langCertBlock = () => {
 const showLang = vis(sectionVisibility, 'languages') && (data.languages || []).length > 0;
 const showCert = vis(sectionVisibility, 'certifications') && (data.certifications || []).length > 0;
 if (!showLang && !showCert) return null;
 return (<div key="lang-cert" style={{ display: 'grid', gridTemplateColumns: showLang && showCert ? '1fr 1fr' : '1fr', gap: '20px', marginBottom: `${theme.sectionSpacing ?? 12}px` }}>{showLang && <section><h2 style={sectionTitle}>Languages</h2><div style={{ fontSize: '10px' }}>{(data.languages || []).map((l, li) => <React.Fragment key={li}>{li > 0 && ' · '}<EditableText field={`languages[${li}]`} value={l} /></React.Fragment>)}</div></section>}{showCert && <section><h2 style={sectionTitle}>Certifications</h2>{(data.certifications || []).map((c, ci) => <div key={ci} style={{ marginBottom: `${Math.max(0, (theme.itemSpacing ?? 8) - 4)}px`, fontSize: '10px' }}><EditableText field={`certifications[${ci}]`} value={c} /></div>)}</section>}</div>);
 };

 let langCertRendered = false;
  const contactItems = getStructuredContactItems(data, sectionVisibility);

  return (
    <div style={{ ...paperStyle(theme), display: 'flex', flexDirection: 'column' }} className="resume-paper">
      <header style={{ textAlign: 'center', marginBottom: '35px' }}>
        <h1 style={{ fontSize: `${theme.headerFontSize ?? 32}px`, fontWeight: 700, color: theme.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px', lineHeight: 1.2 }}><EditableText field="personal.name" value={data.personal?.name} style={{ fontSize: `${theme.headerFontSize ?? 32}px`, fontWeight: 700, color: theme.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', lineHeight: 1.2 }} /></h1>
        <div style={{ fontSize: '16px', color: '#6b7280', fontWeight: 500, marginBottom: '15px' }}><EditableText field="personal.title" value={data.personal?.title} style={{ fontSize: '16px', color: '#6b7280', fontWeight: 500 }} /></div>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', fontSize: '10px', color: '#4b5563' }}>
          {contactItems.map((item) => (
            <span key={item.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', opacity: 0.85 }}>{item.icon}</span>
              <EditableText field={item.field} value={item.value} style={{ fontSize: '10px', color: '#4b5563' }} />
            </span>
          ))}
        </div>
      </header>

 {sectionOrder.map((key) => {
 if (!vis(sectionVisibility, key)) return null;
 if (key === 'languages' || key === 'certifications') { if (langCertRendered) return null; langCertRendered = true; return langCertBlock(); }
 if (key === 'photo') return null;
 return keyElement(sections[key]?.(), key);
 })}
 </div>
 );
};

export default CleanProfessional;
