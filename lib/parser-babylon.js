"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
		}function parse(t) {
			var e = index,
			    s = { sourceType: "module", allowImportExportEverywhere: !0, allowReturnOutsideFunction: !0, plugins: ["jsx", "flow", "doExpressions", "objectRestSpread", "decorators", "classProperties", "exportExtensions", "asyncGenerators", "functionBind", "functionSent", "dynamicImport", "numericSeparator"] };var i = void 0;try {
				i = e.parse(t, s);
			} catch (r) {
				try {
					i = e.parse(t, Object.assign({}, s, { strictMode: !1 }));
				} catch (t) {
					throw createError(r.message.replace(/ \(.*\)/, ""), { start: { line: r.loc.line, column: r.loc.column + 1 } });
				}
			}return delete i.tokens, i;
		}var parserCreateError = createError$1,
		    index = createCommonjsModule$$1(function (t, e) {
			function s(t) {
				var e = {};for (var s in b) {
					e[s] = t && s in t ? t[s] : b[s];
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
				return t < 65 ? 36 === t : t < 91 || (t < 97 ? 95 === t : t < 123 || (t <= 65535 ? t >= 170 && j.test(String.fromCharCode(t)) : r(t, D)));
			}function n(t) {
				return t < 48 ? 36 === t : t < 58 || !(t < 65) && (t < 91 || (t < 97 ? 95 === t : t < 123 || (t <= 65535 ? t >= 170 && R.test(String.fromCharCode(t)) : r(t, D) || r(t, O))));
			}function o(t) {
				return 10 === t || 13 === t || 8232 === t || 8233 === t;
			}function h(t, e) {
				for (var s = 1, i = 0;;) {
					F.lastIndex = i;var r = F.exec(t);if (!(r && r.index < e)) return new U(s, e - i);++s, i = r.index + r[0].length;
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
			}function m(t, e) {
				return x(e, t).parse();
			}function y(t, e) {
				var s = x(e, t);return s.options.strictMode && (s.state.strict = !0), s.getExpression();
			}function x(t, e) {
				return new (t && t.plugins ? v(t.plugins) : et)(t, e);
			}function v(t) {
				var e = t.filter(function (t) {
					return "estree" === t || "flow" === t || "jsx" === t;
				});e.indexOf("flow") >= 0 && (e = e.filter(function (t) {
					return "flow" !== t;
				})).push("flow"), e.indexOf("estree") >= 0 && (e = e.filter(function (t) {
					return "estree" !== t;
				})).unshift("estree");var s = e.join("/"),
				    i = ct[s];if (!i) {
					i = et;for (var r = e, a = Array.isArray(r), n = 0, r = a ? r : r[Symbol.iterator]();;) {
						var o;if (a) {
							if (n >= r.length) break;o = r[n++];
						} else {
							if ((n = r.next()).done) break;o = n.value;
						}i = tt[o](i);
					}ct[s] = i;
				}return i;
			}Object.defineProperty(e, "__esModule", { value: !0 });var b = { sourceType: "script", sourceFilename: void 0, startLine: 1, allowReturnOutsideFunction: !1, allowImportExportEverywhere: !1, allowSuperOutsideMethod: !1, plugins: [], strictMode: null, ranges: !1 },
			    g = function g(t, e) {
				if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
			},
			    w = function w(t, e) {
				if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function, not " + (typeof e === "undefined" ? "undefined" : _typeof(e)));t.prototype = Object.create(e && e.prototype, { constructor: { value: t, enumerable: !1, writable: !0, configurable: !0 } }), e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e);
			},
			    P = function P(t, e) {
				if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e || "object" != (typeof e === "undefined" ? "undefined" : _typeof(e)) && "function" != typeof e ? t : e;
			},
			    A = !0,
			    k = function t(e) {
				var s = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};g(this, t), this.label = e, this.keyword = s.keyword, this.beforeExpr = !!s.beforeExpr, this.startsExpr = !!s.startsExpr, this.rightAssociative = !!s.rightAssociative, this.isLoop = !!s.isLoop, this.isAssign = !!s.isAssign, this.prefix = !!s.prefix, this.postfix = !!s.postfix, this.binop = s.binop || null, this.updateContext = null;
			},
			    E = function (t) {
				function e(s) {
					var i = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};return g(this, e), i.keyword = s, P(this, t.call(this, s, i));
				}return w(e, t), e;
			}(k),
			    T = function (t) {
				function e(s, i) {
					return g(this, e), P(this, t.call(this, s, { beforeExpr: A, binop: i }));
				}return w(e, t), e;
			}(k),
			    C = { num: new k("num", { startsExpr: !0 }), regexp: new k("regexp", { startsExpr: !0 }), string: new k("string", { startsExpr: !0 }), name: new k("name", { startsExpr: !0 }), eof: new k("eof"), bracketL: new k("[", { beforeExpr: A, startsExpr: !0 }), bracketR: new k("]"), braceL: new k("{", { beforeExpr: A, startsExpr: !0 }), braceBarL: new k("{|", { beforeExpr: A, startsExpr: !0 }), braceR: new k("}"), braceBarR: new k("|}"), parenL: new k("(", { beforeExpr: A, startsExpr: !0 }), parenR: new k(")"), comma: new k(",", { beforeExpr: A }), semi: new k(";", { beforeExpr: A }), colon: new k(":", { beforeExpr: A }), doubleColon: new k("::", { beforeExpr: A }), dot: new k("."), question: new k("?", { beforeExpr: A }), questionDot: new k("?."), arrow: new k("=>", { beforeExpr: A }), template: new k("template"), ellipsis: new k("...", { beforeExpr: A }), backQuote: new k("`", { startsExpr: !0 }), dollarBraceL: new k("${", { beforeExpr: A, startsExpr: !0 }), at: new k("@"), hash: new k("#"), eq: new k("=", { beforeExpr: A, isAssign: !0 }), assign: new k("_=", { beforeExpr: A, isAssign: !0 }), incDec: new k("++/--", { prefix: !0, postfix: !0, startsExpr: !0 }), prefix: new k("prefix", { beforeExpr: A, prefix: !0, startsExpr: !0 }), logicalOR: new T("||", 1), logicalAND: new T("&&", 2), bitwiseOR: new T("|", 3), bitwiseXOR: new T("^", 4), bitwiseAND: new T("&", 5), equality: new T("==/!=", 6), relational: new T("</>", 7), bitShift: new T("<</>>", 8), plusMin: new k("+/-", { beforeExpr: A, binop: 9, prefix: !0, startsExpr: !0 }), modulo: new T("%", 10), star: new T("*", 10), slash: new T("/", 10), exponent: new k("**", { beforeExpr: A, binop: 11, rightAssociative: !0 }) },
			    N = { break: new E("break"), case: new E("case", { beforeExpr: A }), catch: new E("catch"), continue: new E("continue"), debugger: new E("debugger"), default: new E("default", { beforeExpr: A }), do: new E("do", { isLoop: !0, beforeExpr: A }), else: new E("else", { beforeExpr: A }), finally: new E("finally"), for: new E("for", { isLoop: !0 }), function: new E("function", { startsExpr: !0 }), if: new E("if"), return: new E("return", { beforeExpr: A }), switch: new E("switch"), throw: new E("throw", { beforeExpr: A }), try: new E("try"), var: new E("var"), let: new E("let"), const: new E("const"), while: new E("while", { isLoop: !0 }), with: new E("with"), new: new E("new", { beforeExpr: A, startsExpr: !0 }), this: new E("this", { startsExpr: !0 }), super: new E("super", { startsExpr: !0 }), class: new E("class"), extends: new E("extends", { beforeExpr: A }), export: new E("export"), import: new E("import", { startsExpr: !0 }), yield: new E("yield", { beforeExpr: A, startsExpr: !0 }), null: new E("null", { startsExpr: !0 }), true: new E("true", { startsExpr: !0 }), false: new E("false", { startsExpr: !0 }), in: new E("in", { beforeExpr: A, binop: 7 }), instanceof: new E("instanceof", { beforeExpr: A, binop: 7 }), typeof: new E("typeof", { beforeExpr: A, prefix: !0, startsExpr: !0 }), void: new E("void", { beforeExpr: A, prefix: !0, startsExpr: !0 }), delete: new E("delete", { beforeExpr: A, prefix: !0, startsExpr: !0 }) };Object.keys(N).forEach(function (t) {
				C["_" + t] = N[t];
			});var S = { 6: i("enum await"), strict: i("implements interface let package private protected public static yield"), strictBind: i("eval arguments") },
			    L = i("break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this let const class extends export import yield super"),
			    I = "ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠ-ࢴࢶ-ࢽऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡૹଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘ-ౚౠౡಀಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൔ-ൖൟ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᲀ-ᲈᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿕ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞮꞰ-ꞷꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꣽꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭥꭰ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ",
			    _ = "‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛ࣔ-ࣣ࣡-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఃా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ഁ-ഃാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ංඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ູົຼ່-ໍ໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠐-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭ᳲ-᳴᳸᳹᷀-᷵᷻-᷿‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯꘠-꘩꙯ꙴ-꙽ꚞꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧꢀꢁꢴ-ꣅ꣐-꣙꣠-꣱꤀-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︯︳︴﹍-﹏０-９＿",
			    j = new RegExp("[" + I + "]"),
			    R = new RegExp("[" + I + _ + "]");I = _ = null;var D = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 17, 26, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 26, 45, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 785, 52, 76, 44, 33, 24, 27, 35, 42, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 85, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 159, 52, 19, 3, 54, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 86, 25, 391, 63, 32, 0, 449, 56, 264, 8, 2, 36, 18, 0, 50, 29, 881, 921, 103, 110, 18, 195, 2749, 1070, 4050, 582, 8634, 568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 881, 68, 12, 0, 67, 12, 65, 0, 32, 6124, 20, 754, 9486, 1, 3071, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 4149, 196, 60, 67, 1213, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42710, 42, 4148, 12, 221, 3, 5761, 10591, 541],
			    O = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 1306, 2, 54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 52, 0, 13, 2, 49, 13, 10, 2, 4, 9, 83, 11, 7, 0, 161, 11, 6, 9, 7, 3, 57, 0, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 193, 17, 10, 9, 87, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 84, 14, 5, 9, 423, 9, 838, 7, 2, 7, 17, 9, 57, 21, 2, 13, 19882, 9, 135, 4, 60, 6, 26, 9, 1016, 45, 17, 3, 19723, 1, 5319, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 2214, 6, 110, 6, 6, 9, 792487, 239],
			    M = /\r\n?|\n|\u2028|\u2029/,
			    F = new RegExp(M.source, "g"),
			    B = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/,
			    q = function t(e, s, i, r) {
				g(this, t), this.token = e, this.isExpr = !!s, this.preserveSpace = !!i, this.override = r;
			},
			    V = { braceStatement: new q("{", !1), braceExpression: new q("{", !0), templateQuasi: new q("${", !0), parenStatement: new q("(", !1), parenExpression: new q("(", !0), template: new q("`", !0, !0, function (t) {
					return t.readTmplToken();
				}), functionExpression: new q("function", !0) };C.parenR.updateContext = C.braceR.updateContext = function () {
				if (1 !== this.state.context.length) {
					var t = this.state.context.pop();t === V.braceStatement && this.curContext() === V.functionExpression ? (this.state.context.pop(), this.state.exprAllowed = !1) : t === V.templateQuasi ? this.state.exprAllowed = !0 : this.state.exprAllowed = !t.isExpr;
				} else this.state.exprAllowed = !0;
			}, C.name.updateContext = function (t) {
				this.state.exprAllowed = !1, t !== C._let && t !== C._const && t !== C._var || M.test(this.input.slice(this.state.end)) && (this.state.exprAllowed = !0);
			}, C.braceL.updateContext = function (t) {
				this.state.context.push(this.braceIsBlock(t) ? V.braceStatement : V.braceExpression), this.state.exprAllowed = !0;
			}, C.dollarBraceL.updateContext = function () {
				this.state.context.push(V.templateQuasi), this.state.exprAllowed = !0;
			}, C.parenL.updateContext = function (t) {
				var e = t === C._if || t === C._for || t === C._with || t === C._while;this.state.context.push(e ? V.parenStatement : V.parenExpression), this.state.exprAllowed = !0;
			}, C.incDec.updateContext = function () {}, C._function.updateContext = function () {
				this.curContext() !== V.braceStatement && this.state.context.push(V.functionExpression), this.state.exprAllowed = !1;
			}, C.backQuote.updateContext = function () {
				this.curContext() === V.template ? this.state.context.pop() : this.state.context.push(V.template), this.state.exprAllowed = !1;
			};var U = function t(e, s) {
				g(this, t), this.line = e, this.column = s;
			},
			    X = function t(e, s) {
				g(this, t), this.start = e, this.end = s;
			},
			    J = function (t) {
				function e() {
					return g(this, e), P(this, t.apply(this, arguments));
				}return w(e, t), e.prototype.raise = function (t, e) {
					var s = h(this.input, t);e += " (" + s.line + ":" + s.column + ")";var i = new SyntaxError(e);throw i.pos = t, i.loc = s, i;
				}, e;
			}(function (t) {
				function e() {
					return g(this, e), P(this, t.apply(this, arguments));
				}return w(e, t), e.prototype.addComment = function (t) {
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
						}if (!i && s && (i = s), s && ("ObjectProperty" === s.type || "CallExpression" === t.type) && this.state.leadingComments.length > 0 && p(this.state.leadingComments).start >= t.start && this.state.commentPreviousNode) {
							for (n = 0; n < this.state.leadingComments.length; n++) {
								this.state.leadingComments[n].end < this.state.commentPreviousNode.end && (this.state.leadingComments.splice(n, 1), n--);
							}this.state.leadingComments.length > 0 && (s.trailingComments = this.state.leadingComments, this.state.leadingComments = []);
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
							for (a = 0; a < this.state.leadingComments.length && !(this.state.leadingComments[a].end > t.start); a++) {}var h = this.state.leadingComments.slice(0, a);t.leadingComments = 0 === h.length ? null : h, 0 === (r = this.state.leadingComments.slice(a)).length && (r = null);
						}this.state.commentPreviousNode = t, r && (r.length && r[0].start >= t.start && p(r).end <= t.end ? t.innerComments = r : t.trailingComments = r), e.push(t);
					}
				}, e;
			}(function () {
				function t() {
					g(this, t);
				}return t.prototype.isReservedWord = function (t) {
					return "await" === t ? this.inModule : S[6](t);
				}, t.prototype.hasPlugin = function (t) {
					return !!this.plugins[t];
				}, t;
			}())),
			    W = function () {
				function t() {
					g(this, t);
				}return t.prototype.init = function (t, e) {
					this.strict = !1 !== t.strictMode && "module" === t.sourceType, this.input = e, this.potentialArrowAt = -1, this.inMethod = this.inFunction = this.inGenerator = this.inAsync = this.inPropertyName = this.inType = this.inClass = this.inClassProperty = this.noAnonFunctionType = !1, this.labels = [], this.decorators = [], this.tokens = [], this.comments = [], this.trailingComments = [], this.leadingComments = [], this.commentStack = [], this.pos = this.lineStart = 0, this.curLine = t.startLine, this.type = C.eof, this.value = null, this.start = this.end = this.pos, this.startLoc = this.endLoc = this.curPosition(), this.lastTokEndLoc = this.lastTokStartLoc = null, this.lastTokStart = this.lastTokEnd = this.pos, this.context = [V.braceStatement], this.exprAllowed = !0, this.containsEsc = this.containsOctal = !1, this.octalPosition = null, this.invalidTemplateEscapePosition = null, this.exportedIdentifiers = [];
				}, t.prototype.curPosition = function () {
					return new U(this.curLine, this.pos - this.lineStart);
				}, t.prototype.clone = function (e) {
					var s = new t();for (var i in this) {
						var r = this[i];e && "context" !== i || !Array.isArray(r) || (r = r.slice()), s[i] = r;
					}return s;
				}, t;
			}(),
			    G = { decBinOct: [46, 66, 69, 79, 95, 98, 101, 111], hex: [46, 88, 95, 120] },
			    K = function t(e) {
				g(this, t), this.type = e.type, this.value = e.value, this.start = e.start, this.end = e.end, this.loc = new X(e.startLoc, e.endLoc);
			},
			    z = function (t) {
				function e() {
					return g(this, e), P(this, t.apply(this, arguments));
				}return w(e, t), e.prototype.addExtra = function (t, e, s) {
					t && ((t.extra = t.extra || {})[e] = s);
				}, e.prototype.isRelational = function (t) {
					return this.match(C.relational) && this.state.value === t;
				}, e.prototype.expectRelational = function (t) {
					this.isRelational(t) ? this.next() : this.unexpected(null, C.relational);
				}, e.prototype.isContextual = function (t) {
					return this.match(C.name) && this.state.value === t;
				}, e.prototype.eatContextual = function (t) {
					return this.state.value === t && this.eat(C.name);
				}, e.prototype.expectContextual = function (t, e) {
					this.eatContextual(t) || this.unexpected(null, e);
				}, e.prototype.canInsertSemicolon = function () {
					return this.match(C.eof) || this.match(C.braceR) || M.test(this.input.slice(this.state.lastTokEnd, this.state.start));
				}, e.prototype.isLineTerminator = function () {
					return this.eat(C.semi) || this.canInsertSemicolon();
				}, e.prototype.semicolon = function () {
					this.isLineTerminator() || this.unexpected(null, C.semi);
				}, e.prototype.expect = function (t, e) {
					this.eat(t) || this.unexpected(e, t);
				}, e.prototype.unexpected = function (t) {
					var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "Unexpected token";throw "string" != typeof e && (e = "Unexpected token, expected " + e.label), this.raise(null != t ? t : this.state.start, e);
				}, e;
			}(function (t) {
				function e(s, i) {
					g(this, e);var r = P(this, t.call(this));return r.state = new W(), r.state.init(s, i), r;
				}return w(e, t), e.prototype.next = function () {
					this.isLookahead || this.state.tokens.push(new K(this.state)), this.state.lastTokEnd = this.state.end, this.state.lastTokStart = this.state.start, this.state.lastTokEndLoc = this.state.endLoc, this.state.lastTokStartLoc = this.state.startLoc, this.nextToken();
				}, e.prototype.eat = function (t) {
					return !!this.match(t) && (this.next(), !0);
				}, e.prototype.match = function (t) {
					return this.state.type === t;
				}, e.prototype.isKeyword = function (t) {
					return L(t);
				}, e.prototype.lookahead = function () {
					var t = this.state;this.state = t.clone(!0), this.isLookahead = !0, this.next(), this.isLookahead = !1;var e = this.state.clone(!0);return this.state = t, e;
				}, e.prototype.setStrict = function (t) {
					if (this.state.strict = t, this.match(C.num) || this.match(C.string)) {
						for (this.state.pos = this.state.start; this.state.pos < this.state.lineStart;) {
							this.state.lineStart = this.input.lastIndexOf("\n", this.state.lineStart - 2) + 1, --this.state.curLine;
						}this.nextToken();
					}
				}, e.prototype.curContext = function () {
					return this.state.context[this.state.context.length - 1];
				}, e.prototype.nextToken = function () {
					var t = this.curContext();return t && t.preserveSpace || this.skipSpace(), this.state.containsOctal = !1, this.state.octalPosition = null, this.state.start = this.state.pos, this.state.startLoc = this.state.curPosition(), this.state.pos >= this.input.length ? this.finishToken(C.eof) : t.override ? t.override(this) : this.readToken(this.fullCharCodeAtPos());
				}, e.prototype.readToken = function (t) {
					return a(t) || 92 === t ? this.readWord() : this.getTokenFromCode(t);
				}, e.prototype.fullCharCodeAtPos = function () {
					var t = this.input.charCodeAt(this.state.pos);return t <= 55295 || t >= 57344 ? t : (t << 10) + this.input.charCodeAt(this.state.pos + 1) - 56613888;
				}, e.prototype.pushComment = function (t, e, s, i, r, a) {
					var n = { type: t ? "CommentBlock" : "CommentLine", value: e, start: s, end: i, loc: new X(r, a) };this.isLookahead || (this.state.tokens.push(n), this.state.comments.push(n), this.addComment(n));
				}, e.prototype.skipBlockComment = function () {
					var t = this.state.curPosition(),
					    e = this.state.pos,
					    s = this.input.indexOf("*/", this.state.pos += 2);-1 === s && this.raise(this.state.pos - 2, "Unterminated comment"), this.state.pos = s + 2, F.lastIndex = e;for (var i = void 0; (i = F.exec(this.input)) && i.index < this.state.pos;) {
						++this.state.curLine, this.state.lineStart = i.index + i[0].length;
					}this.pushComment(!0, this.input.slice(e + 2, s), e, this.state.pos, t, this.state.curPosition());
				}, e.prototype.skipLineComment = function (t) {
					for (var e = this.state.pos, s = this.state.curPosition(), i = this.input.charCodeAt(this.state.pos += t); this.state.pos < this.input.length && 10 !== i && 13 !== i && 8232 !== i && 8233 !== i;) {
						++this.state.pos, i = this.input.charCodeAt(this.state.pos);
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
								if (!(t > 8 && t < 14 || t >= 5760 && B.test(String.fromCharCode(t)))) break t;++this.state.pos;}
					}
				}, e.prototype.finishToken = function (t, e) {
					this.state.end = this.state.pos, this.state.endLoc = this.state.curPosition();var s = this.state.type;this.state.type = t, this.state.value = e, this.updateContext(s);
				}, e.prototype.readToken_dot = function () {
					var t = this.input.charCodeAt(this.state.pos + 1);if (t >= 48 && t <= 57) return this.readNumber(!0);var e = this.input.charCodeAt(this.state.pos + 2);return 46 === t && 46 === e ? (this.state.pos += 3, this.finishToken(C.ellipsis)) : (++this.state.pos, this.finishToken(C.dot));
				}, e.prototype.readToken_slash = function () {
					return this.state.exprAllowed ? (++this.state.pos, this.readRegexp()) : 61 === this.input.charCodeAt(this.state.pos + 1) ? this.finishOp(C.assign, 2) : this.finishOp(C.slash, 1);
				}, e.prototype.readToken_mult_modulo = function (t) {
					var e = 42 === t ? C.star : C.modulo,
					    s = 1,
					    i = this.input.charCodeAt(this.state.pos + 1);return 42 === i && (s++, i = this.input.charCodeAt(this.state.pos + 2), e = C.exponent), 61 === i && (s++, e = C.assign), this.finishOp(e, s);
				}, e.prototype.readToken_pipe_amp = function (t) {
					var e = this.input.charCodeAt(this.state.pos + 1);return e === t ? this.finishOp(124 === t ? C.logicalOR : C.logicalAND, 2) : 61 === e ? this.finishOp(C.assign, 2) : 124 === t && 125 === e && this.hasPlugin("flow") ? this.finishOp(C.braceBarR, 2) : this.finishOp(124 === t ? C.bitwiseOR : C.bitwiseAND, 1);
				}, e.prototype.readToken_caret = function () {
					return 61 === this.input.charCodeAt(this.state.pos + 1) ? this.finishOp(C.assign, 2) : this.finishOp(C.bitwiseXOR, 1);
				}, e.prototype.readToken_plus_min = function (t) {
					var e = this.input.charCodeAt(this.state.pos + 1);return e === t ? 45 === e && 62 === this.input.charCodeAt(this.state.pos + 2) && M.test(this.input.slice(this.state.lastTokEnd, this.state.pos)) ? (this.skipLineComment(3), this.skipSpace(), this.nextToken()) : this.finishOp(C.incDec, 2) : 61 === e ? this.finishOp(C.assign, 2) : this.finishOp(C.plusMin, 1);
				}, e.prototype.readToken_lt_gt = function (t) {
					var e = this.input.charCodeAt(this.state.pos + 1),
					    s = 1;return e === t ? (s = 62 === t && 62 === this.input.charCodeAt(this.state.pos + 2) ? 3 : 2, 61 === this.input.charCodeAt(this.state.pos + s) ? this.finishOp(C.assign, s + 1) : this.finishOp(C.bitShift, s)) : 33 === e && 60 === t && 45 === this.input.charCodeAt(this.state.pos + 2) && 45 === this.input.charCodeAt(this.state.pos + 3) ? (this.inModule && this.unexpected(), this.skipLineComment(4), this.skipSpace(), this.nextToken()) : (61 === e && (s = 2), this.finishOp(C.relational, s));
				}, e.prototype.readToken_eq_excl = function (t) {
					var e = this.input.charCodeAt(this.state.pos + 1);return 61 === e ? this.finishOp(C.equality, 61 === this.input.charCodeAt(this.state.pos + 2) ? 3 : 2) : 61 === t && 62 === e ? (this.state.pos += 2, this.finishToken(C.arrow)) : this.finishOp(61 === t ? C.eq : C.prefix, 1);
				}, e.prototype.readToken_question = function () {
					var t = this.input.charCodeAt(this.state.pos + 1),
					    e = this.input.charCodeAt(this.state.pos + 2);return 46 !== t || e >= 48 && e <= 57 ? (++this.state.pos, this.finishToken(C.question)) : (this.state.pos += 2, this.finishToken(C.questionDot));
				}, e.prototype.getTokenFromCode = function (t) {
					switch (t) {case 35:
							if (this.hasPlugin("classPrivateProperties") && this.state.inClass) return ++this.state.pos, this.finishToken(C.hash);this.raise(this.state.pos, "Unexpected character '" + c(t) + "'");case 46:
							return this.readToken_dot();case 40:
							return ++this.state.pos, this.finishToken(C.parenL);case 41:
							return ++this.state.pos, this.finishToken(C.parenR);case 59:
							return ++this.state.pos, this.finishToken(C.semi);case 44:
							return ++this.state.pos, this.finishToken(C.comma);case 91:
							return ++this.state.pos, this.finishToken(C.bracketL);case 93:
							return ++this.state.pos, this.finishToken(C.bracketR);case 123:
							return this.hasPlugin("flow") && 124 === this.input.charCodeAt(this.state.pos + 1) ? this.finishOp(C.braceBarL, 2) : (++this.state.pos, this.finishToken(C.braceL));case 125:
							return ++this.state.pos, this.finishToken(C.braceR);case 58:
							return this.hasPlugin("functionBind") && 58 === this.input.charCodeAt(this.state.pos + 1) ? this.finishOp(C.doubleColon, 2) : (++this.state.pos, this.finishToken(C.colon));case 63:
							return this.readToken_question();case 64:
							return ++this.state.pos, this.finishToken(C.at);case 96:
							return ++this.state.pos, this.finishToken(C.backQuote);case 48:
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
							return this.finishOp(C.prefix, 1);}this.raise(this.state.pos, "Unexpected character '" + c(t) + "'");
				}, e.prototype.finishOp = function (t, e) {
					var s = this.input.slice(this.state.pos, this.state.pos + e);return this.state.pos += e, this.finishToken(t, s);
				}, e.prototype.readRegexp = function () {
					for (var t = this.state.pos, e = void 0, s = void 0;;) {
						this.state.pos >= this.input.length && this.raise(t, "Unterminated regular expression");var i = this.input.charAt(this.state.pos);if (M.test(i) && this.raise(t, "Unterminated regular expression"), e) e = !1;else {
							if ("[" === i) s = !0;else if ("]" === i && s) s = !1;else if ("/" === i && !s) break;e = "\\" === i;
						}++this.state.pos;
					}var r = this.input.slice(t, this.state.pos);++this.state.pos;var a = this.readWord1();return a && (/^[gmsiyu]*$/.test(a) || this.raise(t, "Invalid regular expression flag")), this.finishToken(C.regexp, { pattern: r, flags: a });
				}, e.prototype.readInt = function (t, e) {
					for (var s = this.state.pos, i = 16 === t ? G.hex : G.decBinOct, r = 0, a = 0, n = null == e ? 1 / 0 : e; a < n; ++a) {
						var o = this.input.charCodeAt(this.state.pos),
						    h = void 0;if (this.hasPlugin("numericSeparator")) {
							var p = this.input.charCodeAt(this.state.pos - 1),
							    c = this.input.charCodeAt(this.state.pos + 1);if (95 === o) {
								(i.indexOf(p) > -1 || i.indexOf(c) > -1 || Number.isNaN(c)) && this.raise(this.state.pos, "Invalid NumericLiteralSeparator"), ++this.state.pos;continue;
							}
						}if ((h = o >= 97 ? o - 97 + 10 : o >= 65 ? o - 65 + 10 : o >= 48 && o <= 57 ? o - 48 : 1 / 0) >= t) break;++this.state.pos, r = r * t + h;
					}return this.state.pos === s || null != e && this.state.pos - s !== e ? null : r;
				}, e.prototype.readRadixNumber = function (t) {
					this.state.pos += 2;var e = this.readInt(t);return null == e && this.raise(this.state.start + 2, "Expected number in radix " + t), a(this.fullCharCodeAtPos()) && this.raise(this.state.pos, "Identifier directly after number"), this.finishToken(C.num, e);
				}, e.prototype.readNumber = function (t) {
					var e = this.state.pos,
					    s = 48 === this.input.charCodeAt(e),
					    i = !1;t || null !== this.readInt(10) || this.raise(e, "Invalid number"), s && this.state.pos == e + 1 && (s = !1);var r = this.input.charCodeAt(this.state.pos);46 !== r || s || (++this.state.pos, this.readInt(10), i = !0, r = this.input.charCodeAt(this.state.pos)), 69 !== r && 101 !== r || s || (43 !== (r = this.input.charCodeAt(++this.state.pos)) && 45 !== r || ++this.state.pos, null === this.readInt(10) && this.raise(e, "Invalid number"), i = !0), a(this.fullCharCodeAtPos()) && this.raise(this.state.pos, "Identifier directly after number");var n = this.input.slice(e, this.state.pos).replace(/_/g, ""),
					    o = void 0;return i ? o = parseFloat(n) : s && 1 !== n.length ? this.state.strict ? this.raise(e, "Invalid number") : o = /[89]/.test(n) ? parseInt(n, 10) : parseInt(n, 8) : o = parseInt(n, 10), this.finishToken(C.num, o);
				}, e.prototype.readCodePoint = function (t) {
					var e = void 0;if (123 === this.input.charCodeAt(this.state.pos)) {
						var s = ++this.state.pos;if (e = this.readHexChar(this.input.indexOf("}", this.state.pos) - this.state.pos, t), ++this.state.pos, null === e) --this.state.invalidTemplateEscapePosition;else if (e > 1114111) {
							if (!t) return this.state.invalidTemplateEscapePosition = s - 2, null;this.raise(s, "Code point out of bounds");
						}
					} else e = this.readHexChar(4, t);return e;
				}, e.prototype.readString = function (t) {
					for (var e = "", s = ++this.state.pos;;) {
						this.state.pos >= this.input.length && this.raise(this.state.start, "Unterminated string constant");var i = this.input.charCodeAt(this.state.pos);if (i === t) break;92 === i ? (e += this.input.slice(s, this.state.pos), e += this.readEscapedChar(!1), s = this.state.pos) : (o(i) && this.raise(this.state.start, "Unterminated string constant"), ++this.state.pos);
					}return e += this.input.slice(s, this.state.pos++), this.finishToken(C.string, e);
				}, e.prototype.readTmplToken = function () {
					for (var t = "", e = this.state.pos, s = !1;;) {
						this.state.pos >= this.input.length && this.raise(this.state.start, "Unterminated template");var i = this.input.charCodeAt(this.state.pos);if (96 === i || 36 === i && 123 === this.input.charCodeAt(this.state.pos + 1)) return this.state.pos === this.state.start && this.match(C.template) ? 36 === i ? (this.state.pos += 2, this.finishToken(C.dollarBraceL)) : (++this.state.pos, this.finishToken(C.backQuote)) : (t += this.input.slice(e, this.state.pos), this.finishToken(C.template, s ? null : t));if (92 === i) {
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
					    e = C.name;return !this.state.containsEsc && this.isKeyword(t) && (e = N[t]), this.finishToken(e, t);
				}, e.prototype.braceIsBlock = function (t) {
					if (t === C.colon) {
						var e = this.curContext();if (e === V.braceStatement || e === V.braceExpression) return !e.isExpr;
					}return t === C._return ? M.test(this.input.slice(this.state.lastTokEnd, this.state.start)) : t === C._else || t === C.semi || t === C.eof || t === C.parenR || (t === C.braceL ? this.curContext() === V.braceStatement : !this.state.exprAllowed);
				}, e.prototype.updateContext = function (t) {
					var e = this.state.type,
					    s = void 0;!e.keyword || t !== C.dot && t !== C.questionDot ? (s = e.updateContext) ? s.call(this, t) : this.state.exprAllowed = e.beforeExpr : this.state.exprAllowed = !1;
				}, e;
			}(J)),
			    Q = ["leadingComments", "trailingComments", "innerComments"],
			    Y = function () {
				function t(e, s, i) {
					g(this, t), this.type = "", this.start = s, this.end = 0, this.loc = new X(i), e && e.options.ranges && (this.range = [s, 0]), e && e.filename && (this.loc.filename = e.filename);
				}return t.prototype.__clone = function () {
					var e = new t();for (var s in this) {
						Q.indexOf(s) < 0 && (e[s] = this[s]);
					}return e;
				}, t;
			}(),
			    H = [],
			    $ = { kind: "loop" },
			    Z = { kind: "switch" },
			    tt = {},
			    et = function (t) {
				function e(i, r) {
					g(this, e), i = s(i);var a = P(this, t.call(this, i, r));return a.options = i, a.inModule = "module" === a.options.sourceType, a.input = r, a.plugins = l(a.options.plugins), a.filename = i.sourceFilename, 0 === a.state.pos && "#" === a.input[0] && "!" === a.input[1] && a.skipLineComment(2), a;
				}return w(e, t), e.prototype.parse = function () {
					var t = this.startNode(),
					    e = this.startNode();return this.nextToken(), this.parseTopLevel(t, e);
				}, e;
			}(function (t) {
				function e() {
					return g(this, e), P(this, t.apply(this, arguments));
				}return w(e, t), e.prototype.parseTopLevel = function (t, e) {
					return e.sourceType = this.options.sourceType, this.parseBlockBody(e, !0, !0, C.eof), t.program = this.finishNode(e, "Program"), t.comments = this.state.comments, t.tokens = this.state.tokens, this.finishNode(t, "File");
				}, e.prototype.stmtToDirective = function (t) {
					var e = t.expression,
					    s = this.startNodeAt(e.start, e.loc.start),
					    i = this.startNodeAt(t.start, t.loc.start),
					    r = this.input.slice(e.start, e.end),
					    a = s.value = r.slice(1, -1);return this.addExtra(s, "raw", r), this.addExtra(s, "rawValue", a), i.value = this.finishNodeAt(s, "DirectiveLiteral", e.end, e.loc.end), this.finishNodeAt(i, "Directive", t.end, t.loc.end);
				}, e.prototype.parseStatement = function (t, e) {
					this.match(C.at) && this.parseDecorators(!0);var s = this.state.type,
					    i = this.startNode();switch (s) {case C._break:case C._continue:
							return this.parseBreakContinueStatement(i, s.keyword);case C._debugger:
							return this.parseDebuggerStatement(i);case C._do:
							return this.parseDoStatement(i);case C._for:
							return this.parseForStatement(i);case C._function:
							return t || this.unexpected(), this.parseFunctionStatement(i);case C._class:
							return t || this.unexpected(), this.parseClass(i, !0);case C._if:
							return this.parseIfStatement(i);case C._return:
							return this.parseReturnStatement(i);case C._switch:
							return this.parseSwitchStatement(i);case C._throw:
							return this.parseThrowStatement(i);case C._try:
							return this.parseTryStatement(i);case C._let:case C._const:
							t || this.unexpected();case C._var:
							return this.parseVarStatement(i, s);case C._while:
							return this.parseWhileStatement(i);case C._with:
							return this.parseWithStatement(i);case C.braceL:
							return this.parseBlock();case C.semi:
							return this.parseEmptyStatement(i);case C._export:case C._import:
							if (this.hasPlugin("dynamicImport") && this.lookahead().type === C.parenL || this.hasPlugin("importMeta") && this.lookahead().type === C.dot) break;return this.options.allowImportExportEverywhere || (e || this.raise(this.state.start, "'import' and 'export' may only appear at the top level"), this.inModule || this.raise(this.state.start, "'import' and 'export' may appear only with 'sourceType: module'")), s === C._import ? this.parseImport(i) : this.parseExport(i);case C.name:
							if ("async" === this.state.value) {
								var r = this.state.clone();if (this.next(), this.match(C._function) && !this.canInsertSemicolon()) return this.expect(C._function), this.parseFunction(i, !0, !1, !0);this.state = r;
							}}var a = this.state.value,
					    n = this.parseExpression();return s === C.name && "Identifier" === n.type && this.eat(C.colon) ? this.parseLabeledStatement(i, a, n) : this.parseExpressionStatement(i, n);
				}, e.prototype.takeDecorators = function (t) {
					this.state.decorators.length && (t.decorators = this.state.decorators, this.state.decorators = []);
				}, e.prototype.parseDecorators = function (t) {
					for (; this.match(C.at);) {
						var e = this.parseDecorator();this.state.decorators.push(e);
					}t && this.match(C._export) || this.match(C._class) || this.raise(this.state.start, "Leading decorators must be attached to a class declaration");
				}, e.prototype.parseDecorator = function () {
					this.hasPlugin("decorators") || this.unexpected();var t = this.startNode();return this.next(), t.expression = this.parseMaybeAssign(), this.finishNode(t, "Decorator");
				}, e.prototype.parseBreakContinueStatement = function (t, e) {
					var s = "break" === e;this.next(), this.isLineTerminator() ? t.label = null : this.match(C.name) ? (t.label = this.parseIdentifier(), this.semicolon()) : this.unexpected();var i = void 0;for (i = 0; i < this.state.labels.length; ++i) {
						var r = this.state.labels[i];if (null == t.label || r.name === t.label.name) {
							if (null != r.kind && (s || "loop" === r.kind)) break;if (t.label && s) break;
						}
					}return i === this.state.labels.length && this.raise(t.start, "Unsyntactic " + e), this.finishNode(t, s ? "BreakStatement" : "ContinueStatement");
				}, e.prototype.parseDebuggerStatement = function (t) {
					return this.next(), this.semicolon(), this.finishNode(t, "DebuggerStatement");
				}, e.prototype.parseDoStatement = function (t) {
					return this.next(), this.state.labels.push($), t.body = this.parseStatement(!1), this.state.labels.pop(), this.expect(C._while), t.test = this.parseParenExpression(), this.eat(C.semi), this.finishNode(t, "DoWhileStatement");
				}, e.prototype.parseForStatement = function (t) {
					this.next(), this.state.labels.push($);var e = !1;if (this.hasPlugin("asyncGenerators") && this.state.inAsync && this.isContextual("await") && (e = !0, this.next()), this.expect(C.parenL), this.match(C.semi)) return e && this.unexpected(), this.parseFor(t, null);if (this.match(C._var) || this.match(C._let) || this.match(C._const)) {
						var s = this.startNode(),
						    i = this.state.type;return this.next(), this.parseVar(s, !0, i), this.finishNode(s, "VariableDeclaration"), !this.match(C._in) && !this.isContextual("of") || 1 !== s.declarations.length || s.declarations[0].init ? (e && this.unexpected(), this.parseFor(t, s)) : this.parseForIn(t, s, e);
					}var r = { start: 0 },
					    a = this.parseExpression(!0, r);if (this.match(C._in) || this.isContextual("of")) {
						var n = this.isContextual("of") ? "for-of statement" : "for-in statement";return this.toAssignable(a, void 0, n), this.checkLVal(a, void 0, void 0, n), this.parseForIn(t, a, e);
					}return r.start && this.unexpected(r.start), e && this.unexpected(), this.parseFor(t, a);
				}, e.prototype.parseFunctionStatement = function (t) {
					return this.next(), this.parseFunction(t, !0);
				}, e.prototype.parseIfStatement = function (t) {
					return this.next(), t.test = this.parseParenExpression(), t.consequent = this.parseStatement(!1), t.alternate = this.eat(C._else) ? this.parseStatement(!1) : null, this.finishNode(t, "IfStatement");
				}, e.prototype.parseReturnStatement = function (t) {
					return this.state.inFunction || this.options.allowReturnOutsideFunction || this.raise(this.state.start, "'return' outside of function"), this.next(), this.isLineTerminator() ? t.argument = null : (t.argument = this.parseExpression(), this.semicolon()), this.finishNode(t, "ReturnStatement");
				}, e.prototype.parseSwitchStatement = function (t) {
					this.next(), t.discriminant = this.parseParenExpression();var e = t.cases = [];this.expect(C.braceL), this.state.labels.push(Z);for (var s, i = void 0; !this.match(C.braceR);) {
						if (this.match(C._case) || this.match(C._default)) {
							var r = this.match(C._case);i && this.finishNode(i, "SwitchCase"), e.push(i = this.startNode()), i.consequent = [], this.next(), r ? i.test = this.parseExpression() : (s && this.raise(this.state.lastTokStart, "Multiple default clauses"), s = !0, i.test = null), this.expect(C.colon);
						} else i ? i.consequent.push(this.parseStatement(!0)) : this.unexpected();
					}return i && this.finishNode(i, "SwitchCase"), this.next(), this.state.labels.pop(), this.finishNode(t, "SwitchStatement");
				}, e.prototype.parseThrowStatement = function (t) {
					return this.next(), M.test(this.input.slice(this.state.lastTokEnd, this.state.start)) && this.raise(this.state.lastTokEnd, "Illegal newline after throw"), t.argument = this.parseExpression(), this.semicolon(), this.finishNode(t, "ThrowStatement");
				}, e.prototype.parseTryStatement = function (t) {
					if (this.next(), t.block = this.parseBlock(), t.handler = null, this.match(C._catch)) {
						var e = this.startNode();this.next(), this.expect(C.parenL), e.param = this.parseBindingAtom(), this.checkLVal(e.param, !0, Object.create(null), "catch clause"), this.expect(C.parenR), e.body = this.parseBlock(), t.handler = this.finishNode(e, "CatchClause");
					}return t.guardedHandlers = H, t.finalizer = this.eat(C._finally) ? this.parseBlock() : null, t.handler || t.finalizer || this.raise(t.start, "Missing catch or finally clause"), this.finishNode(t, "TryStatement");
				}, e.prototype.parseVarStatement = function (t, e) {
					return this.next(), this.parseVar(t, !1, e), this.semicolon(), this.finishNode(t, "VariableDeclaration");
				}, e.prototype.parseWhileStatement = function (t) {
					return this.next(), t.test = this.parseParenExpression(), this.state.labels.push($), t.body = this.parseStatement(!1), this.state.labels.pop(), this.finishNode(t, "WhileStatement");
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
					}for (var o = this.state.type.isLoop ? "loop" : this.match(C._switch) ? "switch" : null, h = this.state.labels.length - 1; h >= 0; h--) {
						var p = this.state.labels[h];if (p.statementStart !== t.start) break;p.statementStart = this.state.start, p.kind = o;
					}return this.state.labels.push({ name: e, kind: o, statementStart: this.state.start }), t.body = this.parseStatement(!0), this.state.labels.pop(), t.label = s, this.finishNode(t, "LabeledStatement");
				}, e.prototype.parseExpressionStatement = function (t, e) {
					return t.expression = e, this.semicolon(), this.finishNode(t, "ExpressionStatement");
				}, e.prototype.parseBlock = function (t) {
					var e = this.startNode();return this.expect(C.braceL), this.parseBlockBody(e, t, !1, C.braceR), this.finishNode(e, "BlockStatement");
				}, e.prototype.isValidDirective = function (t) {
					return "ExpressionStatement" === t.type && "StringLiteral" === t.expression.type && !t.expression.extra.parenthesized;
				}, e.prototype.parseBlockBody = function (t, e, s, i) {
					for (var r = t.body = [], a = t.directives = [], n = !1, o = void 0, h = void 0; !this.eat(i);) {
						n || !this.state.containsOctal || h || (h = this.state.octalPosition);var p = this.parseStatement(!0, s);if (e && !n && this.isValidDirective(p)) {
							var c = this.stmtToDirective(p);a.push(c), void 0 === o && "use strict" === c.value.value && (o = this.state.strict, this.setStrict(!0), h && this.raise(h, "Octal literal in strict mode"));
						} else n = !0, r.push(p);
					}!1 === o && this.setStrict(!1);
				}, e.prototype.parseFor = function (t, e) {
					return t.init = e, this.expect(C.semi), t.test = this.match(C.semi) ? null : this.parseExpression(), this.expect(C.semi), t.update = this.match(C.parenR) ? null : this.parseExpression(), this.expect(C.parenR), t.body = this.parseStatement(!1), this.state.labels.pop(), this.finishNode(t, "ForStatement");
				}, e.prototype.parseForIn = function (t, e, s) {
					var i = this.match(C._in) ? "ForInStatement" : "ForOfStatement";return s ? this.eatContextual("of") : this.next(), "ForOfStatement" === i && (t.await = !!s), t.left = e, t.right = this.parseExpression(), this.expect(C.parenR), t.body = this.parseStatement(!1), this.state.labels.pop(), this.finishNode(t, i);
				}, e.prototype.parseVar = function (t, e, s) {
					var i = t.declarations = [];for (t.kind = s.keyword;;) {
						var r = this.startNode();if (this.parseVarHead(r), this.eat(C.eq) ? r.init = this.parseMaybeAssign(e) : s !== C._const || this.match(C._in) || this.isContextual("of") ? "Identifier" === r.id.type || e && (this.match(C._in) || this.isContextual("of")) ? r.init = null : this.raise(this.state.lastTokEnd, "Complex binding patterns require an initialization value") : this.unexpected(), i.push(this.finishNode(r, "VariableDeclarator")), !this.eat(C.comma)) break;
					}return t;
				}, e.prototype.parseVarHead = function (t) {
					t.id = this.parseBindingAtom(), this.checkLVal(t.id, !0, void 0, "variable declaration");
				}, e.prototype.parseFunction = function (t, e, s, i, r) {
					var a = this.state.inMethod;return this.state.inMethod = !1, this.initFunction(t, i), this.match(C.star) && (t.async && !this.hasPlugin("asyncGenerators") ? this.unexpected() : (t.generator = !0, this.next())), !e || r || this.match(C.name) || this.match(C._yield) || this.unexpected(), (this.match(C.name) || this.match(C._yield)) && (t.id = this.parseBindingIdentifier()), this.parseFunctionParams(t), this.parseFunctionBody(t, s), this.state.inMethod = a, this.finishNode(t, e ? "FunctionDeclaration" : "FunctionExpression");
				}, e.prototype.parseFunctionParams = function (t) {
					this.expect(C.parenL), t.params = this.parseBindingList(C.parenR);
				}, e.prototype.parseClass = function (t, e, s) {
					return this.next(), this.takeDecorators(t), this.parseClassId(t, e, s), this.parseClassSuper(t), this.parseClassBody(t), this.finishNode(t, e ? "ClassDeclaration" : "ClassExpression");
				}, e.prototype.isClassProperty = function () {
					return this.match(C.eq) || this.match(C.semi) || this.match(C.braceR);
				}, e.prototype.isClassMethod = function () {
					return this.match(C.parenL);
				}, e.prototype.isNonstaticConstructor = function (t) {
					return !(t.computed || t.static || "constructor" !== t.key.name && "constructor" !== t.key.value);
				}, e.prototype.parseClassBody = function (t) {
					var e = this.state.strict;this.state.strict = !0, this.state.inClass = !0;var s = { hadConstructor: !1 },
					    i = [],
					    r = this.startNode();for (r.body = [], this.expect(C.braceL); !this.eat(C.braceR);) {
						if (this.eat(C.semi)) i.length > 0 && this.raise(this.state.lastTokEnd, "Decorators must not be followed by a semicolon");else if (this.match(C.at)) i.push(this.parseDecorator());else {
							var a = this.startNode();i.length && (a.decorators = i, i = []), this.parseClassMember(r, a, s);
						}
					}i.length && this.raise(this.state.start, "You have trailing decorators with no method"), t.body = this.finishNode(r, "ClassBody"), this.state.inClass = !1, this.state.strict = e;
				}, e.prototype.parseClassMember = function (t, e, s) {
					var i = e,
					    r = i,
					    a = i,
					    n = i;if (this.hasPlugin("classPrivateProperties") && this.match(C.hash)) {
						this.next();var o = i;return o.key = this.parseIdentifier(!0), void t.body.push(this.parsePrivateClassProperty(o));
					}if (r.static = !1, this.match(C.name) && "static" === this.state.value) {
						var h = this.parseIdentifier(!0);if (this.isClassMethod()) return a.kind = "method", a.computed = !1, a.key = h, void this.parseClassMethod(t, a, !1, !1);if (this.isClassProperty()) return n.computed = !1, n.key = h, void t.body.push(this.parseClassProperty(n));r.static = !0;
					}if (this.eat(C.star)) return a.kind = "method", this.parsePropertyName(a), this.isNonstaticConstructor(a) && this.raise(a.key.start, "Constructor can't be a generator"), a.computed || !a.static || "prototype" !== a.key.name && "prototype" !== a.key.value || this.raise(a.key.start, "Classes may not have static property named prototype"), void this.parseClassMethod(t, a, !0, !1);var p = this.match(C.name),
					    c = this.parsePropertyName(r);if (r.computed || !r.static || "prototype" !== r.key.name && "prototype" !== r.key.value || this.raise(r.key.start, "Classes may not have static property named prototype"), this.isClassMethod()) this.isNonstaticConstructor(a) ? (s.hadConstructor ? this.raise(c.start, "Duplicate constructor in the same class") : a.decorators && this.raise(a.start, "You can't attach decorators to a class constructor"), s.hadConstructor = !0, a.kind = "constructor") : a.kind = "method", this.parseClassMethod(t, a, !1, !1);else if (this.isClassProperty()) this.isNonstaticConstructor(n) && this.raise(n.key.start, "Classes may not have a non-static field named 'constructor'"), t.body.push(this.parseClassProperty(n));else if (p && "async" === c.name && !this.isLineTerminator()) {
						var l = this.hasPlugin("asyncGenerators") && this.eat(C.star);a.kind = "method", this.parsePropertyName(a), this.isNonstaticConstructor(a) && this.raise(a.key.start, "Constructor can't be an async function"), this.parseClassMethod(t, a, l, !0);
					} else !p || "get" !== c.name && "set" !== c.name || this.isLineTerminator() && this.match(C.star) ? this.isLineTerminator() ? (this.isNonstaticConstructor(n) && this.raise(n.key.start, "Classes may not have a non-static field named 'constructor'"), t.body.push(this.parseClassProperty(n))) : this.unexpected() : (a.kind = c.name, this.parsePropertyName(a), this.isNonstaticConstructor(a) && this.raise(a.key.start, "Constructor can't have get/set modifier"), this.parseClassMethod(t, a, !1, !1), this.checkGetterSetterParamCount(a));
				}, e.prototype.parsePrivateClassProperty = function (t) {
					return this.state.inClassProperty = !0, this.match(C.eq) ? (this.next(), t.value = this.parseMaybeAssign()) : t.value = null, this.semicolon(), this.state.inClassProperty = !1, this.finishNode(t, "ClassPrivateProperty");
				}, e.prototype.parseClassProperty = function (t) {
					var e = this.hasPlugin("classProperties"),
					    s = "You can only use Class Properties when the 'classProperties' plugin is enabled.";return t.typeAnnotation || e || this.raise(t.start, s), this.state.inClassProperty = !0, this.match(C.eq) ? (e || this.raise(this.state.start, s), this.next(), t.value = this.parseMaybeAssign()) : t.value = null, this.semicolon(), this.state.inClassProperty = !1, this.finishNode(t, "ClassProperty");
				}, e.prototype.parseClassMethod = function (t, e, s, i) {
					this.parseMethod(e, s, i), t.body.push(this.finishNode(e, "ClassMethod"));
				}, e.prototype.parseClassId = function (t, e, s) {
					this.match(C.name) ? t.id = this.parseIdentifier() : s || !e ? t.id = null : this.unexpected(null, "A class name is required");
				}, e.prototype.parseClassSuper = function (t) {
					t.superClass = this.eat(C._extends) ? this.parseExprSubscripts() : null;
				}, e.prototype.parseExport = function (t) {
					if (this.eat(C._export), this.match(C.star)) {
						var e = this.startNode();if (this.next(), !this.hasPlugin("exportExtensions") || !this.eatContextual("as")) return this.parseExportFrom(t, !0), this.finishNode(t, "ExportAllDeclaration");e.exported = this.parseIdentifier(!0), t.specifiers = [this.finishNode(e, "ExportNamespaceSpecifier")], this.parseExportSpecifiersMaybe(t), this.parseExportFrom(t, !0);
					} else if (this.hasPlugin("exportExtensions") && this.isExportDefaultSpecifier()) {
						var s = this.startNode();s.exported = this.parseIdentifier(!0);var i = [this.finishNode(s, "ExportDefaultSpecifier")];if (t.specifiers = i, this.match(C.comma) && this.lookahead().type === C.star) {
							this.expect(C.comma);var r = this.startNode();this.expect(C.star), this.expectContextual("as"), r.exported = this.parseIdentifier(), i.push(this.finishNode(r, "ExportNamespaceSpecifier"));
						} else this.parseExportSpecifiersMaybe(t);this.parseExportFrom(t, !0);
					} else {
						if (this.eat(C._default)) {
							var a = this.startNode(),
							    n = !1;return this.eat(C._function) ? a = this.parseFunction(a, !0, !1, !1, !0) : this.isContextual("async") && this.lookahead().type === C._function ? (this.eatContextual("async"), this.eat(C._function), a = this.parseFunction(a, !0, !1, !0, !0)) : this.match(C._class) ? a = this.parseClass(a, !0, !0) : (n = !0, a = this.parseMaybeAssign()), t.declaration = a, n && this.semicolon(), this.checkExport(t, !0, !0), this.finishNode(t, "ExportDefaultDeclaration");
						}this.shouldParseExportDeclaration() ? (t.specifiers = [], t.source = null, t.declaration = this.parseExportDeclaration(t)) : (t.declaration = null, t.specifiers = this.parseExportSpecifiers(), this.parseExportFrom(t));
					}return this.checkExport(t, !0), this.finishNode(t, "ExportNamedDeclaration");
				}, e.prototype.parseExportDeclaration = function (t) {
					return this.parseStatement(!0);
				}, e.prototype.isExportDefaultSpecifier = function () {
					if (this.match(C.name)) return "async" !== this.state.value;if (!this.match(C._default)) return !1;var t = this.lookahead();return t.type === C.comma || t.type === C.name && "from" === t.value;
				}, e.prototype.parseExportSpecifiersMaybe = function (t) {
					this.eat(C.comma) && (t.specifiers = t.specifiers.concat(this.parseExportSpecifiers()));
				}, e.prototype.parseExportFrom = function (t, e) {
					this.eatContextual("from") ? (t.source = this.match(C.string) ? this.parseExprAtom() : this.unexpected(), this.checkExport(t)) : e ? this.unexpected() : t.source = null, this.semicolon();
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
					}if (this.state.decorators.length) {
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
					    s = void 0;for (this.expect(C.braceL); !this.eat(C.braceR);) {
						if (e) e = !1;else if (this.expect(C.comma), this.eat(C.braceR)) break;var i = this.match(C._default);i && !s && (s = !0);var r = this.startNode();r.local = this.parseIdentifier(i), r.exported = this.eatContextual("as") ? this.parseIdentifier(!0) : r.local.__clone(), t.push(this.finishNode(r, "ExportSpecifier"));
					}return s && !this.isContextual("from") && this.unexpected(), t;
				}, e.prototype.parseImport = function (t) {
					return this.eat(C._import), this.match(C.string) ? (t.specifiers = [], t.source = this.parseExprAtom()) : (t.specifiers = [], this.parseImportSpecifiers(t), this.expectContextual("from"), t.source = this.match(C.string) ? this.parseExprAtom() : this.unexpected()), this.semicolon(), this.finishNode(t, "ImportDeclaration");
				}, e.prototype.parseImportSpecifiers = function (t) {
					var e = !0;if (this.match(C.name)) {
						var s = this.state.start,
						    i = this.state.startLoc;if (t.specifiers.push(this.parseImportSpecifierDefault(this.parseIdentifier(), s, i)), !this.eat(C.comma)) return;
					}if (this.match(C.star)) {
						var r = this.startNode();return this.next(), this.expectContextual("as"), r.local = this.parseIdentifier(), this.checkLVal(r.local, !0, void 0, "import namespace specifier"), void t.specifiers.push(this.finishNode(r, "ImportNamespaceSpecifier"));
					}for (this.expect(C.braceL); !this.eat(C.braceR);) {
						if (e) e = !1;else if (this.eat(C.colon) && this.unexpected(null, "ES2015 named imports do not destructure. Use another statement for destructuring after the import."), this.expect(C.comma), this.eat(C.braceR)) break;this.parseImportSpecifier(t);
					}
				}, e.prototype.parseImportSpecifier = function (t) {
					var e = this.startNode();e.imported = this.parseIdentifier(!0), this.eatContextual("as") ? e.local = this.parseIdentifier() : (this.checkReservedWord(e.imported.name, e.start, !0, !0), e.local = e.imported.__clone()), this.checkLVal(e.local, !0, void 0, "import specifier"), t.specifiers.push(this.finishNode(e, "ImportSpecifier"));
				}, e.prototype.parseImportSpecifierDefault = function (t, e, s) {
					var i = this.startNodeAt(e, s);return i.local = t, this.checkLVal(i.local, !0, void 0, "default import specifier"), this.finishNode(i, "ImportDefaultSpecifier");
				}, e;
			}(function (t) {
				function e() {
					return g(this, e), P(this, t.apply(this, arguments));
				}return w(e, t), e.prototype.checkPropClash = function (t, e) {
					if (!t.computed && !t.kind) {
						var s = t.key;"__proto__" === ("Identifier" === s.type ? s.name : String(s.value)) && (e.proto && this.raise(s.start, "Redefinition of __proto__ property"), e.proto = !0);
					}
				}, e.prototype.getExpression = function () {
					this.nextToken();var t = this.parseExpression();return this.match(C.eof) || this.unexpected(), t;
				}, e.prototype.parseExpression = function (t, e) {
					var s = this.state.start,
					    i = this.state.startLoc,
					    r = this.parseMaybeAssign(t, e);if (this.match(C.comma)) {
						var a = this.startNodeAt(s, i);for (a.expressions = [r]; this.eat(C.comma);) {
							a.expressions.push(this.parseMaybeAssign(t, e));
						}return this.toReferencedList(a.expressions), this.finishNode(a, "SequenceExpression");
					}return r;
				}, e.prototype.parseMaybeAssign = function (t, e, s, i) {
					var r = this.state.start,
					    a = this.state.startLoc;if (this.match(C._yield) && this.state.inGenerator) {
						var n = this.parseYield();return s && (n = s.call(this, n, r, a)), n;
					}var o = void 0;e ? o = !1 : (e = { start: 0 }, o = !0), (this.match(C.parenL) || this.match(C.name)) && (this.state.potentialArrowAt = this.state.start);var h = this.parseMaybeConditional(t, e, i);if (s && (h = s.call(this, h, r, a)), this.state.type.isAssign) {
						var p = this.startNodeAt(r, a);if (p.operator = this.state.value, p.left = this.match(C.eq) ? this.toAssignable(h, void 0, "assignment expression") : h, e.start = 0, this.checkLVal(h, void 0, void 0, "assignment expression"), h.extra && h.extra.parenthesized) {
							var c = void 0;"ObjectPattern" === h.type ? c = "`({a}) = 0` use `({a} = 0)`" : "ArrayPattern" === h.type && (c = "`([a]) = 0` use `([a] = 0)`"), c && this.raise(h.start, "You're trying to assign to a parenthesized expression, eg. instead of " + c);
						}return this.next(), p.right = this.parseMaybeAssign(t), this.finishNode(p, "AssignmentExpression");
					}return o && e.start && this.unexpected(e.start), h;
				}, e.prototype.parseMaybeConditional = function (t, e, s) {
					var i = this.state.start,
					    r = this.state.startLoc,
					    a = this.parseExprOps(t, e);return e && e.start ? a : this.parseConditional(a, t, i, r, s);
				}, e.prototype.parseConditional = function (t, e, s, i, r) {
					if (this.eat(C.question)) {
						var a = this.startNodeAt(s, i);return a.test = t, a.consequent = this.parseMaybeAssign(), this.expect(C.colon), a.alternate = this.parseMaybeAssign(e), this.finishNode(a, "ConditionalExpression");
					}return t;
				}, e.prototype.parseExprOps = function (t, e) {
					var s = this.state.start,
					    i = this.state.startLoc,
					    r = this.parseMaybeUnary(e);return e && e.start ? r : this.parseExprOp(r, s, i, -1, t);
				}, e.prototype.parseExprOp = function (t, e, s, i, r) {
					var a = this.state.type.binop;if (!(null == a || r && this.match(C._in)) && a > i) {
						var n = this.startNodeAt(e, s);n.left = t, n.operator = this.state.value, "**" !== n.operator || "UnaryExpression" !== t.type || !t.extra || t.extra.parenthesizedArgument || t.extra.parenthesized || this.raise(t.argument.start, "Illegal expression. Wrap left hand side or entire exponentiation in parentheses.");var o = this.state.type;this.next();var h = this.state.start,
						    p = this.state.startLoc;return n.right = this.parseExprOp(this.parseMaybeUnary(), h, p, o.rightAssociative ? a - 1 : a, r), this.finishNode(n, o === C.logicalOR || o === C.logicalAND ? "LogicalExpression" : "BinaryExpression"), this.parseExprOp(n, e, s, i, r);
					}return t;
				}, e.prototype.parseMaybeUnary = function (t) {
					if (this.state.type.prefix) {
						var e = this.startNode(),
						    s = this.match(C.incDec);e.operator = this.state.value, e.prefix = !0, this.next();var i = this.state.type;return e.argument = this.parseMaybeUnary(), this.addExtra(e, "parenthesizedArgument", !(i !== C.parenL || e.argument.extra && e.argument.extra.parenthesized)), t && t.start && this.unexpected(t.start), s ? this.checkLVal(e.argument, void 0, void 0, "prefix operation") : this.state.strict && "delete" === e.operator && "Identifier" === e.argument.type && this.raise(e.start, "Deleting local variable in strict mode"), this.finishNode(e, s ? "UpdateExpression" : "UnaryExpression");
					}var r = this.state.start,
					    a = this.state.startLoc,
					    n = this.parseExprSubscripts(t);if (t && t.start) return n;for (; this.state.type.postfix && !this.canInsertSemicolon();) {
						var o = this.startNodeAt(r, a);o.operator = this.state.value, o.prefix = !1, o.argument = n, this.checkLVal(n, void 0, void 0, "postfix operation"), this.next(), n = this.finishNode(o, "UpdateExpression");
					}return n;
				}, e.prototype.parseExprSubscripts = function (t) {
					var e = this.state.start,
					    s = this.state.startLoc,
					    i = this.state.potentialArrowAt,
					    r = this.parseExprAtom(t);return "ArrowFunctionExpression" === r.type && r.start === i ? r : t && t.start ? r : this.parseSubscripts(r, e, s);
				}, e.prototype.parseSubscripts = function (t, e, s, i) {
					for (;;) {
						if (!i && this.eat(C.doubleColon)) {
							var r = this.startNodeAt(e, s);return r.object = t, r.callee = this.parseNoCallExpr(), this.parseSubscripts(this.finishNode(r, "BindExpression"), e, s, i);
						}if (this.match(C.questionDot)) {
							if (this.hasPlugin("optionalChaining") || this.raise(e, "You can only use optional-chaining when the 'optionalChaining' plugin is enabled."), i && this.lookahead().type == C.parenL) return t;this.next();var a = this.startNodeAt(e, s);if (this.eat(C.bracketL)) a.object = t, a.property = this.parseExpression(), a.computed = !0, a.optional = !0, this.expect(C.bracketR), t = this.finishNode(a, "MemberExpression");else if (this.eat(C.parenL)) {
								var n = this.state.potentialArrowAt === t.start && "Identifier" === t.type && "async" === t.name && !this.canInsertSemicolon();a.callee = t, a.arguments = this.parseCallExpressionArguments(C.parenR, n), a.optional = !0, t = this.finishNode(a, "CallExpression");
							} else a.object = t, a.property = this.parseIdentifier(!0), a.computed = !1, a.optional = !0, t = this.finishNode(a, "MemberExpression");
						} else if (this.eat(C.dot)) {
							var o = this.startNodeAt(e, s);o.object = t, o.property = this.hasPlugin("classPrivateProperties") ? this.parseMaybePrivateName() : this.parseIdentifier(!0), o.computed = !1, t = this.finishNode(o, "MemberExpression");
						} else if (this.eat(C.bracketL)) {
							var h = this.startNodeAt(e, s);h.object = t, h.property = this.parseExpression(), h.computed = !0, this.expect(C.bracketR), t = this.finishNode(h, "MemberExpression");
						} else if (!i && this.match(C.parenL)) {
							var p = this.state.potentialArrowAt === t.start && "Identifier" === t.type && "async" === t.name && !this.canInsertSemicolon();this.next();var c = this.startNodeAt(e, s);if (c.callee = t, c.arguments = this.parseCallExpressionArguments(C.parenR, p), "Import" === c.callee.type) {
								1 !== c.arguments.length && this.raise(c.start, "import() requires exactly one argument");var l = c.arguments[0];l && "SpreadElement" === l.type && this.raise(l.start, "... is not allowed in import()");
							}if (t = this.finishNode(c, "CallExpression"), p && this.shouldParseAsyncArrow()) return this.parseAsyncArrowFromCallExpression(this.startNodeAt(e, s), c);this.toReferencedList(c.arguments);
						} else {
							if (!this.match(C.backQuote)) return t;var u = this.startNodeAt(e, s);u.tag = t, u.quasi = this.parseTemplate(!0), t = this.finishNode(u, "TaggedTemplateExpression");
						}
					}throw new Error("Unreachable");
				}, e.prototype.parseCallExpressionArguments = function (t, e) {
					for (var s = [], i = void 0, r = !0; !this.eat(t);) {
						if (r) r = !1;else if (this.expect(C.comma), this.eat(t)) break;this.match(C.parenL) && !i && (i = this.state.start), s.push(this.parseExprListItem(!1, e ? { start: 0 } : void 0, e ? { start: 0 } : void 0));
					}return e && i && this.shouldParseAsyncArrow() && this.unexpected(), s;
				}, e.prototype.shouldParseAsyncArrow = function () {
					return this.match(C.arrow);
				}, e.prototype.parseAsyncArrowFromCallExpression = function (t, e) {
					return this.expect(C.arrow), this.parseArrowExpression(t, e.arguments, !0);
				}, e.prototype.parseNoCallExpr = function () {
					var t = this.state.start,
					    e = this.state.startLoc;return this.parseSubscripts(this.parseExprAtom(), t, e, !0);
				}, e.prototype.parseExprAtom = function (t) {
					var e = this.state.potentialArrowAt === this.state.start,
					    s = void 0;switch (this.state.type) {case C._super:
							return this.state.inMethod || this.state.inClassProperty || this.options.allowSuperOutsideMethod || this.raise(this.state.start, "'super' outside of function or class"), s = this.startNode(), this.next(), this.match(C.parenL) || this.match(C.bracketL) || this.match(C.dot) || this.unexpected(), this.match(C.parenL) && "constructor" !== this.state.inMethod && !this.options.allowSuperOutsideMethod && this.raise(s.start, "super() is only valid inside a class constructor. Make sure the method name is spelled exactly as 'constructor'."), this.finishNode(s, "Super");case C._import:
							return this.hasPlugin("importMeta") && this.lookahead().type === C.dot ? this.parseImportMetaProperty() : (this.hasPlugin("dynamicImport") || this.unexpected(), s = this.startNode(), this.next(), this.match(C.parenL) || this.unexpected(null, C.parenL), this.finishNode(s, "Import"));case C._this:
							return s = this.startNode(), this.next(), this.finishNode(s, "ThisExpression");case C._yield:
							this.state.inGenerator && this.unexpected();case C.name:
							s = this.startNode();var i = "await" === this.state.value && this.state.inAsync,
							    r = this.shouldAllowYieldIdentifier(),
							    a = this.parseIdentifier(i || r);if ("await" === a.name) {
								if (this.state.inAsync || this.inModule) return this.parseAwait(s);
							} else {
								if ("async" === a.name && this.match(C._function) && !this.canInsertSemicolon()) return this.next(), this.parseFunction(s, !1, !1, !0);if (e && "async" === a.name && this.match(C.name)) {
									var n = [this.parseIdentifier()];return this.expect(C.arrow), this.parseArrowExpression(s, n, !0);
								}
							}return e && !this.canInsertSemicolon() && this.eat(C.arrow) ? this.parseArrowExpression(s, [a]) : a;case C._do:
							if (this.hasPlugin("doExpressions")) {
								var o = this.startNode();this.next();var h = this.state.inFunction,
								    p = this.state.labels;return this.state.labels = [], this.state.inFunction = !1, o.body = this.parseBlock(!1), this.state.inFunction = h, this.state.labels = p, this.finishNode(o, "DoExpression");
							}case C.regexp:
							var c = this.state.value;return s = this.parseLiteral(c.value, "RegExpLiteral"), s.pattern = c.pattern, s.flags = c.flags, s;case C.num:
							return this.parseLiteral(this.state.value, "NumericLiteral");case C.string:
							return this.parseLiteral(this.state.value, "StringLiteral");case C._null:
							return s = this.startNode(), this.next(), this.finishNode(s, "NullLiteral");case C._true:case C._false:
							return s = this.startNode(), s.value = this.match(C._true), this.next(), this.finishNode(s, "BooleanLiteral");case C.parenL:
							return this.parseParenAndDistinguishExpression(e);case C.bracketL:
							return s = this.startNode(), this.next(), s.elements = this.parseExprList(C.bracketR, !0, t), this.toReferencedList(s.elements), this.finishNode(s, "ArrayExpression");case C.braceL:
							return this.parseObj(!1, t);case C._function:
							return this.parseFunctionExpression();case C.at:
							this.parseDecorators();case C._class:
							return s = this.startNode(), this.takeDecorators(s), this.parseClass(s, !1);case C.hash:
							if (this.hasPlugin("classPrivateProperties")) return this.parseMaybePrivateName();throw this.unexpected();case C._new:
							return this.parseNew();case C.backQuote:
							return this.parseTemplate(!1);case C.doubleColon:
							s = this.startNode(), this.next(), s.object = null;var l = s.callee = this.parseNoCallExpr();if ("MemberExpression" === l.type) return this.finishNode(s, "BindExpression");throw this.raise(l.start, "Binding should be performed on object property.");default:
							throw this.unexpected();}
				}, e.prototype.parseMaybePrivateName = function () {
					if (this.eat(C.hash)) {
						var t = this.startNode();return t.name = this.parseIdentifier(!0), this.finishNode(t, "PrivateName");
					}return this.parseIdentifier(!0);
				}, e.prototype.parseFunctionExpression = function () {
					var t = this.startNode(),
					    e = this.parseIdentifier(!0);return this.state.inGenerator && this.eat(C.dot) && this.hasPlugin("functionSent") ? this.parseMetaProperty(t, e, "sent") : this.parseFunction(t, !1);
				}, e.prototype.parseMetaProperty = function (t, e, s) {
					return t.meta = e, t.property = this.parseIdentifier(!0), t.property.name !== s && this.raise(t.property.start, "The only valid meta property for " + e.name + " is " + e.name + "." + s), this.finishNode(t, "MetaProperty");
				}, e.prototype.parseImportMetaProperty = function () {
					var t = this.startNode(),
					    e = this.parseIdentifier(!0);return this.expect(C.dot), this.inModule || this.raise(e.start, "import.meta may appear only with 'sourceType: module'"), this.parseMetaProperty(t, e, "meta");
				}, e.prototype.parseLiteral = function (t, e, s, i) {
					s = s || this.state.start, i = i || this.state.startLoc;var r = this.startNodeAt(s, i);return this.addExtra(r, "rawValue", t), this.addExtra(r, "raw", this.input.slice(s, this.state.end)), r.value = t, this.next(), this.finishNode(r, e);
				}, e.prototype.parseParenExpression = function () {
					this.expect(C.parenL);var t = this.parseExpression();return this.expect(C.parenR), t;
				}, e.prototype.parseParenAndDistinguishExpression = function (t) {
					var e = this.state.start,
					    s = this.state.startLoc,
					    i = void 0;this.expect(C.parenL);for (var r = this.state.start, a = this.state.startLoc, n = [], o = { start: 0 }, h = { start: 0 }, p = !0, c = void 0, l = void 0; !this.match(C.parenR);) {
						if (p) p = !1;else if (this.expect(C.comma, h.start || null), this.match(C.parenR)) {
							l = this.state.start;break;
						}if (this.match(C.ellipsis)) {
							var u = this.state.start,
							    d = this.state.startLoc;c = this.state.start, n.push(this.parseParenItem(this.parseRest(), u, d));break;
						}n.push(this.parseMaybeAssign(!1, o, this.parseParenItem, h));
					}var f = this.state.start,
					    m = this.state.startLoc;this.expect(C.parenR);var y = this.startNodeAt(e, s);if (t && this.shouldParseArrow() && (y = this.parseArrow(y))) {
						for (var x = n, v = Array.isArray(x), b = 0, x = v ? x : x[Symbol.iterator]();;) {
							var g;if (v) {
								if (b >= x.length) break;g = x[b++];
							} else {
								if ((b = x.next()).done) break;g = b.value;
							}var w = g;w.extra && w.extra.parenthesized && this.unexpected(w.extra.parenStart);
						}return this.parseArrowExpression(y, n);
					}return n.length || this.unexpected(this.state.lastTokStart), l && this.unexpected(l), c && this.unexpected(c), o.start && this.unexpected(o.start), h.start && this.unexpected(h.start), n.length > 1 ? ((i = this.startNodeAt(r, a)).expressions = n, this.toReferencedList(i.expressions), this.finishNodeAt(i, "SequenceExpression", f, m)) : i = n[0], this.addExtra(i, "parenthesized", !0), this.addExtra(i, "parenStart", e), i;
				}, e.prototype.shouldParseArrow = function () {
					return !this.canInsertSemicolon();
				}, e.prototype.parseArrow = function (t) {
					if (this.eat(C.arrow)) return t;
				}, e.prototype.parseParenItem = function (t, e, s) {
					return t;
				}, e.prototype.parseNew = function () {
					var t = this.startNode(),
					    e = this.parseIdentifier(!0);if (this.eat(C.dot)) {
						var s = this.parseMetaProperty(t, e, "target");return this.state.inFunction || this.raise(s.property.start, "new.target can only be used in functions"), s;
					}t.callee = this.parseNoCallExpr();var i = this.eat(C.questionDot);return this.eat(C.parenL) ? (t.arguments = this.parseExprList(C.parenR), this.toReferencedList(t.arguments)) : t.arguments = [], i && (t.optional = !0), this.finishNode(t, "NewExpression");
				}, e.prototype.parseTemplateElement = function (t) {
					var e = this.startNode();return null === this.state.value && (t ? this.state.invalidTemplateEscapePosition = null : this.raise(this.state.invalidTemplateEscapePosition || 0, "Invalid escape sequence in template")), e.value = { raw: this.input.slice(this.state.start, this.state.end).replace(/\r\n?/g, "\n"), cooked: this.state.value }, this.next(), e.tail = this.match(C.backQuote), this.finishNode(e, "TemplateElement");
				}, e.prototype.parseTemplate = function (t) {
					var e = this.startNode();this.next(), e.expressions = [];var s = this.parseTemplateElement(t);for (e.quasis = [s]; !s.tail;) {
						this.expect(C.dollarBraceL), e.expressions.push(this.parseExpression()), this.expect(C.braceR), e.quasis.push(s = this.parseTemplateElement(t));
					}return this.next(), this.finishNode(e, "TemplateLiteral");
				}, e.prototype.parseObj = function (t, e) {
					var s = [],
					    i = Object.create(null),
					    r = !0,
					    a = this.startNode();a.properties = [], this.next();for (var n = null; !this.eat(C.braceR);) {
						if (r) r = !1;else if (this.expect(C.comma), this.eat(C.braceR)) break;for (; this.match(C.at);) {
							s.push(this.parseDecorator());
						}var o = this.startNode(),
						    h = !1,
						    p = !1,
						    c = void 0,
						    l = void 0;if (s.length && (o.decorators = s, s = []), this.hasPlugin("objectRestSpread") && this.match(C.ellipsis)) {
							if (o = this.parseSpread(t ? { start: 0 } : void 0), o.type = t ? "RestElement" : "SpreadElement", t && this.toAssignable(o.argument, !0, "object pattern"), a.properties.push(o), !t) continue;var u = this.state.start;if (null !== n) this.unexpected(n, "Cannot have multiple rest elements when destructuring");else {
								if (this.eat(C.braceR)) break;if (!this.match(C.comma) || this.lookahead().type !== C.braceR) {
									n = u;continue;
								}this.unexpected(u, "A trailing comma is not permitted after the rest element");
							}
						}if (o.method = !1, (t || e) && (c = this.state.start, l = this.state.startLoc), t || (h = this.eat(C.star)), !t && this.isContextual("async")) {
							h && this.unexpected();var d = this.parseIdentifier();this.match(C.colon) || this.match(C.parenL) || this.match(C.braceR) || this.match(C.eq) || this.match(C.comma) ? (o.key = d, o.computed = !1) : (p = !0, this.hasPlugin("asyncGenerators") && (h = this.eat(C.star)), this.parsePropertyName(o));
						} else this.parsePropertyName(o);this.parseObjPropValue(o, c, l, h, p, t, e), this.checkPropClash(o, i), o.shorthand && this.addExtra(o, "shorthand", !0), a.properties.push(o);
					}return null !== n && this.unexpected(n, "The rest element has to be the last element when destructuring"), s.length && this.raise(this.state.start, "You have trailing decorators with no property"), this.finishNode(a, t ? "ObjectPattern" : "ObjectExpression");
				}, e.prototype.isGetterOrSetterMethod = function (t, e) {
					return !e && !t.computed && "Identifier" === t.key.type && ("get" === t.key.name || "set" === t.key.name) && (this.match(C.string) || this.match(C.num) || this.match(C.bracketL) || this.match(C.name) || !!this.state.type.keyword);
				}, e.prototype.checkGetterSetterParamCount = function (t) {
					var e = "get" === t.kind ? 0 : 1;if (t.params.length !== e) {
						var s = t.start;"get" === t.kind ? this.raise(s, "getter should have no params") : this.raise(s, "setter should have exactly one param");
					}
				}, e.prototype.parseObjectMethod = function (t, e, s, i) {
					return s || e || this.match(C.parenL) ? (i && this.unexpected(), t.kind = "method", t.method = !0, this.parseMethod(t, e, s), this.finishNode(t, "ObjectMethod")) : this.isGetterOrSetterMethod(t, i) ? ((e || s) && this.unexpected(), t.kind = t.key.name, this.parsePropertyName(t), this.parseMethod(t), this.checkGetterSetterParamCount(t), this.finishNode(t, "ObjectMethod")) : void 0;
				}, e.prototype.parseObjectProperty = function (t, e, s, i, r) {
					return t.shorthand = !1, this.eat(C.colon) ? (t.value = i ? this.parseMaybeDefault(this.state.start, this.state.startLoc) : this.parseMaybeAssign(!1, r), this.finishNode(t, "ObjectProperty")) : t.computed || "Identifier" !== t.key.type ? void 0 : (this.checkReservedWord(t.key.name, t.key.start, !0, !0), i ? t.value = this.parseMaybeDefault(e, s, t.key.__clone()) : this.match(C.eq) && r ? (r.start || (r.start = this.state.start), t.value = this.parseMaybeDefault(e, s, t.key.__clone())) : t.value = t.key.__clone(), t.shorthand = !0, this.finishNode(t, "ObjectProperty"));
				}, e.prototype.parseObjPropValue = function (t, e, s, i, r, a, n) {
					this.parseObjectMethod(t, i, r, a) || this.parseObjectProperty(t, e, s, a, n) || this.unexpected();
				}, e.prototype.parsePropertyName = function (t) {
					if (this.eat(C.bracketL)) t.computed = !0, t.key = this.parseMaybeAssign(), this.expect(C.bracketR);else {
						t.computed = !1;var e = this.state.inPropertyName;this.state.inPropertyName = !0, t.key = this.match(C.num) || this.match(C.string) ? this.parseExprAtom() : this.parseIdentifier(!0), this.state.inPropertyName = e;
					}return t.key;
				}, e.prototype.initFunction = function (t, e) {
					t.id = null, t.generator = !1, t.expression = !1, t.async = !!e;
				}, e.prototype.parseMethod = function (t, e, s) {
					var i = this.state.inMethod;return this.state.inMethod = t.kind || !0, this.initFunction(t, s), this.expect(C.parenL), t.params = this.parseBindingList(C.parenR), t.generator = !!e, this.parseFunctionBody(t), this.state.inMethod = i, t;
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
				}, e.prototype.parseFunctionBody = function (t, e) {
					var s = e && !this.match(C.braceL),
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
							}var m = f;o && "Identifier" !== m.type && this.raise(m.start, "Non-simple parameter in strict mode"), this.checkLVal(m, !0, p, "function parameter list");
						}this.state.strict = c;
					}
				}, e.prototype.parseExprList = function (t, e, s) {
					for (var i = [], r = !0; !this.eat(t);) {
						if (r) r = !1;else if (this.expect(C.comma), this.eat(t)) break;i.push(this.parseExprListItem(e, s));
					}return i;
				}, e.prototype.parseExprListItem = function (t, e, s) {
					return t && this.match(C.comma) ? null : this.match(C.ellipsis) ? this.parseSpread(e) : this.parseMaybeAssign(!1, e, this.parseParenItem, s);
				}, e.prototype.parseIdentifier = function (t) {
					var e = this.startNode();return t || this.checkReservedWord(this.state.value, this.state.start, !!this.state.type.keyword, !1), this.match(C.name) ? e.name = this.state.value : this.state.type.keyword ? e.name = this.state.type.keyword : this.unexpected(), !t && "await" === e.name && this.state.inAsync && this.raise(e.start, "invalid use of await inside of an async function"), e.loc.identifierName = e.name, this.next(), this.finishNode(e, "Identifier");
				}, e.prototype.checkReservedWord = function (t, e, s, i) {
					(this.isReservedWord(t) || s && this.isKeyword(t)) && this.raise(e, t + " is a reserved word"), this.state.strict && (S.strict(t) || i && S.strictBind(t)) && this.raise(e, t + " is a reserved word in strict mode");
				}, e.prototype.parseAwait = function (t) {
					return this.state.inAsync || this.unexpected(), this.match(C.star) && this.raise(t.start, "await* has been removed from the async functions proposal. Use Promise.all() instead."), t.argument = this.parseMaybeUnary(), this.finishNode(t, "AwaitExpression");
				}, e.prototype.parseYield = function () {
					var t = this.startNode();return this.next(), this.match(C.semi) || this.canInsertSemicolon() || !this.match(C.star) && !this.state.type.startsExpr ? (t.delegate = !1, t.argument = null) : (t.delegate = this.eat(C.star), t.argument = this.parseMaybeAssign()), this.finishNode(t, "YieldExpression");
				}, e;
			}(function (t) {
				function e() {
					return g(this, e), P(this, t.apply(this, arguments));
				}return w(e, t), e.prototype.toAssignable = function (t, e, s) {
					if (t) switch (t.type) {case "Identifier":case "PrivateName":case "ObjectPattern":case "ArrayPattern":case "AssignmentPattern":
							break;case "ObjectExpression":
							t.type = "ObjectPattern";for (var i = t.properties, r = Array.isArray(i), a = 0, i = r ? i : i[Symbol.iterator]();;) {
								var n;if (r) {
									if (a >= i.length) break;n = i[a++];
								} else {
									if ((a = i.next()).done) break;n = a.value;
								}var o = n;"ObjectMethod" === o.type ? "get" === o.kind || "set" === o.kind ? this.raise(o.key.start, "Object pattern can't contain getter or setter") : this.raise(o.key.start, "Object pattern can't contain methods") : this.toAssignable(o, e, "object destructuring pattern");
							}break;case "ObjectProperty":
							this.toAssignable(t.value, e, s);break;case "SpreadElement":
							t.type = "RestElement";var h = t.argument;this.toAssignable(h, e, s);break;case "ArrayExpression":
							t.type = "ArrayPattern", this.toAssignableList(t.elements, e, s);break;case "AssignmentExpression":
							"=" === t.operator ? (t.type = "AssignmentPattern", delete t.operator) : this.raise(t.left.end, "Only '=' operator can be used for specifying default value.");break;case "MemberExpression":
							if (!e) break;default:
							var p = "Invalid left-hand side" + (s ? " in " + s : "expression");this.raise(t.start, p);}return t;
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
					return this.match(C._yield) && !this.state.strict && !this.state.inGenerator;
				}, e.prototype.parseBindingIdentifier = function () {
					return this.parseIdentifier(this.shouldAllowYieldIdentifier());
				}, e.prototype.parseBindingAtom = function () {
					switch (this.state.type) {case C._yield:case C.name:
							return this.parseBindingIdentifier();case C.bracketL:
							var t = this.startNode();return this.next(), t.elements = this.parseBindingList(C.bracketR, !0), this.finishNode(t, "ArrayPattern");case C.braceL:
							return this.parseObj(!0);default:
							throw this.unexpected();}
				}, e.prototype.parseBindingList = function (t, e) {
					for (var s = [], i = !0; !this.eat(t);) {
						if (i ? i = !1 : this.expect(C.comma), e && this.match(C.comma)) s.push(null);else {
							if (this.eat(t)) break;if (this.match(C.ellipsis)) {
								s.push(this.parseAssignableListItemTypes(this.parseRest())), this.expect(t);break;
							}for (var r = []; this.match(C.at);) {
								r.push(this.parseDecorator());
							}var a = this.parseMaybeDefault();r.length && (a.decorators = r), this.parseAssignableListItemTypes(a), s.push(this.parseMaybeDefault(a.start, a.loc.start, a));
						}
					}return s;
				}, e.prototype.parseAssignableListItemTypes = function (t) {
					return t;
				}, e.prototype.parseMaybeDefault = function (t, e, s) {
					if (e = e || this.state.startLoc, t = t || this.state.start, s = s || this.parseBindingAtom(), !this.eat(C.eq)) return s;var i = this.startNodeAt(t, e);return i.left = s, i.right = this.parseMaybeAssign(), this.finishNode(i, "AssignmentPattern");
				}, e.prototype.checkLVal = function (t, e, s, i) {
					switch (t.type) {case "PrivateName":case "Identifier":
							if (this.checkReservedWord(t.name, t.start, !1, !0), s) {
								var r = "_" + t.name;s[r] ? this.raise(t.start, "Argument name clash in strict mode") : s[r] = !0;
							}break;case "MemberExpression":
							e && this.raise(t.start, (e ? "Binding" : "Assigning to") + " member expression");break;case "ObjectPattern":
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
							var m = (e ? "Binding invalid" : "Invalid") + " left-hand side" + (i ? " in " + i : "expression");this.raise(t.start, m);}
				}, e;
			}(function (t) {
				function e() {
					return g(this, e), P(this, t.apply(this, arguments));
				}return w(e, t), e.prototype.startNode = function () {
					return new Y(this, this.state.start, this.state.startLoc);
				}, e.prototype.startNodeAt = function (t, e) {
					return new Y(this, t, e);
				}, e.prototype.finishNode = function (t, e) {
					return this.finishNodeAt(t, e, this.state.lastTokEnd, this.state.lastTokEndLoc);
				}, e.prototype.finishNodeAt = function (t, e, s, i) {
					return t.type = e, t.end = s, t.loc.end = i, this.options.ranges && (t.range[1] = s), this.processComment(t), t;
				}, e.prototype.resetStartLocationFromNode = function (t, e) {
					t.start = e.start, t.loc.start = e.loc.start, this.options.ranges && (t.range[0] = e.range[0]);
				}, e;
			}(z))))),
			    st = function st(t) {
				return function (t) {
					function e() {
						return g(this, e), P(this, t.apply(this, arguments));
					}return w(e, t), e.prototype.estreeParseRegExpLiteral = function (t) {
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
					}, e.prototype.parseClassMethod = function (t, e, s, i) {
						this.parseMethod(e, s, i), t.body.push(this.finishNode(e, "MethodDefinition"));
					}, e.prototype.parseExprAtom = function (e) {
						switch (this.state.type) {case C.regexp:
								return this.estreeParseRegExpLiteral(this.state.value);case C.num:case C.string:
								return this.estreeParseLiteral(this.state.value);case C._null:
								return this.estreeParseLiteral(null);case C._true:
								return this.estreeParseLiteral(!0);case C._false:
								return this.estreeParseLiteral(!1);default:
								return t.prototype.parseExprAtom.call(this, e);}
					}, e.prototype.parseLiteral = function (e, s, i, r) {
						var a = t.prototype.parseLiteral.call(this, e, s, i, r);return a.raw = a.extra.raw, delete a.extra, a;
					}, e.prototype.parseMethod = function (e, s, i) {
						var r = this.startNode();return r.kind = e.kind, r = t.prototype.parseMethod.call(this, r, s, i), delete r.kind, e.value = this.finishNode(r, "FunctionExpression"), e;
					}, e.prototype.parseObjectMethod = function (e, s, i, r) {
						var a = t.prototype.parseObjectMethod.call(this, e, s, i, r);return a && ("method" === a.kind && (a.kind = "init"), a.type = "Property"), a;
					}, e.prototype.parseObjectProperty = function (e, s, i, r, a) {
						var n = t.prototype.parseObjectProperty.call(this, e, s, i, r, a);return n && (n.kind = "init", n.type = "Property"), n;
					}, e.prototype.toAssignable = function (e, s, i) {
						if (u(e)) return this.toAssignable(e.value, s, i), e;if ("ObjectExpression" === e.type) {
							e.type = "ObjectPattern";for (var r = e.properties, a = Array.isArray(r), n = 0, r = a ? r : r[Symbol.iterator]();;) {
								var o;if (a) {
									if (n >= r.length) break;o = r[n++];
								} else {
									if ((n = r.next()).done) break;o = n.value;
								}var h = o;"get" === h.kind || "set" === h.kind ? this.raise(h.key.start, "Object pattern can't contain getter or setter") : h.method ? this.raise(h.key.start, "Object pattern can't contain methods") : this.toAssignable(h, s, "object destructuring pattern");
							}return e;
						}return t.prototype.toAssignable.call(this, e, s, i);
					}, e;
				}(t);
			},
			    it = ["any", "mixed", "empty", "bool", "boolean", "number", "string", "void", "null"],
			    rt = { const: "declare export var", let: "declare export var", type: "export type", interface: "export interface" },
			    at = function at(t) {
				return function (t) {
					function e() {
						return g(this, e), P(this, t.apply(this, arguments));
					}return w(e, t), e.prototype.flowParseTypeInitialiser = function (t) {
						var e = this.state.inType;this.state.inType = !0, this.expect(t || C.colon);var s = this.flowParseType();return this.state.inType = e, s;
					}, e.prototype.flowParsePredicate = function () {
						var t = this.startNode(),
						    e = this.state.startLoc,
						    s = this.state.start;this.expect(C.modulo);var i = this.state.startLoc;return this.expectContextual("checks"), e.line === i.line && e.column === i.column - 1 || this.raise(s, "Spaces between ´%´ and ´checks´ are not allowed here."), this.eat(C.parenL) ? (t.value = this.parseExpression(), this.expect(C.parenR), this.finishNode(t, "DeclaredPredicate")) : this.finishNode(t, "InferredPredicate");
					}, e.prototype.flowParseTypeAndPredicateInitialiser = function () {
						var t = this.state.inType;this.state.inType = !0, this.expect(C.colon);var e = null,
						    s = null;return this.match(C.modulo) ? (this.state.inType = t, s = this.flowParsePredicate()) : (e = this.flowParseType(), this.state.inType = t, this.match(C.modulo) && (s = this.flowParsePredicate())), [e, s];
					}, e.prototype.flowParseDeclareClass = function (t) {
						return this.next(), this.flowParseInterfaceish(t), this.finishNode(t, "DeclareClass");
					}, e.prototype.flowParseDeclareFunction = function (t) {
						this.next();var e = t.id = this.parseIdentifier(),
						    s = this.startNode(),
						    i = this.startNode();this.isRelational("<") ? s.typeParameters = this.flowParseTypeParameterDeclaration() : s.typeParameters = null, this.expect(C.parenL);var r = this.flowParseFunctionTypeParams();s.params = r.params, s.rest = r.rest, this.expect(C.parenR);var a = this.flowParseTypeAndPredicateInitialiser();return s.returnType = a[0], t.predicate = a[1], i.typeAnnotation = this.finishNode(s, "FunctionTypeAnnotation"), e.typeAnnotation = this.finishNode(i, "TypeAnnotation"), this.finishNode(e, e.type), this.semicolon(), this.finishNode(t, "DeclareFunction");
					}, e.prototype.flowParseDeclare = function (t, e) {
						if (this.match(C._class)) return this.flowParseDeclareClass(t);if (this.match(C._function)) return this.flowParseDeclareFunction(t);if (this.match(C._var)) return this.flowParseDeclareVariable(t);if (this.isContextual("module")) return this.lookahead().type === C.dot ? this.flowParseDeclareModuleExports(t) : (e && this.unexpected(null, "`declare module` cannot be used inside another `declare module`"), this.flowParseDeclareModule(t));if (this.isContextual("type")) return this.flowParseDeclareTypeAlias(t);if (this.isContextual("interface")) return this.flowParseDeclareInterface(t);if (this.match(C._export)) return this.flowParseDeclareExportDeclaration(t, e);throw this.unexpected();
					}, e.prototype.flowParseDeclareVariable = function (t) {
						return this.next(), t.id = this.flowParseTypeAnnotatableIdentifier(), this.semicolon(), this.finishNode(t, "DeclareVariable");
					}, e.prototype.flowParseDeclareModule = function (t) {
						var e = this;this.next(), this.match(C.string) ? t.id = this.parseExprAtom() : t.id = this.parseIdentifier();var s = t.body = this.startNode(),
						    i = s.body = [];for (this.expect(C.braceL); !this.match(C.braceR);) {
							var r = this.startNode();if (this.match(C._import)) {
								var a = this.lookahead();"type" !== a.value && "typeof" !== a.value && this.unexpected(null, "Imports within a `declare module` body must always be `import type` or `import typeof`"), this.parseImport(r);
							} else this.expectContextual("declare", "Only declares and type imports are allowed inside declare module"), r = this.flowParseDeclare(r, !0);i.push(r);
						}this.expect(C.braceR), this.finishNode(s, "BlockStatement");var n = null,
						    o = !1,
						    h = "Found both `declare module.exports` and `declare export` in the same module. Modules can only have 1 since they are either an ES module or they are a CommonJS module";return i.forEach(function (t) {
							d(t) ? ("CommonJS" === n && e.unexpected(t.start, h), n = "ES") : "DeclareModuleExports" === t.type && (o && e.unexpected(t.start, "Duplicate `declare module.exports` statement"), "ES" === n && e.unexpected(t.start, h), n = "CommonJS", o = !0);
						}), t.kind = n || "CommonJS", this.finishNode(t, "DeclareModule");
					}, e.prototype.flowParseDeclareExportDeclaration = function (t, e) {
						if (this.expect(C._export), this.eat(C._default)) return this.match(C._function) || this.match(C._class) ? t.declaration = this.flowParseDeclare(this.startNode()) : (t.declaration = this.flowParseType(), this.semicolon()), t.default = !0, this.finishNode(t, "DeclareExportDeclaration");if (this.match(C._const) || this.match(C._let) || (this.isContextual("type") || this.isContextual("interface")) && !e) {
							var s = this.state.value,
							    i = rt[s];this.unexpected(this.state.start, "`declare export " + s + "` is not supported. Use `" + i + "` instead");
						}if (this.match(C._var) || this.match(C._function) || this.match(C._class)) return t.declaration = this.flowParseDeclare(this.startNode()), t.default = !1, this.finishNode(t, "DeclareExportDeclaration");if (this.match(C.star) || this.match(C.braceL) || this.isContextual("interface") || this.isContextual("type")) return "ExportNamedDeclaration" === (t = this.parseExport(t)).type && (t.type = "ExportDeclaration", t.default = !1, delete t.exportKind), t.type = "Declare" + t.type, t;throw this.unexpected();
					}, e.prototype.flowParseDeclareModuleExports = function (t) {
						return this.expectContextual("module"), this.expect(C.dot), this.expectContextual("exports"), t.typeAnnotation = this.flowParseTypeAnnotation(), this.semicolon(), this.finishNode(t, "DeclareModuleExports");
					}, e.prototype.flowParseDeclareTypeAlias = function (t) {
						return this.next(), this.flowParseTypeAlias(t), this.finishNode(t, "DeclareTypeAlias");
					}, e.prototype.flowParseDeclareInterface = function (t) {
						return this.next(), this.flowParseInterfaceish(t), this.finishNode(t, "DeclareInterface");
					}, e.prototype.flowParseInterfaceish = function (t) {
						if (t.id = this.parseIdentifier(), this.isRelational("<") ? t.typeParameters = this.flowParseTypeParameterDeclaration() : t.typeParameters = null, t.extends = [], t.mixins = [], this.eat(C._extends)) do {
							t.extends.push(this.flowParseInterfaceExtends());
						} while (this.eat(C.comma));if (this.isContextual("mixins")) {
							this.next();do {
								t.mixins.push(this.flowParseInterfaceExtends());
							} while (this.eat(C.comma));
						}t.body = this.flowParseObjectType(!0, !1, !1);
					}, e.prototype.flowParseInterfaceExtends = function () {
						var t = this.startNode();return t.id = this.flowParseQualifiedTypeIdentifier(), this.isRelational("<") ? t.typeParameters = this.flowParseTypeParameterInstantiation() : t.typeParameters = null, this.finishNode(t, "InterfaceExtends");
					}, e.prototype.flowParseInterface = function (t) {
						return this.flowParseInterfaceish(t), this.finishNode(t, "InterfaceDeclaration");
					}, e.prototype.flowParseRestrictedIdentifier = function (t) {
						return it.indexOf(this.state.value) > -1 && this.raise(this.state.start, "Cannot overwrite primitive type " + this.state.value), this.parseIdentifier(t);
					}, e.prototype.flowParseTypeAlias = function (t) {
						return t.id = this.flowParseRestrictedIdentifier(), this.isRelational("<") ? t.typeParameters = this.flowParseTypeParameterDeclaration() : t.typeParameters = null, t.right = this.flowParseTypeInitialiser(C.eq), this.semicolon(), this.finishNode(t, "TypeAlias");
					}, e.prototype.flowParseTypeParameter = function () {
						var t = this.startNode(),
						    e = this.flowParseVariance(),
						    s = this.flowParseTypeAnnotatableIdentifier();return t.name = s.name, t.variance = e, t.bound = s.typeAnnotation, this.match(C.eq) && (this.eat(C.eq), t.default = this.flowParseType()), this.finishNode(t, "TypeParameter");
					}, e.prototype.flowParseTypeParameterDeclaration = function () {
						var t = this.state.inType,
						    e = this.startNode();e.params = [], this.state.inType = !0, this.isRelational("<") || this.match(C.jsxTagStart) ? this.next() : this.unexpected();do {
							e.params.push(this.flowParseTypeParameter()), this.isRelational(">") || this.expect(C.comma);
						} while (!this.isRelational(">"));return this.expectRelational(">"), this.state.inType = t, this.finishNode(e, "TypeParameterDeclaration");
					}, e.prototype.flowParseTypeParameterInstantiation = function () {
						var t = this.startNode(),
						    e = this.state.inType;for (t.params = [], this.state.inType = !0, this.expectRelational("<"); !this.isRelational(">");) {
							t.params.push(this.flowParseType()), this.isRelational(">") || this.expect(C.comma);
						}return this.expectRelational(">"), this.state.inType = e, this.finishNode(t, "TypeParameterInstantiation");
					}, e.prototype.flowParseObjectPropertyKey = function () {
						return this.match(C.num) || this.match(C.string) ? this.parseExprAtom() : this.parseIdentifier(!0);
					}, e.prototype.flowParseObjectTypeIndexer = function (t, e, s) {
						return t.static = e, this.expect(C.bracketL), this.lookahead().type === C.colon ? (t.id = this.flowParseObjectPropertyKey(), t.key = this.flowParseTypeInitialiser()) : (t.id = null, t.key = this.flowParseType()), this.expect(C.bracketR), t.value = this.flowParseTypeInitialiser(), t.variance = s, this.finishNode(t, "ObjectTypeIndexer");
					}, e.prototype.flowParseObjectTypeMethodish = function (t) {
						for (t.params = [], t.rest = null, t.typeParameters = null, this.isRelational("<") && (t.typeParameters = this.flowParseTypeParameterDeclaration()), this.expect(C.parenL); !this.match(C.parenR) && !this.match(C.ellipsis);) {
							t.params.push(this.flowParseFunctionTypeParam()), this.match(C.parenR) || this.expect(C.comma);
						}return this.eat(C.ellipsis) && (t.rest = this.flowParseFunctionTypeParam()), this.expect(C.parenR), t.returnType = this.flowParseTypeInitialiser(), this.finishNode(t, "FunctionTypeAnnotation");
					}, e.prototype.flowParseObjectTypeCallProperty = function (t, e) {
						var s = this.startNode();return t.static = e, t.value = this.flowParseObjectTypeMethodish(s), this.finishNode(t, "ObjectTypeCallProperty");
					}, e.prototype.flowParseObjectType = function (t, e, s) {
						var i = this.state.inType;this.state.inType = !0;var r = this.startNode();r.callProperties = [], r.properties = [], r.indexers = [];var a = void 0,
						    n = void 0;for (e && this.match(C.braceBarL) ? (this.expect(C.braceBarL), a = C.braceBarR, n = !0) : (this.expect(C.braceL), a = C.braceR, n = !1), r.exact = n; !this.match(a);) {
							var o = !1,
							    h = this.startNode();t && this.isContextual("static") && this.lookahead().type !== C.colon && (this.next(), o = !0);var p = this.flowParseVariance();if (this.match(C.bracketL)) r.indexers.push(this.flowParseObjectTypeIndexer(h, o, p));else if (this.match(C.parenL) || this.isRelational("<")) p && this.unexpected(p.start), r.callProperties.push(this.flowParseObjectTypeCallProperty(h, o));else {
								var c = "init";if (this.isContextual("get") || this.isContextual("set")) {
									var l = this.lookahead();l.type !== C.name && l.type !== C.string && l.type !== C.num || (c = this.state.value, this.next());
								}r.properties.push(this.flowParseObjectTypeProperty(h, o, p, c, s));
							}this.flowObjectTypeSemicolon();
						}this.expect(a);var u = this.finishNode(r, "ObjectTypeAnnotation");return this.state.inType = i, u;
					}, e.prototype.flowParseObjectTypeProperty = function (t, e, s, i, r) {
						if (this.match(C.ellipsis)) return r || this.unexpected(null, "Spread operator cannot appear in class or interface definitions"), s && this.unexpected(s.start, "Spread properties cannot have variance"), this.expect(C.ellipsis), t.argument = this.flowParseType(), this.finishNode(t, "ObjectTypeSpreadProperty");t.key = this.flowParseObjectPropertyKey(), t.static = e, t.kind = i;var a = !1;return this.isRelational("<") || this.match(C.parenL) ? (s && this.unexpected(s.start), t.value = this.flowParseObjectTypeMethodish(this.startNodeAt(t.start, t.loc.start)), "get" !== i && "set" !== i || this.flowCheckGetterSetterParamCount(t)) : ("init" !== i && this.unexpected(), this.eat(C.question) && (a = !0), t.value = this.flowParseTypeInitialiser(), t.variance = s), t.optional = a, this.finishNode(t, "ObjectTypeProperty");
					}, e.prototype.flowCheckGetterSetterParamCount = function (t) {
						var e = "get" === t.kind ? 0 : 1;if (t.value.params.length !== e) {
							var s = t.start;"get" === t.kind ? this.raise(s, "getter should have no params") : this.raise(s, "setter should have exactly one param");
						}
					}, e.prototype.flowObjectTypeSemicolon = function () {
						this.eat(C.semi) || this.eat(C.comma) || this.match(C.braceR) || this.match(C.braceBarR) || this.unexpected();
					}, e.prototype.flowParseQualifiedTypeIdentifier = function (t, e, s) {
						t = t || this.state.start, e = e || this.state.startLoc;for (var i = s || this.parseIdentifier(); this.eat(C.dot);) {
							var r = this.startNodeAt(t, e);r.qualification = i, r.id = this.parseIdentifier(), i = this.finishNode(r, "QualifiedTypeIdentifier");
						}return i;
					}, e.prototype.flowParseGenericType = function (t, e, s) {
						var i = this.startNodeAt(t, e);return i.typeParameters = null, i.id = this.flowParseQualifiedTypeIdentifier(t, e, s), this.isRelational("<") && (i.typeParameters = this.flowParseTypeParameterInstantiation()), this.finishNode(i, "GenericTypeAnnotation");
					}, e.prototype.flowParseTypeofType = function () {
						var t = this.startNode();return this.expect(C._typeof), t.argument = this.flowParsePrimaryType(), this.finishNode(t, "TypeofTypeAnnotation");
					}, e.prototype.flowParseTupleType = function () {
						var t = this.startNode();for (t.types = [], this.expect(C.bracketL); this.state.pos < this.input.length && !this.match(C.bracketR) && (t.types.push(this.flowParseType()), !this.match(C.bracketR));) {
							this.expect(C.comma);
						}return this.expect(C.bracketR), this.finishNode(t, "TupleTypeAnnotation");
					}, e.prototype.flowParseFunctionTypeParam = function () {
						var t = null,
						    e = !1,
						    s = null,
						    i = this.startNode(),
						    r = this.lookahead();return r.type === C.colon || r.type === C.question ? (t = this.parseIdentifier(), this.eat(C.question) && (e = !0), s = this.flowParseTypeInitialiser()) : s = this.flowParseType(), i.name = t, i.optional = e, i.typeAnnotation = s, this.finishNode(i, "FunctionTypeParam");
					}, e.prototype.reinterpretTypeAsFunctionTypeParam = function (t) {
						var e = this.startNodeAt(t.start, t.loc.start);return e.name = null, e.optional = !1, e.typeAnnotation = t, this.finishNode(e, "FunctionTypeParam");
					}, e.prototype.flowParseFunctionTypeParams = function () {
						for (var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], e = null; !this.match(C.parenR) && !this.match(C.ellipsis);) {
							t.push(this.flowParseFunctionTypeParam()), this.match(C.parenR) || this.expect(C.comma);
						}return this.eat(C.ellipsis) && (e = this.flowParseFunctionTypeParam()), { params: t, rest: e };
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
						    n = this.state.noAnonFunctionType;switch (this.state.type) {case C.name:
								return this.flowIdentToTypeAnnotation(t, e, s, this.parseIdentifier());case C.braceL:
								return this.flowParseObjectType(!1, !1, !0);case C.braceBarL:
								return this.flowParseObjectType(!1, !0, !0);case C.bracketL:
								return this.flowParseTupleType();case C.relational:
								if ("<" === this.state.value) return s.typeParameters = this.flowParseTypeParameterDeclaration(), this.expect(C.parenL), i = this.flowParseFunctionTypeParams(), s.params = i.params, s.rest = i.rest, this.expect(C.parenR), this.expect(C.arrow), s.returnType = this.flowParseType(), this.finishNode(s, "FunctionTypeAnnotation");break;case C.parenL:
								if (this.next(), !this.match(C.parenR) && !this.match(C.ellipsis)) if (this.match(C.name)) {
									var o = this.lookahead().type;a = o !== C.question && o !== C.colon;
								} else a = !0;if (a) {
									if (this.state.noAnonFunctionType = !1, r = this.flowParseType(), this.state.noAnonFunctionType = n, this.state.noAnonFunctionType || !(this.match(C.comma) || this.match(C.parenR) && this.lookahead().type === C.arrow)) return this.expect(C.parenR), r;this.eat(C.comma);
								}return i = r ? this.flowParseFunctionTypeParams([this.reinterpretTypeAsFunctionTypeParam(r)]) : this.flowParseFunctionTypeParams(), s.params = i.params, s.rest = i.rest, this.expect(C.parenR), this.expect(C.arrow), s.returnType = this.flowParseType(), s.typeParameters = null, this.finishNode(s, "FunctionTypeAnnotation");case C.string:
								return this.parseLiteral(this.state.value, "StringLiteralTypeAnnotation");case C._true:case C._false:
								return s.value = this.match(C._true), this.next(), this.finishNode(s, "BooleanLiteralTypeAnnotation");case C.plusMin:
								if ("-" === this.state.value) return this.next(), this.match(C.num) || this.unexpected(null, "Unexpected token, expected number"), this.parseLiteral(-this.state.value, "NumberLiteralTypeAnnotation", s.start, s.loc.start);this.unexpected();case C.num:
								return this.parseLiteral(this.state.value, "NumberLiteralTypeAnnotation");case C._null:
								return s.value = this.match(C._null), this.next(), this.finishNode(s, "NullLiteralTypeAnnotation");case C._this:
								return s.value = this.match(C._this), this.next(), this.finishNode(s, "ThisTypeAnnotation");case C.star:
								return this.next(), this.finishNode(s, "ExistsTypeAnnotation");default:
								if ("typeof" === this.state.type.keyword) return this.flowParseTypeofType();}throw this.unexpected();
					}, e.prototype.flowParsePostfixType = function () {
						for (var t = this.state.start, e = this.state.startLoc, s = this.flowParsePrimaryType(); !this.canInsertSemicolon() && this.match(C.bracketL);) {
							var i = this.startNodeAt(t, e);i.elementType = s, this.expect(C.bracketL), this.expect(C.bracketR), s = this.finishNode(i, "ArrayTypeAnnotation");
						}return s;
					}, e.prototype.flowParsePrefixType = function () {
						var t = this.startNode();return this.eat(C.question) ? (t.typeAnnotation = this.flowParsePrefixType(), this.finishNode(t, "NullableTypeAnnotation")) : this.flowParsePostfixType();
					}, e.prototype.flowParseAnonFunctionWithoutParens = function () {
						var t = this.flowParsePrefixType();if (!this.state.noAnonFunctionType && this.eat(C.arrow)) {
							var e = this.startNodeAt(t.start, t.loc.start);return e.params = [this.reinterpretTypeAsFunctionTypeParam(t)], e.rest = null, e.returnType = this.flowParseType(), e.typeParameters = null, this.finishNode(e, "FunctionTypeAnnotation");
						}return t;
					}, e.prototype.flowParseIntersectionType = function () {
						var t = this.startNode();this.eat(C.bitwiseAND);var e = this.flowParseAnonFunctionWithoutParens();for (t.types = [e]; this.eat(C.bitwiseAND);) {
							t.types.push(this.flowParseAnonFunctionWithoutParens());
						}return 1 === t.types.length ? e : this.finishNode(t, "IntersectionTypeAnnotation");
					}, e.prototype.flowParseUnionType = function () {
						var t = this.startNode();this.eat(C.bitwiseOR);var e = this.flowParseIntersectionType();for (t.types = [e]; this.eat(C.bitwiseOR);) {
							t.types.push(this.flowParseIntersectionType());
						}return 1 === t.types.length ? e : this.finishNode(t, "UnionTypeAnnotation");
					}, e.prototype.flowParseType = function () {
						var t = this.state.inType;this.state.inType = !0;var e = this.flowParseUnionType();return this.state.inType = t, e;
					}, e.prototype.flowParseTypeAnnotation = function () {
						var t = this.startNode();return t.typeAnnotation = this.flowParseTypeInitialiser(), this.finishNode(t, "TypeAnnotation");
					}, e.prototype.flowParseTypeAnnotatableIdentifier = function () {
						var t = this.flowParseRestrictedIdentifier();return this.match(C.colon) && (t.typeAnnotation = this.flowParseTypeAnnotation(), this.finishNode(t, t.type)), t;
					}, e.prototype.typeCastToParameter = function (t) {
						return t.expression.typeAnnotation = t.typeAnnotation, this.finishNodeAt(t.expression, t.expression.type, t.typeAnnotation.end, t.typeAnnotation.loc.end);
					}, e.prototype.flowParseVariance = function () {
						var t = null;return this.match(C.plusMin) && (t = this.startNode(), "+" === this.state.value ? t.kind = "plus" : t.kind = "minus", this.next(), this.finishNode(t, "Variance")), t;
					}, e.prototype.parseFunctionBody = function (e, s) {
						if (this.match(C.colon) && !s) {
							var i = this.startNode(),
							    r = this.flowParseTypeAndPredicateInitialiser();i.typeAnnotation = r[0], e.predicate = r[1], e.returnType = i.typeAnnotation ? this.finishNode(i, "TypeAnnotation") : null;
						}return t.prototype.parseFunctionBody.call(this, e, s);
					}, e.prototype.parseStatement = function (e, s) {
						if (this.state.strict && this.match(C.name) && "interface" === this.state.value) {
							var i = this.startNode();return this.next(), this.flowParseInterface(i);
						}return t.prototype.parseStatement.call(this, e, s);
					}, e.prototype.parseExpressionStatement = function (e, s) {
						if ("Identifier" === s.type) if ("declare" === s.name) {
							if (this.match(C._class) || this.match(C.name) || this.match(C._function) || this.match(C._var) || this.match(C._export)) return this.flowParseDeclare(e);
						} else if (this.match(C.name)) {
							if ("interface" === s.name) return this.flowParseInterface(e);if ("type" === s.name) return this.flowParseTypeAlias(e);
						}return t.prototype.parseExpressionStatement.call(this, e, s);
					}, e.prototype.shouldParseExportDeclaration = function () {
						return this.isContextual("type") || this.isContextual("interface") || t.prototype.shouldParseExportDeclaration.call(this);
					}, e.prototype.isExportDefaultSpecifier = function () {
						return (!this.match(C.name) || "type" !== this.state.value && "interface" !== this.state.value) && t.prototype.isExportDefaultSpecifier.call(this);
					}, e.prototype.parseConditional = function (e, s, i, r, a) {
						if (a && this.match(C.question)) {
							var n = this.state.clone();try {
								return t.prototype.parseConditional.call(this, e, s, i, r);
							} catch (t) {
								if (t instanceof SyntaxError) return this.state = n, a.start = t.pos || this.state.start, e;throw t;
							}
						}return t.prototype.parseConditional.call(this, e, s, i, r);
					}, e.prototype.parseParenItem = function (e, s, i) {
						if (e = t.prototype.parseParenItem.call(this, e, s, i), this.eat(C.question) && (e.optional = !0), this.match(C.colon)) {
							var r = this.startNodeAt(s, i);return r.expression = e, r.typeAnnotation = this.flowParseTypeAnnotation(), this.finishNode(r, "TypeCastExpression");
						}return e;
					}, e.prototype.parseExport = function (e) {
						return "ExportNamedDeclaration" === (e = t.prototype.parseExport.call(this, e)).type && (e.exportKind = e.exportKind || "value"), e;
					}, e.prototype.parseExportDeclaration = function (e) {
						if (this.isContextual("type")) {
							e.exportKind = "type";var s = this.startNode();return this.next(), this.match(C.braceL) ? (e.specifiers = this.parseExportSpecifiers(), this.parseExportFrom(e), null) : this.flowParseTypeAlias(s);
						}if (this.isContextual("interface")) {
							e.exportKind = "type";var i = this.startNode();return this.next(), this.flowParseInterface(i);
						}return t.prototype.parseExportDeclaration.call(this, e);
					}, e.prototype.parseClassId = function (e, s, i) {
						t.prototype.parseClassId.call(this, e, s, i), this.isRelational("<") && (e.typeParameters = this.flowParseTypeParameterDeclaration());
					}, e.prototype.isKeyword = function (e) {
						return (!this.state.inType || "void" !== e) && t.prototype.isKeyword.call(this, e);
					}, e.prototype.readToken = function (e) {
						return !this.state.inType || 62 !== e && 60 !== e ? t.prototype.readToken.call(this, e) : this.finishOp(C.relational, 1);
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
						    a = t.prototype.parseExprListItem.call(this, e, s, i);return this.match(C.colon) ? (r._exprListItem = !0, r.expression = a, r.typeAnnotation = this.flowParseTypeAnnotation(), this.finishNode(r, "TypeCastExpression")) : a;
					}, e.prototype.checkLVal = function (e, s, i, r) {
						if ("TypeCastExpression" !== e.type) return t.prototype.checkLVal.call(this, e, s, i, r);
					}, e.prototype.parseClassProperty = function (e) {
						return this.match(C.colon) && (e.typeAnnotation = this.flowParseTypeAnnotation()), t.prototype.parseClassProperty.call(this, e);
					}, e.prototype.isClassMethod = function () {
						return this.isRelational("<") || t.prototype.isClassMethod.call(this);
					}, e.prototype.isClassProperty = function () {
						return this.match(C.colon) || t.prototype.isClassProperty.call(this);
					}, e.prototype.isNonstaticConstructor = function (e) {
						return !this.match(C.colon) && t.prototype.isNonstaticConstructor.call(this, e);
					}, e.prototype.parseClassMethod = function (e, s, i, r) {
						s.variance && this.unexpected(s.variance.start), delete s.variance, this.isRelational("<") && (s.typeParameters = this.flowParseTypeParameterDeclaration()), t.prototype.parseClassMethod.call(this, e, s, i, r);
					}, e.prototype.parseClassSuper = function (e) {
						if (t.prototype.parseClassSuper.call(this, e), e.superClass && this.isRelational("<") && (e.superTypeParameters = this.flowParseTypeParameterInstantiation()), this.isContextual("implements")) {
							this.next();var s = e.implements = [];do {
								var i = this.startNode();i.id = this.parseIdentifier(), this.isRelational("<") ? i.typeParameters = this.flowParseTypeParameterInstantiation() : i.typeParameters = null, s.push(this.finishNode(i, "ClassImplements"));
							} while (this.eat(C.comma));
						}
					}, e.prototype.parsePropertyName = function (e) {
						var s = this.flowParseVariance(),
						    i = t.prototype.parsePropertyName.call(this, e);return e.variance = s, i;
					}, e.prototype.parseObjPropValue = function (e, s, i, r, a, n, o) {
						e.variance && this.unexpected(e.variance.start), delete e.variance;var h = void 0;this.isRelational("<") && (h = this.flowParseTypeParameterDeclaration(), this.match(C.parenL) || this.unexpected()), t.prototype.parseObjPropValue.call(this, e, s, i, r, a, n, o), h && ((e.value || e).typeParameters = h);
					}, e.prototype.parseAssignableListItemTypes = function (t) {
						return this.eat(C.question) && (t.optional = !0), this.match(C.colon) && (t.typeAnnotation = this.flowParseTypeAnnotation()), this.finishNode(t, t.type), t;
					}, e.prototype.parseMaybeDefault = function (e, s, i) {
						var r = t.prototype.parseMaybeDefault.call(this, e, s, i);return "AssignmentPattern" === r.type && r.typeAnnotation && r.right.start < r.typeAnnotation.start && this.raise(r.typeAnnotation.start, "Type annotations must come before default assignments, e.g. instead of `age = 25: number` use `age: number = 25`"), r;
					}, e.prototype.parseImportSpecifiers = function (e) {
						e.importKind = "value";var s = null;if (this.match(C._typeof) ? s = "typeof" : this.isContextual("type") && (s = "type"), s) {
							var i = this.lookahead();(i.type === C.name && "from" !== i.value || i.type === C.braceL || i.type === C.star) && (this.next(), e.importKind = s);
						}t.prototype.parseImportSpecifiers.call(this, e);
					}, e.prototype.parseImportSpecifier = function (t) {
						var e = this.startNode(),
						    s = this.state.start,
						    i = this.parseIdentifier(!0),
						    r = null;"type" === i.name ? r = "type" : "typeof" === i.name && (r = "typeof");var a = !1;if (this.isContextual("as")) {
							var n = this.parseIdentifier(!0);null === r || this.match(C.name) || this.state.type.keyword ? (e.imported = i, e.importKind = null, e.local = this.parseIdentifier()) : (e.imported = n, e.importKind = r, e.local = n.__clone());
						} else null !== r && (this.match(C.name) || this.state.type.keyword) ? (e.imported = this.parseIdentifier(!0), e.importKind = r, this.eatContextual("as") ? e.local = this.parseIdentifier() : (a = !0, e.local = e.imported.__clone())) : (a = !0, e.imported = i, e.importKind = null, e.local = e.imported.__clone());"type" !== t.importKind && "typeof" !== t.importKind || "type" !== e.importKind && "typeof" !== e.importKind || this.raise(s, "`The `type` and `typeof` keywords on named imports can only be used on regular `import` statements. It cannot be used with `import type` or `import typeof` statements`"), a && this.checkReservedWord(e.local.name, e.start, !0, !0), this.checkLVal(e.local, !0, void 0, "import specifier"), t.specifiers.push(this.finishNode(e, "ImportSpecifier"));
					}, e.prototype.parseFunctionParams = function (e) {
						this.isRelational("<") && (e.typeParameters = this.flowParseTypeParameterDeclaration()), t.prototype.parseFunctionParams.call(this, e);
					}, e.prototype.parseVarHead = function (e) {
						t.prototype.parseVarHead.call(this, e), this.match(C.colon) && (e.id.typeAnnotation = this.flowParseTypeAnnotation(), this.finishNode(e.id, e.id.type));
					}, e.prototype.parseAsyncArrowFromCallExpression = function (e, s) {
						if (this.match(C.colon)) {
							var i = this.state.noAnonFunctionType;this.state.noAnonFunctionType = !0, e.returnType = this.flowParseTypeAnnotation(), this.state.noAnonFunctionType = i;
						}return t.prototype.parseAsyncArrowFromCallExpression.call(this, e, s);
					}, e.prototype.shouldParseAsyncArrow = function () {
						return this.match(C.colon) || t.prototype.shouldParseAsyncArrow.call(this);
					}, e.prototype.parseMaybeAssign = function (e, s, i, r) {
						var a = null;if (C.jsxTagStart && this.match(C.jsxTagStart)) {
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
						if (this.match(C.colon)) {
							var s = this.state.clone();try {
								var i = this.state.noAnonFunctionType;this.state.noAnonFunctionType = !0;var r = this.startNode(),
								    a = this.flowParseTypeAndPredicateInitialiser();r.typeAnnotation = a[0], e.predicate = a[1], this.state.noAnonFunctionType = i, this.canInsertSemicolon() && this.unexpected(), this.match(C.arrow) || this.unexpected(), e.returnType = r.typeAnnotation ? this.finishNode(r, "TypeAnnotation") : null;
							} catch (t) {
								if (!(t instanceof SyntaxError)) throw t;this.state = s;
							}
						}return t.prototype.parseArrow.call(this, e);
					}, e.prototype.shouldParseArrow = function () {
						return this.match(C.colon) || t.prototype.shouldParseArrow.call(this);
					}, e;
				}(t);
			},
			    nt = { quot: '"', amp: "&", apos: "'", lt: "<", gt: ">", nbsp: " ", iexcl: "¡", cent: "¢", pound: "£", curren: "¤", yen: "¥", brvbar: "¦", sect: "§", uml: "¨", copy: "©", ordf: "ª", laquo: "«", not: "¬", shy: "­", reg: "®", macr: "¯", deg: "°", plusmn: "±", sup2: "²", sup3: "³", acute: "´", micro: "µ", para: "¶", middot: "·", cedil: "¸", sup1: "¹", ordm: "º", raquo: "»", frac14: "¼", frac12: "½", frac34: "¾", iquest: "¿", Agrave: "À", Aacute: "Á", Acirc: "Â", Atilde: "Ã", Auml: "Ä", Aring: "Å", AElig: "Æ", Ccedil: "Ç", Egrave: "È", Eacute: "É", Ecirc: "Ê", Euml: "Ë", Igrave: "Ì", Iacute: "Í", Icirc: "Î", Iuml: "Ï", ETH: "Ð", Ntilde: "Ñ", Ograve: "Ò", Oacute: "Ó", Ocirc: "Ô", Otilde: "Õ", Ouml: "Ö", times: "×", Oslash: "Ø", Ugrave: "Ù", Uacute: "Ú", Ucirc: "Û", Uuml: "Ü", Yacute: "Ý", THORN: "Þ", szlig: "ß", agrave: "à", aacute: "á", acirc: "â", atilde: "ã", auml: "ä", aring: "å", aelig: "æ", ccedil: "ç", egrave: "è", eacute: "é", ecirc: "ê", euml: "ë", igrave: "ì", iacute: "í", icirc: "î", iuml: "ï", eth: "ð", ntilde: "ñ", ograve: "ò", oacute: "ó", ocirc: "ô", otilde: "õ", ouml: "ö", divide: "÷", oslash: "ø", ugrave: "ù", uacute: "ú", ucirc: "û", uuml: "ü", yacute: "ý", thorn: "þ", yuml: "ÿ", OElig: "Œ", oelig: "œ", Scaron: "Š", scaron: "š", Yuml: "Ÿ", fnof: "ƒ", circ: "ˆ", tilde: "˜", Alpha: "Α", Beta: "Β", Gamma: "Γ", Delta: "Δ", Epsilon: "Ε", Zeta: "Ζ", Eta: "Η", Theta: "Θ", Iota: "Ι", Kappa: "Κ", Lambda: "Λ", Mu: "Μ", Nu: "Ν", Xi: "Ξ", Omicron: "Ο", Pi: "Π", Rho: "Ρ", Sigma: "Σ", Tau: "Τ", Upsilon: "Υ", Phi: "Φ", Chi: "Χ", Psi: "Ψ", Omega: "Ω", alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", zeta: "ζ", eta: "η", theta: "θ", iota: "ι", kappa: "κ", lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", omicron: "ο", pi: "π", rho: "ρ", sigmaf: "ς", sigma: "σ", tau: "τ", upsilon: "υ", phi: "φ", chi: "χ", psi: "ψ", omega: "ω", thetasym: "ϑ", upsih: "ϒ", piv: "ϖ", ensp: " ", emsp: " ", thinsp: " ", zwnj: "‌", zwj: "‍", lrm: "‎", rlm: "‏", ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", sbquo: "‚", ldquo: "“", rdquo: "”", bdquo: "„", dagger: "†", Dagger: "‡", bull: "•", hellip: "…", permil: "‰", prime: "′", Prime: "″", lsaquo: "‹", rsaquo: "›", oline: "‾", frasl: "⁄", euro: "€", image: "ℑ", weierp: "℘", real: "ℜ", trade: "™", alefsym: "ℵ", larr: "←", uarr: "↑", rarr: "→", darr: "↓", harr: "↔", crarr: "↵", lArr: "⇐", uArr: "⇑", rArr: "⇒", dArr: "⇓", hArr: "⇔", forall: "∀", part: "∂", exist: "∃", empty: "∅", nabla: "∇", isin: "∈", notin: "∉", ni: "∋", prod: "∏", sum: "∑", minus: "−", lowast: "∗", radic: "√", prop: "∝", infin: "∞", ang: "∠", and: "∧", or: "∨", cap: "∩", cup: "∪", int: "∫", there4: "∴", sim: "∼", cong: "≅", asymp: "≈", ne: "≠", equiv: "≡", le: "≤", ge: "≥", sub: "⊂", sup: "⊃", nsub: "⊄", sube: "⊆", supe: "⊇", oplus: "⊕", otimes: "⊗", perp: "⊥", sdot: "⋅", lceil: "⌈", rceil: "⌉", lfloor: "⌊", rfloor: "⌋", lang: "〈", rang: "〉", loz: "◊", spades: "♠", clubs: "♣", hearts: "♥", diams: "♦" },
			    ot = /^[\da-fA-F]+$/,
			    ht = /^\d+$/;V.j_oTag = new q("<tag", !1), V.j_cTag = new q("</tag", !1), V.j_expr = new q("<tag>...</tag>", !0, !0), C.jsxName = new k("jsxName"), C.jsxText = new k("jsxText", { beforeExpr: !0 }), C.jsxTagStart = new k("jsxTagStart", { startsExpr: !0 }), C.jsxTagEnd = new k("jsxTagEnd"), C.jsxTagStart.updateContext = function () {
				this.state.context.push(V.j_expr), this.state.context.push(V.j_oTag), this.state.exprAllowed = !1;
			}, C.jsxTagEnd.updateContext = function (t) {
				var e = this.state.context.pop();e === V.j_oTag && t === C.slash || e === V.j_cTag ? (this.state.context.pop(), this.state.exprAllowed = this.curContext() === V.j_expr) : this.state.exprAllowed = !0;
			};var pt = function pt(t) {
				return function (t) {
					function e() {
						return g(this, e), P(this, t.apply(this, arguments));
					}return w(e, t), e.prototype.jsxReadToken = function () {
						for (var t = "", e = this.state.pos;;) {
							this.state.pos >= this.input.length && this.raise(this.state.start, "Unterminated JSX contents");var s = this.input.charCodeAt(this.state.pos);switch (s) {case 60:case 123:
									return this.state.pos === this.state.start ? 60 === s && this.state.exprAllowed ? (++this.state.pos, this.finishToken(C.jsxTagStart)) : this.getTokenFromCode(s) : (t += this.input.slice(e, this.state.pos), this.finishToken(C.jsxText, t));case 38:
									t += this.input.slice(e, this.state.pos), t += this.jsxReadEntity(), e = this.state.pos;break;default:
									o(s) ? (t += this.input.slice(e, this.state.pos), t += this.jsxReadNewLine(!0), e = this.state.pos) : ++this.state.pos;}
						}
					}, e.prototype.jsxReadNewLine = function (t) {
						var e = this.input.charCodeAt(this.state.pos),
						    s = void 0;return ++this.state.pos, 13 === e && 10 === this.input.charCodeAt(this.state.pos) ? (++this.state.pos, s = t ? "\n" : "\r\n") : s = String.fromCharCode(e), ++this.state.curLine, this.state.lineStart = this.state.pos, s;
					}, e.prototype.jsxReadString = function (t) {
						for (var e = "", s = ++this.state.pos;;) {
							this.state.pos >= this.input.length && this.raise(this.state.start, "Unterminated string constant");var i = this.input.charCodeAt(this.state.pos);if (i === t) break;38 === i ? (e += this.input.slice(s, this.state.pos), e += this.jsxReadEntity(), s = this.state.pos) : o(i) ? (e += this.input.slice(s, this.state.pos), e += this.jsxReadNewLine(!1), s = this.state.pos) : ++this.state.pos;
						}return e += this.input.slice(s, this.state.pos++), this.finishToken(C.string, e);
					}, e.prototype.jsxReadEntity = function () {
						for (var t = "", e = 0, s = void 0, i = this.input[this.state.pos], r = ++this.state.pos; this.state.pos < this.input.length && e++ < 10;) {
							if (";" === (i = this.input[this.state.pos++])) {
								"#" === t[0] ? "x" === t[1] ? (t = t.substr(2), ot.test(t) && (s = String.fromCodePoint(parseInt(t, 16)))) : (t = t.substr(1), ht.test(t) && (s = String.fromCodePoint(parseInt(t, 10)))) : s = nt[t];break;
							}t += i;
						}return s || (this.state.pos = r, "&");
					}, e.prototype.jsxReadWord = function () {
						var t = void 0,
						    e = this.state.pos;do {
							t = this.input.charCodeAt(++this.state.pos);
						} while (n(t) || 45 === t);return this.finishToken(C.jsxName, this.input.slice(e, this.state.pos));
					}, e.prototype.jsxParseIdentifier = function () {
						var t = this.startNode();return this.match(C.jsxName) ? t.name = this.state.value : this.state.type.keyword ? t.name = this.state.type.keyword : this.unexpected(), this.next(), this.finishNode(t, "JSXIdentifier");
					}, e.prototype.jsxParseNamespacedName = function () {
						var t = this.state.start,
						    e = this.state.startLoc,
						    s = this.jsxParseIdentifier();if (!this.eat(C.colon)) return s;var i = this.startNodeAt(t, e);return i.namespace = s, i.name = this.jsxParseIdentifier(), this.finishNode(i, "JSXNamespacedName");
					}, e.prototype.jsxParseElementName = function () {
						for (var t = this.state.start, e = this.state.startLoc, s = this.jsxParseNamespacedName(); this.eat(C.dot);) {
							var i = this.startNodeAt(t, e);i.object = s, i.property = this.jsxParseIdentifier(), s = this.finishNode(i, "JSXMemberExpression");
						}return s;
					}, e.prototype.jsxParseAttributeValue = function () {
						var t = void 0;switch (this.state.type) {case C.braceL:
								if ("JSXEmptyExpression" === (t = this.jsxParseExpressionContainer()).expression.type) throw this.raise(t.start, "JSX attributes must only be assigned a non-empty expression");return t;case C.jsxTagStart:case C.string:
								return this.parseExprAtom();default:
								throw this.raise(this.state.start, "JSX value should be either an expression or a quoted JSX text");}
					}, e.prototype.jsxParseEmptyExpression = function () {
						var t = this.startNodeAt(this.state.lastTokEnd, this.state.lastTokEndLoc);return this.finishNodeAt(t, "JSXEmptyExpression", this.state.start, this.state.startLoc);
					}, e.prototype.jsxParseSpreadChild = function () {
						var t = this.startNode();return this.expect(C.braceL), this.expect(C.ellipsis), t.expression = this.parseExpression(), this.expect(C.braceR), this.finishNode(t, "JSXSpreadChild");
					}, e.prototype.jsxParseExpressionContainer = function () {
						var t = this.startNode();return this.next(), this.match(C.braceR) ? t.expression = this.jsxParseEmptyExpression() : t.expression = this.parseExpression(), this.expect(C.braceR), this.finishNode(t, "JSXExpressionContainer");
					}, e.prototype.jsxParseAttribute = function () {
						var t = this.startNode();return this.eat(C.braceL) ? (this.expect(C.ellipsis), t.argument = this.parseMaybeAssign(), this.expect(C.braceR), this.finishNode(t, "JSXSpreadAttribute")) : (t.name = this.jsxParseNamespacedName(), t.value = this.eat(C.eq) ? this.jsxParseAttributeValue() : null, this.finishNode(t, "JSXAttribute"));
					}, e.prototype.jsxParseOpeningElementAt = function (t, e) {
						var s = this.startNodeAt(t, e);for (s.attributes = [], s.name = this.jsxParseElementName(); !this.match(C.slash) && !this.match(C.jsxTagEnd);) {
							s.attributes.push(this.jsxParseAttribute());
						}return s.selfClosing = this.eat(C.slash), this.expect(C.jsxTagEnd), this.finishNode(s, "JSXOpeningElement");
					}, e.prototype.jsxParseClosingElementAt = function (t, e) {
						var s = this.startNodeAt(t, e);return s.name = this.jsxParseElementName(), this.expect(C.jsxTagEnd), this.finishNode(s, "JSXClosingElement");
					}, e.prototype.jsxParseElementAt = function (t, e) {
						var s = this.startNodeAt(t, e),
						    i = [],
						    r = this.jsxParseOpeningElementAt(t, e),
						    a = null;if (!r.selfClosing) {
							t: for (;;) {
								switch (this.state.type) {case C.jsxTagStart:
										if (t = this.state.start, e = this.state.startLoc, this.next(), this.eat(C.slash)) {
											a = this.jsxParseClosingElementAt(t, e);break t;
										}i.push(this.jsxParseElementAt(t, e));break;case C.jsxText:
										i.push(this.parseExprAtom());break;case C.braceL:
										this.lookahead().type === C.ellipsis ? i.push(this.jsxParseSpreadChild()) : i.push(this.jsxParseExpressionContainer());break;default:
										throw this.unexpected();}
							}f(a.name) !== f(r.name) && this.raise(a.start, "Expected corresponding JSX closing tag for <" + f(r.name) + ">");
						}return s.openingElement = r, s.closingElement = a, s.children = i, this.match(C.relational) && "<" === this.state.value && this.raise(this.state.start, "Adjacent JSX elements must be wrapped in an enclosing tag"), this.finishNode(s, "JSXElement");
					}, e.prototype.jsxParseElement = function () {
						var t = this.state.start,
						    e = this.state.startLoc;return this.next(), this.jsxParseElementAt(t, e);
					}, e.prototype.parseExprAtom = function (e) {
						return this.match(C.jsxText) ? this.parseLiteral(this.state.value, "JSXText") : this.match(C.jsxTagStart) ? this.jsxParseElement() : t.prototype.parseExprAtom.call(this, e);
					}, e.prototype.readToken = function (e) {
						if (this.state.inPropertyName) return t.prototype.readToken.call(this, e);var s = this.curContext();if (s === V.j_expr) return this.jsxReadToken();if (s === V.j_oTag || s === V.j_cTag) {
							if (a(e)) return this.jsxReadWord();if (62 === e) return ++this.state.pos, this.finishToken(C.jsxTagEnd);if ((34 === e || 39 === e) && s === V.j_oTag) return this.jsxReadString(e);
						}return 60 === e && this.state.exprAllowed ? (++this.state.pos, this.finishToken(C.jsxTagStart)) : t.prototype.readToken.call(this, e);
					}, e.prototype.updateContext = function (e) {
						if (this.match(C.braceL)) {
							var s = this.curContext();s === V.j_oTag ? this.state.context.push(V.braceExpression) : s === V.j_expr ? this.state.context.push(V.templateQuasi) : t.prototype.updateContext.call(this, e), this.state.exprAllowed = !0;
						} else {
							if (!this.match(C.slash) || e !== C.jsxTagStart) return t.prototype.updateContext.call(this, e);this.state.context.length -= 2, this.state.context.push(V.j_cTag), this.state.exprAllowed = !1;
						}
					}, e;
				}(t);
			};tt.estree = st, tt.flow = at, tt.jsx = pt;var ct = {};e.parse = m, e.parseExpression = y, e.tokTypes = C;
		});var createError = parserCreateError;var parserBabylon = parse;module.exports = parserBabylon;
	});

	var parserBabylon = unwrapExports(parserBabylon_1);

	return parserBabylon;
}();
