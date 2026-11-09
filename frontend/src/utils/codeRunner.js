/**
 * Advanced Code Execution Engine for Codo Leveling.
 * Supports Local JavaScript sandboxing and Backend Multi-language execution.
 */

/**
 * Normalizes output and expected values for comparison.
 */
function normalize(val) {
  if (val === null || val === undefined) return String(val).toLowerCase(); // 'null' or 'undefined'
  
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === 'object' || Array.isArray(parsed)) {
        return JSON.stringify(parsed);
      }
    } catch {
      // Not valid JSON
    }
    return val;
  }
  
  if (Array.isArray(val) || typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

/**
 * Executes JavaScript locally using a Function wrapper.
 */
function runJSLocally(userCode, testCases) {
  const results = [];
  
  // Attempt to find function name, default to 'solve'
  const fnMatch = userCode.match(/function\s+(\w+)\s*\(/);
  const fnName = fnMatch ? fnMatch[1] : 'solve';

  for (const tc of testCases) {
    try {
      // Parse input into an array of arguments
      let args;
      if (typeof tc.input === 'string') {
        try {
          args = JSON.parse(`[${tc.input}]`);
        } catch {
          args = [tc.input];
        }
      } else {
        args = [tc.input];
      }
      const expected = normalize(tc.expected);

      // eslint-disable-next-line no-new-func
      const runner = new Function(
        'args',
        `"use strict";
        ${userCode}
        return ${fnName}(...args);`
      );

      const startTime = performance.now();
      const actualRaw = runner(args);
      const duration = performance.now() - startTime;
      const actual = normalize(actualRaw);

      results.push({
        input: JSON.stringify(tc.input),
        expected,
        actual,
        passed: actual === expected,
        duration: duration.toFixed(1)
      });
    } catch (err) {
      results.push({
        input: JSON.stringify(tc.input),
        expected: normalize(tc.expected),
        actual: 'Execution Error',
        passed: false,
        error: err.message
      });
    }
  }

  return results;
}

/**
 * Main entry point for running code (RUN mode).
 */
export async function runCode(userCode, language, testCases, userToken = null) {
  if (language === 'javascript') {
    return runJSLocally(userCode, testCases);
  }

  // For non-JS languages, we use the backend bridge
  try {
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        code: userCode,
        language,
        context: {
          title: 'Remote Execution',
          description: 'Executing test cases via backend bridge.',
          testCases
        },
        mode: 'run' // Signal to backend to focus on execution
      }),
    });

    if (!response.ok) throw new Error('Remote execution failed');
    const evaluation = await response.json();
    
    // Convert backend evaluation to expected result format
    return evaluation.results || testCases.map(tc => ({
       input: JSON.stringify(tc.input),
       expected: normalize(tc.expected),
       actual: evaluation.passed ? normalize(tc.expected) : 'Failed',
       passed: evaluation.passed
    }));
  } catch (err) {
    console.error('Remote Runner Error:', err);
    return [{ error: 'Remote engine unavailable' }];
  }
}
