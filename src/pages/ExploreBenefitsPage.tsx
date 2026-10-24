import React from 'react';
import {
  CheckCircle2,
  Compass,
  HelpCircle,
  RotateCcw,
  Volume2,
  XCircle,
} from 'lucide-react';
import { useSevaSutra } from '../context/SevaSutraContext';
import { INITIAL_ELIGIBILITY_INPUT } from '../data/syntheticData';
import { evaluateAllSchemes } from '../logic/eligibilityRules';
import { EligibilityApplicantInput } from '../types/models';

export const ExploreBenefitsPage: React.FC = () => {
  const { eligibilityInput, setEligibilityInput, speakText } = useSevaSutra();

  const evaluations = evaluateAllSchemes(eligibilityInput);

  const applyPresetScenario = (preset: 'lakshmi_default' | 'all_confirmed' | 'high_income') => {
    if (preset === 'lakshmi_default') {
      setEligibilityInput(INITIAL_ELIGIBILITY_INPUT);
    } else if (preset === 'all_confirmed') {
      setEligibilityInput({
        age: 72,
        monthlyHouseholdIncomeINR: 3200,
        hasDisabilityCertificate: true,
        disabilityPercentage: 55,
        residencyYearsInState: 42,
        residencyDocumentAvailable: true,
        receivesAnotherStatePension: false,
        maritalStatus: 'Widowed',
      });
    } else {
      setEligibilityInput({
        age: 54,
        monthlyHouseholdIncomeINR: 12000,
        hasDisabilityCertificate: false,
        disabilityPercentage: 10,
        residencyYearsInState: 2,
        residencyDocumentAvailable: false,
        receivesAnotherStatePension: true,
        maritalStatus: 'Married',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Honest Disclaimer */}
      <section className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-sm font-mono uppercase tracking-wider text-[#087F68] font-bold">
              Illustrative Scheme Discovery · Transparent Rule Evaluation
            </div>
            <h1 className="text-[32px] sm:text-[38px] font-bold text-[#101B2D] leading-tight">
              Explore Benefits — Interactive Decision Tree
            </h1>
            <p className="text-[16px] sm:text-[17px] text-[#334155]">
              Evaluates illustrative scheme records against editable household parameters and displays three transparent outcomes: <strong>Eligible</strong>, <strong>Not eligible</strong>, or <strong>Needs confirmation</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => applyPresetScenario('lakshmi_default')}
              className="px-4 py-2 rounded-lg border border-[#C5A267]/50 bg-[#F5F0E6] hover:bg-[#EAE3D5] text-sm font-semibold text-[#101B2D] inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Lakshmi Devi Default</span>
            </button>
            <button
              type="button"
              onClick={() => applyPresetScenario('all_confirmed')}
              className="px-4 py-2 rounded-lg bg-[#087F68] text-white text-sm font-semibold hover:bg-[#066552]"
            >
              Preset: Confirmed Eligible
            </button>
            <button
              type="button"
              onClick={() => applyPresetScenario('high_income')}
              className="px-4 py-2 rounded-lg border border-[#C5A267]/50 bg-white hover:bg-[#F5F0E6] text-sm font-semibold text-[#101B2D]"
            >
              Preset: Not Eligible
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#F5F0E6] border border-[#C5A267]/50 text-sm sm:text-base text-[#101B2D]">
          <strong>Important Honesty Notice:</strong> These schemes use clearly labelled illustrative synthetic eligibility rules for demonstration. They do not claim binding eligibility for a live government program without official verification by a Welfare Officer.
        </div>
      </section>

      {/* Editable Visual Decision Tree Inputs */}
      <section className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-[22px] sm:text-[26px] font-bold text-[#101B2D] flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-[#087F68]" />
            <span>Editable Applicant Parameters (Decision Tree Inputs)</span>
          </h2>
          <span className="text-sm text-[#334155]">
            Adjust any field below to see live updates across all 3 scheme outcomes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Age */}
          <div className="p-4 rounded-xl bg-[#F5F0E6]/75 border border-[#C5A267]/40 space-y-2">
            <label htmlFor="elig-age" className="block text-sm font-bold text-[#101B2D]">
              1. Applicant Age (Years)
            </label>
            <input
              id="elig-age"
              type="number"
              min={18}
              max={110}
              value={eligibilityInput.age}
              onChange={(e) =>
                setEligibilityInput((prev) => ({
                  ...prev,
                  age: Number(e.target.value) || 0,
                }))
              }
              className="w-full px-3.5 py-2 rounded-lg border border-[#C5A267]/50 bg-white text-base font-mono tabular-nums text-[#101B2D]"
            />
          </div>

          {/* Monthly Income */}
          <div className="p-4 rounded-xl bg-[#F5F0E6]/75 border border-[#C5A267]/40 space-y-2">
            <label htmlFor="elig-income" className="block text-sm font-bold text-[#101B2D]">
              2. Monthly Household Income (₹)
            </label>
            <input
              id="elig-income"
              type="number"
              step={500}
              min={0}
              value={eligibilityInput.monthlyHouseholdIncomeINR}
              onChange={(e) =>
                setEligibilityInput((prev) => ({
                  ...prev,
                  monthlyHouseholdIncomeINR: Number(e.target.value) || 0,
                }))
              }
              className="w-full px-3.5 py-2 rounded-lg border border-[#C5A267]/50 bg-white text-base font-mono tabular-nums text-[#101B2D]"
            />
          </div>

          {/* Disability % */}
          <div className="p-4 rounded-xl bg-[#F5F0E6]/75 border border-[#C5A267]/40 space-y-2">
            <label htmlFor="elig-disab-pct" className="block text-sm font-bold text-[#101B2D]">
              3. Assessed Disability Percentage (%)
            </label>
            <input
              id="elig-disab-pct"
              type="number"
              min={0}
              max={100}
              value={eligibilityInput.disabilityPercentage}
              onChange={(e) =>
                setEligibilityInput((prev) => ({
                  ...prev,
                  disabilityPercentage: Number(e.target.value) || 0,
                }))
              }
              className="w-full px-3.5 py-2 rounded-lg border border-[#C5A267]/50 bg-white text-base font-mono tabular-nums text-[#101B2D]"
            />
          </div>

          {/* Marital status */}
          <div className="p-4 rounded-xl bg-[#F5F0E6]/75 border border-[#C5A267]/40 space-y-2">
            <label htmlFor="elig-marital" className="block text-sm font-bold text-[#101B2D]">
              4. Marital / Survivor Status
            </label>
            <select
              id="elig-marital"
              value={eligibilityInput.maritalStatus}
              onChange={(e) =>
                setEligibilityInput((prev) => ({
                  ...prev,
                  maritalStatus: e.target.value as EligibilityApplicantInput['maritalStatus'],
                }))
              }
              className="w-full px-3.5 py-2 rounded-lg border border-[#C5A267]/50 bg-white text-base text-[#101B2D]"
            >
              <option value="Widowed">Widowed</option>
              <option value="Single / Unmarried">Single / Unmarried</option>
              <option value="Married">Married</option>
            </select>
          </div>

          {/* Disability Certificate Confirmed */}
          <div className="p-4 rounded-xl bg-[#F5F0E6]/75 border border-[#C5A267]/40 flex items-center justify-between gap-2">
            <label htmlFor="elig-cert" className="text-sm font-bold text-[#101B2D]">
              5. Valid Medical Certificate On File?
            </label>
            <input
              id="elig-cert"
              type="checkbox"
              checked={eligibilityInput.hasDisabilityCertificate}
              onChange={(e) =>
                setEligibilityInput((prev) => ({
                  ...prev,
                  hasDisabilityCertificate: e.target.checked,
                }))
              }
              className="w-5 h-5 accent-[#087F68]"
            />
          </div>

          {/* Residency Years */}
          <div className="p-4 rounded-xl bg-[#F5F0E6]/75 border border-[#C5A267]/40 space-y-2">
            <label htmlFor="elig-res-yrs" className="block text-sm font-bold text-[#101B2D]">
              6. State Residency Duration (Years)
            </label>
            <input
              id="elig-res-yrs"
              type="number"
              min={0}
              max={100}
              value={eligibilityInput.residencyYearsInState}
              onChange={(e) =>
                setEligibilityInput((prev) => ({
                  ...prev,
                  residencyYearsInState: Number(e.target.value) || 0,
                }))
              }
              className="w-full px-3.5 py-2 rounded-lg border border-[#C5A267]/50 bg-white text-base font-mono tabular-nums text-[#101B2D]"
            />
          </div>

          {/* Residency Document Available */}
          <div className="p-4 rounded-xl bg-[#F5F0E6]/75 border border-[#C5A267]/40 flex items-center justify-between gap-2">
            <label htmlFor="elig-res-doc" className="text-sm font-bold text-[#101B2D]">
              7. Residency Proof Verified?
            </label>
            <input
              id="elig-res-doc"
              type="checkbox"
              checked={eligibilityInput.residencyDocumentAvailable}
              onChange={(e) =>
                setEligibilityInput((prev) => ({
                  ...prev,
                  residencyDocumentAvailable: e.target.checked,
                }))
              }
              className="w-5 h-5 accent-[#087F68]"
            />
          </div>

          {/* Receives Another Primary Pension */}
          <div className="p-4 rounded-xl bg-[#F5F0E6]/75 border border-[#C5A267]/40 flex items-center justify-between gap-2">
            <label htmlFor="elig-other-pen" className="text-sm font-bold text-[#101B2D]">
              8. Already Receives Primary State Pension?
            </label>
            <input
              id="elig-other-pen"
              type="checkbox"
              checked={eligibilityInput.receivesAnotherStatePension}
              onChange={(e) =>
                setEligibilityInput((prev) => ({
                  ...prev,
                  receivesAnotherStatePension: e.target.checked,
                }))
              }
              className="w-5 h-5 accent-[#087F68]"
            />
          </div>
        </div>
      </section>

      {/* Three Scheme Evaluation Cards */}
      <section className="space-y-6">
        {evaluations.map((scheme) => (
          <div
            key={scheme.schemeId}
            className={`seva-card bg-white rounded-xl border-2 p-6 sm:p-7 space-y-5 ${
              scheme.outcome === 'Eligible'
                ? 'border-[#087F68]'
                : scheme.outcome === 'Needs confirmation'
                  ? 'border-[#C5A267]'
                  : 'border-[#C5A267]/35'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#C5A267]/25 pb-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5 text-sm font-bold">
                  {scheme.outcome === 'Eligible' ? (
                    <span className="text-[#087F68] inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      OUTCOME: ELIGIBLE (IN ILLUSTRATIVE MODEL)
                    </span>
                  ) : scheme.outcome === 'Needs confirmation' ? (
                    <span className="text-[#8B6914] inline-flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      OUTCOME: NEEDS CONFIRMATION
                    </span>
                  ) : (
                    <span className="text-[#B42332] inline-flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" />
                      OUTCOME: NOT ELIGIBLE
                    </span>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-[#101B2D] font-bold">
                    ₹{scheme.monthlyBenefitINR.toLocaleString('en-IN')} / month
                  </span>
                </div>
                <h3 className="text-[20px] sm:text-[22px] font-bold text-[#101B2D]">{scheme.schemeName}</h3>
                <p className="text-[16px] text-[#334155]">{scheme.description}</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  speakText(
                    `${scheme.schemeName}. Outcome: ${scheme.outcome}. Recommended next step: ${scheme.recommendedNextStep}`
                  )
                }
                className="px-4 py-2 rounded-lg border border-[#C5A267]/50 bg-[#F5F0E6] text-sm font-semibold text-[#101B2D] hover:bg-[#EAE3D5] inline-flex items-center gap-2 shrink-0"
              >
                <Volume2 className="w-4 h-4 text-[#087F68]" />
                <span>Read Explanation</span>
              </button>
            </div>

            {/* Visual Decision Tree Nodes for this Scheme */}
            <div className="space-y-3">
              <div className="text-sm font-bold uppercase tracking-wider text-[#334155]">
                Visual Rule-Check Decision Tree (Which Criteria Were Checked)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {scheme.criteriaChecked.map((crit) => (
                  <div
                    key={crit.criterionId}
                    className={`p-4 rounded-xl border text-sm space-y-1.5 ${
                      crit.status === 'matched'
                        ? 'bg-[#087F68]/10 border-[#087F68]/40'
                        : crit.status === 'missing_info'
                          ? 'bg-[#C5A267]/15 border-[#C5A267]'
                          : 'bg-[#B42332]/10 border-[#B42332]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[#101B2D]">
                      <span>{crit.label}</span>
                      <span
                        className={
                          crit.status === 'matched'
                            ? 'text-[#087F68]'
                            : crit.status === 'missing_info'
                              ? 'text-[#8B6914]'
                              : 'text-[#B42332]'
                        }
                      >
                        {crit.status === 'matched'
                          ? 'Matched ✓'
                          : crit.status === 'missing_info'
                            ? 'Missing Info ?'
                            : 'Did Not Match ✕'}
                      </span>
                    </div>
                    <div className="text-[#334155]">{crit.ruleDescription}</div>
                    <div className="font-mono text-[#101B2D] font-semibold">
                      Your value: {crit.userValue}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4-Column Breakdown of Matched, Unmatched, Missing, & Official Confirmation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 text-sm">
              <div className="p-4 rounded-xl bg-[#F5F0E6]/70 border border-[#C5A267]/35 space-y-1.5">
                <div className="font-bold text-[#087F68]">Criteria Matched</div>
                {scheme.matchedCriteria.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-[#334155]">
                    {scheme.matchedCriteria.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#334155]">None</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#F5F0E6]/70 border border-[#C5A267]/35 space-y-1.5">
                <div className="font-bold text-[#B42332]">Criteria Not Matched</div>
                {scheme.unmatchedCriteria.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-[#334155]">
                    {scheme.unmatchedCriteria.map((u, i) => (
                      <li key={i}>{u}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#334155]">None — all checked rules passed</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#F5F0E6]/70 border border-[#C5A267]/35 space-y-1.5">
                <div className="font-bold text-[#8B6914]">What Information Is Missing</div>
                {scheme.missingInformation.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-[#334155]">
                    {scheme.missingInformation.map((mi, i) => (
                      <li key={i}>{mi}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#334155]">No missing local fields</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#F5F0E6]/70 border border-[#C5A267]/35 space-y-1.5">
                <div className="font-bold text-[#101B2D]">Requires Official Confirmation</div>
                <ul className="list-disc pl-4 space-y-1 text-[#334155]">
                  {scheme.factsRequiringOfficialConfirmation.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-[#C5A267]/25 text-[16px] text-[#101B2D]">
              <strong>What you should do next:</strong> {scheme.recommendedNextStep}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
