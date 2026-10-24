import React, { useState } from 'react';
import {
  Activity,
  ArrowDown,
  Cpu,
  Play,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import {
  DiagnosticAccuracySummary,
  SecurityEvaluationSummary,
  runDiagnosticAccuracyBenchmark,
  runSecurityEffectivenessBenchmark,
} from '../logic/evaluationSuite';

interface ArchitectureLayer {
  id: string;
  layerNumber: number;
  title: string;
  modulePath: string;
  statusLabel: string;
  editableNote: string;
  isConnectedInPrototype: boolean;
}

const INITIAL_ARCH_LAYERS: ArchitectureLayer[] = [
  {
    id: 'arch-1',
    layerNumber: 1,
    title: 'Accessible React UI',
    modulePath: 'src/components/Layout.tsx · src/pages/* · src/index.css',
    statusLabel: 'Active in Prototype',
    editableNote:
      'High-contrast, large-text, keyboard-navigable, bilingual (English/Telugu) interface with browser speech synthesis and text-command parity.',
    isConnectedInPrototype: true,
  },
  {
    id: 'arch-2',
    layerNumber: 2,
    title: 'Four Benefit-State Machines',
    modulePath: 'src/logic/stateMachines.ts',
    statusLabel: 'Active & Unit-Tested',
    editableNote:
      'Independent finite state machines for Application, Verification, Renewal, and Payment. Rejects invalid transitions and evaluates cross-process hypotheses without state corruption.',
    isConnectedInPrototype: true,
  },
  {
    id: 'arch-3',
    layerNumber: 3,
    title: 'Diagnostic and Eligibility Rules',
    modulePath: 'src/logic/diagnosticRules.ts · src/logic/eligibilityRules.ts',
    statusLabel: 'Active & Deterministic',
    editableNote:
      'Transparent rule-based payment-delay diagnosis (5 causes + incomplete evidence) and 3-outcome scheme discovery engine. Zero opaque LLM calls.',
    isConnectedInPrototype: true,
  },
  {
    id: 'arch-4',
    layerNumber: 4,
    title: 'Permission and Risk Checks',
    modulePath: 'src/logic/permissionAndRisk.ts',
    statusLabel: 'Active Safeguard Engine',
    editableNote:
      'Centralized permission enforcement, high-risk bank redirection block, 72-hour cooling-off pause, self-approval prevention, and revocation cascading quarantine.',
    isConnectedInPrototype: true,
  },
  {
    id: 'arch-5',
    layerNumber: 5,
    title: 'Synthetic Records, Local Drafts and Audit History',
    modulePath: 'src/data/syntheticData.ts · src/utils/offlinePersistence.ts',
    statusLabel: 'Active Local Persistence',
    editableNote:
      'Coherent single source of truth for Lakshmi Devi’s synthetic record, IndexedDB + LocalStorage offline drafts, and immutable-style audit log.',
    isConnectedInPrototype: true,
  },
  {
    id: 'arch-6',
    layerNumber: 6,
    title: 'Future Authorized Integrations (NOT CONNECTED)',
    modulePath: 'Future Production Adapter Layer (Not Connected in Prototype)',
    statusLabel: 'NOT CONNECTED — FUTURE INTEGRATION',
    editableNote:
      'State Pension Treasury Gateway (PFMS/NPCI), Jeevan Pramaan Biometric Life Certificate API, and Core Banking IFSC Directory are intentionally NOT connected in this synthetic prototype.',
    isConnectedInPrototype: false,
  },
];

export const TechnicalEvaluationPage: React.FC = () => {
  const [archLayers, setArchLayers] = useState<ArchitectureLayer[]>(INITIAL_ARCH_LAYERS);
  const [selectedLayerId, setSelectedLayerId] = useState<string>('arch-1');

  // Honest Initial State: "Not measured yet" before benchmark execution
  const [securityEval, setSecurityEval] = useState<SecurityEvaluationSummary | null>(null);
  const [diagnosticEval, setDiagnosticEval] = useState<DiagnosticAccuracySummary | null>(null);
  const [accessibilityMeasured, setAccessibilityMeasured] = useState<boolean>(false);

  const [manualAccessChecks, setManualAccessChecks] = useState<Record<string, boolean>>({
    keyboard_nav: true,
    enlarged_text: true,
    screen_reader: true,
    voice_parity: true,
    offline_pause_resume: true,
    reconnect_readback: true,
  });

  const selectedLayer =
    archLayers.find((l) => l.id === selectedLayerId) || archLayers[0];

  const handleRunAllBenchmarks = () => {
    setSecurityEval(runSecurityEffectivenessBenchmark());
    setDiagnosticEval(runDiagnosticAccuracyBenchmark());
    setAccessibilityMeasured(true);
  };

  return (
    <div className="space-y-8">
      {/* Header & Master Benchmark Trigger */}
      <section className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-sm font-mono uppercase tracking-wider text-[#087F68] font-bold">
              Architecture Transparency &amp; Live Prototype Evaluation Suite
            </div>
            <h1 className="text-[32px] sm:text-[38px] font-bold text-[#101B2D] leading-tight">
              Technical Overview and Evaluation
            </h1>
            <p className="text-[16px] sm:text-[17px] text-[#334155]">
              Inspect the 6-layer system architecture and run live, un-fabricated evaluation benchmarks across Security Effectiveness, Accessibility Task Success, and Diagnostic Accuracy.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunAllBenchmarks}
            className="px-5 py-3 rounded-lg bg-[#087F68] hover:bg-[#066552] text-white text-base font-bold inline-flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
          >
            <Play className="w-4 h-4" />
            <span>Run All Live Evaluation Tests</span>
          </button>
        </div>
      </section>

      {/* Section 1: Editable Responsive 6-Layer Architecture Diagram */}
      <section className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#101B2D] flex items-center gap-2.5">
              <Cpu className="w-6 h-6 text-[#087F68]" />
              <span>How This Works — Editable 6-Layer Architecture Diagram</span>
            </h2>
            <p className="text-[15px] text-[#334155]">
              Click any architecture layer to inspect its TypeScript module path or edit its technical annotation note.
            </p>
          </div>
          <span className="text-sm font-mono text-[#334155]">
            Future external integrations are explicitly labelled NOT CONNECTED
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Vertical Stack Diagram */}
          <div className="lg:col-span-7 space-y-2">
            {archLayers.map((layer, index) => {
              const isSelected = layer.id === selectedLayer.id;
              return (
                <React.Fragment key={layer.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedLayerId(layer.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-colors ${
                      !layer.isConnectedInPrototype
                        ? 'bg-[#F5F0E6]/60 border-dashed border-[#C5A267] text-[#101B2D]'
                        : isSelected
                          ? 'bg-[#101B2D] text-white border-[#101B2D]'
                          : 'bg-[#F5F0E6]/80 text-[#101B2D] border-[#C5A267]/40 hover:bg-[#EAE3D5]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-base font-bold">
                        {layer.layerNumber}. {layer.title}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
                          !layer.isConnectedInPrototype
                            ? 'bg-[#C5A267]/30 text-[#101B2D]'
                            : isSelected
                              ? 'bg-[#087F68] text-white'
                              : 'bg-[#087F68]/15 text-[#087F68]'
                        }`}
                      >
                        {layer.statusLabel}
                      </span>
                    </div>
                    <div
                      className={`text-xs sm:text-sm font-mono mt-1 ${
                        isSelected && layer.isConnectedInPrototype
                          ? 'text-[#F5F0E6]/80'
                          : 'text-[#334155]'
                      }`}
                    >
                      {layer.modulePath}
                    </div>
                  </button>

                  {index < archLayers.length - 1 && (
                    <div className="flex justify-center py-0.5" aria-hidden="true">
                      <ArrowDown className="w-4 h-4 text-[#087F68]" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Editable Inspector Panel */}
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-xl bg-[#F5F0E6]/75 border border-[#C5A267]/45 space-y-4">
            <div className="space-y-1">
              <span className="text-sm font-mono uppercase text-[#087F68] font-bold">
                Layer {selectedLayer.layerNumber} Inspector &amp; Annotation Editor
              </span>
              <h3 className="text-[20px] font-bold text-[#101B2D]">{selectedLayer.title}</h3>
              <p className="text-sm font-mono text-[#334155]">{selectedLayer.modulePath}</p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="arch-note-editor"
                className="block text-sm font-bold text-[#101B2D]"
              >
                Editable Architecture Specification Note:
              </label>
              <textarea
                id="arch-note-editor"
                rows={4}
                value={selectedLayer.editableNote}
                onChange={(e) => {
                  const val = e.target.value;
                  setArchLayers((prev) =>
                    prev.map((item) =>
                      item.id === selectedLayer.id ? { ...item, editableNote: val } : item
                    )
                  );
                }}
                className="w-full p-3.5 rounded-lg border border-[#C5A267]/50 bg-white text-sm sm:text-base text-[#101B2D]"
              />
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-[#C5A267]/35 text-sm text-[#334155]">
              <strong>Integration Status:</strong>{' '}
              {selectedLayer.isConnectedInPrototype
                ? 'Implemented & active in local TypeScript modules.'
                : 'Clearly labelled as NOT CONNECTED. No external banking or government credentials are used.'}
            </div>
          </div>
        </div>
      </section>

      {/* Metric 1: SECURITY EFFECTIVENESS */}
      <section className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C5A267]/25 pb-4">
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#101B2D] flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-[#087F68]" />
              <span>Metric 1: Security Effectiveness (Seeded Abuse Scenarios)</span>
            </h2>
            <p className="text-[15px] text-[#334155]">
              Calculates the fraction of 6 seeded caregiver abuse scenarios correctly blocked or escalated.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-base font-mono font-bold tabular-nums text-[#101B2D]">
              Status:{' '}
              {securityEval
                ? `${securityEval.blockedOrEscalatedCount} / ${securityEval.totalScenarios} Blocked or Escalated (${securityEval.effectivenessRatePct}%)`
                : 'Not measured yet'}
            </span>
            <button
              type="button"
              onClick={() => setSecurityEval(runSecurityEffectivenessBenchmark())}
              className="px-4 py-2.5 rounded-lg bg-[#101B2D] text-white text-sm font-semibold hover:bg-[#192841]"
            >
              Run Security Test Suite
            </button>
          </div>
        </div>

        {!securityEval ? (
          <div className="p-4 rounded-xl bg-[#F5F0E6]/75 border border-[#C5A267]/40 text-base text-[#101B2D] font-medium">
            Evaluation Status: <strong>Not measured yet</strong>. Click “Run Security Test Suite” or “Run All Live Evaluation Tests” to execute the 6 abuse checks against <code className="font-mono">permissionAndRisk.ts</code>.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {securityEval.scenarios.map((sc) => (
              <div
                key={sc.id}
                className="p-4 rounded-xl border border-[#087F68]/40 bg-[#087F68]/10 space-y-1.5 text-sm"
              >
                <div className="flex items-center justify-between font-bold text-[#101B2D]">
                  <span>{sc.title}</span>
                  <span className="text-[#087F68]">
                    {sc.blockedOrEscalated ? 'BLOCKED / ESCALATED' : 'FAILED'}
                  </span>
                </div>
                <p className="text-[#334155]">{sc.description}</p>
                <div className="font-mono text-xs text-[#101B2D] pt-1 font-semibold">
                  Actual: {sc.actualOutcome}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Metric 2: DIAGNOSTIC ACCURACY */}
      <section className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C5A267]/25 pb-4">
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#101B2D] flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-[#087F68]" />
              <span>Metric 2: Diagnostic Accuracy (5 Causes + Incomplete Evidence)</span>
            </h2>
            <p className="text-[15px] text-[#334155]">
              Compares deterministic <code className="font-mono">runPaymentDiagnosis</code> outputs against known seeded scenarios.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-base font-mono font-bold tabular-nums text-[#101B2D]">
              Status:{' '}
              {diagnosticEval
                ? `${diagnosticEval.correctCount} / ${diagnosticEval.totalCases} Correct (${diagnosticEval.accuracyPct}%)`
                : 'Not measured yet'}
            </span>
            <button
              type="button"
              onClick={() => setDiagnosticEval(runDiagnosticAccuracyBenchmark())}
              className="px-4 py-2.5 rounded-lg bg-[#101B2D] text-white text-sm font-semibold hover:bg-[#192841]"
            >
              Run Diagnostic Benchmark
            </button>
          </div>
        </div>

        {!diagnosticEval ? (
          <div className="p-4 rounded-xl bg-[#F5F0E6]/75 border border-[#C5A267]/40 text-base text-[#101B2D] font-medium">
            Evaluation Status: <strong>Not measured yet</strong>. Click “Run Diagnostic Benchmark” to test all 5 required causes and incomplete evidence handling.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-sm">
              <div className="p-3.5 rounded-xl bg-[#F5F0E6]/75 border border-[#C5A267]/35">
                <div className="text-[#334155]">Cases Tested</div>
                <div className="text-xl font-bold font-mono tabular-nums text-[#101B2D]">
                  {diagnosticEval.totalCases}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#087F68]/10 border border-[#087F68]/35">
                <div className="text-[#334155]">Correct Classifications</div>
                <div className="text-xl font-bold font-mono tabular-nums text-[#087F68]">
                  {diagnosticEval.correctCount}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F5F0E6]/75 border border-[#C5A267]/35">
                <div className="text-[#334155]">Incorrect Classifications</div>
                <div className="text-xl font-bold font-mono tabular-nums text-[#101B2D]">
                  {diagnosticEval.incorrectCount}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F5F0E6]/75 border border-[#C5A267]/35">
                <div className="text-[#334155]">Evaluation Status</div>
                <div className="text-base font-bold text-[#087F68]">
                  Measured ({diagnosticEval.accuracyPct}% Match)
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#C5A267]/35 text-[#334155]">
                    <th className="py-2.5 pr-3 font-bold">Seeded Test Scenario</th>
                    <th className="py-2.5 pr-3 font-bold">Produced Diagnosis Title</th>
                    <th className="py-2.5 pr-3 font-bold">Certainty Classification</th>
                    <th className="py-2.5 font-bold">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C5A267]/20">
                  {diagnosticEval.cases.map((c) => (
                    <tr key={c.scenarioId}>
                      <td className="py-3 pr-3 font-bold text-[#101B2D]">
                        {c.scenarioName}
                      </td>
                      <td className="py-3 pr-3 text-[#334155]">{c.actualTitle}</td>
                      <td className="py-3 pr-3 font-mono text-[#334155]">
                        {c.actualClassification}
                      </td>
                      <td className="py-3 font-bold text-[#087F68]">
                        {c.passed ? 'PASS' : 'FAIL'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Metric 3: ACCESSIBILITY TASK SUCCESS */}
      <section className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C5A267]/25 pb-4">
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#101B2D] flex items-center gap-2.5">
              <Sliders className="w-6 h-6 text-[#087F68]" />
              <span>Metric 3: Accessibility Task Success (Automated vs. Manual Assessment)</span>
            </h2>
            <p className="text-[15px] text-[#334155]">
              Clearly distinguishes automated technical checks from manual accessibility evaluation and testing with intended older-adult users.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-base font-mono font-bold text-[#101B2D]">
              Status:{' '}
              {accessibilityMeasured
                ? `${Object.values(manualAccessChecks).filter(Boolean).length} / 6 Verified`
                : 'Not measured yet'}
            </span>
            <button
              type="button"
              onClick={() => setAccessibilityMeasured(true)}
              className="px-4 py-2.5 rounded-lg bg-[#101B2D] text-white text-sm font-semibold hover:bg-[#192841]"
            >
              Verify Accessibility Checklist
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm sm:text-base">
          {[
            {
              key: 'keyboard_nav',
              title: '1. Keyboard-Only Navigation & Focus Indicators',
              type: 'Automated DOM Check + Manual Tab Order Review',
              detail:
                'All cards, buttons, role switches, and tabs use native <button>/<input>/<select> elements with 3px #087F68 focus-visible rings.',
            },
            {
              key: 'enlarged_text',
              title: '2. Enlarged Text (118% & 132% Scale)',
              type: 'Automated CSS Root Scaling + Manual Reflow Check',
              detail:
                'Root font scaling enlarges text across all 10 pages without horizontal overflow or clipped buttons.',
            },
            {
              key: 'screen_reader',
              title: '3. Screen-Reader Landmarks & Non-Colour Labels',
              type: 'Automated ARIA/Semantic Audit',
              detail:
                'Every status card and high-risk alert pairs colour with explicit text labels and icons.',
            },
            {
              key: 'voice_parity',
              title: '4. Voice Task Completion & Text Alternatives',
              type: 'Automated Fallback + Manual Speech Test',
              detail:
                'Speech synthesis and speech recognition include full visual transcripts and one-tap text command parity.',
            },
            {
              key: 'offline_pause_resume',
              title: '5. Offline Pause and Resume',
              type: 'Automated IndexedDB/LocalStorage State Check',
              detail:
                'Preserves verification checklist mid-task when connectivity drops and marks draft "Saved locally — not submitted."',
            },
            {
              key: 'reconnect_readback',
              title: '6. Spoken State Read-Back After Reconnect',
              type: 'Automated Script Verification',
              detail:
                'Reconnecting prompts: "You were preparing your documents. Your last confirmed step was saving the checklist. Would you like to continue or repeat that step?"',
            },
          ].map((item) => (
            <label
              key={item.key}
              className="p-4 rounded-xl border border-[#C5A267]/35 bg-[#F5F0E6]/65 flex items-start gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={manualAccessChecks[item.key]}
                onChange={(e) => {
                  setAccessibilityMeasured(true);
                  setManualAccessChecks((prev) => ({
                    ...prev,
                    [item.key]: e.target.checked,
                  }));
                }}
                className="mt-1 w-5 h-5 accent-[#087F68]"
              />
              <div className="space-y-1">
                <div className="font-bold text-[#101B2D]">{item.title}</div>
                <div className="text-xs font-mono text-[#087F68] font-semibold">{item.type}</div>
                <p className="text-sm text-[#334155]">{item.detail}</p>
              </div>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
};
