/*

 Copyright (c) 2019 Jirvan Pty Ltd
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

import {Component, ErrorHandler, EventEmitter, Input, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
               selector: 'ji-integerfield',
               template: '<div style="margin-top: 30px; padding-left: 0; padding-right: 0;"\n' +
                         '     [formGroup]="form"\n' +
                         '     [ngStyle]="cStyle"\n' +
                         '     [ngClass]="cClass"\n' +
                         '     [pTooltip]="cTooltip" [tooltipPosition]="cTooltipPosition">\n' +
                         '    <div *ngIf="group" [formGroupName]="group" style="position: relative; padding-right: 20px">\n' +
                         '        <span class="md-inputfield">\n' +
                         '            <input *ngIf="width"  pInputText [readonly]="readonly" [formControlName]="control" integer\n' +
                         '                   style="width: 100%; text-align: right" [style.width]="width">\n' +
                         '            <input *ngIf="!width" pInputText [readonly]="readonly" [formControlName]="control" integer\n' +
                         '                   style="width: 100%; text-align: right" [ngStyle]="inputStyle">\n' +
                         '            <label>{{label}}</label>\n' +
                         '        </span>\n' +
                         '    </div>\n' +
                         '    <div *ngIf="!group" style="position: relative; padding-right: 20px">\n' +
                         '        <span class="md-inputfield">\n' +
                         '            <input *ngIf="width"  pInputText [readonly]="readonly" [formControlName]="control" integer\n' +
                         '                   style="width: 100%; text-align: right" [style.width]="width">\n' +
                         '            <input *ngIf="!width" pInputText [readonly]="readonly" [formControlName]="control" integer\n' +
                         '                   style="width: 100%; text-align: right" [ngStyle]="inputStyle">\n' +
                         '            <label>{{label}}</label>\n' +
                         '        </span>\n' +
                         '    </div>\n' +
                         '</div>',
               styles: ['div.normargin {margin-right: 0!important;}']
           })
export class JiIntegerfield {

    @Input() readonly: boolean;
    @Input() label: string = 'Color';
    @Input() cTooltip: string;
    @Input() cTooltipPosition: string;
    @Input() cStyle: any;
    @Input() cClass: string;
    @Input() width: string;
    @Input() inputStyle: any;
    @Input() form: FormGroup;
    @Input() group: string;
    @Input() control: string;

}
