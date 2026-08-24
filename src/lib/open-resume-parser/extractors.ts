// Ported from OpenResume (https://github.com/xitanggg/open-resume)
// MIT License

import type {
  TextItem,
  FeatureSet,
  ResumeSectionToLines,
  ORProfile,
  ORWorkExperience,
  OREducation,
  ORProject,
  ORSkills,
  ORResume,
} from "./types";
import {
  isBold,
  hasNumber,
  hasComma,
  hasLetter,
  hasLetterAndIsAllUpperCase,
  DATE_FEATURE_SETS,
  getHasText,
  getTextWithHighestFeatureScore,
  getSectionLinesByKeywords,
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
  divideSectionIntoSubsections,
} from "./helpers";

// ── Profile Extraction ──────────────────────────────

const matchOnlyLetterSpaceOrPeriod = (item: TextItem) =>
  item.text.match(/^[a-zA-Z\s\.]+$/);
const matchEmail = (item: TextItem) => item.text.match(/\S+@\S+\.\S+/);
const hasAt = (item: TextItem) => item.text.includes("@");
const matchPhone = (item: TextItem) =>
  item.text.match(/\+\d{1,3}[\s.-]?\d[\d\s.-]{6,}/) ||
  item.text.match(/\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/);
const hasParenthesis = (item: TextItem) => /\([0-9]+\)/.test(item.text);
const matchCityAndState = (item: TextItem) =>
  item.text.match(/[A-Z][a-zA-Z\s]+, [A-Z]{2}\b/) ||
  item.text.match(/[A-Z][a-zA-Z\s]+, [A-Z][a-zA-Z\s]+/);
const matchUrl = (item: TextItem) => item.text.match(/\S+\.[a-z]+\/\S+/);
const matchUrlHttpFallback = (item: TextItem) =>
  item.text.match(/https?:\/\/\S+\.\S+/);
const matchUrlWwwFallback = (item: TextItem) =>
  item.text.match(/www\.\S+\.\S+/);
const hasSlash = (item: TextItem) => item.text.includes("/");
const has4OrMoreWords = (item: TextItem) => item.text.split(" ").length >= 4;

const NAME_FEATURE_SETS: FeatureSet[] = [
  [matchOnlyLetterSpaceOrPeriod, 3, true],
  [isBold, 2],
  [hasLetterAndIsAllUpperCase, 2],
  [hasAt, -4],
  [hasNumber, -4],
  [hasParenthesis, -4],
  [hasComma, -4],
  [hasSlash, -4],
  [has4OrMoreWords, -2],
];

const EMAIL_FEATURE_SETS: FeatureSet[] = [
  [matchEmail, 4, true],
  [isBold, -1],
  [hasLetterAndIsAllUpperCase, -1],
  [hasParenthesis, -4],
  [hasComma, -4],
  [hasSlash, -4],
  [has4OrMoreWords, -4],
];

const PHONE_FEATURE_SETS: FeatureSet[] = [
  [matchPhone, 4, true],
  [hasLetter, -4],
];

const LOCATION_FEATURE_SETS: FeatureSet[] = [
  [matchCityAndState, 4, true],
  [isBold, -1],
  [hasAt, -4],
  [hasParenthesis, -3],
  [hasSlash, -4],
];

const URL_FEATURE_SETS: FeatureSet[] = [
  [matchUrl, 4, true],
  [matchUrlHttpFallback, 3, true],
  [matchUrlWwwFallback, 3, true],
  [isBold, -1],
  [hasAt, -4],
  [hasParenthesis, -3],
  [hasComma, -4],
  [has4OrMoreWords, -4],
];

const SUMMARY_FEATURE_SETS: FeatureSet[] = [
  [has4OrMoreWords, 4],
  [isBold, -1],
  [hasAt, -4],
  [hasParenthesis, -3],
  [matchCityAndState, -4, false],
];

export const extractProfile = (sections: ResumeSectionToLines): { profile: ORProfile } => {
  const lines = sections["profile"] || [];
  const textItems = lines.flat();

  const [name] = getTextWithHighestFeatureScore(textItems, NAME_FEATURE_SETS);
  const [email] = getTextWithHighestFeatureScore(textItems, EMAIL_FEATURE_SETS);
  const [phone] = getTextWithHighestFeatureScore(textItems, PHONE_FEATURE_SETS);
  const [location] = getTextWithHighestFeatureScore(textItems, LOCATION_FEATURE_SETS);
  const [url] = getTextWithHighestFeatureScore(textItems, URL_FEATURE_SETS);
  const [summary] = getTextWithHighestFeatureScore(textItems, SUMMARY_FEATURE_SETS, undefined, true);

  const summaryLines = getSectionLinesByKeywords(sections, ["summary", "个人总结", "个人简介", "自我评价"]);
  const summarySection = summaryLines.flat().map((t) => t.text).join(" ");
  const objectiveLines = getSectionLinesByKeywords(sections, ["objective"]);
  const objectiveSection = objectiveLines.flat().map((t) => t.text).join(" ");

  return {
    profile: {
      name,
      email,
      phone,
      location,
      url,
      summary: summarySection || objectiveSection || summary,
    },
  };
};

