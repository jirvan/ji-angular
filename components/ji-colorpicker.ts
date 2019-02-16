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
               selector: 'ji-colorpicker',
               template: '<div style="margin-top: 30px; margin-right: 20px; padding-left: 0; padding-right: 0"\n' +
                         '     [formGroup]="form"\n' +
                         '     [style.width]="width"\n' +
                         '     [ngStyle]="cStyle"\n' +
                         '     [ngClass]="cClass">\n' +
                         '    <div style="position: relative; padding-right: 20px">\n' +
                         '       <span class="md-inputfield">\n' +
                         '           <input pInputText style="width: 100%" [ngStyle]="inputStyle" [formControlName]="control">\n' +
                         '           <label>{{label}}</label>\n' +
                         '       </span>\n' +
                         '        <div style="position: absolute; right: 0; bottom: 0; height: 100%; width: 20px;\n' +
                         '             border: #ffffff solid 1px;\n' +
                         '             display: inline" \n' +
                         '             [ngStyle]="{\'background-color\': form.value[control], \'border-color\': (isWhite(form.value[control]) ? \'#bcbcbc\' : form.value[control])}">&nbsp;\n' +
                         '        </div>\n' +
                         '    </div>\n' +
                         '</div>',
               styles: ['div.normargin {margin-right: 0!important;}']
           })
export class JiColorpicker {

    @Input() label: string = 'Color';
    @Input() cStyle: any;
    @Input() cClass: string;
    @Input() width: string = '140px';
    @Input() inputStyle: any;
    @Input() form: FormGroup;
    @Input() control: string;

    isWhite(color: string): boolean {
        return !!color && color.toLowerCase() === '#ffffff';
    }

}
