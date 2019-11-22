import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { OcuprofilesService } from '../../services/ocuprofiles.service';
import { JobofferService } from '../../services/joboffer.service';
import { Observable, Subscription } from 'rxjs';
import { OcupationalProfile, JobOffer} from '../../ocupational-profile';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  statistics = [];
  isAnonymous = null;

  kaCodes = {
    GC: 'Geocomputation',
    WB: 'Web-based GI',
    GS: 'GI and Society',
    DA: 'Design and Setup of GI Systems',
    CV: 'Cartography and Visualization',
    OI: 'Organizational and Institutional Aspects',
    GD: 'Geospatial Data',
    CF: 'Conceptual Foundations',
    DM: 'Data Modeling, Storage and Exploitation',
    AM: 'Analytical Methods'
  };

  selectedOffer: JobOffer;
  @ViewChild('dangerModal') public dangerModal: ModalDirective;

  constructor(
    public jobOfferService: JobofferService,
    private route: ActivatedRoute,
    public afAuth: AngularFireAuth
  ) {
    this.afAuth.auth.onAuthStateChanged(user => {
      if (user) {
        this.isAnonymous = user.isAnonymous;
      } else {
        this.isAnonymous = true;
      }
    });
  }

  ngOnInit() {
    this.getOccuProfileId();
  }

  getOccuProfileId(): void {
    const _id = this.route.snapshot.paramMap.get('name');
    this.jobOfferService
      .getJobOfferById(_id)
      .subscribe(offer => {
        this.selectedOffer = offer;
        this.calculateStatistics();
      });
  }

  calculateStatistics() {
    if (this.selectedOffer) {
      const tempStats = {};
      let tempTotal = 0;
      this.selectedOffer.occuProf.knowledge.forEach(kn => {
        const code = kn.slice(1, 3);
        tempStats[code] !== undefined ? tempStats[code]++ : tempStats[code] = 1;
        tempTotal++;
      });
      Object.keys(tempStats).forEach(k => {
        const nameKA = k + ' - ' + this.kaCodes[k];
        this.statistics.push({ code: nameKA, value: Math.round(tempStats[k] * 100 / tempTotal) });
      });
    }
  }
}
