import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { NgForOf } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { JobOffer } from '../../ocupational-profile';
import { JobofferService } from '../../services/joboffer.service';
import { FormControl } from '@angular/forms';
import { ModalDirective, ModalOptions } from 'ngx-bootstrap/modal';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService, User } from '../../services/user.service';
import { OrganizationService } from '../../services/organization.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  jobOffers: JobOffer[];
  advancedSearch = false;
  filteredJobOffers: any[];
  searchText: string;
  knowledgeFilter: Boolean = true;
  skillFilter: Boolean = true;
  competencesFilter: Boolean = true;
  isAnonymous = null;
  currentUser: User = new User();
  sortNameAsc = true;
  sortOrgAsc = true;
  sortUpdAsc = true;
  sortedBy = 'lastUpdated';
  public paginationLimitFrom = 0;
  public paginationLimitTo = 6;
  public LIMIT_PER_PAGE = 6;
  public currentPage = 0;
  showOnlyAuthor = -1;

  @ViewChild('dangerModal') public dangerModal: ModalDirective;
  @ViewChild('releaseNotesModal') public releaseNotesModal: any;

  constructor(private jobOfferService: JobofferService,
    private userService: UserService,
    public organizationService: OrganizationService,
    private route: ActivatedRoute,
    public afAuth: AngularFireAuth) {
    this.afAuth.auth.onAuthStateChanged(user => {
      if (user) {
        this.isAnonymous = user.isAnonymous;
        this.userService.getUserById(user.uid).subscribe(userDB => {
          this.currentUser = new User(userDB);

          this.jobOfferService
            .subscribeToJobOffers()
            .subscribe(jobOffers => {
              this.jobOffers = [];
              jobOffers.forEach(jo => {
                if (jo.isPublic) {
                  this.jobOffers.push(jo);
                } else if (this.currentUser && this.currentUser.organizations && this.currentUser.organizations.indexOf(jo.orgId) > -1) {
                  this.jobOffers.push(jo);
                }
              });
              this.filteredJobOffers = this.jobOffers;
              this.sortBy('lastUpdated');
            });
        });
      } else {
        this.isAnonymous = true;
      }
      this.jobOfferService
        .subscribeToJobOffers()
        .subscribe(jobOffers => {
          this.jobOffers = [];
          jobOffers.forEach(jo => {
            if (jo.isPublic) {
              this.jobOffers.push(jo);
            }
          });
          this.filteredJobOffers = this.jobOffers;
          this.sortBy('lastUpdated');
        });
    });
  }

  ngOnInit() {
    if (this.route.snapshot.url[0].path === 'release-notes') {
      const config: ModalOptions = { backdrop: true, keyboard: true };
      this.releaseNotesModal.basicModal.config = config;
      this.releaseNotesModal.basicModal.show({});
    }
  }

  removeJobOffer(id: string) {
    this.jobOfferService.removeJobOffer(id);
  }

  filter() {
    this.paginationLimitFrom = 0;
    this.paginationLimitTo = this.LIMIT_PER_PAGE;
    this.currentPage = 0;
    const search = this.searchText.toLowerCase();
    this.filteredJobOffers = [];
    this.filteredJobOffers = this.jobOffers.filter(
      it =>
        it.occuProf.title.toLowerCase().includes(search) ||
        it.occuProf.description.toLowerCase().includes(search)
    );
    if (this.advancedSearch) {
      this.applyFilters();
    }
    this.showOnlyAuthor = -1;
  }

  applyFilters() {
    this.jobOffers.forEach(jo => {
      if (this.knowledgeFilter) {
        jo.occuProf.knowledge.forEach(know => {
          if (know.toLowerCase().includes(this.searchText.toLowerCase())) {
            if (this.filteredJobOffers.indexOf(jo) === -1) {
              this.filteredJobOffers.push(jo);
            }
          }
        });
      }
      if (this.skillFilter) {
        jo.occuProf.skills.forEach(ski => {
          if (ski.toLowerCase().includes(this.searchText.toLowerCase())) {
            if (this.filteredJobOffers.indexOf(jo) === -1) {
              this.filteredJobOffers.push(jo);
            }
          }
        });
      }
      if (this.competencesFilter) {
        jo.occuProf.competences.forEach(comp => {
          if (comp.preferredLabel.toLowerCase().includes(this.searchText.toLowerCase())) {
            if (this.filteredJobOffers.indexOf(jo) === -1) {
              this.filteredJobOffers.push(jo);
            }
          }
        });
      }
    });
  }

  sortBy(attr) {
    this.paginationLimitFrom = 0;
    this.paginationLimitTo = this.LIMIT_PER_PAGE;
    this.currentPage = 0;
    switch (attr) {
      case 'name':
        this.sortNameAsc = !this.sortNameAsc;
        this.sortedBy = 'name';
        // tslint:disable-next-line:max-line-length
        this.filteredJobOffers.sort((a, b) => (a.occuProf.title.toLowerCase() > b.occuProf.title.toLowerCase()) ? this.sortNameAsc ? 1 : -1 : this.sortNameAsc ? -1 : 1);
        break;
      case 'lastUpdated':
        this.sortUpdAsc = !this.sortUpdAsc;
        this.sortedBy = 'lastUpdated';
        this.filteredJobOffers.sort((a, b) => (a.updatedAt > b.updatedAt) ? this.sortUpdAsc ? 1 : -1 : this.sortUpdAsc ? -1 : 1);
        break;
      case 'organization':
        this.sortOrgAsc = !this.sortOrgAsc;
        this.sortedBy = 'organization';
        // tslint:disable-next-line:max-line-length
        this.filteredJobOffers.sort((a, b) => (a.orgName.toLowerCase() > b.orgName.toLowerCase()) ? this.sortOrgAsc ? 1 : -1 : this.sortOrgAsc ? -1 : 1);
        break;
    }
  }
  range(size, startAt = 0) {
    size = Math.ceil(size);
    if (size === 0) {
      size = 1;
    }
    return [...Array(size).keys()].map(i => i + startAt);
  }

  nextPage() {
    if (this.currentPage + 1 < this.filteredJobOffers.length / this.LIMIT_PER_PAGE) {
      this.paginationLimitFrom = this.paginationLimitFrom + this.LIMIT_PER_PAGE;
      this.paginationLimitTo = this.paginationLimitTo + this.LIMIT_PER_PAGE;
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.paginationLimitFrom = this.paginationLimitFrom - this.LIMIT_PER_PAGE;
      this.paginationLimitTo = this.paginationLimitTo - this.LIMIT_PER_PAGE;
      this.currentPage--;
    }
  }

  filterByAuthor(author) {
    this.filteredJobOffers = [];
    this.paginationLimitFrom = 0;
    this.paginationLimitTo = 6;
    this.currentPage = 0;
    this.searchText = '';
    if (author === -1) { // all
      this.filteredJobOffers = this.jobOffers;
    } else if (author === 0) { // mine
      this.filteredJobOffers = this.jobOffers.filter(
        it =>
          it.userId === this.currentUser._id
      );
    } else if (author === 1) { // my orgs
      this.filteredJobOffers = this.jobOffers.filter(
        it =>
          this.currentUser.organizations.includes(it.orgId)
      );
    }
  }
}
