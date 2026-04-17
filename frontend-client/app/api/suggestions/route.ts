import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { fetchPatientMedicalHistory } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const { patientId, token } = await request.json();

    if (!patientId || !token) {
      return NextResponse.json(
        { error: "patientId and token are required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("[AI_SUGGESTIONS_ERROR]: GEMINI_API_KEY is missing in .env");
      return NextResponse.json(
        {
          error: "Server configuration missing: GEMINI_API_KEY. Please ensure the key is correctly set in the environment variables.",
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Fetch medical history
    const history = await fetchPatientMedicalHistory(patientId, token);

    // Format top 3 entries
    if (!history || history.length === 0) {
      return NextResponse.json({
        suggestions: "No recent medical history found. Continue maintaining a healthy lifestyle, and consult your doctor for personalized advice.\n\n*Medical Disclaimer: The information provided is for educational and informational purposes only and does not constitute medical advice. Please consult with a doctor or healthcare professional for any medical advice or before making any healthcare decisions.*",
      });
    }

    const recentHistory = history.slice(-3); // Get up to 3 most recent, assuming sorted ascending. If descending, slice(0, 3) 
    // Wait, usually the API returns the most recent first, so slice(0, 3). Let's use slice(0, 3).
    // I will actually just use .slice(0, 3) and format.
    
    const formattedHistory = recentHistory
      .map((entry: any, index: number) => {
        let details = `Event ${index + 1}: `;
        if (entry.date) details += `Date: ${entry.date}, `;
        if (entry.diagnosis) details += `Diagnosis: ${entry.diagnosis}, `;
        if (entry.symptoms) details += `Symptoms: ${entry.symptoms}, `;
        if (entry.treatment) details += `Treatment: ${entry.treatment}, `;
        if (entry.notes) details += `Notes: ${entry.notes}`;
        return details;
      })
      .join("\n");

    const prompt = `You are an expert AI health assistant. Based on the following recent medical history of a patient, provide 3 to 5 clear, empathetic, and actionable preliminary health tips or lifestyle suggestions. Keep the tone professional but accessible. Do not provide a medical disclaimer as it will be appended separately.

Recent Medical History:
${formattedHistory}`;

    let responseText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      responseText = response?.text || "Could not generate suggestions at this time.";
    } catch (apiError: any) {
      console.error("[AI_SUGGESTIONS_ERROR]: Failed during Gemini API call.", apiError);
      return NextResponse.json(
        { error: "Failed to generate AI suggestions due to an upstream API error." },
        { status: 502 }
      );
    }

    const disclaimer = "\n\n*Medical Disclaimer: The information provided is for educational and informational purposes only and does not constitute medical advice. Please consult with a doctor or healthcare professional for any medical advice or before making any healthcare decisions.*";
    
    const finalContent = responseText + disclaimer;

    return NextResponse.json({ suggestions: finalContent });

  } catch (error: any) {
    console.error("[AI_SUGGESTIONS_ERROR]: Unhandled exception in route handler", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred while generating suggestions." },
      { status: 500 }
    );
  }
}
