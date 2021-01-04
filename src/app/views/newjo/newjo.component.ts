import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { OcupationalProfile, Competence, JobOffer } from '../../ocupational-profile';
import * as bok from '@eo4geo/bok-dataviz';
import { OcuprofilesService } from '../../services/ocuprofiles.service';
import { Organization, OrganizationService } from '../../services/organization.service';
import { JobofferService } from '../../services/joboffer.service';
import { FieldsService, Field } from '../../services/fields.service';
import { LanguageService } from '../../services/language.service';
import { EscoCompetenceService } from '../../services/esco-competence.service';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { User, UserService } from '../../services/user.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-newjo',
  templateUrl: './newjo.component.html',
  styleUrls: ['./newjo.component.scss']
})
export class NewjoComponent implements OnInit {

  competences = [];
  filteredCompetences = [];
  fullcompetences = [];

  // model = new OcupationalProfile('', '', '', '', null, 1, [], [], [], [], []);
  options = { year: 'numeric', month: 'numeric', day: 'numeric' };

  // tslint:disable-next-line:max-line-length
  model = new JobOffer('', '', '', '', '', new OcupationalProfile('', '', '', '', '', '', '', [], 1, [], [], [], [], [], '', false, null, null), [], '', '', '', 0, 0, [], false, false, [], [], 0, new Date().toDateString(), null, null, '', '', false, '', '');

  public value: string[];
  public current: string;

  selectedProfile: OcupationalProfile;
  selectedProfiles: string[] = [];

  allProfiles: OcupationalProfile[];

  _id: string;
  mode: string;
  title: string;

  selectedNodes = [];
  hasResults = false;
  limitSearchFrom = 0;
  limitSearchTo = 10;

  closeResult = '';

  observer: MutationObserver;
  lastBoKTitle = 'GIST';

  searchInputField = '';
  currentConcept = 'GIST';

  isfullESCOcompetences = false;
  isShowingSkillsTip = false;

  associatedSkillsToDelete = 0;
  nameCodeToDelete = '';

  configFields = {
    displayKey: 'concatName', // if objects array passed which key to be displayed defaults to description
    search: true, // true/false for the search functionlity defaults to false,
    height: '200px', // height of the list so that if there are more no of items it can show a scroll defaults to auto.
    placeholder: 'Select Field', // text to be displayed when no item is selected defaults to Select,
    customComparator: () => { }, // a custom function to sort the items. default is undefined and Array.sort() will be used
    noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
    searchPlaceholder: 'Search Field', // label thats displayed in search input,
    searchOnKey: 'concatName' // key on which search should be performed. if undefined this will be extensive search on all keys
  };

  configCompetences = {
    displayKey: 'preferredLabel', // if objects array passed which key to be displayed defaults to description
    search: true, // true/false for the search functionlity defaults to false,
    height: '200px', // height of the list so that if there are more no of items it can show a scroll defaults to auto.
    placeholder: 'Select transversal skill', // text to be displayed when no item is selected defaults to Select,
    customComparator: () => { }, // a custom function to sort the items. default is undefined and Array.sort() will be used
    moreText: 'transversal skills more', // text to be displayed whenmore than one items are selected like Option 1 + 5 more
    noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
    searchPlaceholder: 'Search transversal skills', // label thats displayed in search input,
    searchOnKey: 'preferredLabel' // key on which search should be performed. if undefined this will be extensive search on all keys
  };

  configfullCompetences = {
    displayKey: 'preferredLabel', // if objects array passed which key to be displayed defaults to description
    search: true, // true/false for the search functionlity defaults to false,
    height: '200px', // height of the list so that if there are more no of items it can show a scroll defaults to auto.
    placeholder: 'Select transversal skill', // text to be displayed when no item is selected defaults to Select,
    customComparator: () => { }, // a custom function to sort the items. default is undefined and Array.sort() will be used
    moreText: 'transversal skills more', // text to be displayed whenmore than one items are selected like Option 1 + 5 more
    noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
    searchPlaceholder: 'Search transversal skills', // label thats displayed in search input,
    searchOnKey: 'preferredLabel' // key on which search should be performed. if undefined this will be extensive search on all keys
  };

  configLanguage = {
    displayKey: 'name', // if objects array passed which key to be displayed defaults to description
    search: true, // true/false for the search functionlity defaults to false,
    height: '200px', // height of the list so that if there are more no of items it can show a scroll defaults to auto.
    placeholder: 'Select Language', // text to be displayed when no item is selected defaults to Select,
    customComparator: () => { }, // a custom function to sort the items. default is undefined and Array.sort() will be used
    noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
    searchPlaceholder: 'Search Language', // label thats displayed in search input,
    searchOnKey: 'name' // key on which search should be performed. if undefined this will be extensive search on all keys
  };


