import React from 'react';
import {
  AlertCircle,
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
      <section className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-[#087F78] font-bold">
              Illustrative Scheme Discovery · Transparent Rule Evaluation
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#102137]">
              Explore Benefits — Interactive Decision Tree
            </h1>
            <p className="text-sm text-slate-600">
              Evaluates illustrative scheme records against editable household parameters and displays three transparent outcomes: <strong>Eligible</strong>, <strong>Not eligible</strong>, or <strong>Needs confirmation</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => applyPresetScenario('lakshmi_default')}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#102137] inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Lakshmi Devi Default</span>
            </button>
            <button
              type="button"
              onClick={() => applyPresetScenario('all_confirmed')}
              className="px-3 py-1.5 rounded-lg bg-[#087F78] text-white text-xs font-semibold hover:bg-[#066963]"
            >
              Preset: Confirmed Eligible
            </button>
            <button
              type="button"
              onClick={() => applyPresetScenario('high_income')}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#102137]"
            >
              Preset: Not Eligible
            </button>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-xs text-[#102137]">
          <strong>Important Honesty Notice:</strong> These schemes use clearly labelled illustrative synthetic eligibility rules for demonstration. They do not claim binding eligibility for a live government program without official verification by a Welfare Officer.
        </div>
      </section>

      {/* Editable Visual Decision Tree Inputs */}
      <section className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#102137] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#087F78]" />
            <span>Editable Applicant Parameters (Decision Tree Inputs)</span>
          </h2>
          <span className="text-xs text-slate-500">
            Adjust any field below to see live updates across all 3 scheme outcomes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Age */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <label htmlFor="elig-age" className="block text-xs font-bold text-[#102137]">
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
              className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white text-sm font-mono tabular-nums"
            />
          </div>

          {/* Monthly Income */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <label htmlFor="elig-income" className="block text-xs font-bold text-[#102137]">
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
              className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white text-sm font-mono tabular-nums"
            />
          </div>

          {/* Disability % */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <label htmlFor="elig-disab-pct" className="block text-xs font-bold text-[#102137]">
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
              className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white text-sm font-mono tabular-nums"
            />
          </div>

          {/* Marital status */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <label htmlFor="elig-marital" className="block text-xs font-bold text-[#102137]">
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
              className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white text-sm"
            >
              <option value="Widowed">Widowed</option>
              <option value="Single / Unmarried">Single / Unmarried</option>
              <option value="Married">Married</option>
            </select>
          </div>

          {/* Disability Certificate Confirmed */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
            <label htmlFor="elig-cert" className="text-xs font-bold text-[#102137]">
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
              className="w-4 h-4 accent-[#087F78]"
            />
          </div>

          {/* Residency Years */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <label htmlFor="elig-res-yrs" className="block text-xs font-bold text-[#102137]">
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
              className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white text-sm font-mono tabular-nums"
            />
          </div>

          {/* Residency Document Available */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
            <label htmlFor="elig-res-doc" className="text-xs font-bold text-[#102137]">
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
              className="w-4 h-4 accent-[#087F78]"
            />
          </div>

          {/* Receives Another Primary Pension */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
            <label htmlFor="elig-other-pen" className="text-xs font-bold text-[#102137]">
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
              className="w-4 h-4 accent-[#087F78]"
            />
          </div>
        </div>
      </section>

      {/* Three Scheme Evaluation Cards */}
      <section className="space-y-5">
        {evaluations.map((scheme) => (
          <div
            key={scheme.schemeId}
            className={`seva-card bg-white rounded-xl border-2 p-6 space-y-4 ${
              scheme.outcome === 'Eligible'
                ? 'border-[#087F78]'
                : scheme.outcome === 'Needs confirmation'
                  ? 'border-amber-400'
                  : 'border-slate-300'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold">
                  {scheme.outcome === 'Eligible' ? (
                    <span className="text-[#087F78] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      OUTCOME: ELIGIBLE (IN ILLUSTRATIVE MODEL)
                    </span>
                  ) : scheme.outcome === 'Needs confirmation' ? (
                    <span className="text-amber-700 inline-flex items-center gap-1">
                      <HelpCircle className="w-4 h-4" />
                      OUTCOME: NEEDS CONFIRMATION
                    </span>
                  ) : (
                    <span className="text-[#C44848] inline-flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      OUTCOME: NOT ELIGIBLE
                    </span>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-slate-600">
                    ₹{scheme.monthlyBenefitINR.toLocaleString('en-IN')} / month
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#102137]">{scheme.schemeName}</h3>
                <p className="text-xs sm:text-sm text-slate-600">{scheme.description}</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  speakText(
                    `${scheme.schemeName}. Outcome: ${scheme.outcome}. Recommended next step: ${scheme.recommendedNextStep}`
                  )
                }
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-[#102137] hover:bg-slate-50 inline-flex items-center gap-1.5 shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#087F78]" />
                <span>Read Explanation</span>
              </button>
            </div>

            {/* Visual Decision Tree Nodes for this Scheme */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase text-slate-500">
                Visual Rule-Check Decision Tree (Which Criteria Were Checked)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {scheme.criteriaChecked.map((crit) => (
                  <div
                    key={crit.criterionId}
                    className={`p-3 rounded-lg border text-xs space-y-1 ${
                      crit.status === 'matched'
                        ? 'bg-[#E0F4EF]/50 border-[#087F78]/40'
                        : crit.status === 'missing_info'
                          ? 'bg-amber-50 border-amber-400'
                          : 'bg-red-50/50 border-[#C44848]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[#102137]">
                      <span>{crit.label}</span>
                      <span>
                        {crit.status === 'matched'
                          ? 'Matched ✓'
                          : crit.status === 'missing_info'
                            ? 'Missing Info ?'
                            : 'Did Not Match ✕'}
                      </span>
                    </div>
                    <div className="text-slate-600">{crit.ruleDescription}</div>
                    <div className="font-mono text-[#102137]">Your value: {crit.userValue}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4-Column Breakdown of Matched, Unmatched, Missing, & Official Confirmation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-[#087F78]">Criteria Matched</div>
                {scheme.matchedCriteria.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {scheme.matchedCriteria.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">None</p>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-[#C44848]">Criteria Not Matched</div>
                {scheme.unmatchedCriteria.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {scheme.unmatchedCriteria.map((u, i) => (
                      <li key={i}>{u}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">None — all checked rules passed</p>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-amber-800">What Information Is Missing</div>
                {scheme.missingInformation.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {scheme.missingInformation.map((mi, i) => (
                      <li key={i}>{mi}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">No missing local fields</p>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-[#102137]">Requires Official Confirmation</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  {scheme.factsRequiringOfficialConfirmation.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs sm:text-sm text-[#102137]">
              <strong>What you should do next:</strong> {scheme.recommendedNextStep}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
