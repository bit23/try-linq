# try-linq

Applicazione con interfaccia web per la composizione di query linq, eseguite tramite la libreria **linq-g**.

...

## Configurazione dell'ambiente

Aprire VSCODE e creare un nuovo workspace. Aggiungere al workspace le cartelle:
- linq-g
- juice-lite
- try-linq

Nello stesso ordine:
- Installare i pacchetti per ogni progetto con il comando ```npm install```.  
- Compilare ogni progetto con il comando ```npm build```.

## Esecuzione

Installare l'estensione **Live Server** per VSCODE.  
Espandere il nodo del progetto **try-linq** fare click con il tasto destro e selezionare **Open with Live Server**.




## Stato attuale

**try-linq**  
- import gestire i file txt con dentro stringhe
- export in base al risultato (primitiva, array, object)

**linq-g**  
- Fix:
    - verificare il risultato di groupBy
    - verificare l'uso e l'utilità della classe Lookup
- Missing features:
    - OrderedEnumerable mancante (thenBy)
- New Features:
    - metodo ToQuery per generare query compatibili con DynamicLinq
    - verificare la possibilità di concatenare espressioni per il metodo where e simili
