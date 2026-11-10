/**
 * CODO GUIDE – Smart Local Coding Companion Analyzer
 * Deterministic, fast, beginner-friendly compiler/runtime & syntax diagnostics.
 * STRICTLY NO DSA HINTS OR ALGORITHMIC SOLUTIONS — focuses solely on syntax,
 * language fundamentals, and compiler/runtime errors.
 */

// Track last shown index per category to avoid repeating exact messages
const lastVariantIndex = {};

function pickVariant(category, variants) {
  if (!variants || variants.length === 0) return '';
  if (variants.length === 1) return variants[0];
  const prev = lastVariantIndex[category] ?? -1;
  const next = (prev + 1) % variants.length;
  lastVariantIndex[category] = next;
  return variants[next];
}

/**
 * Strip string literals and comments while preserving exact line breaks
 * so line numbers remain 100% accurate.
 */
export function stripStringsAndComments(code, language = 'javascript') {
  if (!code) return '';
  const isPython = language === 'python';
  let result = '';
  let i = 0;
  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;
  let inLineComment = false;
  let inBlockComment = false;

  while (i < code.length) {
    const ch = code[i];
    const next = code[i + 1];

    if (ch === '\n') {
      inLineComment = false;
      inSingle = false;
      inDouble = false;
      result += '\n';
      i++;
      continue;
    }

    if (inLineComment) {
      result += ' ';
      i++;
      continue;
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        result += '  ';
        i += 2;
      } else {
        result += ' ';
        i++;
      }
      continue;
    }

    if (inSingle) {
      if (ch === '\\' && i + 1 < code.length) {
        result += '  ';
        i += 2;
        continue;
      }
      if (ch === "'") inSingle = false;
      result += ' ';
      i++;
      continue;
    }

    if (inDouble) {
      if (ch === '\\' && i + 1 < code.length) {
        result += '  ';
        i += 2;
        continue;
      }
      if (ch === '"') inDouble = false;
      result += ' ';
      i++;
      continue;
    }

    if (inBacktick) {
      if (ch === '\\' && i + 1 < code.length) {
        result += '  ';
        i += 2;
        continue;
      }
      if (ch === '`') inBacktick = false;
      result += ' ';
      i++;
      continue;
    }

    // Check comment starts
    if (isPython && ch === '#') {
      inLineComment = true;
      result += ' ';
      i++;
      continue;
    }

    if (!isPython && ch === '/' && next === '/') {
      inLineComment = true;
      result += '  ';
      i += 2;
      continue;
    }

    if (!isPython && ch === '/' && next === '*') {
      inBlockComment = true;
      result += '  ';
      i += 2;
      continue;
    }

    // Check string starts
    if (ch === "'") {
      inSingle = true;
      result += ' ';
      i++;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      result += ' ';
      i++;
      continue;
    }
    if (ch === '`' && language === 'javascript') {
      inBacktick = true;
      result += ' ';
      i++;
      continue;
    }

    result += ch;
    i++;
  }

  return result;
}

/**
 * Check bracket balance: (), {}, []
 */
