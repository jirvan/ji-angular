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

import {Component, ElementRef, ErrorHandler, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {SelectItem} from "primeng/api";

@Component({
               selector: 'ji-imagefield',
               template: '<div style="margin-top: 30px; padding-left: 0; padding-right: 0;"\n' +
                         '     [ngStyle]="cStyle"\n' +
                         '     [ngClass]="cClass">\n' +
                         '    <span style="position: relative">\n' +
                         '        <p-dropdown [placeholder]="label" [options]="options" [(ngModel)]="cModel"\n' +
                         '                    [autoDisplayFirst]="false" [autoWidth]="false" [style]="dropdownStyle" appendTo="body"\n' +
                         '                    (onChange)="onImageChange($event)">\n' +
                         '            <ng-template let-item pTemplate="item">\n' +
                         '                <div [ngStyle]="item.label === \'Upload image...\' ? {\'border-top\': \'solid 1px #C6C6C6\', \'padding-top\': \'8px\'} : {}">{{item.label}}</div>\n' +
                         '            </ng-template>\n' +
                         '        </p-dropdown>\n' +
                         '        <label *ngIf="cModel" style="position: absolute; top: -21px; left: 5px; font-size: 12px; color: #2f4050;">{{label}}</label>\n' +
                         '    </span>\n' +
                         '</div>\n' +
                         '<input #fileUploadInput style="visibility: hidden; height: 0; display: none" type="file" (change)="fileUploadInput_onChange($event)">'
           })
export class JiImagefieldm {

    @Output() imageUploaded: EventEmitter<string> = new EventEmitter();

    @Input() label: string = 'Image';
    @Input() cStyle: any;
    @Input() cClass: string;
    @Input() options: SelectItem[];
    @Input() dropdownStyle: any = {width: '320px'};
    @Input() uploadToUrl: string;

    private _cModel?: string;

    @Input()
    get cModel() {
        return this._cModel;
    }

    @Output() cModelChange = new EventEmitter<string>();

    set cModel(val) {
        this._cModel = val;
        if (!this.imageLastChanged) {
            this.imageLastChanged = val;
        }
        this.cModelChange.emit(this._cModel);
    }

    @ViewChild('fileUploadInput') fileUploadInput: ElementRef;

    private imageLastChanged?: string;

    constructor(private http: HttpClient,
                public errorHandler: ErrorHandler) {
    }

    onImageChange(event) {
        if (this.cModel === 'UploadImage') {
            let thisPane = this;
            setTimeout(function () {
                           thisPane.cModel = thisPane.imageLastChanged;
                       },
                       0);

            this.uploadFile((uploadedFilename: string) => {
                this.cModel = uploadedFilename;
            });
        } else {
            this.imageLastChanged = this.cModel;
        }

    }

    private uploadFile_uploadToUrl?: string;
    private uploadFile_thenFunction?: (result: any) => void;

    private uploadFile(then: (uploadedFilename: string) => void) {
        this.uploadFile_uploadToUrl = this.uploadToUrl;
        this.uploadFile_thenFunction = uploadedFilename => {
            this.options.unshift({label: uploadedFilename, value: uploadedFilename});
            this.options.sort((item1: SelectItem, item2: SelectItem): number => {
                if (!item1 || !item1.value || !item2 || !item2.value) {
                    return 0;
                } else if (item1.value === 'UploadImage') {
                    return 1;
                } else if (item2.value === 'UploadImage') {
                    return -1;
                } else if (item1.value < item2.value) {
                    return -1;
                } else if (item1.value === item2.value) {
                    return 0;
                } else {
                    return 1;
                }
            });
            then(uploadedFilename);
            this.imageUploaded.emit(uploadedFilename);
        };
        this.fileUploadInput.nativeElement.accept = 'image/*';
        this.fileUploadInput.nativeElement.click();
    }

    fileUploadInput_onChange(event) {

        let uploadToUrl: string = this.uploadFile_uploadToUrl!;
        this.uploadFile_uploadToUrl = undefined;
        let thenFunction: (result: any) => void = this.uploadFile_thenFunction!;
        this.uploadFile_thenFunction = undefined;
        this.fileUploadInput.nativeElement.accept = undefined;

        let fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            let file: File = fileList[0];
            let formData: FormData = new FormData();
            formData.append('uploadFile', file, file.name);
            this.http.post<any>(uploadToUrl, formData)
                .subscribe(result => {
                               this.fileUploadInput.nativeElement.value = "";
                               if (thenFunction) {
                                   thenFunction(result);
                               }

                           },
                           (error: any) => {
                               this.fileUploadInput.nativeElement.value = "";
                               this.errorHandler.handleError(error)
                           });


        }
    }

}
