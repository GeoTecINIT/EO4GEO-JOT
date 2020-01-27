import { Field } from './services/fields.service';
import { Language } from './services/language.service';

export interface Competence {
  uri?: String;
  skillType?: String;
  reuseLevel?: String;
  preferredLabel: String;
  description?: String;
  altLabels?: String[];
}

export class OcupationalProfile extends Object {
  constructor(
    public _id: string,
    public userId: string,
    public orgId: string,
    public orgName: string,
    public title: string,
    public description: string,
    public fields: Field[],
    public eqf: number,
    public knowledge: string[],
    public skills: string[],
    public customSkills: string[],
    public customCompetences: string[],
    public competences: Competence[],
    public isPublic: boolean = false
  ) {
    super();
  }
}

export class JobOffer extends Object {
  constructor(
    public _id: string,
    public userId: string,
    public orgId: string,
    public orgName: string,
    public occuProf: OcupationalProfile,
    public languages: Language[],
    public location: string,
    public dedication: string,
    public typeContract: string,
    public salaryMin: number,
    public salaryMax: number,
    public additionalQuestions: string[],
    public motivationLetter: boolean,
    public isPublic: boolean = false
  ) {
    super();
  }
}
