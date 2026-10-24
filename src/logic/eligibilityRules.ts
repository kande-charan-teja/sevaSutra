import {
  CriterionEvaluation,
  EligibilityApplicantInput,
  EligibilityOutcome,
  SchemeEvaluationResult,
} from '../types/models';

export interface IllustrativeSchemeDefinition {
  id: string;
  name: string;
  monthlyBenefitINR: number;
  description: string;
  minAge: number;
  maxMonthlyIncomeINR: number;
  requiresDisabilityCertificate: boolean;
  minDisabilityPercentage: number;
  minResidencyYears: number;
  requiresWidowhood: boolean;
  allowsConcurrentPension: boolean;
}

export const ILLUSTRATIVE_SCHEMES: IllustrativeSchemeDefinition[] = [
  {
    id: 'scheme-senior-citizen-pension',
    name: 'Illustrative Senior Citizen Social Security Pension (Synthetic Rule Set)',
    monthlyBenefitINR: 2500,
    description:
      'Monthly social security support for older adults aged 60+ with low household income who are not receiving another primary state pension.',
    minAge: 60,
    maxMonthlyIncomeINR: 5000,
    requiresDisabilityCertificate: false,
    minDisabilityPercentage: 0,
    minResidencyYears: 5,
    requiresWidowhood: false,
    allowsConcurrentPension: false,
  },
  {
    id: 'scheme-disability-assist-allowance',
    name: 'Illustrative Severe Disability & Care Support Allowance (Synthetic Rule Set)',
    monthlyBenefitINR: 3500,
    description:
      'Supplemental support for individuals with certified low vision, hearing loss, or physical disability (40%+ benchmark) to cover assistive needs.',
    minAge: 18,
    maxMonthlyIncomeINR: 7500,
    requiresDisabilityCertificate: true,
    minDisabilityPercentage: 40,
    minResidencyYears: 3,
    requiresWidowhood: false,
    allowsConcurrentPension: true,
  },
  {
    id: 'scheme-widow-dignity-pension',
    name: 'Illustrative Widow Dignity & Livelihood Pension (Synthetic Rule Set)',
    monthlyBenefitINR: 2500,
    description:
      'Direct monthly pension for widowed women in low-income households who do not already receive a primary state old-age pension.',
    minAge: 18,
    maxMonthlyIncomeINR: 5000,
    requiresDisabilityCertificate: false,
    minDisabilityPercentage: 0,
    minResidencyYears: 5,
    requiresWidowhood: true,
    allowsConcurrentPension: false,
  },
];

/**
 * Evaluates an applicant profile against all illustrative schemes and returns transparent, explainable outcomes:
 * Eligible, Not eligible, or Needs confirmation.
 */
export function evaluateAllSchemes(input: EligibilityApplicantInput): SchemeEvaluationResult[] {
  return ILLUSTRATIVE_SCHEMES.map((scheme) => evaluateSingleScheme(scheme, input));
}

