var Pmf = function() {
    this.d = {};
};

Pmf.prototype = {
    
    set: function( key, value ) {
        this.d[ key ] = value;
    },
    
    get: function( key, def ) {
        def = def > 0 ? def : 0;
        var value = this.d[ key ];
        return value !== undefined ? value : def;
    },
    
    normalise: function() {
        var total = this.total(),
            factor = 1 / total,
            self = this;
        
        if ( total === 0 ) {
            throw new Error( "Total probability is zero." );
            return total;
        }
        
        this.forEach( function( hypothesis ) {
            var value = self.get( hypothesis, 0 ) * factor;
            self.set( hypothesis, value );
        });
        
        return this.d;
    },
    
    total: function() {
        var t = 0,
            self = this,
            key;
        
        this.forEach( function( hypothesis ) {
            t += self.get( hypothesis );
        });
        
        return t;
    },
    
    forEach: function( func ) {
        Object.keys( this.d ).forEach( func );
    },
    
    multiply: function( hypothesis, factor ) {
        var value = this.get( hypothesis ) * factor;
        this.set( hypothesis, value );
        return value;
    },
    
    mean: function() {
        var total = 0,
            self = this;
        
        this.forEach( function( hypothesis ) {
            var value = hypothesis * self.get( hypothesis );
            
            total += value;
        });
        
        return total;
        //return this.total() / this.length();
    },
    
    length: function() {
        return Object.keys( this.d ).length;
    }
};

module.exports = Pmf;