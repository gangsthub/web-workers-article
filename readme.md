# Web Workers

Buenas a tod@s! Me he querido volver a unir a la entrega de
[Octuweb](https://octuweb.com) para participar con un tema que me ha estado
rondando últimamente: Los Web Workers. Este artículo está inicialmente planteado
para personas que tengan ciertos conocimientos de Javascript.

## Preludio

Llevaba escuchando desde hace tiempo bastantes cosas sobre esta API de
navegador, sobre todo en Twitter. Y quería hacer especial mención especial a la
[charla](https://www.youtube.com/watch?v=e-yaGG53yWg) de Paqui Calabria e Ismael
Navarro en el FrontFest 2019. con sus Muy recomendada; aunque se centra mucho
más en _Service Workers_ que en _Web Workers_. Pero sobre los SW hablaremos en
otro post! 😅

Mucha gente se pregunta porqué dos nombres tan parecidos... "Naming things is
hard". La cuestión es que los SW son una clase especial de Worker. Para l@s más
técnic@s, **extiende la funcionalidad de un Web Worker**, para interceptar
eventos de otros documentos o de la red y añade las funcionalidades de
instalación, manejo de versiones y actualización. Suenan a cosas de Apps
Nativas, no? Eso es porque normalmente se explican de la mano de
[Progressive Web Apps (PWA)](https://developers.google.com/web/fundamentals/primers/service-workers/)
ya que al poder sentarse en medio del _user_ y "la red", nos permite hace cosas
chulas como: "cachear assets" y cargar cosas cuando se está _offline_. Pero no
necesitamos una PWA para tener un _Service Worker_. Podemos querer habilitar
_Service Workers_ simplemente por el tema de cacheo siguiendo los principios del
_Progressive Enhacemenet_. Para más información sobre qué más cosas puede hacer
un _Service Worker_, recomiendo ver la charla de nuestros colegas Paqui e Isma.
Si queréis, os puedo recomendar un curso gratuito sobre _Service Worker_ y PWAs:
https://codelabs.developers.google.com/dev-pwa-training/

Pero, de vuelta a los Workers! Explicado de forma simple:

> La función de los Web Workers, en general, es poder ejecutar scripts en
> segundo plano.

Supongo que tod@s sabéis que Javascript es un lenguaje que se denomina "de hilo
único" (_single-threaded_). Pero a veces queremos que dos o más cosas ocurran a
la vez en una web, no? Como por ejemplo: hacer una llamada a una API, mientras
mostramos una animación de "cargando" y puede que incluso usemos una librería de
gestión de estados como Redux, Vuex, ngrx, etc. La manera que tiene Javascript,
donde todas las cosas se tienen que ejecutar una detrás de otra, para no
bloquear su ejecución mientras hace 1 de esas cosas tras otra en una "pila
(_stack_) de llamadas" principal es "encolar" (poner en una cola) las siguientes
tareas. Es lo que conocemos como el “Event Loop”. Os dejo una charla de 2018 de
Jake Archibald muy interesante sobre el
[Event Loop](https://www.youtube.com/watch?v=cCOL7MC4Pl0) en la que explica
diferentes APIs asícronas como `setTimeout` o `requestAnimationFrame`. Asímismo,
hace un par de años escribí una introducción a Promesas en Octuweb. Pero espero
que mis habilidades de escritura hayan mejorado desde
[entonces](https://octuweb.com/programacion-asincrona/), xD.

Antes de seguir con la explicación sobre Workers ("ah, sí, los Web Workers!
xD"), quiero que nos paremos a reflexionar sobre la evolución que estamos
presenciando de las tecnologías Web. Probablemente, much@s de vosotr@s, como yo,
os iniciásteis en la web con jQuery o quizás con AngularJs o Ember... Y éramos
ya felices controlando guay FlexBox y haciendo unas animaciónes en nuestras
páginas..., y más, intentando hacerlas de la manera más optimizada posible! Y de
repente, en 4-5 años nos vemos hablando de "hilos" y
[_Parallel Computing_](https://en.wikipedia.org/wiki/Parallel_computing) (en
castellano,
["Computación paralela"](https://es.wikipedia.org/wiki/Computaci%C3%B3n_paralela))
y [codepen.io](codepen.io) se nos queda pequeño para explicar algunas cosas
sobre la Web... Personalmente, estoy orgulloso de mi evolución porque me encanta
la programación y la Web en general; pero tanta complicación del asunto... creo
que nos está alejando cada vez más de lo que realmente podríamos estar
consiguiendo hacer muchas veces... Da que pensar... Desde mi punto de vista, me
gusta pensar que sigo aprendiendo cosas y especializándome para:

1. Compartir mis conocimientos con l@s nuev@s (o quien quiera escuchar) como
   encontré yo cuando empecé.

2. Finalmente, evolucionar hacia poder realizar cosas que tengan gran impacto.
   Algún día usaré los dominios que tengo comprados (Tod@s decimos lo mismo. "Y
   lo sabes! 👉🏾")

Las motivaciones de cada un@ pueden ser diferentes. Pero seguro que esos dos
puntos se comparten aunque sea desde diferentes ángulos.

En mi opinión, la aparición de Workers en la escena es muy acertada y le veo
bastante sentido, dado que JavasCript cada vez es capaz de hacer más cosas y se
supone que los usuarios esperan más de la experiencia de una web, la
programación de interfaces web cada vez se vuelve más complicada. Los productos
o servicios B2B que desarrollamos ahora hubieran sido muy difícil o, incluso
ciertas cosas, imposible de desarrollar hace unos años. De ahí la necesidad de
añadir librerías un poco complejas como RxJS (librería para trabajar con
_Asynchronous Data Streams_).

En fin, disculpad por esta desviación del tema... Volviendo a los Web Workers.

## La API básica

En un archivo `index.js` vamos a primero "registrar" otro archivo
`index.worker.js`.

La ejecución de los Workers va ligada a la existencia de archivos separados. De
hecho el propio constructor
[`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker)
recibe como primer parámetro la URL del Worker. En este caso, para simplificar
la demostración voy a situar ambos archivos en mi directorio raíz del proyecto.
Pero en el HTML sólo llamamos a nuestro `index.js`.

```js
// ./index.js
var myWorker = new Worker('index.worker.js')
```

Así es como decimos que "hemos registrado" el Worker. Lo que significa que el
navegador se va a encargar de crear un "hilo" nuevo para la ejecución de lo que
nosotros pongamos en el archivo `index.worker.js` y de manera opcional, enviar
algo de vuelta a nuestro contexto principal.

## Comunicación entre pares

Ahora viene la parte interesante. Lo que queremos, la mayoría de las veces:

- Pasarle datos al Worker y que nos devuelva esos datos transformados (o no,
  pero realizar alguna operación en el Worker)

- Avisar a nuestro Worker de que es el momento de realizar alguna acción
  (iniciar un proceso...) o llamar a un método presente en el Worker desde
  nuestro contexto principal.

Y cómo se comunican unos con otros? La conexión se realiza con una API basada en
[eventos](https://developer.mozilla.org/en-US/docs/Web/API/Worker#Properties)
(muy parecido a los eventos del DOM).

Volviendo a nuestro archivo `index.js`, vamos a implementar una comunicación
básica con el Worker:

```js {4-6}
// ./index.js
var myWorker = new Worker('index.worker.js')

myWorker.onmessage = event => {
  console.log('Recibido en el main thread: ' + event.data)
}
```

De esta manera nuestro `index.js` está "escuchando" (básicamente es un
`listener`) lo que reciba desde `index.worker.js`. Pero también queremos
mandarle cosas...; así que añadimos:

```js {8-10}
// ./index.js
var myWorker = new Worker('index.worker.js')

myWorker.onmessage = event => {
  console.log('Recibido en el main thread: ' + event.data)
}

myWorker.postMessage('q pasa, worker!')
```

Con `postMessage` estamos enviando datos al Worker. De momento va a ser un
string. Pero podría ser cualquier cosa: un `Array`, un `Object`... Luego veremos
más ejemplos.

En nuestro archivo `index.worker.js`, vamos a hacer un `console.log` de lo que
reciba:

```js
// ./index.worker.js

// el objecto "global" se referencia
// aquí dentro como `self`.
// Aunque es opcional:
// `self.onmessage` y sólo `onmessage`
// serían equivalentes
onmessage = function(event) {
  console.log('Hola, soy el worker! He recibido: ' + event.data)
}
```

Ahora el Web Worker está escuchando y hará un console.log de lo que le hemos
enviado desde `index.js`.

El output esperado en consola sería:

```
< Hola, soy el worker! He recibido: q pasa, worker!
```

El console.log que tenemos en `index.js` no se ejecuta porque de momento no
estamos enviando nada desde `index.worker.js`.

Para ello, tenemos
[el método `postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Worker#Methods)
disponible:

```js
// ./index.worker.js

// el objecto "global" se referencia
// aquí dentro como `self`.
// Aunque es opcional:
// `self.onmessage` y sólo `onmessage`
// serían equivalentes
onmessage = function(event) {
  console.log('Hola, soy el worker! He recibido: ' + event.data)
}

postMessage('q pasa, index!')
```

¿Cuál sería ahora el `output`?

```
< Recibido en el main thread: q pasa, index!
< Hola, soy el worker! He recibido: q pasa, worker!
```

En ese orden. Es interesante que recibamos el mensaje del Worker en el index
antes que el mensaje del index en el Worker, pero tiene sentido porque lo
primero que hemos hecho ha sido activar el Worker.

## Pasando objetos

Ok, de momento hemos pasado `strings` de aquí para allá. Como hemos dicho,
también podemos pasar Arrays u Objetos, pero tenemos que recordar que no son la
referencia al mismo objeto sino que son copias o clones (como si hiciéramos un
`JSON.stringify` + `JSON.parse`). Hay ciertas limitaciones, no obstante. No
pueden compartir objetos que tengan funciones o instancias de `Error`, entre
[❌ otras cosas](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#Things_that_don't_work_with_structured_clone).

Lo interesante de este caso: podemos `spawn`ear (lo siento jaja) un worker para
que haga un filtrado de elementos y nos devuelva una lista filtrada. El caso de
una búsqueda en el lado del cliente (realmente no recomendado por temas de
escalabilidad, porque inicialmente tenemos que traernos esta lista del
servidor).

Ejemplo:

```js
// ./index.js
var myWorker = new Worker('index.worker.js')

const DATA = [
  { name: 'Christine Darden', born: 1942 },
  { name: 'Dorothy Vaughan', born: 1910 },
  { name: 'Katherine Johnson', born: 1918 },
  { name: 'Mary Jackson', born: 1921 }
]

myWorker.onmessage = event => {
  console.log('Recidibido en el main thread: ' + JSON.stringify(event.data))
}

myWorker.postMessage(DATA)
```

```js
// ./index.worker.js
const bornAfter1920 = data => {
  return data && data.length && data.filter(engineer => engineer.born > 1920)
}

onmessage = function(event) {
  const data = event.data
  const filteredData = bornAfter1920(data)
  postMessage(filteredData)
}
```

El output sería:

```
< Recidibido en el main thread:
[{"name":"Christine Darden","born":1942},{"name":"Mary Jackson","born":1921}]
```

## Pasando respuestas de servicios

Otra cosa que es bastante interesante que podemos hacer dentro de un Web Worker
son llamadas HTTP a servicios web. Éste podría ser otro caso de uso:

```js
// ./index.js
var myWorker = new Worker('index.worker.js')

const newImage = src => {
  const img = document.createElement('img')
  img.src = src
  document.body.appendChild(img)
}

myWorker.onmessage = event => {
  newImage(event.data)
}

myWorker.postMessage('getDog')
```

```js
// ./index.worker.js
const DOG_API = 'https://dog.ceo/api/breed/hound/images/random'

const getDogImage = async () => {
  const image = await fetch(DOG_API).then(i => i.json())
  const url = image.message
  return url
}

onmessage = async function(event) {
  if (event.data === 'getDog') {
    postMessage(await getDogImage())
  }
}
```

Este ejemplo me resulta bastante interesante porque, por ejemplo, podemos
delegar la responsabilidad de enviar "eventos" (datos) en segundo plano a un
servidor desde un Worker y si es necesario escuchar respuestas mientras que en
el hilo principal nos encargamos de mantener la UI libre de carga para cosas que
le importan al _user_.

## Compartiendo funciones

_Nope_. No podemos pasar ni referencias a funciones ni expresiones de funciones,
como veíamos en el apartado de objetos. Recibimos un error del tipo
`DATA_CLONE_ERR` o `DOMException`.

Pero hay una manera:

Vamos a instalar una librería para ayudarnos a lograrlo:
[`comlink`](https://github.com/GoogleChromeLabs/comlink).

```js
// ./index.worker.js
import * as Comlink from 'comlink'

const sum = (x, y) => x + y

Comlink.expose(sum)
```

Esta vez he puesto el worker primero. Vamos a importar `'comlink'` en ambos
lados. Desde el Web Worker vamos a llamar a `Comlink.expose` con nuestro
método...

```js
// ./index.js
import * as Comlink from 'comlink'

const worker = new Worker('index.worker.js')
const workerSum = Comlink.wrap(worker) // exposing `sum`

workerSum(1, 3).then(console.log) // 4
```

Y en el `index.js` vamos a hacer uso de `Comlink.wrap` para envolver nuestro
Worker. Ahora tenemos disponible desde este lado lo que estábamos "exponiendo"
desde el Worker. Con la salvedad de que ahora, al usar nuestro método, lo que
devuelve es una promesa.

Para este ejemplo, como estaba usando sintaxis de los _ESM_ (_ECMAScript
modules_) necesito que mi `<script>` sea de tipo `type="module"` en mi HTML. Por
eso, al final de mi `body` (antes de `</body>`) colocaré mi módulo de la
siguiente manera:

```
<script src="index.js" type="module" defer></script>
```

Es una buena práctica usar `defer` también para que los scripts no bloqueen el
renderizdo de la página.

Si todo ha ido bien, veremos en consola un `4`. 👀

Por supuesto, el ejemplo de una simple suma no tiene mucho sentido de usar una
librería como `comlink` (aunque sea de sólo 1.1KB) e hilos paralelos. Pero, ¿qué
me decís de meter
[Redux en un Worker](https://dassur.ma/things/react-redux-comlink/)...? Eso
suena más interesante, ¿a que sí? El artículo, por cierto, es del mismo creador
de `comlink`, Surma (sólo "Surma", como Cher 😜).

## Conclusión

Bueno, espero que os haya gustado! O por lo menos que le vayamos perdiendo un
poco de miedo a usar Workers en nuestros proyectos. Espero que me contéis
[en Twitter](https://twitter.com/paul_melero) cómo los habéis usado y si os ha
gustado la introducción. Muchas gracias!