export function evaluateSingleScheme(
  scheme: IllustrativeSchemeDefinition,
  input: EligibilityApplicantInput
): SchemeEvaluationResult {
  const criteriaChecked: CriterionEvaluation[] = [];

  // 1. Age check
  const ageMatched = input.age >= scheme.minAge;
  criteriaChecked.push({
    criterionId: 'age',
    label: 'Minimum Age Requirement',
    ruleDescription: `Applicant must be at least ${scheme.minAge} years old`,
    userValue: `${input.age} years old`,
    status: ageMatched ? 'matched' : 'not_matched',
    requiresOfficialConfirmation: true,
  });

  // 2. Household income check
  const incomeMatched = input.monthlyHouseholdIncomeINR <= scheme.maxMonthlyIncomeINR;
  criteriaChecked.push({
    criterionId: 'income',
    label: 'Household Monthly Income Ceiling',
    ruleDescription: `Monthly household income must be ₹${scheme.maxMonthlyIncomeINR.toLocaleString('en-IN')} or less`,
    userValue: `₹${input.monthlyHouseholdIncomeINR.toLocaleString('en-IN')} / month`,
    status: incomeMatched ? 'matched' : 'not_matched',
    requiresOfficialConfirmation: true,
  });

  // 3. Residency check
  const residencyDurationMatched = input.residencyYearsInState >= scheme.minResidencyYears;
  criteriaChecked.push({
    criterionId: 'residency',
    label: 'State Residency & Proof',
    ruleDescription: `At least ${scheme.minResidencyYears} years residency with verifiable residency document`,
    userValue: `${input.residencyYearsInState} years (${
      input.residencyDocumentAvailable ? 'Document available' : 'Residency document unconfirmed'
    })`,
    status: !residencyDurationMatched
      ? 'not_matched'
      : input.residencyDocumentAvailable
        ? 'matched'
        : 'missing_info',
    requiresOfficialConfirmation: true,
  });

  // 4. Disability benchmark check (if required by scheme)
  if (scheme.requiresDisabilityCertificate) {
    const meetsPct = input.disabilityPercentage >= scheme.minDisabilityPercentage;
    criteriaChecked.push({
      criterionId: 'disability',
      label: 'Certified Disability Benchmark',
      ruleDescription: `Requires medical board certificate showing ${scheme.minDisabilityPercentage}%+ disability`,
      userValue: `${input.disabilityPercentage}% (${
        input.hasDisabilityCertificate ? 'Certificate available' : 'Certificate needs renewal/confirmation'
      })`,
      status: !meetsPct
        ? 'not_matched'
        : input.hasDisabilityCertificate
          ? 'matched'
          : 'missing_info',
      requiresOfficialConfirmation: true,
    });
  }

  // 5. Widowhood check (if required by scheme)
  if (scheme.requiresWidowhood) {
    const isWidowed = input.maritalStatus === 'Widowed';
    criteriaChecked.push({
      criterionId: 'marital',
      label: 'Marital / Survivor Status',
      ruleDescription: 'Applicant must hold verified widow status',
      userValue: input.maritalStatus,
      status: isWidowed ? 'matched' : 'not_matched',
      requiresOfficialConfirmation: true,
    });
  }

  // 6. Concurrent pension rule
  if (!scheme.allowsConcurrentPension) {
    const noOtherPension = !input.receivesAnotherStatePension;
    criteriaChecked.push({
      criterionId: 'concurrent',
      label: 'Single Primary Pension Rule',
      ruleDescription: 'Cannot combine with another primary state pension scheme',
      userValue: input.receivesAnotherStatePension
        ? 'Already receives an approved state pension'
        : 'No other active state pension',
      status: noOtherPension ? 'matched' : 'not_matched',
      requiresOfficialConfirmation: true,
    });
  } else {
    criteriaChecked.push({
      criterionId: 'concurrent',
      label: 'Supplemental Benefit Compatibility',
      ruleDescription: 'Can be received alongside a primary senior citizen pension if certified',
      userValue: input.receivesAnotherStatePension
        ? 'Compatible with existing pension'
        : 'Eligible as standalone allowance',
      status: 'matched',
      requiresOfficialConfirmation: true,
    });
  }

  const matchedCriteria = criteriaChecked
    .filter((c) => c.status === 'matched')
    .map((c) => `${c.label}: ${c.userValue}`);
  const unmatchedCriteria = criteriaChecked
    .filter((c) => c.status === 'not_matched')
    .map((c) => `${c.label}: ${c.userValue} (${c.ruleDescription})`);
  const missingInformation = criteriaChecked
    .filter((c) => c.status === 'missing_info')
    .map((c) => `${c.label}: ${c.userValue}`);

  let outcome: EligibilityOutcome = 'Eligible';
  if (unmatchedCriteria.length > 0) {
    outcome = 'Not eligible';
  } else if (missingInformation.length > 0) {
    outcome = 'Needs confirmation';
  }

  const factsRequiringOfficialConfirmation = [
    'Official income certificate verification by Revenue Officer (Tahsildar)',
    'Cross-check against State Social Security Pension deduplication registry',
    ...(scheme.requiresDisabilityCertificate
      ? ['Valid SADAREM / UDID Medical Board assessment certificate validity date']
      : []),
  ];

  const recommendedNextStep =
    outcome === 'Eligible'
      ? 'Bring your existing sanction ID and supporting documents to the Citizen Service Centre to confirm official enrollment criteria.'
      : outcome === 'Needs confirmation'
        ? 'Gather or renew the missing supporting certificate listed above before submitting an official enquiry.'
        : 'Do not apply for this scheme right now, as one or more mandatory synthetic rules do not match; keep your existing approved benefit active.';

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    monthlyBenefitINR: scheme.monthlyBenefitINR,
    description: scheme.description,
    outcome,
    criteriaChecked,
    matchedCriteria,
    unmatchedCriteria,
    missingInformation,
    factsRequiringOfficialConfirmation,
    recommendedNextStep,
  };
}
