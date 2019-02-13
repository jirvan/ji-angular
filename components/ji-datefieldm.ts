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
import {Ji} from "../utils/ji";

@Component({
               selector: 'ji-datefield',
               template: '<div style="margin-top: 30px; padding-left: 0; padding-right: 0;"\n' +
                         '     [ngStyle]="cStyle"\n' +
                         '     [ngClass]="cClass">\n' +
                         '    <span class="md-inputfield">\n' +
                         '        <p-calendar [dateFormat]="dateFormat" [inputStyle]="inputStyle" [(ngModel)]="dateModel"></p-calendar>\n' +
                         '        <label>{{label}}</label>\n' +
                         '    </span>\n' +
                         '</div>'
           })
export class JiDatefieldm {

    @Input() label: string = 'Date';
    @Input() cStyle: any;
    @Input() cClass: string;
    @Input() inputStyle: any = {width: '90px'};
    @Input() dateFormat: string = 'dd-M-yy';

    private _cModel?: string;
    _dateModel?: Date;

    @Input()
    get cModel() {
        return this._cModel;
    }

    @Output() cModelChange = new EventEmitter<string>();

    set cModel(val) {
        this._cModel = val;
        this._dateModel = this._cModel ? new Date(this._cModel) : undefined;
        this.cModelChange.emit(this._cModel);
    }

    get dateModel(): Date | undefined {
        return this._dateModel;
    }

    set dateModel(val: Date | undefined) {
        this._dateModel = val;
        this._cModel = Ji.toDateString(val);
        this.cModelChange.emit(this._cModel);
    }

}
