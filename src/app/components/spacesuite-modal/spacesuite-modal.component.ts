import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'spacesuite-modal',
  templateUrl: './spacesuite-modal.component.html',
  styleUrls: ['./spacesuite-modal.component.scss']
})
export class SpacesuiteModalComponent implements AfterViewInit {

  @ViewChild('releaseModal') basicModal: ModalDirective;

  constructor() {}

  ngAfterViewInit(): void {
    this.basicModal.show();
  }

  // close modal
  close(): void {
    this.basicModal.hide();
  }

}
