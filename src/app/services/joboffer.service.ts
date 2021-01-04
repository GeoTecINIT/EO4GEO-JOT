import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { OcupationalProfile, JobOffer } from '../ocupational-profile';
import * as firebase from 'firebase';

const collection = 'JobOffers';
const collectionPraxis = 'praxis';

@Injectable({
  providedIn: 'root'
})
export class JobofferService {
  private db: AngularFirestore;
  constructor(db: AngularFirestore) {
    this.db = db;
  }

  subscribeToJobOffers(): Observable<JobOffer[]> {
    return this.db.collection<JobOffer>(collection).valueChanges();
  }

  getJobOfferById(jobOfferId: string): Observable<JobOffer> {
    return this.db
      .collection(collection)
      .doc<JobOffer>(jobOfferId)
      .valueChanges();
  }

  addNewJobOffer(newJobOffer: JobOffer) {
    const id = this.db.createId();
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    newJobOffer.updatedAt = timestamp;
    newJobOffer.createdAt = timestamp;
    newJobOffer._id = id;
    this.db
      .collection(collection)
      .doc(id)
      .set(newJobOffer);
    if (newJobOffer.inPraxis) {
      this.db
        .collection(collectionPraxis)
        .doc<JobOffer>(id)
        .set(newJobOffer);
    }
  }

  removeJobOffer(jobOfferId: string) {
    this.db
      .collection(collection)
      .doc(jobOfferId)
      .delete();
  }

  updateJobOffer(jobOfferId: string, updatedJobOffer: JobOffer) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    updatedJobOffer.updatedAt = timestamp;
    this.db
      .collection(collection)
      .doc<JobOffer>(jobOfferId)
      .update(updatedJobOffer);
    if (updatedJobOffer.inPraxis) {
      this.db
        .collection(collectionPraxis)
        .doc<JobOffer>(jobOfferId)
        .update(updatedJobOffer);
    }
  }
}
