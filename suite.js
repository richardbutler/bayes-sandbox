var _   = require( "underscore" ),
    Pmf = require( "./pmf" );

var Suite = function( hypotheses ) {
    Pmf.apply( this, arguments );
    
    var self = this;
    
    if ( hypotheses ) {
        hypotheses.forEach( function( hypothesis ) {
            self.set( hypothesis, 1 );
        });
        
        this.normalise();
    }
};

Suite.prototype = new Pmf();

_.extend( Suite.prototype, {
    
    update: function( data ) {
        var self = this;
        
        this.forEach( function( hypothesis ) {
            var likelihood = self.likelihood( hypothesis, data );
            
            self.multiply( hypothesis, likelihood );
        });
        
        this.normalise();
    },
    
    likelihood: function( hypothesis, data ) {
        if ( hypothesis < data ) {
            return 0;
        }
        return 1 / hypothesis;
    }
    
});

module.exports = Suite;