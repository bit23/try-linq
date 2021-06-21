# TRY-LINQ

TRY-LINQ is a web application based on the [LINQ-G](https://github.com/bit23/linq-g) library, initially developed to test the library itself but soon turned into a utility tool for performing linq queries.

![TRY-LINQ](doc/TRY-LINQ.jpg)

It's possible to load data from external files or open the editing window in order to modify the current data. Although the library is able to load any object that implements the Iterable behavior, through the interface at the moment it is possible to load JSON Array, JSON Object and String data.

![data-panel](doc/data-panel.jpg)

It is possible to define more or less complex linq queries directly in the integrated code editor, so you can modify the logic in real time. It is also available a list of useful snippets to test every feature of the library.

![code-panel](doc/code-panel.jpg)

The last panel will display the results of the query applied to the data. It will also be possible to choose to use the results as source data or export them if necessary.

![result-panel](doc/result-panel.jpg)

These are the main features of the application. Of secondary importance are: the automatic saving on local-storage of the inserted data and of the last executed query, the possibility to modify the layout of the application among three predefined ones, to pass from dark theme to light theme and vice versa.

To test the application:  
http://……

LINQ-G source code:  
https://github.com/bit23/linq-g