function checkBracketBalance(cleanCode) {
  const stack = [];
  const pairs = { '(': ')', '{': '}', '[': ']' };
  const closingToOpening = { ')': '(', '}': '{', ']': '[' };
  const names = {
    '(': 'parenthesis',
    ')': 'parenthesis',
    '{': 'curly brace',
    '}': 'curly brace',
    '[': 'square bracket',
    ']': 'square bracket',
  };

  let line = 1;
  for (let i = 0; i < cleanCode.length; i++) {
    const ch = cleanCode[i];
    if (ch === '\n') {
      line++;
      continue;
    }

    if (pairs[ch]) {
      stack.push({ char: ch, line });
    } else if (closingToOpening[ch]) {
      if (stack.length === 0) {
        return {
          category: 'extra_closing_bracket',
          line,
          message: `Oops! Extra closing ${names[ch]} '${ch}' on line ${line} with no matching opening '${closingToOpening[ch]}'.`,
          nextStep: `Remove the extra '${ch}' on line ${line} or add the missing '${closingToOpening[ch]}'.`,
          severity: 'error',
        };
      }
      const top = stack[stack.length - 1];
      if (pairs[top.char] !== ch) {
        if (top.char === '(' && ch === '}') {
          return {
            category: 'unclosed_paren',
            line: top.line,
            message: pickVariant('unclosed_paren', [
              `Looks like you forgot to close a parenthesis '(' on line ${top.line}!`,
              `Hey! One ')' is missing to close the '(' on line ${top.line}.`,
            ]),
            nextStep: `Add the missing closing ')' on line ${top.line}.`,
            severity: 'error',
          };
        }
        return {
          category: 'mismatched_bracket',
          line: top.line,
          message: `Bracket mix-up! You opened '${top.char}' on line ${top.line}, but tried to close it with '${ch}' on line ${line}.`,
          nextStep: `Match '${top.char}' from line ${top.line} with '${pairs[top.char]}'.`,
          severity: 'error',
        };
      }
      stack.pop();
    }
  }

  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1];
    if (unclosed.char === '{') {
      return {
        category: 'unclosed_brace',
        line: unclosed.line,
        message: pickVariant('unclosed_brace', [
          `Hey coder! You opened a curly brace '{' on line ${unclosed.line} but forgot to close it!`,
          `Oops! Check line ${unclosed.line} — your '{' is missing its matching '}' closing brace.`,
        ]),
        nextStep: `Add the missing '}' closing brace for the block started on line ${unclosed.line}.`,
        severity: 'error',
      };
    }
    if (unclosed.char === '(') {
      return {
        category: 'unclosed_paren',
        line: unclosed.line,
        message: pickVariant('unclosed_paren', [
          `Looks like you forgot to close a parenthesis '(' from line ${unclosed.line}!`,
          `Hey! One ')' is missing to close the '(' on line ${unclosed.line}.`,
        ]),
        nextStep: `Add a closing ')' for the expression on line ${unclosed.line}.`,
        severity: 'error',
      };
    }
    return {
      category: 'unclosed_bracket',
      line: unclosed.line,
      message: `Oops! You opened '[' on line ${unclosed.line} and forgot to close it with ']'.`,
      nextStep: `Add the closing ']' on line ${unclosed.line}.`,
      severity: 'error',
    };
  }

  return null;
}

/**
 * Check missing semicolons for C-like languages (C++, C, Java)
 */
