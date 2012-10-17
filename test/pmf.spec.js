var Pmf = require( "../pmf" );

describe( "Pmf", function() {
    
    var pmf;
    
    beforeEach( function() {
        pmf = new Pmf();
    });
    
    it( "should set and retrieve", function() {
        pmf.set( "B1", 1.5 );
        
        expect( pmf.get( "B1" ) ).toBe( 1.5 );
    });
    
    it( "should normalise", function() {
        pmf.set( "B1", 2.5 );
        pmf.set( "B2", 2.5 );
        pmf.normalise();
        
        expect( pmf.get( "B1" ) ).toBe( .5 );
        expect( pmf.get( "B2" ) ).toBe( .5 );
    });
    
});
