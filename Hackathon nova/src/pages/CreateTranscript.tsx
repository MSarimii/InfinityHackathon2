/**
 * PAGE - Create from Transcript Workbench
 * File: src/pages/CreateTranscript.tsx
 *
 * Implements Section 14 (Create From Transcript):
 * Monospace workbench with official/modified transcript loaders,
 * multi-step pipeline animation, domain validation alerts, and created summaries.
 */

import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { CreateFromTranscriptResponse } from '../../shared/api-contracts.ts';
import {
  Sparkles,
  ArrowLeft,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Database,
  Cpu
} from 'lucide-react';

interface CreateTranscriptProps {
  onBack: () => void;
  onSuccess: () => void;
}

const OFFICIAL_TRANSCRIPT = `Meeting: NovaWorks Client Delivery Planning
Date: 7 October 2026 | Scheduled duration: 60 minutes
Participants: Ayesha, Bilal, Hina, Ali, Hamza, Sara, Usman, Zain, Maryam

09:00-09:04 | Opening and company workflow
Ayesha: Good morning. We have three client engagements to plan today: UrbanCart Clothing's website, QuickServe's customer mobile app, and HelpDeskPro's AI support assistant. Please keep these as three separate projects. A combined project would make client reporting confusing.
Bilal: We should finish with a project manager, deadline, task owner, and estimated hours for every piece of work. The estimate is effort, not the number of days between today and the delivery date.
Hina: Agreed. Please use our supplied team directory. Accounts can already be created with a setup script. We are not hiring anyone for this delivery cycle. Record developer work only in the estimated hours. We do not need management-hour estimates.
Ayesha: Keep this version simple. We need project details, assigned people, deadlines, and estimated hours. Cost calculation and progress monitoring are outside this challenge.

09:04-09:08 | UrbanCart project scope
Ayesha: First project is UrbanCart Website, for client UrbanCart Clothing. I'll manage it. They need a responsive website where customers can browse products, view product details, and add items to a demo cart. We initially discussed 18 October as the delivery date.
Ali: Do they need a real checkout, payment gateway, and stock integration?
Ayesha: No. For this phase the cart is a demo. Real payments and inventory integration are not included. The client wants to review the buying experience before funding those integrations.
Hamza: So the API scope is product data and a basic cart endpoint, without payment processing?
Ayesha: Correct. Don't add a payment task or an inventory task. The description should make the demo scope clear.

09:08-09:12 | UrbanCart frontend assignment
Ali: I can own the product catalog interface: product listing, a product detail screen, and responsive layout. Put that down as 12 estimated hours, due on 12 October.
Ayesha: Please call that task Product catalog UI. We also need the demo cart interface as a separate task so we can track it separately.
Ali: Yes. Demo cart UI will take 8 hours, due 15 October. That covers adding and removing items, quantities, and a visible total. I am the owner of both frontend tasks.
Bilal: Are these two separate tasks rather than a single 20-hour frontend task?
Ayesha: Exactly. Two tasks, same owner, with the deadlines we just agreed. We need that separation in the task list.

09:12-09:16 | UrbanCart backend and delivery correction
Hamza: For Product and cart APIs, I estimate 14 hours. I own it, and the deadline is 14 October. I will provide product responses and the demo cart endpoints Ali needs.
Ayesha: Good. After that, Ali owns Website integration and testing. Let's start with a six-hour estimate and a 17 October deadline.
Ali: Six hours is reasonable for connecting the screens and checking the demo flow. But please move that task to 19 October. I need a little more calendar space after the API work.
Ayesha: Accepted. Website integration and testing is 6 hours, due 19 October. Also, the client has just confirmed that final project delivery can be 20 October. That replaces the earlier 18 October date. The final UrbanCart project deadline is 20 October.
Hamza: So the final website plan has four tasks, and the new deadline is 20 October. No payment gateway in this phase.
Ayesha: Correct.

09:16-09:20 | QuickServe scope and manager
Bilal: The second project is QuickServe Mobile App, for client QuickServe Services. I am the project manager. The client needs a customer app for signing in, requesting a service, and seeing the request's current status.
Sara: Android only for the demonstration, or do we need separate native apps?
Bilal: A Flutter app demo is enough. We don't need separate Android and iOS development tasks. The project deadline is 24 October.
Usman: What about live maps, driver tracking, and payments?
Bilal: Exclude them. This version is customer login, service booking, and booking status. Those other features may be future work, but they must not appear as tasks in the current project.

09:20-09:24 | QuickServe screen work
Sara: I'll own Login and profile screens. That is 8 hours, due 12 October. It includes the customer login interface and a basic profile screen.
Bilal: Please keep that as one task. We don't need to split every field into its own task.
Sara: The second task is Service booking screens. I'll own that too. I estimate 12 hours, due 17 October. The customer selects a service, enters the request details, and sees a confirmation screen.
Hina: So Sara has two tasks, and both are mobile UI work. The API work is separate.
Bilal: Right. The transcript shouldn't turn these into generic web frontend tasks. This project is the mobile app.

09:24-09:28 | QuickServe API assignment
Hamza: I can build Booking and account APIs for the app. The endpoint scope is basic customer account handling, service requests, and request status. Put me as the owner.
Bilal: What's the effort estimate and delivery date?
Hamza: 16 hours, due 16 October. That's separate from the 14-hour UrbanCart API task. Please don't merge those just because I own both.
Usman: I need those responses for mobile integration, but we can use sample responses while Hamza works.
Bilal: Good. This is still one API task under QuickServe. There is no new shared platform project.

09:28-09:32 | QuickServe integration estimate correction
Usman: I will own Mobile integration and testing. Initially I would put it at 8 hours, due 22 October.
Sara: Can that cover the booking status screen, error states, and testing login through booking? Eight sounds a little tight.
Usman: You're right. Make the final estimate 10 hours. Keep the task deadline at 22 October. I will connect the mobile UI to the API, display request status, and test the whole customer flow.
Bilal: Final agreement: Mobile integration and testing, Usman, 10 hours, 22 October. QuickServe still delivers on 24 October. Don't keep the earlier eight-hour estimate.
Ayesha: That's four tasks for QuickServe as well. We are not adding maps or payment tasks.

09:32-09:36 | HelpDeskPro scope and manager
Hina: Third project is HelpDeskPro AI Assistant, for client HelpDeskPro Solutions. I am managing it. They want a support assistant that answers questions from a supplied FAQ document and passes unresolved questions to a human team.
Zain: Does the assistant need to send emails or connect to a real ticketing service?
Hina: No external message sending is required. Human escalation can be a saved record in the demo. We are building a support proof of concept, not integrating their full support system.
Maryam: We should keep an explicit boundary that the assistant uses the FAQ content instead of guessing unsupported answers.
Hina: Agreed. The project deadline is 22 October. We will test it with some questions that aren't in the document too.

09:36-09:40 | HelpDeskPro document work
Maryam: I'll own FAQ document processing. It should prepare the supplied FAQ so the assistant can retrieve relevant content. I estimate 10 hours, due 13 October.
Hina: Please make the task description clear: prepare and retrieve from the FAQ. Don't make a separate task for every FAQ topic.
Zain: I can then own Assistant answer generation. I'll use the prepared content, connect the model, and handle the response structure.
Hina: Give us the estimate and date for that task.
Zain: 14 hours, due 17 October. If the FAQ doesn't support an answer, the assistant should say it cannot resolve the question rather than inventing a response.

09:40-09:44 | HelpDeskPro escalation
Zain: The next task is Human escalation flow. I can own it as well: save unresolved questions so they can be reviewed by a person. The estimate is 6 hours, due 18 October.
Bilal: Are you assigning those escalated questions to another employee now?
Hina: No, not as new project tasks from this planning meeting. The feature is a saved escalation record in the client's demo. Keep our development task assigned to Zain.
Ayesha: The distinction matters. Discussion of end users should not create employees in our own company directory.
Hina: Exactly. Also, the client mentioned someone called Kamran who may supply a document later. Kamran is not a NovaWorks employee. Do not add him to our team or assign development work to him.

09:44-09:48 | HelpDeskPro testing owner correction
Hina: For Assistant evaluation and testing, I was initially considering Zain as the owner. We need to test FAQ answers, unsupported questions, and the escalation path.
Maryam: I can own that instead. It would be better if someone other than the answer-generation developer checks the results.
Hina: Agreed. Replace the earlier suggestion: Maryam is the final owner of Assistant evaluation and testing.
Maryam: Put the estimate at 8 hours, due 21 October. I'll include normal questions and missing-answer cases. That is separate from my ten-hour FAQ document task.
Hina: Confirmed: Maryam, 8 hours, 21 October. Final HelpDeskPro deadline stays 22 October.

09:48-09:52 | Simple accounts and team setup
Bilal: Please don't spend time building a registration flow. We can use one administrator account, our three manager accounts, and the six developer accounts.
Ayesha: The team names and specializations can be hardcoded or loaded from a setup script. The script may create those users with demo passwords. People should be able to log in using the supplied credentials.
Hina: Agreed. We do not need signup, forgot password, email verification, or a screen for creating and editing users. This is a hackathon demonstration with fictional accounts.
Sara: We still need the existing people available to the AI so it assigns the right names.
Bilal: Exactly. The directory is input to the AI. Projects and tasks should come from the meeting rather than requiring someone to enter all twelve tasks manually.

09:52-09:56 | CRM creation flow
Ayesha: The administrator pastes this transcript inside the CRM and clicks Create from Transcript. A valid result should automatically save all three projects and their tasks.
Hina: If a required person or date cannot be resolved, show a clear message and let the administrator correct it. Do not invent an employee. For this meeting, the final recap supplies all the required information.
Bilal: After creation, show project cards and a project detail screen. Each task needs its owner, deadline, description, and estimated hours. A manager can open their projects; a developer can open their assigned task list.
Usman: Do we need charts, completion percentages, timesheets, or budgets?
Ayesha: No. No cost calculation or progress monitoring. Simple login, project lists, task lists, and transcript automation are enough. Saved projects and tasks should remain after a refresh.

09:56-10:00 | Final recap
Ayesha: Final recap: UrbanCart Website, client UrbanCart Clothing, manager Ayesha, deadline 20 October. Ali owns Product catalog UI: 12 hours, 12 October. Ali owns Demo cart UI: 8 hours, 15 October. Hamza owns Product and cart APIs: 14 hours, 14 October. Ali owns Website integration and testing: 6 hours, 19 October.
Bilal: QuickServe Mobile App, client QuickServe Services, manager Bilal, deadline 24 October. Sara owns Login and profile screens: 8 hours, 12 October. Sara owns Service booking screens: 12 hours, 17 October. Hamza owns Booking and account APIs: 16 hours, 16 October. Usman owns Mobile integration and testing: 10 hours, 22 October.
Hina: HelpDeskPro AI Assistant, client HelpDeskPro Solutions, manager Hina, deadline 22 October. Maryam owns FAQ document processing: 10 hours, 13 October. Zain owns Assistant answer generation: 14 hours, 17 October. Zain owns Human escalation flow: 6 hours, 18 October. Maryam owns Assistant evaluation and testing: 8 hours, 21 October.
Ayesha: Those are the final decisions. Keep the rejected features out. The company already has its nine employees. Create three projects with twelve tasks, then show them in the CRM. That's all for this meeting.`;

