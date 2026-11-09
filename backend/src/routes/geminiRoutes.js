const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authMiddleware = require('../middleware/authMiddleware');

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

router.post('/', authMiddleware, async (req, res) => {
  // req.auth.userId is the Clerk user ID — available but not needed for evaluation
  const { code, language, context, mode } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

      const prompt = `
      You are an expert Code Judge and Mentor for "Codo Leveling".
      ${mode === 'run' ? 'Focus on TECHNICAL EXECUTION of test cases.' : 'Focus on providing DEEP MENTORSHIP feedback and performance analysis.'}

      Evaluate the following ${language} code for: "${context.title}".
      
      Problem Context:
      ${context.description}
      
      Test Cases to execute (JSON):
      ${JSON.stringify(context.testCases)}
      
      User Code:
      \`\`\`${language}
      ${code}
      \`\`\`
      
      RULES:
      1. You MUST accurately simulate the execution of the user's code against the provided test cases.
      2. DO NOT hallucinate correctness. The 'passed' value of each test case MUST be strictly determined by whether the expected output matches the actual output.
      3. Focus your feedback on explaining mistakes, providing optimization tips, and offering edge case hints. Do not just say "wrong".

      Respond ONLY with a JSON object in this format:
      {
        "passed": boolean,
        "efficiency": number (0.0 to 1.0),
        "codeQuality": number (0.0 to 1.0),
        "feedback": "Mentor style feedback",
        "details": "Technical breakdown",
        "mistakes": ["..."],
        "hints": ["..."],
        "next_step": "...",
        "complexity": { "time": "O(?)", "space": "O(?)" },
        "results": [
          { "input": "string representation", "expected": "...", "actual": "...", "passed": boolean }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from potential markdown blocks
    const jsonStr = text.replace(/```json|```/g, '').trim();
    console.log('[AI Evaluation Raw]:', jsonStr);
    const evaluation = JSON.parse(jsonStr);
    console.log('[AI Evaluation Parsed]:', evaluation);

    // Ensure numeric fields are present
    evaluation.correctness = evaluation.correctness ?? (evaluation.passed ? 1 : 0);
    evaluation.efficiency = evaluation.efficiency ?? 0.5;
    evaluation.codeQuality = evaluation.codeQuality ?? 0.5;

    res.json(evaluation);
  } catch (error) {
    console.error('Gemini Evaluation Failed', error);
    res.json({
      passed: false,
      score: 0,
      feedback: "THE SYSTEM IS GLITCHING!",
      details: "Evaluation failed to complete. Try again.",
      complexity: { time: "N/A", space: "N/A" },
      suggestions: ["Check connectivity", "Ensure API Key is valid"],
      results: []
    });
  }
});

module.exports = router;
