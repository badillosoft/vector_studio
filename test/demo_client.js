var ws = new WebSocket("ws://localhost:2345", "echo-protocol");

ws.onmessage = function (message) { 
	console.log(JSON.parse(message.data));
};

ws.onopen = function () {
	// filter
	ws.send(JSON.stringify({
		data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    	filter: "return $a % 2 == 0;"
	}));
	
	// ifilter
	ws.send(JSON.stringify({
		data: [
			{min: 1, max: 5},
			{min: 5, max: 10},
			{min: 2, max: 6},
			{min: -1, max: 3}
		],
		ifilter: "return $a.min <= 3 && 5 <= $a.max;"
	}));
	
	// map
	ws.send(JSON.stringify({
		data: [1, 2, 3, 4, 5],
    	map: "return $a * $a"
	}));
	
	// amap
	ws.send(JSON.stringify({
		data: ["a", "l", "x", "h", "o"],
    	amap: [3, 4, 1, 0, 0, 0]
	}));
	
	// Secuencias
	ws.send(JSON.stringify({
		data: [
			{x: 0.5, y: 1.2},
			{x: -0.9, y: 1.0},
			{x: 0.7, y: 0.3},
			{x: 4.2, y: -2.3}
		],
		map: [
			"var r = Math.sqrt($a.x *$a.x + $a.y * $a.y);",
			"$a.r = r;",
			"return $a;"
		],
		next: {
			filter: "return $a.r <= 1.0;"
		}
	}));
	
	// Hilos
	ws.send(JSON.stringify({
		data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		parallel: [
			{ filter: "return $a % 2 == 0;" },
			{ filter: "return $a % 2 == 1;" }
		]
	}));
	
	// Entrada y Salida
	ws.send(JSON.stringify({
		data: [0.1, 0.5, 0.3, 0.9],
		input: [
			"for (var i = 0; i < 4; i += 1) { $in.push(Math.random()); }",
			"return $in;"
		],
		filter: "return $a >= 0.333 && $a <= 0.667;",
		output: "return {data: $out, len: $out.length}"
	}));
	
	// Recursividad
	ws.send(JSON.stringify({
		data: 6,
		call: [
			"if ($a <= 1) { return 1; }",
			"return $self.call($a - 1, $self) + $self.call($a - 2, $self);"
		]
	}));
	
	// Funciones Registradas
	ws.send(JSON.stringify({
		data: 10,
		register: {
			fibo: [
				"if ($a <= 1) { return 1; }",
				"return $self.$r.fibo($a - 1, $self) + $self.$r.fibo($a - 2, $self);"
			],
			es_par: "return $a % 2 == 0;"
		},
		call: [
			"var out = [];",
			"for (var i = 0; i < $a; i += 1) {",
			"	var fi = $self.$r.fibo(i, $self)",
			"	if ($self.$r.es_par(fi, $self)) { out.push(fi); }",
			"}",
			"return out;"
		]
	}));
	
	// Extender el arreglo de 1 a 100
	// Filtrar los números impares
	ws.send(JSON.stringify({
		data: [1, 2, 3, 4, 5], 
		input: [
			"for (var i = 6; i <= 100; i += 1) {",
			"	$in.push(i);",
			"}",
			"return $in;"
		],
		filter: "return $a % 2 == 1;"
	}));
	
	// Extender los datos de 1 a 100
	// Mapear los datos al cuadrado
	// Componer la salida
	ws.send(JSON.stringify({
		input: [
			"for (var i = 1; i <= 100; i += 1) {",
			"	$in.push(i);",
			"}",
			"return $in;"
		],
		map: "return $a * $a;",
		output: "return {data: $out, len: $out.length};"
	}));
	
	// Extender los datos de 1 a 100
	// Mapear los datos al cuadrado
	// 		Filtrar los números pares
	// Componer la salida
	ws.send(JSON.stringify({
		input: [
			"for (var i = 1; i <= 100; i += 1) {",
			"	$in.push(i);",
			"}",
			"return $in;"
		],
		map: "return $a * $a;",
		next: {
			filter: "return $a % 2 == 0;"
		},
		output: "return {data: $out, len: $out.length};"
	}));
};

	