function checkMissingSemicolons(rawCode, cleanCode, language) {
  const lines = cleanCode.split('\n');
  const rawLines = rawCode.split('\n');

  const controlHeaderRegex = /^(if|else\s+if|else|for|while|switch|catch|try|do|class|struct|enum|namespace|public|private|protected)\b/;
  const endsWithContinuationOp = /(\+|-|\*|\/|%|=|<|>|&|\||!|\?|,|:|\(|\[|\.|->|<<|>>|::)$/;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    // Ignore preprocessor, comments (already stripped), braces, labels
    if (trimmed.startsWith('#')) continue;
    if (trimmed.endsWith(';') || trimmed.endsWith('{') || trimmed.endsWith('}') || trimmed.endsWith(':')) continue;
    if (endsWithContinuationOp.test(trimmed)) continue;
    if (controlHeaderRegex.test(trimmed)) continue;

    // Check next non-empty line to see if it's a brace '{' (function signature / block) or chained method '.' / '->'
    let nextTrimmed = '';
    for (let j = i + 1; j < lines.length; j++) {
      const candidate = lines[j].trim();
      if (candidate) {
        nextTrimmed = candidate;
        break;
      }
    }
    if (nextTrimmed.startsWith('{') || nextTrimmed.startsWith('.') || nextTrimmed.startsWith('->')) {
      continue;
    }

    // Function definition signature heuristic: type name(...)
    if (/^[\w:<>*&\s]+\s+\w+\s*\([^;]*\)\s*(const)?$/.test(trimmed)) {
      continue;
    }

    // Detect last identifier on the raw line to make message personal (e.g. "after endl")
    const rawTrimmed = rawLines[i].trim();
    const lastWordMatch = rawTrimmed.match(/(\w+|"[^"]*"|'[^']*')\s*$/);
    const tokenHint = lastWordMatch ? ` after ${lastWordMatch[1]}` : '';
    const lineNum = i + 1;

    return {
      category: 'missing_semicolon',
      line: lineNum,
      message: pickVariant('missing_semicolon', [
        `Arre! You forgot the semicolon${tokenHint} on line ${lineNum}. Add ';' at the end of this line!`,
        `Bro, where did your semicolon go on line ${lineNum}? Add ';'${tokenHint}!`,
        `The compiler is asking for a ';' on line ${lineNum}${tokenHint}!`,
      ]),
      nextStep: `Add a semicolon (;) at the end of line ${lineNum}.`,
      severity: 'error',
    };
  }

  return null;
}

/**
 * Check C++ specific mistakes: iostream, using namespace std, main signature
 */
function checkCppSpecifics(rawCode, cleanCode) {
  const lines = cleanCode.split('\n');

  // 1. Uses cout/cin/endl/cerr without #include <iostream>
  // Note: Only check if code looks like a standalone program (has main or #include) or explicitly uses cout/cin
  const usesStreamIO = /\b(cout|cin|endl|cerr)\b/.test(cleanCode);
  const hasIostream = /#\s*include\s*<\s*iostream\s*>/.test(rawCode) || /#\s*include\s*<\s*bits\/stdc\+\+\.h\s*>/.test(rawCode);

  if (usesStreamIO && !hasIostream) {
    return {
      category: 'cpp_missing_iostream',
      line: 1,
      message: `Looks like you're using cout/cin. Did you include <iostream> at the top?`,
      nextStep: `Add #include <iostream> at the very top of your C++ code.`,
      severity: 'error',
    };
  }

  // 2. Uses cout/cin/endl/vector/string without std:: or using namespace std
  const usesStdSymbolsUnqualified = /(?:^|[^\w:])\b(cout|cin|endl|cerr|string|vector)\b/.test(cleanCode);
  const hasStdPrefix = /std\s*::/.test(cleanCode);
  const hasUsingNamespaceStd = /using\s+namespace\s+std\s*;/.test(cleanCode);

  if (usesStdSymbolsUnqualified && !hasStdPrefix && !hasUsingNamespaceStd) {
    const match = cleanCode.match(/\b(cout|cin|endl|cerr|string|vector)\b/);
    const sym = match ? match[1] : 'cout';
    return {
      category: 'cpp_missing_std_namespace',
      line: 1,
      message: `Remember that '${sym}' belongs to the std namespace! Add 'using namespace std;' or use 'std::${sym}'.`,
      nextStep: `Add "using namespace std;" near the top or prefix with "std::".`,
      severity: 'error',
    };
  }

  // 3. Check broken main function declaration (e.g. void main, main(), int main {)
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (/^\s*void\s+main\s*\(/.test(trimmed)) {
      return {
        category: 'cpp_invalid_main',
        line: i + 1,
        message: `Check your main function declaration on line ${i + 1} — standard C++ expects 'int main()'.`,
        nextStep: `Use "int main()" and return 0 at the end.`,
        severity: 'error',
      };
    }
    if (/^\s*(int\s+)?main\s*\{/.test(trimmed)) {
      return {
        category: 'cpp_invalid_main_parens',
        line: i + 1,
        message: `Check your main function on line ${i + 1} — don't forget the parentheses 'main()' before '{'!`,
        nextStep: `Change to "int main() {" on line ${i + 1}.`,
        severity: 'error',
      };
    }
  }

  return null;
}

/**
 * Check JavaScript syntax using native JS parser + AST/pattern diagnostics
 */
function checkJavaScriptSpecifics(rawCode, cleanCode) {
  const lines = cleanCode.split('\n');

  // 1. Typo in function keyword: funtion / functon / fuction
  for (let i = 0; i < lines.length; i++) {
    if (/\b(funtion|functon|fuction|fucntion|fnction)\b/.test(lines[i])) {
      return {
        category: 'js_function_typo',
        line: i + 1,
        message: `Hey coder, check line ${i + 1}! Looks like a tiny typo in the 'function' keyword.`,
        nextStep: `Fix the spelling to "function" on line ${i + 1}.`,
        severity: 'error',
      };
    }

    // Malformed arrow function: `= >` with space or `->`
    if (/=\s+>/.test(lines[i]) || /\)\s*->/.test(lines[i])) {
      return {
        category: 'js_arrow_syntax',
        line: i + 1,
        message: `Check the structure of your arrow function on line ${i + 1}! JavaScript uses '=>' with no space between '=' and '>'.`,
        nextStep: `Replace with '=>' on line ${i + 1}.`,
        severity: 'error',
      };
    }

    // Const reassignment / missing init or invalid variable declaration like `let = 5` or `var 123`
    if (/\b(let|const|var)\s*=/.test(lines[i])) {
      return {
        category: 'js_invalid_var_decl',
        line: i + 1,
        message: `Oops! Your variable declaration on line ${i + 1} is missing a variable name before '='.`,
        nextStep: `Give your variable a valid name (e.g., "let total = ...") on line ${i + 1}.`,
        severity: 'error',
      };
    }
  }

  // 2. Native JS SyntaxError check via Function constructor
  try {
    // eslint-disable-next-line no-new-func
    new Function(rawCode);
  } catch (err) {
    const msg = err.message || '';
    // Try extracting line from stack or analyze patterns
    if (/arrow function/i.test(msg) || /Malformed arrow/i.test(msg)) {
      return {
        category: 'js_arrow_syntax',
        line: null,
        message: `Check the structure of your arrow function — its parameters or '=>' syntax has a mistake.`,
        nextStep: `Ensure arrow functions look like "(a, b) => { ... }" or "x => x * 2".`,
        severity: 'error',
      };
    }
    if (/Unexpected token '=>'/i.test(msg)) {
      return {
        category: 'js_arrow_syntax',
        line: null,
        message: `Unexpected '=>' found! Check the parameter parentheses before your arrow function.`,
        nextStep: `Wrap parameters in parentheses if needed, e.g., "(x) => ...".`,
        severity: 'error',
      };
    }
    if (/Missing \) after argument list/i.test(msg) || /Unexpected token ','/i.test(msg)) {
      return {
        category: 'js_missing_paren',
        line: null,
        message: `Looks like you forgot a closing parenthesis ')' or a comma inside a function call!`,
        nextStep: `Check your function calls and argument lists for missing ')' or ','.`,
        severity: 'error',
      };
    }
    if (/Unexpected identifier/i.test(msg)) {
      return {
        category: 'js_unexpected_identifier',
        line: null,
        message: `Oops! JavaScript hit an unexpected word—check for a missing operator, missing keyword ('let'/'const'), or typo!`,
        nextStep: `Verify variable declarations and operators around your recent statements.`,
        severity: 'error',
      };
    }
    if (/Unexpected end of input/i.test(msg)) {
      return {
        category: 'js_unexpected_eof',
        line: null,
        message: `Your code ended unexpectedly! A closing brace '}', parenthesis ')', or quote might be missing.`,
        nextStep: `Double-check all opening braces '{' and parentheses '('.`,
        severity: 'error',
      };
    }
    return {
      category: 'js_syntax_error',
      line: null,
      message: `JavaScript syntax slip-up: ${msg}. Give your recent lines a quick check!`,
      nextStep: `Fix the syntax issue reported above and run again.`,
      severity: 'error',
    };
  }

  return null;
}

/**
 * Check Python specific mistakes (colon after def/if/for, indentation, print)
 */
function checkPythonSpecifics(rawCode, cleanCode) {
  const lines = cleanCode.split('\n');
  const rawLines = rawCode.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    // Missing colon on def/if/elif/else/for/while
    if (/^(def|if|elif|else|for|while|class|try|except|finally)\b/.test(trimmed) && !trimmed.endsWith(':')) {
      return {
        category: 'python_missing_colon',
        line: i + 1,
        message: `Hey Pythonista! Don't forget the colon ':' at the end of line ${i + 1}!`,
        nextStep: `Add ':' at the end of line ${i + 1}.`,
        severity: 'error',
      };
    }

    // Semicolon warning or JS syntax in Python
    if (/^\s*(function|const|let|var)\s+/.test(trimmed)) {
      return {
        category: 'python_wrong_lang_syntax',
        line: i + 1,
        message: `Careful on line ${i + 1}! You're in Python mode — use 'def' for functions and no 'let'/'const' keywords.`,
        nextStep: `Use Python syntax like "def solve(...):" and plain variable assignments.`,
        severity: 'error',
      };
    }

    // Check Python indentation right after a colon line
    if (trimmed.endsWith(':')) {
      const currentIndent = rawLines[i].search(/\S/);
      for (let j = i + 1; j < lines.length; j++) {
        if (!lines[j].trim()) continue;
        const nextIndent = rawLines[j].search(/\S/);
        if (nextIndent <= currentIndent) {
          return {
            category: 'python_indentation',
            line: j + 1,
            message: `Watch your indentation on line ${j + 1}! Code inside a ':' block needs to be indented.`,
            nextStep: `Indent line ${j + 1} (usually 4 spaces) inside the block.`,
            severity: 'error',
          };
        }
        break;
      }
    }
  }

  return null;
}

