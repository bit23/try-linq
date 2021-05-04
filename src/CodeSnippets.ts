namespace TryLinq {

	export class CodeSnippets {

		public static readonly aggregate = `data.aggregate( "seed!", (accumulate, source) => accumulate + ", " + source)`;
		public static readonly all = `data.all(x => x.first_name.length > 5)`;
		public static readonly any = `data.any(x => x.first_name.length < 5)`;
		public static readonly append = `data.append({
			first_name: "Mario",
			last_name: "Rossi"
		})`;
		public static readonly average = `data.average(x => parseInt(x.zip))`;
		public static readonly concat = `data.concat([
			{
				first_name: "Mario",
				last_name: "Rossi"
			},
			{
				first_name: "Luigi",
				last_name: "Bianchi"
			}
		])`;
		public static readonly contains = `data.contains("James", (x, value) => x.first_name == value)`;
		public static readonly count = `data.count(x => x.state == "LA")`;
		public static readonly distinct = `data.select(x => x.state)
		.distinct()`;
		public static readonly elementAt = `data.elementAt(3)`;
		public static readonly elementAtOrDefault = `data.elementAtOrDefault(-3)`;
		public static readonly except = `data.except([...sequence...])`;
		public static readonly first = `data.first()`;
		public static readonly firstOrDefault = `data.firstOrDefault(x => x.state = "ZZ")`;
		public static readonly groupBy = `data.groupBy(
			x => x.state,
			x => x
			)`;
		public static readonly groupJoin = `data.groupJoin(
			innerSequence,
			outerKeySelector,
			innerKeySelector,
			resultSelector,
			comparer?
			)`;
		public static readonly intersect = `data.intersect(...sequence...)`;
		public static readonly join = `data.join(
			innerSequence,
			outerKeySelector,
			innerKeySelector,
			resultSelector,
			comparer?
			)`;
		public static readonly last = `data.last()`;
		public static readonly lastOrDefault = `data.lastOrDefault(x => x.state == "LA")`;
		public static readonly max = `data.max(x => parseInt(x.zip))`;
		public static readonly min = `data.min(x => parseInt(x.zip))`;
		public static readonly orderBy = `data.orderBy(x => x.last_name)`;
		public static readonly orderByDescending = `data.orderByDescending(x => x.last_name)`;
		public static readonly prepend = `data.prepend({
			first_name: "Mario",
			last_name: "Rossi"
		})`;
		public static readonly reverse = `data.reverse()`;
		public static readonly select = `select(x => {
			return {
				firstName: x.first_name,
				lastName: x.last_name,
				state: x.state
			}
		})`;
		public static readonly selectMany = `data.selectMany(x => x.first_name)
		.distinct()`;
		public static readonly sequenceEqual = `data.sequenceEqual(...sequence..., comparer?)`;
		public static readonly single = `data.single(x => x.first_name == "James" && x.last_name == "Butt")`;
		public static readonly singleOrDefault = `data.singleOrDefault(x => x.first_name == "James" && x.last_name == "Butt")`;
		public static readonly skip = `data.skip(1)`;
		public static readonly skipLast = `data.skipLast(3)`;
		public static readonly skipWhile = `data.skipWhile(x => x.last_name.length < 13)`;
		public static readonly sum = `data.sum(x => x.first_name.length)`;
		public static readonly take = `data.take(10)`;
		public static readonly takeLast = `data.takeLast(3)`;
		public static readonly takeWhile = `data.takeWhile(x => x.last_name.length < 13)`;
		public static readonly toArray = `data.toArray()`;
		public static readonly toDictionary = `data.toDictionary(
			x => \`$\{x.first_name\} $\{x.last_name\}\`,
			x => {
				return {
					firstName: x.first_name,
					lastName: x.last_name
				}
			})`;
		public static readonly union = `data.union(...sequence...)`;
		public static readonly where = `data.where(x => x.last_name.length > 10)`;
		public static readonly zip = `data.zip(...sequence..., resultSelector)`;

		
		private static _snippetsList = [
			{
				name: "aggregate",
				code: CodeSnippets.aggregate
			},
			{
				name: "all",
				code: CodeSnippets.all
			},
			{
				name: "any",
				code: CodeSnippets.any
			},
			{
				name: "append",
				code: CodeSnippets.append
			},
			{
				name: "average",
				code: CodeSnippets.average
			},
			{
				name: "concat",
				code: CodeSnippets.concat
			},
			{
				name: "contains",
				code: CodeSnippets.contains
			},
			{
				name: "count",
				code: CodeSnippets.count
			},
			{
				name: "distinct",
				code: CodeSnippets.distinct
			},
			{
				name: "elementAt",
				code: CodeSnippets.elementAt
			},
			{
				name: "elementAtOrDefault",
				code: CodeSnippets.elementAtOrDefault
			},
			{
				name: "except",
				code: CodeSnippets.except
			},
			{
				name: "first",
				code: CodeSnippets.first
			},
			{
				name: "firstOrDefault",
				code: CodeSnippets.firstOrDefault
			},
			{
				name: "groupBy",
				code: CodeSnippets.groupBy
			},
			{
				name: "groupJoin",
				code: CodeSnippets.groupJoin
			},
			{
				name: "intersect",
				code: CodeSnippets.intersect
			},
			{
				name: "join",
				code: CodeSnippets.join
			},
			{
				name: "last",
				code: CodeSnippets.last
			},
			{
				name: "lastOrDefault",
				code: CodeSnippets.lastOrDefault
			},
			{
				name: "max",
				code: CodeSnippets.max
			},
			{
				name: "min",
				code: CodeSnippets.min
			},
			{
				name: "orderBy",
				code: CodeSnippets.orderBy
			},
			{
				name: "orderByDescending",
				code: CodeSnippets.orderByDescending
			},
			{
				name: "prepend",
				code: CodeSnippets.prepend
			},
			{
				name: "reverse",
				code: CodeSnippets.reverse
			},
			{
				name: "select",
				code: CodeSnippets.select
			},
			{
				name: "selectMany",
				code: CodeSnippets.selectMany
			},
			{
				name: "sequenceEqual",
				code: CodeSnippets.sequenceEqual
			},
			{
				name: "single",
				code: CodeSnippets.single
			},
			{
				name: "singleOrDefault",
				code: CodeSnippets.singleOrDefault
			},
			{
				name: "skip",
				code: CodeSnippets.skip
			},
			{
				name: "skipLast",
				code: CodeSnippets.skipLast
			},
			{
				name: "skipWhile",
				code: CodeSnippets.skipWhile
			},
			{
				name: "sum",
				code: CodeSnippets.sum
			},
			{
				name: "take",
				code: CodeSnippets.take
			},
			{
				name: "takeLast",
				code: CodeSnippets.takeLast
			},
			{
				name: "takeWhile",
				code: CodeSnippets.takeWhile
			},
			{
				name: "toArray",
				code: CodeSnippets.toArray
			},
			{
				name: "toDictionary",
				code: CodeSnippets.toDictionary
			},
			{
				name: "union",
				code: CodeSnippets.union
			},
			{
				name: "where",
				code: CodeSnippets.where
			},
			{
				name: "zip",
				code: CodeSnippets.zip
			},
		]

		public static get allSnippets() {
			return CodeSnippets._snippetsList;
		}
	}
}