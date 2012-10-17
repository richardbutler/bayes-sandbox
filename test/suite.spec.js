var Suite = require( "../suite" );

var toBeApprox = function( precision ) {
    precision = precision || 2;
    
    function fixValue( value, precision ) {
        var parts = String( value ).split( "." );
        return parts.length === 1 ? parts[ 0 ] :
            [ parts[ 0 ], parts[ 1 ].substr( 0, precision ) ].join( "." );
    };
    
    return function( expected ) {
        var maxPrecision = ( String( expected ).split( "." ).pop() || "" ).length,
            actualPrecision = Math.min( precision, maxPrecision ),
            actualValue = fixValue( this.actual, actualPrecision ),
            expectedValue = fixValue( expected, actualPrecision );
        
        return Number( actualValue ) === Number( expectedValue );
    };
};

describe( "suite", function() {
    
    beforeEach( function() {
        this.addMatchers({
            toBeApprox: toBeApprox( 3 )
        });
    });
    
    it( "should recognise the cookie problem", function() {
        
        var cookieSuite = new Suite([ "Bowl 1", "Bowl 2" ]);
        cookieSuite.mixes = {
            "Bowl 1": {
               vanilla: 0.75,
               chocolate: 0.25
            },
            "Bowl 2": {
               vanilla: 0.5,
               chocolate: 0.5
            }
        };
        cookieSuite.likelihood = function( hypothesis, data ) {
            var mix = this.mixes[ hypothesis ],
                likelihood = mix[ data ];
            
            return likelihood;
        };
        cookieSuite.update( "vanilla" );
        
        expect( cookieSuite.get( "Bowl 1" ) ).toBe( 0.375 * 1.6 ); // 0.6000000001ish
        expect( cookieSuite.get( "Bowl 2" ) ).toBe( 0.4 );
        
    });
    
    it( "should recognise the Monty Hall problem", function() {
        
        var montySuite = new Suite([ "A", "B", "C" ]);
        montySuite.likelihood = function( hypothesis, data ) {
            switch ( hypothesis ) {
                case data: {
                    return 0;
                }
                case "A": {
                    return .5;
                }
                default: {
                    return 1;
                }
            };
        };
        montySuite.update( "B" );
        
        expect( montySuite.get( "A" ) ).toBe( 1/3 );
        expect( montySuite.get( "B" ) ).toBe( 0 );
        expect( montySuite.get( "C" ) ).toBe( 2/3 );
        
    });
    
    describe( "M&M problem", function() {
        
        var mix94 = {
                brown:  30,
                yellow: 20,
                red:    20,
                green:  10,
                orange: 10,
                tan:    10
            },
            mix96 = {
                blue:   24,
                green:  20,
                orange: 16,
                yellow: 14,
                red:    13,
                brown:  13
            },
            hypo1 = {
                bag1: mix94,
                bag2: mix96
            },
            hypo2 = {
                bag1: mix96,
                bag2: mix94
            },
            hypotheses = {
                A: hypo1,
                B: hypo2
            };
        
        var MMSuite = function( hypotheses ) {
            Suite.apply( this, arguments );
        },
            mmSuite;
        
        MMSuite.prototype = new Suite();
        MMSuite.prototype.likelihood = function( hypothesis, data ) {
            var bag = data.bag,
                color = data.color,
                mix = hypotheses[ hypothesis ][ bag ],
                likelihood = mix[ color ];
            
            return isNaN( likelihood ) ? 0 : likelihood;
        };
        
        beforeEach( function() {
            mmSuite = new MMSuite([ "A", "B" ]);
        });
        
        it( "should recognise the M&M problem (1)", function() {
        
            mmSuite.update({
                bag: "bag1",
                color: "yellow"
            });
            mmSuite.update({
                bag: "bag2",
                color: "green"
            });
            
            // NC: 325
            // p(H) | p(D|H)    | p(H) p(D|H)   | p(H|D)
            // 1/2  | (20)(20)  | 200           | 20/27
            // 1/2  | (10)(14)  |  70           |  7/27
            
            expect( mmSuite.get( "A" ) ).toBeApprox( 20/27 );
            expect( mmSuite.get( "B" ) ).toBeApprox( 7/27 );
            
        });
        
        it( "should recognise the M&M problem (2)", function() {
            
            mmSuite.update({
                bag: "bag1",
                color: "red"
            });
            mmSuite.update({
                bag: "bag2",
                color: "brown"
            });
            
            // NC: 325
            // p(H) | p(D|H)    | p(H) p(D|H)   | p(H|D)
            // 1/2  | (20)(13)  | 130           | 130/325
            // 1/2  | (30)(13)  | 195           | 195/325
            
            expect( mmSuite.get( "A" ) ).toBeApprox( 130/325 );
            expect( mmSuite.get( "B" ) ).toBeApprox( 195/325 );
            
        });
        
        it( "should recognise the M&M problem (3)", function() {
            
            mmSuite.update({
                bag: "bag1",
                color: "red"
            });
            mmSuite.update({
                bag: "bag2",
                color: "blue"
            });
            
            expect( mmSuite.get( "A" ) ).toBe( 1 );
            expect( mmSuite.get( "B" ) ).toBe( 0 );
            
        });
        
    });
    
    describe( "dice problem", function() {
        
        var diceSuite;
        
        beforeEach( function() {
            diceSuite = new Suite([ 4, 6, 8, 12, 20 ]);
        });
        
        it( "should recognise the simple dice problem", function() {
            
            diceSuite.update( 6 );
            
            expect( diceSuite.get( 4 ) ).toBe( 0 );
            expect( diceSuite.get( 6 ) ).toBeApprox( 0.392 );
            expect( diceSuite.get( 8 ) ).toBeApprox( 0.294 );
            expect( diceSuite.get( 12 ) ).toBeApprox( 0.196 );
            expect( diceSuite.get( 20 ) ).toBeApprox( 0.117 );
            
        });
        
        it( "should recognise the complex dice problem", function() {
            
            [ 6, 6, 8, 7, 7, 5, 4 ].forEach( function( value ) {
                diceSuite.update( value );
            });
            
            expect( diceSuite.get( 4 ) ).toBe( 0 );
            expect( diceSuite.get( 6 ) ).toBeApprox( 0 );
            expect( diceSuite.get( 8 ) ).toBeApprox( 0.943 );
            expect( diceSuite.get( 12 ) ).toBeApprox( 0.055 );
            expect( diceSuite.get( 20 ) ).toBeApprox( 0.001 );
            
        });
    
    });
    
    it( "should recognise the locomotive problem", function() {
            
        var hypotheses = [],
            locoSuite,
            i;
            
        while ( hypotheses.length < 1000 ) {
            hypotheses.push( hypotheses.length + 1 );
        }
        
        locoSuite = new Suite( hypotheses );
        locoSuite.update( 60 );
        
        var total = 0;
        
        for ( i = 0; i < hypotheses.length; i++ ) {
            total += hypotheses[ i ] * locoSuite.get( hypotheses[ i ] );
        }
        
        expect( total ).toBeApprox( 333.4 );
        
    });
    
});