/**
 * Check assignment inside conditional expression: `if (x = 5)`
 */
function checkAssignmentInCondition(cleanCode) {
  const lines = cleanCode.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/\b(?:if|while)\s*\(([^)]+)\)/);
    if (match) {
      const cond = match[1];
      // Single '=' not part of '==', '===', '!=', '!==', '<=', '>='
      if (/(?<![=!<>])=(?!=)/.test(cond)) {
        return {
          category: 'assignment_in_condition',
          line: i + 1,
          message: `Heads up on line ${i + 1}! Single '=' assigns a value. Did you mean '==' or '===' to compare?`,
          nextStep: `Check your condition on line ${i + 1} and use comparison operators.`,
          severity: 'warning',
        };
      }
    }
  }
  return null;
}

/**
 * Check if function body is completely empty or missing a return statement
 */
function checkMissingReturnOrEmptyBody(code, cleanCode, language) {
  const withoutBoilerplate = cleanCode
    .replace(/function\s+\w+\s*\([^)]*\)\s*\{/g, '')
    .replace(/def\s+\w+\s*\([^)]*\)\s*:/g, '')
    .replace(/public\s+class\s+\w+\s*\{/g, '')
    .replace(/[{}\s]/g, '');

  if (!withoutBoilerplate || withoutBoilerplate.length < 3) {
    return {
      category: 'empty_body',
      line: null,
      message: pickVariant('empty_body', [
        `Come on! Start typing your solution inside the function — it's completely empty right now!`,
        `Whoa, empty function! Write some code inside before submitting!`,
      ]),
      nextStep: `Write your implementation inside the function body and try again.`,
      severity: 'info',
    };
  }

  // If starter signature wasn't void and user wrote lines without any return statement
  const expectsReturn =
    language === 'javascript' ||
    language === 'python' ||
    (/public\s+(?!void)\w+/.test(cleanCode));

  const hasReturn = /\breturn\b/.test(cleanCode);
  if (expectsReturn && !hasReturn && !/\bcout\b/.test(cleanCode) && !/\bconsole\.log\b/.test(cleanCode)) {
    return {
      category: 'missing_return',
      line: null,
      message: `Hey! Check whether your function is returning a value — I don't see a 'return' statement!`,
      nextStep: `Make sure your function returns the result using the "return" keyword.`,
      severity: 'warning',
    };
  }

  return null;
}

