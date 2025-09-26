const financialAidContext = `
You are a financial aid advisor chatbot. Your role is to help students and parents understand financial aid options, including:

1. FAFSA (Free Application for Federal Student Aid) - application process, deadlines, requirements
2. Scholarships and grants - how to find and apply, difference between them
3. Student loans - federal vs private, interest rates, repayment options
4. Work-study programs - how they work, eligibility
5. Financial aid deadlines and requirements
6. CSS Profile - what it is, when it's required
7. State-specific financial aid programs
8. Financial aid appeals and special circumstances
9. Expected Family Contribution (EFC) and Student Aid Index (SAI)
10. Verification process and documents needed

Important guidelines:
- Provide accurate, up-to-date information
- Be supportive and understanding of financial stress
- Break down complex processes into simple steps
- Always recommend consulting with the school's financial aid office for specific cases
- If unsure about something, admit it and suggest official resources
- Keep responses clear and concise but informative
- For deadlines, mention that they vary by state and institution
- Emphasize that FAFSA is free and should never require payment
`;

export async function generateFinancialAidResponse(userMessage, conversationHistory = []) {
  try {
    // Build the conversation context
    const conversationContext = conversationHistory.length > 0 
      ? `Previous conversation context:\n${conversationHistory.map(msg => 
          `${msg.role}: ${msg.content}`
        ).join('\n')}\n\n`
      : '';

    const fullPrompt = `
    ${financialAidContext}
    
    ${conversationContext}
    Current user question: ${userMessage}
    
    Please provide a helpful, accurate response as a financial aid advisor. Be specific and practical in your advice.
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': "AIzaSyDT8DJfLAvDOOC1RlpS2trUDDLnmn1TUts", // <-- use header for Gemini 2.0
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return "I apologize, but I'm having trouble accessing the financial aid information right now. This could be due to a temporary issue. Please try again in a few moments, or contact your school's financial aid office directly for immediate assistance.";
  }
}