const MODIFIED_TRANSCRIPT = `Meeting: NovaWorks Revised Sprint Planning
Date: 7 October 2026 | Scheduled duration: 30 minutes
Participants: Ayesha, Bilal, Hina, Ali, Hamza, Sara, Usman, Zain, Maryam

Bilal: For QuickServe Mobile App, client QuickServe Services, I am the manager with deadline 24 October. We agreed that Mobile integration and testing owned by Usman has a revised final estimate of 12 hours and revised deadline 23 October.
Sara owns Login and profile screens: 8 hours, 12 October.
Sara owns Service booking screens: 12 hours, 17 October.
Hamza owns Booking and account APIs: 16 hours, 16 October.
Usman owns Mobile integration and testing: 12 hours, 23 October.

Ayesha: For UrbanCart Website, client UrbanCart Clothing, manager Ayesha, deadline 20 October.
Ali owns Product catalog UI: 12 hours, 12 October.
Ali owns Demo cart UI: 8 hours, 15 October.
Hamza owns Product and cart APIs: 14 hours, 14 October.
Ali owns Website integration and testing: 6 hours, 19 October.

Hina: For HelpDeskPro AI Assistant, client HelpDeskPro Solutions, manager Hina, deadline 22 October.
Maryam owns FAQ document processing: 10 hours, 13 October.
Zain owns Assistant answer generation: 14 hours, 17 October.
Zain owns Human escalation flow: 6 hours, 18 October.
Maryam owns Assistant evaluation and testing: 8 hours, 21 October.`;

