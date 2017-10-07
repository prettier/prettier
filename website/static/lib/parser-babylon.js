"use strict";

var babylon = function () {
	function unwrapExports(x) {
		return x && x.__esModule ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var parserBabylon_1 = createCommonjsModule(function (module) {
		"use strict";
		function createError$1(t, e) {
			var s = new SyntaxError(t + " (" + e.start.line + ":" + e.start.column + ")");return s.loc = e, s;
		}function createCommonjsModule$$1(t, e) {
			return e = { exports: {} }, t(e, e.exports), e.exports;
		}function parse(t, e, s) {
			var i = index,
			    r = { sourceType: "module", allowImportExportEverywhere: !0, allowReturnOutsideFunction: !0, plugins: ["jsx", "flow", "doExpressions", "objectRestSpread", "decorators", "classProperties", "exportExtensions", "asyncGenerators", "functionBind", "functionSent", "dynamicImport", "numericSeparator", "importMeta", "optionalCatchBinding", "optionalChaining", "classPrivateProperties"] },
			    a = s && "json" === s.parser ? "parseExpression" : "parse";var n = void 0;try {
				n = i[a](t, r);
			} catch (e) {
				try {
					n = i[a](t, Object.assign({}, r, { strictMode: !1 }));
				} catch (t) {
					throw createError(e.message.replace(/ \(.*\)/, ""), { start: { line: e.loc.line, column: e.loc.column + 1 } });
				}
			}return delete n.tokens, n;
		}var parserCreateError = createError$1,
		    index = createCommonjsModule$$1(function (t, e) {
			function s(t) {
				var e = {};for (var s in T) {
					e[s] = t && s in t ? t[s] : T[s];
				}return e;
			}function i(t) {
				var e = t.split(" ");return function (t) {
					return e.indexOf(t) >= 0;
				};
			}function r(t, e) {
				for (var s = 65536, i = 0; i < e.length; i += 2) {
					if ((s += e[i]) > t) return !1;if ((s += e[i + 1]) >= t) return !0;
				}return !1;
			}function a(t) {
				return t < 65 ? 36 === t : t < 91 || (t < 97 ? 95 === t : t < 123 || (t <= 65535 ? t >= 170 && R.test(String.fromCharCode(t)) : r(t, O)));
			}function n(t) {
				return t < 48 ? 36 === t : t < 58 || !(t < 65) && (t < 91 || (t < 97 ? 95 === t : t < 123 || (t <= 65535 ? t >= 170 && _.test(String.fromCharCode(t)) : r(t, O) || r(t, j))));
			}function o(t) {
				return 10 === t || 13 === t || 8232 === t || 8233 === t;
			}function h(t, e) {
				for (var s = 1, i = 0;;) {
					B.lastIndex = i;var r = B.exec(t);if (!(r && r.index < e)) return new W(s, e - i);++s, i = r.index + r[0].length;
				}throw new Error("Unreachable");
			}function p(t) {
				return t[t.length - 1];
			}function c(t) {
				return t <= 65535 ? String.fromCharCode(t) : String.fromCharCode(55296 + (t - 65536 >> 10), 56320 + (t - 65536 & 1023));
			}function l(t) {
				for (var e = {}, s = t, i = Array.isArray(s), r = 0, s = i ? s : s[Symbol.iterator]();;) {
					var a;if (i) {
						if (r >= s.length) break;a = s[r++];
					} else {
						if ((r = s.next()).done) break;a = r.value;
					}e[a] = !0;
				}return e;
			}function u(t) {
				return null != t && "Property" === t.type && "init" === t.kind && !1 === t.method;
			}function d(t) {
				return "DeclareExportAllDeclaration" === t.type || "DeclareExportDeclaration" === t.type && (!t.declaration || "TypeAlias" !== t.declaration.type && "InterfaceDeclaration" !== t.declaration.type);
			}function f(t) {
				if ("JSXIdentifier" === t.type) return t.name;if ("JSXNamespacedName" === t.type) return t.namespace.name + ":" + t.name.name;if ("JSXMemberExpression" === t.type) return f(t.object) + "." + f(t.property);throw new Error("Node had unexpected type: " + t.type);
			}function y(t) {
				if (null == t) throw new Error("Unexpected " + t + " value.");return t;
			}function m(t) {
				if (!t) throw new Error("Assert fail");
			}function x(t) {
				switch (t) {case "any":
						return "TSAnyKeyword";case "boolean":
						return "TSBooleanKeyword";case "never":
						return "TSNeverKeyword";case "number":
						return "TSNumberKeyword";case "object":
						return "TSObjectKeyword";case "string":
						return "TSStringKeyword";case "symbol":
						return "TSSymbolKeyword";case "undefined":
						return "TSUndefinedKeyword";default:
						return;}
			}function v(t, e) {
				return b(e, t).parse();
			}function P(t, e) {
				var s = b(e, t);return s.options.strictMode && (s.state.strict = !0), s.getExpression();
			}function b(t, e) {
				return new (t && t.plugins ? g(t.plugins) : st)(t, e);
			}function g(t) {
				if (t.indexOf("decorators") >= 0 && t.indexOf("decorators2") >= 0) throw new Error("Cannot use decorators and decorators2 plugin together");var e = t.filter(function (t) {
					return "estree" === t || "flow" === t || "jsx" === t || "typescript" === t;
				});if (e.indexOf("flow") >= 0 && (e = e.filter(function (t) {
					return "flow" !== t;
				})).push("flow"), e.indexOf("flow") >= 0 && e.indexOf("typescript") >= 0) throw new Error("Cannot combine flow and typescript plugins.");e.indexOf("typescript") >= 0 && (e = e.filter(function (t) {
					return "typescript" !== t;
				})).push("typescript"), e.indexOf("estree") >= 0 && (e = e.filter(function (t) {
					return "estree" !== t;
				})).unshift("estree");var s = e.join("/"),
				    i = ut[s];if (!i) {
					i = st;for (var r = e, a = Array.isArray(r), n = 0, r = a ? r : r[Symbol.iterator]();;) {
						var o;if (a) {
							if (n >= r.length) break;o = r[n++];
						} else {
							if ((n = r.next()).done) break;o = n.value;
						}i = et[o](i);
					}ut[s] = i;
				}return i;
			}Object.defineProperty(e, "__esModule", { value: !0 });var T = { sourceType: "script", sourceFilename: void 0, startLine: 1, allowReturnOutsideFunction: !1, allowImportExportEverywhere: !1, allowSuperOutsideMethod: !1, plugins: [], strictMode: null, ranges: !1, tokens: !1 },
			    A = function A(t, e) {
				t.prototype = Object.create(e.prototype), t.prototype.constructor = t, t.__proto__ = e;
			},
			    w = !0,
			    N = function N(t, e) {
				void 0 === e && (e = {}), this.label = t, this.keyword = e.keyword, this.beforeExpr = !!e.beforeExpr, this.startsExpr = !!e.startsExpr, this.rightAssociative = !!e.rightAssociative, this.isLoop = !!e.isLoop, this.isAssign = !!e.isAssign, this.prefix = !!e.prefix, this.postfix = !!e.postfix, this.binop = e.binop || null, this.updateContext = null;
			},
			    k = function (t) {
				function e(e, s) {
					return void 0 === s && (s = {}), s.keyword = e, t.call(this, e, s) || this;
				}return A(e, t), e;
			}(N),
			    C = function (t) {
				function e(e, s) {
					return t.call(this, e, { beforeExpr: w, binop: s }) || this;
				}return A(e, t), e;
			}(N),
			    E = { num: new N("num", { startsExpr: !0 }), bigint: new N("bigint", { startsExpr: !0 }), regexp: new N("regexp", { startsExpr: !0 }), string: new N("string", { startsExpr: !0 }), name: new N("name", { startsExpr: !0 }), eof: new N("eof"), bracketL: new N("[", { beforeExpr: w, startsExpr: !0 }), bracketR: new N("]"), braceL: new N("{", { beforeExpr: w, startsExpr: !0 }), braceBarL: new N("{|", { beforeExpr: w, startsExpr: !0 }), braceR: new N("}"), braceBarR: new N("|}"), parenL: new N("(", { beforeExpr: w, startsExpr: !0 }), parenR: new N(")"), comma: new N(",", { beforeExpr: w }), semi: new N(";", { beforeExpr: w }), colon: new N(":", { beforeExpr: w }), doubleColon: new N("::", { beforeExpr: w }), dot: new N("."), question: new N("?", { beforeExpr: w }), questionDot: new N("?."), arrow: new N("=>", { beforeExpr: w }), template: new N("template"), ellipsis: new N("...", { beforeExpr: w }), backQuote: new N("`", { startsExpr: !0 }), dollarBraceL: new N("${", { beforeExpr: w, startsExpr: !0 }), at: new N("@"), hash: new N("#"), eq: new N("=", { beforeExpr: w, isAssign: !0 }), assign: new N("_=", { beforeExpr: w, isAssign: !0 }), incDec: new N("++/--", { prefix: !0, postfix: !0, startsExpr: !0 }), bang: new N("!", { beforeExpr: w, prefix: !0, startsExpr: !0 }), tilde: new N("~", { beforeExpr: w, prefix: !0, startsExpr: !0 }), logicalOR: new C("||", 1), logicalAND: new C("&&", 2), bitwiseOR: new C("|", 3), bitwiseXOR: new C("^", 4), bitwiseAND: new C("&", 5), equality: new C("==/!=", 6), relational: new C("</>", 7), bitShift: new C("<</>>", 8), plusMin: new N("+/-", { beforeExpr: w, binop: 9, prefix: !0, startsExpr: !0 }), modulo: new C("%", 10), star: new C("*", 10), slash: new C("/", 10), exponent: new N("**", { beforeExpr: w, binop: 11, rightAssociative: !0 }) },
			    S = { break: new k("break"), case: new k("case", { beforeExpr: w }), catch: new k("catch"), continue: new k("continue"), debugger: new k("debugger"), default: new k("default", { beforeExpr: w }), do: new k("do", { isLoop: !0, beforeExpr: w }), else: new k("else", { beforeExpr: w }), finally: new k("finally"), for: new k("for", { isLoop: !0 }), function: new k("function", { startsExpr: !0 }), if: new k("if"), return: new k("return", { beforeExpr: w }), switch: new k("switch"), throw: new k("throw", { beforeExpr: w }), try: new k("try"), var: new k("var"), let: new k("let"), const: new k("const"), while: new k("while", { isLoop: !0 }), with: new k("with"), new: new k("new", { beforeExpr: w, startsExpr: !0 }), this: new k("this", { startsExpr: !0 }), super: new k("super", { startsExpr: !0 }), class: new k("class"), extends: new k("extends", { beforeExpr: w }), export: new k("export"), import: new k("import", { startsExpr: !0 }), yield: new k("yield", { beforeExpr: w, startsExpr: !0 }), null: new k("null", { startsExpr: !0 }), true: new k("true", { startsExpr: !0 }), false: new k("false", { startsExpr: !0 }), in: new k("in", { beforeExpr: w, binop: 7 }), instanceof: new k("instanceof", { beforeExpr: w, binop: 7 }), typeof: new k("typeof", { beforeExpr: w, prefix: !0, startsExpr: !0 }), void: new k("void", { beforeExpr: w, prefix: !0, startsExpr: !0 }), delete: new k("delete", { beforeExpr: w, prefix: !0, startsExpr: !0 }) };Object.keys(S).forEach(function (t) {
				E["_" + t] = S[t];
			});var L = { 6: i("enum await"), strict: i("implements interface let package private protected public static yield"), strictBind: i("eval arguments") },
			    I = i("break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this let const class extends export import yield super"),
			    M = "ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠ-ࢴࢶ-ࢽऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡૹଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘ-ౚౠౡಀಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൔ-ൖൟ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᲀ-ᲈᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿕ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞮꞰ-ꞷꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꣽꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭥꭰ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ",
			    D = "‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛ࣔ-ࣣ࣡-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఃా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ഁ-ഃാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ංඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ູົຼ່-ໍ໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠐-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭ᳲ-᳴᳸᳹᷀-᷵᷻-᷿‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯꘠-꘩꙯ꙴ-꙽ꚞꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧꢀꢁꢴ-ꣅ꣐-꣙꣠-꣱꤀-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︯︳︴﹍-﹏０-９＿",
			    R = new RegExp("[" + M + "]"),
			    _ = new RegExp("[" + M + D + "]");M = D = null;var O = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 17, 26, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 26, 45, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 785, 52, 76, 44, 33, 24, 27, 35, 42, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 85, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 159, 52, 19, 3, 54, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 86, 25, 391, 63, 32, 0, 449, 56, 264, 8, 2, 36, 18, 0, 50, 29, 881, 921, 103, 110, 18, 195, 2749, 1070, 4050, 582, 8634, 568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 881, 68, 12, 0, 67, 12, 65, 0, 32, 6124, 20, 754, 9486, 1, 3071, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 4149, 196, 60, 67, 1213, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42710, 42, 4148, 12, 221, 3, 5761, 10591, 541],
			    j = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 1306, 2, 54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 52, 0, 13, 2, 49, 13, 10, 2, 4, 9, 83, 11, 7, 0, 161, 11, 6, 9, 7, 3, 57, 0, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 193, 17, 10, 9, 87, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 84, 14, 5, 9, 423, 9, 838, 7, 2, 7, 17, 9, 57, 21, 2, 13, 19882, 9, 135, 4, 60, 6, 26, 9, 1016, 45, 17, 3, 19723, 1, 5319, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 2214, 6, 110, 6, 6, 9, 792487, 239],
			    F = /\r\n?|\n|\u2028|\u2029/,
			    B = new RegExp(F.source, "g"),
			    q = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/,
			    V = function V(t, e, s, i) {
				this.token = t, this.isExpr = !!e, this.preserveSpace = !!s, this.override = i;
			},
			    U = { braceStatement: new V("{", !1), braceExpression: new V("{", !0), templateQuasi: new V("${", !0), parenStatement: new V("(", !1), parenExpression: new V("(", !0), template: new V("`", !0, !0, function (t) {
					return t.readTmplToken();
				}), functionExpression: new V("function", !0) };E.parenR.updateContext = E.braceR.updateContext = function () {
				if (1 !== this.state.context.length) {
					var t = this.state.context.pop();t === U.braceStatement && this.curContext() === U.functionExpression ? (this.state.context.pop(), this.state.exprAllowed = !1) : t === U.templateQuasi ? this.state.exprAllowed = !0 : this.state.exprAllowed = !t.isExpr;
				} else this.state.exprAllowed = !0;
			}, E.name.updateContext = function (t) {
				"of" !== this.state.value || this.curContext() !== U.parenStatement ? (this.state.exprAllowed = !1, t !== E._let && t !== E._const && t !== E._var || F.test(this.input.slice(this.state.end)) && (this.state.exprAllowed = !0)) : this.state.exprAllowed = !t.beforeExpr;
			}, E.braceL.updateContext = function (t) {
				this.state.context.push(this.braceIsBlock(t) ? U.braceStatement : U.braceExpression), this.state.exprAllowed = !0;
			}, E.dollarBraceL.updateContext = function () {
				this.state.context.push(U.templateQuasi), this.state.exprAllowed = !0;
			}, E.parenL.updateContext = function (t) {
				var e = t === E._if || t === E._for || t === E._with || t === E._while;this.state.context.push(e ? U.parenStatement : U.parenExpression), this.state.exprAllowed = !0;
			}, E.incDec.updateContext = function () {}, E._function.updateContext = function () {
				this.curContext() !== U.braceStatement && this.state.context.push(U.functionExpression), this.state.exprAllowed = !1;
			}, E.backQuote.updateContext = function () {
				this.curContext() === U.template ? this.state.context.pop() : this.state.context.push(U.template), this.state.exprAllowed = !1;
			};var W = function W(t, e) {
				this.line = t, this.column = e;
			},
			    K = function K(t, e) {
				this.start = t, this.end = e;
			},
			    X = function (t) {
				function e() {
					return t.apply(this, arguments) || this;
				}return A(e, t), e.prototype.raise = function (t, e, s) {
					var i = h(this.input, t);e += " (" + i.line + ":" + i.column + ")";var r = new SyntaxError(e);throw r.pos = t, r.loc = i, s && (r.missingPlugin = s), r;
				}, e;
			}(function (t) {
				function e() {
					return t.apply(this, arguments) || this;
				}return A(e, t), e.prototype.addComment = function (t) {
					this.filename && (t.loc.filename = this.filename), this.state.trailingComments.push(t), this.state.leadingComments.push(t);
				}, e.prototype.processComment = function (t) {
					if (!("Program" === t.type && t.body.length > 0)) {
						var e = this.state.commentStack,
						    s = void 0,
						    i = void 0,
						    r = void 0,
						    a = void 0,
						    n = void 0;if (this.state.trailingComments.length > 0) this.state.trailingComments[0].start >= t.end ? (r = this.state.trailingComments, this.state.trailingComments = []) : this.state.trailingComments.length = 0;else {
							var o = p(e);e.length > 0 && o.trailingComments && o.trailingComments[0].start >= t.end && (r = o.trailingComments, o.trailingComments = null);
						}for (e.length > 0 && p(e).start >= t.start && (s = e.pop()); e.length > 0 && p(e).start >= t.start;) {
							i = e.pop();
						}if (!i && s && (i = s), s && this.state.leadingComments.length > 0) {
							var h = p(this.state.leadingComments);if ("ObjectProperty" === s.type) {
								if (h.start >= t.start && this.state.commentPreviousNode) {
									for (n = 0; n < this.state.leadingComments.length; n++) {
										this.state.leadingComments[n].end < this.state.commentPreviousNode.end && (this.state.leadingComments.splice(n, 1), n--);
									}this.state.leadingComments.length > 0 && (s.trailingComments = this.state.leadingComments, this.state.leadingComments = []);
								}
							} else if ("CallExpression" === t.type && t.arguments && t.arguments.length) {
								var c = p(t.arguments);c && h.start >= c.start && h.end <= t.end && this.state.commentPreviousNode && this.state.leadingComments.length > 0 && (c.trailingComments = this.state.leadingComments, this.state.leadingComments = []);
							}
						}if (i) {
							if (i.leadingComments) if (i !== t && p(i.leadingComments).end <= t.start) t.leadingComments = i.leadingComments, i.leadingComments = null;else for (a = i.leadingComments.length - 2; a >= 0; --a) {
								if (i.leadingComments[a].end <= t.start) {
									t.leadingComments = i.leadingComments.splice(0, a + 1);break;
								}
							}
						} else if (this.state.leadingComments.length > 0) if (p(this.state.leadingComments).end <= t.start) {
							if (this.state.commentPreviousNode) for (n = 0; n < this.state.leadingComments.length; n++) {
								this.state.leadingComments[n].end < this.state.commentPreviousNode.end && (this.state.leadingComments.splice(n, 1), n--);
							}this.state.leadingComments.length > 0 && (t.leadingComments = this.state.leadingComments, this.state.leadingComments = []);
						} else {
							for (a = 0; a < this.state.leadingComments.length && !(this.state.leadingComments[a].end > t.start); a++) {}var l = this.state.leadingComments.slice(0, a);t.leadingComments = 0 === l.length ? null : l, 0 === (r = this.state.leadingComments.slice(a)).length && (r = null);
						}this.state.commentPreviousNode = t, r && (r.length && r[0].start >= t.start && p(r).end <= t.end ? t.innerComments = r : t.trailingComments = r), e.push(t);
					}
				}, e;
			}(function () {
				function t() {}return t.prototype.isReservedWord = function (t) {
					return "await" === t ? this.inModule : L[6](t);
				}, t.prototype.hasPlugin = function (t) {
					return !!this.plugins[t];
				}, t;
			}())),
			    G = function () {
				function t() {}return t.prototype.init = function (t, e) {
					this.strict = !1 !== t.strictMode && "module" === t.sourceType, this.input = e, this.potentialArrowAt = -1, this.inMethod = this.inFunction = this.inGenerator = this.inAsync = this.inPropertyName = this.inType = this.inClassProperty = this.noAnonFunctionType = !1, this.classLevel = 0, this.labels = [], this.decoratorStack = [[]], this.tokens = [], this.comments = [], this.trailingComments = [], this.leadingComments = [], this.commentStack = [], this.commentPreviousNode = null, this.pos = this.lineStart = 0, this.curLine = t.startLine, this.type = E.eof, this.value = null, this.start = this.end = this.pos, this.startLoc = this.endLoc = this.curPosition(), this.lastTokEndLoc = this.lastTokStartLoc = null, this.lastTokStart = this.lastTokEnd = this.pos, this.context = [U.braceStatement], this.exprAllowed = !0, this.containsEsc = this.containsOctal = !1, this.octalPosition = null, this.invalidTemplateEscapePosition = null, this.exportedIdentifiers = [];
				}, t.prototype.curPosition = function () {
					return new W(this.curLine, this.pos - this.lineStart);
				}, t.prototype.clone = function (e) {
					var s = new t();for (var i in this) {
						var r = this[i];e && "context" !== i || !Array.isArray(r) || (r = r.slice()), s[i] = r;
					}return s;
				}, t;
			}(),
			    H = { decBinOct: [46, 66, 69, 79, 95, 98, 101, 111], hex: [46, 88, 95, 120] },
			    J = function J(t) {
				this.type = t.type, this.value = t.value, this.start = t.start, this.end = t.end, this.loc = new K(t.startLoc, t.endLoc);
			},
			    z = function (t) {
				function e() {
					return t.apply(this, arguments) || this;
				}return A(e, t), e.prototype.addExtra = function (t, e, s) {
					t && ((t.extra = t.extra || {})[e] = s);
				}, e.prototype.isRelational = function (t) {
					return this.match(E.relational) && this.state.value === t;
				}, e.prototype.expectRelational = function (t) {
					this.isRelational(t) ? this.next() : this.unexpected(null, E.relational);
				}, e.prototype.eatRelational = function (t) {
					return !!this.isRelational(t) && (this.next(), !0);
				}, e.prototype.isContextual = function (t) {
					return this.match(E.name) && this.state.value === t;
				}, e.prototype.eatContextual = function (t) {
					return this.state.value === t && this.eat(E.name);
				}, e.prototype.expectContextual = function (t, e) {
					this.eatContextual(t) || this.unexpected(null, e);
				}, e.prototype.canInsertSemicolon = function () {
					return this.match(E.eof) || this.match(E.braceR) || this.hasPrecedingLineBreak();
				}, e.prototype.hasPrecedingLineBreak = function () {
					return F.test(this.input.slice(this.state.lastTokEnd, this.state.start));
				}, e.prototype.isLineTerminator = function () {
					return this.eat(E.semi) || this.canInsertSemicolon();
				}, e.prototype.semicolon = function () {
					this.isLineTerminator() || this.unexpected(null, E.semi);
				}, e.prototype.expect = function (t, e) {
					this.eat(t) || this.unexpected(e, t);
				}, e.prototype.unexpected = function (t, e) {
					throw void 0 === e && (e = "Unexpected token"), "string" != typeof e && (e = "Unexpected token, expected " + e.label), this.raise(null != t ? t : this.state.start, e);
				}, e.prototype.expectPlugin = function (t, e) {
					if (!this.hasPlugin(t)) throw this.raise(null != e ? e : this.state.start, "This experimental syntax requires enabling the parser plugin: '" + t + "'", [t]);
				}, e.prototype.expectOnePlugin = function (t, e) {
					var s = this;if (!t.some(function (t) {
						return s.hasPlugin(t);
					})) throw this.raise(null != e ? e : this.state.start, "This experimental syntax requires enabling one of the following parser plugin(s): '" + t.join(", ") + "'", t);
				}, e;
			}(function (t) {
				function e(e, s) {
					var i;return i = t.call(this) || this, i.state = new G(), i.state.init(e, s), i.isLookahead = !1, i;
				}return A(e, t), e.prototype.next = function () {
					this.options.tokens && !this.isLookahead && this.state.tokens.push(new J(this.state)), this.state.lastTokEnd = this.state.end, this.state.lastTokStart = this.state.start, this.state.lastTokEndLoc = this.state.endLoc, this.state.lastTokStartLoc = this.state.startLoc, this.nextToken();
				}, e.prototype.eat = function (t) {
					return !!this.match(t) && (this.next(), !0);
				}, e.prototype.match = function (t) {
					return this.state.type === t;
				}, e.prototype.isKeyword = function (t) {
					return I(t);
				}, e.prototype.lookahead = function () {
					var t = this.state;this.state = t.clone(!0), this.isLookahead = !0, this.next(), this.isLookahead = !1;var e = this.state;return this.state = t, e;
				}, e.prototype.setStrict = function (t) {
					if (this.state.strict = t, this.match(E.num) || this.match(E.string)) {
						for (this.state.pos = this.state.start; this.state.pos < this.state.lineStart;) {
							this.state.lineStart = this.input.lastIndexOf("\n", this.state.lineStart - 2) + 1, --this.state.curLine;
						}this.nextToken();
					}
				}, e.prototype.curContext = function () {
					return this.state.context[this.state.context.length - 1];
				}, e.prototype.nextToken = function () {
					var t = this.curContext();return t && t.preserveSpace || this.skipSpace(), this.state.containsOctal = !1, this.state.octalPosition = null, this.state.start = this.state.pos, this.state.startLoc = this.state.curPosition(), this.state.pos >= this.input.length ? this.finishToken(E.eof) : t.override ? t.override(this) : this.readToken(this.fullCharCodeAtPos());
				}, e.prototype.readToken = function (t) {
					return a(t) || 92 === t ? this.readWord() : this.getTokenFromCode(t);
				}, e.prototype.fullCharCodeAtPos = function () {
					var t = this.input.charCodeAt(this.state.pos);return t <= 55295 || t >= 57344 ? t : (t << 10) + this.input.charCodeAt(this.state.pos + 1) - 56613888;
				}, e.prototype.pushComment = function (t, e, s, i, r, a) {
					var n = { type: t ? "CommentBlock" : "CommentLine", value: e, start: s, end: i, loc: new K(r, a) };this.isLookahead || (this.options.tokens && this.state.tokens.push(n), this.state.comments.push(n), this.addComment(n));
				}, e.prototype.skipBlockComment = function () {
					var t = this.state.curPosition(),
					    e = this.state.pos,
					    s = this.input.indexOf("*/", this.state.pos += 2);-1 === s && this.raise(this.state.pos - 2, "Unterminated comment"), this.state.pos = s + 2, B.lastIndex = e;for (var i = void 0; (i = B.exec(this.input)) && i.index < this.state.pos;) {
						++this.state.curLine, this.state.lineStart = i.index + i[0].length;
					}this.pushComment(!0, this.input.slice(e + 2, s), e, this.state.pos, t, this.state.curPosition());
				}, e.prototype.skipLineComment = function (t) {
					var e = this.state.pos,
					    s = this.state.curPosition(),
					    i = this.input.charCodeAt(this.state.pos += t);if (this.state.pos < this.input.length) for (; 10 !== i && 13 !== i && 8232 !== i && 8233 !== i && ++this.state.pos < this.input.length;) {
						i = this.input.charCodeAt(this.state.pos);
					}this.pushComment(!1, this.input.slice(e + t, this.state.pos), e, this.state.pos, s, this.state.curPosition());
				}, e.prototype.skipSpace = function () {
					t: for (; this.state.pos < this.input.length;) {
						var t = this.input.charCodeAt(this.state.pos);switch (t) {case 32:case 160:
								++this.state.pos;break;case 13:
								10 === this.input.charCodeAt(this.state.pos + 1) && ++this.state.pos;case 10:case 8232:case 8233:
								++this.state.pos, ++this.state.curLine, this.state.lineStart = this.state.pos;break;case 47:
								switch (this.input.charCodeAt(this.state.pos + 1)) {case 42:
										this.skipBlockComment();break;case 47:
										this.skipLineComment(2);break;default:
										break t;}break;default:
								if (!(t > 8 && t < 14 || t >= 5760 && q.test(String.fromCharCode(t)))) break t;++this.state.pos;}
					}
				}, e.prototype.finishToken = function (t, e) {
					this.state.end = this.state.pos, this.state.endLoc = this.state.curPosition();var s = this.state.type;this.state.type = t, this.state.value = e, this.updateContext(s);
				}, e.prototype.readToken_dot = function () {
					var t = this.input.charCodeAt(this.state.pos + 1);if (t >= 48 && t <= 57) return this.readNumber(!0);var e = this.input.charCodeAt(this.state.pos + 2);return 46 === t && 46 === e ? (this.state.pos += 3, this.finishToken(E.ellipsis)) : (++this.state.pos, this.finishToken(E.dot));
				}, e.prototype.readToken_slash = function () {
					return this.state.exprAllowed ? (++this.state.pos, this.readRegexp()) : 61 === this.input.charCodeAt(this.state.pos + 1) ? this.finishOp(E.assign, 2) : this.finishOp(E.slash, 1);
				}, e.prototype.readToken_mult_modulo = function (t) {
					var e = 42 === t ? E.star : E.modulo,
					    s = 1,
					    i = this.input.charCodeAt(this.state.pos + 1);return 42 === t && 42 === i && (s++, i = this.input.charCodeAt(this.state.pos + 2), e = E.exponent), 61 === i && (s++, e = E.assign), this.finishOp(e, s);
				}, e.prototype.readToken_pipe_amp = function (t) {
					var e = this.input.charCodeAt(this.state.pos + 1);return e === t ? this.finishOp(124 === t ? E.logicalOR : E.logicalAND, 2) : 61 === e ? this.finishOp(E.assign, 2) : 124 === t && 125 === e && this.hasPlugin("flow") ? this.finishOp(E.braceBarR, 2) : this.finishOp(124 === t ? E.bitwiseOR : E.bitwiseAND, 1);
				}, e.prototype.readToken_caret = function () {
					return 61 === this.input.charCodeAt(this.state.pos + 1) ? this.finishOp(E.assign, 2) : this.finishOp(E.bitwiseXOR, 1);
				}, e.prototype.readToken_plus_min = function (t) {
					var e = this.input.charCodeAt(this.state.pos + 1);return e === t ? 45 === e && !this.inModule && 62 === this.input.charCodeAt(this.state.pos + 2) && F.test(this.input.slice(this.state.lastTokEnd, this.state.pos)) ? (this.skipLineComment(3), this.skipSpace(), this.nextToken()) : this.finishOp(E.incDec, 2) : 61 === e ? this.finishOp(E.assign, 2) : this.finishOp(E.plusMin, 1);
				}, e.prototype.readToken_lt_gt = function (t) {
					var e = this.input.charCodeAt(this.state.pos + 1),
					    s = 1;return e === t ? (s = 62 === t && 62 === this.input.charCodeAt(this.state.pos + 2) ? 3 : 2, 61 === this.input.charCodeAt(this.state.pos + s) ? this.finishOp(E.assign, s + 1) : this.finishOp(E.bitShift, s)) : 33 !== e || 60 !== t || this.inModule || 45 !== this.input.charCodeAt(this.state.pos + 2) || 45 !== this.input.charCodeAt(this.state.pos + 3) ? (61 === e && (s = 2), this.finishOp(E.relational, s)) : (this.skipLineComment(4), this.skipSpace(), this.nextToken());
				}, e.prototype.readToken_eq_excl = function (t) {
					var e = this.input.charCodeAt(this.state.pos + 1);return 61 === e ? this.finishOp(E.equality, 61 === this.input.charCodeAt(this.state.pos + 2) ? 3 : 2) : 61 === t && 62 === e ? (this.state.pos += 2, this.finishToken(E.arrow)) : this.finishOp(61 === t ? E.eq : E.bang, 1);
				}, e.prototype.readToken_question = function () {
					var t = this.input.charCodeAt(this.state.pos + 1),
					    e = this.input.charCodeAt(this.state.pos + 2);return 46 !== t || e >= 48 && e <= 57 ? (++this.state.pos, this.finishToken(E.question)) : (this.state.pos += 2, this.finishToken(E.questionDot));
				}, e.prototype.getTokenFromCode = function (t) {
					switch (t) {case 35:
							if ((this.hasPlugin("classPrivateProperties") || this.hasPlugin("classPrivateMethods")) && this.state.classLevel > 0) return ++this.state.pos, this.finishToken(E.hash);this.raise(this.state.pos, "Unexpected character '" + c(t) + "'");case 46:
							return this.readToken_dot();case 40:
							return ++this.state.pos, this.finishToken(E.parenL);case 41:
							return ++this.state.pos, this.finishToken(E.parenR);case 59:
							return ++this.state.pos, this.finishToken(E.semi);case 44:
							return ++this.state.pos, this.finishToken(E.comma);case 91:
							return ++this.state.pos, this.finishToken(E.bracketL);case 93:
							return ++this.state.pos, this.finishToken(E.bracketR);case 123:
							return this.hasPlugin("flow") && 124 === this.input.charCodeAt(this.state.pos + 1) ? this.finishOp(E.braceBarL, 2) : (++this.state.pos, this.finishToken(E.braceL));case 125:
							return ++this.state.pos, this.finishToken(E.braceR);case 58:
							return this.hasPlugin("functionBind") && 58 === this.input.charCodeAt(this.state.pos + 1) ? this.finishOp(E.doubleColon, 2) : (++this.state.pos, this.finishToken(E.colon));case 63:
							return this.readToken_question();case 64:
							return ++this.state.pos, this.finishToken(E.at);case 96:
							return ++this.state.pos, this.finishToken(E.backQuote);case 48:
							var e = this.input.charCodeAt(this.state.pos + 1);if (120 === e || 88 === e) return this.readRadixNumber(16);if (111 === e || 79 === e) return this.readRadixNumber(8);if (98 === e || 66 === e) return this.readRadixNumber(2);case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:
							return this.readNumber(!1);case 34:case 39:
							return this.readString(t);case 47:
							return this.readToken_slash();case 37:case 42:
							return this.readToken_mult_modulo(t);case 124:case 38:
							return this.readToken_pipe_amp(t);case 94:
							return this.readToken_caret();case 43:case 45:
							return this.readToken_plus_min(t);case 60:case 62:
							return this.readToken_lt_gt(t);case 61:case 33:
							return this.readToken_eq_excl(t);case 126:
							return this.finishOp(E.tilde, 1);}this.raise(this.state.pos, "Unexpected character '" + c(t) + "'");
				}, e.prototype.finishOp = function (t, e) {
					var s = this.input.slice(this.state.pos, this.state.pos + e);return this.state.pos += e, this.finishToken(t, s);
				}, e.prototype.readRegexp = function () {
					for (var t = this.state.pos, e = void 0, s = void 0;;) {
						this.state.pos >= this.input.length && this.raise(t, "Unterminated regular expression");var i = this.input.charAt(this.state.pos);if (F.test(i) && this.raise(t, "Unterminated regular expression"), e) e = !1;else {
							if ("[" === i) s = !0;else if ("]" === i && s) s = !1;else if ("/" === i && !s) break;e = "\\" === i;
						}++this.state.pos;
					}var r = this.input.slice(t, this.state.pos);++this.state.pos;var a = this.readWord1();return a && (/^[gmsiyu]*$/.test(a) || this.raise(t, "Invalid regular expression flag")), this.finishToken(E.regexp, { pattern: r, flags: a });
				}, e.prototype.readInt = function (t, e) {
					for (var s = this.state.pos, i = 16 === t ? H.hex : H.decBinOct, r = 0, a = 0, n = null == e ? 1 / 0 : e; a < n; ++a) {
						var o = this.input.charCodeAt(this.state.pos),
						    h = void 0;if (this.hasPlugin("numericSeparator")) {
							var p = this.input.charCodeAt(this.state.pos - 1),
							    c = this.input.charCodeAt(this.state.pos + 1);if (95 === o) {
								(i.indexOf(p) > -1 || i.indexOf(c) > -1 || Number.isNaN(c)) && this.raise(this.state.pos, "Invalid NumericLiteralSeparator"), ++this.state.pos;continue;
							}
						}if ((h = o >= 97 ? o - 97 + 10 : o >= 65 ? o - 65 + 10 : o >= 48 && o <= 57 ? o - 48 : 1 / 0) >= t) break;++this.state.pos, r = r * t + h;
					}return this.state.pos === s || null != e && this.state.pos - s !== e ? null : r;
				}, e.prototype.readRadixNumber = function (t) {
					var e = this.state.pos,
					    s = !1;this.state.pos += 2;var i = this.readInt(t);if (null == i && this.raise(this.state.start + 2, "Expected number in radix " + t), this.hasPlugin("bigInt") && 110 === this.input.charCodeAt(this.state.pos) && (++this.state.pos, s = !0), a(this.fullCharCodeAtPos()) && this.raise(this.state.pos, "Identifier directly after number"), s) {
						var r = this.input.slice(e, this.state.pos).replace(/[_n]/g, "");return this.finishToken(E.bigint, r);
					}return this.finishToken(E.num, i);
				}, e.prototype.readNumber = function (t) {
					var e = this.state.pos,
					    s = 48 === this.input.charCodeAt(e),
					    i = !1,
					    r = !1;t || null !== this.readInt(10) || this.raise(e, "Invalid number"), s && this.state.pos == e + 1 && (s = !1);var n = this.input.charCodeAt(this.state.pos);46 !== n || s || (++this.state.pos, this.readInt(10), i = !0, n = this.input.charCodeAt(this.state.pos)), 69 !== n && 101 !== n || s || (43 !== (n = this.input.charCodeAt(++this.state.pos)) && 45 !== n || ++this.state.pos, null === this.readInt(10) && this.raise(e, "Invalid number"), i = !0, n = this.input.charCodeAt(this.state.pos)), this.hasPlugin("bigInt") && 110 === n && ((i || s) && this.raise(e, "Invalid BigIntLiteral"), ++this.state.pos, r = !0), a(this.fullCharCodeAtPos()) && this.raise(this.state.pos, "Identifier directly after number");var o = this.input.slice(e, this.state.pos).replace(/[_n]/g, "");if (r) return this.finishToken(E.bigint, o);var h = void 0;return i ? h = parseFloat(o) : s && 1 !== o.length ? this.state.strict ? this.raise(e, "Invalid number") : h = /[89]/.test(o) ? parseInt(o, 10) : parseInt(o, 8) : h = parseInt(o, 10), this.finishToken(E.num, h);
				}, e.prototype.readCodePoint = function (t) {
					var e = void 0;if (123 === this.input.charCodeAt(this.state.pos)) {
						var s = ++this.state.pos;if (e = this.readHexChar(this.input.indexOf("}", this.state.pos) - this.state.pos, t), ++this.state.pos, null === e) --this.state.invalidTemplateEscapePosition;else if (e > 1114111) {
							if (!t) return this.state.invalidTemplateEscapePosition = s - 2, null;this.raise(s, "Code point out of bounds");
						}
					} else e = this.readHexChar(4, t);return e;
				}, e.prototype.readString = function (t) {
					for (var e = "", s = ++this.state.pos;;) {
						this.state.pos >= this.input.length && this.raise(this.state.start, "Unterminated string constant");var i = this.input.charCodeAt(this.state.pos);if (i === t) break;92 === i ? (e += this.input.slice(s, this.state.pos), e += this.readEscapedChar(!1), s = this.state.pos) : (o(i) && this.raise(this.state.start, "Unterminated string constant"), ++this.state.pos);
					}return e += this.input.slice(s, this.state.pos++), this.finishToken(E.string, e);
				}, e.prototype.readTmplToken = function () {
					for (var t = "", e = this.state.pos, s = !1;;) {
						this.state.pos >= this.input.length && this.raise(this.state.start, "Unterminated template");var i = this.input.charCodeAt(this.state.pos);if (96 === i || 36 === i && 123 === this.input.charCodeAt(this.state.pos + 1)) return this.state.pos === this.state.start && this.match(E.template) ? 36 === i ? (this.state.pos += 2, this.finishToken(E.dollarBraceL)) : (++this.state.pos, this.finishToken(E.backQuote)) : (t += this.input.slice(e, this.state.pos), this.finishToken(E.template, s ? null : t));if (92 === i) {
							t += this.input.slice(e, this.state.pos);var r = this.readEscapedChar(!0);null === r ? s = !0 : t += r, e = this.state.pos;
						} else if (o(i)) {
							switch (t += this.input.slice(e, this.state.pos), ++this.state.pos, i) {case 13:
									10 === this.input.charCodeAt(this.state.pos) && ++this.state.pos;case 10:
									t += "\n";break;default:
									t += String.fromCharCode(i);}++this.state.curLine, this.state.lineStart = this.state.pos, e = this.state.pos;
						} else ++this.state.pos;
					}
				}, e.prototype.readEscapedChar = function (t) {
					var e = !t,
					    s = this.input.charCodeAt(++this.state.pos);switch (++this.state.pos, s) {case 110:
							return "\n";case 114:
							return "\r";case 120:
							var i = this.readHexChar(2, e);return null === i ? null : String.fromCharCode(i);case 117:
							var r = this.readCodePoint(e);return null === r ? null : c(r);case 116:
							return "\t";case 98:
							return "\b";case 118:
							return "\v";case 102:
							return "\f";case 13:
							10 === this.input.charCodeAt(this.state.pos) && ++this.state.pos;case 10:
							return this.state.lineStart = this.state.pos, ++this.state.curLine, "";default:
							if (s >= 48 && s <= 55) {
								var a = this.state.pos - 1,
								    n = this.input.substr(this.state.pos - 1, 3).match(/^[0-7]+/)[0],
								    o = parseInt(n, 8);if (o > 255 && (n = n.slice(0, -1), o = parseInt(n, 8)), o > 0) {
									if (t) return this.state.invalidTemplateEscapePosition = a, null;this.state.strict ? this.raise(a, "Octal literal in strict mode") : this.state.containsOctal || (this.state.containsOctal = !0, this.state.octalPosition = a);
								}return this.state.pos += n.length - 1, String.fromCharCode(o);
							}return String.fromCharCode(s);}
				}, e.prototype.readHexChar = function (t, e) {
					var s = this.state.pos,
					    i = this.readInt(16, t);return null === i && (e ? this.raise(s, "Bad character escape sequence") : (this.state.pos = s - 1, this.state.invalidTemplateEscapePosition = s - 1)), i;
				}, e.prototype.readWord1 = function () {
					this.state.containsEsc = !1;for (var t = "", e = !0, s = this.state.pos; this.state.pos < this.input.length;) {
						var i = this.fullCharCodeAtPos();if (n(i)) this.state.pos += i <= 65535 ? 1 : 2;else {
							if (92 !== i) break;this.state.containsEsc = !0, t += this.input.slice(s, this.state.pos);var r = this.state.pos;117 !== this.input.charCodeAt(++this.state.pos) && this.raise(this.state.pos, "Expecting Unicode escape sequence \\uXXXX"), ++this.state.pos;var o = this.readCodePoint(!0);(e ? a : n)(o, !0) || this.raise(r, "Invalid Unicode escape"), t += c(o), s = this.state.pos;
						}e = !1;
					}return t + this.input.slice(s, this.state.pos);
				}, e.prototype.readWord = function () {
					var t = this.readWord1(),
					    e = E.name;return this.isKeyword(t) && (this.state.containsEsc && this.raise(this.state.pos, "Escape sequence in keyword " + t), e = S[t]), this.finishToken(e, t);
				}, e.prototype.braceIsBlock = function (t) {
					if (t === E.colon) {
						var e = this.curContext();if (e === U.braceStatement || e === U.braceExpression) return !e.isExpr;
					}return t === E._return ? F.test(this.input.slice(this.state.lastTokEnd, this.state.start)) : t === E._else || t === E.semi || t === E.eof || t === E.parenR || (t === E.braceL ? this.curContext() === U.braceStatement : t === E.relational || !this.state.exprAllowed);
				}, e.prototype.updateContext = function (t) {
					var e = this.state.type,
					    s = void 0;!e.keyword || t !== E.dot && t !== E.questionDot ? (s = e.updateContext) ? s.call(this, t) : this.state.exprAllowed = e.beforeExpr : this.state.exprAllowed = !1;
				}, e;
			}(X)),
			    Q = ["leadingComments", "trailingComments", "innerComments"],
			    Y = function () {
				function t(t, e, s) {
					this.type = "", this.start = e, this.end = 0, this.loc = new K(s), t && t.options.ranges && (this.range = [e, 0]), t && t.filename && (this.loc.filename = t.filename);
				}return t.prototype.__clone = function () {
					var e = new t();for (var s in this) {
						Q.indexOf(s) < 0 && (e[s] = this[s]);
					}return e;
				}, t;
			}(),
			    $ = [],
			    Z = { kind: "loop" },
			    tt = { kind: "switch" },
			    et = {},
			    st = function (t) {
				function e(e, i) {
					var r;return e = s(e), r = t.call(this, e, i) || this, r.options = e, r.inModule = "module" === r.options.sourceType, r.input = i, r.plugins = l(r.options.plugins), r.filename = e.sourceFilename, 0 === r.state.pos && "#" === r.input[0] && "!" === r.input[1] && r.skipLineComment(2), r;
				}return A(e, t), e.prototype.parse = function () {
					var t = this.startNode(),
					    e = this.startNode();return this.nextToken(), this.parseTopLevel(t, e);
				}, e;
			}(function (t) {
				function e() {
					return t.apply(this, arguments) || this;
				}return A(e, t), e.prototype.parseTopLevel = function (t, e) {
					return e.sourceType = this.options.sourceType, this.parseBlockBody(e, !0, !0, E.eof), t.program = this.finishNode(e, "Program"), t.comments = this.state.comments, this.options.tokens && (t.tokens = this.state.tokens), this.finishNode(t, "File");
				}, e.prototype.stmtToDirective = function (t) {
					var e = t.expression,
					    s = this.startNodeAt(e.start, e.loc.start),
					    i = this.startNodeAt(t.start, t.loc.start),
					    r = this.input.slice(e.start, e.end),
					    a = s.value = r.slice(1, -1);return this.addExtra(s, "raw", r), this.addExtra(s, "rawValue", a), i.value = this.finishNodeAt(s, "DirectiveLiteral", e.end, e.loc.end), this.finishNodeAt(i, "Directive", t.end, t.loc.end);
				}, e.prototype.parseStatement = function (t, e) {
					return this.match(E.at) && this.parseDecorators(!0), this.parseStatementContent(t, e);
				}, e.prototype.parseStatementContent = function (t, e) {
					var s = this.state.type,
					    i = this.startNode();switch (s) {case E._break:case E._continue:
							return this.parseBreakContinueStatement(i, s.keyword);case E._debugger:
							return this.parseDebuggerStatement(i);case E._do:
							return this.parseDoStatement(i);case E._for:
							return this.parseForStatement(i);case E._function:
							if (this.lookahead().type === E.dot) break;return t || this.unexpected(), this.parseFunctionStatement(i);case E._class:
							return t || this.unexpected(), this.parseClass(i, !0);case E._if:
							return this.parseIfStatement(i);case E._return:
							return this.parseReturnStatement(i);case E._switch:
							return this.parseSwitchStatement(i);case E._throw:
							return this.parseThrowStatement(i);case E._try:
							return this.parseTryStatement(i);case E._let:case E._const:
							t || this.unexpected();case E._var:
							return this.parseVarStatement(i, s);case E._while:
							return this.parseWhileStatement(i);case E._with:
							return this.parseWithStatement(i);case E.braceL:
							return this.parseBlock();case E.semi:
							return this.parseEmptyStatement(i);case E._export:case E._import:
							if (this.hasPlugin("dynamicImport") && this.lookahead().type === E.parenL || this.hasPlugin("importMeta") && this.lookahead().type === E.dot) break;return this.options.allowImportExportEverywhere || (e || this.raise(this.state.start, "'import' and 'export' may only appear at the top level"), this.inModule || this.raise(this.state.start, "'import' and 'export' may appear only with 'sourceType: \"module\"'")), this.next(), s == E._import ? this.parseImport(i) : this.parseExport(i);case E.name:
							if ("async" === this.state.value) {
								var r = this.state.clone();if (this.next(), this.match(E._function) && !this.canInsertSemicolon()) return this.expect(E._function), this.parseFunction(i, !0, !1, !0);this.state = r;
							}}var a = this.state.value,
					    n = this.parseExpression();return s === E.name && "Identifier" === n.type && this.eat(E.colon) ? this.parseLabeledStatement(i, a, n) : this.parseExpressionStatement(i, n);
				}, e.prototype.takeDecorators = function (t) {
					var e = this.state.decoratorStack[this.state.decoratorStack.length - 1];e.length && (t.decorators = e, this.resetStartLocationFromNode(t, e[0]), this.state.decoratorStack[this.state.decoratorStack.length - 1] = []);
				}, e.prototype.parseDecorators = function (t) {
					this.hasPlugin("decorators2") && (t = !1);for (var e = this.state.decoratorStack[this.state.decoratorStack.length - 1]; this.match(E.at);) {
						var s = this.parseDecorator();e.push(s);
					}if (this.match(E._export)) {
						if (t) return;this.raise(this.state.start, "Using the export keyword between a decorator and a class is not allowed. Please use `export @dec class` instead");
					}this.match(E._class) || this.raise(this.state.start, "Leading decorators must be attached to a class declaration");
				}, e.prototype.parseDecorator = function () {
					this.expectOnePlugin(["decorators", "decorators2"]);var t = this.startNode();if (this.next(), this.hasPlugin("decorators2")) {
						for (var e = this.state.start, s = this.state.startLoc, i = this.parseIdentifier(!1); this.eat(E.dot);) {
							var r = this.startNodeAt(e, s);r.object = i, r.property = this.parseIdentifier(!0), r.computed = !1, i = this.finishNode(r, "MemberExpression");
						}if (this.eat(E.parenL)) {
							var a = this.startNodeAt(e, s);a.callee = i, this.state.decoratorStack.push([]), a.arguments = this.parseCallExpressionArguments(E.parenR, !1), this.state.decoratorStack.pop(), i = this.finishNode(a, "CallExpression"), this.toReferencedList(i.arguments);
						}t.expression = i;
					} else t.expression = this.parseMaybeAssign();return this.finishNode(t, "Decorator");
				}, e.prototype.parseBreakContinueStatement = function (t, e) {
					var s = "break" === e;this.next(), this.isLineTerminator() ? t.label = null : this.match(E.name) ? (t.label = this.parseIdentifier(), this.semicolon()) : this.unexpected();var i = void 0;for (i = 0; i < this.state.labels.length; ++i) {
						var r = this.state.labels[i];if (null == t.label || r.name === t.label.name) {
							if (null != r.kind && (s || "loop" === r.kind)) break;if (t.label && s) break;
						}
					}return i === this.state.labels.length && this.raise(t.start, "Unsyntactic " + e), this.finishNode(t, s ? "BreakStatement" : "ContinueStatement");
				}, e.prototype.parseDebuggerStatement = function (t) {
					return this.next(), this.semicolon(), this.finishNode(t, "DebuggerStatement");
				}, e.prototype.parseDoStatement = function (t) {
					return this.next(), this.state.labels.push(Z), t.body = this.parseStatement(!1), this.state.labels.pop(), this.expect(E._while), t.test = this.parseParenExpression(), this.eat(E.semi), this.finishNode(t, "DoWhileStatement");
				}, e.prototype.parseForStatement = function (t) {
					this.next(), this.state.labels.push(Z);var e = !1;if (this.state.inAsync && this.isContextual("await") && (this.expectPlugin("asyncGenerators"), e = !0, this.next()), this.expect(E.parenL), this.match(E.semi)) return e && this.unexpected(), this.parseFor(t, null);if (this.match(E._var) || this.match(E._let) || this.match(E._const)) {
						var s = this.startNode(),
						    i = this.state.type;return this.next(), this.parseVar(s, !0, i), this.finishNode(s, "VariableDeclaration"), !this.match(E._in) && !this.isContextual("of") || 1 !== s.declarations.length || s.declarations[0].init ? (e && this.unexpected(), this.parseFor(t, s)) : this.parseForIn(t, s, e);
					}var r = { start: 0 },
					    a = this.parseExpression(!0, r);if (this.match(E._in) || this.isContextual("of")) {
						var n = this.isContextual("of") ? "for-of statement" : "for-in statement";return this.toAssignable(a, void 0, n), this.checkLVal(a, void 0, void 0, n), this.parseForIn(t, a, e);
					}return r.start && this.unexpected(r.start), e && this.unexpected(), this.parseFor(t, a);
				}, e.prototype.parseFunctionStatement = function (t) {
					return this.next(), this.parseFunction(t, !0);
				}, e.prototype.parseIfStatement = function (t) {
					return this.next(), t.test = this.parseParenExpression(), t.consequent = this.parseStatement(!1), t.alternate = this.eat(E._else) ? this.parseStatement(!1) : null, this.finishNode(t, "IfStatement");
				}, e.prototype.parseReturnStatement = function (t) {
					return this.state.inFunction || this.options.allowReturnOutsideFunction || this.raise(this.state.start, "'return' outside of function"), this.next(), this.isLineTerminator() ? t.argument = null : (t.argument = this.parseExpression(), this.semicolon()), this.finishNode(t, "ReturnStatement");
				}, e.prototype.parseSwitchStatement = function (t) {
					this.next(), t.discriminant = this.parseParenExpression();var e = t.cases = [];this.expect(E.braceL), this.state.labels.push(tt);for (var s, i = void 0; !this.match(E.braceR);) {
						if (this.match(E._case) || this.match(E._default)) {
							var r = this.match(E._case);i && this.finishNode(i, "SwitchCase"), e.push(i = this.startNode()), i.consequent = [], this.next(), r ? i.test = this.parseExpression() : (s && this.raise(this.state.lastTokStart, "Multiple default clauses"), s = !0, i.test = null), this.expect(E.colon);
						} else i ? i.consequent.push(this.parseStatement(!0)) : this.unexpected();
					}return i && this.finishNode(i, "SwitchCase"), this.next(), this.state.labels.pop(), this.finishNode(t, "SwitchStatement");
				}, e.prototype.parseThrowStatement = function (t) {
					return this.next(), F.test(this.input.slice(this.state.lastTokEnd, this.state.start)) && this.raise(this.state.lastTokEnd, "Illegal newline after throw"), t.argument = this.parseExpression(), this.semicolon(), this.finishNode(t, "ThrowStatement");
				}, e.prototype.parseTryStatement = function (t) {
					if (this.next(), t.block = this.parseBlock(), t.handler = null, this.match(E._catch)) {
						var e = this.startNode();this.next(), this.match(E.parenL) ? (this.expect(E.parenL), e.param = this.parseBindingAtom(), this.checkLVal(e.param, !0, Object.create(null), "catch clause"), this.expect(E.parenR)) : (this.expectPlugin("optionalCatchBinding"), e.param = null), e.body = this.parseBlock(), t.handler = this.finishNode(e, "CatchClause");
					}return t.guardedHandlers = $, t.finalizer = this.eat(E._finally) ? this.parseBlock() : null, t.handler || t.finalizer || this.raise(t.start, "Missing catch or finally clause"), this.finishNode(t, "TryStatement");
				}, e.prototype.parseVarStatement = function (t, e) {
					return this.next(), this.parseVar(t, !1, e), this.semicolon(), this.finishNode(t, "VariableDeclaration");
				}, e.prototype.parseWhileStatement = function (t) {
					return this.next(), t.test = this.parseParenExpression(), this.state.labels.push(Z), t.body = this.parseStatement(!1), this.state.labels.pop(), this.finishNode(t, "WhileStatement");
				}, e.prototype.parseWithStatement = function (t) {
					return this.state.strict && this.raise(this.state.start, "'with' in strict mode"), this.next(), t.object = this.parseParenExpression(), t.body = this.parseStatement(!1), this.finishNode(t, "WithStatement");
				}, e.prototype.parseEmptyStatement = function (t) {
					return this.next(), this.finishNode(t, "EmptyStatement");
				}, e.prototype.parseLabeledStatement = function (t, e, s) {
					for (var i = this.state.labels, r = Array.isArray(i), a = 0, i = r ? i : i[Symbol.iterator]();;) {
						var n;if (r) {
							if (a >= i.length) break;n = i[a++];
						} else {
							if ((a = i.next()).done) break;n = a.value;
						}n.name === e && this.raise(s.start, "Label '" + e + "' is already declared");
					}for (var o = this.state.type.isLoop ? "loop" : this.match(E._switch) ? "switch" : null, h = this.state.labels.length - 1; h >= 0; h--) {
						var p = this.state.labels[h];if (p.statementStart !== t.start) break;p.statementStart = this.state.start, p.kind = o;
					}return this.state.labels.push({ name: e, kind: o, statementStart: this.state.start }), t.body = this.parseStatement(!0), ("ClassDeclaration" == t.body.type || "VariableDeclaration" == t.body.type && "var" !== t.body.kind || "FunctionDeclaration" == t.body.type && (this.state.strict || t.body.generator || t.body.async)) && this.raise(t.body.start, "Invalid labeled declaration"), this.state.labels.pop(), t.label = s, this.finishNode(t, "LabeledStatement");
				}, e.prototype.parseExpressionStatement = function (t, e) {
					return t.expression = e, this.semicolon(), this.finishNode(t, "ExpressionStatement");
				}, e.prototype.parseBlock = function (t) {
					var e = this.startNode();return this.expect(E.braceL), this.parseBlockBody(e, t, !1, E.braceR), this.finishNode(e, "BlockStatement");
				}, e.prototype.isValidDirective = function (t) {
					return "ExpressionStatement" === t.type && "StringLiteral" === t.expression.type && !t.expression.extra.parenthesized;
				}, e.prototype.parseBlockBody = function (t, e, s, i) {
					var r = t.body = [],
					    a = t.directives = [];this.parseBlockOrModuleBlockBody(r, e ? a : void 0, s, i);
				}, e.prototype.parseBlockOrModuleBlockBody = function (t, e, s, i) {
					for (var r = !1, a = void 0, n = void 0; !this.eat(i);) {
						r || !this.state.containsOctal || n || (n = this.state.octalPosition);var o = this.parseStatement(!0, s);if (e && !r && this.isValidDirective(o)) {
							var h = this.stmtToDirective(o);e.push(h), void 0 === a && "use strict" === h.value.value && (a = this.state.strict, this.setStrict(!0), n && this.raise(n, "Octal literal in strict mode"));
						} else r = !0, t.push(o);
					}!1 === a && this.setStrict(!1);
				}, e.prototype.parseFor = function (t, e) {
					return t.init = e, this.expect(E.semi), t.test = this.match(E.semi) ? null : this.parseExpression(), this.expect(E.semi), t.update = this.match(E.parenR) ? null : this.parseExpression(), this.expect(E.parenR), t.body = this.parseStatement(!1), this.state.labels.pop(), this.finishNode(t, "ForStatement");
				}, e.prototype.parseForIn = function (t, e, s) {
					var i = this.match(E._in) ? "ForInStatement" : "ForOfStatement";return s ? this.eatContextual("of") : this.next(), "ForOfStatement" === i && (t.await = !!s), t.left = e, t.right = this.parseExpression(), this.expect(E.parenR), t.body = this.parseStatement(!1), this.state.labels.pop(), this.finishNode(t, i);
				}, e.prototype.parseVar = function (t, e, s) {
					var i = t.declarations = [];for (t.kind = s.keyword;;) {
						var r = this.startNode();if (this.parseVarHead(r), this.eat(E.eq) ? r.init = this.parseMaybeAssign(e) : (s !== E._const || this.match(E._in) || this.isContextual("of") ? "Identifier" === r.id.type || e && (this.match(E._in) || this.isContextual("of")) || this.raise(this.state.lastTokEnd, "Complex binding patterns require an initialization value") : this.hasPlugin("typescript") || this.unexpected(), r.init = null), i.push(this.finishNode(r, "VariableDeclarator")), !this.eat(E.comma)) break;
					}return t;
				}, e.prototype.parseVarHead = function (t) {
					t.id = this.parseBindingAtom(), this.checkLVal(t.id, !0, void 0, "variable declaration");
				}, e.prototype.parseFunction = function (t, e, s, i, r) {
					var a = this.state.inMethod;return this.state.inMethod = !1, this.initFunction(t, i), this.match(E.star) && (t.async && this.expectPlugin("asyncGenerators"), t.generator = !0, this.next()), !e || r || this.match(E.name) || this.match(E._yield) || this.unexpected(), (this.match(E.name) || this.match(E._yield)) && (t.id = this.parseBindingIdentifier()), this.parseFunctionParams(t), this.parseFunctionBodyAndFinish(t, e ? "FunctionDeclaration" : "FunctionExpression", s), this.state.inMethod = a, t;
				}, e.prototype.parseFunctionParams = function (t) {
					this.expect(E.parenL), t.params = this.parseBindingList(E.parenR);
				}, e.prototype.parseClass = function (t, e, s) {
					return this.next(), this.takeDecorators(t), this.parseClassId(t, e, s), this.parseClassSuper(t), this.parseClassBody(t), this.finishNode(t, e ? "ClassDeclaration" : "ClassExpression");
				}, e.prototype.isClassProperty = function () {
					return this.match(E.eq) || this.match(E.semi) || this.match(E.braceR);
				}, e.prototype.isClassMethod = function () {
					return this.match(E.parenL);
				}, e.prototype.isNonstaticConstructor = function (t) {
					return !(t.computed || t.static || "constructor" !== t.key.name && "constructor" !== t.key.value);
				}, e.prototype.parseClassBody = function (t) {
					var e = this.state.strict;this.state.strict = !0, this.state.classLevel++;var s = { hadConstructor: !1 },
					    i = [],
					    r = this.startNode();for (r.body = [], this.expect(E.braceL); !this.eat(E.braceR);) {
						if (this.eat(E.semi)) i.length > 0 && this.raise(this.state.lastTokEnd, "Decorators must not be followed by a semicolon");else if (this.match(E.at)) i.push(this.parseDecorator());else {
							var a = this.startNode();i.length && (a.decorators = i, this.resetStartLocationFromNode(a, i[0]), i = []), this.parseClassMember(r, a, s), this.hasPlugin("decorators2") && "method" != a.kind && a.decorators && a.decorators.length > 0 && this.raise(a.start, "Stage 2 decorators may only be used with a class or a class method");
						}
					}i.length && this.raise(this.state.start, "You have trailing decorators with no method"), t.body = this.finishNode(r, "ClassBody"), this.state.classLevel--, this.state.strict = e;
				}, e.prototype.parseClassMember = function (t, e, s) {
					var i = e,
					    r = i,
					    a = i,
					    n = !1;if (this.match(E.name) && "static" === this.state.value) {
						var o = this.parseIdentifier(!0);if (this.isClassMethod()) return r.kind = "method", r.computed = !1, r.key = o, r.static = !1, void this.pushClassMethod(t, r, !1, !1, !1);if (this.isClassProperty()) return a.computed = !1, a.key = o, a.static = !1, void t.body.push(this.parseClassProperty(a));n = !0;
					}this.parseClassMemberWithIsStatic(t, e, s, n);
				}, e.prototype.parseClassMemberWithIsStatic = function (t, e, s, i) {
					var r = e,
					    a = r,
					    n = r,
					    o = r;if (a.static = i, this.eat(E.star)) return n.kind = "method", this.parseClassPropertyName(n), "PrivateName" === n.key.type ? void this.pushClassPrivateMethod(t, n, !0, !1) : (this.isNonstaticConstructor(n) && this.raise(n.key.start, "Constructor can't be a generator"), void this.pushClassMethod(t, n, !0, !1, !1));var h = this.parseClassPropertyName(a),
					    p = "PrivateName" === h.type,
					    c = "Identifier" === h.type;if (this.parsePostMemberNameModifiers(a), this.isClassMethod()) {
						if (n.kind = "method", p) return void this.pushClassPrivateMethod(t, n, !1, !1);var l = this.isNonstaticConstructor(n);l && (n.kind = "constructor", n.decorators && this.raise(n.start, "You can't attach decorators to a class constructor"), s.hadConstructor && !this.hasPlugin("typescript") && this.raise(h.start, "Duplicate constructor in the same class"), s.hadConstructor = !0), this.pushClassMethod(t, n, !1, !1, l);
					} else if (this.isClassProperty()) p ? this.pushClassPrivateProperty(t, o) : this.pushClassProperty(t, o);else if (c && "async" === h.name && !this.isLineTerminator()) {
						var u = this.match(E.star);u && (this.expectPlugin("asyncGenerators"), this.next()), n.kind = "method", this.parseClassPropertyName(n), "PrivateName" === n.key.type ? this.pushClassPrivateMethod(t, n, u, !0) : (this.isNonstaticConstructor(n) && this.raise(n.key.start, "Constructor can't be an async function"), this.pushClassMethod(t, n, u, !0, !1));
					} else !c || "get" !== h.name && "set" !== h.name || this.isLineTerminator() && this.match(E.star) ? this.isLineTerminator() ? p ? this.pushClassPrivateProperty(t, o) : this.pushClassProperty(t, o) : this.unexpected() : (n.kind = h.name, this.parseClassPropertyName(n), "PrivateName" === n.key.type ? this.pushClassPrivateMethod(t, n, !1, !1) : (this.isNonstaticConstructor(n) && this.raise(n.key.start, "Constructor can't have get/set modifier"), this.pushClassMethod(t, n, !1, !1, !1)), this.checkGetterSetterParamCount(n));
				}, e.prototype.parseClassPropertyName = function (t) {
					var e = this.parsePropertyName(t);return t.computed || !t.static || "prototype" !== e.name && "prototype" !== e.value || this.raise(e.start, "Classes may not have static property named prototype"), "PrivateName" === e.type && "constructor" === e.id.name && this.raise(e.start, "Classes may not have a private field named '#constructor'"), e;
				}, e.prototype.pushClassProperty = function (t, e) {
					this.isNonstaticConstructor(e) && this.raise(e.key.start, "Classes may not have a non-static field named 'constructor'"), t.body.push(this.parseClassProperty(e));
				}, e.prototype.pushClassPrivateProperty = function (t, e) {
					this.expectPlugin("classPrivateProperties", e.key.start), t.body.push(this.parseClassPrivateProperty(e));
				}, e.prototype.pushClassMethod = function (t, e, s, i, r) {
					t.body.push(this.parseMethod(e, s, i, r, "ClassMethod"));
				}, e.prototype.pushClassPrivateMethod = function (t, e, s, i) {
					this.expectPlugin("classPrivateMethods", e.key.start), t.body.push(this.parseMethod(e, s, i, !1, "ClassPrivateMethod"));
				}, e.prototype.parsePostMemberNameModifiers = function (t) {}, e.prototype.parseAccessModifier = function () {}, e.prototype.parseClassPrivateProperty = function (t) {
					return this.state.inClassProperty = !0, t.value = this.eat(E.eq) ? this.parseMaybeAssign() : null, this.semicolon(), this.state.inClassProperty = !1, this.finishNode(t, "ClassPrivateProperty");
				}, e.prototype.parseClassProperty = function (t) {
					return t.typeAnnotation || this.expectPlugin("classProperties"), this.state.inClassProperty = !0, this.match(E.eq) ? (this.expectPlugin("classProperties"), this.next(), t.value = this.parseMaybeAssign()) : t.value = null, this.semicolon(), this.state.inClassProperty = !1, this.finishNode(t, "ClassProperty");
				}, e.prototype.parseClassId = function (t, e, s) {
					this.match(E.name) ? t.id = this.parseIdentifier() : s || !e ? t.id = null : this.unexpected(null, "A class name is required");
				}, e.prototype.parseClassSuper = function (t) {
					t.superClass = this.eat(E._extends) ? this.parseExprSubscripts() : null;
				}, e.prototype.parseExport = function (t) {
					if (this.shouldParseExportStar()) {
						if (this.parseExportStar(t, this.hasPlugin("exportExtensions")), "ExportAllDeclaration" === t.type) return t;
					} else if (this.hasPlugin("exportExtensions") && this.isExportDefaultSpecifier()) {
						var e = this.startNode();e.exported = this.parseIdentifier(!0);var s = [this.finishNode(e, "ExportDefaultSpecifier")];if (t.specifiers = s, this.match(E.comma) && this.lookahead().type === E.star) {
							this.expect(E.comma);var i = this.startNode();this.expect(E.star), this.expectContextual("as"), i.exported = this.parseIdentifier(), s.push(this.finishNode(i, "ExportNamespaceSpecifier"));
						} else this.parseExportSpecifiersMaybe(t);this.parseExportFrom(t, !0);
					} else {
						if (this.eat(E._default)) {
							var r = this.startNode(),
							    a = !1;return this.eat(E._function) ? r = this.parseFunction(r, !0, !1, !1, !0) : this.isContextual("async") && this.lookahead().type === E._function ? (this.eatContextual("async"), this.eat(E._function), r = this.parseFunction(r, !0, !1, !0, !0)) : this.match(E._class) ? r = this.parseClass(r, !0, !0) : (a = !0, r = this.parseMaybeAssign()), t.declaration = r, a && this.semicolon(), this.checkExport(t, !0, !0), this.finishNode(t, "ExportDefaultDeclaration");
						}if (this.shouldParseExportDeclaration()) {
							if (this.isContextual("async")) {
								var n = this.lookahead();n.type !== E._function && this.unexpected(n.start, "Unexpected token, expected function");
							}t.specifiers = [], t.source = null, t.declaration = this.parseExportDeclaration(t);
						} else t.declaration = null, t.specifiers = this.parseExportSpecifiers(), this.parseExportFrom(t);
					}return this.checkExport(t, !0), this.finishNode(t, "ExportNamedDeclaration");
				}, e.prototype.parseExportDeclaration = function (t) {
					return this.parseStatement(!0);
				}, e.prototype.isExportDefaultSpecifier = function () {
					if (this.match(E.name)) return "async" !== this.state.value;if (!this.match(E._default)) return !1;var t = this.lookahead();return t.type === E.comma || t.type === E.name && "from" === t.value;
				}, e.prototype.parseExportSpecifiersMaybe = function (t) {
					this.eat(E.comma) && (t.specifiers = t.specifiers.concat(this.parseExportSpecifiers()));
				}, e.prototype.parseExportFrom = function (t, e) {
					this.eatContextual("from") ? (t.source = this.match(E.string) ? this.parseExprAtom() : this.unexpected(), this.checkExport(t)) : e ? this.unexpected() : t.source = null, this.semicolon();
				}, e.prototype.shouldParseExportStar = function () {
					return this.match(E.star);
				}, e.prototype.parseExportStar = function (t, e) {
					if (this.expect(E.star), e && this.isContextual("as")) {
						var s = this.startNodeAt(this.state.lastTokStart, this.state.lastTokStartLoc);this.next(), s.exported = this.parseIdentifier(!0), t.specifiers = [this.finishNode(s, "ExportNamespaceSpecifier")], this.parseExportSpecifiersMaybe(t), this.parseExportFrom(t, !0);
					} else this.parseExportFrom(t, !0), this.finishNode(t, "ExportAllDeclaration");
				}, e.prototype.shouldParseExportDeclaration = function () {
					return "var" === this.state.type.keyword || "const" === this.state.type.keyword || "let" === this.state.type.keyword || "function" === this.state.type.keyword || "class" === this.state.type.keyword || this.isContextual("async");
				}, e.prototype.checkExport = function (t, e, s) {
					if (e) if (s) this.checkDuplicateExports(t, "default");else if (t.specifiers && t.specifiers.length) for (var i = t.specifiers, r = Array.isArray(i), a = 0, i = r ? i : i[Symbol.iterator]();;) {
						var n;if (r) {
							if (a >= i.length) break;n = i[a++];
						} else {
							if ((a = i.next()).done) break;n = a.value;
						}var o = n;this.checkDuplicateExports(o, o.exported.name);
					} else if (t.declaration) if ("FunctionDeclaration" === t.declaration.type || "ClassDeclaration" === t.declaration.type) this.checkDuplicateExports(t, t.declaration.id.name);else if ("VariableDeclaration" === t.declaration.type) for (var h = t.declaration.declarations, p = Array.isArray(h), c = 0, h = p ? h : h[Symbol.iterator]();;) {
						var l;if (p) {
							if (c >= h.length) break;l = h[c++];
						} else {
							if ((c = h.next()).done) break;l = c.value;
						}var u = l;this.checkDeclaration(u.id);
					}if (this.state.decoratorStack[this.state.decoratorStack.length - 1].length) {
						var d = t.declaration && ("ClassDeclaration" === t.declaration.type || "ClassExpression" === t.declaration.type);if (!t.declaration || !d) throw this.raise(t.start, "You can only use decorators on an export when exporting a class");this.takeDecorators(t.declaration);
					}
				}, e.prototype.checkDeclaration = function (t) {
					if ("ObjectPattern" === t.type) for (var e = t.properties, s = Array.isArray(e), i = 0, e = s ? e : e[Symbol.iterator]();;) {
						var r;if (s) {
							if (i >= e.length) break;r = e[i++];
						} else {
							if ((i = e.next()).done) break;r = i.value;
						}var a = r;this.checkDeclaration(a);
					} else if ("ArrayPattern" === t.type) for (var n = t.elements, o = Array.isArray(n), h = 0, n = o ? n : n[Symbol.iterator]();;) {
						var p;if (o) {
							if (h >= n.length) break;p = n[h++];
						} else {
							if ((h = n.next()).done) break;p = h.value;
						}var c = p;c && this.checkDeclaration(c);
					} else "ObjectProperty" === t.type ? this.checkDeclaration(t.value) : "RestElement" === t.type ? this.checkDeclaration(t.argument) : "Identifier" === t.type && this.checkDuplicateExports(t, t.name);
				}, e.prototype.checkDuplicateExports = function (t, e) {
					this.state.exportedIdentifiers.indexOf(e) > -1 && this.raiseDuplicateExportError(t, e), this.state.exportedIdentifiers.push(e);
				}, e.prototype.raiseDuplicateExportError = function (t, e) {
					throw this.raise(t.start, "default" === e ? "Only one default export allowed per module." : "`" + e + "` has already been exported. Exported identifiers must be unique.");
				}, e.prototype.parseExportSpecifiers = function () {
					var t = [],
					    e = !0,
					    s = void 0;for (this.expect(E.braceL); !this.eat(E.braceR);) {
						if (e) e = !1;else if (this.expect(E.comma), this.eat(E.braceR)) break;var i = this.match(E._default);i && !s && (s = !0);var r = this.startNode();r.local = this.parseIdentifier(i), r.exported = this.eatContextual("as") ? this.parseIdentifier(!0) : r.local.__clone(), t.push(this.finishNode(r, "ExportSpecifier"));
					}return s && !this.isContextual("from") && this.unexpected(), t;
				}, e.prototype.parseImport = function (t) {
					return this.match(E.string) ? (t.specifiers = [], t.source = this.parseExprAtom()) : (t.specifiers = [], this.parseImportSpecifiers(t), this.expectContextual("from"), t.source = this.match(E.string) ? this.parseExprAtom() : this.unexpected()), this.semicolon(), this.finishNode(t, "ImportDeclaration");
				}, e.prototype.parseImportSpecifiers = function (t) {
					var e = !0;if (this.match(E.name)) {
						var s = this.state.start,
						    i = this.state.startLoc;if (t.specifiers.push(this.parseImportSpecifierDefault(this.parseIdentifier(), s, i)), !this.eat(E.comma)) return;
					}if (this.match(E.star)) {
						var r = this.startNode();return this.next(), this.expectContextual("as"), r.local = this.parseIdentifier(), this.checkLVal(r.local, !0, void 0, "import namespace specifier"), void t.specifiers.push(this.finishNode(r, "ImportNamespaceSpecifier"));
					}for (this.expect(E.braceL); !this.eat(E.braceR);) {
						if (e) e = !1;else if (this.eat(E.colon) && this.unexpected(null, "ES2015 named imports do not destructure. Use another statement for destructuring after the import."), this.expect(E.comma), this.eat(E.braceR)) break;this.parseImportSpecifier(t);
					}
				}, e.prototype.parseImportSpecifier = function (t) {
					var e = this.startNode();e.imported = this.parseIdentifier(!0), this.eatContextual("as") ? e.local = this.parseIdentifier() : (this.checkReservedWord(e.imported.name, e.start, !0, !0), e.local = e.imported.__clone()), this.checkLVal(e.local, !0, void 0, "import specifier"), t.specifiers.push(this.finishNode(e, "ImportSpecifier"));
				}, e.prototype.parseImportSpecifierDefault = function (t, e, s) {
					var i = this.startNodeAt(e, s);return i.local = t, this.checkLVal(i.local, !0, void 0, "default import specifier"), this.finishNode(i, "ImportDefaultSpecifier");
				}, e;
			}(function (t) {
				function e() {
					return t.apply(this, arguments) || this;
				}return A(e, t), e.prototype.checkPropClash = function (t, e) {
					if (!t.computed && !t.kind) {
						var s = t.key;"__proto__" === ("Identifier" === s.type ? s.name : String(s.value)) && (e.proto && this.raise(s.start, "Redefinition of __proto__ property"), e.proto = !0);
					}
				}, e.prototype.getExpression = function () {
					this.nextToken();var t = this.parseExpression();return this.match(E.eof) || this.unexpected(), t.comments = this.state.comments, t;
				}, e.prototype.parseExpression = function (t, e) {
					var s = this.state.start,
					    i = this.state.startLoc,
					    r = this.parseMaybeAssign(t, e);if (this.match(E.comma)) {
						var a = this.startNodeAt(s, i);for (a.expressions = [r]; this.eat(E.comma);) {
							a.expressions.push(this.parseMaybeAssign(t, e));
						}return this.toReferencedList(a.expressions), this.finishNode(a, "SequenceExpression");
					}return r;
				}, e.prototype.parseMaybeAssign = function (t, e, s, i) {
					var r = this.state.start,
					    a = this.state.startLoc;if (this.match(E._yield) && this.state.inGenerator) {
						var n = this.parseYield();return s && (n = s.call(this, n, r, a)), n;
					}var o = void 0;e ? o = !1 : (e = { start: 0 }, o = !0), (this.match(E.parenL) || this.match(E.name)) && (this.state.potentialArrowAt = this.state.start);var h = this.parseMaybeConditional(t, e, i);if (s && (h = s.call(this, h, r, a)), this.state.type.isAssign) {
						var p = this.startNodeAt(r, a);if (p.operator = this.state.value, p.left = this.match(E.eq) ? this.toAssignable(h, void 0, "assignment expression") : h, e.start = 0, this.checkLVal(h, void 0, void 0, "assignment expression"), h.extra && h.extra.parenthesized) {
							var c = void 0;"ObjectPattern" === h.type ? c = "`({a}) = 0` use `({a} = 0)`" : "ArrayPattern" === h.type && (c = "`([a]) = 0` use `([a] = 0)`"), c && this.raise(h.start, "You're trying to assign to a parenthesized expression, eg. instead of " + c);
						}return this.next(), p.right = this.parseMaybeAssign(t), this.finishNode(p, "AssignmentExpression");
					}return o && e.start && this.unexpected(e.start), h;
				}, e.prototype.parseMaybeConditional = function (t, e, s) {
					var i = this.state.start,
					    r = this.state.startLoc,
					    a = this.state.potentialArrowAt,
					    n = this.parseExprOps(t, e);return "ArrowFunctionExpression" === n.type && n.start === a ? n : e && e.start ? n : this.parseConditional(n, t, i, r, s);
				}, e.prototype.parseConditional = function (t, e, s, i, r) {
					if (this.eat(E.question)) {
						var a = this.startNodeAt(s, i);return a.test = t, a.consequent = this.parseMaybeAssign(), this.expect(E.colon), a.alternate = this.parseMaybeAssign(e), this.finishNode(a, "ConditionalExpression");
					}return t;
				}, e.prototype.parseExprOps = function (t, e) {
					var s = this.state.start,
					    i = this.state.startLoc,
					    r = this.state.potentialArrowAt,
					    a = this.parseMaybeUnary(e);return "ArrowFunctionExpression" === a.type && a.start === r ? a : e && e.start ? a : this.parseExprOp(a, s, i, -1, t);
				}, e.prototype.parseExprOp = function (t, e, s, i, r) {
					var a = this.state.type.binop;if (!(null == a || r && this.match(E._in)) && a > i) {
						var n = this.startNodeAt(e, s);n.left = t, n.operator = this.state.value, "**" !== n.operator || "UnaryExpression" !== t.type || !t.extra || t.extra.parenthesizedArgument || t.extra.parenthesized || this.raise(t.argument.start, "Illegal expression. Wrap left hand side or entire exponentiation in parentheses.");var o = this.state.type;this.next();var h = this.state.start,
						    p = this.state.startLoc;return n.right = this.parseExprOp(this.parseMaybeUnary(), h, p, o.rightAssociative ? a - 1 : a, r), this.finishNode(n, o === E.logicalOR || o === E.logicalAND ? "LogicalExpression" : "BinaryExpression"), this.parseExprOp(n, e, s, i, r);
					}return t;
				}, e.prototype.parseMaybeUnary = function (t) {
					if (this.state.type.prefix) {
						var e = this.startNode(),
						    s = this.match(E.incDec);e.operator = this.state.value, e.prefix = !0, this.next();var i = this.state.type;if (e.argument = this.parseMaybeUnary(), this.addExtra(e, "parenthesizedArgument", !(i !== E.parenL || e.argument.extra && e.argument.extra.parenthesized)), t && t.start && this.unexpected(t.start), s) this.checkLVal(e.argument, void 0, void 0, "prefix operation");else if (this.state.strict && "delete" === e.operator) {
							var r = e.argument;"Identifier" === r.type ? this.raise(e.start, "Deleting local variable in strict mode") : this.hasPlugin("classPrivateProperties") && "MemberExpression" === r.type && "PrivateName" === r.property.type && this.raise(e.start, "Deleting a private field is not allowed");
						}return this.finishNode(e, s ? "UpdateExpression" : "UnaryExpression");
					}var a = this.state.start,
					    n = this.state.startLoc,
					    o = this.parseExprSubscripts(t);if (t && t.start) return o;for (; this.state.type.postfix && !this.canInsertSemicolon();) {
						var h = this.startNodeAt(a, n);h.operator = this.state.value, h.prefix = !1, h.argument = o, this.checkLVal(o, void 0, void 0, "postfix operation"), this.next(), o = this.finishNode(h, "UpdateExpression");
					}return o;
				}, e.prototype.parseExprSubscripts = function (t) {
					var e = this.state.start,
					    s = this.state.startLoc,
					    i = this.state.potentialArrowAt,
					    r = this.parseExprAtom(t);return "ArrowFunctionExpression" === r.type && r.start === i ? r : t && t.start ? r : this.parseSubscripts(r, e, s);
				}, e.prototype.parseSubscripts = function (t, e, s, i) {
					var r = { stop: !1 };do {
						t = this.parseSubscript(t, e, s, i, r);
					} while (!r.stop);return t;
				}, e.prototype.parseSubscript = function (t, e, s, i, r) {
					if (!i && this.eat(E.doubleColon)) {
						var a = this.startNodeAt(e, s);return a.object = t, a.callee = this.parseNoCallExpr(), r.stop = !0, this.parseSubscripts(this.finishNode(a, "BindExpression"), e, s, i);
					}if (this.match(E.questionDot)) {
						if (this.expectPlugin("optionalChaining"), i && this.lookahead().type == E.parenL) return r.stop = !0, t;this.next();var n = this.startNodeAt(e, s);if (this.eat(E.bracketL)) return n.object = t, n.property = this.parseExpression(), n.computed = !0, n.optional = !0, this.expect(E.bracketR), this.finishNode(n, "MemberExpression");if (this.eat(E.parenL)) {
							var o = this.atPossibleAsync(t);return n.callee = t, n.arguments = this.parseCallExpressionArguments(E.parenR, o), n.optional = !0, this.finishNode(n, "CallExpression");
						}return n.object = t, n.property = this.parseIdentifier(!0), n.computed = !1, n.optional = !0, this.finishNode(n, "MemberExpression");
					}if (this.eat(E.dot)) {
						var h = this.startNodeAt(e, s);return h.object = t, h.property = this.hasPlugin("classPrivateProperties") ? this.parseMaybePrivateName() : this.parseIdentifier(!0), h.computed = !1, this.finishNode(h, "MemberExpression");
					}if (this.eat(E.bracketL)) {
						var p = this.startNodeAt(e, s);return p.object = t, p.property = this.parseExpression(), p.computed = !0, this.expect(E.bracketR), this.finishNode(p, "MemberExpression");
					}if (!i && this.match(E.parenL)) {
						var c = this.atPossibleAsync(t);this.next();var l = this.startNodeAt(e, s);l.callee = t;var u = { start: -1 };return l.arguments = this.parseCallExpressionArguments(E.parenR, c, u), this.finishCallExpression(l), c && this.shouldParseAsyncArrow() ? (r.stop = !0, u.start > -1 && this.raise(u.start, "A trailing comma is not permitted after the rest element"), this.parseAsyncArrowFromCallExpression(this.startNodeAt(e, s), l)) : (this.toReferencedList(l.arguments), l);
					}if (this.match(E.backQuote)) {
						var d = this.startNodeAt(e, s);return d.tag = t, d.quasi = this.parseTemplate(!0), this.finishNode(d, "TaggedTemplateExpression");
					}return r.stop = !0, t;
				}, e.prototype.atPossibleAsync = function (t) {
					return this.state.potentialArrowAt === t.start && "Identifier" === t.type && "async" === t.name && !this.canInsertSemicolon();
				}, e.prototype.finishCallExpression = function (t) {
					if ("Import" === t.callee.type) {
						1 !== t.arguments.length && this.raise(t.start, "import() requires exactly one argument");var e = t.arguments[0];e && "SpreadElement" === e.type && this.raise(e.start, "... is not allowed in import()");
					}return this.finishNode(t, "CallExpression");
				}, e.prototype.parseCallExpressionArguments = function (t, e, s) {
					for (var i = [], r = void 0, a = !0; !this.eat(t);) {
						if (a) a = !1;else if (this.expect(E.comma), this.eat(t)) break;this.match(E.parenL) && !r && (r = this.state.start), i.push(this.parseExprListItem(!1, e ? { start: 0 } : void 0, e ? { start: 0 } : void 0, e ? s : void 0));
					}return e && r && this.shouldParseAsyncArrow() && this.unexpected(), i;
				}, e.prototype.shouldParseAsyncArrow = function () {
					return this.match(E.arrow);
				}, e.prototype.parseAsyncArrowFromCallExpression = function (t, e) {
					return this.expect(E.arrow), this.parseArrowExpression(t, e.arguments, !0);
				}, e.prototype.parseNoCallExpr = function () {
					var t = this.state.start,
					    e = this.state.startLoc;return this.parseSubscripts(this.parseExprAtom(), t, e, !0);
				}, e.prototype.parseExprAtom = function (t) {
					var e = this.state.potentialArrowAt === this.state.start,
					    s = void 0;switch (this.state.type) {case E._super:
							return this.state.inMethod || this.state.inClassProperty || this.options.allowSuperOutsideMethod || this.raise(this.state.start, "'super' outside of function or class"), s = this.startNode(), this.next(), this.match(E.parenL) || this.match(E.bracketL) || this.match(E.dot) || this.unexpected(), this.match(E.parenL) && "constructor" !== this.state.inMethod && !this.options.allowSuperOutsideMethod && this.raise(s.start, "super() is only valid inside a class constructor. Make sure the method name is spelled exactly as 'constructor'."), this.finishNode(s, "Super");case E._import:
							return this.lookahead().type === E.dot ? this.parseImportMetaProperty() : (this.expectPlugin("dynamicImport"), s = this.startNode(), this.next(), this.match(E.parenL) || this.unexpected(null, E.parenL), this.finishNode(s, "Import"));case E._this:
							return s = this.startNode(), this.next(), this.finishNode(s, "ThisExpression");case E._yield:
							this.state.inGenerator && this.unexpected();case E.name:
							s = this.startNode();var i = "await" === this.state.value && this.state.inAsync,
							    r = this.shouldAllowYieldIdentifier(),
							    a = this.parseIdentifier(i || r);if ("await" === a.name) {
								if (this.state.inAsync || this.inModule) return this.parseAwait(s);
							} else {
								if ("async" === a.name && this.match(E._function) && !this.canInsertSemicolon()) return this.next(), this.parseFunction(s, !1, !1, !0);if (e && "async" === a.name && this.match(E.name)) {
									var n = [this.parseIdentifier()];return this.expect(E.arrow), this.parseArrowExpression(s, n, !0);
								}
							}return e && !this.canInsertSemicolon() && this.eat(E.arrow) ? this.parseArrowExpression(s, [a]) : a;case E._do:
							this.expectPlugin("doExpressions");var o = this.startNode();this.next();var h = this.state.inFunction,
							    p = this.state.labels;return this.state.labels = [], this.state.inFunction = !1, o.body = this.parseBlock(!1), this.state.inFunction = h, this.state.labels = p, this.finishNode(o, "DoExpression");case E.regexp:
							var c = this.state.value;return s = this.parseLiteral(c.value, "RegExpLiteral"), s.pattern = c.pattern, s.flags = c.flags, s;case E.num:
							return this.parseLiteral(this.state.value, "NumericLiteral");case E.bigint:
							return this.parseLiteral(this.state.value, "BigIntLiteral");case E.string:
							return this.parseLiteral(this.state.value, "StringLiteral");case E._null:
							return s = this.startNode(), this.next(), this.finishNode(s, "NullLiteral");case E._true:case E._false:
							return this.parseBooleanLiteral();case E.parenL:
							return this.parseParenAndDistinguishExpression(e);case E.bracketL:
							return s = this.startNode(), this.next(), s.elements = this.parseExprList(E.bracketR, !0, t), this.toReferencedList(s.elements), this.finishNode(s, "ArrayExpression");case E.braceL:
							return this.parseObj(!1, t);case E._function:
							return this.parseFunctionExpression();case E.at:
							this.parseDecorators();case E._class:
							return s = this.startNode(), this.takeDecorators(s), this.parseClass(s, !1);case E._new:
							return this.parseNew();case E.backQuote:
							return this.parseTemplate(!1);case E.doubleColon:
							s = this.startNode(), this.next(), s.object = null;var l = s.callee = this.parseNoCallExpr();if ("MemberExpression" === l.type) return this.finishNode(s, "BindExpression");throw this.raise(l.start, "Binding should be performed on object property.");default:
							throw this.unexpected();}
				}, e.prototype.parseBooleanLiteral = function () {
					var t = this.startNode();return t.value = this.match(E._true), this.next(), this.finishNode(t, "BooleanLiteral");
				}, e.prototype.parseMaybePrivateName = function () {
					if (this.eat(E.hash)) {
						var t = this.startNode();return t.id = this.parseIdentifier(!0), this.finishNode(t, "PrivateName");
					}return this.parseIdentifier(!0);
				}, e.prototype.parseFunctionExpression = function () {
					var t = this.startNode(),
					    e = this.parseIdentifier(!0);return this.state.inGenerator && this.eat(E.dot) ? this.parseMetaProperty(t, e, "sent") : this.parseFunction(t, !1);
				}, e.prototype.parseMetaProperty = function (t, e, s) {
					return t.meta = e, "function" === e.name && "sent" === s && (this.isContextual(s) ? this.expectPlugin("functionSent") : this.hasPlugin("functionSent") || this.unexpected()), t.property = this.parseIdentifier(!0), t.property.name !== s && this.raise(t.property.start, "The only valid meta property for " + e.name + " is " + e.name + "." + s), this.finishNode(t, "MetaProperty");
				}, e.prototype.parseImportMetaProperty = function () {
					var t = this.startNode(),
					    e = this.parseIdentifier(!0);return this.expect(E.dot), "import" === e.name && (this.isContextual("meta") ? this.expectPlugin("importMeta") : this.hasPlugin("importMeta") || this.raise(e.start, "Dynamic imports require a parameter: import('a.js').then")), this.inModule || this.raise(e.start, "import.meta may appear only with 'sourceType: \"module\"'"), this.parseMetaProperty(t, e, "meta");
				}, e.prototype.parseLiteral = function (t, e, s, i) {
					s = s || this.state.start, i = i || this.state.startLoc;var r = this.startNodeAt(s, i);return this.addExtra(r, "rawValue", t), this.addExtra(r, "raw", this.input.slice(s, this.state.end)), r.value = t, this.next(), this.finishNode(r, e);
				}, e.prototype.parseParenExpression = function () {
					this.expect(E.parenL);var t = this.parseExpression();return this.expect(E.parenR), t;
				}, e.prototype.parseParenAndDistinguishExpression = function (t) {
					var e = this.state.start,
					    s = this.state.startLoc,
					    i = void 0;this.expect(E.parenL);for (var r = this.state.start, a = this.state.startLoc, n = [], o = { start: 0 }, h = { start: 0 }, p = !0, c = void 0, l = void 0; !this.match(E.parenR);) {
						if (p) p = !1;else if (this.expect(E.comma, h.start || null), this.match(E.parenR)) {
							l = this.state.start;break;
						}if (this.match(E.ellipsis)) {
							var u = this.state.start,
							    d = this.state.startLoc;c = this.state.start, n.push(this.parseParenItem(this.parseRest(), u, d)), this.match(E.comma) && this.lookahead().type === E.parenR && this.raise(this.state.start, "A trailing comma is not permitted after the rest element");break;
						}n.push(this.parseMaybeAssign(!1, o, this.parseParenItem, h));
					}var f = this.state.start,
					    y = this.state.startLoc;this.expect(E.parenR);var m = this.startNodeAt(e, s);if (t && this.shouldParseArrow() && (m = this.parseArrow(m))) {
						for (var x = 0; x < n.length; x++) {
							var v = n[x];v.extra && v.extra.parenthesized && this.unexpected(v.extra.parenStart);
						}return this.parseArrowExpression(m, n);
					}return n.length || this.unexpected(this.state.lastTokStart), l && this.unexpected(l), c && this.unexpected(c), o.start && this.unexpected(o.start), h.start && this.unexpected(h.start), n.length > 1 ? ((i = this.startNodeAt(r, a)).expressions = n, this.toReferencedList(i.expressions), this.finishNodeAt(i, "SequenceExpression", f, y)) : i = n[0], this.addExtra(i, "parenthesized", !0), this.addExtra(i, "parenStart", e), i;
				}, e.prototype.shouldParseArrow = function () {
					return !this.canInsertSemicolon();
				}, e.prototype.parseArrow = function (t) {
					if (this.eat(E.arrow)) return t;
				}, e.prototype.parseParenItem = function (t, e, s) {
					return t;
				}, e.prototype.parseNew = function () {
					var t = this.startNode(),
					    e = this.parseIdentifier(!0);if (this.eat(E.dot)) {
						var s = this.parseMetaProperty(t, e, "target");return this.state.inFunction || this.raise(s.property.start, "new.target can only be used in functions"), s;
					}return t.callee = this.parseNoCallExpr(), this.eat(E.questionDot) && (t.optional = !0), this.parseNewArguments(t), this.finishNode(t, "NewExpression");
				}, e.prototype.parseNewArguments = function (t) {
					if (this.eat(E.parenL)) {
						var e = this.parseExprList(E.parenR);this.toReferencedList(e), t.arguments = e;
					} else t.arguments = [];
				}, e.prototype.parseTemplateElement = function (t) {
					var e = this.startNode();return null === this.state.value && (t ? this.state.invalidTemplateEscapePosition = null : this.raise(this.state.invalidTemplateEscapePosition || 0, "Invalid escape sequence in template")), e.value = { raw: this.input.slice(this.state.start, this.state.end).replace(/\r\n?/g, "\n"), cooked: this.state.value }, this.next(), e.tail = this.match(E.backQuote), this.finishNode(e, "TemplateElement");
				}, e.prototype.parseTemplate = function (t) {
					var e = this.startNode();this.next(), e.expressions = [];var s = this.parseTemplateElement(t);for (e.quasis = [s]; !s.tail;) {
						this.expect(E.dollarBraceL), e.expressions.push(this.parseExpression()), this.expect(E.braceR), e.quasis.push(s = this.parseTemplateElement(t));
					}return this.next(), this.finishNode(e, "TemplateLiteral");
				}, e.prototype.parseObj = function (t, e) {
					var s = [],
					    i = Object.create(null),
					    r = !0,
					    a = this.startNode();a.properties = [], this.next();for (var n = null; !this.eat(E.braceR);) {
						if (r) r = !1;else if (this.expect(E.comma), this.eat(E.braceR)) break;if (this.match(E.at)) if (this.hasPlugin("decorators2")) this.raise(this.state.start, "Stage 2 decorators disallow object literal property decorators");else for (; this.match(E.at);) {
							s.push(this.parseDecorator());
						}var o = this.startNode(),
						    h = !1,
						    p = !1,
						    c = void 0,
						    l = void 0;if (s.length && (o.decorators = s, s = []), this.match(E.ellipsis)) {
							if (this.expectPlugin("objectRestSpread"), o = this.parseSpread(t ? { start: 0 } : void 0), t && this.toAssignable(o, !0, "object pattern"), a.properties.push(o), !t) continue;var u = this.state.start;if (null !== n) this.unexpected(n, "Cannot have multiple rest elements when destructuring");else {
								if (this.eat(E.braceR)) break;if (!this.match(E.comma) || this.lookahead().type !== E.braceR) {
									n = u;continue;
								}this.unexpected(u, "A trailing comma is not permitted after the rest element");
							}
						}if (o.method = !1, (t || e) && (c = this.state.start, l = this.state.startLoc), t || (h = this.eat(E.star)), !t && this.isContextual("async")) {
							h && this.unexpected();var d = this.parseIdentifier();this.match(E.colon) || this.match(E.parenL) || this.match(E.braceR) || this.match(E.eq) || this.match(E.comma) ? (o.key = d, o.computed = !1) : (p = !0, this.match(E.star) && (this.expectPlugin("asyncGenerators"), this.next(), h = !0), this.parsePropertyName(o));
						} else this.parsePropertyName(o);this.parseObjPropValue(o, c, l, h, p, t, e), this.checkPropClash(o, i), o.shorthand && this.addExtra(o, "shorthand", !0), a.properties.push(o);
					}return null !== n && this.unexpected(n, "The rest element has to be the last element when destructuring"), s.length && this.raise(this.state.start, "You have trailing decorators with no property"), this.finishNode(a, t ? "ObjectPattern" : "ObjectExpression");
				}, e.prototype.isGetterOrSetterMethod = function (t, e) {
					return !e && !t.computed && "Identifier" === t.key.type && ("get" === t.key.name || "set" === t.key.name) && (this.match(E.string) || this.match(E.num) || this.match(E.bracketL) || this.match(E.name) || !!this.state.type.keyword);
				}, e.prototype.checkGetterSetterParamCount = function (t) {
					var e = "get" === t.kind ? 0 : 1;if (t.params.length !== e) {
						var s = t.start;"get" === t.kind ? this.raise(s, "getter should have no params") : this.raise(s, "setter should have exactly one param");
					}
				}, e.prototype.parseObjectMethod = function (t, e, s, i) {
					return s || e || this.match(E.parenL) ? (i && this.unexpected(), t.kind = "method", t.method = !0, this.parseMethod(t, e, s, !1, "ObjectMethod")) : this.isGetterOrSetterMethod(t, i) ? ((e || s) && this.unexpected(), t.kind = t.key.name, this.parsePropertyName(t), this.parseMethod(t, !1, !1, !1, "ObjectMethod"), this.checkGetterSetterParamCount(t), t) : void 0;
				}, e.prototype.parseObjectProperty = function (t, e, s, i, r) {
					return t.shorthand = !1, this.eat(E.colon) ? (t.value = i ? this.parseMaybeDefault(this.state.start, this.state.startLoc) : this.parseMaybeAssign(!1, r), this.finishNode(t, "ObjectProperty")) : t.computed || "Identifier" !== t.key.type ? void 0 : (this.checkReservedWord(t.key.name, t.key.start, !0, !0), i ? t.value = this.parseMaybeDefault(e, s, t.key.__clone()) : this.match(E.eq) && r ? (r.start || (r.start = this.state.start), t.value = this.parseMaybeDefault(e, s, t.key.__clone())) : t.value = t.key.__clone(), t.shorthand = !0, this.finishNode(t, "ObjectProperty"));
				}, e.prototype.parseObjPropValue = function (t, e, s, i, r, a, n) {
					var o = this.parseObjectMethod(t, i, r, a) || this.parseObjectProperty(t, e, s, a, n);return o || this.unexpected(), o;
				}, e.prototype.parsePropertyName = function (t) {
					if (this.eat(E.bracketL)) t.computed = !0, t.key = this.parseMaybeAssign(), this.expect(E.bracketR);else {
						var e = this.state.inPropertyName;this.state.inPropertyName = !0, t.key = this.match(E.num) || this.match(E.string) ? this.parseExprAtom() : this.parseMaybePrivateName(), "PrivateName" !== t.key.type && (t.computed = !1), this.state.inPropertyName = e;
					}return t.key;
				}, e.prototype.initFunction = function (t, e) {
					t.id = null, t.generator = !1, t.expression = !1, t.async = !!e;
				}, e.prototype.parseMethod = function (t, e, s, i, r) {
					var a = this.state.inMethod;this.state.inMethod = t.kind || !0, this.initFunction(t, s), this.expect(E.parenL);var n = i;return t.params = this.parseBindingList(E.parenR, !1, n), t.generator = !!e, this.parseFunctionBodyAndFinish(t, r), this.state.inMethod = a, t;
				}, e.prototype.parseArrowExpression = function (t, e, s) {
					return this.initFunction(t, s), t.params = this.toAssignableList(e, !0, "arrow function parameters"), this.parseFunctionBody(t, !0), this.finishNode(t, "ArrowFunctionExpression");
				}, e.prototype.isStrictBody = function (t, e) {
					if (!e && t.body.directives.length) for (var s = t.body.directives, i = Array.isArray(s), r = 0, s = i ? s : s[Symbol.iterator]();;) {
						var a;if (i) {
							if (r >= s.length) break;a = s[r++];
						} else {
							if ((r = s.next()).done) break;a = r.value;
						}if ("use strict" === a.value.value) return !0;
					}return !1;
				}, e.prototype.parseFunctionBodyAndFinish = function (t, e, s) {
					this.parseFunctionBody(t, s), this.finishNode(t, e);
				}, e.prototype.parseFunctionBody = function (t, e) {
					var s = e && !this.match(E.braceL),
					    i = this.state.inAsync;if (this.state.inAsync = t.async, s) t.body = this.parseMaybeAssign(), t.expression = !0;else {
						var r = this.state.inFunction,
						    a = this.state.inGenerator,
						    n = this.state.labels;this.state.inFunction = !0, this.state.inGenerator = t.generator, this.state.labels = [], t.body = this.parseBlock(!0), t.expression = !1, this.state.inFunction = r, this.state.inGenerator = a, this.state.labels = n;
					}this.state.inAsync = i;var o = this.isStrictBody(t, s),
					    h = this.state.strict || e || o;if (o && t.id && "Identifier" === t.id.type && "yield" === t.id.name && this.raise(t.id.start, "Binding yield in strict mode"), h) {
						var p = Object.create(null),
						    c = this.state.strict;o && (this.state.strict = !0), t.id && this.checkLVal(t.id, !0, void 0, "function name");for (var l = t.params, u = Array.isArray(l), d = 0, l = u ? l : l[Symbol.iterator]();;) {
							var f;if (u) {
								if (d >= l.length) break;f = l[d++];
							} else {
								if ((d = l.next()).done) break;f = d.value;
							}var y = f;o && "Identifier" !== y.type && this.raise(y.start, "Non-simple parameter in strict mode"), this.checkLVal(y, !0, p, "function parameter list");
						}this.state.strict = c;
					}
				}, e.prototype.parseExprList = function (t, e, s) {
					for (var i = [], r = !0; !this.eat(t);) {
						if (r) r = !1;else if (this.expect(E.comma), this.eat(t)) break;i.push(this.parseExprListItem(e, s));
					}return i;
				}, e.prototype.parseExprListItem = function (t, e, s, i) {
					var r = void 0;return t && this.match(E.comma) ? r = null : this.match(E.ellipsis) ? (r = this.parseSpread(e), i && this.match(E.comma) && (i.start = this.state.start)) : r = this.parseMaybeAssign(!1, e, this.parseParenItem, s), r;
				}, e.prototype.parseIdentifier = function (t) {
					var e = this.startNode(),
					    s = this.parseIdentifierName(e.start, t);return e.name = s, e.loc.identifierName = s, this.finishNode(e, "Identifier");
				}, e.prototype.parseIdentifierName = function (t, e) {
					e || this.checkReservedWord(this.state.value, this.state.start, !!this.state.type.keyword, !1);var s = void 0;if (this.match(E.name)) s = this.state.value;else {
						if (!this.state.type.keyword) throw this.unexpected();s = this.state.type.keyword;
					}return !e && "await" === s && this.state.inAsync && this.raise(t, "invalid use of await inside of an async function"), this.next(), s;
				}, e.prototype.checkReservedWord = function (t, e, s, i) {
					(this.isReservedWord(t) || s && this.isKeyword(t)) && this.raise(e, t + " is a reserved word"), this.state.strict && (L.strict(t) || i && L.strictBind(t)) && this.raise(e, t + " is a reserved word in strict mode");
				}, e.prototype.parseAwait = function (t) {
					return this.state.inAsync || this.unexpected(), this.match(E.star) && this.raise(t.start, "await* has been removed from the async functions proposal. Use Promise.all() instead."), t.argument = this.parseMaybeUnary(), this.finishNode(t, "AwaitExpression");
				}, e.prototype.parseYield = function () {
					var t = this.startNode();return this.next(), this.match(E.semi) || this.canInsertSemicolon() || !this.match(E.star) && !this.state.type.startsExpr ? (t.delegate = !1, t.argument = null) : (t.delegate = this.eat(E.star), t.argument = this.parseMaybeAssign()), this.finishNode(t, "YieldExpression");
				}, e;
			}(function (t) {
				function e() {
					return t.apply(this, arguments) || this;
				}return A(e, t), e.prototype.toAssignable = function (t, e, s) {
					if (t) switch (t.type) {case "Identifier":case "ObjectPattern":case "ArrayPattern":case "AssignmentPattern":
							break;case "ObjectExpression":
							t.type = "ObjectPattern";for (var i = t.properties.entries(), r = Array.isArray(i), a = 0, i = r ? i : i[Symbol.iterator]();;) {
								var n;if (r) {
									if (a >= i.length) break;n = i[a++];
								} else {
									if ((a = i.next()).done) break;n = a.value;
								}var o = n,
								    h = o[0],
								    p = o[1];this.toAssignableObjectExpressionProp(p, e, h === t.properties.length - 1);
							}break;case "ObjectProperty":
							this.toAssignable(t.value, e, s);break;case "SpreadElement":
							this.checkToRestConversion(t), t.type = "RestElement";var c = t.argument;this.toAssignable(c, e, s);break;case "ArrayExpression":
							t.type = "ArrayPattern", this.toAssignableList(t.elements, e, s);break;case "AssignmentExpression":
							"=" === t.operator ? (t.type = "AssignmentPattern", delete t.operator) : this.raise(t.left.end, "Only '=' operator can be used for specifying default value.");break;case "MemberExpression":
							if (!e) break;default:
							var l = "Invalid left-hand side" + (s ? " in " + s : "expression");this.raise(t.start, l);}return t;
				}, e.prototype.toAssignableObjectExpressionProp = function (t, e, s) {
					if ("ObjectMethod" === t.type) {
						var i = "get" === t.kind || "set" === t.kind ? "Object pattern can't contain getter or setter" : "Object pattern can't contain methods";this.raise(t.key.start, i);
					} else "SpreadElement" !== t.type || s ? this.toAssignable(t, e, "object destructuring pattern") : this.raise(t.start, "The rest element has to be the last element when destructuring");
				}, e.prototype.toAssignableList = function (t, e, s) {
					var i = t.length;if (i) {
						var r = t[i - 1];if (r && "RestElement" === r.type) --i;else if (r && "SpreadElement" === r.type) {
							r.type = "RestElement";var a = r.argument;this.toAssignable(a, e, s), "Identifier" !== a.type && "MemberExpression" !== a.type && "ArrayPattern" !== a.type && this.unexpected(a.start), --i;
						}
					}for (var n = 0; n < i; n++) {
						var o = t[n];o && "SpreadElement" === o.type && this.raise(o.start, "The rest element has to be the last element when destructuring"), o && this.toAssignable(o, e, s);
					}return t;
				}, e.prototype.toReferencedList = function (t) {
					return t;
				}, e.prototype.parseSpread = function (t) {
					var e = this.startNode();return this.next(), e.argument = this.parseMaybeAssign(!1, t), this.finishNode(e, "SpreadElement");
				}, e.prototype.parseRest = function () {
					var t = this.startNode();return this.next(), t.argument = this.parseBindingAtom(), this.finishNode(t, "RestElement");
				}, e.prototype.shouldAllowYieldIdentifier = function () {
					return this.match(E._yield) && !this.state.strict && !this.state.inGenerator;
				}, e.prototype.parseBindingIdentifier = function () {
					return this.parseIdentifier(this.shouldAllowYieldIdentifier());
				}, e.prototype.parseBindingAtom = function () {
					switch (this.state.type) {case E._yield:case E.name:
							return this.parseBindingIdentifier();case E.bracketL:
							var t = this.startNode();return this.next(), t.elements = this.parseBindingList(E.bracketR, !0), this.finishNode(t, "ArrayPattern");case E.braceL:
							return this.parseObj(!0);default:
							throw this.unexpected();}
				}, e.prototype.parseBindingList = function (t, e, s) {
					for (var i = [], r = !0; !this.eat(t);) {
						if (r ? r = !1 : this.expect(E.comma), e && this.match(E.comma)) i.push(null);else {
							if (this.eat(t)) break;if (this.match(E.ellipsis)) {
								i.push(this.parseAssignableListItemTypes(this.parseRest())), this.expect(t);break;
							}var a = [];for (this.match(E.at) && this.hasPlugin("decorators2") && this.raise(this.state.start, "Stage 2 decorators cannot be used to decorate parameters"); this.match(E.at);) {
								a.push(this.parseDecorator());
							}i.push(this.parseAssignableListItem(s, a));
						}
					}return i;
				}, e.prototype.parseAssignableListItem = function (t, e) {
					var s = this.parseMaybeDefault();this.parseAssignableListItemTypes(s);var i = this.parseMaybeDefault(s.start, s.loc.start, s);return e.length && (s.decorators = e), i;
				}, e.prototype.parseAssignableListItemTypes = function (t) {
					return t;
				}, e.prototype.parseMaybeDefault = function (t, e, s) {
					if (e = e || this.state.startLoc, t = t || this.state.start, s = s || this.parseBindingAtom(), !this.eat(E.eq)) return s;var i = this.startNodeAt(t, e);return i.left = s, i.right = this.parseMaybeAssign(), this.finishNode(i, "AssignmentPattern");
				}, e.prototype.checkLVal = function (t, e, s, i) {
					switch (t.type) {case "Identifier":
							if (this.checkReservedWord(t.name, t.start, !1, !0), s) {
								var r = "_" + t.name;s[r] ? this.raise(t.start, "Argument name clash in strict mode") : s[r] = !0;
							}break;case "MemberExpression":
							e && this.raise(t.start, "Binding member expression");break;case "ObjectPattern":
							for (var a = t.properties, n = Array.isArray(a), o = 0, a = n ? a : a[Symbol.iterator]();;) {
								var h;if (n) {
									if (o >= a.length) break;h = a[o++];
								} else {
									if ((o = a.next()).done) break;h = o.value;
								}var p = h;"ObjectProperty" === p.type && (p = p.value), this.checkLVal(p, e, s, "object destructuring pattern");
							}break;case "ArrayPattern":
							for (var c = t.elements, l = Array.isArray(c), u = 0, c = l ? c : c[Symbol.iterator]();;) {
								var d;if (l) {
									if (u >= c.length) break;d = c[u++];
								} else {
									if ((u = c.next()).done) break;d = u.value;
								}var f = d;f && this.checkLVal(f, e, s, "array destructuring pattern");
							}break;case "AssignmentPattern":
							this.checkLVal(t.left, e, s, "assignment pattern");break;case "RestElement":
							this.checkLVal(t.argument, e, s, "rest element");break;default:
							var y = (e ? "Binding invalid" : "Invalid") + " left-hand side" + (i ? " in " + i : "expression");this.raise(t.start, y);}
				}, e.prototype.checkToRestConversion = function (t) {
					-1 === ["Identifier", "MemberExpression"].indexOf(t.argument.type) && this.raise(t.argument.start, "Invalid rest operator's argument");
				}, e;
			}(function (t) {
				function e() {
					return t.apply(this, arguments) || this;
				}return A(e, t), e.prototype.startNode = function () {
					return new Y(this, this.state.start, this.state.startLoc);
				}, e.prototype.startNodeAt = function (t, e) {
					return new Y(this, t, e);
				}, e.prototype.startNodeAtNode = function (t) {
					return this.startNodeAt(t.start, t.loc.start);
				}, e.prototype.finishNode = function (t, e) {
					return this.finishNodeAt(t, e, this.state.lastTokEnd, this.state.lastTokEndLoc);
				}, e.prototype.finishNodeAt = function (t, e, s, i) {
					return t.type = e, t.end = s, t.loc.end = i, this.options.ranges && (t.range[1] = s), this.processComment(t), t;
				}, e.prototype.resetStartLocationFromNode = function (t, e) {
					t.start = e.start, t.loc.start = e.loc.start, this.options.ranges && (t.range[0] = e.range[0]);
				}, e;
			}(z))))),
			    it = function it(t) {
				return function (t) {
					function e() {
						return t.apply(this, arguments) || this;
					}return A(e, t), e.prototype.estreeParseRegExpLiteral = function (t) {
						var e = t.pattern,
						    s = t.flags,
						    i = null;try {
							i = new RegExp(e, s);
						} catch (t) {}var r = this.estreeParseLiteral(i);return r.regex = { pattern: e, flags: s }, r;
					}, e.prototype.estreeParseLiteral = function (t) {
						return this.parseLiteral(t, "Literal");
					}, e.prototype.directiveToStmt = function (t) {
						var e = t.value,
						    s = this.startNodeAt(t.start, t.loc.start),
						    i = this.startNodeAt(e.start, e.loc.start);return i.value = e.value, i.raw = e.extra.raw, s.expression = this.finishNodeAt(i, "Literal", e.end, e.loc.end), s.directive = e.extra.raw.slice(1, -1), this.finishNodeAt(s, "ExpressionStatement", t.end, t.loc.end);
					}, e.prototype.checkDeclaration = function (e) {
						u(e) ? this.checkDeclaration(e.value) : t.prototype.checkDeclaration.call(this, e);
					}, e.prototype.checkGetterSetterParamCount = function (t) {
						var e = "get" === t.kind ? 0 : 1;if (t.value.params.length !== e) {
							var s = t.start;"get" === t.kind ? this.raise(s, "getter should have no params") : this.raise(s, "setter should have exactly one param");
						}
					}, e.prototype.checkLVal = function (e, s, i, r) {
						var a = this;switch (e.type) {case "ObjectPattern":
								e.properties.forEach(function (t) {
									a.checkLVal("Property" === t.type ? t.value : t, s, i, "object destructuring pattern");
								});break;default:
								t.prototype.checkLVal.call(this, e, s, i, r);}
					}, e.prototype.checkPropClash = function (t, e) {
						if (!t.computed && u(t)) {
							var s = t.key;"__proto__" === ("Identifier" === s.type ? s.name : String(s.value)) && (e.proto && this.raise(s.start, "Redefinition of __proto__ property"), e.proto = !0);
						}
					}, e.prototype.isStrictBody = function (t, e) {
						if (!e && t.body.body.length > 0) for (var s = t.body.body, i = Array.isArray(s), r = 0, s = i ? s : s[Symbol.iterator]();;) {
							var a;if (i) {
								if (r >= s.length) break;a = s[r++];
							} else {
								if ((r = s.next()).done) break;a = r.value;
							}var n = a;if ("ExpressionStatement" !== n.type || "Literal" !== n.expression.type) break;if ("use strict" === n.expression.value) return !0;
						}return !1;
					}, e.prototype.isValidDirective = function (t) {
						return !("ExpressionStatement" !== t.type || "Literal" !== t.expression.type || "string" != typeof t.expression.value || t.expression.extra && t.expression.extra.parenthesized);
					}, e.prototype.stmtToDirective = function (e) {
						var s = t.prototype.stmtToDirective.call(this, e),
						    i = e.expression.value;return s.value.value = i, s;
					}, e.prototype.parseBlockBody = function (e, s, i, r) {
						var a = this;t.prototype.parseBlockBody.call(this, e, s, i, r);var n = e.directives.map(function (t) {
							return a.directiveToStmt(t);
						});e.body = n.concat(e.body), delete e.directives;
					}, e.prototype.pushClassMethod = function (t, e, s, i, r) {
						this.parseMethod(e, s, i, r, "MethodDefinition"), e.typeParameters && (e.value.typeParameters = e.typeParameters, delete e.typeParameters), t.body.push(e);
					}, e.prototype.parseExprAtom = function (e) {
						switch (this.state.type) {case E.regexp:
								return this.estreeParseRegExpLiteral(this.state.value);case E.num:case E.string:
								return this.estreeParseLiteral(this.state.value);case E._null:
								return this.estreeParseLiteral(null);case E._true:
								return this.estreeParseLiteral(!0);case E._false:
								return this.estreeParseLiteral(!1);default:
								return t.prototype.parseExprAtom.call(this, e);}
					}, e.prototype.parseLiteral = function (e, s, i, r) {
						var a = t.prototype.parseLiteral.call(this, e, s, i, r);return a.raw = a.extra.raw, delete a.extra, a;
					}, e.prototype.parseMethod = function (e, s, i, r, a) {
						var n = this.startNode();return n.kind = e.kind, n = t.prototype.parseMethod.call(this, n, s, i, r, "FunctionExpression"), delete n.kind, e.value = n, this.finishNode(e, a);
					}, e.prototype.parseObjectMethod = function (e, s, i, r) {
						var a = t.prototype.parseObjectMethod.call(this, e, s, i, r);return a && (a.type = "Property", "method" === a.kind && (a.kind = "init"), a.shorthand = !1), a;
					}, e.prototype.parseObjectProperty = function (e, s, i, r, a) {
						var n = t.prototype.parseObjectProperty.call(this, e, s, i, r, a);return n && (n.kind = "init", n.type = "Property"), n;
					}, e.prototype.toAssignable = function (e, s, i) {
						return u(e) ? (this.toAssignable(e.value, s, i), e) : t.prototype.toAssignable.call(this, e, s, i);
					}, e.prototype.toAssignableObjectExpressionProp = function (e, s, i) {
						"get" === e.kind || "set" === e.kind ? this.raise(e.key.start, "Object pattern can't contain getter or setter") : e.method ? this.raise(e.key.start, "Object pattern can't contain methods") : t.prototype.toAssignableObjectExpressionProp.call(this, e, s, i);
					}, e;
				}(t);
			},
			    rt = ["any", "mixed", "empty", "bool", "boolean", "number", "string", "void", "null"],
			    at = { const: "declare export var", let: "declare export var", type: "export type", interface: "export interface" },
			    nt = function nt(t) {
				return function (t) {
					function e() {
						return t.apply(this, arguments) || this;
					}return A(e, t), e.prototype.flowParseTypeInitialiser = function (t) {
						var e = this.state.inType;this.state.inType = !0, this.expect(t || E.colon);var s = this.flowParseType();return this.state.inType = e, s;
					}, e.prototype.flowParsePredicate = function () {
						var t = this.startNode(),
						    e = this.state.startLoc,
						    s = this.state.start;this.expect(E.modulo);var i = this.state.startLoc;return this.expectContextual("checks"), e.line === i.line && e.column === i.column - 1 || this.raise(s, "Spaces between ´%´ and ´checks´ are not allowed here."), this.eat(E.parenL) ? (t.value = this.parseExpression(), this.expect(E.parenR), this.finishNode(t, "DeclaredPredicate")) : this.finishNode(t, "InferredPredicate");
					}, e.prototype.flowParseTypeAndPredicateInitialiser = function () {
						var t = this.state.inType;this.state.inType = !0, this.expect(E.colon);var e = null,
						    s = null;return this.match(E.modulo) ? (this.state.inType = t, s = this.flowParsePredicate()) : (e = this.flowParseType(), this.state.inType = t, this.match(E.modulo) && (s = this.flowParsePredicate())), [e, s];
					}, e.prototype.flowParseDeclareClass = function (t) {
						return this.next(), this.flowParseInterfaceish(t), this.finishNode(t, "DeclareClass");
					}, e.prototype.flowParseDeclareFunction = function (t) {
						this.next();var e = t.id = this.parseIdentifier(),
						    s = this.startNode(),
						    i = this.startNode();this.isRelational("<") ? s.typeParameters = this.flowParseTypeParameterDeclaration() : s.typeParameters = null, this.expect(E.parenL);var r = this.flowParseFunctionTypeParams();s.params = r.params, s.rest = r.rest, this.expect(E.parenR);var a = this.flowParseTypeAndPredicateInitialiser();return s.returnType = a[0], t.predicate = a[1], i.typeAnnotation = this.finishNode(s, "FunctionTypeAnnotation"), e.typeAnnotation = this.finishNode(i, "TypeAnnotation"), this.finishNode(e, e.type), this.semicolon(), this.finishNode(t, "DeclareFunction");
					}, e.prototype.flowParseDeclare = function (t, e) {
						if (this.match(E._class)) return this.flowParseDeclareClass(t);if (this.match(E._function)) return this.flowParseDeclareFunction(t);if (this.match(E._var)) return this.flowParseDeclareVariable(t);if (this.isContextual("module")) return this.lookahead().type === E.dot ? this.flowParseDeclareModuleExports(t) : (e && this.unexpected(null, "`declare module` cannot be used inside another `declare module`"), this.flowParseDeclareModule(t));if (this.isContextual("type")) return this.flowParseDeclareTypeAlias(t);if (this.isContextual("opaque")) return this.flowParseDeclareOpaqueType(t);if (this.isContextual("interface")) return this.flowParseDeclareInterface(t);if (this.match(E._export)) return this.flowParseDeclareExportDeclaration(t, e);throw this.unexpected();
					}, e.prototype.flowParseDeclareVariable = function (t) {
						return this.next(), t.id = this.flowParseTypeAnnotatableIdentifier(!0), this.semicolon(), this.finishNode(t, "DeclareVariable");
					}, e.prototype.flowParseDeclareModule = function (t) {
						var e = this;this.next(), this.match(E.string) ? t.id = this.parseExprAtom() : t.id = this.parseIdentifier();var s = t.body = this.startNode(),
						    i = s.body = [];for (this.expect(E.braceL); !this.match(E.braceR);) {
							var r = this.startNode();if (this.match(E._import)) {
								var a = this.lookahead();"type" !== a.value && "typeof" !== a.value && this.unexpected(null, "Imports within a `declare module` body must always be `import type` or `import typeof`"), this.next(), this.parseImport(r);
							} else this.expectContextual("declare", "Only declares and type imports are allowed inside declare module"), r = this.flowParseDeclare(r, !0);i.push(r);
						}this.expect(E.braceR), this.finishNode(s, "BlockStatement");var n = null,
						    o = !1,
						    h = "Found both `declare module.exports` and `declare export` in the same module. Modules can only have 1 since they are either an ES module or they are a CommonJS module";return i.forEach(function (t) {
							d(t) ? ("CommonJS" === n && e.unexpected(t.start, h), n = "ES") : "DeclareModuleExports" === t.type && (o && e.unexpected(t.start, "Duplicate `declare module.exports` statement"), "ES" === n && e.unexpected(t.start, h), n = "CommonJS", o = !0);
						}), t.kind = n || "CommonJS", this.finishNode(t, "DeclareModule");
					}, e.prototype.flowParseDeclareExportDeclaration = function (t, e) {
						if (this.expect(E._export), this.eat(E._default)) return this.match(E._function) || this.match(E._class) ? t.declaration = this.flowParseDeclare(this.startNode()) : (t.declaration = this.flowParseType(), this.semicolon()), t.default = !0, this.finishNode(t, "DeclareExportDeclaration");if (this.match(E._const) || this.match(E._let) || (this.isContextual("type") || this.isContextual("interface")) && !e) {
							var s = this.state.value,
							    i = at[s];this.unexpected(this.state.start, "`declare export " + s + "` is not supported. Use `" + i + "` instead");
						}if (this.match(E._var) || this.match(E._function) || this.match(E._class) || this.isContextual("opaque")) return t.declaration = this.flowParseDeclare(this.startNode()), t.default = !1, this.finishNode(t, "DeclareExportDeclaration");if (this.match(E.star) || this.match(E.braceL) || this.isContextual("interface") || this.isContextual("type") || this.isContextual("opaque")) return "ExportNamedDeclaration" === (t = this.parseExport(t)).type && (t.type = "ExportDeclaration", t.default = !1, delete t.exportKind), t.type = "Declare" + t.type, t;throw this.unexpected();
					}, e.prototype.flowParseDeclareModuleExports = function (t) {
						return this.expectContextual("module"), this.expect(E.dot), this.expectContextual("exports"), t.typeAnnotation = this.flowParseTypeAnnotation(), this.semicolon(), this.finishNode(t, "DeclareModuleExports");
					}, e.prototype.flowParseDeclareTypeAlias = function (t) {
						return this.next(), this.flowParseTypeAlias(t), this.finishNode(t, "DeclareTypeAlias");
					}, e.prototype.flowParseDeclareOpaqueType = function (t) {
						return this.next(), this.flowParseOpaqueType(t, !0), this.finishNode(t, "DeclareOpaqueType");
					}, e.prototype.flowParseDeclareInterface = function (t) {
						return this.next(), this.flowParseInterfaceish(t), this.finishNode(t, "DeclareInterface");
					}, e.prototype.flowParseInterfaceish = function (t) {
						if (t.id = this.parseIdentifier(), this.isRelational("<") ? t.typeParameters = this.flowParseTypeParameterDeclaration() : t.typeParameters = null, t.extends = [], t.mixins = [], this.eat(E._extends)) do {
							t.extends.push(this.flowParseInterfaceExtends());
						} while (this.eat(E.comma));if (this.isContextual("mixins")) {
							this.next();do {
								t.mixins.push(this.flowParseInterfaceExtends());
							} while (this.eat(E.comma));
						}t.body = this.flowParseObjectType(!0, !1, !1);
					}, e.prototype.flowParseInterfaceExtends = function () {
						var t = this.startNode();return t.id = this.flowParseQualifiedTypeIdentifier(), this.isRelational("<") ? t.typeParameters = this.flowParseTypeParameterInstantiation() : t.typeParameters = null, this.finishNode(t, "InterfaceExtends");
					}, e.prototype.flowParseInterface = function (t) {
						return this.flowParseInterfaceish(t), this.finishNode(t, "InterfaceDeclaration");
					}, e.prototype.flowParseRestrictedIdentifier = function (t) {
						return rt.indexOf(this.state.value) > -1 && this.raise(this.state.start, "Cannot overwrite primitive type " + this.state.value), this.parseIdentifier(t);
					}, e.prototype.flowParseTypeAlias = function (t) {
						return t.id = this.flowParseRestrictedIdentifier(), this.isRelational("<") ? t.typeParameters = this.flowParseTypeParameterDeclaration() : t.typeParameters = null, t.right = this.flowParseTypeInitialiser(E.eq), this.semicolon(), this.finishNode(t, "TypeAlias");
					}, e.prototype.flowParseOpaqueType = function (t, e) {
						return this.expectContextual("type"), t.id = this.flowParseRestrictedIdentifier(), this.isRelational("<") ? t.typeParameters = this.flowParseTypeParameterDeclaration() : t.typeParameters = null, t.supertype = null, this.match(E.colon) && (t.supertype = this.flowParseTypeInitialiser(E.colon)), t.impltype = null, e || (t.impltype = this.flowParseTypeInitialiser(E.eq)), this.semicolon(), this.finishNode(t, "OpaqueType");
					}, e.prototype.flowParseTypeParameter = function () {
						var t = this.startNode(),
						    e = this.flowParseVariance(),
						    s = this.flowParseTypeAnnotatableIdentifier();return t.name = s.name, t.variance = e, t.bound = s.typeAnnotation, this.match(E.eq) && (this.eat(E.eq), t.default = this.flowParseType()), this.finishNode(t, "TypeParameter");
					}, e.prototype.flowParseTypeParameterDeclaration = function () {
						var t = this.state.inType,
						    e = this.startNode();e.params = [], this.state.inType = !0, this.isRelational("<") || this.match(E.jsxTagStart) ? this.next() : this.unexpected();do {
							e.params.push(this.flowParseTypeParameter()), this.isRelational(">") || this.expect(E.comma);
						} while (!this.isRelational(">"));return this.expectRelational(">"), this.state.inType = t, this.finishNode(e, "TypeParameterDeclaration");
					}, e.prototype.flowParseTypeParameterInstantiation = function () {
						var t = this.startNode(),
						    e = this.state.inType;for (t.params = [], this.state.inType = !0, this.expectRelational("<"); !this.isRelational(">");) {
							t.params.push(this.flowParseType()), this.isRelational(">") || this.expect(E.comma);
						}return this.expectRelational(">"), this.state.inType = e, this.finishNode(t, "TypeParameterInstantiation");
					}, e.prototype.flowParseObjectPropertyKey = function () {
						return this.match(E.num) || this.match(E.string) ? this.parseExprAtom() : this.parseIdentifier(!0);
					}, e.prototype.flowParseObjectTypeIndexer = function (t, e, s) {
						return t.static = e, this.expect(E.bracketL), this.lookahead().type === E.colon ? (t.id = this.flowParseObjectPropertyKey(), t.key = this.flowParseTypeInitialiser()) : (t.id = null, t.key = this.flowParseType()), this.expect(E.bracketR), t.value = this.flowParseTypeInitialiser(), t.variance = s, this.finishNode(t, "ObjectTypeIndexer");
					}, e.prototype.flowParseObjectTypeMethodish = function (t) {
						for (t.params = [], t.rest = null, t.typeParameters = null, this.isRelational("<") && (t.typeParameters = this.flowParseTypeParameterDeclaration()), this.expect(E.parenL); !this.match(E.parenR) && !this.match(E.ellipsis);) {
							t.params.push(this.flowParseFunctionTypeParam()), this.match(E.parenR) || this.expect(E.comma);
						}return this.eat(E.ellipsis) && (t.rest = this.flowParseFunctionTypeParam()), this.expect(E.parenR), t.returnType = this.flowParseTypeInitialiser(), this.finishNode(t, "FunctionTypeAnnotation");
					}, e.prototype.flowParseObjectTypeCallProperty = function (t, e) {
						var s = this.startNode();return t.static = e, t.value = this.flowParseObjectTypeMethodish(s), this.finishNode(t, "ObjectTypeCallProperty");
					}, e.prototype.flowParseObjectType = function (t, e, s) {
						var i = this.state.inType;this.state.inType = !0;var r = this.startNode();r.callProperties = [], r.properties = [], r.indexers = [];var a = void 0,
						    n = void 0;for (e && this.match(E.braceBarL) ? (this.expect(E.braceBarL), a = E.braceBarR, n = !0) : (this.expect(E.braceL), a = E.braceR, n = !1), r.exact = n; !this.match(a);) {
							var o = !1,
							    h = this.startNode();t && this.isContextual("static") && this.lookahead().type !== E.colon && (this.next(), o = !0);var p = this.flowParseVariance();if (this.match(E.bracketL)) r.indexers.push(this.flowParseObjectTypeIndexer(h, o, p));else if (this.match(E.parenL) || this.isRelational("<")) p && this.unexpected(p.start), r.callProperties.push(this.flowParseObjectTypeCallProperty(h, o));else {
								var c = "init";if (this.isContextual("get") || this.isContextual("set")) {
									var l = this.lookahead();l.type !== E.name && l.type !== E.string && l.type !== E.num || (c = this.state.value, this.next());
								}r.properties.push(this.flowParseObjectTypeProperty(h, o, p, c, s));
							}this.flowObjectTypeSemicolon();
						}this.expect(a);var u = this.finishNode(r, "ObjectTypeAnnotation");return this.state.inType = i, u;
					}, e.prototype.flowParseObjectTypeProperty = function (t, e, s, i, r) {
						if (this.match(E.ellipsis)) return r || this.unexpected(null, "Spread operator cannot appear in class or interface definitions"), s && this.unexpected(s.start, "Spread properties cannot have variance"), this.expect(E.ellipsis), t.argument = this.flowParseType(), this.finishNode(t, "ObjectTypeSpreadProperty");t.key = this.flowParseObjectPropertyKey(), t.static = e, t.kind = i;var a = !1;return this.isRelational("<") || this.match(E.parenL) ? (s && this.unexpected(s.start), t.value = this.flowParseObjectTypeMethodish(this.startNodeAt(t.start, t.loc.start)), "get" !== i && "set" !== i || this.flowCheckGetterSetterParamCount(t)) : ("init" !== i && this.unexpected(), this.eat(E.question) && (a = !0), t.value = this.flowParseTypeInitialiser(), t.variance = s), t.optional = a, this.finishNode(t, "ObjectTypeProperty");
					}, e.prototype.flowCheckGetterSetterParamCount = function (t) {
						var e = "get" === t.kind ? 0 : 1;if (t.value.params.length !== e) {
							var s = t.start;"get" === t.kind ? this.raise(s, "getter should have no params") : this.raise(s, "setter should have exactly one param");
						}
					}, e.prototype.flowObjectTypeSemicolon = function () {
						this.eat(E.semi) || this.eat(E.comma) || this.match(E.braceR) || this.match(E.braceBarR) || this.unexpected();
					}, e.prototype.flowParseQualifiedTypeIdentifier = function (t, e, s) {
						t = t || this.state.start, e = e || this.state.startLoc;for (var i = s || this.parseIdentifier(); this.eat(E.dot);) {
							var r = this.startNodeAt(t, e);r.qualification = i, r.id = this.parseIdentifier(), i = this.finishNode(r, "QualifiedTypeIdentifier");
						}return i;
					}, e.prototype.flowParseGenericType = function (t, e, s) {
						var i = this.startNodeAt(t, e);return i.typeParameters = null, i.id = this.flowParseQualifiedTypeIdentifier(t, e, s), this.isRelational("<") && (i.typeParameters = this.flowParseTypeParameterInstantiation()), this.finishNode(i, "GenericTypeAnnotation");
					}, e.prototype.flowParseTypeofType = function () {
						var t = this.startNode();return this.expect(E._typeof), t.argument = this.flowParsePrimaryType(), this.finishNode(t, "TypeofTypeAnnotation");
					}, e.prototype.flowParseTupleType = function () {
						var t = this.startNode();for (t.types = [], this.expect(E.bracketL); this.state.pos < this.input.length && !this.match(E.bracketR) && (t.types.push(this.flowParseType()), !this.match(E.bracketR));) {
							this.expect(E.comma);
						}return this.expect(E.bracketR), this.finishNode(t, "TupleTypeAnnotation");
					}, e.prototype.flowParseFunctionTypeParam = function () {
						var t = null,
						    e = !1,
						    s = null,
						    i = this.startNode(),
						    r = this.lookahead();return r.type === E.colon || r.type === E.question ? (t = this.parseIdentifier(), this.eat(E.question) && (e = !0), s = this.flowParseTypeInitialiser()) : s = this.flowParseType(), i.name = t, i.optional = e, i.typeAnnotation = s, this.finishNode(i, "FunctionTypeParam");
					}, e.prototype.reinterpretTypeAsFunctionTypeParam = function (t) {
						var e = this.startNodeAt(t.start, t.loc.start);return e.name = null, e.optional = !1, e.typeAnnotation = t, this.finishNode(e, "FunctionTypeParam");
					}, e.prototype.flowParseFunctionTypeParams = function (t) {
						void 0 === t && (t = []);for (var e = null; !this.match(E.parenR) && !this.match(E.ellipsis);) {
							t.push(this.flowParseFunctionTypeParam()), this.match(E.parenR) || this.expect(E.comma);
						}return this.eat(E.ellipsis) && (e = this.flowParseFunctionTypeParam()), { params: t, rest: e };
					}, e.prototype.flowIdentToTypeAnnotation = function (t, e, s, i) {
						switch (i.name) {case "any":
								return this.finishNode(s, "AnyTypeAnnotation");case "void":
								return this.finishNode(s, "VoidTypeAnnotation");case "bool":case "boolean":
								return this.finishNode(s, "BooleanTypeAnnotation");case "mixed":
								return this.finishNode(s, "MixedTypeAnnotation");case "empty":
								return this.finishNode(s, "EmptyTypeAnnotation");case "number":
								return this.finishNode(s, "NumberTypeAnnotation");case "string":
								return this.finishNode(s, "StringTypeAnnotation");default:
								return this.flowParseGenericType(t, e, i);}
					}, e.prototype.flowParsePrimaryType = function () {
						var t = this.state.start,
						    e = this.state.startLoc,
						    s = this.startNode(),
						    i = void 0,
						    r = void 0,
						    a = !1,
						    n = this.state.noAnonFunctionType;switch (this.state.type) {case E.name:
								return this.flowIdentToTypeAnnotation(t, e, s, this.parseIdentifier());case E.braceL:
								return this.flowParseObjectType(!1, !1, !0);case E.braceBarL:
								return this.flowParseObjectType(!1, !0, !0);case E.bracketL:
								return this.flowParseTupleType();case E.relational:
								if ("<" === this.state.value) return s.typeParameters = this.flowParseTypeParameterDeclaration(), this.expect(E.parenL), i = this.flowParseFunctionTypeParams(), s.params = i.params, s.rest = i.rest, this.expect(E.parenR), this.expect(E.arrow), s.returnType = this.flowParseType(), this.finishNode(s, "FunctionTypeAnnotation");break;case E.parenL:
								if (this.next(), !this.match(E.parenR) && !this.match(E.ellipsis)) if (this.match(E.name)) {
									var o = this.lookahead().type;a = o !== E.question && o !== E.colon;
								} else a = !0;if (a) {
									if (this.state.noAnonFunctionType = !1, r = this.flowParseType(), this.state.noAnonFunctionType = n, this.state.noAnonFunctionType || !(this.match(E.comma) || this.match(E.parenR) && this.lookahead().type === E.arrow)) return this.expect(E.parenR), r;this.eat(E.comma);
								}return i = r ? this.flowParseFunctionTypeParams([this.reinterpretTypeAsFunctionTypeParam(r)]) : this.flowParseFunctionTypeParams(), s.params = i.params, s.rest = i.rest, this.expect(E.parenR), this.expect(E.arrow), s.returnType = this.flowParseType(), s.typeParameters = null, this.finishNode(s, "FunctionTypeAnnotation");case E.string:
								return this.parseLiteral(this.state.value, "StringLiteralTypeAnnotation");case E._true:case E._false:
								return s.value = this.match(E._true), this.next(), this.finishNode(s, "BooleanLiteralTypeAnnotation");case E.plusMin:
								if ("-" === this.state.value) return this.next(), this.match(E.num) || this.unexpected(null, "Unexpected token, expected number"), this.parseLiteral(-this.state.value, "NumberLiteralTypeAnnotation", s.start, s.loc.start);this.unexpected();case E.num:
								return this.parseLiteral(this.state.value, "NumberLiteralTypeAnnotation");case E._null:
								return this.next(), this.finishNode(s, "NullLiteralTypeAnnotation");case E._this:
								return this.next(), this.finishNode(s, "ThisTypeAnnotation");case E.star:
								return this.next(), this.finishNode(s, "ExistsTypeAnnotation");default:
								if ("typeof" === this.state.type.keyword) return this.flowParseTypeofType();}throw this.unexpected();
					}, e.prototype.flowParsePostfixType = function () {
						for (var t = this.state.start, e = this.state.startLoc, s = this.flowParsePrimaryType(); !this.canInsertSemicolon() && this.match(E.bracketL);) {
							var i = this.startNodeAt(t, e);i.elementType = s, this.expect(E.bracketL), this.expect(E.bracketR), s = this.finishNode(i, "ArrayTypeAnnotation");
						}return s;
					}, e.prototype.flowParsePrefixType = function () {
						var t = this.startNode();return this.eat(E.question) ? (t.typeAnnotation = this.flowParsePrefixType(), this.finishNode(t, "NullableTypeAnnotation")) : this.flowParsePostfixType();
					}, e.prototype.flowParseAnonFunctionWithoutParens = function () {
						var t = this.flowParsePrefixType();if (!this.state.noAnonFunctionType && this.eat(E.arrow)) {
							var e = this.startNodeAt(t.start, t.loc.start);return e.params = [this.reinterpretTypeAsFunctionTypeParam(t)], e.rest = null, e.returnType = this.flowParseType(), e.typeParameters = null, this.finishNode(e, "FunctionTypeAnnotation");
						}return t;
					}, e.prototype.flowParseIntersectionType = function () {
						var t = this.startNode();this.eat(E.bitwiseAND);var e = this.flowParseAnonFunctionWithoutParens();for (t.types = [e]; this.eat(E.bitwiseAND);) {
							t.types.push(this.flowParseAnonFunctionWithoutParens());
						}return 1 === t.types.length ? e : this.finishNode(t, "IntersectionTypeAnnotation");
					}, e.prototype.flowParseUnionType = function () {
						var t = this.startNode();this.eat(E.bitwiseOR);var e = this.flowParseIntersectionType();for (t.types = [e]; this.eat(E.bitwiseOR);) {
							t.types.push(this.flowParseIntersectionType());
						}return 1 === t.types.length ? e : this.finishNode(t, "UnionTypeAnnotation");
					}, e.prototype.flowParseType = function () {
						var t = this.state.inType;this.state.inType = !0;var e = this.flowParseUnionType();return this.state.inType = t, this.state.exprAllowed = this.state.exprAllowed || this.state.noAnonFunctionType, e;
					}, e.prototype.flowParseTypeAnnotation = function () {
						var t = this.startNode();return t.typeAnnotation = this.flowParseTypeInitialiser(), this.finishNode(t, "TypeAnnotation");
					}, e.prototype.flowParseTypeAnnotatableIdentifier = function (t) {
						var e = t ? this.parseIdentifier() : this.flowParseRestrictedIdentifier();return this.match(E.colon) && (e.typeAnnotation = this.flowParseTypeAnnotation(), this.finishNode(e, e.type)), e;
					}, e.prototype.typeCastToParameter = function (t) {
						return t.expression.typeAnnotation = t.typeAnnotation, this.finishNodeAt(t.expression, t.expression.type, t.typeAnnotation.end, t.typeAnnotation.loc.end);
					}, e.prototype.flowParseVariance = function () {
						var t = null;return this.match(E.plusMin) && (t = this.startNode(), "+" === this.state.value ? t.kind = "plus" : t.kind = "minus", this.next(), this.finishNode(t, "Variance")), t;
					}, e.prototype.parseFunctionBodyAndFinish = function (e, s, i) {
						if (!i && this.match(E.colon)) {
							var r = this.startNode(),
							    a = this.flowParseTypeAndPredicateInitialiser();r.typeAnnotation = a[0], e.predicate = a[1], e.returnType = r.typeAnnotation ? this.finishNode(r, "TypeAnnotation") : null;
						}t.prototype.parseFunctionBodyAndFinish.call(this, e, s, i);
					}, e.prototype.parseStatement = function (e, s) {
						if (this.state.strict && this.match(E.name) && "interface" === this.state.value) {
							var i = this.startNode();return this.next(), this.flowParseInterface(i);
						}return t.prototype.parseStatement.call(this, e, s);
					}, e.prototype.parseExpressionStatement = function (e, s) {
						if ("Identifier" === s.type) if ("declare" === s.name) {
							if (this.match(E._class) || this.match(E.name) || this.match(E._function) || this.match(E._var) || this.match(E._export)) return this.flowParseDeclare(e);
						} else if (this.match(E.name)) {
							if ("interface" === s.name) return this.flowParseInterface(e);if ("type" === s.name) return this.flowParseTypeAlias(e);if ("opaque" === s.name) return this.flowParseOpaqueType(e, !1);
						}return t.prototype.parseExpressionStatement.call(this, e, s);
					}, e.prototype.shouldParseExportDeclaration = function () {
						return this.isContextual("type") || this.isContextual("interface") || this.isContextual("opaque") || t.prototype.shouldParseExportDeclaration.call(this);
					}, e.prototype.isExportDefaultSpecifier = function () {
						return (!this.match(E.name) || "type" !== this.state.value && "interface" !== this.state.value && "opaque" != this.state.value) && t.prototype.isExportDefaultSpecifier.call(this);
					}, e.prototype.parseConditional = function (e, s, i, r, a) {
						if (a && this.match(E.question)) {
							var n = this.state.clone();try {
								return t.prototype.parseConditional.call(this, e, s, i, r);
							} catch (t) {
								if (t instanceof SyntaxError) return this.state = n, a.start = t.pos || this.state.start, e;throw t;
							}
						}return t.prototype.parseConditional.call(this, e, s, i, r);
					}, e.prototype.parseParenItem = function (e, s, i) {
						if (e = t.prototype.parseParenItem.call(this, e, s, i), this.eat(E.question) && (e.optional = !0), this.match(E.colon)) {
							var r = this.startNodeAt(s, i);return r.expression = e, r.typeAnnotation = this.flowParseTypeAnnotation(), this.finishNode(r, "TypeCastExpression");
						}return e;
					}, e.prototype.parseExport = function (e) {
						return "ExportNamedDeclaration" !== (e = t.prototype.parseExport.call(this, e)).type && "ExportAllDeclaration" !== e.type || (e.exportKind = e.exportKind || "value"), e;
					}, e.prototype.parseExportDeclaration = function (e) {
						if (this.isContextual("type")) {
							e.exportKind = "type";var s = this.startNode();return this.next(), this.match(E.braceL) ? (e.specifiers = this.parseExportSpecifiers(), this.parseExportFrom(e), null) : this.flowParseTypeAlias(s);
						}if (this.isContextual("opaque")) {
							e.exportKind = "type";var i = this.startNode();return this.next(), this.flowParseOpaqueType(i, !1);
						}if (this.isContextual("interface")) {
							e.exportKind = "type";var r = this.startNode();return this.next(), this.flowParseInterface(r);
						}return t.prototype.parseExportDeclaration.call(this, e);
					}, e.prototype.shouldParseExportStar = function () {
						return t.prototype.shouldParseExportStar.call(this) || this.isContextual("type") && this.lookahead().type === E.star;
					}, e.prototype.parseExportStar = function (e, s) {
						return this.eatContextual("type") && (e.exportKind = "type", s = !1), t.prototype.parseExportStar.call(this, e, s);
					}, e.prototype.parseClassId = function (e, s, i) {
						t.prototype.parseClassId.call(this, e, s, i), this.isRelational("<") && (e.typeParameters = this.flowParseTypeParameterDeclaration());
					}, e.prototype.isKeyword = function (e) {
						return (!this.state.inType || "void" !== e) && t.prototype.isKeyword.call(this, e);
					}, e.prototype.readToken = function (e) {
						return !this.state.inType || 62 !== e && 60 !== e ? t.prototype.readToken.call(this, e) : this.finishOp(E.relational, 1);
					}, e.prototype.toAssignable = function (e, s, i) {
						return "TypeCastExpression" === e.type ? t.prototype.toAssignable.call(this, this.typeCastToParameter(e), s, i) : t.prototype.toAssignable.call(this, e, s, i);
					}, e.prototype.toAssignableList = function (e, s, i) {
						for (var r = 0; r < e.length; r++) {
							var a = e[r];a && "TypeCastExpression" === a.type && (e[r] = this.typeCastToParameter(a));
						}return t.prototype.toAssignableList.call(this, e, s, i);
					}, e.prototype.toReferencedList = function (t) {
						for (var e = 0; e < t.length; e++) {
							var s = t[e];s && s._exprListItem && "TypeCastExpression" === s.type && this.raise(s.start, "Unexpected type cast");
						}return t;
					}, e.prototype.parseExprListItem = function (e, s, i) {
						var r = this.startNode(),
						    a = t.prototype.parseExprListItem.call(this, e, s, i);return this.match(E.colon) ? (r._exprListItem = !0, r.expression = a, r.typeAnnotation = this.flowParseTypeAnnotation(), this.finishNode(r, "TypeCastExpression")) : a;
					}, e.prototype.checkLVal = function (e, s, i, r) {
						if ("TypeCastExpression" !== e.type) return t.prototype.checkLVal.call(this, e, s, i, r);
					}, e.prototype.parseClassProperty = function (e) {
						return this.match(E.colon) && (e.typeAnnotation = this.flowParseTypeAnnotation()), t.prototype.parseClassProperty.call(this, e);
					}, e.prototype.isClassMethod = function () {
						return this.isRelational("<") || t.prototype.isClassMethod.call(this);
					}, e.prototype.isClassProperty = function () {
						return this.match(E.colon) || t.prototype.isClassProperty.call(this);
					}, e.prototype.isNonstaticConstructor = function (e) {
						return !this.match(E.colon) && t.prototype.isNonstaticConstructor.call(this, e);
					}, e.prototype.pushClassMethod = function (e, s, i, r, a) {
						s.variance && this.unexpected(s.variance.start), delete s.variance, this.isRelational("<") && (s.typeParameters = this.flowParseTypeParameterDeclaration()), t.prototype.pushClassMethod.call(this, e, s, i, r, a);
					}, e.prototype.pushClassPrivateMethod = function (e, s, i, r) {
						s.variance && this.unexpected(s.variance.start), delete s.variance, this.isRelational("<") && (s.typeParameters = this.flowParseTypeParameterDeclaration()), t.prototype.pushClassPrivateMethod.call(this, e, s, i, r);
					}, e.prototype.parseClassSuper = function (e) {
						if (t.prototype.parseClassSuper.call(this, e), e.superClass && this.isRelational("<") && (e.superTypeParameters = this.flowParseTypeParameterInstantiation()), this.isContextual("implements")) {
							this.next();var s = e.implements = [];do {
								var i = this.startNode();i.id = this.parseIdentifier(), this.isRelational("<") ? i.typeParameters = this.flowParseTypeParameterInstantiation() : i.typeParameters = null, s.push(this.finishNode(i, "ClassImplements"));
							} while (this.eat(E.comma));
						}
					}, e.prototype.parsePropertyName = function (e) {
						var s = this.flowParseVariance(),
						    i = t.prototype.parsePropertyName.call(this, e);return e.variance = s, i;
					}, e.prototype.parseObjPropValue = function (e, s, i, r, a, n, o) {
						e.variance && this.unexpected(e.variance.start), delete e.variance;var h = void 0;this.isRelational("<") && (h = this.flowParseTypeParameterDeclaration(), this.match(E.parenL) || this.unexpected()), t.prototype.parseObjPropValue.call(this, e, s, i, r, a, n, o), h && ((e.value || e).typeParameters = h);
					}, e.prototype.parseAssignableListItemTypes = function (t) {
						if (this.eat(E.question)) {
							if ("Identifier" !== t.type) throw this.raise(t.start, "A binding pattern parameter cannot be optional in an implementation signature.");t.optional = !0;
						}return this.match(E.colon) && (t.typeAnnotation = this.flowParseTypeAnnotation()), this.finishNode(t, t.type), t;
					}, e.prototype.parseMaybeDefault = function (e, s, i) {
						var r = t.prototype.parseMaybeDefault.call(this, e, s, i);return "AssignmentPattern" === r.type && r.typeAnnotation && r.right.start < r.typeAnnotation.start && this.raise(r.typeAnnotation.start, "Type annotations must come before default assignments, e.g. instead of `age = 25: number` use `age: number = 25`"), r;
					}, e.prototype.parseImportSpecifiers = function (e) {
						e.importKind = "value";var s = null;if (this.match(E._typeof) ? s = "typeof" : this.isContextual("type") && (s = "type"), s) {
							var i = this.lookahead();(i.type === E.name && "from" !== i.value || i.type === E.braceL || i.type === E.star) && (this.next(), e.importKind = s);
						}t.prototype.parseImportSpecifiers.call(this, e);
					}, e.prototype.parseImportSpecifier = function (t) {
						var e = this.startNode(),
						    s = this.state.start,
						    i = this.parseIdentifier(!0),
						    r = null;"type" === i.name ? r = "type" : "typeof" === i.name && (r = "typeof");var a = !1;if (this.isContextual("as")) {
							var n = this.parseIdentifier(!0);null === r || this.match(E.name) || this.state.type.keyword ? (e.imported = i, e.importKind = null, e.local = this.parseIdentifier()) : (e.imported = n, e.importKind = r, e.local = n.__clone());
						} else null !== r && (this.match(E.name) || this.state.type.keyword) ? (e.imported = this.parseIdentifier(!0), e.importKind = r, this.eatContextual("as") ? e.local = this.parseIdentifier() : (a = !0, e.local = e.imported.__clone())) : (a = !0, e.imported = i, e.importKind = null, e.local = e.imported.__clone());"type" !== t.importKind && "typeof" !== t.importKind || "type" !== e.importKind && "typeof" !== e.importKind || this.raise(s, "`The `type` and `typeof` keywords on named imports can only be used on regular `import` statements. It cannot be used with `import type` or `import typeof` statements`"), a && this.checkReservedWord(e.local.name, e.start, !0, !0), this.checkLVal(e.local, !0, void 0, "import specifier"), t.specifiers.push(this.finishNode(e, "ImportSpecifier"));
					}, e.prototype.parseFunctionParams = function (e) {
						this.isRelational("<") && (e.typeParameters = this.flowParseTypeParameterDeclaration()), t.prototype.parseFunctionParams.call(this, e);
					}, e.prototype.parseVarHead = function (e) {
						t.prototype.parseVarHead.call(this, e), this.match(E.colon) && (e.id.typeAnnotation = this.flowParseTypeAnnotation(), this.finishNode(e.id, e.id.type));
					}, e.prototype.parseAsyncArrowFromCallExpression = function (e, s) {
						if (this.match(E.colon)) {
							var i = this.state.noAnonFunctionType;this.state.noAnonFunctionType = !0, e.returnType = this.flowParseTypeAnnotation(), this.state.noAnonFunctionType = i;
						}return t.prototype.parseAsyncArrowFromCallExpression.call(this, e, s);
					}, e.prototype.shouldParseAsyncArrow = function () {
						return this.match(E.colon) || t.prototype.shouldParseAsyncArrow.call(this);
					}, e.prototype.parseMaybeAssign = function (e, s, i, r) {
						var a = null;if (E.jsxTagStart && this.match(E.jsxTagStart)) {
							var n = this.state.clone();try {
								return t.prototype.parseMaybeAssign.call(this, e, s, i, r);
							} catch (t) {
								if (!(t instanceof SyntaxError)) throw t;this.state = n, this.state.context.length -= 2, a = t;
							}
						}if (null != a || this.isRelational("<")) {
							var o = void 0,
							    h = void 0;try {
								h = this.flowParseTypeParameterDeclaration(), (o = t.prototype.parseMaybeAssign.call(this, e, s, i, r)).typeParameters = h, this.resetStartLocationFromNode(o, h);
							} catch (t) {
								throw a || t;
							}if ("ArrowFunctionExpression" === o.type) return o;if (null != a) throw a;this.raise(h.start, "Expected an arrow function after this type parameter declaration");
						}return t.prototype.parseMaybeAssign.call(this, e, s, i, r);
					}, e.prototype.parseArrow = function (e) {
						if (this.match(E.colon)) {
							var s = this.state.clone();try {
								var i = this.state.noAnonFunctionType;this.state.noAnonFunctionType = !0;var r = this.startNode(),
								    a = this.flowParseTypeAndPredicateInitialiser();r.typeAnnotation = a[0], e.predicate = a[1], this.state.noAnonFunctionType = i, this.canInsertSemicolon() && this.unexpected(), this.match(E.arrow) || this.unexpected(), e.returnType = r.typeAnnotation ? this.finishNode(r, "TypeAnnotation") : null;
							} catch (t) {
								if (!(t instanceof SyntaxError)) throw t;this.state = s;
							}
						}return t.prototype.parseArrow.call(this, e);
					}, e.prototype.shouldParseArrow = function () {
						return this.match(E.colon) || t.prototype.shouldParseArrow.call(this);
					}, e;
				}(t);
			},
			    ot = { quot: '"', amp: "&", apos: "'", lt: "<", gt: ">", nbsp: " ", iexcl: "¡", cent: "¢", pound: "£", curren: "¤", yen: "¥", brvbar: "¦", sect: "§", uml: "¨", copy: "©", ordf: "ª", laquo: "«", not: "¬", shy: "­", reg: "®", macr: "¯", deg: "°", plusmn: "±", sup2: "²", sup3: "³", acute: "´", micro: "µ", para: "¶", middot: "·", cedil: "¸", sup1: "¹", ordm: "º", raquo: "»", frac14: "¼", frac12: "½", frac34: "¾", iquest: "¿", Agrave: "À", Aacute: "Á", Acirc: "Â", Atilde: "Ã", Auml: "Ä", Aring: "Å", AElig: "Æ", Ccedil: "Ç", Egrave: "È", Eacute: "É", Ecirc: "Ê", Euml: "Ë", Igrave: "Ì", Iacute: "Í", Icirc: "Î", Iuml: "Ï", ETH: "Ð", Ntilde: "Ñ", Ograve: "Ò", Oacute: "Ó", Ocirc: "Ô", Otilde: "Õ", Ouml: "Ö", times: "×", Oslash: "Ø", Ugrave: "Ù", Uacute: "Ú", Ucirc: "Û", Uuml: "Ü", Yacute: "Ý", THORN: "Þ", szlig: "ß", agrave: "à", aacute: "á", acirc: "â", atilde: "ã", auml: "ä", aring: "å", aelig: "æ", ccedil: "ç", egrave: "è", eacute: "é", ecirc: "ê", euml: "ë", igrave: "ì", iacute: "í", icirc: "î", iuml: "ï", eth: "ð", ntilde: "ñ", ograve: "ò", oacute: "ó", ocirc: "ô", otilde: "õ", ouml: "ö", divide: "÷", oslash: "ø", ugrave: "ù", uacute: "ú", ucirc: "û", uuml: "ü", yacute: "ý", thorn: "þ", yuml: "ÿ", OElig: "Œ", oelig: "œ", Scaron: "Š", scaron: "š", Yuml: "Ÿ", fnof: "ƒ", circ: "ˆ", tilde: "˜", Alpha: "Α", Beta: "Β", Gamma: "Γ", Delta: "Δ", Epsilon: "Ε", Zeta: "Ζ", Eta: "Η", Theta: "Θ", Iota: "Ι", Kappa: "Κ", Lambda: "Λ", Mu: "Μ", Nu: "Ν", Xi: "Ξ", Omicron: "Ο", Pi: "Π", Rho: "Ρ", Sigma: "Σ", Tau: "Τ", Upsilon: "Υ", Phi: "Φ", Chi: "Χ", Psi: "Ψ", Omega: "Ω", alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", zeta: "ζ", eta: "η", theta: "θ", iota: "ι", kappa: "κ", lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", omicron: "ο", pi: "π", rho: "ρ", sigmaf: "ς", sigma: "σ", tau: "τ", upsilon: "υ", phi: "φ", chi: "χ", psi: "ψ", omega: "ω", thetasym: "ϑ", upsih: "ϒ", piv: "ϖ", ensp: " ", emsp: " ", thinsp: " ", zwnj: "‌", zwj: "‍", lrm: "‎", rlm: "‏", ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", sbquo: "‚", ldquo: "“", rdquo: "”", bdquo: "„", dagger: "†", Dagger: "‡", bull: "•", hellip: "…", permil: "‰", prime: "′", Prime: "″", lsaquo: "‹", rsaquo: "›", oline: "‾", frasl: "⁄", euro: "€", image: "ℑ", weierp: "℘", real: "ℜ", trade: "™", alefsym: "ℵ", larr: "←", uarr: "↑", rarr: "→", darr: "↓", harr: "↔", crarr: "↵", lArr: "⇐", uArr: "⇑", rArr: "⇒", dArr: "⇓", hArr: "⇔", forall: "∀", part: "∂", exist: "∃", empty: "∅", nabla: "∇", isin: "∈", notin: "∉", ni: "∋", prod: "∏", sum: "∑", minus: "−", lowast: "∗", radic: "√", prop: "∝", infin: "∞", ang: "∠", and: "∧", or: "∨", cap: "∩", cup: "∪", int: "∫", there4: "∴", sim: "∼", cong: "≅", asymp: "≈", ne: "≠", equiv: "≡", le: "≤", ge: "≥", sub: "⊂", sup: "⊃", nsub: "⊄", sube: "⊆", supe: "⊇", oplus: "⊕", otimes: "⊗", perp: "⊥", sdot: "⋅", lceil: "⌈", rceil: "⌉", lfloor: "⌊", rfloor: "⌋", lang: "〈", rang: "〉", loz: "◊", spades: "♠", clubs: "♣", hearts: "♥", diams: "♦" },
			    ht = /^[\da-fA-F]+$/,
			    pt = /^\d+$/;U.j_oTag = new V("<tag", !1), U.j_cTag = new V("</tag", !1), U.j_expr = new V("<tag>...</tag>", !0, !0), E.jsxName = new N("jsxName"), E.jsxText = new N("jsxText", { beforeExpr: !0 }), E.jsxTagStart = new N("jsxTagStart", { startsExpr: !0 }), E.jsxTagEnd = new N("jsxTagEnd"), E.jsxTagStart.updateContext = function () {
				this.state.context.push(U.j_expr), this.state.context.push(U.j_oTag), this.state.exprAllowed = !1;
			}, E.jsxTagEnd.updateContext = function (t) {
				var e = this.state.context.pop();e === U.j_oTag && t === E.slash || e === U.j_cTag ? (this.state.context.pop(), this.state.exprAllowed = this.curContext() === U.j_expr) : this.state.exprAllowed = !0;
			};var ct = function ct(t) {
				return function (t) {
					function e() {
						return t.apply(this, arguments) || this;
					}return A(e, t), e.prototype.jsxReadToken = function () {
						for (var t = "", e = this.state.pos;;) {
							this.state.pos >= this.input.length && this.raise(this.state.start, "Unterminated JSX contents");var s = this.input.charCodeAt(this.state.pos);switch (s) {case 60:case 123:
									return this.state.pos === this.state.start ? 60 === s && this.state.exprAllowed ? (++this.state.pos, this.finishToken(E.jsxTagStart)) : this.getTokenFromCode(s) : (t += this.input.slice(e, this.state.pos), this.finishToken(E.jsxText, t));case 38:
									t += this.input.slice(e, this.state.pos), t += this.jsxReadEntity(), e = this.state.pos;break;default:
									o(s) ? (t += this.input.slice(e, this.state.pos), t += this.jsxReadNewLine(!0), e = this.state.pos) : ++this.state.pos;}
						}
					}, e.prototype.jsxReadNewLine = function (t) {
						var e = this.input.charCodeAt(this.state.pos),
						    s = void 0;return ++this.state.pos, 13 === e && 10 === this.input.charCodeAt(this.state.pos) ? (++this.state.pos, s = t ? "\n" : "\r\n") : s = String.fromCharCode(e), ++this.state.curLine, this.state.lineStart = this.state.pos, s;
					}, e.prototype.jsxReadString = function (t) {
						for (var e = "", s = ++this.state.pos;;) {
							this.state.pos >= this.input.length && this.raise(this.state.start, "Unterminated string constant");var i = this.input.charCodeAt(this.state.pos);if (i === t) break;38 === i ? (e += this.input.slice(s, this.state.pos), e += this.jsxReadEntity(), s = this.state.pos) : o(i) ? (e += this.input.slice(s, this.state.pos), e += this.jsxReadNewLine(!1), s = this.state.pos) : ++this.state.pos;
						}return e += this.input.slice(s, this.state.pos++), this.finishToken(E.string, e);
					}, e.prototype.jsxReadEntity = function () {
						for (var t = "", e = 0, s = void 0, i = this.input[this.state.pos], r = ++this.state.pos; this.state.pos < this.input.length && e++ < 10;) {
							if (";" === (i = this.input[this.state.pos++])) {
								"#" === t[0] ? "x" === t[1] ? (t = t.substr(2), ht.test(t) && (s = String.fromCodePoint(parseInt(t, 16)))) : (t = t.substr(1), pt.test(t) && (s = String.fromCodePoint(parseInt(t, 10)))) : s = ot[t];break;
							}t += i;
						}return s || (this.state.pos = r, "&");
					}, e.prototype.jsxReadWord = function () {
						var t = void 0,
						    e = this.state.pos;do {
							t = this.input.charCodeAt(++this.state.pos);
						} while (n(t) || 45 === t);return this.finishToken(E.jsxName, this.input.slice(e, this.state.pos));
					}, e.prototype.jsxParseIdentifier = function () {
						var t = this.startNode();return this.match(E.jsxName) ? t.name = this.state.value : this.state.type.keyword ? t.name = this.state.type.keyword : this.unexpected(), this.next(), this.finishNode(t, "JSXIdentifier");
					}, e.prototype.jsxParseNamespacedName = function () {
						var t = this.state.start,
						    e = this.state.startLoc,
						    s = this.jsxParseIdentifier();if (!this.eat(E.colon)) return s;var i = this.startNodeAt(t, e);return i.namespace = s, i.name = this.jsxParseIdentifier(), this.finishNode(i, "JSXNamespacedName");
					}, e.prototype.jsxParseElementName = function () {
						for (var t = this.state.start, e = this.state.startLoc, s = this.jsxParseNamespacedName(); this.eat(E.dot);) {
							var i = this.startNodeAt(t, e);i.object = s, i.property = this.jsxParseIdentifier(), s = this.finishNode(i, "JSXMemberExpression");
						}return s;
					}, e.prototype.jsxParseAttributeValue = function () {
						var t = void 0;switch (this.state.type) {case E.braceL:
								if ("JSXEmptyExpression" === (t = this.jsxParseExpressionContainer()).expression.type) throw this.raise(t.start, "JSX attributes must only be assigned a non-empty expression");return t;case E.jsxTagStart:case E.string:
								return this.parseExprAtom();default:
								throw this.raise(this.state.start, "JSX value should be either an expression or a quoted JSX text");}
					}, e.prototype.jsxParseEmptyExpression = function () {
						var t = this.startNodeAt(this.state.lastTokEnd, this.state.lastTokEndLoc);return this.finishNodeAt(t, "JSXEmptyExpression", this.state.start, this.state.startLoc);
					}, e.prototype.jsxParseSpreadChild = function () {
						var t = this.startNode();return this.expect(E.braceL), this.expect(E.ellipsis), t.expression = this.parseExpression(), this.expect(E.braceR), this.finishNode(t, "JSXSpreadChild");
					}, e.prototype.jsxParseExpressionContainer = function () {
						var t = this.startNode();return this.next(), this.match(E.braceR) ? t.expression = this.jsxParseEmptyExpression() : t.expression = this.parseExpression(), this.expect(E.braceR), this.finishNode(t, "JSXExpressionContainer");
					}, e.prototype.jsxParseAttribute = function () {
						var t = this.startNode();return this.eat(E.braceL) ? (this.expect(E.ellipsis), t.argument = this.parseMaybeAssign(), this.expect(E.braceR), this.finishNode(t, "JSXSpreadAttribute")) : (t.name = this.jsxParseNamespacedName(), t.value = this.eat(E.eq) ? this.jsxParseAttributeValue() : null, this.finishNode(t, "JSXAttribute"));
					}, e.prototype.jsxParseOpeningElementAt = function (t, e) {
						var s = this.startNodeAt(t, e);for (s.attributes = [], s.name = this.jsxParseElementName(); !this.match(E.slash) && !this.match(E.jsxTagEnd);) {
							s.attributes.push(this.jsxParseAttribute());
						}return s.selfClosing = this.eat(E.slash), this.expect(E.jsxTagEnd), this.finishNode(s, "JSXOpeningElement");
					}, e.prototype.jsxParseClosingElementAt = function (t, e) {
						var s = this.startNodeAt(t, e);return s.name = this.jsxParseElementName(), this.expect(E.jsxTagEnd), this.finishNode(s, "JSXClosingElement");
					}, e.prototype.jsxParseElementAt = function (t, e) {
						var s = this.startNodeAt(t, e),
						    i = [],
						    r = this.jsxParseOpeningElementAt(t, e),
						    a = null;if (!r.selfClosing) {
							t: for (;;) {
								switch (this.state.type) {case E.jsxTagStart:
										if (t = this.state.start, e = this.state.startLoc, this.next(), this.eat(E.slash)) {
											a = this.jsxParseClosingElementAt(t, e);break t;
										}i.push(this.jsxParseElementAt(t, e));break;case E.jsxText:
										i.push(this.parseExprAtom());break;case E.braceL:
										this.lookahead().type === E.ellipsis ? i.push(this.jsxParseSpreadChild()) : i.push(this.jsxParseExpressionContainer());break;default:
										throw this.unexpected();}
							}f(a.name) !== f(r.name) && this.raise(a.start, "Expected corresponding JSX closing tag for <" + f(r.name) + ">");
						}return s.openingElement = r, s.closingElement = a, s.children = i, this.match(E.relational) && "<" === this.state.value && this.raise(this.state.start, "Adjacent JSX elements must be wrapped in an enclosing tag"), this.finishNode(s, "JSXElement");
					}, e.prototype.jsxParseElement = function () {
						var t = this.state.start,
						    e = this.state.startLoc;return this.next(), this.jsxParseElementAt(t, e);
					}, e.prototype.parseExprAtom = function (e) {
						return this.match(E.jsxText) ? this.parseLiteral(this.state.value, "JSXText") : this.match(E.jsxTagStart) ? this.jsxParseElement() : t.prototype.parseExprAtom.call(this, e);
					}, e.prototype.readToken = function (e) {
						if (this.state.inPropertyName) return t.prototype.readToken.call(this, e);var s = this.curContext();if (s === U.j_expr) return this.jsxReadToken();if (s === U.j_oTag || s === U.j_cTag) {
							if (a(e)) return this.jsxReadWord();if (62 === e) return ++this.state.pos, this.finishToken(E.jsxTagEnd);if ((34 === e || 39 === e) && s === U.j_oTag) return this.jsxReadString(e);
						}return 60 === e && this.state.exprAllowed ? (++this.state.pos, this.finishToken(E.jsxTagStart)) : t.prototype.readToken.call(this, e);
					}, e.prototype.updateContext = function (e) {
						if (this.match(E.braceL)) {
							var s = this.curContext();s === U.j_oTag ? this.state.context.push(U.braceExpression) : s === U.j_expr ? this.state.context.push(U.templateQuasi) : t.prototype.updateContext.call(this, e), this.state.exprAllowed = !0;
						} else {
							if (!this.match(E.slash) || e !== E.jsxTagStart) return t.prototype.updateContext.call(this, e);this.state.context.length -= 2, this.state.context.push(U.j_cTag), this.state.exprAllowed = !1;
						}
					}, e;
				}(t);
			},
			    lt = function lt(t) {
				return function (t) {
					function e() {
						return t.apply(this, arguments) || this;
					}return A(e, t), e.prototype.tsIsIdentifier = function () {
						return this.match(E.name);
					}, e.prototype.tsNextTokenCanFollowModifier = function () {
						return this.next(), !(this.hasPrecedingLineBreak() || this.match(E.parenL) || this.match(E.colon) || this.match(E.eq) || this.match(E.question));
					}, e.prototype.tsParseModifier = function (t) {
						if (this.match(E.name)) {
							var e = this.state.value;return -1 !== t.indexOf(e) && this.tsTryParse(this.tsNextTokenCanFollowModifier.bind(this)) ? e : void 0;
						}
					}, e.prototype.tsIsListTerminator = function (t) {
						switch (t) {case "EnumMembers":case "TypeMembers":
								return this.match(E.braceR);case "HeritageClauseElement":
								return this.match(E.braceL);case "TupleElementTypes":
								return this.match(E.bracketR);case "TypeParametersOrArguments":
								return this.isRelational(">");}throw new Error("Unreachable");
					}, e.prototype.tsParseList = function (t, e) {
						for (var s = []; !this.tsIsListTerminator(t);) {
							s.push(e());
						}return s;
					}, e.prototype.tsParseDelimitedList = function (t, e) {
						return y(this.tsParseDelimitedListWorker(t, e, !0));
					}, e.prototype.tsTryParseDelimitedList = function (t, e) {
						return this.tsParseDelimitedListWorker(t, e, !1);
					}, e.prototype.tsParseDelimitedListWorker = function (t, e, s) {
						for (var i = [];;) {
							if (this.tsIsListTerminator(t)) break;var r = e();if (null == r) return;if (i.push(r), !this.eat(E.comma)) {
								if (this.tsIsListTerminator(t)) break;return void (s && this.expect(E.comma));
							}
						}return i;
					}, e.prototype.tsParseBracketedList = function (t, e, s, i) {
						i || (s ? this.expect(E.bracketL) : this.expectRelational("<"));var r = this.tsParseDelimitedList(t, e);return s ? this.expect(E.bracketR) : this.expectRelational(">"), r;
					}, e.prototype.tsParseEntityName = function (t) {
						for (var e = this.parseIdentifier(); this.eat(E.dot);) {
							var s = this.startNodeAtNode(e);s.left = e, s.right = this.parseIdentifier(t), e = this.finishNode(s, "TSQualifiedName");
						}return e;
					}, e.prototype.tsParseTypeReference = function () {
						var t = this.startNode();return t.typeName = this.tsParseEntityName(!1), !this.hasPrecedingLineBreak() && this.isRelational("<") && (t.typeParameters = this.tsParseTypeArguments()), this.finishNode(t, "TSTypeReference");
					}, e.prototype.tsParseThisTypePredicate = function (t) {
						this.next();var e = this.startNode();return e.parameterName = t, e.typeAnnotation = this.tsParseTypeAnnotation(!1), this.finishNode(e, "TSTypePredicate");
					}, e.prototype.tsParseThisTypeNode = function () {
						var t = this.startNode();return this.next(), this.finishNode(t, "TSThisType");
					}, e.prototype.tsParseTypeQuery = function () {
						var t = this.startNode();return this.expect(E._typeof), t.exprName = this.tsParseEntityName(!0), this.finishNode(t, "TSTypeQuery");
					}, e.prototype.tsParseTypeParameter = function () {
						var t = this.startNode();return t.name = this.parseIdentifierName(t.start), this.eat(E._extends) && (t.constraint = this.tsParseType()), this.eat(E.eq) && (t.default = this.tsParseType()), this.finishNode(t, "TypeParameter");
					}, e.prototype.tsTryParseTypeParameters = function () {
						if (this.isRelational("<")) return this.tsParseTypeParameters();
					}, e.prototype.tsParseTypeParameters = function () {
						var t = this.startNode();return this.isRelational("<") || this.match(E.jsxTagStart) ? this.next() : this.unexpected(), t.params = this.tsParseBracketedList("TypeParametersOrArguments", this.tsParseTypeParameter.bind(this), !1, !0), this.finishNode(t, "TypeParameterDeclaration");
					}, e.prototype.tsFillSignature = function (t, e) {
						var s = t === E.arrow;e.typeParameters = this.tsTryParseTypeParameters(), this.expect(E.parenL), e.parameters = this.tsParseBindingListForSignature(), s ? e.typeAnnotation = this.tsParseTypeOrTypePredicateAnnotation(t) : this.match(t) && (e.typeAnnotation = this.tsParseTypeOrTypePredicateAnnotation(t));
					}, e.prototype.tsParseBindingListForSignature = function () {
						var t = this;return this.parseBindingList(E.parenR).map(function (e) {
							if ("Identifier" !== e.type && "RestElement" !== e.type) throw t.unexpected(e.start, "Name in a signature must be an Identifier.");return e;
						});
					}, e.prototype.tsParseTypeMemberSemicolon = function () {
						this.eat(E.comma) || this.semicolon();
					}, e.prototype.tsParseSignatureMember = function (t) {
						var e = this.startNode();return "TSConstructSignatureDeclaration" === t && this.expect(E._new), this.tsFillSignature(E.colon, e), this.tsParseTypeMemberSemicolon(), this.finishNode(e, t);
					}, e.prototype.tsIsUnambiguouslyIndexSignature = function () {
						return this.next(), this.eat(E.name) && this.match(E.colon);
					}, e.prototype.tsTryParseIndexSignature = function (t) {
						if (this.match(E.bracketL) && this.tsLookAhead(this.tsIsUnambiguouslyIndexSignature.bind(this))) {
							this.expect(E.bracketL);var e = this.parseIdentifier();this.expect(E.colon), e.typeAnnotation = this.tsParseTypeAnnotation(!1), this.expect(E.bracketR), t.parameters = [e];var s = this.tsTryParseTypeAnnotation();return s && (t.typeAnnotation = s), this.tsParseTypeMemberSemicolon(), this.finishNode(t, "TSIndexSignature");
						}
					}, e.prototype.tsParsePropertyOrMethodSignature = function (t, e) {
						this.parsePropertyName(t), this.eat(E.question) && (t.optional = !0);var s = t;if (e || !this.match(E.parenL) && !this.isRelational("<")) {
							var i = s;e && (i.readonly = !0);var r = this.tsTryParseTypeAnnotation();return r && (i.typeAnnotation = r), this.tsParseTypeMemberSemicolon(), this.finishNode(i, "TSPropertySignature");
						}var a = s;return this.tsFillSignature(E.colon, a), this.tsParseTypeMemberSemicolon(), this.finishNode(a, "TSMethodSignature");
					}, e.prototype.tsParseTypeMember = function () {
						if (this.match(E.parenL) || this.isRelational("<")) return this.tsParseSignatureMember("TSCallSignatureDeclaration");if (this.match(E._new) && this.tsLookAhead(this.tsIsStartOfConstructSignature.bind(this))) return this.tsParseSignatureMember("TSConstructSignatureDeclaration");var t = this.startNode(),
						    e = !!this.tsParseModifier(["readonly"]),
						    s = this.tsTryParseIndexSignature(t);return s ? (e && (t.readonly = !0), s) : this.tsParsePropertyOrMethodSignature(t, e);
					}, e.prototype.tsIsStartOfConstructSignature = function () {
						return this.next(), this.match(E.parenL) || this.isRelational("<");
					}, e.prototype.tsParseTypeLiteral = function () {
						var t = this.startNode();return t.members = this.tsParseObjectTypeMembers(), this.finishNode(t, "TSTypeLiteral");
					}, e.prototype.tsParseObjectTypeMembers = function () {
						this.expect(E.braceL);var t = this.tsParseList("TypeMembers", this.tsParseTypeMember.bind(this));return this.expect(E.braceR), t;
					}, e.prototype.tsIsStartOfMappedType = function () {
						return this.next(), this.isContextual("readonly") && this.next(), !!this.match(E.bracketL) && (this.next(), !!this.tsIsIdentifier() && (this.next(), this.match(E._in)));
					}, e.prototype.tsParseMappedTypeParameter = function () {
						var t = this.startNode();return t.name = this.parseIdentifierName(t.start), this.expect(E._in), t.constraint = this.tsParseType(), this.finishNode(t, "TypeParameter");
					}, e.prototype.tsParseMappedType = function () {
						var t = this.startNode();return this.expect(E.braceL), this.eatContextual("readonly") && (t.readonly = !0), this.expect(E.bracketL), t.typeParameter = this.tsParseMappedTypeParameter(), this.expect(E.bracketR), this.eat(E.question) && (t.optional = !0), t.typeAnnotation = this.tsTryParseType(), this.semicolon(), this.expect(E.braceR), this.finishNode(t, "TSMappedType");
					}, e.prototype.tsParseTupleType = function () {
						var t = this.startNode();return t.elementTypes = this.tsParseBracketedList("TupleElementTypes", this.tsParseType.bind(this), !0, !1), this.finishNode(t, "TSTupleType");
					}, e.prototype.tsParseParenthesizedType = function () {
						var t = this.startNode();return this.expect(E.parenL), t.typeAnnotation = this.tsParseType(), this.expect(E.parenR), this.finishNode(t, "TSParenthesizedType");
					}, e.prototype.tsParseFunctionOrConstructorType = function (t) {
						var e = this.startNode();return "TSConstructorType" === t && this.expect(E._new), this.tsFillSignature(E.arrow, e), this.finishNode(e, t);
					}, e.prototype.tsParseLiteralTypeNode = function () {
						var t = this,
						    e = this.startNode();return e.literal = function () {
							switch (t.state.type) {case E.num:
									return t.parseLiteral(t.state.value, "NumericLiteral");case E.string:
									return t.parseLiteral(t.state.value, "StringLiteral");case E._true:case E._false:
									return t.parseBooleanLiteral();default:
									throw t.unexpected();}
						}(), this.finishNode(e, "TSLiteralType");
					}, e.prototype.tsParseNonArrayType = function () {
						switch (this.state.type) {case E.name:case E._void:case E._null:
								var t = this.match(E._void) ? "TSVoidKeyword" : this.match(E._null) ? "TSNullKeyword" : x(this.state.value);if (void 0 !== t && this.lookahead().type !== E.dot) {
									var e = this.startNode();return this.next(), this.finishNode(e, t);
								}return this.tsParseTypeReference();case E.string:case E.num:case E._true:case E._false:
								return this.tsParseLiteralTypeNode();case E.plusMin:
								if ("-" === this.state.value) {
									var s = this.startNode();if (this.next(), !this.match(E.num)) throw this.unexpected();return s.literal = this.parseLiteral(-this.state.value, "NumericLiteral", s.start, s.loc.start), this.finishNode(s, "TSLiteralType");
								}break;case E._this:
								var i = this.tsParseThisTypeNode();return this.isContextual("is") && !this.hasPrecedingLineBreak() ? this.tsParseThisTypePredicate(i) : i;case E._typeof:
								return this.tsParseTypeQuery();case E.braceL:
								return this.tsLookAhead(this.tsIsStartOfMappedType.bind(this)) ? this.tsParseMappedType() : this.tsParseTypeLiteral();case E.bracketL:
								return this.tsParseTupleType();case E.parenL:
								return this.tsParseParenthesizedType();}throw this.unexpected();
					}, e.prototype.tsParseArrayTypeOrHigher = function () {
						for (var t = this.tsParseNonArrayType(); !this.hasPrecedingLineBreak() && this.eat(E.bracketL);) {
							if (this.match(E.bracketR)) {
								var e = this.startNodeAtNode(t);e.elementType = t, this.expect(E.bracketR), t = this.finishNode(e, "TSArrayType");
							} else {
								var s = this.startNodeAtNode(t);s.objectType = t, s.indexType = this.tsParseType(), this.expect(E.bracketR), t = this.finishNode(s, "TSIndexedAccessType");
							}
						}return t;
					}, e.prototype.tsParseTypeOperator = function (t) {
						var e = this.startNode();return this.expectContextual(t), e.operator = t, e.typeAnnotation = this.tsParseTypeOperatorOrHigher(), this.finishNode(e, "TSTypeOperator");
					}, e.prototype.tsParseTypeOperatorOrHigher = function () {
						return this.isContextual("keyof") ? this.tsParseTypeOperator("keyof") : this.tsParseArrayTypeOrHigher();
					}, e.prototype.tsParseUnionOrIntersectionType = function (t, e, s) {
						this.eat(s);var i = e();if (this.match(s)) {
							for (var r = [i]; this.eat(s);) {
								r.push(e());
							}var a = this.startNodeAtNode(i);a.types = r, i = this.finishNode(a, t);
						}return i;
					}, e.prototype.tsParseIntersectionTypeOrHigher = function () {
						return this.tsParseUnionOrIntersectionType("TSIntersectionType", this.tsParseTypeOperatorOrHigher.bind(this), E.bitwiseAND);
					}, e.prototype.tsParseUnionTypeOrHigher = function () {
						return this.tsParseUnionOrIntersectionType("TSUnionType", this.tsParseIntersectionTypeOrHigher.bind(this), E.bitwiseOR);
					}, e.prototype.tsIsStartOfFunctionType = function () {
						return !!this.isRelational("<") || this.match(E.parenL) && this.tsLookAhead(this.tsIsUnambiguouslyStartOfFunctionType.bind(this));
					}, e.prototype.tsSkipParameterStart = function () {
						return !(!this.match(E.name) && !this.match(E._this)) && (this.next(), !0);
					}, e.prototype.tsIsUnambiguouslyStartOfFunctionType = function () {
						if (this.next(), this.match(E.parenR) || this.match(E.ellipsis)) return !0;if (this.tsSkipParameterStart()) {
							if (this.match(E.colon) || this.match(E.comma) || this.match(E.question) || this.match(E.eq)) return !0;if (this.match(E.parenR) && (this.next(), this.match(E.arrow))) return !0;
						}return !1;
					}, e.prototype.tsParseTypeOrTypePredicateAnnotation = function (t) {
						var e = this.startNode();this.expect(t);var s = this.tsIsIdentifier() && this.tsTryParse(this.tsParseTypePredicatePrefix.bind(this));if (!s) return this.tsParseTypeAnnotation(!1, e);var i = this.tsParseTypeAnnotation(!1),
						    r = this.startNodeAtNode(s);return r.parameterName = s, r.typeAnnotation = i, e.typeAnnotation = this.finishNode(r, "TSTypePredicate"), this.finishNode(e, "TypeAnnotation");
					}, e.prototype.tsTryParseTypeOrTypePredicateAnnotation = function () {
						return this.match(E.colon) ? this.tsParseTypeOrTypePredicateAnnotation(E.colon) : void 0;
					}, e.prototype.tsTryParseTypeAnnotation = function () {
						return this.match(E.colon) ? this.tsParseTypeAnnotation() : void 0;
					}, e.prototype.tsTryParseType = function () {
						return this.eat(E.colon) ? this.tsParseType() : void 0;
					}, e.prototype.tsParseTypePredicatePrefix = function () {
						var t = this.parseIdentifier();if (this.isContextual("is") && !this.hasPrecedingLineBreak()) return this.next(), t;
					}, e.prototype.tsParseTypeAnnotation = function (t, e) {
						return void 0 === t && (t = !0), void 0 === e && (e = this.startNode()), t && this.expect(E.colon), e.typeAnnotation = this.tsParseType(), this.finishNode(e, "TypeAnnotation");
					}, e.prototype.tsParseType = function () {
						var t = this.state.inType;this.state.inType = !0;try {
							return this.tsIsStartOfFunctionType() ? this.tsParseFunctionOrConstructorType("TSFunctionType") : this.match(E._new) ? this.tsParseFunctionOrConstructorType("TSConstructorType") : this.tsParseUnionTypeOrHigher();
						} finally {
							this.state.inType = t;
						}
					}, e.prototype.tsParseTypeAssertion = function () {
						var t = this.startNode();return t.typeAnnotation = this.tsParseType(), this.expectRelational(">"), t.expression = this.parseMaybeUnary(), this.finishNode(t, "TSTypeAssertion");
					}, e.prototype.tsTryParseTypeArgumentsInExpression = function () {
						var t = this;return this.tsTryParseAndCatch(function () {
							var e = t.startNode();t.expectRelational("<");var s = t.tsParseDelimitedList("TypeParametersOrArguments", t.tsParseType.bind(t));return t.expectRelational(">"), e.params = s, t.finishNode(e, "TypeParameterInstantiation"), t.expect(E.parenL), e;
						});
					}, e.prototype.tsParseHeritageClause = function () {
						return this.tsParseDelimitedList("HeritageClauseElement", this.tsParseExpressionWithTypeArguments.bind(this));
					}, e.prototype.tsParseExpressionWithTypeArguments = function () {
						var t = this.startNode();return t.expression = this.tsParseEntityName(!1), this.isRelational("<") && (t.typeParameters = this.tsParseTypeArguments()), this.finishNode(t, "TSExpressionWithTypeArguments");
					}, e.prototype.tsParseInterfaceDeclaration = function (t) {
						t.id = this.parseIdentifier(), t.typeParameters = this.tsTryParseTypeParameters(), this.eat(E._extends) && (t.extends = this.tsParseHeritageClause());var e = this.startNode();return e.body = this.tsParseObjectTypeMembers(), t.body = this.finishNode(e, "TSInterfaceBody"), this.finishNode(t, "TSInterfaceDeclaration");
					}, e.prototype.tsParseTypeAliasDeclaration = function (t) {
						return t.id = this.parseIdentifier(), t.typeParameters = this.tsTryParseTypeParameters(), this.expect(E.eq), t.typeAnnotation = this.tsParseType(), this.semicolon(), this.finishNode(t, "TSTypeAliasDeclaration");
					}, e.prototype.tsParseEnumMember = function () {
						var t = this.startNode();return t.id = this.match(E.string) ? this.parseLiteral(this.state.value, "StringLiteral") : this.parseIdentifier(!0), this.eat(E.eq) && (t.initializer = this.parseMaybeAssign()), this.finishNode(t, "TSEnumMember");
					}, e.prototype.tsParseEnumDeclaration = function (t, e) {
						return e && (t.const = !0), t.id = this.parseIdentifier(), this.expect(E.braceL), t.members = this.tsParseDelimitedList("EnumMembers", this.tsParseEnumMember.bind(this)), this.expect(E.braceR), this.finishNode(t, "TSEnumDeclaration");
					}, e.prototype.tsParseModuleBlock = function () {
						var t = this.startNode();return this.expect(E.braceL), this.parseBlockOrModuleBlockBody(t.body = [], void 0, !0, E.braceR), this.finishNode(t, "TSModuleBlock");
					}, e.prototype.tsParseModuleOrNamespaceDeclaration = function (t) {
						if (t.id = this.parseIdentifier(), this.eat(E.dot)) {
							var e = this.startNode();this.tsParseModuleOrNamespaceDeclaration(e), t.body = e;
						} else t.body = this.tsParseModuleBlock();return this.finishNode(t, "TSModuleDeclaration");
					}, e.prototype.tsParseAmbientExternalModuleDeclaration = function (t) {
						return this.isContextual("global") ? (t.global = !0, t.id = this.parseIdentifier()) : this.match(E.string) ? t.id = this.parseExprAtom() : this.unexpected(), this.match(E.braceL) ? t.body = this.tsParseModuleBlock() : this.semicolon(), this.finishNode(t, "TSModuleDeclaration");
					}, e.prototype.tsParseImportEqualsDeclaration = function (t, e) {
						return t.isExport = e || !1, t.id = this.parseIdentifier(), this.expect(E.eq), t.moduleReference = this.tsParseModuleReference(), this.semicolon(), this.finishNode(t, "TSImportEqualsDeclaration");
					}, e.prototype.tsIsExternalModuleReference = function () {
						return this.isContextual("require") && this.lookahead().type === E.parenL;
					}, e.prototype.tsParseModuleReference = function () {
						return this.tsIsExternalModuleReference() ? this.tsParseExternalModuleReference() : this.tsParseEntityName(!1);
					}, e.prototype.tsParseExternalModuleReference = function () {
						var t = this.startNode();if (this.expectContextual("require"), this.expect(E.parenL), !this.match(E.string)) throw this.unexpected();return t.expression = this.parseLiteral(this.state.value, "StringLiteral"), this.expect(E.parenR), this.finishNode(t, "TSExternalModuleReference");
					}, e.prototype.tsLookAhead = function (t) {
						var e = this.state.clone(),
						    s = t();return this.state = e, s;
					}, e.prototype.tsTryParseAndCatch = function (t) {
						var e = this.state.clone();try {
							return t();
						} catch (t) {
							if (t instanceof SyntaxError) return void (this.state = e);throw t;
						}
					}, e.prototype.tsTryParse = function (t) {
						var e = this.state.clone(),
						    s = t();return void 0 !== s && !1 !== s ? s : void (this.state = e);
					}, e.prototype.nodeWithSamePosition = function (t, e) {
						var s = this.startNodeAtNode(t);return s.type = e, s.end = t.end, s.loc.end = t.loc.end, t.leadingComments && (s.leadingComments = t.leadingComments), t.trailingComments && (s.trailingComments = t.trailingComments), t.innerComments && (s.innerComments = t.innerComments), s;
					}, e.prototype.tsTryParseDeclare = function (t) {
						switch (this.state.type) {case E._function:
								return this.next(), this.parseFunction(t, !0);case E._class:
								return this.parseClass(t, !0, !1);case E._const:
								if (this.match(E._const) && this.lookaheadIsContextual("enum")) return this.expect(E._const), this.expectContextual("enum"), this.tsParseEnumDeclaration(t, !0);case E._var:case E._let:
								return this.parseVarStatement(t, this.state.type);case E.name:
								var e = this.state.value;return "global" === e ? this.tsParseAmbientExternalModuleDeclaration(t) : this.tsParseDeclaration(t, e, !0);}
					}, e.prototype.lookaheadIsContextual = function (t) {
						var e = this.lookahead();return e.type === E.name && e.value === t;
					}, e.prototype.tsTryParseExportDeclaration = function () {
						return this.tsParseDeclaration(this.startNode(), this.state.value, !0);
					}, e.prototype.tsParseExpressionStatement = function (t, e) {
						switch (e.name) {case "declare":
								var s = this.tsTryParseDeclare(t);if (s) return s.declare = !0, s;break;case "global":
								if (this.match(E.braceL)) {
									var i = t;return i.global = !0, i.id = e, i.body = this.tsParseModuleBlock(), this.finishNode(i, "TSModuleDeclaration");
								}break;default:
								return this.tsParseDeclaration(t, e.name, !1);}
					}, e.prototype.tsParseDeclaration = function (t, e, s) {
						switch (e) {case "abstract":
								if (s || this.match(E._class)) {
									var i = t;return i.abstract = !0, s && this.next(), this.parseClass(i, !0, !1);
								}break;case "enum":
								if (s || this.match(E.name)) return s && this.next(), this.tsParseEnumDeclaration(t, !1);break;case "interface":
								if (s || this.match(E.name)) return s && this.next(), this.tsParseInterfaceDeclaration(t);break;case "module":
								if (s && this.next(), this.match(E.string)) return this.tsParseAmbientExternalModuleDeclaration(t);if (s || this.match(E.name)) return this.tsParseModuleOrNamespaceDeclaration(t);break;case "namespace":
								if (s || this.match(E.name)) return s && this.next(), this.tsParseModuleOrNamespaceDeclaration(t);break;case "type":
								if (s || this.match(E.name)) return s && this.next(), this.tsParseTypeAliasDeclaration(t);}
					}, e.prototype.tsTryParseGenericAsyncArrowFunction = function (e, s) {
						var i = this,
						    r = this.tsTryParseAndCatch(function () {
							var r = i.startNodeAt(e, s);return r.typeParameters = i.tsParseTypeParameters(), t.prototype.parseFunctionParams.call(i, r), r.returnType = i.tsTryParseTypeOrTypePredicateAnnotation(), i.expect(E.arrow), r;
						});if (r) return r.id = null, r.generator = !1, r.expression = !0, r.async = !0, this.parseFunctionBody(r, !0), this.finishNode(r, "ArrowFunctionExpression");
					}, e.prototype.tsParseTypeArguments = function () {
						var t = this.startNode();return this.expectRelational("<"), t.params = this.tsParseDelimitedList("TypeParametersOrArguments", this.tsParseType.bind(this)), this.expectRelational(">"), this.finishNode(t, "TypeParameterInstantiation");
					}, e.prototype.isExportDefaultSpecifier = function () {
						return (!this.match(E.name) || "type" !== this.state.value && "interface" !== this.state.value && "enum" !== this.state.value) && t.prototype.isExportDefaultSpecifier.call(this);
					}, e.prototype.parseAssignableListItem = function (t, e) {
						var s = void 0,
						    i = !1;t && (s = this.parseAccessModifier(), i = !!this.tsParseModifier(["readonly"]));var r = this.parseMaybeDefault();this.parseAssignableListItemTypes(r);var a = this.parseMaybeDefault(r.start, r.loc.start, r);if (s || i) {
							var n = this.startNodeAtNode(a);if (e.length && (n.decorators = e), s && (n.accessibility = s), i && (n.readonly = i), "Identifier" !== a.type && "AssignmentPattern" !== a.type) throw this.raise(n.start, "A parameter property may not be declared using a binding pattern.");return n.parameter = a, this.finishNode(n, "TSParameterProperty");
						}return e.length && (r.decorators = e), a;
					}, e.prototype.parseFunctionBodyAndFinish = function (e, s, i) {
						!i && this.match(E.colon) && (e.returnType = this.tsParseTypeOrTypePredicateAnnotation(E.colon));var r = "FunctionDeclaration" === s ? "TSDeclareFunction" : "ClassMethod" === s ? "TSDeclareMethod" : void 0;r && !this.match(E.braceL) && this.isLineTerminator() ? this.finishNode(e, r) : t.prototype.parseFunctionBodyAndFinish.call(this, e, s, i);
					}, e.prototype.parseSubscript = function (e, s, i, r, a) {
						if (this.eat(E.bang)) {
							var n = this.startNodeAt(s, i);return n.expression = e, this.finishNode(n, "TSNonNullExpression");
						}if (!r && this.isRelational("<")) {
							if (this.atPossibleAsync(e)) {
								var o = this.tsTryParseGenericAsyncArrowFunction(s, i);if (o) return o;
							}var h = this.startNodeAt(s, i);h.callee = e;var p = this.tsTryParseTypeArgumentsInExpression();if (p) return h.arguments = this.parseCallExpressionArguments(E.parenR, !1), h.typeParameters = p, this.finishCallExpression(h);
						}return t.prototype.parseSubscript.call(this, e, s, i, r, a);
					}, e.prototype.parseNewArguments = function (e) {
						var s = this;if (this.isRelational("<")) {
							var i = this.tsTryParseAndCatch(function () {
								var t = s.tsParseTypeArguments();return s.match(E.parenL) || s.unexpected(), t;
							});i && (e.typeParameters = i);
						}t.prototype.parseNewArguments.call(this, e);
					}, e.prototype.parseExprOp = function (e, s, i, r, a) {
						if (y(E._in.binop) > r && !this.hasPrecedingLineBreak() && this.eatContextual("as")) {
							var n = this.startNodeAt(s, i);return n.expression = e, n.typeAnnotation = this.tsParseType(), this.finishNode(n, "TSAsExpression"), this.parseExprOp(n, s, i, r, a);
						}return t.prototype.parseExprOp.call(this, e, s, i, r, a);
					}, e.prototype.checkReservedWord = function (t, e, s, i) {}, e.prototype.checkDuplicateExports = function () {}, e.prototype.parseImport = function (e) {
						return this.match(E.name) && this.lookahead().type === E.eq ? this.tsParseImportEqualsDeclaration(e) : t.prototype.parseImport.call(this, e);
					}, e.prototype.parseExport = function (e) {
						if (this.match(E._import)) return this.expect(E._import), this.tsParseImportEqualsDeclaration(e, !0);if (this.eat(E.eq)) {
							var s = e;return s.expression = this.parseExpression(), this.semicolon(), this.finishNode(s, "TSExportAssignment");
						}if (this.eatContextual("as")) {
							var i = e;return this.expectContextual("namespace"), i.id = this.parseIdentifier(), this.semicolon(), this.finishNode(i, "TSNamespaceExportDeclaration");
						}return t.prototype.parseExport.call(this, e);
					}, e.prototype.parseStatementContent = function (e, s) {
						if (this.state.type === E._const) {
							var i = this.lookahead();if (i.type === E.name && "enum" === i.value) {
								var r = this.startNode();return this.expect(E._const), this.expectContextual("enum"), this.tsParseEnumDeclaration(r, !0);
							}
						}return t.prototype.parseStatementContent.call(this, e, s);
					}, e.prototype.parseAccessModifier = function () {
						return this.tsParseModifier(["public", "protected", "private"]);
					}, e.prototype.parseClassMember = function (e, s, i) {
						var r = this.parseAccessModifier();r && (s.accessibility = r), t.prototype.parseClassMember.call(this, e, s, i);
					}, e.prototype.parseClassMemberWithIsStatic = function (e, s, i, r) {
						var a = s,
						    n = s,
						    o = s,
						    h = !1,
						    p = !1;switch (this.tsParseModifier(["abstract", "readonly"])) {case "readonly":
								p = !0, h = !!this.tsParseModifier(["abstract"]);break;case "abstract":
								h = !0, p = !!this.tsParseModifier(["readonly"]);}if (h && (a.abstract = !0), p && (o.readonly = !0), !h && !r && !a.accessibility) {
							var c = this.tsTryParseIndexSignature(s);if (c) return void e.body.push(c);
						}if (p) return a.static = r, this.parseClassPropertyName(n), this.parsePostMemberNameModifiers(a), void this.pushClassProperty(e, n);t.prototype.parseClassMemberWithIsStatic.call(this, e, s, i, r);
					}, e.prototype.parsePostMemberNameModifiers = function (t) {
						this.eat(E.question) && (t.optional = !0);
					}, e.prototype.parseExpressionStatement = function (e, s) {
						return ("Identifier" === s.type ? this.tsParseExpressionStatement(e, s) : void 0) || t.prototype.parseExpressionStatement.call(this, e, s);
					}, e.prototype.shouldParseExportDeclaration = function () {
						if (this.match(E.name)) switch (this.state.value) {case "abstract":case "declare":case "enum":case "interface":case "module":case "namespace":case "type":
								return !0;}return t.prototype.shouldParseExportDeclaration.call(this);
					}, e.prototype.parseConditional = function (e, s, i, r, a) {
						if (!a || !this.match(E.question)) return t.prototype.parseConditional.call(this, e, s, i, r, a);var n = this.state.clone();try {
							return t.prototype.parseConditional.call(this, e, s, i, r);
						} catch (t) {
							if (!(t instanceof SyntaxError)) throw t;return this.state = n, a.start = t.pos || this.state.start, e;
						}
					}, e.prototype.parseParenItem = function (e, s, i) {
						if (e = t.prototype.parseParenItem.call(this, e, s, i), this.eat(E.question) && (e.optional = !0), this.match(E.colon)) {
							var r = this.startNodeAt(s, i);return r.expression = e, r.typeAnnotation = this.tsParseTypeAnnotation(), this.finishNode(r, "TypeCastExpression");
						}return e;
					}, e.prototype.parseExportDeclaration = function (e) {
						var s = this.eatContextual("declare"),
						    i = void 0;return this.match(E.name) && (i = this.tsTryParseExportDeclaration()), i || (i = t.prototype.parseExportDeclaration.call(this, e)), i && s && (i.declare = !0), i;
					}, e.prototype.parseClassId = function (e, s, i) {
						var r;if (s && !i || !this.isContextual("implements")) {
							(r = t.prototype.parseClassId).call.apply(r, [this].concat(Array.prototype.slice.call(arguments)));var a = this.tsTryParseTypeParameters();a && (e.typeParameters = a);
						}
					}, e.prototype.parseClassProperty = function (e) {
						var s = this.tsTryParseTypeAnnotation();return s && (e.typeAnnotation = s), t.prototype.parseClassProperty.call(this, e);
					}, e.prototype.pushClassMethod = function (e, s, i, r, a) {
						var n = this.tsTryParseTypeParameters();n && (s.typeParameters = n), t.prototype.pushClassMethod.call(this, e, s, i, r, a);
					}, e.prototype.pushClassPrivateMethod = function (e, s, i, r) {
						var a = this.tsTryParseTypeParameters();a && (s.typeParameters = a), t.prototype.pushClassPrivateMethod.call(this, e, s, i, r);
					}, e.prototype.parseClassSuper = function (e) {
						t.prototype.parseClassSuper.call(this, e), e.superClass && this.isRelational("<") && (e.superTypeParameters = this.tsParseTypeArguments()), this.eatContextual("implements") && (e.implements = this.tsParseHeritageClause());
					}, e.prototype.parseObjPropValue = function (e) {
						var s;if (this.isRelational("<")) throw new Error("TODO");for (var i = arguments.length, r = Array(i > 1 ? i - 1 : 0), a = 1; a < i; a++) {
							r[a - 1] = arguments[a];
						}(s = t.prototype.parseObjPropValue).call.apply(s, [this, e].concat(r));
					}, e.prototype.parseFunctionParams = function (e) {
						var s = this.tsTryParseTypeParameters();s && (e.typeParameters = s), t.prototype.parseFunctionParams.call(this, e);
					}, e.prototype.parseVarHead = function (e) {
						t.prototype.parseVarHead.call(this, e);var s = this.tsTryParseTypeAnnotation();s && (e.id.typeAnnotation = s, this.finishNode(e.id, e.id.type));
					}, e.prototype.parseAsyncArrowFromCallExpression = function (e, s) {
						return this.match(E.colon) && (e.returnType = this.tsParseTypeAnnotation()), t.prototype.parseAsyncArrowFromCallExpression.call(this, e, s);
					}, e.prototype.parseMaybeAssign = function () {
						for (var e = void 0, s = arguments.length, i = Array(s), r = 0; r < s; r++) {
							i[r] = arguments[r];
						}if (this.match(E.jsxTagStart)) {
							m(this.curContext() === U.j_oTag), m(this.state.context[this.state.context.length - 2] === U.j_expr);var a = this.state.clone();try {
								var n;return (n = t.prototype.parseMaybeAssign).call.apply(n, [this].concat(i));
							} catch (t) {
								if (!(t instanceof SyntaxError)) throw t;this.state = a, m(this.curContext() === U.j_oTag), this.state.context.pop(), m(this.curContext() === U.j_expr), this.state.context.pop(), e = t;
							}
						}if (void 0 === e && !this.isRelational("<")) {
							var o;return (o = t.prototype.parseMaybeAssign).call.apply(o, [this].concat(i));
						}var h = void 0,
						    p = void 0,
						    c = this.state.clone();try {
							var l;p = this.tsParseTypeParameters(), "ArrowFunctionExpression" !== (h = (l = t.prototype.parseMaybeAssign).call.apply(l, [this].concat(i))).type && this.unexpected();
						} catch (s) {
							var u;if (!(s instanceof SyntaxError)) throw s;if (e) throw e;return m(!this.hasPlugin("jsx")), this.state = c, (u = t.prototype.parseMaybeAssign).call.apply(u, [this].concat(i));
						}return p && 0 !== p.params.length && this.resetStartLocationFromNode(h, p.params[0]), h.typeParameters = p, h;
					}, e.prototype.parseMaybeUnary = function (e) {
						return !this.hasPlugin("jsx") && this.eatRelational("<") ? this.tsParseTypeAssertion() : t.prototype.parseMaybeUnary.call(this, e);
					}, e.prototype.parseArrow = function (e) {
						if (this.match(E.colon)) {
							var s = this.state.clone();try {
								var i = this.tsParseTypeOrTypePredicateAnnotation(E.colon);this.canInsertSemicolon() && this.unexpected(), this.match(E.arrow) || this.unexpected(), e.returnType = i;
							} catch (t) {
								if (!(t instanceof SyntaxError)) throw t;this.state = s;
							}
						}return t.prototype.parseArrow.call(this, e);
					}, e.prototype.parseAssignableListItemTypes = function (t) {
						if (this.eat(E.question)) {
							if ("Identifier" !== t.type) throw this.raise(t.start, "A binding pattern parameter cannot be optional in an implementation signature.");t.optional = !0;
						}var e = this.tsTryParseTypeAnnotation();return e && (t.typeAnnotation = e), this.finishNode(t, t.type);
					}, e.prototype.toAssignable = function (e, s, i) {
						switch (e.type) {case "TypeCastExpression":
								return t.prototype.toAssignable.call(this, this.typeCastToParameter(e), s, i);case "TSParameterProperty":default:
								return t.prototype.toAssignable.call(this, e, s, i);}
					}, e.prototype.checkLVal = function (e, s, i, r) {
						switch (e.type) {case "TypeCastExpression":
								return;case "TSParameterProperty":
								return void this.checkLVal(e.parameter, s, i, "parameter property");default:
								return void t.prototype.checkLVal.call(this, e, s, i, r);}
					}, e.prototype.parseBindingAtom = function () {
						switch (this.state.type) {case E._this:
								return this.parseIdentifier(!0);default:
								return t.prototype.parseBindingAtom.call(this);}
					}, e.prototype.isClassMethod = function () {
						return this.isRelational("<") || t.prototype.isClassMethod.call(this);
					}, e.prototype.isClassProperty = function () {
						return this.match(E.colon) || t.prototype.isClassProperty.call(this);
					}, e.prototype.parseMaybeDefault = function () {
						for (var e, s = arguments.length, i = Array(s), r = 0; r < s; r++) {
							i[r] = arguments[r];
						}var a = (e = t.prototype.parseMaybeDefault).call.apply(e, [this].concat(i));return "AssignmentPattern" === a.type && a.typeAnnotation && a.right.start < a.typeAnnotation.start && this.raise(a.typeAnnotation.start, "Type annotations must come before default assignments, e.g. instead of `age = 25: number` use `age: number = 25`"), a;
					}, e.prototype.readToken = function (e) {
						return !this.state.inType || 62 !== e && 60 !== e ? t.prototype.readToken.call(this, e) : this.finishOp(E.relational, 1);
					}, e.prototype.toAssignableList = function (e, s, i) {
						for (var r = 0; r < e.length; r++) {
							var a = e[r];a && "TypeCastExpression" === a.type && (e[r] = this.typeCastToParameter(a));
						}return t.prototype.toAssignableList.call(this, e, s, i);
					}, e.prototype.typeCastToParameter = function (t) {
						return t.expression.typeAnnotation = t.typeAnnotation, this.finishNodeAt(t.expression, t.expression.type, t.typeAnnotation.end, t.typeAnnotation.loc.end);
					}, e.prototype.toReferencedList = function (t) {
						for (var e = 0; e < t.length; e++) {
							var s = t[e];s && s._exprListItem && "TypeCastExpression" === s.type && this.raise(s.start, "Did not expect a type annotation here.");
						}return t;
					}, e.prototype.shouldParseArrow = function () {
						return this.match(E.colon) || t.prototype.shouldParseArrow.call(this);
					}, e.prototype.shouldParseAsyncArrow = function () {
						return this.match(E.colon) || t.prototype.shouldParseAsyncArrow.call(this);
					}, e;
				}(t);
			};et.estree = it, et.flow = nt, et.jsx = ct, et.typescript = lt;var ut = {};e.parse = v, e.parseExpression = P, e.tokTypes = E;
		});var createError = parserCreateError;var parserBabylon = parse;module.exports = parserBabylon;
	});

	var parserBabylon = unwrapExports(parserBabylon_1);

	return parserBabylon;
}();
