# A Linq implementation using Generators

## Cenni sugli iteratori e oggetti iterabili

Gli iteratori in javascript sono concepiti come dei "protocolli". Un protocollo può essere considerato come un insieme di convenzioni, concettualmente simili ad un'interfaccia per altri linguaggi di programmazione.  
Un protocollo può essere implementato da un qualunque oggetto che segua dette convenzioni, 
nel caso degli iteratori esistono due tipi di protocollo: il protocollo *iterable* ed il protocollo *iterator*.


#### The *iterator* protocol

Il protocollo *iterator* definisce il modo per produrre una sequenza di valori, finita o infinita che sia. Tale comportamento viene implementato tramite il metodo ```next()``` che permette di ottenere il valore successivo della sequenza.  
Tale metodo deve essere definito come una function, senza argomenti, che restituisca un oggetto *IteratorResult* che a sua volta implementi le seguenti proprietà:  
> **done**: boolean  
> Se ```true``` indica che l'iteratore non produrrà ulteriori risultati, in caso di ```false``` o ```undefined``` l'iteratore proseguirà nel fornire un nuovo valore alla successiva chiamata.

> **value**: any  
> Contiene il valore corrente restituito dall'iteratore. Nel caso la proprietà **done** sia ```true``` può essere omessa.

Esempio di un *IteratorResult* restituito da una chiamata ```next()``` di un iteratore
```javascript
{
	done: false,
	value: 123
}
```

Il metodo ```next()``` dovrà sempre restituire un oggetto che contenga queste proprietà. Nel caso il risultato sia di tipo non oggetto, verrà sollevata un'eccezione ```TypeError ("iterator.next() returned a non-object value")```.

> approfondisci l'argomento:  
> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterator_protocol


#### The *iterable* protocol

Un *iterable* è fondamentalmente un oggetto che può essere ciclato tramite un costrutto **for...of**:
```javascript
for (const item of iterable) {
	...
}
```
Oggetti di tipo string, Array, Set, Map sono alcuni degli oggetti built-in che implementano il comportamento di *iterable*.  
Per poter essere iterabile un oggetto deve avere una proprietà registrata con la chiave ```[Symbol.iterator]``` di tipo function senza argomenti, la quale restituisca un iteratore. La proprietà può essere implementata direttamente sull'oggetto o in uno degli oggetti della sua catena di prototipi.  
La function può essere di tipo classico o una funzione generatrice:
```javascript
// funzione classica
function () {
	return {
    	next: function () {
    		return {
    			value: ...,
        		done: ...
      		};
    	}
	}
}

// generator function
function* () {
	yield value;
}
```
Nel caso della funzione classica il risultato restituito dovrà essere l'istanza di un oggetto *iterator*. 

Nel caso della funzione generatrice il risultato verrà fornito ciclicamente tramite l'utilizzo della parola chiave ```yield```. E' possibile terminare l'esecuzione di una funzione generatrice utilizzando la parola chiave ```return``` o proseguendo l'esuczione del corpo della funzione fino alla fine e quindi all'uscita.

Essendo tali funzioni definite sull'oggetto *iterable*, potranno accedere alle proprieà dell'oggetto stesso e quindi utilizzarne i valori per produrre il risultato corrente o non produrne affatto (nel caso di funzione generatrice).  

> approfondisci l'argomento:  
> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol


## I generatori

Come abbiamo visto in precedenza i generatori sono funzioni speciali definite dalla parola chiave ```function``` seguita da un ```*```.  
Nel momento in cui verrà chiamata la funzione generatrice, verrà restituito al chiamante un oggetto *Generator*, il quale sarà conforme sia al protocollo *iterator* sia al protocollo *iterable* e che, a sua volta, interagirà con il corpo della funzione generatrice.  

Un oggetto *Generator* è costituito dai seguenti membri:  

> **next()**  
> (*iterator protocol*)  
> Restituisce il risultato successivo.
>
> **return()**  
> Restituisce il risultato e termina il generatore.
>
> **throw()**  
> Scatena un errore e termina il generatore.
>
> **[Symbol.iterator]**  
> (*iterable protocol*)  
> Restituisce implicitamente l'iteratore per i cicli

Per utilizzare una sequenza prodotta è possibile interagire con il generatore in più modi:

- accesso tramite ciclo **for..of**
- accesso tramite XXXX ```[...iterable]```
- accesso diretto tramite il metodo ```next()```
- accesso tramite ciclo **while** e metodo ```next()```
  
### Utilizzo di un generatore tramite protocollo *iterable*

L'utilizzo del generatore come iterable è probabilmente la forma più semplice per accedere alla sequenza prodotta.  
Immaginando di avere un generatore nella seguente forma  

```javascript
const g = function* () {

};
```

