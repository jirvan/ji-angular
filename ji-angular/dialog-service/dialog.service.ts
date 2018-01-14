/*

 Copyright (c) 2018 Jirvan Pty Ltd
 All rights reserved.

 Redistribution and use in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.
 * Neither the name of Jirvan Pty Ltd nor the names of its contributors
 may be used to endorse or promote products derived from this software
 without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 */

import {Component, Injectable, Input, ViewEncapsulation} from '@angular/core';

import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalRef} from "@ng-bootstrap/ng-bootstrap/modal/modal-ref";

@Injectable()
export class JiDialogService {

  constructor(private modalService: NgbModal) { }

  showError(errorMessage: string): NgbModalRef {
    const modalRef = this.modalService.open(ErrorDialogContent);
    modalRef.componentInstance.errorMessage = errorMessage;
    return modalRef;
  }

}

@Component({
             selector: 'ngbd-modal-content',
             template: `
               <div class="modal-header text-danger">
                 <h4 class="modal-title">Error</h4>
                 <!--<button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">-->
                   <!--<span aria-hidden="true">&times;</span>-->
                 <!--</button>-->
               </div>
               <div class="modal-body">
                 <p>{{errorMessage}}</p>
               </div>
               <div class="modal-footer">
                 <button type="button" class="btn btn-outline-danger" (click)="activeModal.close('Close click')">Close</button>
               </div>
             `,
             encapsulation: ViewEncapsulation.None,
             styles: ['.modal-content { border: 1px solid rgba(255, 0, 0, 0.2) }']
           })
export class ErrorDialogContent {
  @Input() errorMessage;

  constructor(public activeModal: NgbActiveModal) {}
}
