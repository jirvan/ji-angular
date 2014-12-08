/*

 ji-angular-1.0.66.js

 Copyright (c) 2014 Jirvan Pty Ltd
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

jiAngNamespace();
function jiAngNamespace() {

    angular.module('jiAng', [])

        //========== jiAng service ==========//
        .factory('jiAng', ['$filter', '$modal', function ($filter, $modal) { return new JiAngService($filter, $modal); }])

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
                               var formName = element[0].getAttribute("name");
                               if (formName) {
                                   var form = scope[formName];
                                   for (fieldName in form) {
                                       if (fieldName[0] != '$' && form[fieldName] && form[fieldName].$pristine) {
                                           var field = form[fieldName];
                                           var inputs = element.find("input");
                                           for (var i = 0; i < inputs.length; i++) {
                                               if (inputs[i].getAttribute("name") === fieldName) {
                                                   field.element = inputs[i];
                                                   inputs[i].onfocus = function (event) {
                                                       var targetName = event.target.getAttribute("name");
                                                       if (targetName && scope[formName] && scope[formName][targetName]) {
                                                           $timeout(function () {scope.$eval(formName + "." + targetName + ".$jiHasFocus = true")}, 0);
                                                       }
                                                   };
                                                   inputs[i].onblur = function () {
                                                       var targetName = event.target.getAttribute("name");
                                                       if (targetName && scope[formName] && scope[formName][targetName]) {
                                                           $timeout(function () {scope.$eval(formName + "." + targetName + ".$jiHasFocus = false")}, 0);
                                                       }
                                                   };
                                               }
                                           }
                                       }
                                   }
                               } else {
                                   throw new Error("ji-form: Form element does not have a name")
                               }
                           }
                       };
                   }])

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

    function JiAngService($filter, $modal) {

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

        this.showErrorDialog = function (reponse) {
            var dialogTitle, errorMessage;
            if (reponse.data) {
                if (reponse.data.errorName) {
                    dialogTitle = reponse.data.errorName;
                    errorMessage = reponse.data.errorMessage;
                } else {
                    dialogTitle = 'HTTP Error ';
                    errorMessage = (reponse.statusText ? reponse.statusText : reponse.status);
                    ;
                }
            } else {
                dialogTitle = 'HTTP Error ';
                errorMessage = (reponse.statusText ? reponse.statusText : reponse.status);
                ;
            }
            $modal.open({
                            template: '<div class="modal-header"><h3 class="modal-title">{{dialogTitle}}</h3></div>\n' +
                                      '<div class="modal-body">\n' +
                                      '    {{errorMessage}}\n' +
                                      '</div>\n' +
                                      '<div class="modal-footer">\n' +
                                      '    <button class="btn btn-danger" ng-click="ok()">Ok</button>\n' +
                                      '</div>',
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

        this.ngGridTextSearchFilter = function (gridOptions, searchText, item) {
            if (!gridOptions) throw new Error("gridOptions must be provided");
            if (!item) return null;
            if (!searchText) return item;

            var searchRegExp = new RegExp("(" + searchText + ")", "i");
            var newItem = angular.copy(item);
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
                    newItem[fieldNames[i]] = newItem[fieldNames[i]].replace(searchRegExp, "<span class='ji-found-text'>$1</span>");
                }
            }

            function determineFieldsToSearch() {
                var fields = [],
                    candidateColumns = gridOptions.$gridScope.columns;
                for (var i = 0; i < candidateColumns.length; i++) {
                    if (candidateColumns[i].colDef.textSearchable && candidateColumns[i].visible) {
                        fields.push(candidateColumns[i].field)
                    }
                }
                return fields;
            }

        }

    }

}