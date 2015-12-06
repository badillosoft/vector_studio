var Algorithm = function (id, json, $p) {
	this.id = id || 0;
	
	$p = $p || null;
	
	this.json = json || {};
	
	this.$r = $p ? ($p.$r || $p) : null;
	
	this.$in = this.$d = this.json.data || ($p ? ($p.$out || []) : []);
	
	//console.log(this.$d);
	
	this.$out = null;
	
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
	
	//console.log('Input:');
	//console.log(this.$in);
	console.log('Process started: ' + this.id);
};

Algorithm.prototype.loadFunction = function (expr, type) {
	var f = expr instanceof Array ? expr.join('\n') : expr;
	
	switch(type) {
		case "ai":
			return Function("$a", "$i", f);
		case "ab":
			return Function("$a", "$b", f);
		case "in":
			return Function("$in", f);
		case "out":
			return Function("$out", f);
	}
	
	return Function(f);
};

Algorithm.prototype.process = function(callback) {
	var f = null;
	
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
			if (f(this.$in[i])) {
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
		var algorithm = new Algorithm(this.id * 10, this.json.next, this);
		
		algorithm.process(callback);
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