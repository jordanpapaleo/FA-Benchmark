angular.module('famous-angular', [
    'famous.angular', 'ts.sheets'
])

//****************************
//THIS BOILERPLATE BELONGS IN THE LIBRARY.  UNDER DEVELOPMENT
//****************************
    .config(function($mediaProvider, $famousProvider) {

        var $famous = $famousProvider.$get();

        var FAMOUS_FIELD_HANDLERS = [
            {
                field: 'transform',
                handlerFn: function(element, payloadFn){
                    var isolate = $famous.getIsolate(angular.element(element).scope());
                    isolate.modifier.transformFrom(payloadFn);
                }
            },
            {
                field: 'size',
                handlerFn: function(element, payloadFn){
                    var isolate = $famous.getIsolate(angular.element(element).scope());
                    isolate.modifier.sizeFrom(payloadFn);
                }
            },
            {
                field: 'origin',
                handlerFn: function(element, payloadFn){
                    var isolate = $famous.getIsolate(angular.element(element).scope());
                    isolate.modifier.originFrom(payloadFn);
                }
            },
            {
                field: 'align',
                handlerFn: function(element, payloadFn){
                    var isolate = $famous.getIsolate(angular.element(element).scope());
                    isolate.modifier.alignFrom(payloadFn);
                }
            },
            {
                field: 'opacity',
                handlerFn: function(element, payloadFn){
                    var isolate = $famous.getIsolate(angular.element(element).scope());
                    isolate.modifier.opacityFrom(payloadFn);
                }
            }
        ];

        angular.forEach(FAMOUS_FIELD_HANDLERS, function(fieldHandler) {
            $mediaProvider.$registerFieldHandler(fieldHandler.field, fieldHandler.handlerFn);
        });
    })

