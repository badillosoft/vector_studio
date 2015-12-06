# Vector Studio

Por Alan Badillo Salas | badillo.soft@hotmail.com

## Filtros

Los filtros nos permiten seleccionar un conjunto de datos que cumplan
cierta funcion.
El algoritmo _ifilter_ tiene la ventaja de reducir el costo
de datos que se devuelven, sobre todo si los datos son complejos.

* __filter__ - Selecciona los valores de _data_ que cumplen la 
función filtro, estos son devueltos en un arreglo.

* __ifilter__ - Realiza lo mismo que _filter_, pero devuelve solamente
los indices de los elementos y no el valor.

> __JSON__ - Ejemplo de _filter_

~~~js
/* Algoritmo */
{
	data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
	filter: "return $a % 2 == 0;"
}

/* Salida */
[2, 4, 6, 8, 10]
~~~

> __JSON__ - Ejemplo de _ifilter_

~~~js
/* Algoritmo */
{
	data: [
		{min: 1, max: 5},
		{min: 5, max: 10},
		{min: 2, max: 6},
		{min: -1, max: 3}
	],
	ifilter: "return $a.min <= 3 && 5 <= $a.max;"
}

/* Salida */
[0, 2]
~~~

## Mapeos

El mapeo de datos transforma un valor en otro. 
El algoritmo _amap_ nos permite crear datos de diferente dimension.

* __map__ - Transforma los valores segun la funcion de mapeo.

* __amap__ - Selecciona los valores segun el indice dado.

> __JSON__ - Ejemplo de _map_

~~~js
/* Algoritmo */
{
	data: [1, 2, 3, 4, 5],
	map: "return $a * $a"
}

/* Salida */
[1, 4, 9, 16, 25]
~~~

> __JSON__ - Ejemplo de _amap_

~~~js
/* Algoritmo */
{
	data: ["a", "l", "x", "h", "o"],
	amap: [3, 4, 1, 0, 0, 0]
}

/* Salida */
["h", "o", "l", "a", "a", "a"]
~~~

## Secuencias

Podemos aplicar varios algoritmos de forma secuencial utilizando _next_.

> __JSON__ - Ejemplo de una secuencia de algoritmos para filtrar los
puntos contenidos en un radio unitario y devolver los datos incluyendo
el radio computado.

~~~js
/* Algoritmo */
{
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
}

/* Salida */
[
	{x: 0.7, y: 0.3, r: 0.76157731...}
]
~~~

## Hilos

Los hilos nos permiten ejecutar algoritmos en paralelo y mezclar los
resultados en un arreglo de datos utilizando _parallel_.

> __JSON__ - Ejemplo de algoritmos en paralelo

~~~js
/* Algoritmo */
{
	data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
	parallel: [
		{ filter: "return $a % 2 == 0;" },
		{ filter: "return $a % 2 == 1;" }
	]
}

/* Salida */
[
	[2, 4, 6, 8, 10],
	[1, 3, 5, 7, 9]
]
~~~

## Entradas y Salidas

Podemos manipular los datos antes de aplicar el algoritmo y
tambien despues de finalizado, mediante _input_ y _output_.

Manipular la entrada es util cuando se utilizan las variables
globales, ya que podremos mezclar datos con los del padre
o los datos globales (del _root_).

> __JSON__ - Ejemplo de entrada. Generamos un arreglo de numeros
aleatorios y se los pegamos a los datos de entrada.

~~~js
/* Algoritmo */
{
	data: [0.1, 0.5, 0.3, 0.9],
	input: [
		"for (var i = 0; i < 4; i += 1) { $in.push(Math.random()); }",
		"return $in;"
	],
	filter: "return $a >= 0.333 && $a <= 0.667;",
	output: "return {data: $out, len: $out.length}"
}

/* Salida */
{
	data: [0.5, 0.431728, 0.61547],
	len: 3
}
~~~

__Nota__ - Al utilizar secuencias o hilos, la salida sera tomada
como entrada para el algoritmo anida, por lo que debe tener cuidado
si los datos no son arreglos ya que se generara un error en los
algoritmos que supongan que los datos son un arreglo como _filter_,
_map_, etc.

