/*

 Copyright (c) 2018, 2019, 2020 Jirvan Pty Ltd
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

import {ErrorHandler} from '@angular/core';
import {HttpErrorResponse} from "@angular/common/http";
import {JiErrorDialog} from "./ji-error-dialog";

export class JiErrorHandler implements ErrorHandler {

    errorDialog: JiErrorDialog;

    handleError(errorObject) {
        let error: StandardizedError = this.standardizeError(errorObject);
        let message: string = error.message
                              + (error.additionalInfo ? ':\n\n' + error.additionalInfo : '');
        if (this.errorDialog && error.assumeSafeForDialog) {
            this.errorDialog.showDialog(error);
            console.log(errorObject);
        } else {
            alert(message);
            console.log(errorObject);
        }
    }

    standardizeError(errorObject: any): StandardizedError {

        if (errorObject instanceof HttpErrorResponse) {

            let basicAdditionalInfo = `HTTP Status: ${errorObject.status}\nURL:         ${errorObject.url}`;
            if (errorObject.error) {
                return {
                    assumeSafeForDialog: true,
                    title:   `HTTP ${errorObject.status} ${errorObject.error.error} `,
                    message: errorObject.error.message ||errorObject.error.errorMessage || errorObject.message,
                    additionalInfo: basicAdditionalInfo + (errorObject.error.errorInfo ? '\n\n' + errorObject.error.errorInfo : '')
                };
            } else {
                return {
                    assumeSafeForDialog: true,
                    title: errorObject.name || 'Error',
                    message: errorObject.message,
                    additionalInfo: basicAdditionalInfo
                };
            }


        } else {
            return {
                assumeSafeForDialog: false,
                title: 'Error',
                message: errorObject.message || errorObject,
                additionalInfo: errorObject.stack || 'There is no additional error information'
            };
        }
    }

}

export class StandardizedError {
    assumeSafeForDialog: boolean;
    title: string;
    message: string;
    additionalInfo: string;
}