//******************
//END BOILERPLATE THAT BELONGS IN LIBRARY
//******************



    .controller('MainCtrl', function($scope, $famous, $timeline, $media) {


        // Famo.us imports

        var Transitionable = $famous['famous/transitions/Transitionable'];
        var Easing = $famous['famous/transitions/Easing'];
        var EventHandler = $famous['famous/core/EventHandler'];
        var Transform = $famous['famous/core/Transform'];



        // *********************************
        // THESE FUNCTIONAL HELPERS BELONG IN LIBRARY.
        // UNDER DEVELOPMENT.
        // some fn utils for working with sheets
        // *********************************
        var compose =  function() {
            var binary_compose = function(f, g) {
                return function() {
                    return f(g.apply(null, arguments));
                };
            };
            return Array.prototype.slice.call(arguments).reduce(binary_compose);
        };

        var always = function(x) { return function() { return x; }; }

        // pull some transform methods into fns that are easier to work with
        var translate = function(xyz) { return Transform.translate.apply(Transform, xyz); }

        var multiply = function(transforms) {
            return function(t) {
                return Transform.multiply.apply(
                    null,
                    transforms.map(function(transform) {
                        // coerce any scalars into a length-one array
                        var params = [].concat(transform[1](t));
                        return Transform[transform[0]].apply(null, params);
                    })
                );
            };
        };

        // vector utils
        var vectorAdd = function(a, b) {
            return a.map(function(x, i) { return x + b[i]; });
        };
        var vectorMult = function(a, b) {
            // elementwise
            return a.map(function(x, i) { return x * b[i]; });
        };

        var Z = function(level) {
            // returns a function that takes a vector, and sets its;
            // z component to the supplied level. If no vector is provided
            // provies a vector [0, 0, level].
            return function(v) {
                v = v || [0, 0, 0];
                v[2] = level;
                return v;
            };
        };
        //**********************
        //END BOILERPLATE THAT BELONGS IN LIBRARY
        //**********************

        //******************
        // BEGIN ACTUAL APPLICATION LOGIC
        //******************

        // Detail zoom state
        var t = new Transitionable(2);
        var getT = t.get.bind(t);

        // currently selected album by index
        $scope.detail = 0;

        $scope.detailFor = function(i) {
            $scope.zoomed = true;
            $scope.detail = i;
            t.set(2, {duration: 800});
        };

        $scope.closeDetail = function() {
            t.set(0, {duration: 800}, function() {
                $scope.zoomed = false;
            });
        };

        // layout functions and constants
        var width = 320;
        var margin = 5;
        var gutter = 5;

        var gridTileSize = function() {
            var tileWidth = (width - gutter - margin * 2) / 2;
            return [tileWidth, ((650 + (65 / 32) * 125) / 650) * tileWidth];
        };

        $scope.gridPosition = function(i) {
            var coordinates = [Math.floor(i / 2), (i % 2)];
            size = gridTileSize();
            return [margin + coordinates[0] * (size[0] + gutter),
                margin + coordinates[1] * (size[1] + gutter),
                0];
        };

        var tilePosition = function(i) {
            if (i === 0) { return [0, 0, 0]; }
            else { return vectorAdd($scope.gridPosition(i - 1),
                [0, (width / 2), 0]); }
        };

        var tileSize = function(i) {
            if (i === 0) { return width / 2; }
            else { return gridTileSize()[0]; }
        }

        $scope.tileOpacity = function(i) {
            if (i !== $scope.detail) { return 1; }
            else return $timeline([
                [0, 1],
                [0.01, 0]
            ])(t.get());
        };
        window.t = t;

        $media.$sheet('kodaline', {
            //note that entirely separate layouts for
            //different screen sizes can be declared here
            //only 'xs' is used in this example.
            xs: {
                '#header': {
                    transform: compose(translate, Z(3))
                },
                '#header-highlight': {
                    transform: compose(translate, $timeline([
                        [1, [0, 20, 0]],
                        [1.4, [0, 0, 0]]
                    ]), getT),
                    size: [undefined, 20]
                },
                '#tile-grid': {
                    transform: compose(translate, Z(1))
                },
                '.hero-tile': {
                    size: [width / 2, width / 2]
                },
                '.tile-outer': {
                    size: gridTileSize
                },
                '.tile-label': {
                    transform: compose(translate, function() {
                        return [0, gridTileSize()[0]];
                    })
                },
                '#overlay-scrim': {
                    opacity: compose($timeline([
                        [0, 0],
                        [1, 0.5]
                    ]), getT),
                    transform: compose(translate, Z(2))
                },
                '#detail-view-outer': {
                    transform: multiply([
                        ['translate', function() {
                            var start = tilePosition($scope.detail);
                            if (getT() === 0) {
                                return Z(0)(start);
                            }
                            else if (getT() < 0.01) {
                                return Z(2)(start);
                            }
                            else {
                                var midpoint = vectorMult(start, [0, 1, 1])
                                return $timeline([
                                    [0.01, Z(2)(start)],
                                    [.5, Z(2)(midpoint)],
                                    [1, Z(5)([0, -55, 0])]
                                ])(getT());
                            }
                        }],
                        ['scale', function() {
                            var start = tileSize($scope.detail) / width;
                            return $timeline([
                                [0, [start, start]],
                                [.5, [1, 1]],
                            ])(getT());
                        }]
                    ]),
                    opacity: $timeline([
                        [0.001, 0],
                        [1, 1]
                    ])
                },
                '#detail-title': {
                    size: function() {
                        return [width, (190 / 323) *  width];
                    },
                    transform: multiply([
                        ['translate', always([0, 320, 0])],
                        ['scale', compose($timeline([
                            [1, [1, 0]],
                            [1.5, [1, 1]],
                        ]), getT)]
                    ])
                },
                '#detail-tracks': {
                    size: [undefined, 50]
                },
                '#detail-play-button': {
                    transform: multiply([
                        ['translate', always([width * 0.8, 0, 2])],
                        ['scale', compose($timeline([
                            [1.5, [0, 0]],
                            [2, [1, 1]],
                        ]), getT)]
                    ]),
                    origin: [.5, .5],
                    size: [50, 50],
                },
                '.detail-title-ui': {
                    opacity: compose($timeline([
                        [0, 0],
                        [1.5, 0],
                        [2, 1]
                    ]), getT)
                },
                '#detail-footer': {
                    align: [0, 1],
                    origin: [0, 1]
                },
                '#footer-now-playing': {
                    transform: compose(translate, Z(3))
                },
                '#footer-navigation': {
                    transform: compose(translate, Z(5), always([0, 49, 0]))
                }
            }
        });

        $scope.tiles = [
            { url: 'images/tile1.png', active: false, label: 'images/tile3_label.png' },
            { url: 'images/tile3.png', active: false, label: 'images/tile3_label.png' },
            { url: 'images/tile4.png', active: false, label: 'images/tile4_label.png' },
            { url: 'images/tile5.png', active: false, label: 'images/tile3_label.png' },
            { url: 'images/tile6.png', active: false, label: 'images/tile4_label.png' },
        ];
    });
