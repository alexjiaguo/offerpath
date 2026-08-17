'use client';
import React from 'react';
import { TemplateProps, vis, getSkills, getTechSkills, getStructuredContactItems, paperStyle, keyElement } from './shared';
import { EditableText, ProjectEntryContent, TwoLineEduEntry } from '../editable/EditableText';
import { EditableDateRange } from '../editable/EditableDateRange';
import { EntryActions, DragHandle, DropZone, AddEntryButton, BulletDelete, AddBulletButton, EditableSkillChip, HeadshotUpload } from '../editable/InlineControls';

const ElegantTwoColumn: React.FC<TemplateProps> = ({ data, theme, sectionOrder, sectionVisibility }) => {
	const skills = getSkills(data);
	const techSkills = getTechSkills(data);
	const bulletGap = `${theme.bulletSpacing ?? 4}px`;

	const sectionTitle = (title: string): React.ReactNode => (
		<div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'Montserrat', sans-serif", fontSize: `${theme.sectionTitleSize ?? 12}px`, fontWeight: 700, color: theme.primaryColor, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
			<span>{title}</span>
			<span style={{ height: '1px', background: '#ecf0f1', flex: 1 }} />
		</div>
	);

	const leftKeys = new Set(['experience']);
	const rightKeys = new Set(['summary', 'education', 'skills', 'technicalSkills', 'languages', 'certifications', 'projects']);

	const rightSections: Record<string, () => React.ReactNode> = {
		summary: () => data.summary ? (<section key="summary-r" style={{ marginBottom: `${theme.sectionSpacing ?? 20}px` }}>{sectionTitle('Profile')}<EditableText field="summary" value={data.summary} html style={{ fontSize: '10px', lineHeight: 1.5, color: '#555' }} /></section>) : null,
		education: () => (data.education || []).length > 0 ? (
			<section key="edu-r" style={{ marginBottom: `${theme.sectionSpacing ?? 20}px` }}>
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
 <section key="skills-r" style={{ marginBottom: `${theme.sectionSpacing ?? 20}px` }}>
 {sectionTitle('Skills')}
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
 {skills.map((s, si) => <EditableSkillChip key={s.id} field={`skills[${si}].name`} value={s.name} section="skills" index={si} style={{ padding: '2px 8px', borderRadius: '3px', fontSize: '10px', backgroundColor: s.isHighlighted ? theme.primaryColor : '#f0f3f6', color: s.isHighlighted ? '#fff' : '#2c3e50', fontWeight: s.isHighlighted ? 600 : 400 }} />)}
 <AddEntryButton section="skills" label="Add skill" />
 </div>
 </section>
 ) : <AddEntryButton section="skills" label="Add skill" />,
 technicalSkills: () => techSkills.length > 0 ? (
      <section key="tech-r" style={{ marginBottom: `${theme.sectionSpacing ?? 20}px` }}>
        {sectionTitle('Technical Skills')}
        {techSkills.map((cat, ti) => (<div key={cat.id} style={{ marginBottom: `${Math.max(0, (theme.itemSpacing ?? 8) - 4)}px`, fontSize: '10px' }}><strong style={{ color: theme.primaryColor }}><EditableText field={`technicalSkills[${ti}].category`} value={cat.category} style={{ color: theme.primaryColor }} />:</strong> <EditableText field={`technicalSkills[${ti}].skills`} value={cat.skills} /><EntryActions section="technicalSkills" index={ti} /></div>))}
        <AddEntryButton section="technicalSkills" label="Add category" />
      </section>
    ) : <AddEntryButton section="technicalSkills" label="Add category" />,
 languages: () => (data.languages || []).length > 0 ? (
      <section key="lang-r" style={{ marginBottom: `${theme.sectionSpacing ?? 20}px` }}>
        {sectionTitle('Languages')}
        {(data.languages || []).map((l, i) => <div key={i} style={{ fontSize: '10px', marginBottom: `${Math.max(0, (theme.itemSpacing ?? 8) - 4)}px` }}><EditableText field={`languages[${i}]`} value={l} /></div>)}
        <AddEntryButton section="languages" label="Add language" />
      </section>
    ) : <AddEntryButton section="languages" label="Add language" />,
 certifications: () => (data.certifications || []).length > 0 ? (
      <section key="certs-r" style={{ marginBottom: `${theme.sectionSpacing ?? 20}px` }}>
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

 const leftSections: Record<string, () => React.ReactNode> = {
 experience: () => (data.experience || []).length > 0 ? (
 <section key="experience" style={{ marginBottom: `${theme.sectionSpacing ?? 20}px` }}>
 {sectionTitle('Professional Experience')}
 {data.experience!.map((item, idx) => (
 <DropZone key={idx} section="experience" index={idx}>
 <div key={idx} style={{ position: 'relative', paddingLeft: '20px', borderLeft: '1px solid #ecf0f1', marginBottom: `${theme.itemSpacing ?? 8}px` }}>
 <DragHandle section="experience" index={idx} />
 <div style={{ position: 'absolute', left: '-3.5px', top: '0', width: '6px', height: '6px', background: theme.accentColor, borderRadius: '50%' }} />
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
 <span style={{ fontWeight: 700, color: theme.primaryColor, fontSize: '1em' }}><EditableText field={`experience[${idx}].title`} value={item.title} style={{ fontWeight: 700, color: theme.primaryColor, fontSize: '1em' }} /></span>
 <span style={{ color: theme.accentColor, fontWeight: 600, fontSize: '9px' }}><EditableDateRange pathPrefix={`experience[${idx}]`} start={item.start_date} end={item.end_date} current={item.current} style={{ color: theme.accentColor, fontWeight: 600, fontSize: '9px' }} /></span>
 </div>
 <span style={{ display: 'block', marginBottom: '6px' }}><strong style={{ color: theme.accentColor }}><EditableText field={`experience[${idx}].company`} value={item.company} style={{ color: theme.accentColor }} /></strong>{item.location ? ` — ` : ''}{item.location && <EditableText field={`experience[${idx}].location`} value={item.location} />}<EntryActions section="experience" index={idx} /></span>
 <ul style={{ paddingLeft: '15px', listStyleType: 'circle', margin: 0 }}>
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
  // Split contact items into rows of up to 3 items per row matching Elegant_TwoColumn.html .contact-row
  const contactRows: typeof contactItems[] = [];
  for (let i = 0; i < contactItems.length; i += 3) {
    contactRows.push(contactItems.slice(i, i + 3));
  }

  return (
    <div style={{ ...paperStyle(theme), display: 'flex', flexDirection: 'column' }} className="resume-paper">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2.5px solid ${theme.accentColor}`, paddingBottom: '12px', marginBottom: `${theme.sectionSpacing ?? 18}px` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: `${theme.headerFontSize ?? 28}px`, color: theme.primaryColor, letterSpacing: '1px', marginBottom: '5px', lineHeight: 1.1 }}>
            <EditableText field="personal.name" value={data.personal?.name} style={{ fontFamily: "'Playfair Display', serif", fontSize: `${theme.headerFontSize ?? 28}px`, color: theme.primaryColor, letterSpacing: '1px', lineHeight: 1.1 }} />
          </h1>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '16px', color: theme.accentColor, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}>
            <EditableText field="personal.title" value={data.personal?.title} style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '16px', color: theme.accentColor, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '3px' }} />
          </div>

          {contactRows.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              {contactRows.map((row, rIdx) => (
                <div key={rIdx} style={{ display: 'flex', flexWrap: 'nowrap', gap: '16px', alignItems: 'center', fontSize: '10px', color: '#7f8c8d' }}>
                  {row.map((item) => (
                    <span key={item.key} style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11px', opacity: 0.85 }}>{item.icon}</span>
                      <EditableText field={item.field} value={item.value} style={{ fontSize: '10px', color: '#7f8c8d' }} />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {vis(sectionVisibility, 'photo') && (
          <div style={{ marginLeft: '20px', flexShrink: 0 }}>
            <HeadshotUpload
              size={theme.headshotSize ?? 100}
              radius={theme.headshotRadius ?? 4}
              photoUrl={data.personal?.photo_url}
              circular={theme.headshotRadius != null ? theme.headshotRadius >= 50 : false}
            />
          </div>
        )}
      </header>

      <div style={{ display: 'flex', gap: '40px', flex: 1 }}>
        <div style={{ flex: 1.3, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {sectionOrder.map((key) => { if (!vis(sectionVisibility, key) || !leftKeys.has(key)) return null; return keyElement(leftSections[key]?.(), key); })}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {sectionOrder.map((key) => { if (!vis(sectionVisibility, key) || !rightKeys.has(key)) return null; return keyElement(rightSections[key]?.(), key); })}
        </div>
      </div>
    </div>
  );
};

export default ElegantTwoColumn;