  taxonomy = [
    {
      name: 'Remember',
      content: ['choose', 'define', 'find', 'identify', 'list', 'locate', 'name', 'recognize', 'relate', 'remember', 'select', 'state', 'write']
    },
    {
      name: 'Understand',
      content: [
        'cite', 'classify', 'compare', 'contrast', 'deliver', 'demonstrate', 'discuss', 'estimate', 'explain', 'illustrate', 'indicate',
        'interpret', 'outline', 'relate', 'report', 'review', 'understand'
      ]
    },
    {
      name: 'Apply',
      content: [
        'apply', 'build', 'calculate', 'choose', 'classify', 'construct', 'correlate', 'demonstrate', 'develop', 'identify', 'illustrate', 'implement', 'interpret',
        'model', 'organise', 'perform', 'plan', 'relate', 'represent', 'select', 'solve', 'teach', 'use'
      ]
    },
    {
      name: 'Analyze',
      content: [
        'analyse', 'arrange', 'choose', 'classify', 'compare', 'differentiate', 'distinguish', 'examine', 'find', 'install', 'list',
        'order', 'prioritize', 'query', 'research', 'select'
      ]
    },
    {
      name: 'Evaluate',
      content: [
        'assess', 'check', 'choose', 'compare', 'decide', 'defend', 'determine', 'estimate', 'evaluate', 'explain', 'interpret', 'judge', 'justify',
        'measure', 'prioritize', 'recommend', 'select', 'test', 'validate'
      ]
    },
    {
      name: 'Create',
      content: [
        'add to', 'build', 'change', 'choose', 'compile', 'construct', 'convert', 'create', 'design', 'develop', 'devise', 'discuss', 'estimate',
        'manage', 'model', 'modify', 'plan', 'process', 'produce', 'propose', 'revise', 'solve', 'test', 'transform'
      ]
    },
  ];

  modalRef: BsModalRef;

  @ViewChild('textBoK') textBoK: ElementRef;

  userOrgs: Organization[] = [];
  saveOrg: Organization;
  currentUser: User;

  notFoundTool = '';
  notFoundData = '';

  typeOfContract = ['Fixed', 'Internship', 'Scholarship', 'Temporal'];
  durationContract = ['<1 month', '1 - 3 month', '3 - 6 month', '> 6 month'];

  currency = [{ cod: '$', name: 'USD' }, { cod: '€', name: 'EUR' }, { cod: '£', name: 'GBP' }];

  userDivisions: string[] = [];
  saveDiv = '';

  minDate: Date;

  constructor(
    public occuprofilesService: OcuprofilesService,
    private organizationService: OrganizationService,
    private userService: UserService,
    private jobOfferService: JobofferService,
    public fieldsService: FieldsService,
    public languageService: LanguageService,
    public escoService: EscoCompetenceService,
    private route: ActivatedRoute,
    private afAuth: AngularFireAuth,
    private modalService: BsModalService
  ) {
    this.competences = this.escoService.basicCompetences;
    this.filteredCompetences = this.competences;

    this.afAuth.auth.onAuthStateChanged(user => {
      if (user) {
        this.userService.getUserById(user.uid).subscribe(userDB => {
          this.currentUser = new User(userDB);
          if (this.currentUser.organizations && this.currentUser.organizations.length > 0) {
            this.currentUser.organizations.forEach(orgId => {
              this.organizationService.getOrganizationById(orgId).subscribe(org => {
                if (org) {
                  this.userOrgs.push(org);
                  this.saveOrg = this.userOrgs[0];
                  this.setOrganization();
                  this.loadDivisions();
                }
              });
            });
            this.filterOP();
          }
        });
      }

      this.minDate = new Date();
      this.minDate.setDate(this.minDate.getDate());
    });
  }

