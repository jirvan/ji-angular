import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
               selector: '[charFilter]'
           })
export class CharFilterDirective {

    @Input('charFilter') set charFilterPattern(rawPattern: string) {
        if (rawPattern) {
            this._strippedCharFilterPattern = rawPattern.replace(/\(toLower\)/, "");
            this.toLower = '(toLower)' + this._strippedCharFilterPattern === rawPattern;
        } else {
            this._strippedCharFilterPattern = '';
            this.toLower = false;
        }
    };

    private _strippedCharFilterPattern: string;
    private toLower: boolean;

    constructor(private el: ElementRef) { }


    @HostListener('keypress', ['$event']) onKeyPress(event) {
        return new RegExp('^[' + this._strippedCharFilterPattern + ']*$').test(event.key);
    }

    @HostListener('paste', ['$event']) blockPaste(event: KeyboardEvent) {
        this.validateFields(event);
    }

    validateFields(event) {
        setTimeout(() => {

            if (this.el.nativeElement.value) {
                if (this.toLower) {
                    this.el.nativeElement.value = this.el.nativeElement.value.toLowerCase().replace(new RegExp('[^' + this._strippedCharFilterPattern + ']', 'g'), '');
                } else {
                    this.el.nativeElement.value = this.el.nativeElement.value.replace(new RegExp('[^' + this._strippedCharFilterPattern + ']', 'g'), '');
                }
            }
            event.preventDefault();

        }, 100)
    }

}
