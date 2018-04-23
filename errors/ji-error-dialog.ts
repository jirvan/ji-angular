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

import {Component, Input, OnInit} from '@angular/core';
import {JiErrorHandler, StandardizedError} from './ji-errorhander';

@Component({
               selector: 'ji-error-dialog',
               template: `
                   <div>
                       <p-dialog [(visible)]="display" modal="modal" [closable]="false"
                                 [resizable]="true" [draggable]="true" [responsive]="true" [breakpoint]="1000" [minY]="20">
                           <p-header>
                               <div (dblclick)="toggleShowAdditionalInfo()">
                                   {{title}}
                               </div>
                           </p-header>
                           <div style="padding-bottom: 20px; min-width: 300px">
                               {{message}}
                           </div>
                           <pre *ngIf="showAdditionalInfo">{{additionalInfo}}</pre>
                           <p-footer>
                               <button type="button" pButton icon="fa-check" (click)="display=false" label="OK"></button>
                           </p-footer>
                       </p-dialog>
                   </div>
               `
           })
export class JiErrorDialog implements OnInit {

    @Input() errorHandlerService: JiErrorHandler;

    title: string = null;
    message: string = null;
    additionalInfo: string = null;
    showAdditionalInfo: boolean = false;

    display: boolean = false;

    ngOnInit(): void {
        this.errorHandlerService.errorDialog = this;
    }

    showDialog(error: StandardizedError) {
        if (error) {
            this.title = error.title ? error.title : 'Error';
            this.message = error.message;
            this.additionalInfo = error.additionalInfo;
        } else {
            this.title = 'Error';
            this.message = null;
            this.additionalInfo = null;
        }
        this.display = true;
    }

    toggleShowAdditionalInfo() {
        this.showAdditionalInfo = !this.showAdditionalInfo;
    }

}
