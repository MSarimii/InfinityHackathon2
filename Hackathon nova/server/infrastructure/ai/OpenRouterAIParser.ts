/**
 * INFRASTRUCTURE LAYER - OpenRouter AI Parser Implementation
 * File: server/infrastructure/ai/OpenRouterAIParser.ts
 *
 * Implements IAIParser.
 * Connects to OpenRouter API (https://openrouter.ai/api/v1/chat/completions)
 * using process.env.OPENROUTER_API_KEY and configurable model.
 *
 * Supported models via OPENROUTER_MODEL:
 * - "google/gemini-2.0-flash-001" (default fast & economical)
 * - "openai/gpt-4o-mini"
 * - "anthropic/claude-3.5-haiku"
 * - "anthropic/claude-3.5-sonnet"
 */

import { IAIParser } from '../../domain/interfaces/IAIParser.ts';
import { TeamMemberDirectoryItem, AITranscriptOutput } from '../../domain/models/AITypes.ts';

export class OpenRouterAIParser implements IAIParser {
  private apiKey: string | undefined;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.model = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001';
  }

  public async parseTranscript(
    transcript: string,
    teamDirectory: TeamMemberDirectoryItem[]
  ): Promise<AITranscriptOutput> {
    if (!this.apiKey) {
      throw new Error(
        'OPENROUTER_API_KEY environment variable is not configured. Please set OPENROUTER_API_KEY in your environment or .env file.'
      );
    }

    const prompt = this.buildPrompt(transcript, teamDirectory);

    const systemInstruction = `
You are an expert AI Project Manager for NovaWorks Technologies, Lahore, Pakistan.
Your job is to analyze meeting transcripts and extract structured project and task scopes.

STRICT CONSTRAINTS:
1. Assign projects ONLY to managers from the supplied team directory who have role MANAGER.
2. Assign tasks ONLY to developers/agents from the supplied team directory who have role AGENT.
3. Use the exact team member ID (e.g. PM01, PM02, PM03, DEV01, DEV02, DEV03, DEV04, DEV05, DEV06).
4. Respect all final agreed decisions, date corrections, and revised hours in the meeting.
5. Strictly EXCLUDE rejected features (e.g. real payment gateways, inventory sync, live driver tracking maps).
6. Strictly EXCLUDE external people (e.g. Kamran).
7. Deadlines must be in YYYY-MM-DD format. A task deadline must NOT exceed its parent project deadline.
8. Estimated hours must be positive numbers.
9. Return ONLY valid JSON with no markdown formatting or prose.

JSON Schema:
{
  "projects": [
    {
      "name": "Project Name",
      "clientName": "Client Name",
      "description": "Scope summary",
      "managerId": "PM01",
      "deadline": "2026-10-20",
      "tasks": [
        {
          "title": "Task Title",
          "description": "Task description",
          "assigneeId": "DEV01",
          "deadline": "2026-10-12",
          "estimatedHours": 12
        }
      ]
    }
  ]
}
`.trim();

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'NovaWorks AI Project Manager'
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error (HTTP ${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('OpenRouter returned empty response content.');
      }

      // Sanitize possible markdown code blocks ```json ... ```
      const cleaned = content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed = JSON.parse(cleaned) as AITranscriptOutput;

      if (!parsed || !Array.isArray(parsed.projects)) {
        throw new Error('OpenRouter output did not match expected { projects: [...] } shape.');
      }

      return parsed;
    } catch (err: any) {
      console.error('[OpenRouterAIParser] Request failed:', err);
      throw new Error(`OpenRouter AI parsing failed: ${err.message}`);
    }
  }

  private buildPrompt(transcript: string, teamDirectory: TeamMemberDirectoryItem[]): string {
    const directoryString = teamDirectory
      .map(
        m =>
          `- ID: "${m.id}", Name: "${m.name}", Role: "${m.role}", Specialization: "${m.specialization}", Skills: [${m.skills.join(', ')}]`
      )
      .join('\n');

    return `
Available NovaWorks Team Directory:
${directoryString}

Meeting Transcript:
"""
${transcript}
"""

Extract all projects and tasks into the required JSON structure.
`;
  }
}