#### Utilizzo di un generatore in un ciclo for...of

#### Utilizzo di un generatore come XXXX [...iterable]

### Utilizzo di un generatore tramite protocollo *iterator*

#### Utilizzo diretto di un generatore

#### Utilizzo di un generatore in un ciclo while


La chiamata al metodo ```next()``` eseguirà il codice della funzione fino al primo ```yield```, restituendone il valore e mettendo in pausa l'iteratore fino alla successiva chiamata ```next()```. Una volta che tutti gli ```yield``` saranno stati superati, la funzione uscirà dal suo corpo e restituirà un oggetto *IteratorResult* con la proprietà **done** impostata a ```true```, indicando cosi che il generatore ha prodotto tutti i valori possibili.  
Successive chiamate al generatore che ha concluso la propria sequenza di valori (se finita), restituiranno sempre un oggetto *IteratorResult* con la proprietà **done** uguale a ```true``` e la proprietà **value** uguale a ```undefined```.  

La chiamata al metodo ```return([value])``` restituirà un oggetto *IteratorResult* con la proprietà **value** impostata sul valore passato come argomento o ```undefined``` se l'argomento è stato omesso, e la proprietà **done** impostata a true, interrompendo la sequenza prima della sua conclusione.  

Chiamando il metodo ```throw(exception)```  verrà prodotta un'eccezione all'interno del ciclo del generatore, pertanto se il codice all'interno della funzione generatrice è contrenuto in ub blocco **try...catch**, verrà eseguito il blocco **catch** prima di scatenare l'errore nel contesto chiamante.




Un generatore può essere dichiarato e utilizzato nei seguenti modi:

### generator function

```javascript
function* name([param[, ...]]) { }
```

Esempio:

```javascript
//TODO
function* generator(i) {
  yield i;
  yield i + 10;
}
const gen = generator(10);
console.log(gen.next().value);
// expected output: 10
console.log(gen.next().value);
// expected output: 20
```

> approfondisci l'argomento:  
> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*

### generator expression

```javascript
const g = function* ([param[, ...]]) { }
```
In questo caso il nome della funzione può essere omesso.  

Esempio:

```javascript
//TODO
const generator =  function*(i) {
  yield i;
  yield i + 10;
}
const gen = generator(10);
console.log(gen.next().value);
// expected output: 10
console.log(gen.next().value);
// expected output: 20
```

> approfondisci l'argomento:  
> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function*

### GeneratorFunction constructor

```javascript
Object.getPrototypeOf(function*(){}).constructor
```

Esempio:

```javascript
//TODO
const GeneratorFunction = Object.getPrototypeOf(function*(){}).constructor;
const g = new GeneratorFunction('a', 'yield a * 2');
const iterator = g(10);
console.log(iterator.next().value); // 20
```

> approfondisci l'argomento:  
> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/GeneratorFunction

### yield e yield*
Abbiamo visto come sia possible restituire un valore dall'interno di una funzione generatrice, e metterne in pausa l'esecuzione, tramite la parola chiave ```yield```.  
Esiste anche il caso in cui dal corpo di una funzione generatrice si vogliano restituire gli elementi di una sequenza prodotta da un altro generatore, sfruttando il suo meccanismo di restituzione e pausa. In questo caso dovrà essere utilizzata la parola chiave ```yield*``` per chiamare il secondo generatore e restituire cosi gli elementi del secondo generatore in sequenza a quelli del primo, in base a dove l'istruzione si trova nel corpo della funzione.

Esempio:  
```javascript
//TODO
function* g1() {
  yield 2;
  yield 3;
  yield 4;
}

function* g2() {
  yield 1;
  yield* g1();
  yield 5;
}

const iterator = g2();

console.log(iterator.next()); // {value: 1, done: false}
console.log(iterator.next()); // {value: 2, done: false}
console.log(iterator.next()); // {value: 3, done: false}
console.log(iterator.next()); // {value: 4, done: false}
console.log(iterator.next()); // {value: 5, done: false}
console.log(iterator.next()); // {value: undefined, done: true}
```
> approfondisci l'argomento:  
> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield
> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield*



## INDEX

- ~~The *iterable* protocol (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol)~~
- ~~The *iterator* protocol (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterator_protocol)~~
- ~~Creare un oggetto iterabile tramite i generatori~~
- ~~Generator object (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)~~
- ~~Generator function (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)~~
  - ~~function* function~~
  - ~~function* expression~~
  - ~~GeneratorFunction constructor~~
- ~~yield~~
- ~~yield*~~
  




## LINQ using generators

- Cos'è Linq? (https://docs.microsoft.com/it-it/dotnet/csharp/programming-guide/concepts/linq/linq-to-objects)
- funzionalità mancanti
- performance
- casi d'uso
- utilizzo dal browser