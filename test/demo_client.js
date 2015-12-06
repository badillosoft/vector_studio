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

	