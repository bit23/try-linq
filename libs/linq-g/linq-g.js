var Linq;
(function (Linq) {
    function isIterator(object) {
        return Reflect.has(object, "next") && typeof Reflect.get(object, "next") === "function";
    }
    class IteratorIterableWrapper {
        constructor(iterator) {
            this._source = iterator;
            this._buffer = [];
            this._buffered = false;
        }
        *[Symbol.iterator]() {
            if (this._buffered) {
                for (const item of this._buffer) {
                    yield item;
                }
            }
            else {
                let item;
                while (!(item = this._source.next()).done) {
                    this._buffer.push(item.value);
                    yield item.value;
                }
                this._buffered = true;
            }
        }
    }
    class EnumerableExtensions {
        static tryGetFirst(source, predicate, result) {
            if (source instanceof Array && !predicate) {
                if (source.length == 0) {
                    result.value = undefined;
                    return false;
                }
                result.value = source[0];
                return true;
            }
            else {
                for (let item of source) {
                    if (predicate) {
                        if (predicate(item)) {
                            result.value = item;
                            return true;
                        }
                    }
                    else {
                        result.value = item;
                        return true;
                    }
                }
                result.value = null;
                return false;
            }
        }
        static tryGetLast(source, predicate, result) {
            if (source instanceof Array && !predicate) {
                if (source.length == 0) {
                    result.value = undefined;
                    return false;
                }
                result.value = source[source.length - 1];
                return true;
            }
            else {
                var last = null;
                var found = false;
                for (let item of source) {
                    if (predicate) {
                        if (predicate(item)) {
                            last = item;
                            found = true;
                        }
                    }
                    else {
                        last = item;
                        found = true;
                    }
                }
                result.value = last;
                return found;
            }
        }
        static aggregate(source, seed, accumulatorFunc, resultSelector) {
            let firstDone = false;
            let current = seed;
            for (let item of source) {
                current = accumulatorFunc(current, item);
                firstDone = true;
            }
            if (!firstDone && seed === null) {
                throw new Error("no elements");
            }
            if (typeof resultSelector === "function") {
                return resultSelector(current);
            }
            else {
                return current;
            }
        }
        static all(source, predicate) {
            if (source instanceof Array) {
                return source.every(predicate);
            }
            else {
                for (let item of source) {
                    if (!predicate(item))
                        return false;
                }
                return true;
            }
        }
        static any(source, predicate) {
            if (source instanceof Array) {
                return source.some(predicate);
            }
            else {
                for (let item of source) {
                    if (typeof predicate === "function") {
                        if (predicate(item)) {
                            return true;
                        }
                    }
                    else {
                        return true;
                    }
                }
                return false;
            }
        }
        static append(source, item) {
            let iterator = new Linq.AppendIterator(source, item);
            return new Enumerable(iterator);
        }
        static average(source, selector, ignoreNonNumberItems) {
            var sum = 0;
            var count = 0;
            if (!selector) {
                for (let element of source) {
                    if (typeof element !== "number") {
                        if (ignoreNonNumberItems)
                            continue;
                        throw new Error("invalid " + typeof (element) + " item");
                    }
                    sum += element;
                    count++;
                }
            }
            else {
                for (let element of source) {
                    let value = selector(element);
                    sum += value;
                    count++;
                }
            }
            if (count == 0)
                return 0;
            return sum / count;
        }
        static concat(source, sequence) {
            let iterator = new Linq.ConcatIterator(source, sequence);
            return new Enumerable(iterator);
        }
        static contains(source, value, comparer) {
            if (!comparer) {
                if (source instanceof Array) {
                    return source.indexOf(value) >= 0;
                }
                else {
                    for (let element of source) {
                        if (element === value)
                            return true;
                    }
                }
            }
            else {
                for (let element of source) {
                    if (comparer(element, value)) {
                        return true;
                    }
                }
            }
            return false;
        }
        static count(source, predicate) {
            if (source instanceof Enumerable || source instanceof OrderedEnumerable) {
                return source.count(predicate);
            }
            return Linq.countIterable(source, predicate);
        }
        static defaultIfEmpty(source, defaultValue) {
            let iterator = new Linq.DefaultIfEmptyIterator(source, defaultValue);
            return new Enumerable(iterator);
        }
        static distinct(source) {
            let iterator = new Linq.DistinctIterator(source);
            return new Enumerable(iterator);
        }
        static elementAt(source, index) {
            if (source instanceof Array) {
                if (index < 0 || index >= source.length)
                    throw new Error("invalid index");
                return source[index];
            }
            let elementIndex = 0;
            for (let element of source) {
                if (elementIndex == index)
                    return element;
                elementIndex++;
            }
            throw new Error("invalid index");
        }
        static elementAtOrDefault(source, index) {
            if (source instanceof Array) {
                return source[index];
            }
            else {
                let elementIndex = 0;
                for (let element of source) {
                    if (elementIndex == index)
                        return element;
                    elementIndex++;
                }
                return null;
            }
        }
        static empty() {
            return new Enumerable(new Array());
        }
        static except(source, sequence) {
            let iterator = new Linq.ExceptIterator(source, sequence);
            return new Enumerable(iterator);
        }
        static first(source, predicate) {
            let result = { value: null };
            if (this.tryGetFirst(source, predicate, result))
                return result.value;
            throw new Error();
        }
        static firstOrDefault(source, predicate) {
            let result = { value: null };
            if (this.tryGetFirst(source, predicate, result))
                return result.value;
            throw null;
        }
        static groupBySource(source, keySelector, comparer) {
            return new Linq.GroupedEnumerable(source, keySelector);
        }
        static groupBy(source, keySelector, elementSelector, resultSelector, comparer) {
            if (typeof resultSelector === "function") {
                return new Linq.GroupedResultEnumerable(source, keySelector, elementSelector, resultSelector);
            }
            else {
                return new Linq.GroupedEnumerable(source, keySelector, elementSelector);
            }
        }
        static groupJoin(source, innerSequence, outerKeySelector, innerKeySelector, resultSelector, comparer) {
            let iterator = new Linq.GroupJoinIterator(source, outerKeySelector, innerSequence, innerKeySelector, resultSelector);
            return new Enumerable(iterator);
        }
        static intersect(source, sequence) {
            let iterator = new Linq.IntersectIterator(source, sequence);
            return new Enumerable(iterator);
        }
        static join(source, inner, outerKeySelector, innerKeySelector, resultSelector, comparer) {
            let iterator = new Linq.JoinIterator(source, inner, outerKeySelector, innerKeySelector, resultSelector, comparer);
            return new Enumerable(iterator);
        }
        static last(source, predicate) {
            let result = { value: null };
            if (this.tryGetLast(source, predicate, result))
                return result.value;
            throw new Error();
        }
        static lastOrDefault(source, predicate) {
            let result = { value: null };
            if (this.tryGetLast(source, predicate, result))
                return result.value;
            throw null;
        }
        static max(source, selector, ignoreNonNumberItems) {
            let max = Number.NEGATIVE_INFINITY;
            if (!selector) {
                for (let element of source) {
                    if (typeof (element) !== "number") {
                        if (ignoreNonNumberItems)
                            continue;
                        throw new Error("invalid " + typeof (element) + " item");
                    }
                    max = Math.max(max, element);
                }
            }
            else {
                for (let element of source) {
                    let value = selector(element);
                    max = Math.max(max, value);
                }
            }
            return max;
        }
        static min(source, selector, ignoreNonNumberItems) {
            let min = Number.POSITIVE_INFINITY;
            if (!selector) {
                for (let element of source) {
                    if (typeof (element) !== "number") {
                        if (ignoreNonNumberItems)
                            continue;
                        throw new Error("invalid " + typeof (element) + " item");
                    }
                    min = Math.min(min, element);
                }
            }
            else {
                for (let element of source) {
                    let value = selector(element);
                    min = Math.min(min, value);
                }
            }
            return min;
        }
        static ofType(source, type) {
            let iterator = new Linq.OfTypeIterator(source, type);
            return new Enumerable(iterator);
        }
        static orderBy(source, keySelector) {
            const orderByIterator = new Linq.OrderByIterator(source, keySelector, false);
            return new OrderedEnumerable(orderByIterator);
        }
        static orderByDescending(source, keySelector) {
            const orderByIterator = new Linq.OrderByIterator(source, keySelector, true);
            return new OrderedEnumerable(orderByIterator);
        }
        static prepend(source, item) {
            let iterator = new Linq.PrependIterator(source, item);
            return new Enumerable(iterator);
        }
        static range(start, end, step) {
            var generator = new Linq.NumberGenerator(start, end, step);
            return new Enumerable(generator);
        }
        static repeat(element, count) {
            var generator = new Linq.UserGenerator((index) => element, count, null);
            return new Enumerable(generator);
        }
        static repeatElement(callback, count, userData) {
            var generator = new Linq.UserGenerator(callback, count, userData);
            return new Enumerable(generator);
        }
        static reverse(source) {
            let iterator = new Linq.ReverseIterator(source);
            return new Enumerable(iterator);
        }
        static select(source, selector) {
            var iterator = new Linq.SelectIterator(source, selector);
            return new Enumerable(iterator);
        }
        static selectMany(source, selector) {
            var iterator = new Linq.SelectManyIterator(source, selector);
            return new Enumerable(iterator);
        }
        static sequenceEqual(source, other, comparer) {
            if (source instanceof Array && other instanceof Array) {
                if (source.length != other.length)
                    return false;
            }
            let sourceIterator = source[Symbol.iterator]();
            let otherIterator = other[Symbol.iterator]();
            let sourceCurrent;
            let otherCurrent;
            while (true) {
                sourceCurrent = sourceIterator.next();
                otherCurrent = otherIterator.next();
                if (sourceCurrent.done && otherCurrent.done)
                    break;
                if (sourceCurrent.done != otherCurrent.done)
                    return false;
                if (comparer) {
                    if (!comparer(sourceCurrent.value, otherCurrent.value))
                        return false;
                }
                else {
                    if (sourceCurrent.value !== otherCurrent.value)
                        return false;
                }
            }
            return true;
        }
        static single(source, predicate) {
            var resultList = [...source].filter(v => predicate(v));
            if (resultList.length == 1) {
                return resultList[0];
            }
            else if (resultList.length < 1) {
                throw new Error("no elements");
            }
            else {
                throw new Error("more than one element");
            }
        }
        static singleOrDefault(source, predicate) {
            var resultList = [...source].filter(v => predicate(v));
            if (resultList.length == 1) {
                return resultList[0];
            }
            else {
                return null;
            }
        }
        static skip(source, count) {
            let iterator = new Linq.SkipIterator(source, count);
            return new Enumerable(iterator);
        }
        static skipLast(source, count) {
            let iterator = new Linq.SkipLastIterator(source, count);
            return new Enumerable(iterator);
        }
        static skipWhile(source, predicate) {
            let iterator = new Linq.SkipWhileIterator(source, predicate);
            return new Enumerable(iterator);
        }
        static sum(source, selector, ignoreNonNumberItems) {
            let result = 0;
            if (!selector) {
                for (let element of source) {
                    if (typeof (element) !== "number") {
                        if (ignoreNonNumberItems)
                            continue;
                        throw new Error("invalid " + typeof (element) + " item");
                    }
                    result += element;
                }
            }
            else {
                for (let element of source) {
                    let value = selector(element);
                    if (typeof (value) === "number")
                        result += value;
                }
            }
            return result;
        }
        static take(source, count) {
            let iterator = new Linq.TakeIterator(source, count);
            return new Enumerable(iterator);
        }
        static takeLast(source, count) {
            let iterator = new Linq.TakeLastIterator(source, count);
            return new Enumerable(iterator);
        }
        static takeWhile(source, predicate) {
            let iterator = new Linq.TakeWhileIterator(source, predicate);
            return new Enumerable(iterator);
        }
        static thenBy(source, keySelector) {
            const thenByIterator = new Linq.ThenByIterator(source, keySelector, false);
            return new OrderedEnumerable(thenByIterator);
        }
        static thenByDescending(source, keySelector) {
            const thenByIterator = new Linq.ThenByIterator(source, keySelector, true);
            return new OrderedEnumerable(thenByIterator);
        }
        static toArray(source) {
            if (source instanceof Array)
                return source;
            return [...source];
        }
        static toDictionary(source, keySelector, elementSelector, comparer) {
            var hasElementSelector = typeof elementSelector === "function";
            var hasComparer = typeof comparer === "function";
            var result = new Map();
            var keys = new Set();
            var keysEnumerable = new Enumerable(keys);
            var index = 0;
            for (let element of source) {
                var key = keySelector(element, index);
                if (hasComparer) {
                    if (keysEnumerable.contains(key, comparer))
                        throw new Error("duplicated key");
                }
                let selectedElement;
                if (hasElementSelector) {
                    selectedElement = elementSelector(element, index);
                }
                else {
                    selectedElement = element;
                }
                keys.add(key);
                result.set(key, selectedElement);
                index++;
            }
            return result;
        }
        static toLookup(source, keySelector, elementSelector, comparer) {
            if (source === null) {
                throw new Error("null argument source");
            }
            if (typeof (keySelector) !== "function") {
                throw new Error("null argument keySelector");
            }
            if (typeof (elementSelector) !== "function") {
                throw new Error("null argument elementSelector");
            }
            return Linq.Lookup.create(source, keySelector, elementSelector);
        }
        static union(source, sequence) {
            let iterator = new Linq.UnionIterator(source, sequence);
            return new Enumerable(iterator);
        }
        static where(source, predicate) {
            let iterator = new Linq.WhereIterator(source, predicate);
            return new Enumerable(iterator);
        }
        static zip(source, sequence, selector) {
            var iterator = new Linq.ZipIterator(source, sequence, selector);
            return new Enumerable(iterator);
        }
    }
    class IterableEnumerable {
        aggregate(seed, func, resultSelector) {
            let seedArg = null;
            let funcArg = null;
            let resultFuncArg = null;
            if (typeof seed === "function") {
                funcArg = seed;
                resultFuncArg = func;
            }
            else {
                seedArg = seed;
                funcArg = func;
                if (funcArg === null || funcArg === undefined)
                    throw new Error("null func");
                resultFuncArg = resultSelector;
            }
            return EnumerableExtensions.aggregate(this, seedArg, funcArg, resultFuncArg);
        }
        all(predicate) {
            if (predicate === undefined || predicate === null) {
                throw new Error("null predicate");
            }
            return EnumerableExtensions.all(this, predicate);
        }
        any(predicate) {
            if (predicate !== undefined && predicate === null) {
                throw new Error("null predicate");
            }
            return EnumerableExtensions.any(this, predicate);
        }
        append(item) {
            return EnumerableExtensions.append(this, item);
        }
        average(selectorOrIgnore) {
            let selectorArg;
            let ignoreNonNumber = false;
            if (typeof selectorOrIgnore === "function") {
                selectorArg = selectorOrIgnore;
            }
            else {
                ignoreNonNumber = selectorOrIgnore;
            }
            return EnumerableExtensions.average(this, selectorArg, ignoreNonNumber);
        }
        concat(sequence) {
            return EnumerableExtensions.concat(this, sequence);
        }
        contains(value, comparer) {
            return EnumerableExtensions.contains(this, value, comparer);
        }
        defaultIfEmpty(defaultValue) {
            return EnumerableExtensions.defaultIfEmpty(this, defaultValue);
        }
        distinct() {
            return EnumerableExtensions.distinct(this);
        }
        elementAt(index) {
            return EnumerableExtensions.elementAt(this, index);
        }
        elementAtOrDefault(index) {
            return EnumerableExtensions.elementAtOrDefault(this, index);
        }
        except(sequence) {
            return EnumerableExtensions.except(this, sequence);
        }
        first(predicate) {
            return EnumerableExtensions.first(this, predicate);
        }
        firstOrDefault(predicate) {
            return EnumerableExtensions.firstOrDefault(this, predicate);
        }
        getEnumerator() {
            return new Linq.Enumerator(this);
        }
        groupBy(keySelector, elementSelector, resultSelector) {
            return EnumerableExtensions.groupBy(this, keySelector, elementSelector, resultSelector);
        }
        groupJoin(innerSequence, outerKeySelector, innerKeySelector, resultSelector, comparer) {
            return EnumerableExtensions.groupJoin(this, innerSequence, outerKeySelector, innerKeySelector, resultSelector, comparer);
        }
        intersect(sequence) {
            return EnumerableExtensions.intersect(this, sequence);
        }
        join(innerSequence, outerKeySelector, innerKeySelector, resultSelector, comparer) {
            return EnumerableExtensions.join(this, innerSequence, outerKeySelector, innerKeySelector, resultSelector, comparer);
        }
        last(predicate) {
            return EnumerableExtensions.last(this, predicate);
        }
        lastOrDefault(predicate) {
            return EnumerableExtensions.lastOrDefault(this, predicate);
        }
        max(selectorOrIgnore) {
            let selectorArg;
            let ignoreNonNumber = false;
            if (typeof selectorOrIgnore === "function") {
                selectorArg = selectorOrIgnore;
            }
            else {
                ignoreNonNumber = selectorOrIgnore;
            }
            return EnumerableExtensions.max(this, selectorArg, ignoreNonNumber);
        }
        min(selectorOrIgnore) {
            let selectorArg;
            let ignoreNonNumber = false;
            if (typeof selectorOrIgnore === "function") {
                selectorArg = selectorOrIgnore;
            }
            else {
                ignoreNonNumber = selectorOrIgnore;
            }
            return EnumerableExtensions.min(this, selectorArg, ignoreNonNumber);
        }
        ofType(type) {
            return EnumerableExtensions.ofType(this, type);
        }
        orderBy(keySelector) {
            return EnumerableExtensions.orderBy(this, keySelector);
        }
        orderByDescending(keySelector) {
            return EnumerableExtensions.orderByDescending(this, keySelector);
        }
        prepend(item) {
            return EnumerableExtensions.prepend(this, item);
        }
        reverse() {
            return EnumerableExtensions.reverse(this);
        }
        select(selector) {
            return EnumerableExtensions.select(this, selector);
        }
        selectMany(selector) {
            return EnumerableExtensions.selectMany(this, selector);
        }
        sequenceEqual(other, comparer) {
            return EnumerableExtensions.sequenceEqual(this, other, comparer);
        }
        single(predicate) {
            return EnumerableExtensions.single(this, predicate);
        }
        singleOrDefault(predicate) {
            return EnumerableExtensions.singleOrDefault(this, predicate);
        }
        skip(count) {
            return EnumerableExtensions.skip(this, count);
        }
        skipLast(count) {
            return EnumerableExtensions.skipLast(this, count);
        }
        skipWhile(predicate) {
            return EnumerableExtensions.skipWhile(this, predicate);
        }
        sum(selectorOrIgnore) {
            let selectorArg;
            let ignoreNonNumber = false;
            if (typeof selectorOrIgnore === "function") {
                selectorArg = selectorOrIgnore;
            }
            else {
                ignoreNonNumber = selectorOrIgnore;
            }
            return EnumerableExtensions.sum(this, selectorArg, ignoreNonNumber);
        }
        take(count) {
            return EnumerableExtensions.take(this, count);
        }
        takeLast(count) {
            return EnumerableExtensions.takeLast(this, count);
        }
        takeWhile(predicate) {
            return EnumerableExtensions.takeWhile(this, predicate);
        }
        toArray() {
            return EnumerableExtensions.toArray(this);
        }
        toDictionary(keySelector, elementSelector, comparer) {
            return EnumerableExtensions.toDictionary(this, keySelector, elementSelector, comparer);
        }
        toLookup(keySelector, elementSelector, comparer) {
            return EnumerableExtensions.toLookup(this, keySelector, elementSelector, comparer);
        }
        union(sequence) {
            return EnumerableExtensions.union(this, sequence);
        }
        where(predicate) {
            return EnumerableExtensions.where(this, predicate);
        }
        zip(sequence, resultSelector) {
            return EnumerableExtensions.zip(this, sequence, resultSelector);
        }
    }
    Linq.IterableEnumerable = IterableEnumerable;
    class Enumerable extends IterableEnumerable {
        constructor(source) {
            super();
            if (isIterator(source)) {
                this._source = new IteratorIterableWrapper(source);
            }
            else {
                this._source = source;
            }
        }
        static from(source) {
            return new Enumerable(source);
        }
        static fromGenerator(source) {
            const iterator = source();
            return new Enumerable(iterator);
        }
        static range(start, end, step) {
            return EnumerableExtensions.range(start, end, step);
        }
        static repeat(element, count) {
            return EnumerableExtensions.repeat(element, count);
        }
        static repeatElement(callback, count, userData) {
            return EnumerableExtensions.repeatElement(callback, count, userData);
        }
        static empty() {
            return EnumerableExtensions.empty();
        }
        count(predicate) {
            return Linq.countIterable(this._source, predicate);
        }
        *[Symbol.iterator]() {
            for (let item of this._source) {
                yield item;
            }
        }
    }
    Linq.Enumerable = Enumerable;
    class OrderedEnumerable extends IterableEnumerable {
        constructor(source) {
            super();
            this._source = source;
        }
        thenBy(keySelector) {
            return EnumerableExtensions.thenBy(this._source, keySelector);
        }
        thenByDescending(keySelector) {
            return EnumerableExtensions.thenByDescending(this._source, keySelector);
        }
        count(predicate) {
            return Linq.countIterable(this._source, predicate);
        }
        *[Symbol.iterator]() {
            for (let item of this._source) {
                yield item;
            }
        }
    }
    Linq.OrderedEnumerable = OrderedEnumerable;
})(Linq || (Linq = {}));
var Linq;
(function (Linq) {
    class Enumerator {
        constructor(source) {
            this._source = source;
            this._createGenerator();
        }
        _createGenerator() {
            this._gen = (function* (sequence) {
                for (const item of sequence) {
                    yield item;
                }
            })(this._source);
        }
        next() {
            return this._gen.next();
        }
        return(value) {
            return this._gen.return(value);
        }
        throw(e) {
            return this._gen.throw(e);
        }
        reset() {
            this._createGenerator();
        }
    }
    Linq.Enumerator = Enumerator;
})(Linq || (Linq = {}));
var Linq;
(function (Linq) {
    function isEnumerable(object) {
        return object instanceof Linq.IterableEnumerable;
    }
    Linq.isEnumerable = isEnumerable;
    function isGroupedEnumerable(object) {
        return object instanceof Linq.GroupedEnumerable;
    }
    Linq.isGroupedEnumerable = isGroupedEnumerable;
    function countIterable(source, predicate) {
        if (!predicate) {
            if (source instanceof Array) {
                return source.length;
            }
            else if (source instanceof Set) {
                return source.size;
            }
            else if (source instanceof Map) {
                return source.size;
            }
            else {
                let count = 0;
                for (let element of source) {
                    count++;
                }
                return count;
            }
        }
        else {
            if (source instanceof Array) {
                return source.filter(predicate).length;
            }
            else {
                let count = 0;
                for (let element of source) {
                    if (predicate(element)) {
                        count++;
                    }
                }
                return count;
            }
        }
    }
    Linq.countIterable = countIterable;
})(Linq || (Linq = {}));
var Linq;
(function (Linq) {
    class Generator {
        constructor() {
            this._index = -1;
            this._current = null;
        }
        get index() {
            return this._index;
        }
        get current() {
            return this._current;
        }
        reset() {
            this._index = -1;
            this._current = null;
        }
    }
    Linq.Generator = Generator;
    class UserGenerator extends Generator {
        constructor(callback, count, userData) {
            super();
            this.callback = callback;
            this.count = count;
            this.userData = userData;
        }
        *[Symbol.iterator]() {
            for (let i = 0; i < this.count; i++) {
                this._index++;
                let result = this.callback(this.index, this.userData);
                if (typeof result !== "undefined") {
                    this._current = result;
                    yield result;
                }
            }
            this.reset();
        }
    }
    Linq.UserGenerator = UserGenerator;
    class NumberGenerator extends Generator {
        constructor(start, end, step) {
            super();
            this.start = start;
            this.end = end;
            this.step = step || 1;
            this._current = this.start - this.step;
        }
        *[Symbol.iterator]() {
            let count = this.end - this.start;
            for (let i = 0; i < count; i += this.step) {
                this._index = i;
                this._current = this.start + i;
                yield this._current;
            }
            this.reset();
        }
    }
    Linq.NumberGenerator = NumberGenerator;
    class KeyValueGenerator extends Generator {
        constructor(iterable, keySelector, valueSelector) {
            super();
            this._iterable = iterable;
            this._keySelector = keySelector;
            this._valueSelector = valueSelector;
        }
        *[Symbol.iterator]() {
            for (let element of this._iterable) {
                this._index++;
                var key = this._keySelector(element, this.index);
                let value;
                if (this._valueSelector) {
                    value = this._valueSelector(element, this.index);
                }
                else {
                    value = element;
                }
                yield { key: key, value: value };
            }
            this.reset();
        }
    }
    Linq.KeyValueGenerator = KeyValueGenerator;
})(Linq || (Linq = {}));
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var Linq;
(function (Linq) {
    var _elements;
    function assert(expression) {
        if (!expression()) {
            throw new Error("Assert fail: " + expression.toString());
        }
    }
    class Grouping extends Linq.IterableEnumerable {
        constructor(key, elements) {
            super();
            _elements.set(this, void 0);
            this.key = key;
            __classPrivateFieldSet(this, _elements, elements);
        }
        count(predicate) {
            return Linq.countIterable(__classPrivateFieldGet(this, _elements), predicate);
        }
        *[(_elements = new WeakMap(), Symbol.iterator)]() {
            for (const element of __classPrivateFieldGet(this, _elements)) {
                yield element;
            }
        }
    }
    Linq.Grouping = Grouping;
    class GroupedEnumerable extends Linq.IterableEnumerable {
        constructor(source, keySelector, elementSelector) {
            super();
            this._lookup = null;
            assert(() => source != null);
            assert(() => typeof keySelector === "function");
            assert(() => typeof keySelector === "function");
            this._source = source;
            this._keySelector = keySelector;
            this._elementSelector = elementSelector;
        }
        _getOrCreateLookup() {
            if (this._lookup == null) {
                this._lookup = Linq.Lookup.create(this._source, this._keySelector, this._elementSelector);
            }
            return this._lookup;
        }
        count(predicate) {
            return Linq.countIterable(this._getOrCreateLookup(), predicate);
        }
        *[Symbol.iterator]() {
            for (const element of this._getOrCreateLookup()) {
                yield element;
            }
        }
    }
    Linq.GroupedEnumerable = GroupedEnumerable;
    class GroupedResultEnumerable extends Linq.IterableEnumerable {
        constructor(source, keySelector, elementSelector, resultSelector) {
            super();
            this._lookup = null;
            assert(() => source != null);
            assert(() => typeof keySelector === "function");
            assert(() => typeof keySelector === "function");
            this._source = source;
            this._keySelector = keySelector;
            this._elementSelector = elementSelector;
            this._resultSelector = resultSelector;
        }
        _getOrCreateLookup() {
            if (this._lookup == null) {
                this._lookup = Linq.Lookup.create(this._source, this._keySelector, this._elementSelector);
            }
            return this._lookup;
        }
        count(predicate) {
            return Linq.countIterable(this, predicate);
        }
        *[Symbol.iterator]() {
            for (const element of this._getOrCreateLookup()) {
                yield this._resultSelector(element.key, element);
            }
        }
    }
    Linq.GroupedResultEnumerable = GroupedResultEnumerable;
})(Linq || (Linq = {}));
var Linq;
(function (Linq) {
    class BaseIterator {
        constructor(iterable) {
            this._index = -1;
            this._current = null;
            this.iterable = iterable;
            this.reset();
        }
        get index() {
            return this._index;
        }
        get current() {
            return this._current;
        }
        reset() {
            this._index = -1;
            this._current = null;
        }
    }
    Linq.BaseIterator = BaseIterator;
    class SourceResultIterator {
        constructor(iterable) {
            this._index = -1;
            this._current = null;
            this.iterable = iterable;
            this.reset();
        }
        get index() {
            return this._index;
        }
        get current() {
            return this._current;
        }
        reset() {
            this._index = -1;
            this._current = null;
        }
    }
    Linq.SourceResultIterator = SourceResultIterator;
    class SimpleIterator extends BaseIterator {
        constructor(iterable) {
            super(iterable);
        }
        *[Symbol.iterator]() {
            for (let item of this.iterable) {
                this._index++;
                this._current = item;
                yield item;
            }
            this.reset();
        }
    }
    Linq.SimpleIterator = SimpleIterator;
    class AppendIterator extends BaseIterator {
        constructor(iterable, item) {
            super(iterable);
            this._item = item;
        }
        *[Symbol.iterator]() {
            let result;
            for (let item of this.iterable) {
                this._index++;
                this._current = item;
                yield this.current;
            }
            this._index++;
            this._current = this._item;
            yield this._item;
            this.reset();
        }
    }
    Linq.AppendIterator = AppendIterator;
    class ConcatIterator extends BaseIterator {
        constructor(iterable, other) {
            super(iterable);
            this._other = other;
        }
        *[Symbol.iterator]() {
            for (let element of this.iterable) {
                this._index++;
                this._current = element;
                yield element;
            }
            for (let element of this._other) {
                this._index++;
                this._current = element;
                yield element;
            }
            this.reset();
        }
    }
    Linq.ConcatIterator = ConcatIterator;
    class CountIterator extends BaseIterator {
        constructor(iterable, predicate) {
            super(iterable);
            this._computedCount = -1;
            this._predicate = predicate;
        }
        *[Symbol.iterator]() {
            if (this.iterable instanceof Array) {
                this._computedCount = this.iterable.length;
            }
            else if (this.iterable instanceof Set) {
                this._computedCount = this.iterable.size;
            }
            else if (this.iterable instanceof Map) {
                this._computedCount = this.iterable.size;
            }
            else {
                let count = 0;
                for (const element of this.iterable) {
                    count++;
                }
                this._computedCount = count;
            }
            for (let element of this.iterable) {
                this._index++;
                let valid = this._predicate(element, this.index);
                if (valid) {
                    this._current = element;
                    yield element;
                }
            }
            this.reset();
        }
        get count() { return this._computedCount; }
    }
    Linq.CountIterator = CountIterator;
    class DefaultIfEmptyIterator extends BaseIterator {
        constructor(iterable, defaultValue) {
            super(iterable);
            this._defaultValue = defaultValue;
        }
        *[Symbol.iterator]() {
            let count = 0;
            for (let element of this.iterable) {
                count++;
                this._index++;
                this._current = element;
                yield element;
            }
            if (count == 0) {
                yield this._defaultValue;
            }
            this.reset();
        }
    }
    Linq.DefaultIfEmptyIterator = DefaultIfEmptyIterator;
    class DistinctIterator extends BaseIterator {
        constructor(iterable) {
            super(iterable);
            this._values = new Set();
        }
        *[Symbol.iterator]() {
            for (let element of this.iterable) {
                if (!this._values.has(element)) {
                    this._values.add(element);
                    this._index++;
                    this._current = element;
                    yield element;
                }
            }
            this.reset();
        }
    }
    Linq.DistinctIterator = DistinctIterator;
    class ExceptIterator extends BaseIterator {
        constructor(iterable, other) {
            super(iterable);
            this._other = other;
        }
        *[Symbol.iterator]() {
            let otherArray = Array.from(this._other);
            for (let element of this.iterable) {
                if (otherArray.indexOf(element) < 0) {
                    this._index++;
                    this._current = element;
                    yield element;
                }
            }
            this.reset();
        }
    }
    Linq.ExceptIterator = ExceptIterator;
    class GroupIterator extends SourceResultIterator {
        constructor(iterable, keySelector) {
            super(iterable);
            this._keySelector = keySelector;
        }
        *[Symbol.iterator]() {
            let groups = new Map();
            for (let item of this.iterable) {
                this._index++;
                let key = this._keySelector(item, this.index);
                if (groups.has(key)) {
                    groups.get(key).push(item);
                }
                else {
                    groups.set(key, [item]);
                }
            }
            for (let entry of groups) {
                let g = new Linq.Grouping(entry[0], entry[1]);
                this._current = g;
                yield this.current;
            }
            this.reset();
        }
    }
    Linq.GroupIterator = GroupIterator;
    class GroupElementIterator extends SourceResultIterator {
        constructor(iterable, keySelector, elementSelector) {
            super(iterable);
            this._keySelector = keySelector;
            this._elementSelector = elementSelector;
        }
        *[Symbol.iterator]() {
            let groups = new Map();
            for (let item of this.iterable) {
                this._index++;
                let key = this._keySelector(item, this.index);
                let element = this._elementSelector(item, this.index);
                if (groups.has(key)) {
                    groups.get(key).push(element);
                }
                else {
                    groups.set(key, [element]);
                }
            }
            for (let entry of groups) {
                var group = new Linq.Grouping(entry[0], entry[1]);
                this._current = group;
                yield this.current;
            }
            this.reset();
        }
    }
    Linq.GroupElementIterator = GroupElementIterator;
    class GroupResultIterator extends SourceResultIterator {
        constructor(iterable, keySelector, elementSelector, resultSelector) {
            super(iterable);
            this._keySelector = keySelector;
            this._elementSelector = elementSelector;
            this._resultSelector = resultSelector;
        }
        *[Symbol.iterator]() {
            let groups = new Map();
            for (let item of this.iterable) {
                this._index++;
                let key = this._keySelector(item, this.index);
                let element = this._elementSelector(item, this.index);
                if (groups.has(key)) {
                    groups.get(key).push(element);
                }
                else {
                    groups.set(key, [element]);
                }
            }
            for (let entry of groups) {
                let result = this._resultSelector(entry[0], entry[1]);
                yield result;
            }
            this.reset();
        }
    }
    Linq.GroupResultIterator = GroupResultIterator;
    class GroupJoinIterator extends SourceResultIterator {
        constructor(iterable, keySelector, innerSequence, innerKeySelector, resultSelector) {
            super(iterable);
            this._keySelector = keySelector;
            this._innerSequence = innerSequence;
            this._innerKeySelector = innerKeySelector;
            this._resultSelector = resultSelector || ((key, inner) => inner);
        }
        *[Symbol.iterator]() {
            let lookup = Linq.Lookup.createForJoin(this._innerSequence, this._innerKeySelector);
            for (let item of this.iterable) {
                let key = this._keySelector(item);
                yield this._resultSelector(item, lookup.item(key));
            }
            this.reset();
        }
    }
    Linq.GroupJoinIterator = GroupJoinIterator;
    class IntersectIterator extends BaseIterator {
        constructor(iterable, other) {
            super(iterable);
            this._other = other;
        }
        *[Symbol.iterator]() {
            let otherArray = Array.from(this._other);
            for (let element of this.iterable) {
                if (otherArray.indexOf(element) >= 0) {
                    this._index++;
                    this._current = element;
                    yield element;
                }
            }
            this.reset();
        }
    }
    Linq.IntersectIterator = IntersectIterator;
    class JoinIterator extends SourceResultIterator {
        constructor(iterable, innerSequence, keySelector, innerKeySelector, resultSelector, comparer) {
            super(iterable);
            this._keySelector = keySelector;
            this._innerSequence = innerSequence;
            this._innerKeySelector = innerKeySelector;
            this._resultSelector = resultSelector || ((key, inner) => inner);
            this._comparer = comparer;
            this._groups = new Map();
        }
        *[Symbol.iterator]() {
            let lookup = Linq.Lookup.createForJoin(this._innerSequence, this._innerKeySelector);
            for (let item of this.iterable) {
                let key = this._keySelector(item);
                let grouping = lookup.item(key);
                for (let groupItem of grouping) {
                    yield this._resultSelector(item, groupItem);
                }
            }
            this.reset();
        }
    }
    Linq.JoinIterator = JoinIterator;
    class OfTypeIterator extends SourceResultIterator {
        constructor(iterable, type) {
            super(iterable);
            this._type = type;
        }
        *[Symbol.iterator]() {
            for (let item of this.iterable) {
                this._index++;
                if (item && item.constructor && item.constructor === this._type) {
                    let result = item;
                    this._current = result;
                    yield result;
                }
            }
            this.reset();
        }
    }
    Linq.OfTypeIterator = OfTypeIterator;
    class PrependIterator extends BaseIterator {
        constructor(iterable, item) {
            super(iterable);
            this._item = item;
        }
        *[Symbol.iterator]() {
            this._index++;
            this._current = this._item;
            yield this._item;
            for (let element of this.iterable) {
                this._index++;
                this._current = element;
                yield this.current;
            }
            this.reset();
        }
    }
    Linq.PrependIterator = PrependIterator;
    class ReverseIterator extends BaseIterator {
        constructor(iterable) {
            super(iterable);
        }
        *[Symbol.iterator]() {
            let reversedIterable = [...this.iterable].reverse();
            for (let element of reversedIterable) {
                this._index++;
                this._current = element;
                yield this.current;
            }
            this.reset();
        }
    }
    Linq.ReverseIterator = ReverseIterator;
    class SelectIterator extends SourceResultIterator {
        constructor(iterable, selector) {
            super(iterable);
            this._selector = selector;
        }
        *[Symbol.iterator]() {
            for (let element of this.iterable) {
                this._index++;
                this._current = this._selector(element, this.index);
                yield this.current;
            }
            this.reset();
        }
    }
    Linq.SelectIterator = SelectIterator;
    class SelectManyIterator extends SourceResultIterator {
        constructor(iterable, selector) {
            super(iterable);
            this._selector = selector;
        }
        *[Symbol.iterator]() {
            for (let element of this.iterable) {
                this._index++;
                let subElements = this._selector(element, this.index);
                for (let subElement of subElements) {
                    yield subElement;
                }
            }
            this.reset();
        }
    }
    Linq.SelectManyIterator = SelectManyIterator;
    class SkipIterator extends BaseIterator {
        constructor(iterable, count) {
            super(iterable);
            this._count = count;
        }
        *[Symbol.iterator]() {
            for (let element of this.iterable) {
                this._index++;
                if (this._index < this._count) {
                    continue;
                }
                this._current = element;
                yield element;
            }
            this.reset();
        }
    }
    Linq.SkipIterator = SkipIterator;
    class SkipLastIterator extends BaseIterator {
        constructor(iterable, count) {
            super(iterable);
            this._count = count;
        }
        *[Symbol.iterator]() {
            let queue = new Array();
            let iterator = this.iterable[Symbol.iterator]();
            let iteratorResult;
            while (!(iteratorResult = iterator.next()).done) {
                if (queue.length === this._count) {
                    do {
                        let current = queue.splice(0, 1)[0];
                        yield current;
                        queue.push(iteratorResult.value);
                    } while (!(iteratorResult = iterator.next()).done);
                    break;
                }
                else {
                    queue.push(iteratorResult.value);
                }
            }
            this.reset();
        }
    }
    Linq.SkipLastIterator = SkipLastIterator;
    class SkipWhileIterator extends BaseIterator {
        constructor(iterable, predicate) {
            super(iterable);
            this._skip = true;
            this._predicate = predicate;
        }
        *[Symbol.iterator]() {
            for (let element of this.iterable) {
                this._index++;
                if (this._skip) {
                    if (this._predicate(element, this._index)) {
                        continue;
                    }
                    this._skip = false;
                }
                this._current = element;
                yield element;
            }
            this.reset();
        }
    }
    Linq.SkipWhileIterator = SkipWhileIterator;
    class TakeIterator extends BaseIterator {
        constructor(iterable, count) {
            super(iterable);
            this._count = count;
        }
        *[Symbol.iterator]() {
            for (let element of this.iterable) {
                this._index++;
                if (this._index >= this._count) {
                    break;
                }
                this._current = element;
                yield element;
            }
            this.reset();
        }
    }
    Linq.TakeIterator = TakeIterator;
    class TakeLastIterator extends BaseIterator {
        constructor(iterable, count) {
            super(iterable);
            this._count = count;
        }
        *[Symbol.iterator]() {
            let iterator = this.iterable[Symbol.iterator]();
            let iteratorResult;
            if ((iteratorResult = iterator.next()).done) {
                this.reset();
                return;
            }
            let queue = new Array();
            queue.push(iteratorResult.value);
            while (!(iteratorResult = iterator.next()).done) {
                if (queue.length < this._count) {
                    queue.push(iteratorResult.value);
                }
                else {
                    do {
                        queue.splice(0, 1);
                        queue.push(iteratorResult.value);
                    } while (!(iteratorResult = iterator.next()).done);
                    break;
                }
            }
            if (queue.length > this._count)
                throw new Error();
            do {
                let current = queue.splice(0, 1)[0];
                yield current;
            } while (queue.length > 0);
            this.reset();
        }
    }
    Linq.TakeLastIterator = TakeLastIterator;
    class TakeWhileIterator extends BaseIterator {
        constructor(iterable, predicate) {
            super(iterable);
            this._predicate = predicate;
        }
        *[Symbol.iterator]() {
            for (let element of this.iterable) {
                this._index++;
                if (!this._predicate(element, this.index)) {
                    break;
                }
                this._current = element;
                yield element;
            }
            this.reset();
        }
    }
    Linq.TakeWhileIterator = TakeWhileIterator;
    class UnionIterator extends BaseIterator {
        constructor(iterable, other) {
            super(iterable);
            this._other = other;
            this._values = [];
        }
        *[Symbol.iterator]() {
            for (let element of this.iterable) {
                this._values.push(element);
                this._index++;
                this._current = element;
                yield element;
            }
            for (let element of this._other) {
                if (this._values.indexOf(element) < 0) {
                    this._values.push(element);
                    this._index++;
                    this._current = element;
                    yield element;
                }
            }
            this.reset();
        }
    }
    Linq.UnionIterator = UnionIterator;
    class WhereIterator extends BaseIterator {
        constructor(iterable, predicate) {
            super(iterable);
            this._predicate = predicate;
        }
        *[Symbol.iterator]() {
            for (let element of this.iterable) {
                this._index++;
                let valid = this._predicate(element, this.index);
                if (valid) {
                    this._current = element;
                    yield element;
                }
            }
            this.reset();
        }
    }
    Linq.WhereIterator = WhereIterator;
    class ZipIterator extends SourceResultIterator {
        constructor(iterable, sequence, resultSelector) {
            super(iterable);
            this._resultSelector = resultSelector;
            this._sequence = sequence;
        }
        *[Symbol.iterator]() {
            for (let otherElement of this._sequence) {
                for (let element of this.iterable) {
                    var resultElement = this._resultSelector(element, otherElement);
                    yield resultElement;
                }
            }
            this.reset();
        }
    }
    Linq.ZipIterator = ZipIterator;
    class XPathResultIterator {
        constructor(xpathResult) {
            this._index = -1;
            this._current = null;
            this._chachedNodeIteration = null;
            this._xpathResult = xpathResult;
        }
        get index() {
            return this._index;
        }
        get current() {
            return this._current;
        }
        *[Symbol.iterator]() {
            switch (this._xpathResult.resultType) {
                case 1:
                    this._index = 0;
                    yield this._xpathResult.numberValue;
                    break;
                case 2:
                    this._index = 0;
                    yield this._xpathResult.stringValue;
                    break;
                case 3:
                    this._index = 0;
                    yield this._xpathResult.booleanValue;
                    break;
                case 0:
                case 4:
                case 5:
                    {
                        this._index = -1;
                        if (this._chachedNodeIteration) {
                            for (let element of this._chachedNodeIteration) {
                                this._index++;
                                this._current = element;
                                yield element;
                            }
                        }
                        else {
                            this._chachedNodeIteration = [];
                            let result = this._xpathResult.iterateNext();
                            while (result) {
                                this._index++;
                                this._chachedNodeIteration.push(result);
                                this._current = result;
                                yield result;
                                result = this._xpathResult.iterateNext();
                            }
                        }
                    }
                    break;
                case 6:
                case 7:
                    {
                        this._index = -1;
                        for (var i = 0; i < this._xpathResult.snapshotLength; i++) {
                            this._index = i;
                            this._current = this._xpathResult.snapshotItem(i);
                            yield this._current;
                        }
                    }
                    break;
                case 8:
                case 9:
                    this._index = 0;
                    yield this._xpathResult.singleNodeValue;
                    break;
            }
            this._index = -1;
            this._current = null;
            this._chachedNodeIteration = null;
        }
    }
    Linq.XPathResultIterator = XPathResultIterator;
    class OrderedIterator extends BaseIterator {
        constructor(iterable, comparer) {
            super(iterable);
            this.comparer = comparer;
        }
        static createComparer(keySelector, descending) {
            return (a, b) => {
                const aKey = keySelector(a);
                const bKey = keySelector(b);
                if (aKey > bKey)
                    return descending ? -1 : 1;
                if (aKey < bKey)
                    return descending ? 1 : -1;
                return 0;
            };
        }
        *[Symbol.iterator]() {
            const orderedSource = [...this.iterable].sort(this.comparer);
            yield* orderedSource;
        }
    }
    Linq.OrderedIterator = OrderedIterator;
    class OrderByIterator extends OrderedIterator {
        constructor(iterable, keySelector, descending = false) {
            super(iterable, OrderedIterator.createComparer(keySelector, descending));
        }
    }
    Linq.OrderByIterator = OrderByIterator;
    function composeComparers(firstComparer, secondComparer) {
        return (a, b) => firstComparer(a, b) || secondComparer(a, b);
    }
    class ThenByIterator extends OrderedIterator {
        constructor(iterable, keySelector, descending = false) {
            super(iterable, composeComparers(iterable.comparer, OrderedIterator.createComparer(keySelector, descending)));
        }
    }
    Linq.ThenByIterator = ThenByIterator;
})(Linq || (Linq = {}));
var Linq;
(function (Linq) {
    Linq.Version = "0.0.1";
})(Linq || (Linq = {}));
if (typeof module !== "undefined") {
    module.exports = Linq;
}
var Linq;
(function (Linq) {
    function assert(expression) {
        if (!expression()) {
            throw new Error("Assert fail: " + expression.toString());
        }
    }
    class Lookup {
        constructor(map) {
            this._mappedArrays = map;
            this._map = new Map();
        }
        static mapAsGroups(source, keySelector, elementSelector) {
            var result = new Map();
            var keys = new Set();
            var hasElementSelector = typeof elementSelector === "function";
            var index = 0;
            for (let element of source) {
                var key = keySelector(element, index);
                var groupedElement = element;
                if (hasElementSelector) {
                    groupedElement = elementSelector(element, index);
                }
                if (result.has(key)) {
                    result.get(key).push(groupedElement);
                }
                else {
                    result.set(key, [groupedElement]);
                }
                keys.add(key);
                index++;
            }
            return result;
        }
        static create(source, keySelector, elementSelector) {
            assert(() => source != null);
            assert(() => keySelector != null);
            assert(() => elementSelector != null);
            let mappedGroups = Lookup.mapAsGroups(source, keySelector, elementSelector);
            let lookup = new Lookup(mappedGroups);
            return lookup;
        }
        static createForJoin(source, keySelector) {
            let mappedGroups = Lookup.mapAsGroups(source, keySelector);
            let lookup = new Lookup(mappedGroups);
            return lookup;
        }
        get count() {
            return this._mappedArrays.size;
        }
        item(key) {
            if (this._map.has(key)) {
                return this._map.get(key);
            }
            else if (this._mappedArrays.has(key)) {
                var grouping = new Linq.Grouping(key, this._mappedArrays.get(key));
                this._map.set(key, grouping);
                return grouping;
            }
        }
        contains(key) {
            return this._mappedArrays.has(key);
        }
        *[Symbol.iterator]() {
            let keys = this._mappedArrays.keys();
            for (let k of keys) {
                yield this.item(k);
            }
        }
    }
    Linq.Lookup = Lookup;
})(Linq || (Linq = {}));
//# sourceMappingURL=linq-g.js.map