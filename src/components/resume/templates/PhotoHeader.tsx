'use client';
import React from 'react';
import { TemplateProps, vis, getSkills, getTechSkills, getStructuredContactItems, paperStyle, keyElement } from './shared';
import { EditableText, ProjectEntryContent, TwoLineEduEntry } from '../editable/EditableText';
import { EditableDateRange } from '../editable/EditableDateRange';
import { EntryActions, DragHandle, DropZone, AddEntryButton, BulletDelete, AddBulletButton, EditableSkillChip, HeadshotUpload } from '../editable/InlineControls';

const PhotoHeader: React.FC<TemplateProps> = ({ data, theme, sectionOrder, sectionVisibility }) => {
	const skills = getSkills(data);
	const techSkills = getTechSkills(data);
	const bulletGap = `${theme.bulletSpacing ?? 4}px`;

	const sectionTitle = (title: string): React.ReactNode => (
		<div style={{ display: 'flex', alignItems: 'center', fontSize: `${theme.sectionTitleSize ?? 12}px`, fontWeight: 700, color: theme.primaryColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', borderBottom: `1.5px solid ${theme.accentColor}`, paddingBottom: '5px' }}>
			<span>{title}</span>
			<span style={{ flex: 1, height: '1.5px', background: '#eee', marginLeft: '10px' }} />
		</div>
	);

	const sidebarKeys = new Set(['summary', 'education', 'technicalSkills', 'skills', 'languages', 'certifications', 'projects']);
	const mainKeys = new Set(['experience']);

	const sidebarSections: Record<string, () => React.ReactNode> = {
		summary: () => data.summary ? (<section key="summary-s" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>{sectionTitle('About Me')}<EditableText field="summary" value={data.summary} html style={{ fontSize: '10px', lineHeight: 1.5, color: '#555' }} /></section>) : null,
		education: () => (data.education || []).length > 0 ? (
			<section key="edu-s" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
				{sectionTitle('Education')}
				{data.education!.map((item, idx) => (
					<DropZone key={idx} section="education" index={idx}>
						<TwoLineEduEntry item={item} index={idx} theme={theme} />
					</DropZone>
				))}
				<AddEntryButton section="education" label="Add education" />
			</section>
		) : <AddEntryButton section="education" label="Add education" />,
 skills: () => skills.length > 0 ? (
 <section key="skills-s" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
 {sectionTitle('Key Skills')}
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
 {skills.map((s, si) => <EditableSkillChip key={s.id} field={`skills[${si}].name`} value={s.name} section="skills" index={si} style={{ padding: '2px 8px', borderRadius: '3px', fontSize: '10px', background: s.isHighlighted ? theme.primaryColor : '#f0f3f6', color: s.isHighlighted ? '#fff' : '#2c3e50', fontWeight: s.isHighlighted ? 600 : 400 }} />)}
 <AddEntryButton section="skills" label="Add skill" />
 </div>
 </section>
 ) : <AddEntryButton section="skills" label="Add skill" />,
 technicalSkills: () => techSkills.length > 0 ? (
 <section key="tech-s" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
 {sectionTitle('Technical Skills')}
 {techSkills.map((cat, ti) => (<div key={cat.id} style={{ marginBottom: `${Math.max(0, (theme.itemSpacing ?? 8) - 4)}px`, fontSize: '10px' }}><strong style={{ color: theme.primaryColor }}><EditableText field={`technicalSkills[${ti}].category`} value={cat.category} style={{ color: theme.primaryColor }} />:</strong> <EditableText field={`technicalSkills[${ti}].skills`} value={cat.skills} /><EntryActions section="technicalSkills" index={ti} /></div>))}
 <AddEntryButton section="technicalSkills" label="Add category" />
 </section>
 ) : <AddEntryButton section="technicalSkills" label="Add category" />,
 languages: () => (data.languages || []).length > 0 ? (
 <section key="lang-s" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
 {sectionTitle('Languages')}
 {(data.languages || []).map((l, i) => <div key={i} style={{ fontSize: '10px', marginBottom: `${Math.max(0, (theme.itemSpacing ?? 8) - 4)}px` }}><EditableText field={`languages[${i}]`} value={l} /></div>)}
 <AddEntryButton section="languages" label="Add language" />
 </section>
 ) : <AddEntryButton section="languages" label="Add language" />,
 certifications: () => (data.certifications || []).length > 0 ? (
 <section key="certs-s" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
 {sectionTitle('Certifications')}
 {(data.certifications || []).map((c, i) => <div key={i} style={{ marginBottom: `${Math.max(0, (theme.itemSpacing ?? 8) - 4)}px`, fontSize: '10px' }}><EditableText field={`certifications[${i}]`} value={c} /></div>)}
 <AddEntryButton section="certifications" label="Add cert" />
 </section>
 ) : <AddEntryButton section="certifications" label="Add cert" />,
    projects: () => (data.projects || []).length > 0 ? (
      <section key="projects" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
        {sectionTitle('Projects')}
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
 experience: () => (data.experience || []).length > 0 ? (
 <section key="experience" style={{ marginBottom: `${theme.sectionSpacing ?? 12}px` }}>
 {sectionTitle('Professional Experience')}
 {data.experience!.map((item, idx) => (
 <DropZone key={idx} section="experience" index={idx}>
 <div key={idx} style={{ paddingLeft: '20px', borderLeft: '2px solid #eee', position: 'relative', marginBottom: `${theme.itemSpacing ?? 8}px` }}>
 <DragHandle section="experience" index={idx} />
 <div style={{ position: 'absolute', left: '-6px', top: '0', width: '10px', height: '10px', background: theme.accentColor, borderRadius: '50%', border: '2px solid #fff' }} />
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
 <span style={{ fontWeight: 700, color: theme.primaryColor, fontSize: '10px' }}><EditableText field={`experience[${idx}].title`} value={item.title} style={{ fontWeight: 700, color: theme.primaryColor, fontSize: '10px' }} /></span>
 <span style={{ fontSize: '10px', background: '#eee', color: '#666', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}><EditableDateRange pathPrefix={`experience[${idx}]`} start={item.start_date} end={item.end_date} current={item.current} style={{ fontSize: '10px', background: '#eee', color: '#666', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }} /></span>
 </div>
 <div style={{ marginBottom: '6px' }}><strong style={{ color: theme.accentColor }}><EditableText field={`experience[${idx}].company`} value={item.company} style={{ color: theme.accentColor }} /></strong>{item.location ? ` — ` : ''}{item.location && <EditableText field={`experience[${idx}].location`} value={item.location} />}<EntryActions section="experience" index={idx} /></div>
 <ul style={{ listStyleType: 'disc', paddingLeft: '15px', marginTop: '5px', margin: 0 }}>
 {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: bulletGap, fontSize: '10px', lineHeight: theme.lineHeight ?? 1.3 }}><EditableText field={`experience[${idx}].bullets[${i}]`} value={b} html style={{ fontSize: '10px', lineHeight: theme.lineHeight ?? 1.3 }} /><BulletDelete expIndex={idx} bulletIndex={i} /></li>)}
 <AddBulletButton expIndex={idx} />
 </ul>
 </div>
 </DropZone>
 ))}
 <AddEntryButton section="experience" label="Add experience" />
 </section>
 ) : <AddEntryButton section="experience" label="Add experience" />,
 };

  const contactItems = getStructuredContactItems(data, sectionVisibility);
  const contactRows: typeof contactItems[] = [];
  for (let i = 0; i < contactItems.length; i += 3) {
    contactRows.push(contactItems.slice(i, i + 3));
  }

  return (
    <div style={{ ...paperStyle(theme), display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }} className="resume-paper">
      <header style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: `${theme.sectionSpacing ?? 25}px`, background: '#f0f2f5', padding: '25px 30px', borderRadius: '4px' }}>
        {vis(sectionVisibility, 'photo') && (
          <div style={{ width: `${theme.headshotSize ?? 140}px`, height: `${theme.headshotSize ?? 140}px`, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '5px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeadshotUpload size={theme.headshotSize ?? 140} radius={0} photoUrl={data.personal?.photo_url} circular />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: `${theme.headerFontSize ?? 28}px`, color: theme.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '3px', lineHeight: 1.1 }}><EditableText field="personal.name" value={data.personal?.name} style={{ fontSize: `${theme.headerFontSize ?? 28}px`, color: theme.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', lineHeight: 1.1 }} /></h1>
          <div style={{ fontSize: '16px', color: theme.accentColor, fontWeight: 500, marginBottom: '6px' }}><EditableText field="personal.title" value={data.personal?.title} style={{ fontSize: '16px', color: theme.accentColor, fontWeight: 500 }} /></div>
          {contactRows.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
              {contactRows.map((row, rIdx) => (
                <div key={rIdx} style={{ display: 'flex', flexWrap: 'nowrap', gap: '16px', alignItems: 'center', fontSize: '10px', color: '#555' }}>
                  {row.map((item) => (
                    <span key={item.key} style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11px', opacity: 0.85 }}>{item.icon}</span>
                      <EditableText field={item.field} value={item.value} style={{ fontSize: '10px', color: '#555' }} />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

 <div style={{ display: 'flex', gap: `${theme.pagePadding ?? 36}px`, flex: 1 }}>
 <aside style={{ width: '35%', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
 {sectionOrder.map((key) => { if (!vis(sectionVisibility, key) || !sidebarKeys.has(key)) return null; return keyElement(sidebarSections[key]?.(), key); })}
 </aside>
 <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
 {sectionOrder.map((key) => { if (!vis(sectionVisibility, key) || !mainKeys.has(key)) return null; return keyElement(mainSections[key]?.(), key); })}
 </main>
 </div>
 </div>
 );
};

export default PhotoHeader;
