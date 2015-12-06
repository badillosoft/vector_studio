var Parallel = require('paralleljs');

var Algorithm = function (id, json, $p, data) {
	this.id = id || 0;
	
	this.json = json || {};
	
	this.$p = $p || null;
	this.$r = this.$p ? (this.$p.$r || this.$p) : this;
	
	this.$in = this.$d = data || this.json.data || ($p ? ($p.$out || []) : []);
	
	//console.log(this.$d);
	
	// Determinanos si el algoritmo es finalizador
	
	this.json.final = (this.json.next || this.json.next_if ||
		this.json.parallel || this.json.partition) ? false : true;
		
	if (this.json.trace) {
		this.json.final = true; 
	}
	
	// Input
	if (this.json.input) {
		var f = this.loadFunction(this.json.input, "in");
		
		this.$in = f(this.$d);
	}
	
	this.$out = this.$in;
	
	console.log('Process started: ' + this.id);
	/*console.log('Input:');
	console.log(this.$in);*/
};

Algorithm.prototype.loadFunction = function (expr, type) {
	var f = expr instanceof Array ? expr.join('\n') : expr;
	
	switch(type) {
		case "a":
			return Function("$a", "$self", f);
		case "ai":
			return Function("$a", "$i", "$self", f);
		case "ab":
			return Function("$a", "$b", "$self", f);
		case "in":
			return Function("$in", "$self", f);
		case "out":
			return Function("$out", "$self", f);
	}
	
	return Function("$self", f);
};

Algorithm.prototype.process = function(callback) {
	var f = null,
		algorithm = null;
	
	if (this.json.register) {
		for (var foo in this.json.register) {
			f = this.loadFunction(this.json.register[foo], "a");
			this.$r[foo] = f;
		}
	}
	
	if (this.json.call) {
		f = this.loadFunction(this.json.call, "a");
		
		this.call = f;
		
		this.$out = f(this.$in, this);
		
		if (this.json.final) {
			this.output(callback);
		}
	}
	
	if (this.json.filter) {
		f = this.loadFunction(this.json.filter, "ai");
		
		this.$out = this.$in.filter(f);
		
		if (this.json.final) {
			this.output(callback);
		}
	}
	
	if (this.json.ifilter) {
		f = this.loadFunction(this.json.ifilter, "ai");
		
		this.$out = [];
		
		for (var i = 0; i < this.$in.length; i += 1) {
			if (f(this.$in[i], i, this)) {
				this.$out.push(i);
			}
		}
		
		if (this.json.final) {
			this.output(callback);
		}
	}
	
	if (this.json.map) {
		f = this.loadFunction(this.json.map, "ai");
		
		this.$out = this.$in.map(f);
		
		if (this.json.final) {
			this.output(callback);
		}
	}
	
	if (this.json.amap && this.json.amap instanceof Array) {
		f =  this.json.amap;
		
		this.$out = [];
		
		for (var i = 0; i < f.length; i += 1) {
			this.$out.push(this.$in[f[i]]);
		}
		
		if (this.json.final) {
			this.output(callback);
		}
	}
	
	if (this.json.next) {
		algorithm = new Algorithm(this.id * 10,
			this.json.next, this, null);
		algorithm.process(callback);
	}
	
	if (this.json.parallel) {
		this.$out = [];
		
		for (var i = 0; i < this.json.parallel.length; i += 1) {
			algorithm = new Algorithm(this.id * 10 + i,
				this.json.parallel[i], this, this.$in);
			
			algorithm.process(function (out) {
				console.log('pid: ' + algorithm.id);
				//console.log('out: ' + out);
				algorithm.$p.$out.push(out);
			});
		}
		
		this.output(callback);
	}
}

Algorithm.prototype.output = function (callback) {
	// Output
	if (this.json.output) {
		var f = this.loadFunction(this.json.output, "out");
		
		this.$out = f(this.$out);
	}
	
	callback(this.$out);
	
	console.log('Process finished: ' + this.id);
};

module.exports = Algorithm;