var app = angular.module('calculatorApp', []);
app.controller('calculatorCtrl', function($scope, $http) {
    $scope.grid = [
        ['⁺∕₋', '7', '8', '9', '÷'],
        ['√', '4', '5', '6', '×'],
        ['AC', '1', '2', '3', '-'],
        ['C', '0', '.', '=', '+']
    ]

    var operations = {
        '0': digit,
        '1': digit,
        '2': digit,
        '3': digit,
        '4': digit,
        '5': digit,
        '6': digit,
        '7': digit,
        '8': digit,
        '9': digit,
        '.': decimalPoint,
        '=': equals,
        '⁺∕₋': unaryOperator,
        '√': unaryOperator,
        '÷': binaryOperator,
        '×': binaryOperator,
        '-': binaryOperator,
        '+': binaryOperator,
        'C': clear,
        'AC': allClear
    }

    allClear();

    const displaySize = 15;

    function minusPresent() {
        return ($scope.stack[0].indexOf("-") != -1);
    }

    function decimalPointPresent() {
        return ($scope.stack[0].indexOf(".") != -1);
    }

    function digit(d) {
        if (operations[$scope.stack[0]] == equals) {
            allClear();
        }

        if (operations[$scope.stack[0]] == binaryOperator) {
            $scope.stack.unshift('');
        } else if (operations[$scope.stack[0]] == unaryOperator) {
            allClear();
        }

        $scope.stack[0] = ($scope.stack[0] + d).substring(0, displaySize + (decimalPointPresent() ? 1 : 0) + (minusPresent() ? 1 : 0));
    }

    function decimalPoint() {
        if (operations[$scope.stack[0]] == equals) {
            allClear();
        }

        if (operations[$scope.stack[0]] == binaryOperator) {
            $scope.stack.unshift('');
        } else if (operations[$scope.stack[0]] == unaryOperator) {
            allClear();
        }

        if (!decimalPointPresent()
            && operations[$scope.stack[0]] != equals
            && operations[$scope.stack[0]] != unaryOperator) {
            $scope.stack[0] += $scope.stack[0].length ? "." : "0.";
        }
    }

    function unaryOperator(operator) {
        if (operations[$scope.stack[0]] == binaryOperator) {
            $scope.stack[0] = operator;
        } else {
            if (!$scope.stack[0]) {
                $scope.stack[0] = '0';
            }
            $scope.stack.unshift(operator);
        }
    }

    function binaryOperator(operator) {
        if (operations[$scope.stack[0]] == binaryOperator) {
            $scope.stack[0] = operator;
        } else {
            if (!$scope.stack[0]) {
                $scope.stack[0] = '0';
            }
            $scope.stack.unshift(operator);
        }
    }

    function equals(operator) {
        if ($scope.stack[0] != operator) {
            if (operations[$scope.stack[0]] == binaryOperator) {
                $scope.stack[0] = operator;
            } else {
                $scope.stack.unshift(operator);
            }
        }
    }

    function clear() {
        if ($scope.stack.length == 1 || operations[$scope.stack[0]] == equals) {
            allClear();
        } else if (!(operations[$scope.stack[0]] == binaryOperator
            || operations[$scope.stack[0]] == unaryOperator)) {
            $scope.stack.shift();
            $scope.stack.unshift("");
        }
    }

    function allClear() {
        $scope.stack = [""];
        promise = null;
        processing = false;
    }

    var processing = false;
    var promise = null;
    function calculateBinary(operator, leftOperand, rightOperand) {
        processing = true;
        promise = $http.get('/api/calculation', {
            params: { leftOperand: leftOperand, rightOperand: rightOperand, operation: operator }
        }).then(function (result) {
            if (promise) {
                processing = false;
                $scope.stack.splice(-3, 3);
                $scope.stack.push(result.data);
                console.log($scope.stack);
                process();
            }
        });
    }

    function calculateUnary(operator, operand, position) {
        processing = true;
        var i = position;
        promise = $http.get('/api/calculation', {
            params: { leftOperand: operand, operation: operator }
        }).then(function (result) {
            if (promise) {
                processing = false;
                $scope.stack.splice($scope.stack.length - i, 2, result.data);
                if ($scope.stack.length == 1) {
                    $scope.stack.unshift("=");
                }
                console.log($scope.stack);
                process();
            }
        });
    }

    function process() {
        if (processing) return;

        if ($scope.stack.length > 2 && operations[$scope.stack[$scope.stack.length - 2]] == equals) {
            $scope.stack.splice(-2, 1);
        }

        if ($scope.stack.length > 1) {
            for (var i = $scope.stack.length - 2; i >= 0; i--) {
                if (operations[$scope.stack[i]] == unaryOperator && operations[$scope.stack[i + 1]] != equals) {
                    calculateUnary($scope.stack[i], $scope.stack[i + 1], $scope.stack.length - i);
                    return;
                }
            }

        }
        if ($scope.stack.length > 3 || $scope.stack.length == 3 && $scope.equals) {
            if (operations[$scope.stack[$scope.stack.length - 2]] == binaryOperator) {
                calculateBinary($scope.stack[$scope.stack.length - 2], $scope.stack[$scope.stack.length - 1], $scope.stack[$scope.stack.length - 3]);
            }
        }
    }

    $scope.displayValue = function () {
        var displayValueAt = 0;
        while (operations[$scope.stack[displayValueAt]] == binaryOperator
            || operations[$scope.stack[displayValueAt]] == unaryOperator || operations[$scope.stack[displayValueAt]] == equals) {
            displayValueAt++;
        }
        return ($scope.stack[displayValueAt] || "0");
    }

    $scope.buttonClicked = function (symbol) {
        operations[symbol](symbol);
        process();
        console.log($scope.stack);
    }
});
