'use strict';
/**
 * Cookie as defined here http://www.ietf.org/rfc/rfc2109.txt
 * We use cookie.Domain, cookie.Path cookie['Max-Age'] so the original names !
 * values may not contain ; , or ' '
 * only these characters must be url encoded or the value must be put in double quotes "
 * all chars should be only US-ASCII or encoded otherwise
 * (this does NOT mean that chars like ? & etc must be encoded (as some implementations do..) )
 */

var extend = require('x-common').extend;

var M = module.exports = {
	cookie: {
		serialize: function(cookies_name_value){
			var cookies=[];
			for( var name in cookies_name_value ) {
				cookies.push(name + '=' + cookies_name_value[name]);
			}
			return cookies.join('; '); // no space so more netscape like
		},
		parse: function(header_values) { // returns values in object as { name : value , ... }
			var cookies_name_value={};
			
			if(!header_values) return cookies_name_value;
			
			if(!Array.isArray(header_values)) header_values=[header_values];
			
			for(var h=0, hl=header_values.length; h<hl; h++) {
				var cookies = header_values[h];
				
				if(cookies) cookies = cookies.split(';');
				if(cookies) {
					for(var ci=0, cl=cookies.length; ci<cl; ci++ ){
						var
							cookie    = cookies[ci],
							equal     = cookie.indexOf('='),
							matched   = false,
							name      = ~equal ? cookie.substring(0,equal).trim() : cookie.trim(),
							value     = ~equal ? cookie.substring(equal+1).trim() : void 0;
						
						cookies_name_value[name] = value;
					}
				}
			}
			return cookies_name_value;
		}
	},
	set_cookie: {
		// returns values to set the Set-Cookie header
		// cookies is object or an array like
		// [ {
		//   name     : 'name',
		//   value    : 'value',
		//   Path     : '/path',
		//   Domain   : '.domain.org',
		//   Max-Age  : 200,  in seconds, 0 == remove cookie
		//   Secure   : true,
		//   HttpOnly : true
		//   },
		//   ...
		// ]
		// result is a string or array of strings
		serialize: function(cookies) {
			var header_values = [];
			
			if( !cookies ) return header_values;
			
			var array_input = Array.isArray(cookies);
			if(!array_input) cookies=[cookies];
			
			for(var i=0,l=cookies.length;i<l;i++) {
				var
					cookie = cookies[i],
					keys   = Object.keys(cookie),
					parts  = [cookie.name + '=' + cookie.value];
				
				for( var k=0, kl=keys.length; k<kl; k++ ) {
					var key = keys[k];
					if( 'name' !== key && 'value' !== key ) {
						var v = cookie[key];
						// HttpOnly, Secure
						if ( v === true ) {
							parts.push(key);
						} else if ( v ) {
							if ( v instanceof Date ) {
								// Expires
								v = v.toUTCString();
							}
							// Domain, Path, Max-Age, Expires
							parts.push(key + '=' + cookie[key]);
						}
					}
				}
				header_values.push(parts.join('; '));
			}
			
			return array_input ? header_values : ( 0 in header_values ? header_values[0] : null);
		},
		// parse the Set-cookie header values as an ARRAY of cookie OBJECTS
		parse : extend(function F(header_values) {
			
			var cookies=[];
			
			if (!header_values ) return cookies;
			
			if(!Array.isArray(header_values)) header_values=[header_values];
			
			for(var h=0,hl=header_values.length;h<hl;h++) {
				var
					// NOTE Expiry Date can contains a ',',
					// example: The , after Thu in: Set-Cookie: ABC="XYZ"; Expires=Thu, 01-Jan-1970 00:00:10 GMT; ....
					set_cookie = header_values[h],
					cookie     = {},
					parts      = set_cookie.split(';');
				
				for( var p=0, pl=parts.length; p<pl; p++) {
					var
						part   = parts[p].trim(),
						assign = part.indexOf('='),
						name   = ~assign ? part.substring(0,assign).trim() : part.trim(),
						value  = ~assign ? part.substring(assign+1).trim() : void 0;
					
					if( 0 === p ) {
						// first name=value
						cookie.name = name;
						if(value) cookie.value = value;
						
					} else {
						// others: Domain, Path, Max-Age, Expires, HttpOnly, Secure
						
						// FIX some obscure software likes to send 'Invalid Date'
						// The only correct format is: Wdy, DD-Mon-YY HH:MM:SS GMT
						// TODO parse Expires for a correct UTC date for now be just do:
						if( name && name === 'Expires' && value === 'Invalid Date' ) { // express produces this ??
							name = value = void 0;
						}
						
						if( name ){
							// use canonical naming as defined in the RFC ! NOT maxAge etc.
							var allowed_name = F.parts[name.toLowerCase().replace('-','')];
							if( allowed_name ) {
								cookie[allowed_name] = value || true; // HttpOnly, Secure have no value part
							}
						}
					}
				}
				//debugger;
				cookies.push(cookie);
			}
			return cookies;
		},{
			parts: (function() {
				var
					parts = {},
					names = 'Domain|Path|Max-Age|Expires|HttpOnly|Secure|Comment'.split('|'), // Version unused
					i     = names.length;
				
				while(i-->0) {
					parts[names[i].toLowerCase().replace('-','')] = names[i];
				}
				return parts;
			})()
		})
	}
};
