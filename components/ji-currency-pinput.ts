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

import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';

@Component({
               selector: 'ji-currency-pinput',
               template: `
                   <div style="position: relative" [ngStyle]="style" [ngClass]="class">
                       <div #displayField [style.color]="model ? undefined : '#898989'" [style.opacity]="disabled ? 0.35 : 1.0"
                            style="position: absolute; bottom: 0; border-bottom: solid 1px #bdbdbd;
                                   padding-right: 2px; text-align: right"
                            [style.width.px]="width">
                           {{model ? (model | currency:undefined:'symbol':digitsInfo) : ''}}
                       </div>
                            <span class="md-inputfield">
                                <input pInputText [disabled]="disabled" [(ngModel)]="model"[style.width.px]="width" style="opacity: 0; padding-top: 2px; text-align: right"
                                  (focus)="onInputFocus($event)" (focusout)="onInputFocusOut($event)"
                                  (keypress)="filterChars($event)" (keyup.enter)="$event.target.blur()">
                                 <label>{{label}}</label>
                            </span>
                  </div>
               `
           })
export class JiCurrencyPinput {


    @Input() disabled: boolean = false;
    @Input() style: any;
    @Input() class: any;
    @Input() width: number = 120;
    @Input() label: string;

    _digitsInfo: string;
    allowDecimals: boolean;

    @Input() get digitsInfo(): string {
        return this._digitsInfo;
    }

    set digitsInfo(val: string) { // default is '1.2-2'
        this._digitsInfo = val;
        this.allowDecimals = !(this._digitsInfo && this._digitsInfo.endsWith('-0'));
    }

    modelValue: string;

    @Input()
    get model() {
        return this.modelValue;
    }

    @Output() modelChange = new EventEmitter<string>();

    set model(val) {
        this.modelValue = val;
        this.modelChange.emit(this.modelValue);
    }


    @ViewChild('displayField') displayField: ElementRef;

    onInputFocus(event) {
        event.target.style.opacity = 1.0;
        this.displayField.nativeElement.style.opacity = 0.0;
    }

    onInputFocusOut(event) {
        event.target.style.opacity = 0.0;
        this.displayField.nativeElement.style.opacity = 1.0;
    }

    filterChars(event) {
        var c = event.charCode;  //         k = event.keyCode;  (Both can be used)
        return ((48 <= c && c <= 57) || c === 45 || (c === 46 && this.allowDecimals));
    }

}
