// Ported from OpenResume (https://github.com/xitanggg/open-resume)
// MIT License - see https://github.com/xitanggg/open-resume/blob/main/LICENSE

export interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  hasEOL: boolean;
}
export type TextItems = TextItem[];

export type Line = TextItem[];
export type Lines = Line[];

export type ResumeSectionToLines = { [sectionName: string]: Lines };
export type Subsections = Lines[];

type FeatureScore = -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4;
type ReturnMatchingTextOnly = boolean;
export type FeatureSet =
  | [(item: TextItem) => boolean, FeatureScore]
  | [
      (item: TextItem) => RegExpMatchArray | null,
      FeatureScore,
      ReturnMatchingTextOnly
    ];

export interface TextScore {
  text: string;
  score: number;
  match: boolean;
}
export type TextScores = TextScore[];

// OpenResume internal resume types (before mapping to OfferPath ResumeData)
export interface ORProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  url: string;
  summary: string;
}

export interface ORWorkExperience {
  company: string;
  jobTitle: string;
  date: string;
  descriptions: string[];
}

export interface OREducation {
  school: string;
  degree: string;
  gpa: string;
  date: string;
  descriptions: string[];
}

export interface ORProject {
  project: string;
  date: string;
  descriptions: string[];
}

export interface ORSkills {
  featuredSkills: { skill: string }[];
  descriptions: string[];
}

export interface ORResume {
  profile: ORProfile;
  educations: OREducation[];
  workExperiences: ORWorkExperience[];
  projects: ORProject[];
  skills: ORSkills;
}