// ── Work Experience Extraction ──────────────────────

const WORK_EXPERIENCE_KEYWORDS = ['work', 'experience', 'employment', 'history', 'job', '工作经历', '工作经验', '专业经历', '职业经历'];
const JOB_TITLES = ['Accountant', 'Administrator', 'Advisor', 'Agent', 'Analyst', 'Apprentice', 'Architect', 'Assistant', 'Associate', 'Auditor', 'Bartender', 'Biologist', 'Bookkeeper', 'Buyer', 'Carpenter', 'Cashier', 'CEO', 'Clerk', 'Co-op', 'Co-Founder', 'Consultant', 'Coordinator', 'CTO', 'Developer', 'Designer', 'Director', 'Driver', 'Editor', 'Electrician', 'Engineer', 'Extern', 'Founder', 'Freelancer', 'Head', 'Intern', 'Janitor', 'Journalist', 'Laborer', 'Lawyer', 'Lead', 'Manager', 'Mechanic', 'Member', 'Nurse', 'Officer', 'Operator', 'Operation', 'Photographer', 'President', 'Producer', 'Recruiter', 'Representative', 'Researcher', 'Sales', 'Server', 'Scientist', 'Specialist', 'Supervisor', 'Teacher', 'Technician', 'Trader', 'Trainee', 'Treasurer', 'Tutor', 'Vice', 'VP', 'Volunteer', 'Webmaster', 'Worker'];

const hasJobTitle = (item: TextItem) =>
  JOB_TITLES.some((jobTitle) =>
    item.text.split(/\s/).some((word) => word === jobTitle)
  );
const hasMoreThan5Words = (item: TextItem) => item.text.split(/\s/).length > 5;
const JOB_TITLE_FEATURE_SET: FeatureSet[] = [
  [hasJobTitle, 4],
  [hasNumber, -4],
  [hasMoreThan5Words, -2],
];

export const extractWorkExperience = (sections: ResumeSectionToLines): { workExperiences: ORWorkExperience[] } => {
  const workExperiences: ORWorkExperience[] = [];
  const lines = getSectionLinesByKeywords(sections, WORK_EXPERIENCE_KEYWORDS);
  const subsections = divideSectionIntoSubsections(lines);

  for (const subsectionLines of subsections) {
    const descriptionsLineIdx = getDescriptionsLineIdx(subsectionLines) ?? 2;
    const subsectionInfoTextItems = subsectionLines.slice(0, descriptionsLineIdx).flat();

    const [date] = getTextWithHighestFeatureScore(subsectionInfoTextItems, DATE_FEATURE_SETS);
    const [jobTitle] = getTextWithHighestFeatureScore(subsectionInfoTextItems, JOB_TITLE_FEATURE_SET);

    const COMPANY_FEATURE_SET: FeatureSet[] = [
      [isBold, 2],
      [getHasText(date), -4],
      [getHasText(jobTitle), -4],
    ];
    const [company] = getTextWithHighestFeatureScore(subsectionInfoTextItems, COMPANY_FEATURE_SET, false);

    const subsectionDescriptionsLines = subsectionLines.slice(descriptionsLineIdx);
    const descriptions = getBulletPointsFromLines(subsectionDescriptionsLines);

    workExperiences.push({ company, jobTitle, date, descriptions });
  }
  return { workExperiences };
};

// ── Education Extraction ────────────────────────────

const SCHOOLS = ['College', 'University', 'Institute', 'School', 'Academy', 'BASIS', 'Magnet'];
const hasSchool = (item: TextItem) =>
  SCHOOLS.some((school) => item.text.includes(school));
const DEGREES = ["Associate", "Bachelor", "Master", "PhD", "Ph."];
const hasDegree = (item: TextItem) =>
  DEGREES.some((degree) => item.text.includes(degree)) ||
  /[ABM][A-Z\.]/.test(item.text);
const matchGPA = (item: TextItem) => item.text.match(/[0-4]\.\d{1,2}/);
const matchGrade = (item: TextItem) => {
  const grade = parseFloat(item.text);
  if (Number.isFinite(grade) && grade <= 110) {
    return [String(grade)] as RegExpMatchArray;
  }
  return null;
};

