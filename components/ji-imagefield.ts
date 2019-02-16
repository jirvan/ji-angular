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
import {FormGroup} from '@angular/forms';

@Component({
               selector: 'ji-imagefield',
               template: '<div style="margin-top: 30px; padding-left: 0; padding-right: 0;"\n' +
                         '     [formGroup]="form"\n' +
                         '     [ngStyle]="cStyle"\n' +
                         '     [ngClass]="cClass">\n' +
                         '    <span style="position: relative">\n' +
                         '        <p-dropdown *ngIf="width" [placeholder]="label" [options]="options" [formControlName]="control"\n' +
                         '                    [autoDisplayFirst]="false" [autoWidth]="false" [style.width]="width" appendTo="body">\n' +
                         '        </p-dropdown>\n' +
                         '        <p-dropdown *ngIf="!width" [placeholder]="label" [options]="options" [formControlName]="control"\n' +
                         '                    [autoDisplayFirst]="false" [autoWidth]="false" [style]="dropdownStyle" appendTo="body">\n' +
                         '        </p-dropdown>\n' +
                         '        <label *ngIf="form.value[control]" style="position: absolute; top: -21px; left: 5px; font-size: 12px; color: #2f4050;">{{label}}</label>\n' +
                         '    </span>\n' +
                         '    <span class="fa fa-fw ui-icon-file-upload" style="vertical-align: bottom; margin-bottom: -3px; margin-left: -4px"\n' +
                         '          (click)="uploadFile()"></span>\n' +
                         '</div>\n' +
                         '<input #fileUploadInput style="visibility: hidden; height: 0; display: none" type="file" (change)="fileUploadInput_onChange($event)">'
           })
export class JiImagefield {

    @Output() imageUploaded: EventEmitter<string> = new EventEmitter();

    @Input() label: string = 'Image';
    @Input() cStyle: any;
    @Input() cClass: string;
    @Input() options: SelectItem[];
    @Input() dropdownStyle: any = {width: '320px'};
    @Input() width: string;
    @Input() form: FormGroup;
    @Input() control: string;
    @Input() uploadToUrl: string;

    //======================== End of Input/Output ========================//

    @ViewChild('fileUploadInput') fileUploadInput: ElementRef;

    constructor(private http: HttpClient,
                public errorHandler: ErrorHandler) {
    }

    private uploadFile_uploadToUrl?: string;
    private uploadFile_thenFunction?: (result: any) => void;

    uploadFile() {
        this.uploadFile_uploadToUrl = this.uploadToUrl;
        this.uploadFile_thenFunction = uploadedFilename => {
            this.options.unshift({label: uploadedFilename, value: uploadedFilename});
            this.options.sort((item1: SelectItem, item2: SelectItem): number => {
                if (!item1 || !item1.value || !item2 || !item2.value) {
                    return 0;
                } else if (item1.value < item2.value) {
                    return -1;
                } else if (item1.value === item2.value) {
                    return 0;
                } else {
                    return 1;
                }
            });
            this.form.value[this.control] = uploadedFilename;
            let value: any = {};
            value[this.control] = uploadedFilename;
            this.form.patchValue(value);
            this.form.markAsDirty();

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
