# TRY-LINQ

TRY-LINQ è una applicazione web basata sulla libreria [LINQ-G](https://github.com/bit23/linq-g), inizialmente sviluppata per testare la libreria stessa ma che ben presto si è trasformata in uno strumento di utilità per eseguire query linq.

![TRY-LINQ](doc/TRY-LINQ.jpg)

E’ possibile caricare dati da file esterni o aprire la finestra di editing per poter modificare i dati correnti. Anche se la libreria è in grado di caricare qualunque oggetto che implementi il comportamento di Iterable, tramite l'interfaccia al momento è possibile caricare dati di tipo JSON Array, JSON Object e Stringhe.

![data-panel](doc/data-panel.jpg)

E’ possibile definire query linq più o meno complesse direttamente nell’editor di codice integrato, in modo da poterne modificare in tempo reale la logica. E’ disponibile anche un elenco di snippets utili per testare ogni funzionalità della libreria.

![code-panel](doc/code-panel.jpg)

Nell’ultimo pannello saranno visualizzati i risultati della query applicata ai dati. Sarà inoltre possibile scegliere di utilizzare i risultati come dati di partenza o esportarli se necessario.

![result-panel](doc/result-panel.jpg)

Queste sono le funzionalità principali dell’applicazione. Di secondaria importanza sono: il salvataggio automatico su local-storage dei dati inseriti e della ultima query eseguita, la possibilità di modificare il layout dell’applicazione tra tre predefiniti, passare da tema dark a tema light e viceversa.

Per provare l’applicazione:
http://……

Codice sorgente di LINQ-G:
https://github.com/bit23/linq-g