export const CreateTranscript: React.FC<CreateTranscriptProps> = ({ onBack, onSuccess }) => {
  const [transcript, setTranscript] = useState(OFFICIAL_TRANSCRIPT);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<CreateFromTranscriptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const PIPELINE_STEPS = [
    '1. Transcript Received & Sanitized',
    '2. Permitted Team Directory Bound',
    '3. AI Extraction via Gemini / OpenRouter',
    '4. Domain Validation & Employee Resolution',
    '5. Atomic Database Commit'
  ];

  const handleProcess = async () => {
    if (!transcript.trim()) {
      setError('Meeting transcript cannot be empty.');
      return;
    }

    setLoading(true);
    setError(null);
    setValidationErrors([]);
    setResult(null);

    // Animate pipeline stages for clear visual feedback
    setActiveStep(1);
    const stepInterval = setInterval(() => {
      setActiveStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 450);

    const res = await api.createFromTranscript({ transcript });

    clearInterval(stepInterval);
    setActiveStep(5);

    if (res.success && res.data) {
      setResult(res.data);
    } else {
      setError(res.error || 'Failed to process transcript');
      if (res.validationErrors && Array.isArray(res.validationErrors)) {
        setValidationErrors(res.validationErrors);
      }
    }
    setLoading(false);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects Overview</span>
        </button>

        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-900/50 text-purple-300 border border-purple-700/60 font-semibold">
          ADMIN Privilege Only
        </span>
      </div>

      <div className="bg-[#0B1317] border border-[#1A2C30] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Transcript Processor</span>
          </div>
          <h2 className="text-2xl font-black text-white">Create Projects from Meeting Transcript</h2>
          <p className="mt-1 text-sm text-slate-400 leading-relaxed">
            Paste the raw meeting transcript below. The domain orchestrator will securely bind the company directory, execute structured extraction via the AI parser, enforce all role and deadline rules, and atomically commit the records.
          </p>
        </div>

        {/* Quick Load Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-slate-500 font-medium mr-1">Quick Presets:</span>
          <button
            type="button"
            onClick={() => setTranscript(OFFICIAL_TRANSCRIPT)}
            className="px-3 py-1.5 rounded-lg bg-[#121E23] hover:bg-[#18282E] border border-[#223B40] text-xs font-medium text-emerald-400 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Load Official Hackathon Transcript</span>
          </button>

          <button
            type="button"
            onClick={() => setTranscript(MODIFIED_TRANSCRIPT)}
            className="px-3 py-1.5 rounded-lg bg-[#121E23] hover:bg-[#18282E] border border-[#223B40] text-xs font-medium text-sky-400 transition-colors flex items-center space-x-1.5 cursor-pointer"
            title="Tests QuickServe with 12 hours & 23 Oct to prove dynamic AI conversion"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Load Modified Test Transcript (Proves Dynamic AI)</span>
          </button>

          <button
            type="button"
            onClick={() => setTranscript('')}
            className="px-3 py-1.5 rounded-lg bg-[#121E23] hover:bg-[#18282E] border border-[#223B40] text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <span>Clear Textarea</span>
          </button>
        </div>

        {/* Monospace Textarea */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Transcript Content
          </label>
          <textarea
            rows={14}
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder="Paste meeting transcript here..."
            className="w-full p-4 rounded-xl bg-[#070D10] border border-[#1A2C30] text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors leading-relaxed selection:bg-emerald-500 selection:text-black"
          />
          <div className="mt-1 flex justify-between text-[11px] text-slate-500">
            <span>Character count: {transcript.length}</span>
            <span>Passwords or tokens are never sent to AI</span>
          </div>
        </div>

        {/* Pipeline Progress Stages (When Running) */}
        {loading && (
          <div className="p-5 rounded-xl bg-[#070D10] border border-emerald-500/30 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Executing Domain Pipeline</span>
              </span>
              <span>Step {activeStep} of 5</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {PIPELINE_STEPS.map((step, idx) => {
                const stepNum = idx + 1;
                const isComplete = activeStep > stepNum;
                const isCurrent = activeStep === stepNum;
                return (
                  <div
                    key={step}
                    className={`p-2 rounded-lg text-[10px] font-medium border text-center transition-all ${
                      isComplete
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60'
                        : isCurrent
                        ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400 animate-pulse'
                        : 'bg-[#0B1317] text-slate-500 border-[#1A2C30]'
                    }`}
                  >
                    {step}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div>
          <button
            onClick={handleProcess}
            disabled={loading || !transcript.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Domain Pipeline In Progress...
              </span>
            ) : (
              <span className="inline-flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Process Transcript via AI Domain Pipeline</span>
              </span>
            )}
          </button>
        </div>

        {/* Validation Errors Alert */}
        {error && (
          <div className="p-5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Domain Validation Rejection (All-or-Nothing Rollback)</span>
            </div>
            <p className="text-xs">{error}</p>
            {validationErrors.length > 0 && (
              <ul className="list-disc list-inside text-xs space-y-1 text-rose-300/90 pt-1">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Success Banner & Created Payload Breakdown */}
        {result && (
          <div className="p-6 rounded-2xl bg-[#091715] border border-emerald-500/40 space-y-5 animate-in fade-in">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pipeline Execution Committed</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Successfully Extracted {result.projectsCreated} Projects and {result.tasksCreated} Tasks!
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Total Planned Engineering: <strong className="text-emerald-400">{result.totalEstimatedHours} hours</strong>. Records are securely saved to the persistent database.
                </p>
              </div>

              <button
                onClick={onSuccess}
                className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                View in CRM &rarr;
              </button>
            </div>

            {/* Created Projects List Preview */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Extracted Deliverables:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {result.projects.map((p, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#0D1E20] border border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                        {p.deadline}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <span>Manager: <strong className="text-slate-200">{p.managerName}</strong></span>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold">
                      {p.tasks.length} Tasks Created
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
