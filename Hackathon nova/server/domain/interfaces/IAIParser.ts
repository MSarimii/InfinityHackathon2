/**
 * DOMAIN INTERFACE - AI Parser
 * File: server/domain/interfaces/IAIParser.ts
 *
 * Contract for transcript extraction.
 * The AI Parser only converts an unstructured transcript into structured drafts.
 * It has NO database access, NO authorization knowledge, and NO entity creation rights.
 */

import { TeamMemberDirectoryItem, AITranscriptOutput } from '../models/AITypes.ts';

export interface IAIParser {
  /**
   * Parses meeting transcript text and suggests projects with tasks
   * assigned to the provided team directory members.
   *
   * @param transcript Raw transcript text from admin
   * @param teamDirectory Permitted team directory for matching manager and agent roles
   * @returns Structured projects and tasks draft
   */
  parseTranscript(
    transcript: string,
    teamDirectory: TeamMemberDirectoryItem[]
  ): Promise<AITranscriptOutput>;
}