  ngOnInit() {
    bok.visualizeBOKData('#bubbles', '#textBoK');
    this.getMode();

    this.observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if ((<any>mutation.target).children[1].innerText !== this.lastBoKTitle) {
          this.lastBoKTitle = (<any>mutation.target).children[1].innerText;
          this.hasResults = false;
        }
      });
    });
    const config = { attributes: true, childList: true, characterData: true };

    this.observer.observe(this.textBoK.nativeElement, config);
  }

  filterOP() {
    this.allProfiles = [];
    this.occuprofilesService
      .subscribeToOccupationalProfiles()
      .subscribe(ops => {
        ops.forEach(op => {
          // user can use this OP
          if (op.isPublic || this.currentUser.organizations.indexOf(op.orgId) > -1) {
            op.title = op.title + ' ( ' + op.orgName + ' ) ';
            this.allProfiles.push(op);
          }
        });
      });
  }

  addBokKnowledge() {
    this.associatedSkillsToDelete = 0;
    const divs = this.textBoK.nativeElement.getElementsByTagName('div');
    if (divs['bokskills'] != null) {
      const shortCode = this.textBoK.nativeElement.getElementsByTagName('h4')[0].innerText.split(' ')[0];
      const as = divs['bokskills'].getElementsByTagName('a');
      for (const skill of as) {
        if (!this.model.occuProf.skills.includes(shortCode + ' ' + skill.innerText)) {
          this.model.occuProf.skills.push(shortCode + ' ' + skill.innerText);
          this.associatedSkillsToDelete++;
        }
      }
    }
    const concept = this.textBoK.nativeElement.getElementsByTagName('h4')[0]
      .textContent;
    if (!this.model.occuProf.knowledge.includes(concept)) {
      this.model.occuProf.knowledge.push(concept);
    }
    console.log('added knowledge');
    this.isShowingSkillsTip = true;
  }

  removeCompetence(name: any, array: any[]) {
    if (typeof (name) === 'string') { // for skills
      this.nameCodeToDelete = '';
      array.forEach((item, index) => {
        if (item === name) {
          array.splice(index, 1);
          array = [...array];
          this.nameCodeToDelete = name.split(']')[0];
        }
      });
      const skillsFiltered = [];
      this.model.occuProf.skills.forEach((sk, i) => {
        //  console.log('code skill' + sk.split(']')[0] + '=' + this.nameCodeToDelete);
        if (sk.split(']')[0] === this.nameCodeToDelete) { // There is a knowledge that starts with same code, don't include it
          skillsFiltered.push(sk);
        }
      });
      this.associatedSkillsToDelete = skillsFiltered.length;
    } else {
      if (name.preferredLabel) {
        // for transversal skills
        array.forEach((item, index) => {
          if (item.preferredLabel === name.preferredLabel) {
            array.splice(index, 1);
            array = [...array];
            this.competences = [...this.competences];
            this.model.occuProf.competences = [...this.model.occuProf.competences];
          }
        });
      } else if (name.name) {
        // for languages
        array.forEach((item, index) => {
          if (item.name === name.name) {
            array.splice(index, 1);
            array = [...array];
            this.model.languages = [...this.model.languages];
          }
        });
      }
    }
  }

  removeField(f: Field) {
    this.model.occuProf.fields.forEach((item, index) => {
      if (item === f) {
        this.model.occuProf.fields.splice(index, 1);
      }
    });
    this.model.occuProf.fields = [...this.model.occuProf.fields];
  }

  removeDataTool(remove: any, fromArray: any[]) {
    fromArray.forEach((item, index) => {
      if (item === remove) {
        fromArray.splice(index, 1);
      }
    });
    fromArray = [...fromArray];
    this.model.dataRequired = [...this.model.dataRequired];
    this.model.toolsRequired = [...this.model.toolsRequired];
  }

  searchSelect(event, model) {
    // If no search results, add new custom item
    if (event.items.length === 0) {
      if (model === 'tool') {
        this.notFoundTool = event.term;
      } else if (model === 'data') {
        this.notFoundData = event.term;
      }
    }
  }

  addCustomData() {
    this.model.dataRequired = [...this.model.dataRequired, { name: this.notFoundData, custom: true }];
    this.notFoundTool = '';
    this.notFoundData = '';
  }

  addCustomTool() {
    this.model.toolsRequired = [...this.model.toolsRequired, { name: this.notFoundTool, custom: true }];
    this.notFoundTool = '';
    this.notFoundData = '';
  }

  removeSkillsAssociated() {
    const skillsFiltered = [];
    this.model.occuProf.skills.forEach((sk, i) => {
      // console.log('code skill' + sk.split(']')[0] + '=' + this.nameCodeToDelete);
      if (sk.split(']')[0] !== this.nameCodeToDelete) { // There is a knowledge that starts with same code, don't include it
        skillsFiltered.push(sk);
      }
    });
    this.model.occuProf.skills = skillsFiltered;
  }

  saveOccuProfile() {
    this.model.userId = this.afAuth.auth.currentUser.uid;
    this.model.orgId = this.saveOrg._id;
    this.model.orgName = this.saveOrg.name;
    this.model.isPublic = this.model.isPublic;
    this.model.division = this.saveDiv;
    this.model.lastModified = new Date().toDateString();
    if (this.mode === 'copy') {
      this.jobOfferService.updateJobOffer(this._id, this.model);
    } else {
      this.jobOfferService.addNewJobOffer(this.model);
    }
  }

  getMode(): void {
    this.mode = this.route.snapshot.paramMap.get('mode');
    if (this.mode === 'duplicate' || this.mode === 'copy') {
      if (this.mode === 'copy') {
        this.title = 'Edit Job Offer';
      } else {
        this.title = 'Duplicate Job Offer';

      }
      this.getJobOfferId();
      this.fillForm();
    } else {
      this.title = 'Add New Job Offer';
    }
  }

  getJobOfferId(): void {
    this._id = this.route.snapshot.paramMap.get('name');
    this.jobOfferService
      .getJobOfferById(this._id)
      .subscribe(job => (this.model = job));
  }

  fillForm(): void {
    this.jobOfferService
      .getJobOfferById(this._id)
      .subscribe(job => (this.model = job));
  }

  fillFormWithOP() {
    // allow merging multiple occupational profiles
    this.model.occuProf = this.occuprofilesService.mergeOccuProfiles(this.model.occuProf, this.selectedProfile);
    this.selectedProfiles.push(this.selectedProfile.title);
    this.model.occuProf.fields = [...this.model.occuProf.fields];
    this.model.occuProf.competences = [...this.model.occuProf.competences];
  }

  setOrganization() {
    // iterate orgs to select right one
    if (this.userOrgs.length > 0 && this.currentUser && this.model) {
      this.userOrgs.forEach(o => {
        if (o._id === this.model.orgId) {
          this.saveOrg = o;
          this.loadDivisions();
        }
      });
    }
  }

  searchInBok(text: string) {
    if (text === '' || text === ' ') {
      this.cleanResults();
    } else {
      this.selectedNodes = bok.searchInBoK(text);
      this.hasResults = true;
      this.currentConcept = '';
      this.cleanTip();
      this.limitSearchFrom = 0;
      this.limitSearchTo = 10;
    }
  }

  navigateToConcept(conceptName) {
    bok.browseToConcept(conceptName);
    this.currentConcept = conceptName;
    this.hasResults = false;
    this.cleanTip();
  }

  cleanResults() {
    this.searchInputField = '';
    bok.searchInBoK('');
    this.navigateToConcept('GIST');
  }

  cleanTip() {
    this.isShowingSkillsTip = false;
  }

  incrementLimit() {
    this.limitSearchTo = this.limitSearchTo + 10;
    this.limitSearchFrom = this.limitSearchFrom + 10;
  }

  decrementLimit() {
    this.limitSearchTo = this.limitSearchTo - 10;
    this.limitSearchFrom = this.limitSearchFrom - 10;
  }

  addExtraSkill(skill) {
    this.model.occuProf.skills.push(skill);
    this.model.occuProf.customSkills.push(skill);
  }

  // Add custom competence to model to force updating component, and to competences lists to find it again if removed
  addExtraCompetence(comp) {
    this.model.occuProf.competences = [...this.model.occuProf.competences, { preferredLabel: comp, reuseLevel: 'custom' }];
    this.competences = [...this.competences, { preferredLabel: comp, reuseLevel: 'custom' }];
    this.model.occuProf.customCompetences.push(comp);
    this.escoService.allcompetences = [...this.escoService.allcompetences, { preferredLabel: comp, reuseLevel: 'custom' }];
    this.escoService.basicCompetences = [...this.escoService.basicCompetences, { preferredLabel: comp, reuseLevel: 'custom', uri: null }];
    // console.log('add compr:' + comp);
  }

  fullListESCO() {
    /* this.escoService.allcompetences.forEach(com => {
      if (com.preferredLabel == null) {
       console.log('ERROR ' + com.uri);
      }
     });
     */
    this.isfullESCOcompetences = !this.isfullESCOcompetences;
  }

  // custom search to match term also in altLabels
  customSearchFn(term: string, item: Competence) {
    let found = false;
    term = term.toLocaleLowerCase();
    if (item.preferredLabel.toLocaleLowerCase().indexOf(term) > -1) {
      found = true;
    }
    if (item.altLabels && item.altLabels.length > 0) {
      item.altLabels.forEach((alt) => {
        if (alt.toLocaleLowerCase().indexOf(term) > -1) {
          found = true;
        }
      });
    }
    return found;
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  loadDivisions() {
    this.userDivisions = this.saveOrg.divisions ? this.saveOrg.divisions : [];
    this.saveDiv = this.model ? this.model.division ? this.model.division : '' : '';
  }

}
