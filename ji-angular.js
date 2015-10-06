/*

 ji-angular-1.0.106.js

 Copyright (c) 2014,2015 Jirvan Pty Ltd
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

(function () {
    //'use strict';

    angular.module('jiAngular', [])

        //========== ji service ==========//
        .factory('ji', ['$filter', '$modal', function ($filter, $modal) { return new JiService($filter, $modal); }])

        //========== jiJob service ==========//
        .factory('jiJob', function ($modal) { return new JobLogService($modal); })

        //========== logonDialog service etc ==========//
        .factory('jiLogonDialog', function ($modal) { return new LogonDialogService($modal); })
        .controller('LogonDialogController', LogonDialogController)

        //========== ResetPasswordDialog service etc ==========//
        .factory('jiResetPasswordDialog', function ($modal) { return new ResetPasswordDialogService($modal); })
        .controller('ResetPasswordDialogController', ResetPasswordDialogController)

        //========== ji-auto-focus ==========//
        .directive('jiAutoFocus', function ($timeout) {
                       return {
                           restrict: 'AC',
                           link: function (scope, element) {

                               // Set the standard attribute to disable the $modal hijacking of autofocus
                               element.attr("autofocus", true);

                               $timeout(function () {
                                   element[0].focus();
                               }, 0);

                           }
                       };
                   })

        //========== ji-scope-element ==========//
        .directive('jiScopeElement', function () {
                       return {
                           restrict: 'A',
                           link: function (scope, element, attr) {
                               scope[attr.jiScopeElement] = element;
                           }
                       };
                   })

        //========== ji-parent-scope-element ==========//
        .directive('jiParentScopeElement', function () {
                       return {
                           restrict: 'A',
                           link: function (scope, element, attr) {
                               scope.$parent[attr.jiParentScopeElement] = element;
                           }
                       };
                   })

        //========== ji-change ==========//
        .directive('jiChange', function () {
                       return {
                           restrict: 'A',
                           require: 'ngModel',
                           link: function (scope, element, attr, ctrl) {
                               ctrl.$viewChangeListeners.push(function () {
                                   scope[attr.jiChange](scope, element, attr, ctrl);
                               });
                           }
                       };
                   })

        //========== ji-currency ==========//
        .directive('jiCurrency', ['$filter', function ($filter) {
            return jiCurrencyDirective($filter, false);
        }])
        .directive('jiNonNegativeCurrency', ['$filter', function ($filter) {
            return jiCurrencyDirective($filter, true);
        }])

        //========== ji-card-number ==========//
        .directive('jiCardNumber', function () {
                       return {
                           restrict: 'A',
                           require: 'ngModel',
                           link: function (scope, element, attr, input) {
                               input.isCardNumberField = true;
                               input.$viewChangeListeners.push(function () {

                                   // Apply in the same way ng-change does
                                   var expectedCardType = getObjectPathValue(scope, input.$jiCardTypeScopeName);
                                   scope.$eval(attr.ngModel + " = '" + formatAndPartiallyValidateCardNumberField(input, expectedCardType) + "'");

                                   // Set the cardType in the model if appropriate
                                   if (attr.ngModel.match(/[^.]\.[^.]/)) {
                                       var modelParentPath = attr.ngModel.replace(/\.[^.]+$/, '');
                                       scope.$eval(modelParentPath + ".cardType = " + (input.cardType ? "'" + input.cardType + "'" : input.cardType));
                                       scope.$eval(modelParentPath + ".cardTypeTitle = " + (input.cardTypeTitle ? "'" + input.cardTypeTitle + "'" : input.cardTypeTitle));
                                   }

                               });
                           }
                       };
                   })

        //========== ji-card-expiry ==========//
        .directive('jiCardExpiry', function () {
                       return {
                           restrict: 'A',
                           require: 'ngModel',
                           link: function (scope, element, attr, input) {
                               input.isCardExpiryField = true;
                               input.$viewChangeListeners.push(function () {

                                   // Apply in the same way ng-change does
                                   scope.$eval(attr.ngModel + " = '" + formatAndPartiallyValidateCardExpiryField(input) + "'");

                               });
                           }
                       };
                   })

        //========== ji-card-type ==========//
        .directive('jiCardType', function () {
                       return {
                           restrict: 'A',
                           require: 'ngModel',
                           link: function (scope, element, attr, ngModelController) {
                               if (ngModelController) {
                                   ngModelController.$jiCardTypeScopeName = attr.jiCardType;
                               }
                           }
                       };
                   })

        //========== ji-bsb-number ==========//
        .directive('jiBsbNumber', function () {
                       return {
                           restrict: 'A',
                           require: 'ngModel',
                           link: function (scope, element, attr, input) {
                               input.isBsbNumberField = true;
                               input.$viewChangeListeners.push(function () {

                                   // Apply in the same way ng-change does
                                   scope.$eval(attr.ngModel + " = '" + formatAndPartiallyValidateBsbNumberField(input) + "'");

                               });
                           }
                       };
                   })

        //========== ji-form ==========//
        .directive('jiForm', ['$timeout', function ($timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    var form, formName = element[0].getAttribute("name");
                    if (formName) {
                        form = scope[formName];
                        form.element = element;
                        form.touchAllInputs = touchAllInputs;
                        form.moveFocusToFirstInvalidInput = moveFocusToFirstInvalidInput;
                        form.validate = validate;
                        form.resetInputs = resetInputs;
                        $timeout(resetInputs, 0);

                        function resetInputs() {
                            form.inputs = [];
                            for (fieldName in form) {
                                if (fieldName[0] != '$' && form[fieldName] && (typeof form[fieldName].$pristine != 'undefined')) {
                                    var field = form[fieldName];
                                    var inputElements = element.find("input");
                                    for (var i = 0; i < inputElements.length; i++) {
                                        if (inputElements[i].getAttribute("name") === fieldName) {
                                            form.inputs.push(field);
                                            field.element = inputElements[i];
                                            inputElements[i].onfocus = function (event) {
                                                var targetName = event.target.getAttribute("name");
                                                if (targetName && scope[formName] && scope[formName][targetName]) {
                                                    $timeout(function () {scope.$eval(formName + "." + targetName + ".$jiHasFocus = true")}, 0);
                                                }
                                            };
                                            inputElements[i].onblur = function () {
                                                var targetName = event.target.getAttribute("name");
                                                if (targetName && scope[formName] && scope[formName][targetName]) {
                                                    $timeout(function () {scope.$eval(formName + "." + targetName + ".$jiHasFocus = false")}, 0);
                                                }
                                            };
                                        }
                                    }
                                }
                            }
                        }

                    } else {
                        throw new Error("ji-form: Form element does not have a name")
                    }

                    function moveFocusToFirstInvalidInput() {
                        var formInputs = form.element.find('input');
                        for (var i = 0; i < formInputs.length; i++) {
                            if (angular.element(formInputs[i]).hasClass('ng-invalid')) {
                                formInputs[i].focus();
                                break;
                            }
                        }
                    }

                    function touchAllInputs() {
                        for (var i = 0; i < form.inputs.length; i++) {
                            form.inputs[i].$dirty = true;
                            form.inputs[i].$pristine = false;
                            angular.element(form.inputs[i].element).removeClass('ng-pristine');
                            angular.element(form.inputs[i].element).addClass('ng-dirty');
                        }
                        form.$setDirty();
                    }

                    function validate(resetInputsBeforeValidating) {
                        if (resetInputsBeforeValidating) form.resetInputs(); // Necessary sometime when an input is added (eg by ng-if) after the initial setting of the inputs
                        form.touchAllInputs();
                        if (form.$valid) {
                            return true;
                        } else {
                            form.moveFocusToFirstInvalidInput();
                            return false;
                        }
                    }

                }
            };
        }])

        //========== ji-currency-input ==========//
        .directive('jiCurrencyInput', function ($filter) {
                       return {
                           require: 'ngModel',
                           scope: true,
                           link: Link
                       };

                       function Link(scope, element, attrs, modelCtrl) {

                           // Formatter
                           modelCtrl.$formatters.push(function (inputValue) {
                               if (inputValue) {
                                   var formattedValue = $filter('currency')(
                                       parseFloat(inputValue.toString().replace(/[^0-9_-]/g, ''))
                                   );
                                   element.val(formattedValue);
                                   return formattedValue;
                               } else {
                                   return '';
                               }

                           });

                           // Parser
                           modelCtrl.$parsers.push(function (inputValue) {
                               if (inputValue) {

                                   var numericValue = parseFloat(inputValue.toString().replace(/[^0-9-.]/g, '')).toFixed(2);
                                   var sanitizedValue = inputValue.replace(/[^0-9-.]/g, '');
                                   if (sanitizedValue === '' || sanitizedValue === '-') return '';
                                   var signPrefix = sanitizedValue.charAt(0) === '-' ? '-' : '';
                                   var numericIntegerPart = Math.abs(parseInt(sanitizedValue));
                                   var integerPart = '' + numericIntegerPart;
                                   if (sanitizedValue.match(/\./)) {
                                       var fractionalPart = sanitizedValue.replace(/.*\./, '');
                                       var periodPresent = true;
                                   } else {
                                       fractionalPart = '';
                                       periodPresent = false;
                                   }

                                   var formattedValue;
                                   if (integerPart === inputValue) {
                                       formattedValue = $filter('currency')(numericValue, "$", 0);
                                   } else {


                                       if (integerPart === '') {
                                           if (fractionalPart === '') {
                                               formattedValue = signPrefix + '$0.';
                                           } else {
                                               formattedValue = signPrefix + '$0.' + fractionalPart.substr(0, 2);
                                           }
                                       } else {
                                           if (fractionalPart === '') {
                                               formattedValue = signPrefix + $filter('currency')(numericIntegerPart, "$", 0) + (periodPresent ? '.' : '');
                                           } else {
                                               formattedValue = signPrefix + $filter('currency')(numericIntegerPart, "$", 0) + "." + fractionalPart.substr(0, 2);
                                           }
                                       }
                                   }

                                   element.val(formattedValue);
                                   return Number(numericValue);

                               } else if (inputValue === '0') {
                                   return 0;
                               } else {
                                   return '';
                               }

                           });
                       }

                   })

        //========== ji-percentage-input ==========//
        .directive('jiPercentageInput', function () {
                       return {
                           require: 'ngModel',
                           scope: true,
                           link: Link
                       };

                       function Link(scope, element, attrs, modelCtrl) {

                           var decimalPlaces = attrs['decimalPlaces'] ? Number(attrs['decimalPlaces']) : 0;

                           // Formatter
                           modelCtrl.$formatters.push(function (inputValue) {
                               if (inputValue) {
                                   var formattedValue = parseFloat(inputValue.toString().replace(/[^0-9_-]/g, '')).toFixed(decimalPlaces) + '%';
                                   element.val(formattedValue);
                                   return formattedValue;
                               } else {
                                   return '';
                               }

                           });

                           // Parser
                           modelCtrl.$parsers.push(function (inputValue) {
                               if (inputValue) {

                                   var numericValue = Number(parseFloat(inputValue.toString().replace(/[^0-9-.]/g, '')).toFixed(decimalPlaces));
                                   var sanitizedValue = inputValue.replace(/[^0-9-.]/g, '');
                                   if (sanitizedValue === '' || sanitizedValue === '-') return '';
                                   var signPrefix = sanitizedValue.charAt(0) === '-' ? '-' : '';
                                   var numericIntegerPart = Math.abs(parseInt(sanitizedValue));
                                   var integerPart = '' + numericIntegerPart;
                                   if (decimalPlaces == 0) {
                                       fractionalPart = '';
                                       periodPresent = false;
                                   } else if (sanitizedValue.match(/\./)) {
                                       var fractionalPart = sanitizedValue.replace(/.*\./, '');
                                       var periodPresent = true;
                                   } else {
                                       fractionalPart = '';
                                       periodPresent = false;
                                   }

                                   var formattedValue;
                                   if (integerPart === inputValue) {
                                       formattedValue = numericValue + '%';
                                   } else {


                                       if (integerPart === '') {
                                           if (fractionalPart === '') {
                                               formattedValue = signPrefix + '0.' + '%';
                                           } else {
                                               formattedValue = signPrefix + '0.' + '%' + fractionalPart.substr(0, decimalPlaces);
                                           }
                                       } else {
                                           if (fractionalPart === '') {
                                               formattedValue = signPrefix + numericIntegerPart + (periodPresent ? '.' : '') + '%';
                                           } else {
                                               formattedValue = signPrefix + numericIntegerPart + "." + fractionalPart.substr(0, decimalPlaces) + '%';
                                           }
                                       }
                                   }

                                   element.val(formattedValue);
                                   setCaretPosition(element[0], formattedValue.length - 1);
                                   return Number(numericValue);

                               } else if (inputValue === '0') {
                                   return 0;
                               } else {
                                   return '';
                               }

                           });
                       }

                       function setCaretPosition(elem, caretPos) {

                           if (elem != null) {
                               if (elem.createTextRange) {
                                   var range = elem.createTextRange();
                                   range.move('character', caretPos);
                                   range.select();
                               }
                               else {
                                   if (elem.selectionStart) {
                                       elem.focus();
                                       elem.setSelectionRange(caretPos, caretPos);
                                   }
                                   else
                                       elem.focus();
                               }
                           }
                       }

                   })

        //========== ji-element ==========//
        .directive('jiElement', function ($timeout, $parse) {
                       return {
                           link: function (scope, element, attrs) {
                               var elementName = element[0].getAttribute("name");
                               if (elementName) {
                                   scope.$parent[elementName + "Element"] = element;
                               } else {
                                   throw new Error("ji-element: Element does not have a name")
                               }
                           }
                       };
                   })


        //========== ji-replace ==========//
        .directive('jiReplace', function () {
                       return {
                           replace: true,
                           restrict: 'A',
                           templateUrl: function (iElement, iAttrs) {
                               if (!iAttrs.jiReplace) throw new Error("ji-replace: template url must be provided");
                               return iAttrs.jiReplace;
                           }
                       };
                   })


        //========== ji-popup ==========//
        .directive('jiPopup', ['$window', '$document', '$timeout', function ($window, $document, $timeout) {

            return {
                restrict: 'EA',
                replace: 'false',
                templateUrl: function (iElement, iAttrs) {
                    if (!iAttrs.templateUrl) throw new Error("ji-popup: template-url must be provided");
                    return iAttrs.templateUrl;
                },
                link: function (scope, iElement, iAttrs) {
                    linkPopupDirective($window, $document, $timeout, scope, iElement, iAttrs, 'jiPopup', 'ji-popup', 'popup');
                }
            };

        }])


        //========== ji-menu ==========//
        .directive('jiMenu', ['$window', '$document', '$timeout', function ($window, $document, $timeout) {

            return {
                restrict: 'EA',
                replace: 'false',
                templateUrl: function (iElement, iAttrs) {
                    if (!iAttrs.templateUrl) throw new Error("ji-menu: template-url must be provided");
                    return iAttrs.templateUrl;
                },
                link: function (scope, iElement, iAttrs) {
                    iElement.addClass('dropdown-menu');
                    iElement.css({
                        display: 'block',
                        visibility: 'hidden',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        margin: 0
                    });
                    var popup = linkPopupDirective($window, $document, $timeout, scope, iElement, iAttrs, 'jiMenu', 'ji-menu', 'menu');
                    iElement.on('click', popup.close);
                }
            };

        }])


        //========== ji-smart-input WORK IN PROGRESS ==========//
        .directive('jiSmartInput', ['$window', '$document', '$timeout', function ($window, $document, $timeout) {

            return {
                restrict: 'EA',
                replace: 'false',
                template: function (iElement, iAttrs) {
                    return "<ul class='dropdown-menu' style='position:relative; overflow-y: auto; font-size: 16px; min-width: 50px; max-height: 400px'>\n" +
                           "    <li ng-repeat='item in filteredItems' ng-class='{\"ji-select-active\": $index === activeFilteredItemIndex}'\n" +
                           "        style='padding-right: 20px'\n" +
                           "        ng-click='selectActiveItem()'\n" +
                           "        ng-mouseover='competitorDropDownItemMouseOver($index)'>\n" +
                           "        <a>{{formatDisplayText(item)}}</a>\n" +
                           "    </li>\n" +
                           "</ul>";
                },
//                           templateUrl: function (iElement, iAttrs) {
//                               if (!iAttrs.templateUrl) throw new Error("ji-smart-input: template-url must be provided");
//                               return iAttrs.templateUrl;
//                           },
                link: function (scope, iElement, iAttrs) {
                    iElement.addClass('dropdown-menu');
                    iElement.css({
                        display: 'block',
                        visibility: 'hidden',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        margin: 0
                    });
                    var popup = linkPopupDirective($window, $document, $timeout, scope, iElement, iAttrs, 'jiSmartInput', 'ji-smart-input', 'input');
                    iElement.on('click', popup.close);
                }
            };

        }])

        //========== jiLabelledObject filter ==========//
        .filter('jiLabelledObject', [function () {
            return function (labelledObjects, searchPattern) {
                var returnArray = [];
                for (var i = 0; i < labelledObjects.length; i++) {
                    if (searchPattern) {
                        if (labelledObjects[i].label.toLowerCase().indexOf(searchPattern.toLowerCase()) !== -1) {
                            returnArray.push(labelledObjects[i]);
                        }
                    } else {
                        returnArray.push(labelledObjects[i]);
                    }
                }
                return returnArray;
            }
        }]);

    function jiCurrencyDirective($filter, restrictToNonNegative) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModelController) {
                element[0].onblur = function () {
                    var currentValue = element.val();
                    if (currentValue != '' && !isNaN(currentValue)) {
                        element.val($filter('currency')(currentValue));
                    }
                };
                ngModelController.$parsers.push(function (value) {      //View -> Model

                    if (ngModelController) {
                        ngModelController.$setValidity("invalidNumber", true);
                        ngModelController.$setValidity("negativeNumber", true);
                        ngModelController.errorMessage = null;
                    }

                    if (!value) {
                        return value;
                    } else {
                        var sanitizedValue = value
                            .replace(/^\s/, "")
                            .replace(/^-\$/, "-")
                            .replace(/^\$/, "")
                            .replace(/,/g, "");
                        if (isNaN(sanitizedValue)) {
                            if (ngModelController) {
                                ngModelController.$setValidity("invalidNumber", false);
                                ngModelController.errorMessage = "Invalid number";
                            }
                            return value;
                        } else {
                            if (restrictToNonNegative && Number(sanitizedValue) < 0) {
                                if (ngModelController) {
                                    ngModelController.$setValidity("negativeNumber", false);
                                    ngModelController.errorMessage = "Negative number";
                                }
                                return value;
                            } else {
                                return Number(sanitizedValue);
                            }
                        }
                    }

                });
                ngModelController.$formatters.push(function (value) {   //Model -> View
                    if (isNaN(value)) {
                        return value;
                    } else {
                        return $filter('currency')(Number(value));
                    }
                });
            }
        };
    }

    function linkPopupDirective($window, $document, $timeout, scope, iElement, iAttrs, popupAttrCamelCaseName, popupAttrHyphenatedName, popupInstanceName) {

        var overlay;

        // Detach and reattach to body (necessary for z-index ordering)
        // Use detach function if it is there (jQuery (or angularjs v1.3 jqLite?)), remove function otherwise
        angular.element($document[0].body).append(detachElement(iElement));

        // Setup and return referenceObject
        var referenceObject = {
            showAt: showAt,
            showAnchoredBy: showAnchoredBy,
            close: function () {
                iElement.css('visibility', 'hidden');
                overlay.remove();
            },
            isOpen: function () {
                return iElement.css('visibility') !== 'hidden';
            }
        };
        if (iAttrs[popupAttrCamelCaseName]) {
            scope.$parent[iAttrs[popupAttrCamelCaseName]] = referenceObject;
        } else if (iAttrs.instanceName) {
            scope.$parent[iAttrs.instanceName] = referenceObject;
        } else {
            throw new Error(popupAttrHyphenatedName + ": instance-name must be provided (when declaring using \"<" + popupAttrHyphenatedName + " ...>\" style declaration)");
        }
        return referenceObject;

        function showAnchoredBy(anchorElement, options) {
            iElement.css('opacity', 0);
            showAt({top: 0, left: 0}, options);
            $timeout(function () {
                         movePopupTo(calculateAnchoredOffset($window, $document, angular.element(anchorElement), iElement,
                                                             options ? options.horizontalDirection : null,
                                                             options ? options.verticalDirection : null));
                         iElement.css('opacity', 1);
                     },
                     0);
        }

        function showAt(offset, options) {
            if (!offset) throw new Error(popupAttrHyphenatedName + ": offset must be provided");
            if (!offset.top && offset.top !== 0) throw new Error(popupAttrHyphenatedName + ": offset.top must be provided");
            if (!offset.left && offset.left !== 0) throw new Error(popupAttrHyphenatedName + ": offset.left must be provided");
            overlay = createOverlayAndShowPopupAt($window, $document, offset, iElement, referenceObject.close);
            scope[popupInstanceName] = {};
            for (option in options) {
                if (options.hasOwnProperty(option)) {
                    scope[popupInstanceName][option] = options[option];
                }
            }
        }

        function movePopupTo(offset) {
            var offsetParentTop, offsetParentLeft, offsetParent = iElement[0].offsetParent;
            if (offsetParent.nodeName === 'BODY') {
                offsetParentTop = offsetParent.offsetTop;
                offsetParentLeft = offsetParent.offsetLeft;
            } else {
                var offsetParentOffset = elementOffset($window, $document, angular.element(offsetParent));
                offsetParentTop = offsetParentOffset.top;
                offsetParentLeft = offsetParentOffset.left;
            }
            iElement.css('top', (offset.top - offsetParentTop) + "px");
            iElement.css('left', (offset.left - offsetParentLeft) + "px");
        }

    }

    function createOverlayAndShowPopupAt($window, $document, offset, popupContent, closeFunction) {

        // Determine max z-index for direct children of body;
        popupContent.css('z-index', 0);
        var maxZIndex = 0, existingOverlays = $document[0].body.children;
        for (var i = 0; i < existingOverlays.length; i++) {
            if (existingOverlays[i] && existingOverlays[i].style && existingOverlays[i].style.zIndex
                && existingOverlays[i].nodeName === 'DIV') {
                var zIndex = existingOverlays[i].style.zIndex ? Number(existingOverlays[i].style.zIndex) : 0;
                if (zIndex > maxZIndex) {
                    maxZIndex = zIndex;
                }
            }
        }

        // Create and show overlay
        var overlay = angular.element(document.createElement("div"));
        overlay.addClass('overlay');
        overlay.css('position', 'absolute');
        overlay.css('left', '0px');
        overlay.css('top', '0px');
        overlay.css('width', '100%');
        overlay.css('height', '100%');
        overlay.css('text-align', 'center');
        overlay.css('z-index', maxZIndex + 1);
        overlay.on('click', closeFunction);
        angular.element($document[0].body).append(overlay);

        // Show content
        var offsetParentTop, offsetParentLeft, offsetParent = popupContent[0].offsetParent;
        if (offsetParent.nodeName === 'BODY') {
            offsetParentTop = offsetParent.offsetTop;
            offsetParentLeft = offsetParent.offsetLeft;
        } else {
            var offsetParentOffset = elementOffset($window, $document, angular.element(offsetParent));
            offsetParentTop = offsetParentOffset.top;
            offsetParentLeft = offsetParentOffset.left;
        }
        popupContent.css('visibility', 'inherit');
        popupContent.css('position', 'absolute');
        popupContent.css('top', (offset.top - offsetParentTop) + "px");
        popupContent.css('left', (offset.left - offsetParentLeft) + "px");
        popupContent.css('z-index', maxZIndex + 2);

        return overlay;

    }

    function calculateAnchoredOffset($window, $document, anchorElement, anchoredElement, horizontalDirection, verticalDirection) {

        var anchorElementOffset = elementOffset($window, $document, anchorElement);
        var anchoredElementOffset = elementOffset($window, $document, anchoredElement);
        var calculatedOffset = {};

        // Determine top offset
        if (verticalDirection === "up") {
            calculatedOffset.top = anchorElementOffset.top - anchoredElementOffset.height;
        } else if (verticalDirection === "down") {
            calculatedOffset.top = anchorElementOffset.top + anchorElementOffset.height;
        } else if (!verticalDirection) {

            if (anchorElementOffset.top + anchorElementOffset.height + anchoredElementOffset.height < window.innerHeight) {
                calculatedOffset.top = anchorElementOffset.top + anchorElementOffset.height;
            } else if (anchorElementOffset.top - anchoredElementOffset.height > 0) {
                calculatedOffset.top = anchorElementOffset.top - anchoredElementOffset.height;
            } else {
                calculatedOffset.top = window.innerHeight - anchoredElementOffset.height;
            }
        } else {
            throw new Error('Unrecognized verticalDirection "' + verticalDirection + ' (should be "up" or "down" (or undefined for default))');
        }

        // Determine left offset
        if (horizontalDirection === "left") {
            calculatedOffset.left = anchorElementOffset.left + anchorElementOffset.width - anchoredElementOffset.width;
        } else if (horizontalDirection === "right") {
            calculatedOffset.left = anchorElementOffset.left;
        } else if (!horizontalDirection) {
            if (anchorElementOffset.left + anchoredElementOffset.width < window.innerWidth) {
                calculatedOffset.left = anchorElementOffset.left;
            } else if (anchorElementOffset.left + anchorElementOffset.width > anchoredElementOffset.width) {
                calculatedOffset.left = anchorElementOffset.left + anchorElementOffset.width - anchoredElementOffset.width;
            } else if (window.innerWidth > anchoredElementOffset.width) {
                calculatedOffset.left = window.innerWidth - anchoredElementOffset.width;
            } else {
                calculatedOffset.left = 0;
            }
        } else {
            throw new Error('Unrecognized horizontalDirection "' + horizontalDirection + ' (should be "left" or "right" (or undefined for default))');
        }

        return {
            top: calculatedOffset.top,
            left: calculatedOffset.left
        };

    }

    function elementOffset($window, $document, element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
            top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
            left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft),
            width: boundingClientRect.width || element.prop('offsetWidth'),
            height: boundingClientRect.height || element.prop('offsetHeight')
        };
    }

    function detachElement(element) {

        // If the detach function is available (jQuery or possibly AngularJS v1.3.? jqLite in use)
        // then use it otherwise use jury-rigged detach code
        if (element.detach) {
            return element.detach();
        } else {
            var parent = element.parentNode;
            if (parent) parent.removeChild(element);
            return element;
        }

    }

    function firstAncestorWithClass(element, clazz) {
        var parent = angular.element(element).parent();
        if (parent.length > 0) {
            if (parent.hasClass(clazz)) {
                return parent;
            } else {
                return firstAncestorWithClass(parent, clazz);
            }
        } else {
            return null;
        }
    }

    function firstAncestorWithTagName(element, tagname) {
        var parent = angular.element(element).parent();
        if (parent.length > 0) {
            if (tagname && parent[0].nodeName.toLowerCase() === tagname.toLowerCase()) {
                return parent;
            } else {
                return firstAncestorWithTagName(parent, tagname);
            }
        } else {
            return null;
        }
    }

    function expiryYearTooBig(year) {
        return Number(year) > new Date().getFullYear() + 20;
    }

    function getObjectPathValue(object, path) {
        if (!object || !path) {
            return null;
        } else if (path.length === 0) {
            return null;
        } else if (path.match(/\./)) {
            var nextNode = path.replace(/\..*/, '');
            var remainingPath = path.replace(/[^\.]*\./, '');
            return getObjectPathValue(object[nextNode], remainingPath);
        } else {
            return object[path]
        }
    }

    function setObjectPathValue(object, path, value) {
        if (object && path && path.length > 0) {
            if (path.match(/\./)) {
                var nextNode = path.replace(/\..*/, '');
                var remainingPath = path.replace(/[^\.]*\./, '');
                setObjectPathValue(object[nextNode], remainingPath);
            } else {
                object[path] = value;
            }
        }
    }

    function formatAndPartiallyValidateCardNumberField(field, expectedCardType) {
        if (field) {
            field.$setValidity("invalidCardNumber", true);
            field.$setValidity("invalidCardType", true);
            field.errorMessage = null;
            if (field.$viewValue) {
                var newNumber = field.$viewValue.replace(/\D/g, '');
                newNumber = $.payment.formatCardNumber(newNumber);
                if (newNumber.length < 4) {
                    field.cardType = null;
                    field.cardTypeTitle = null;
                } else {
                    field.cardType = $.payment.cardType(newNumber);
                    field.cardTypeTitle = getCardTypeTitle(field.cardType);
                }
                if (expectedCardType && field.cardType && field.cardType != expectedCardType) {
                    field.$setValidity("invalidCardType", false);
                    field.errorMessage = "This number is for " + getCardTypeTitle(field.cardType) + " (expected " + getCardTypeTitle(expectedCardType) + ")";
                    return newNumber;
                } else if (newNumber.length > 4 && newNumber[4] !== ' ') {
                    field.$setValidity("invalidCardNumber", false);
                    field.errorMessage = "Invalid Card Number";
                    return newNumber.substring(0, 4);
                } else {
                    return newNumber;
                }
            } else {
                return field.$viewValue;
            }
        } else {
            return "";
        }
    }

    function validateCardNumberField(field, expectedCardType) {
        if (field) {
            field.$setValidity("invalidCardNumber", true);
            field.$setValidity("invalidCardType", true);
            field.errorMessage = null;
            if (field.$viewValue) {
                if ($.payment.validateCardNumber(field.$viewValue)) {
                    field.cardType = $.payment.cardType(field.$viewValue);
                    field.cardTypeTitle = getCardTypeTitle(field.cardType);
                    if (expectedCardType && field.cardType && field.cardType != expectedCardType) {
                        field.$setValidity("invalidCardType", false);
                        field.errorMessage = "This number is for " + getCardTypeTitle(field.cardType) + " (expected " + getCardTypeTitle(expectedCardType) + ")";
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    field.$setValidity("invalidCardNumber", false);
                    field.errorMessage = "Invalid Card Number";
                    return false;
                }
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    function formatAndPartiallyValidateCardExpiryField(field) {
        if (field) {
            field.$setValidity("invalidCardExpiry", true);
            field.errorMessage = null;
            if (field.$viewValue) {
                var trimmedString = field.$viewValue.replace(/[^\d\/]/g, '');
                if (!trimmedString.match(/\//) && trimmedString.length > 2) {
                    trimmedString = trimmedString.substr(0, 2) + '/' + trimmedString.substr(2);
                }
                if (trimmedString.match(/\//)) {
                    var month = trimmedString.replace(/\/.*/, "");
                    if (month.length > 2 || Number(month) > 12) {
                        field.$setValidity("invalidCardExpiry", false);
                        field.errorMessage = 'Invalid expiry month "' + month + '"';
                        return field.$viewValue;
                    }
                    if (month.length === 1 && field.$viewValue.match(/\/$/)) {
                        month = '0' + month;
                    }
                    var year = trimmedString.replace(/[^/]*\//, "");
                    if (year.length === 4 && year.substr(0, 2) === '20') year = year.substr(2);
                    if (year.length === 0 && field.$viewValue.match(/ \/$/)) {
                        return month;
                    } else if (year.length > 2 && year.substr(0, 2) != '20') {
                        field.$setValidity("invalidCardExpiry", false);
                        field.errorMessage = 'Invalid expiry year "' + year + '"';
                        return field.$viewValue;
                    } else if (year.length > 4 || expiryYearTooBig(year)) {
                        field.$setValidity("invalidCardExpiry", false);
                        field.errorMessage = 'Invalid expiry year "' + year + '"';
                        return field.$viewValue;
                    }
                    return month + ' / ' + year;
                } else {
                    month = trimmedString;
                    if (month.length > 2 || Number(month) > 12) {
                        field.$setValidity("invalidCardExpiry", false);
                        field.errorMessage = 'Invalid expiry month "' + month + '"';
                        return field.$viewValue;
                    }
                    return month;
                }
                return trimmedString;
            } else {
                return field.$viewValue;
            }
        } else {
            return "";
        }
    }

    function validateCardExpiryField(field) {
        if (field) {
            field.$setValidity("invalidCardExpiry", true);
            field.errorMessage = null;
            if (field.$viewValue) {
                var trimmedString = field.$viewValue.replace(/[^\d\/]/g, '');
                if (trimmedString.match(/\d\/\d/)) {
                    var month = Number(trimmedString.replace(/\/.*/, ""));
                    if (month < 1 || month > 12) {
                        field.$setValidity("invalidCardExpiry", false);
                        field.errorMessage = 'Invalid expiry month "' + month + '"';
                        return false;
                    }
                    var yearString = trimmedString.replace(/[^/]*\//, "");
                    if (yearString.length == 1) yearString = "200" + yearString;
                    if (yearString.length == 2) yearString = "20" + yearString;
                    var year = Number(yearString);
                    if (expiryYearTooBig(year)) {
                        field.$setValidity("invalidCardExpiry", false);
                        field.errorMessage = 'Invalid expiry year "' + year + '"';
                        return false;
                    }
                    var currentDate = new Date();
                    var currentMonth = currentDate.getMonth() + 1;
                    var currentYear = currentDate.getFullYear();
                    if (year < currentYear) {
                        field.$setValidity("invalidCardExpiry", false);
                        field.errorMessage = 'Expiry year "' + year + '" is in the past';
                        return false;
                    }
                    if (year === currentYear && month < currentMonth) {
                        field.$setValidity("invalidCardExpiry", false);
                        field.errorMessage = 'Expiry "' + field.$viewValue + '" is in the past';
                        return false;
                    }
                    return true;
                } else {
                    field.$setValidity("invalidCardExpiry", false);
                    field.errorMessage = 'Invalid expiry "' + trimmedString + '"';
                    return false;
                }
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    function getCardTypeTitle(card) {
        if (card === 'visaelectron') {
            return 'Visa Electron';
        } else if (card === 'maestro') {
            return 'Maestro';
        } else if (card === 'forbrugsforeningen') {
            return 'Forbrugsforeningen';
        } else if (card === 'dankort') {
            return 'Dankort';
        } else if (card === 'visa') {
            return 'Visa';
        } else if (card === 'mastercard') {
            return 'MasterCard';
        } else if (card === 'amex') {
            return 'Amex';
        } else if (card === 'dinersclub') {
            return 'Diners Club';
        } else if (card === 'discover') {
            return 'Discover';
        } else if (card === 'unionpay') {
            return 'UnionPay';
        } else if (card === 'jcb') {
            return 'JCB';
        } else {
            return card;
        }
    }

    function formatAndPartiallyValidateBsbNumberField(field) {
        if (field) {
            field.$setValidity("invalidBsbNumber", true);
            field.errorMessage = null;
            if (field.$viewValue) {
                var trimmedString = field.$viewValue.replace(/[^\d\-]/g, '');
                if (!trimmedString.match(/\-/) && trimmedString.length > 3) {
                    trimmedString = trimmedString.substr(0, 3) + '-' + trimmedString.substr(3);
                }
                if (trimmedString.match(/\-/)) {
                    var firstNumberGroup = trimmedString.replace(/-.*/, "");
                    if (firstNumberGroup.length > 3) {
                        field.$setValidity("invalidBsbNumber", false);
                        field.errorMessage = 'Invalid BSB number"' + field.$viewValue + '"';
                        return trimmedString;
                    }
                    var secondNumberGroup = trimmedString.replace(/[^\-]*-/, "");
                    if (secondNumberGroup.length > 3) {
                        field.$setValidity("invalidBsbNumber", false);
                        field.errorMessage = 'Invalid BSB number"' + field.$viewValue + '"';
                        return trimmedString;
                    }
                    return trimmedString;
                } else {
                    return trimmedString;
                }
            } else {
                return field.$viewValue;
            }
        } else {
            return "";
        }
    }

    function validateBsbNumberField(field) {
        if (field) {
            field.$setValidity("invalidBsbNumber", true);
            field.errorMessage = null;
            if (field.$viewValue) {
                var trimmedString = field.$viewValue.replace(/[^\d\-]/g, '');
                if (!trimmedString.match(/\-/) && trimmedString.length > 3) {
                    trimmedString = trimmedString.substr(0, 3) + '-' + trimmedString.substr(3);
                }
                if (trimmedString.match(/^\d\d\d-\d\d\d$/)) {
                    return true;
                } else {
                    field.$setValidity("invalidBsbNumber", false);
                    field.errorMessage = 'Invalid BSB number"' + field.$viewValue + '"';
                    return false;
                    return false;
                }
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    function extractWindowLocationSearchParameters(windowLocationSearch) {
        var pairs = windowLocationSearch.substring(1).split("&");
        var obj = {};
        var pair;
        var i;

        for (i in pairs) {
            if (pairs[i] === "")
                continue;

            pair = pairs[i].split("=");
            obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }

        return obj;
    }

    function JiService($filter, $modal) {

        this.firstAncestorWithClass = firstAncestorWithClass;
        this.firstAncestorWithTagName = firstAncestorWithTagName;

        this.slidePanelsFromLeft = function (panelAncestorClass) {
            if (!panelAncestorClass) throw new Error("panelAncestorClass must be provided");
            var panels = $("." + panelAncestorClass + " .ji-panel");
            panels.removeClass("slide-right slide-left");
            panels.addClass("slide-right");
        };

        this.slidePanelsFromRight = function (panelAncestorClass) {
            if (!panelAncestorClass) throw new Error("panelAncestorClass must be provided");
            var panels = $("." + panelAncestorClass + " .ji-panel");
            panels.removeClass("slide-right slide-left");
            panels.addClass("slide-left");
        };

        this.checkFieldsValid = function (parentElement) {
            var inputs = angular.element(parentElement).find('input');
            var firstInvalidInput = null;
            for (var i = 0; i < inputs.length; i++) {
                if (!firstInvalidInput && angular.element(inputs[i]).hasClass("ng-invalid")) {
                    firstInvalidInput = inputs[i];
                }
            }
            if (firstInvalidInput) {
                firstInvalidInput.focus();
                return false;
            } else {
                return true;
            }
        };

        this.validateForm = function (form, options) {
            var firstInvalidField = null;
            for (fieldName in form) {
                if (fieldName[0] != '$') {
                    var field = form[fieldName];
                    if (field.isCardNumberField) validateCardNumberField(field, options ? options.expectedCardType : null);
                    if (field.isCardExpiryField) validateCardExpiryField(field);
                    if (field.isBsbNumberField) validateBsbNumberField(field);
                    if (typeof field.$valid != 'undefined' && !field.$valid) {
                        if (!firstInvalidField) firstInvalidField = field;
                        if (field && field.$pristine) {
                            field.$setViewValue(field.$viewValue)
                        }
                    }
                }
            }
            if (firstInvalidField) {
                if (firstInvalidField.element) {
                    firstInvalidField.element.focus();
                }
                return false;
            } else {
                return true;
            }
        };

        this.showErrorDialog = function (response) {
            var dialogTitle, errorMessage;
            if (response) {
                //if (response.ignore) {
                //    return;
                //} else
                if (response.data && response.data.errorName) {
                    dialogTitle = response.data.errorName;
                    errorMessage = response.data.errorMessage ? response.data.errorMessage : JSON.stringify(response);
                } else if (response.error && response.message) {
                    dialogTitle = response.status ? 'HTTP ' + response.status + ' error: ' + response.error : 'Error';
                    errorMessage = response.message;
                } else if (response.data && response.data.error && response.data.message) {
                    dialogTitle = response.data.status ? 'HTTP ' + response.data.status + ' error: ' + response.data.error : 'Error';
                    errorMessage = response.data.message;
                } else if (response.config && response.config.url) {
                    dialogTitle = response.status ? 'HTTP ' + response.status + ' error' : 'Error';
                    errorMessage = response.statusText ? response.statusText + ' for ' + response.config.url : 'For ' + response.config.url;
                } else if (response.message) {
                    dialogTitle = response.status ? 'HTTP ' + response.status + ' error' : 'Error';
                    errorMessage = response.message;
                } else {
                    dialogTitle = 'Error ';
                    errorMessage = typeof response === 'string' ? response : JSON.stringify(response);
                }
            } else {
                dialogTitle = 'Error ';
                errorMessage = '';
            }
            $modal.open({
                template: '<div class="modal-header"><h3 class="modal-title">{{dialogTitle}}</h3></div>\n<div class="modal-body">\n    {{errorMessage}}\n</div>\n<div class="modal-footer">\n    <button class="btn btn-danger" ng-click="ok()">Ok</button>\n</div>',
                controller: function ($scope, $modalInstance, dialogTitle) {
                    $scope.dialogTitle = dialogTitle;
                    $scope.errorMessage = errorMessage;
                    $scope.ok = function () {
                        $modalInstance.close();
                    };
                },
                windowClass: !dialogTitle || dialogTitle.length > 25
                    ? 'ji-error-dialog-lg'
                    : 'ji-error-dialog',
                resolve: {
                    dialogTitle: function () { return dialogTitle; },
                    errorMessage: function () { return errorMessage; }
                },
                backdrop: false
            });
        };

        this.showMessageDialog = function (messageOrOptions) {
            if (messageOrOptions.message) {
                options = messageOrOptions;
            } else {
                options = {message: messageOrOptions};
            }
            if (!options.buttons) {
                options.buttons = [{class: 'btn-primary', title: 'Ok'}]
            }
            $modal.open({
                template: '<div ng-show="options.title" class="modal-header"><h3 class="modal-title" ng-bind-html="options.title"></h3></div>\n<div class="modal-body" ng-bind-html="$sce.trustAsHtml(options.message)"></div>\n<div class="modal-footer" ng-style="!options.title ? {\'border-top-style\': \'none\'} : null">\n    <button ng-repeat="button in options.buttons" class="btn" ng-class="button.class" ng-click="buttonClicked(button)" ng-bind-html="button.title"></button>\n</div>',
                controller: function ($scope, $sce, $modalInstance, options) {
                    $scope.$sce = $sce;
                    $scope.options = options;
                    $scope.buttonClicked = function (button) {
                        $modalInstance.close();
                        if (button.action) {
                            button.action();
                        }
                    };
                },
                windowClass: options.dialogWidth ? 'ji-message-dialog-' + options.dialogWidth : 'ji-message-dialog-250px',
                resolve: {
                    options: function () { return options; }
                },
                backdrop: false
            });
        };

        this.showPickDateDialog = function (dialogTitle) {
            var providedResultHandler;
            $modal.open({
                template: "<div ng-if=\"dialogTitle\" class=\"modal-header\"><h4 class=\"modal-title\">{{dialogTitle}}</h4></div>\n<div class=\"modal-body\" style=\"text-align: center; padding: 15px\">\n    <div style=\"display:inline-block; text-align: right\">\n        <datepicker ng-model=\"selectedDate\" min-date=\"minDate\" show-weeks=\"false\" ng-change=\"dateSelected(selectedDate)\"></datepicker>\n        <button class=\"btn-sm btn-default\" style=\'margin-top: 10px; padding: 3px\' ng-click=\"cancel()\">Cancel</button>\n    </div>\n</div>",
                controller: function ($scope, $modalInstance, dialogTitle) {
                    $scope.dialogTitle = dialogTitle;
                    $scope.dateSelected = function (selectedDate) {
                        if (providedResultHandler) {
                            providedResultHandler(selectedDate);
                        }
                        $modalInstance.close();
                    };
                    $scope.cancel = function () {
                        $modalInstance.close();
                    };
                },
                windowClass: dialogTitle && dialogTitle.length > 25
                    ? 'ji-date-dialog-lg'
                    : 'ji-date-dialog',
                resolve: {
                    dialogTitle: function () { return dialogTitle; }
                },
                backdrop: false
            });
            return {
                then: function (resultHandler) {
                    providedResultHandler = resultHandler;
                }
            }
        };

        this.ngGridTextSearchFilter = function (gridOptions, searchText, item) {
            if (!gridOptions) throw new Error("gridOptions must be provided");
            if (!item) return null;
            if (!searchText) return item;

            var searchRegExp = new RegExp("(" + searchText + ")", "i");
            var newItem = angular.copy(item);
            newItem.originalItem = item;
            var fieldsToSearch = determineFieldsToSearch();

            // Highlight any search pattern occurrences
            findAndHighlightHits(fieldsToSearch);
            if (anythingFound(fieldsToSearch)) {
                return newItem;
            } else {
                return null;
            }

            function anythingFound(fieldNames) {
                for (var i = 0; i < fieldNames.length; i++) {
                    if (item[fieldNames[i]] !== newItem[fieldNames[i]]) {
                        return true;
                    }
                }
                return false;
            }

            function findAndHighlightHits(fieldNames) {
                for (var i = 0; i < fieldNames.length; i++) {
                    if (newItem[fieldNames[i]]) {
                        newItem[fieldNames[i]] = newItem[fieldNames[i]].replace(searchRegExp, "<span class='ji-found-text'>$1</span>");
                    }
                }
            }

            function determineFieldsToSearch() {
                var i, fields = [];
                if (gridOptions.$gridScope) {  // ng-grid
                    var candidateColumns = gridOptions.$gridScope.columns;
                    for (i = 0; i < candidateColumns.length; i++) {
                        if (candidateColumns[i].colDef.textSearchable && candidateColumns[i].visible) {
                            fields.push(candidateColumns[i].field)
                        }
                    }
                } else {                       // ui-grid
                    for (i = 0; i < gridOptions.columnDefs.length; i++) {
                        if (gridOptions.columnDefs[i].textSearchable && (gridOptions.columnDefs[i].visible == undefined || gridOptions.columnDefs[i].visible)) {
                            fields.push(gridOptions.columnDefs[i].field)
                        }
                    }
                }
                return fields;
            }

        };

        this.isIn = function (item, items) {
            for (var i = 0; i < items.length; i++) {
                if (item === items[i]) return true;
            }
            return false;
        };

        this.coalesce = function (item1, item2, item3, item4, item5, item6, item7, item8, item9, item10, item11) {
            if (item11 || item11 === 0) {
                throw new Error('ji-angular coalesce(): A maximum of 10 items can be "coalesced"');
            }
            if (item1 || item1 === 0) return item1;
            else if (item2 || item2 === 0) return item2;
            else if (item3 || item3 === 0) return item3;
            else if (item4 || item4 === 0) return item4;
            else if (item5 || item5 === 0) return item5;
            else if (item6 || item6 === 0) return item6;
            else if (item7 || item7 === 0) return item7;
            else if (item8 || item8 === 0) return item8;
            else if (item9 || item9 === 0) return item9;
            else if (item10 || item10 === 0) return item10;
            else return null;
        };

        this.extractWindowLocationSearchParameters = extractWindowLocationSearchParameters;

    }

    function JobLogService($modal) {

        this.openDialogAndStartJob = openDialogAndStartJob;

        function openDialogAndStartJob(dialogTitle, startUrl, uploadInputFile) {

            // Open the dialog
            return $modal.open({
                template: '<div class="modal-header"><h3 class="modal-title">{{dialogTitle}}</h3></div>\n' +
                          '<div class="modal-body">\n' +
                          '    <textarea ji-scope-element="logTextArea" ng-model="log" readonly style="resize: none; border: none; font-size: 12px; min-height: 350px; width: 100%; padding: 10px"></textarea>\n' +
                          '</div>\n' +
                          '<div class="modal-footer" style="margin-top: -5px">\n' +
                          '    <button ji-scope-element="okButton" class="btn btn-primary" ng-click="ok()" ng-disabled="okButtonDisabled">Ok</button>\n' +
                          '</div>',
                controller: DialogController,
                windowClass: 'ji-job-dialog',
                resolve: {
                    dialogTitle: function () { return dialogTitle; },
                    startUrl: function () { return startUrl; },
                    uploadInputFile: function () { return uploadInputFile; }
                },
                backdrop: false
            });


        }

        function DialogController($scope, $http, $modalInstance, $timeout, ji, dialogTitle, startUrl, uploadInputFile) {

            $scope.dialogTitle = dialogTitle;
            $scope.log = null;
            $scope.ok = ok;
            $scope.okButtonDisabled = true;
            if (uploadInputFile) {
                startUploadJob();
            } else {
                startJob();
            }

            function scrollBottom() {
                $scope.logTextArea[0].scrollTop = $scope.logTextArea[0].scrollHeight;
            }

            function ok() {
                $modalInstance.close();
            }

            function startUploadJob() {
                var formData = new FormData();
                formData.append("file", csvUploadInput.files[0]);
                $http({
                    method: 'POST',
                    url: startUrl,
                    headers: {'Content-Type': undefined},
                    data: formData,
                    transformRequest: function (data, headersGetterFunction) {
                        return data;
                    }
                })
                    .then(function (response) {
                              var job = response.data;
                              $scope.log = job.log;
                              $timeout(scrollBottom, 0);
                              if (job.status === "inProgress") {
                                  $timeout(function () {refreshLog('/jobpool/getJobDetails', job.jobId)}, 1000);
                              } else {
                                  $scope.okButtonDisabled = false;
                                  $timeout(function () {$scope.okButton[0].focus();}, 0);
                              }
                          },
                          function (response) {
                              $scope.okButtonDisabled = false;
                              ji.showErrorDialog(response);
                          });
            }

            function startJob() {
                $http.post(startUrl)
                    .then(function (response) {
                              var job = response.data;
                              $scope.log = job.log;
                              $timeout(scrollBottom, 0);
                              if (job.status === "inProgress") {
                                  $timeout(function () {refreshLog('/jobpool/getJobDetails', job.jobId)}, 1000);
                              } else {
                                  $scope.okButtonDisabled = false;
                                  $timeout(function () {$scope.okButton[0].focus();}, 0);
                              }

                          },
                          function (response) {
                              $scope.okButtonDisabled = false;
                              ji.showErrorDialog(response);
                          });
            }

            function refreshLog(jobDetailsUrl, jobId) {
                $http.post(jobDetailsUrl, jobId)
                    .then(function (response) {
                              var job = response.data;
                              $scope.log = job.log;
                              $timeout(scrollBottom, 0);
                              if (job.status === "inProgress") {
                                  $timeout(function () {refreshLog(jobDetailsUrl, job.jobId)}, 1000);
                              } else {
                                  $scope.okButtonDisabled = false;
                                  $timeout(function () {$scope.okButton[0].focus();}, 0);
                              }

                          },
                          function (response) {
                              $scope.okButtonDisabled = false;
                              ji.showErrorDialog(response);
                          });

            }

        }

    }

    function LogonDialogService($modal) {

        this.open = function (successHandler, requestedPasswordResetHandler, loginProcessingUrl, usernameParameter, passwordParameter) {
            $modal.open({
                template: "<div class=\"modal-header\"><h3 class=\"modal-title\">{{requestingPasswordReset ? 'Reset Password' : 'Logon'}}</h3></div>\n" +
                          "<div class=\"ji-logon-dialog panel-container\" style=\"position: relative; overflow: hidden\">\n" +
                          "\n" +
                          "            <div class=\"modal-body\">\n" +
                          "                <br/>\n" +
                          "\n" +
                          "                <form name=\"mainForm\" ji-form class=\"form-horizontal\" role=\"form\" novalidate>  <!-- novalidate prevents HTML5 validation -->\n" +
                          "                    <div class=\"form-group\" ng-class=\"{ 'has-error' :mainForm.username.$invalid && !mainForm.username.$pristine }\">\n" +
                          "                        <label class=\"col-sm-3 control-label\">Username</label>\n" +
                          "\n" +
                          "                        <div class=\"col-sm-9\">\n" +
                          "                            <input ng-if=\"focusUsername\" name=\"username\" autofocus placeholder=\"username\" class=\"form-control\" ng-model=\"model.username\" required style=\"width: 20em\"\n" +
                          "                                   ng-keyup=\"usernameInputKeyUp($event)\">\n" +
                          "                            <input ng-if=\"!focusUsername\" name=\"username\"          placeholder=\"username\" class=\"form-control\" ng-model=\"model.username\" required style=\"width: 20em\"\n" +
                          "                                   ng-keyup=\"usernameInputKeyUp($event)\">\n" +
                          "\n" +
                          "                            <p ng-show=\"mainForm.username.$jiHasFocus && mainForm.username.$error.required && !mainForm.username.$pristine\" class=\"help-block\">Username is required</p>\n" +
                          "\n" +
                          "                        </div>\n" +
                          "                    </div>\n" +
                          "\n" +
                          "                    <div ng-if=\"!requestingPasswordReset\" class=\"form-group\" ng-class=\"{ 'has-error' :mainForm.password.$invalid && !mainForm.password.$pristine }\">\n" +
                          "                        <label class=\"col-sm-3 control-label\">Password</label>\n" +
                          "\n" +
                          "                        <div class=\"col-sm-9\">\n" +
                          "                            <input ng-if=\"!focusUsername\" name=\"password\" autofocus ji-scope-element=\"passwordInput\" type=\"password\" placeholder=\"password\" class=\"form-control\" ng-model=\"model.password\" required style=\"width: 20em; padding: 6px 12px; font-size: 14px\"\n" +
                          "                                   ng-keyup=\"passwordInputKeyUp(mainForm, $event)\">\n" +
                          "                            <input ng-if=\"focusUsername\" name=\"password\"            ji-scope-element=\"passwordInput\" type=\"password\" placeholder=\"password\" class=\"form-control\" ng-model=\"model.password\" required style=\"width: 20em; padding: 6px 12px; font-size: 14px\"\n" +
                          "                                   ng-keyup=\"passwordInputKeyUp(mainForm, $event)\">\n" +
                          "\n" +
                          "                            <p ng-show=\"mainForm.password.$jiHasFocus && mainForm.password.$error.required && !mainForm.password.$pristine && !logonFailed\" class=\"help-block\">Password is required</p>\n" +
                          "\n" +
                          "                            <p ng-show=\"logonFailed\" class=\"help-block\">Logon failed</p>\n" +
                          "\n" +
                          "                        </div>\n" +
                          "                    </div>\n" +
                          "\n" +
                          "                </form>\n" +
                          "\n" +
                          "            </div>\n" +
                          "            <div style='position: absolute; right: 0; bottom: 0; left: 0'>\n" +
                          "                <div ng-hide=\"requestingPasswordReset || !requestedPasswordResetHandler\" style=\"padding-left: 10px; margin-bottom: 6px\">\n" +
                          "                    <a  ng-click=\"onForgotYourPasswordClick()\" style=\"cursor: pointer\">Forgot your Password?</a>\n" +
                          "                </div>\n" +
                          "                <div class=\"modal-footer\" style='position: relative'>\n" +
                          "                    <div style=\"position:relative; width: 100%\">\n" +
                          "                        <button class=\"btn btn-warning\" style=\"position: absolute; left: 0\" ng-click=\"cancel()\">Cancel</button>\n" +
                          "                        <button class=\"btn btn-primary\" ng-click=\"onOkButtonClick(mainForm)\">{{requestingPasswordReset ? 'Request reset' : 'Logon'}}</button>\n" +
                          "                    </div>\n" +
                          "                </div>\n" +
                          "            </div>\n" +
                          "\n" +
                          "</div>\n",
                controller: 'LogonDialogController',
                windowClass: 'ji-logon-dialog',
                resolve: {
                    requestedPasswordResetHandler: function () {
                        return requestedPasswordResetHandler;
                    },
                    loginProcessingUrl: function () {
                        return loginProcessingUrl;
                    },
                    usernameParameter: function () {
                        return usernameParameter;
                    },
                    passwordParameter: function () {
                        return passwordParameter;
                    }
                },
                backdrop: false
            }).result.then(successHandler);
        }

    }

    function LogonDialogController($scope, $modalInstance, $http, $window, ji, requestedPasswordResetHandler, loginProcessingUrl, usernameParameter, passwordParameter) {

        // Determine the default username (if any)
        var defaultUsername = extractWindowLocationSearchParameters($window.location.search).username;
        if (!defaultUsername) {
            if (html5StorageSupported()) {
                defaultUsername = localStorage.getItem("jiangLastLoggedInAs");
            } else {
                defaultUsername = null;
            }
        }

        $scope.focusUsername = !defaultUsername;
        $scope.requestedPasswordResetHandler = requestedPasswordResetHandler;

        $scope.model = {username: defaultUsername};
        $scope.ji = ji;
        $scope.onOkButtonClick = onOkButtonClick;
        $scope.cancel = cancel;
        $scope.onForgotYourPasswordClick = onForgotYourPasswordClick;
        $scope.usernameInputKeyUp = usernameInputKeyUp;
        $scope.passwordInputKeyUp = passwordInputKeyUp;

        function onForgotYourPasswordClick(event) {
            $scope.requestingPasswordReset = true;
        }

        function usernameInputKeyUp(event) {
            $scope.logonFailed = false;
            if (event.keyCode == 13) {
                $scope.passwordInput[0].focus();
            }
        }

        function passwordInputKeyUp(mainForm, event) {
            $scope.logonFailed = false;
            if (event.keyCode == 13) {
                onOkButtonClick(mainForm);
            }
        }

        function onOkButtonClick(mainForm) {

            // "Touch" all the fields so error messages show on failed validation
            mainForm.username.$setDirty();
            if (mainForm.password) mainForm.password.$setDirty();

            if (ji.validateForm(mainForm)) {
                if ($scope.requestingPasswordReset) {
                    $scope.requestingPasswordReset = false;
                    if (requestedPasswordResetHandler) {
                        requestedPasswordResetHandler($scope.model.username);
                    }
                } else {
                    logon();
                }
            }

        }

        function logon() {
            $http.post('/' + (loginProcessingUrl ? loginProcessingUrl : 'j_security_check'),
                       (usernameParameter ? usernameParameter : 'j_username=') + encodeURIComponent($scope.model.username) + '&' + (passwordParameter ? passwordParameter : 'password') + '=' + encodeURIComponent($scope.model.password),
                {
                    headers: {"Content-type": "application/x-www-form-urlencoded; charset=utf-8"}
                })
                .then(function (response) {
                          $scope.logonFailed = false;
                          if (html5StorageSupported()) {
                              localStorage.setItem("jiangLastLoggedInAs", $scope.model.username);
                          }
                          $modalInstance.close();
                      },
                      function (response) {
                          if (response && (response.status == 401
                                           || response.status == 404)) {  // 404 (not found) shouldn't happen but sometimes the server sends it and it seems best to ignore it and try again
                              $scope.logonFailed = true;
                              $scope.model.password = null;
                              if ($scope.passwordInput) {
                                  $scope.passwordInput[0].focus();
                              }
                          } else {
                              ji.showErrorDialog(response);
                          }
                      }
            );
        }

        function html5StorageSupported() {
            try {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }

    }

    function ResetPasswordDialogService($modal) {

        this.open = function (username, successHandler) {
            $modal.open({
                template: "<div class=\"modal-header\"><h3 class=\"modal-title\">Reset Password</h3></div>\n" +
                          "<div class=\"ji-resetpassword-dialog panel-container\" style=\"position: relative; overflow: hidden\">\n" +
                          "\n" +
                          "    <div>\n" +
                          "        <div>\n" +
                          "            <div class=\"modal-body\">\n" +
                          "                <br/>\n" +
                          "\n" +
                          "                <form name=\"mainForm\" ji-form class=\"form-horizontal\" role=\"form\" novalidate>  <!-- novalidate prevents HTML5 validation -->\n" +
                          "                    <div class=\"form-group\" ng-class=\"{ 'has-error' :mainForm.username.$invalid && !mainForm.username.$pristine }\">\n" +
                          "                        <label class=\"col-sm-4 control-label\">Username</label>\n" +
                          "\n" +
                          "                        <div class=\"col-sm-8\">\n" +
                          "                            <input name=\"username\" disabled placeholder=\"username\" class=\"form-control\" ng-model=\"model.username\" required style=\"width: 20em\"\n" +
                          "                                   ng-keyup=\"usernameInputKeyUp($event)\">\n" +
                          "\n" +
                          "                            <p ng-show=\"mainForm.username.$jiHasFocus && mainForm.username.$error.required && !mainForm.username.$pristine\" class=\"help-block\">Username is required</p>\n" +
                          "\n" +
                          "                        </div>\n" +
                          "                    </div>\n" +
                          "\n" +
                          "                    <div class=\"form-group\" ng-class=\"{ 'has-error' :mainForm.password.$invalid && !mainForm.password.$pristine }\">\n" +
                          "                        <label class=\"col-sm-4 control-label\">Password</label>\n" +
                          "\n" +
                          "                        <div class=\"col-sm-8\">\n" +
                          "                            <input name=\"password\" autofocus ji-scope-element=\"passwordInput\" type=\"password\" placeholder=\"password\" class=\"form-control\" ng-model=\"model.password\" required style=\"width: 20em; padding: 6px 12px; font-size: 14px\"\n" +
                          "                                   ng-keyup=\"passwordInputKeyUp($event)\">\n" +
                          "\n" +
                          "                            <p ng-show=\"mainForm.password.$jiHasFocus && mainForm.password.$error.required && !mainForm.password.$pristine\" class=\"help-block\">Password is required</p>\n" +
                          "\n" +
                          "                            <p ng-show=\"logonFailed\" class=\"help-block\">Logon failed</p>\n" +
                          "\n" +
                          "                        </div>\n" +
                          "                    </div>\n" +
                          "\n" +
                          "                    <div class=\"form-group\" ng-class=\"{ 'has-error' : mainForm.confirmPassword.$invalid && !mainForm.confirmPassword.$pristine }\">\n" +
                          "                        <label class=\"col-sm-4 control-label\">Confirm&nbsp;password</label>\n" +
                          "\n" +
                          "                        <div class=\"col-sm-8\">\n" +
                          "                            <input name=\"confirmPassword\" ji-scope-element=\"confirmPasswordInput\" type=\"password\" placeholder=\"password again\" class=\"form-control\" ng-model=\"model.confirmPassword\" required style=\"width: 20em; padding: 6px 12px; font-size: 14px\"\n" +
                          "                                   ng-keyup=\"confirmPasswordInputKeyUp(mainForm, $event)\">\n" +
                          "\n" +
                          "                            <p ng-show=\"mainForm.confirmPassword.$jiHasFocus && mainForm.confirmPassword.$error.required && !mainForm.confirmPassword.$pristine\" class=\"help-block\">Confirmation of password is required</p>\n" +
                          "\n" +
                          "                            <p ng-show=\"mainForm.confirmPassword.$jiHasFocus && mainForm.confirmPassword.$error.passwordMatch && !mainForm.confirmPassword.$pristine\" class=\"help-block\">Confirmation password does not match password</p>\n" +
                          "\n" +
                          "                        </div>\n" +
                          "                    </div>\n" +
                          "\n" +
                          "                </form>\n" +
                          "\n" +
                          "            </div>\n" +
                          "            <div class=\"modal-footer\">\n" +
                          "                <div style=\"position:relative; width: 100%\">\n" +
                          "                    <button class=\"btn btn-warning\" style=\"position: absolute; left: 0\" ng-click=\"cancel()\">Cancel</button>\n" +
                          "                    <button class=\"btn btn-primary\" ng-click=\"onOk(mainForm)\">Ok</button>\n" +
                          "                </div>\n" +
                          "            </div>\n" +
                          "        </div>\n" +
                          "    </div>\n" +
                          "\n" +
                          "</div>\n",
                controller: 'ResetPasswordDialogController',
                windowClass: 'ji-resetpassword-dialog',
                resolve: {
                    username: function () {
                        return username;
                    }
                },
                backdrop: false
            }).result.then(successHandler);
        }

    }

    function ResetPasswordDialogController($scope, $modalInstance, ji, username) {

        $scope.model = {username: username};
        $scope.ji = ji;
        $scope.onOk = onOk;
        $scope.cancel = cancel;
        $scope.usernameInputKeyUp = usernameInputKeyUp;
        $scope.passwordInputKeyUp = passwordInputKeyUp;
        $scope.confirmPasswordInputKeyUp = confirmPasswordInputKeyUp;

        function usernameInputKeyUp(event) {
            $scope.logonFailed = false;
            if (event.keyCode == 13) {
                $scope.passwordInput[0].focus();
            }
        }

        function passwordInputKeyUp(event) {
            if (event.keyCode == 13 && $scope.model.password) {
                $scope.confirmPasswordInput[0].focus();
            }
        }

        function confirmPasswordInputKeyUp(mainForm, event) {
            mainForm.confirmPassword.$setValidity('passwordMatch', true);
            if (event.keyCode == 13) {
                onOk(mainForm);
            }
        }

        function onOk(mainForm) {

            // "Touch" all the fields so error messages show on failed validation
            mainForm.password.$setDirty();
            mainForm.confirmPassword.$setDirty();

            // Close modal and return password
            if (ji.validateForm(mainForm)) {
                if ($scope.model.password === $scope.model.confirmPassword) {
                    $modalInstance.close($scope.model.password);
                } else {
                    mainForm.confirmPassword.$setValidity('passwordMatch', false);
                    $scope.confirmPasswordInput[0].focus();
                }
            }

        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }

    }

})();

// This is reluctantly added as a global because it needs to be accessed at the config stage
// by angularjs where it would not be possible to make it available as a service etc
JiConfig = {

    baseAppConfig: function ($provide, $httpProvider) {

        // If $httpProvider.responseInterceptors exists then angular 1.2.x is being used
        if ($httpProvider.responseInterceptors) {
            $httpProvider.responseInterceptors.push(JiConfig.logonPageToUnauthorizedResponseTransformFunction);
        } else {
            $httpProvider.interceptors.push(JiConfig.logonPageToUnauthorizedResponseInterceptor);
        }

        // default exception handler just logs uncaught exceptions - this will show an alert also
        $provide.decorator("$exceptionHandler", function ($delegate) {
            return function (exception, cause) {
                $delegate(exception, cause);
                var errorMessage, causeMessage;
                if (typeof exception === "string") {
                    errorMessage = exception;
                } else if (exception.message) {
                    errorMessage = exception.message;
                } else {
                    errorMessage = angular.toJson(exception, "pretty");
                }
                if (cause) {
                    alert('exception:\n' + errorMessage
                          + '\n\ncause:\n' + (typeof cause === "string" ? cause : angular.toJson(cause, "pretty")));
                } else {
                    alert(errorMessage);
                }
            };
        });


        // This is commented out as it seems to conflict with the spring url
        // Conditionally set the html5Mode to remove the # in the urls (if possible)
//                if (window.history && window.history.pushState) {
//                    $locationProvider.html5Mode(true);
//                }

    },

    // Deprecated - only present to support angular 1.2.
    // Use logonPageToUnauthorizedResponseInterceptor below for angular 1.3
    logonPageToUnauthorizedResponseTransformFunction: function ($q) {
        return function (promise) {
            return promise.then(
                function (response) {

                    if (response.status === 200
                        && response.data
                        && typeof response.data === "string"
                        && response.data.substr(0, 22) === '<!-- logonPageFlag -->') {

                        // Alter response
                        response.status = 401;
                        response.statusText = 'Unauthorized';
                        response.generatedByLogonPageToUnauthorizedResponseTransformFunction = true;
                        response.data = "HTTP 401: Unauthorized" + (response.config && response.config.url ? ' for ' + response.config.url : '');

                        return $q.reject(response);

                    } else {
                        return response;
                    }


                },
                function (response) {
                    return $q.reject(response);
                });

        }

    },

    // This is compatible with angular 1.3
    logonPageToUnauthorizedResponseInterceptor: function ($q) {

        return {
            'response': function (response) {

                if (response.status === 200
                    && response.data
                    && typeof response.data === "string"
                    && response.data.substr(0, 22) === '<!-- logonPageFlag -->') {

                    // Alter response
                    response.status = 401;
                    response.statusText = 'Unauthorized';
                    response.generatedByLogonPageToUnauthorizedResponseTransformFunction = true;
                    response.data = "HTTP 401: Unauthorized" + (response.config && response.config.url ? ' for ' + response.config.url : '');

                    return $q.reject(response);

                } else {
                    return response;
                }

            }
        };

    }

};