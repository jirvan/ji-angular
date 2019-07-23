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

@Component({
               selector: 'ji-file-uploader',
               template: '<input #fileUploadInput style="visibility: hidden; height: 0; display: none" type="file" (change)="fileUploadInput_onChange($event)">'
           })
// See ji-imagefield for a variation on file uploaders
export class JiFileUploader {

    @Output() fileUploaded: EventEmitter<string> = new EventEmitter();

    @Input() uploadToUrl: string;

    //======================== End of Input/Output ========================//

    @ViewChild('fileUploadInput') fileUploadInput: ElementRef;

    constructor(private http: HttpClient,
                public errorHandler: ErrorHandler) {
    }

    private uploadFile_uploadToUrl?: string;
    private thenFunction?: (result: any) => void;

    uploadFileTo(uploadToUrl: string, accept: string, thenFunction?: (result: any) => void) {
        if (!uploadToUrl) throw new Error('uploadToUrl must be provided');
        this.uploadFile_uploadToUrl = uploadToUrl;
        this.thenFunction = thenFunction;
        this.fileUploadInput.nativeElement.accept = accept;
        this.fileUploadInput.nativeElement.click();
    }

    fileUploadInput_onChange(event) {

        let uploadToUrl: string = this.uploadFile_uploadToUrl!;
        this.uploadFile_uploadToUrl = undefined;
        this.fileUploadInput.nativeElement.accept = undefined;

        let fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            let file: File = fileList[0];
            let formData: FormData = new FormData();
            formData.append('uploadFile', file, file.name);
            this.http.post<any>(uploadToUrl, formData)
                .subscribe(result => {
                               this.fileUploadInput.nativeElement.value = "";
                               if (this.thenFunction) {
                                   this.thenFunction(result);
                               }

                           },
                           (error: any) => {
                               this.fileUploadInput.nativeElement.value = "";
                               this.errorHandler.handleError(error)
                           });


        }
    }

}