## Recursividad

Podemos crear recursividad facilmente utilizando la variable _$s_
que contiene el algorimo actual, los datos de entrada, seran
los enviado para la nueva invocacion.

Para invocar un algoritmo podemos utilizar _map_ o _eval_.

> __JSON__ - Ejemplo de recursividad. Obtenemos el n-esimo
numero de Fibonacci.

~~~js
/* Algoritmo */
{
	data: 6,
	call: [
		"if ($a <= 1) { return 1; }",
		"return $s.call($a - 1, $s) + $s.call($a - 2, $s);"
	]
}

/* Salida */
13
~~~

## Funciones registradas

Podemos registrar funciones para que esten disponibles en algoritmos
anidados. Las funciones quedan registradas en el _root_, por lo que
podemos acceder a ellas en cualquier punto a traves del _root_.
Las funciones ya registradas seran sobreescritas. 

> __JSON__ - Ejemplo de registro de funciones. Devuelve los
primeros n numeros de Fibonacci que son pares.

~~~js
/* Algoritmo */
{
	data: 10,
	register: {
		fibo: [
			"if ($a <= 1) { return 1; }",
			"return $r.fibo($a - 1, $s) + $r.fibo($a - 2, $s);"
		],
		es_par: "return $a % 2 == 0;"
	},
	call: [
		"var out = [];",
		"for (var i = 0; i < $a; i += 1) {",
		"	var fi = $r.fibo(i, $s)",
		"	if ($r.es_par(fi, $s)) { out.push(fi); }",
		"}",
		"return out;"
	]
}

/* Salida */
[2, 8, 34]
~~~

## Algoritmos nombrados

Podemos nombrar a los algoritmos con el fin de reutilizarlos como
a las funciones registradas, la diferencia es que los algoritmos
nombrados pueden ser invocados por su nombre en _next_, _next_if_,
_parallel_, _partition_ y _else_. 
Los nombres son registrados a nivel _root_.

> __JSON__ - Ejemplo de algoritmos nombrados. Creamos recursividad
mediante un algoritmo nombrado.

~~~js
/* Algoritmo */
{
	data: [1, 3, 9, 2, 6, 1, 4],
	name: "mayor",
	eval_if: {
		if: "return $in.length == 1",
		then: "return $in;"
		else: {
			partition: {
				partitions: 2,
				next: "mayor",
				output: "return $out[0] > $out[1] ? $out[0] : $out[1];"
			}
		}
	}
}

/* Salida */
9
~~~

El algoritmo anterior busca el numero mayor recursivamente,
si la longitud de los datos es mayor a 1 entonces parte en dos
los datos y procesa en paralelo cada uno, cada particion es
procesada nuevamente por mayor; al finalizar determina cual
de las dos particiones es mayor. La pila de ejecucion seria la
siguiente:

~~~rb
# mayor: [1, 3, 9, 2, 6, 1, 4] -> 9
	# partition: -> [9, 6] -> 9
		# mayor: [1, 3, 9, 2] -> 9
			# partition: -> [3, 9] -> 9
				# mayor: [1, 3] -> 3
					# partition: -> [1, 3] -> 3
						# mayor: [1] -> 1
						# mayor: [3] -> 3
				# mayor: [9, 2] -> 9
					# partition: -> [9, 2] -> 9
						# mayor: [9] -> 9
						# mayor: [2] -> 2
		# mayor: [6, 1, 4] -> 6
			# partition: -> [6, 4] -> 6
				# mayor: [6, 1] -> 6
					# partition: -> [6, 1] -> 6
						# mayor: [6] -> 6
						# mayor: [1] -> 1
				# mayor: [4] -> 4
~~~

Este algoritmo puede ser aplicado sobre objetos complejos para
determinar el candidato mas fuerte, en lugar de comparar numeros
se comparan los objetos complejos, se miden las habilidades entre
los dos mejores y al final se determinara quien es el mejor candidato
en tiempo logaritmico.