const SCHOOL_FEATURE_SETS: FeatureSet[] = [
  [hasSchool, 4],
  [hasDegree, -4],
  [hasNumber, -4],
];
const DEGREE_FEATURE_SETS: FeatureSet[] = [
  [hasDegree, 4],
  [hasSchool, -4],
  [hasNumber, -3],
];
const GPA_FEATURE_SETS: FeatureSet[] = [
  [matchGPA, 4, true],
  [matchGrade, 3, true],
  [hasComma, -3],
  [hasLetter, -4],
];

export const extractEducation = (sections: ResumeSectionToLines): { educations: OREducation[] } => {
  const educations: OREducation[] = [];
  const lines = getSectionLinesByKeywords(sections, ["education", "教育背景", "教育经历", "学历"]);
  const subsections = divideSectionIntoSubsections(lines);

  for (const subsectionLines of subsections) {
    const textItems = subsectionLines.flat();
    const [school] = getTextWithHighestFeatureScore(textItems, SCHOOL_FEATURE_SETS);
    const [degree] = getTextWithHighestFeatureScore(textItems, DEGREE_FEATURE_SETS);
    const [gpa] = getTextWithHighestFeatureScore(textItems, GPA_FEATURE_SETS);
    const [date] = getTextWithHighestFeatureScore(textItems, DATE_FEATURE_SETS);

    let descriptions: string[] = [];
    const descriptionsLineIdx = getDescriptionsLineIdx(subsectionLines);
    if (descriptionsLineIdx !== undefined) {
      const descriptionsLines = subsectionLines.slice(descriptionsLineIdx);
      descriptions = getBulletPointsFromLines(descriptionsLines);
    }

    educations.push({ school, degree, gpa, date, descriptions });
  }

  if (educations.length !== 0) {
    const coursesLines = getSectionLinesByKeywords(sections, ["course"]);
    if (coursesLines.length !== 0) {
      educations[0].descriptions.push(
        "Courses: " + coursesLines.flat().map((item) => item.text).join(" ")
      );
    }
  }

  return { educations };
};

// ── Project Extraction ──────────────────────────────

export const extractProject = (sections: ResumeSectionToLines): { projects: ORProject[] } => {
  const projects: ORProject[] = [];
  const lines = getSectionLinesByKeywords(sections, ["project", "项目经历", "项目经验"]);
  const subsections = divideSectionIntoSubsections(lines);

  for (const subsectionLines of subsections) {
    const descriptionsLineIdx = getDescriptionsLineIdx(subsectionLines) ?? 1;
    const subsectionInfoTextItems = subsectionLines.slice(0, descriptionsLineIdx).flat();

    const [date] = getTextWithHighestFeatureScore(subsectionInfoTextItems, DATE_FEATURE_SETS);
    const PROJECT_FEATURE_SET: FeatureSet[] = [
      [isBold, 2],
      [getHasText(date), -4],
    ];
    const [project] = getTextWithHighestFeatureScore(subsectionInfoTextItems, PROJECT_FEATURE_SET, false);

    const descriptionsLines = subsectionLines.slice(descriptionsLineIdx);
    const descriptions = getBulletPointsFromLines(descriptionsLines);

    projects.push({ project, date, descriptions });
  }
  return { projects };
};

// ── Skills Extraction ───────────────────────────────

export const extractSkills = (sections: ResumeSectionToLines): { skills: ORSkills } => {
  const lines = getSectionLinesByKeywords(sections, ["skill", "技能特长", "专业技能", "技术技能", "核心技能", "技能"]);
  const descriptionsLineIdx = getDescriptionsLineIdx(lines) ?? 0;
  const descriptionsLines = lines.slice(descriptionsLineIdx);
  const descriptions = getBulletPointsFromLines(descriptionsLines);

  const featuredSkills: { skill: string }[] = [];
  if (descriptionsLineIdx !== 0) {
    const featuredSkillsLines = lines.slice(0, descriptionsLineIdx);
    const featuredSkillsTextItems = featuredSkillsLines
      .flat()
      .filter((item) => item.text.trim())
      .slice(0, 6);
    for (const item of featuredSkillsTextItems) {
      featuredSkills.push({ skill: item.text });
    }
  }

  return { skills: { featuredSkills, descriptions } };
};

// ── Main Extraction ─────────────────────────────────

export const extractResumeFromSections = (sections: ResumeSectionToLines): ORResume => {
  const { profile } = extractProfile(sections);
  const { educations } = extractEducation(sections);
  const { workExperiences } = extractWorkExperience(sections);
  const { projects } = extractProject(sections);
  const { skills } = extractSkills(sections);

  return { profile, educations, workExperiences, projects, skills };
};