/**
 * Parse real compiler / runtime errors into beginner-friendly CODO GUIDE responses
 */
export function parseCompilerOrRuntimeError(errorMessage, code, language) {
  if (!errorMessage || typeof errorMessage !== 'string') return null;

  // Extract line number if present (e.g. "line 5", ":5:", "<anonymous>:5:10")
  let detectedLine = null;
  const lineMatch =
    errorMessage.match(/line\s+(\d+)/i) ||
    errorMessage.match(/:(\d+):\d+/) ||
    errorMessage.match(/\.java:(\d+)/i);
  if (lineMatch) {
    detectedLine = parseInt(lineMatch[1], 10);
  }
  const lineSuffix = detectedLine ? ` on line ${detectedLine}` : '';

  // 1. ReferenceError / Undefined Variable
  const refMatch =
    errorMessage.match(/(\w+)\s+is not defined/i) ||
    errorMessage.match(/['"]?(\w+)['"]?\s+was not declared in this scope/i) ||
    errorMessage.match(/name\s+['"](\w+)['"]\s+is not defined/i) ||
    errorMessage.match(/cannot find symbol.*?symbol:\s*\w+\s+(\w+)/is);

  if (refMatch) {
    const varName = refMatch[1];
    // C++ specific: cout / cin / endl
    if (['cout', 'cin', 'endl', 'cerr'].includes(varName) && (language === 'cpp' || language === 'c')) {
      return {
        category: 'cpp_undeclared_io',
        line: detectedLine,
        message: `Looks like '${varName}' isn't recognized! Did you include <iostream> and add 'using namespace std;'?`,
        nextStep: `Check your #include <iostream> and namespace at the top.`,
        severity: 'error',
      };
    }

    return {
      category: 'undefined_variable',
      line: detectedLine,
      message: pickVariant('undefined_variable', [
        `Hey! Variable '${varName}' hasn't been declared yet${lineSuffix}. Check spelling or declare it first!`,
        `Oops! The compiler doesn't recognize '${varName}'${lineSuffix}. Did you forget to declare it?`,
      ]),
      nextStep: language === 'javascript'
        ? `Declare '${varName}' with "let" or "const", or fix any typo.`
        : `Declare '${varName}' with its data type before using it.`,
      severity: 'error',
    };
  }

  // 2. Missing Semicolon from compiler
  if (/expected\s*['"];['"]|missing\s*semicolon|';'\s*expected/i.test(errorMessage)) {
    return {
      category: 'compiler_missing_semicolon',
      line: detectedLine,
      message: pickVariant('compiler_missing_semicolon', [
        `Bro, where did your semicolon go? The compiler expected ';'${lineSuffix}!`,
        `The compiler is complaining about a missing semicolon${lineSuffix}!`,
      ]),
      nextStep: `Add a semicolon (;) at the end of the statement${lineSuffix}.`,
      severity: 'error',
    };
  }

  // 3. Unclosed brace / parenthesis from compiler
  if (/expected\s*['"]\}['"]|reached end of file while parsing|Unexpected end of input/i.test(errorMessage)) {
    return {
      category: 'compiler_missing_brace',
      line: detectedLine,
      message: `Hey coder! You opened a block or bracket and forgot to close it${lineSuffix}. Check your curly braces '}'!`,
      nextStep: `Check that every '{' has a matching '}'.`,
      severity: 'error',
    };
  }

  if (/Missing\s*\)|expected\s*['"]\)['"]/i.test(errorMessage)) {
    return {
      category: 'compiler_missing_paren',
      line: detectedLine,
      message: `Looks like you forgot to close a parenthesis ')'${lineSuffix}!`,
      nextStep: `Verify every '(' has a matching ')'.`,
      severity: 'error',
    };
  }

  // 4. TypeError
  if (/is not a function/i.test(errorMessage)) {
    const fnMatch = errorMessage.match(/(\w+)\s+is not a function/i);
    const name = fnMatch ? `'${fnMatch[1]}'` : 'something';
    return {
      category: 'type_error_not_fn',
      line: detectedLine,
      message: `Oops! You're trying to call ${name} like a function${lineSuffix}, but it isn't one!`,
      nextStep: `Check parentheses or method name spelling.`,
      severity: 'error',
    };
  }

  if (/Cannot read propert|undefined is not an object|null/i.test(errorMessage)) {
    return {
      category: 'null_undefined_access',
      line: detectedLine,
      message: `Careful${lineSuffix}! You're trying to access a property on something that is undefined or null.`,
      nextStep: `Check if your variable or array element exists before reading its properties.`,
      severity: 'error',
    };
  }

  if (/Maximum call stack|RecursionError/i.test(errorMessage)) {
    return {
      category: 'stack_overflow',
      line: detectedLine,
      message: `Whoa! Infinite recursion hit! Your function kept calling itself without stopping.`,
      nextStep: `Make sure your recursive base condition actually gets reached.`,
      severity: 'error',
    };
  }

  if (/SyntaxError/i.test(errorMessage)) {
    return {
      category: 'generic_syntax_error',
      line: detectedLine,
      message: `Nice attempt! But there's a syntax error${lineSuffix}: ${errorMessage.replace(/^SyntaxError:\s*/i, '')}`,
      nextStep: `Check brackets, quotes, and keywords around that line.`,
      severity: 'error',
    };
  }

  return null;
}

/**
 * Static code analysis across languages
 */
export function runStaticDiagnostics(code, language = 'javascript') {
  if (!code || !code.trim()) {
    return {
      category: 'empty_editor',
      line: null,
      message: `Come on! Start typing your solution — the editor is empty right now.`,
      nextStep: `Write your code inside the editor and hit Run or Submit.`,
      severity: 'info',
    };
  }

  const cleanCode = stripStringsAndComments(code, language);

  // 1. Check bracket / paren / brace balance first (universal)
  const bracketIssue = checkBracketBalance(cleanCode);
  if (bracketIssue) return bracketIssue;

  // 2. Language-specific static diagnostics
  if (language === 'cpp' || language === 'c') {
    const semiIssue = checkMissingSemicolons(code, cleanCode, language);
    if (semiIssue) return semiIssue;

    const cppIssue = checkCppSpecifics(code, cleanCode);
    if (cppIssue) return cppIssue;
  } else if (language === 'java') {
    const semiIssue = checkMissingSemicolons(code, cleanCode, language);
    if (semiIssue) return semiIssue;
  } else if (language === 'javascript') {
    const jsIssue = checkJavaScriptSpecifics(code, cleanCode);
    if (jsIssue) return jsIssue;
  } else if (language === 'python') {
    const pyIssue = checkPythonSpecifics(code, cleanCode);
    if (pyIssue) return pyIssue;
  }

  // 3. Check `if (x = y)` assignment vs comparison
  const assignIssue = checkAssignmentInCondition(cleanCode);
  if (assignIssue) return assignIssue;

  // 4. Check empty function body or missing return statement
  const bodyIssue = checkMissingReturnOrEmptyBody(code, cleanCode, language);
  if (bodyIssue) return bodyIssue;

  return null;
}

/**
 * Primary entry point after RUN or SUBMIT execution
 */
export function diagnoseSubmissionForCodoGuide({
  code,
  language = 'javascript',
  results = [],
  passed = false,
  error = null,
}) {
  // Case 1: Empty editor
  if (!code || !code.trim()) {
    return {
      category: 'empty_editor',
      message: `Come on! Start writing your code before submitting.`,
      nextStep: `Type your solution into the code editor.`,
      severity: 'info',
    };
  }

  // Case 2: All tests passed!
  if (passed) {
    return {
      category: 'success',
      message: pickVariant('success', [
        `Boom! Clean syntax and all tests passed! 🔥`,
        `Nailed it! Zero syntax errors and solid execution!`,
      ]),
      nextStep: null,
      severity: 'success',
    };
  }

  // Case 3: Look for actual runtime/compiler error in results or top-level error
  const firstErrorResult = Array.isArray(results) ? results.find(r => r && r.error) : null;
  const rawError = error || firstErrorResult?.error;
  const validRawError =
    rawError && rawError !== 'Evaluation failed' && rawError !== 'Remote engine unavailable'
      ? rawError
      : null;

  // Run deterministic static analysis first for exact line-level syntax/bracket/include diagnostics
  const staticIssue = runStaticDiagnostics(code, language);
  if (staticIssue) return staticIssue;

  // Case 4: Parse compiler or runtime errors (ReferenceError, TypeError, StackOverflow, etc.)
  if (validRawError) {
    const parsedRuntime = parseCompilerOrRuntimeError(validRawError, code, language);
    if (parsedRuntime) return parsedRuntime;
  }

  // Case 5: If raw compiler error exists but wasn't classified above
  if (rawError) {
    return {
      category: 'unclassified_error',
      message: `Hmm, something went wrong. Check your code and compiler output.`,
      nextStep: `Inspect the error output panel for details.`,
      severity: 'error',
    };
  }

  // Case 6: Code has valid syntax & compiled cleanly, but test outputs don't match expected
  // STRICTLY NO DSA HINTS OR ALGORITHM REVEALS!
  return {
    category: 'wrong_output',
    message: pickVariant('wrong_output', [
      `Your code ran cleanly, but the output doesn't match the expected result. Check your logic and try again!`,
      `Syntax looks good! The output just didn't match the expected cases—review your steps carefully.`,
      `No syntax errors! Your code executed, so check edge cases or return values and try again.`,
    ]),
    nextStep: `Compare your actual output vs expected output in Test Cases.`,
    severity: 'warning',
  };
}
