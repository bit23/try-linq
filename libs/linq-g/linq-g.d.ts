declare namespace Linq {
    type AccumulatorFunc<TAccumulate, TSource, TResult> = (aggregate: TAccumulate, next: TSource) => TResult;
    type SelectorFunc<TSource, TResult> = (source: TSource, index?: number) => TResult;
    type PredicateFunc<TSource> = (source: TSource, index?: number) => boolean;
    type ComparerFunc<TSource> = (item1: TSource, item2: TSource) => number;
    type EqualityComparerFunc<TSource> = (item1: TSource, item2: TSource) => boolean;
    type GroupResultSelectorFunc<TKey, TElement, TResult> = (key: TKey, elements: Iterable<TElement>) => TResult;
    type ResultSelectorFunc<TFirst, TSecond, TResult> = (first: TFirst, second: TSecond) => TResult;
}
declare namespace Linq {
    function isEnumerable(object: any): object is Linq.IEnumerable<any>;
    function isGroupedEnumerable(object: any): object is Linq.GroupedEnumerable<any, any>;
    function isIterator(object: any): object is Iterator<any>;
    function composeComparers<T>(firstComparer: (a: T, b: T) => number, secondComparer: (a: T, b: T) => number): ((a: T, b: T) => number);
    interface IEnumerable<TSource> extends Iterable<TSource> {
        aggregate<TAccumulate, TResult = TAccumulate>(func: AccumulatorFunc<TAccumulate, TSource, TAccumulate>): TResult;
        aggregate<TAccumulate, TResult = TAccumulate>(seed: TAccumulate, func: AccumulatorFunc<TAccumulate, TSource, TAccumulate>): TResult;
        aggregate<TAccumulate, TResult = TAccumulate>(seed: TAccumulate, func: AccumulatorFunc<TAccumulate, TSource, TAccumulate>, resultSelector: SelectorFunc<TAccumulate, TResult>): TResult;
        all(predicate: PredicateFunc<TSource>): boolean;
        any(predicate?: PredicateFunc<TSource>): boolean;
        append(item: TSource): IEnumerable<TSource>;
        average(ignoreNonNumberItems?: boolean): number;
        average(selector?: SelectorFunc<TSource, number>): number;
        concat(sequence: Iterable<TSource>): IEnumerable<TSource>;
        contains(value: TSource, comparer?: EqualityComparerFunc<TSource>): boolean;
        count(predicate?: PredicateFunc<TSource>): number;
        defaultIfEmpty(defaultValue: TSource): IEnumerable<TSource>;
        distinct(): IEnumerable<TSource>;
        elementAt(index: number): TSource;
        elementAtOrDefault(index: number): TSource;
        except(sequence: Iterable<TSource>): IEnumerable<TSource>;
        first(predicate?: PredicateFunc<TSource>): TSource;
        firstOrDefault(predicate: PredicateFunc<TSource>): TSource;
        groupBy<TKey>(keySelector: SelectorFunc<TSource, TKey>): IEnumerable<IGrouping<TKey, TSource>>;
        groupBy<TKey, TElement = TSource>(keySelector: SelectorFunc<TSource, TKey>, elementSelector: SelectorFunc<TSource, TElement>): IEnumerable<IGrouping<TKey, TElement>>;
        groupBy<TKey, TElement = TSource, TResult = TElement>(keySelector: SelectorFunc<TSource, TKey>, elementSelector: SelectorFunc<TSource, TElement>, resultSelector: GroupResultSelectorFunc<TKey, TElement, TResult>): IEnumerable<IGrouping<TKey, TResult>>;
        groupJoin<TKey, TInner, TResult>(innerSequence: Iterable<TInner>, outerKeySelector: SelectorFunc<TSource, TKey>, innerKeySelector: SelectorFunc<TInner, TKey>, resultSelector: ResultSelectorFunc<TSource, Iterable<TInner>, TResult>, comparer: EqualityComparerFunc<TKey>): IEnumerable<TResult>;
        intersect(sequence: Iterable<TSource>): IEnumerable<TSource>;
        join<TKey, TInner, TResult>(innerSequence: Iterable<TInner>, outerKeySelector: SelectorFunc<TSource, TKey>, innerKeySelector: SelectorFunc<TInner, TKey>, resultSelector: ResultSelectorFunc<TSource, TInner, TResult>, comparer?: EqualityComparerFunc<TKey>): IEnumerable<TResult>;
        last(predicate: PredicateFunc<TSource>): TSource;
        lastOrDefault(predicate: PredicateFunc<TSource>): TSource;
        max(ignoreNonNumberItems?: boolean): number;
        max(selector?: SelectorFunc<TSource, number>): number;
        min(ignoreNonNumberItems?: boolean): number;
        min(selector?: SelectorFunc<TSource, number>): number;
        ofType<TResult>(type: new () => TResult): IEnumerable<TResult>;
        orderBy<TKey>(keySelector: SelectorFunc<TSource, TKey>): IOrderedEnumerable<TSource>;
        orderByDescending<TKey>(keySelector: SelectorFunc<TSource, TKey>): IOrderedEnumerable<TSource>;
        prepend(item: TSource): IEnumerable<TSource>;
        reverse(): IEnumerable<TSource>;
        select<TResult>(selector: SelectorFunc<TSource, TResult>): IEnumerable<TResult>;
        selectMany<TResult>(selector: SelectorFunc<TSource, Iterable<TResult>>): IEnumerable<TResult>;
        sequenceEqual(other: Iterable<TSource>, comparer?: EqualityComparerFunc<TSource>): boolean;
        single(predicate?: PredicateFunc<TSource>): TSource;
        singleOrDefault?(predicate: PredicateFunc<TSource>): TSource;
        skip(count: number): IEnumerable<TSource>;
        skipLast(count: number): IEnumerable<TSource>;
        skipWhile(predicate: PredicateFunc<TSource>): IEnumerable<TSource>;
        sum(ignoreNonNumberItems?: boolean): number;
        sum(selector?: SelectorFunc<TSource, number>): number;
        take(count: number): IEnumerable<TSource>;
        takeLast(count: number): IEnumerable<TSource>;
        takeWhile(predicate: PredicateFunc<TSource>): IEnumerable<TSource>;
        toArray(): TSource[];
        toDictionary<TKey, TValue>(keySelector: SelectorFunc<TSource, TKey>, elementSelector: SelectorFunc<TSource, TValue>, comparer: EqualityComparerFunc<TKey>): Map<TKey, TValue>;
        union(sequence: Iterable<TSource>): IEnumerable<TSource>;
        where(predicate: PredicateFunc<TSource>): IEnumerable<TSource>;
        zip<TSecond, TResult>(sequence: Iterable<TSecond>, resultSelector: ResultSelectorFunc<TSource, TSecond, TResult>): IEnumerable<TResult>;
    }
    interface OrderedIterable<TSource> extends Iterable<TSource> {
        readonly comparer: ComparerFunc<TSource>;
    }
    interface IOrderedEnumerable<TSource> extends IEnumerable<TSource> {
        thenBy<TKey>(keySelector: SelectorFunc<TSource, TKey>): IOrderedEnumerable<TSource>;
        thenByDescending<TKey>(keySelector: SelectorFunc<TSource, TKey>): IOrderedEnumerable<TSource>;
    }
    abstract class IterableEnumerable<TSource> implements IEnumerable<TSource> {
        abstract [Symbol.iterator](): Iterator<TSource>;
        aggregate<TAccumulate = TSource, TResult = TAccumulate>(func: AccumulatorFunc<TAccumulate, TSource, TAccumulate>): TResult;
        aggregate<TAccumulate = TSource, TResult = TAccumulate>(seed: TAccumulate, func: AccumulatorFunc<TAccumulate, TSource, TAccumulate>): TResult;
        aggregate<TAccumulate = TSource, TResult = TAccumulate>(seed: TAccumulate, func: AccumulatorFunc<TAccumulate, TSource, TAccumulate>, resultSelector: SelectorFunc<TAccumulate, TResult>): TResult;
        all(predicate: PredicateFunc<TSource>): boolean;
        any(predicate?: PredicateFunc<TSource>): boolean;
        append(item: TSource): IEnumerable<TSource>;
        average(ignoreNonNumberItems?: boolean): number;
        average(selector?: SelectorFunc<TSource, number>): number;
        concat(sequence: Iterable<TSource>): IEnumerable<TSource>;
        contains(value: TSource, comparer?: EqualityComparerFunc<TSource>): boolean;
        count(predicate?: PredicateFunc<TSource>): number;
        defaultIfEmpty(defaultValue: TSource): IEnumerable<TSource>;
        distinct(): IEnumerable<TSource>;
        elementAt(index: number): TSource;
        elementAtOrDefault(index: number): TSource;
        except(sequence: Iterable<TSource>): IEnumerable<TSource>;
        first(predicate?: PredicateFunc<TSource>): TSource;
        firstOrDefault(predicate: PredicateFunc<TSource>): TSource;
        groupBy<TKey>(keySelector: SelectorFunc<TSource, TKey>): IEnumerable<IGrouping<TKey, TSource>>;
        groupBy<TKey, TElement = TSource>(keySelector: SelectorFunc<TSource, TKey>, elementSelector: SelectorFunc<TSource, TElement>): IEnumerable<IGrouping<TKey, TElement>>;
        groupBy<TKey, TElement = TSource, TResult = TElement>(keySelector: SelectorFunc<TSource, TKey>, elementSelector: SelectorFunc<TSource, TElement>, resultSelector: GroupResultSelectorFunc<TKey, TElement, TResult>): IEnumerable<IGrouping<TKey, TResult>>;
        groupJoin<TKey, TInner, TResult>(innerSequence: Iterable<TInner>, outerKeySelector: SelectorFunc<TSource, TKey>, innerKeySelector: SelectorFunc<TInner, TKey>, resultSelector: GroupResultSelectorFunc<TSource, TInner, TResult>, comparer: EqualityComparerFunc<TKey>): IEnumerable<TResult>;
        intersect(sequence: Iterable<TSource>): IEnumerable<TSource>;
        join<TKey, TInner, TResult>(innerSequence: Iterable<TInner>, outerKeySelector: SelectorFunc<TSource, TKey>, innerKeySelector: SelectorFunc<TInner, TKey>, resultSelector: ResultSelectorFunc<TSource, TInner, TResult>, comparer?: EqualityComparerFunc<TKey>): IEnumerable<TResult>;
        last(predicate: PredicateFunc<TSource>): TSource;
        lastOrDefault(predicate: PredicateFunc<TSource>): TSource;
        max(ignoreNonNumberItems?: boolean): number;
        max(selector?: SelectorFunc<TSource, number>): number;
        min(ignoreNonNumberItems?: boolean): number;
        min(selector?: SelectorFunc<TSource, number>): number;
        ofType<TResult>(type: new () => TResult): IEnumerable<TResult>;
        orderBy<TKey>(keySelector: SelectorFunc<TSource, TKey>): IOrderedEnumerable<TSource>;
        orderByDescending<TKey>(keySelector: SelectorFunc<TSource, TKey>): IOrderedEnumerable<TSource>;
        prepend(item: TSource): IEnumerable<TSource>;
        reverse(): IEnumerable<TSource>;
        select<TResult>(selector: SelectorFunc<TSource, TResult>): IEnumerable<TResult>;
        selectMany<TResult>(selector: SelectorFunc<TSource, Iterable<TResult>>): IEnumerable<TResult>;
        sequenceEqual(other: Iterable<TSource>, comparer?: EqualityComparerFunc<TSource>): boolean;
        single(predicate?: PredicateFunc<TSource>): TSource;
        singleOrDefault?(predicate: PredicateFunc<TSource>): TSource;
        skip(count: number): IEnumerable<TSource>;
        skipLast(count: number): IEnumerable<TSource>;
        skipWhile(predicate: PredicateFunc<TSource>): IEnumerable<TSource>;
        sum(ignoreNonNumberItems?: boolean): number;
        sum(selector?: SelectorFunc<TSource, number>): number;
        take(count: number): IEnumerable<TSource>;
        takeLast(count: number): IEnumerable<TSource>;
        takeWhile(predicate: PredicateFunc<TSource>): IEnumerable<TSource>;
        toArray(): TSource[];
        toDictionary<TKey, TValue>(keySelector: SelectorFunc<TSource, TKey>, elementSelector: SelectorFunc<TSource, TValue>, comparer: EqualityComparerFunc<TKey>): Map<TKey, TValue>;
        toLookup<TKey, TElement = TSource>(keySelector: SelectorFunc<TSource, TKey>, elementSelector?: SelectorFunc<TSource, TElement>, comparer?: EqualityComparerFunc<TKey>): ILookup<TKey, TElement>;
        union(sequence: Iterable<TSource>): IEnumerable<TSource>;
        where(predicate: PredicateFunc<TSource>): IEnumerable<TSource>;
        zip<TSecond, TResult>(sequence: Iterable<TSecond>, resultSelector: ResultSelectorFunc<TSource, TSecond, TResult>): IEnumerable<TResult>;
    }
    class Enumerable<T> extends IterableEnumerable<T> implements IEnumerable<T> {
        static from<TSource>(source: Iterable<TSource>): IEnumerable<TSource>;
        static range(start: number, end: number): IEnumerable<number>;
        static repeat<TResult>(element: TResult, count: number): IEnumerable<TResult>;
        static repeatElement<TResult>(callback: (index: number) => TResult, count: number, userData?: any): IEnumerable<TResult>;
        static empty<TSource>(): IEnumerable<TSource>;
        protected _source: Iterable<T>;
        constructor(source: Iterable<T> | Iterator<T>);
        [Symbol.iterator](): Iterator<T>;
    }
    class OrderedEnumerable<T> extends Enumerable<T> implements IOrderedEnumerable<T> {
        constructor(source: OrderedIterable<T>);
        thenBy<TKey>(keySelector: SelectorFunc<T, TKey>): IOrderedEnumerable<T>;
        thenByDescending<TKey>(keySelector: SelectorFunc<T, TKey>): IOrderedEnumerable<T>;
    }
}
declare namespace Linq {
    abstract class Generator<T> {
        protected _index: number;
        protected _current: T;
        constructor();
        get index(): number;
        get current(): T;
        reset(): void;
        abstract [Symbol.iterator](): Iterator<T>;
    }
    class UserGenerator<T> extends Generator<T> {
        private callback;
        private count;
        private userData;
        constructor(callback: (index: number, userData?: any) => any, count: number, userData: any);
        [Symbol.iterator](): Iterator<T>;
    }
    class NumberGenerator extends Generator<number> {
        private start;
        private end;
        private step;
        private currentValue;
        constructor(start: number, end: number, step: number);
        [Symbol.iterator](): Iterator<number>;
    }
    class KeyValueGenerator<TSource, TKey, TValue = TSource> extends Generator<{
        key: TKey;
        value: TValue;
    }> {
        private _iterable;
        private _keySelector;
        private _valueSelector;
        constructor(iterable: Iterable<TSource>, keySelector: SelectorFunc<TSource, TKey>, valueSelector?: SelectorFunc<TSource, TValue>);
        [Symbol.iterator](): Iterator<{
            key: TKey;
            value: TValue;
        }>;
    }
}
declare namespace Linq {
    interface IGrouping<TKey, TElement> extends IEnumerable<TElement> {
        readonly key: TKey;
    }
    class Grouping<TKey, TElement> extends IterableEnumerable<TElement> implements IGrouping<TKey, TElement> {
        #private;
        constructor(key: TKey, elements: Iterable<TElement>);
        readonly key: TKey;
        [Symbol.iterator](): Iterator<TElement>;
    }
    class GroupedEnumerable<TSource, TKey, TElement = TSource> extends IterableEnumerable<IGrouping<TKey, TElement>> implements IEnumerable<IGrouping<TKey, TElement>> {
        private readonly _source;
        private readonly _keySelector;
        private readonly _elementSelector;
        private _lookup;
        constructor(source: Iterable<TSource>, keySelector: SelectorFunc<TSource, TKey>, elementSelector?: SelectorFunc<TSource, TElement>);
        [Symbol.iterator](): Iterator<IGrouping<TKey, TElement>>;
    }
    class GroupedResultEnumerable<TSource, TKey, TElement, TResult> extends IterableEnumerable<TResult> implements IEnumerable<TResult> {
        private readonly _source;
        private readonly _keySelector;
        private readonly _elementSelector;
        private readonly _resultSelector;
        private _lookup;
        constructor(source: Iterable<TSource>, keySelector: SelectorFunc<TSource, TKey>, elementSelector: SelectorFunc<TSource, TElement>, resultSelector: GroupResultSelectorFunc<TKey, TElement, TResult>);
        [Symbol.iterator](): Iterator<TResult>;
    }
}
declare namespace Linq {
    interface SourceIterator<T> extends Iterable<T> {
        readonly index: number;
        readonly current: T;
        [Symbol.iterator](): Iterator<T>;
    }
    abstract class BaseIterator<TSource> implements SourceIterator<TSource> {
        protected _index: number;
        protected _current: TSource;
        constructor(iterable: Iterable<TSource>);
        protected readonly iterable: Iterable<TSource>;
        get index(): number;
        get current(): TSource;
        reset(): void;
        abstract [Symbol.iterator](): Iterator<TSource>;
    }
    abstract class SourceResultIterator<TSource, TResult> implements SourceIterator<TResult> {
        protected _index: number;
        protected _current: TResult;
        constructor(iterable: Iterable<TSource>);
        protected readonly iterable: Iterable<TSource>;
        get index(): number;
        get current(): TResult;
        reset(): void;
        abstract [Symbol.iterator](): Iterator<TResult>;
    }
    class SimpleIterator<TSource> extends BaseIterator<TSource> {
        constructor(iterable: Iterable<TSource>);
        [Symbol.iterator](): Iterator<TSource>;
    }
    class AppendIterator<T> extends BaseIterator<T> {
        private _item;
        constructor(iterable: Iterable<T>, item: T);
        [Symbol.iterator](): Iterator<T>;
    }
    class ConcatIterator<T> extends BaseIterator<T> {
        private _other;
        constructor(iterable: Iterable<T>, other: Iterable<T>);
        [Symbol.iterator](): Iterator<T>;
    }
    class DefaultIfEmptyIterator<T> extends BaseIterator<T> {
        private _defaultValue;
        constructor(iterable: Iterable<T>, defaultValue: T);
        [Symbol.iterator](): Iterator<T>;
    }
    class DistinctIterator<T> extends BaseIterator<T> {
        private _values;
        constructor(iterable: Iterable<T>);
        [Symbol.iterator](): Iterator<T>;
    }
    class ExceptIterator<T> extends BaseIterator<T> {
        private _other;
        constructor(iterable: Iterable<T>, other: Iterable<T>);
        [Symbol.iterator](): Iterator<T>;
    }
    class GroupIterator<TSource, TKey> extends SourceResultIterator<TSource, IGrouping<TKey, TSource>> {
        private _keySelector;
        constructor(iterable: Iterable<TSource>, keySelector: SelectorFunc<TSource, TKey>);
        [Symbol.iterator](): Iterator<IGrouping<TKey, TSource>>;
    }
    class GroupElementIterator<TSource, TKey, TElement> extends SourceResultIterator<TSource, IGrouping<TKey, TElement>> {
        private _keySelector;
        private _elementSelector;
        constructor(iterable: Iterable<TSource>, keySelector: SelectorFunc<TSource, TKey>, elementSelector: SelectorFunc<TSource, TElement>);
        [Symbol.iterator](): Iterator<IGrouping<TKey, TElement>>;
    }
    class GroupResultIterator<TSource, TKey, TElement, TResult> extends SourceResultIterator<TSource, TResult> {
        private _keySelector;
        private _elementSelector;
        private _resultSelector;
        constructor(iterable: Iterable<TSource>, keySelector: SelectorFunc<TSource, TKey>, elementSelector: SelectorFunc<TSource, TElement>, resultSelector: GroupResultSelectorFunc<TKey, TElement, TResult>);
        [Symbol.iterator](): Iterator<TResult>;
    }
    class GroupJoinIterator<TSource, TKey, TInner = TSource, TResult = TInner> extends SourceResultIterator<TSource, TResult> {
        private _keySelector;
        private _innerSequence;
        private _innerKeySelector;
        private _resultSelector;
        constructor(iterable: Iterable<TSource>, keySelector: SelectorFunc<TSource, TKey>, innerSequence: Iterable<TInner>, innerKeySelector: SelectorFunc<TInner, TKey>, resultSelector: GroupResultSelectorFunc<TSource, TInner, TResult>);
        [Symbol.iterator](): Iterator<TResult>;
    }
    class IntersectIterator<T> extends BaseIterator<T> {
        private _other;
        constructor(iterable: Iterable<T>, other: Iterable<T>);
        [Symbol.iterator](): Iterator<T>;
    }
    class JoinIterator<TSource, TInner, TKey, TResult> extends SourceResultIterator<TSource, TResult> {
        private _keySelector;
        private _innerSequence;
        private _innerKeySelector;
        private _resultSelector;
        private _comparer;
        private _groups;
        constructor(iterable: Iterable<TSource>, innerSequence: Iterable<TInner>, keySelector: SelectorFunc<TSource, TKey>, innerKeySelector: SelectorFunc<TInner, TKey>, resultSelector: ResultSelectorFunc<TSource, TInner, TResult>, comparer?: EqualityComparerFunc<TKey>);
        [Symbol.iterator](): Iterator<TResult>;
    }
    class OfTypeIterator<TSource, TResult> extends SourceResultIterator<TSource, TResult> {
        private _type;
        constructor(iterable: Iterable<TSource>, type: new () => TResult);
        [Symbol.iterator](): Iterator<TResult>;
    }
    class PrependIterator<T> extends BaseIterator<T> {
        private _item;
        constructor(iterable: Iterable<T>, item: T);
        [Symbol.iterator](): Iterator<T>;
    }
    class ReverseIterator<T> extends BaseIterator<T> {
        constructor(iterable: Iterable<T>);
        [Symbol.iterator](): Iterator<T>;
    }
    class SelectIterator<TSource, TResult> extends SourceResultIterator<TSource, TResult> {
        private _selector;
        constructor(iterable: Iterable<TSource>, selector: SelectorFunc<TSource, TResult>);
        [Symbol.iterator](): Iterator<TResult>;
    }
    class SelectManyIterator<TSource, TResult> extends SourceResultIterator<TSource, TResult> {
        private _selector;
        constructor(iterable: Iterable<TSource>, selector: SelectorFunc<TSource, Iterable<TResult>>);
        [Symbol.iterator](): Iterator<TResult>;
    }
    class SkipIterator<T> extends BaseIterator<T> {
        private _count;
        constructor(iterable: Iterable<T>, count: number);
        [Symbol.iterator](): Iterator<T>;
    }
    class SkipLastIterator<T> extends BaseIterator<T> {
        private _count;
        constructor(iterable: Iterable<T>, count: number);
        [Symbol.iterator](): Iterator<T>;
    }
    class SkipWhileIterator<T> extends BaseIterator<T> {
        private _predicate;
        private _skip;
        constructor(iterable: Iterable<T>, predicate: PredicateFunc<T>);
        [Symbol.iterator](): Iterator<T>;
    }
    class TakeIterator<T> extends BaseIterator<T> {
        private _count;
        constructor(iterable: Iterable<T>, count: number);
        [Symbol.iterator](): Iterator<T>;
    }
    class TakeLastIterator<T> extends BaseIterator<T> {
        private _count;
        constructor(iterable: Iterable<T>, count: number);
        [Symbol.iterator](): Iterator<T>;
    }
    class TakeWhileIterator<T> extends BaseIterator<T> {
        private _predicate;
        constructor(iterable: Iterable<T>, predicate: PredicateFunc<T>);
        [Symbol.iterator](): Iterator<T>;
    }
    class UnionIterator<T> extends BaseIterator<T> {
        private _other;
        private _values;
        constructor(iterable: Iterable<T>, other: Iterable<T>);
        [Symbol.iterator](): Iterator<T>;
    }
    class WhereIterator<T> extends BaseIterator<T> {
        private _predicate;
        constructor(iterable: Iterable<T>, predicate: PredicateFunc<T>);
        [Symbol.iterator](): Iterator<T>;
    }
    class ZipIterator<TFirst, TSecond, TResult> extends SourceResultIterator<TFirst, TResult> {
        private _resultSelector;
        private _sequence;
        constructor(iterable: Iterable<TFirst>, sequence: Iterable<TSecond>, resultSelector: ResultSelectorFunc<TFirst, TSecond, TResult>);
        [Symbol.iterator](): Iterator<TResult>;
    }
    class XPathResultIterator implements SourceIterator<any> {
        private _xpathResult;
        private _index;
        private _current;
        private _chachedNodeIteration;
        constructor(xpathResult: XPathResult);
        get index(): number;
        get current(): any;
        [Symbol.iterator](): Iterator<any>;
    }
    class OrderedIterator<TSource> extends BaseIterator<TSource> implements OrderedIterable<TSource> {
        protected static createComparer<TSource, TKey>(keySelector: SelectorFunc<TSource, TKey>, descending: boolean): ComparerFunc<TSource>;
        constructor(iterable: Iterable<TSource>, comparer: ComparerFunc<TSource>);
        readonly comparer: ComparerFunc<TSource>;
        [Symbol.iterator](): Iterator<TSource>;
    }
    class OrderByIterator<TSource, TKey> extends OrderedIterator<TSource> {
        constructor(iterable: Iterable<TSource>, keySelector: SelectorFunc<TSource, TKey>, descending?: boolean);
    }
    class ThenByIterator<TSource, TKey> extends OrderedIterator<TSource> {
        constructor(iterable: OrderedIterable<TSource>, keySelector: SelectorFunc<TSource, TKey>, descending?: boolean);
    }
}
declare namespace Linq {
    const Version = "0.0.1";
}
declare namespace Linq {
    interface ILookup<TKey, TElement> {
        readonly count: number;
        item(key: TKey): Iterable<TElement>;
        contains(key: TKey): boolean;
    }
    class Lookup<TKey, TElement, TResult = TElement> implements ILookup<TKey, TResult>, Iterable<IGrouping<TKey, TResult>> {
        private static mapAsGroups;
        static create<TSource, TKey, TElement>(source: Iterable<TSource>, keySelector: SelectorFunc<TSource, TKey>, elementSelector: SelectorFunc<TSource, TElement>): Lookup<TKey, TElement>;
        static createForJoin<TKey, TElement>(source: Iterable<TElement>, keySelector: SelectorFunc<TElement, TKey>): Lookup<TKey, TElement>;
        private _mappedArrays;
        private _map;
        constructor(map: Map<TKey, TResult[]>);
        get count(): number;
        item(key: TKey): IGrouping<TKey, TResult>;
        contains(key: TKey): boolean;
        [Symbol.iterator](): Iterator<IGrouping<TKey, TResult>>;
    }
}
