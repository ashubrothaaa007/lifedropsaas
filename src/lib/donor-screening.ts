export const screeningQuestions = [
  { key: 'ageConfirmed', title: 'Minimum age', statement: 'I am at least 18 years old.', detail: 'Hospital staff will verify the applicable age criteria.' },
  { key: 'weightConfirmed', title: 'Minimum weight', statement: 'I weigh at least 45 kg.', detail: 'The blood centre may require a higher weight for the collection volume.' },
  { key: 'intervalConfirmed', title: 'Donation interval', statement: 'The required interval has passed, or this is my first donation.', detail: 'General Indian whole-blood guidance: at least 90 days for men and 120 days for women. Staff confirm the interval for your donation type.' },
  { key: 'currentlyUnwell', title: 'Current health', statement: 'I currently have an illness or fever.', detail: 'Check if this applies. Discuss symptoms with hospital staff before travelling.' },
  { key: 'disclosureAcknowledged', title: 'Medication & medical history', statement: 'I will disclose recent medication and my medical history to hospital staff.', detail: 'Include treatments and relevant health changes; do not stop medication to donate.' },
  { key: 'recentAlcohol', title: 'Alcohol declaration', statement: 'I have consumed alcohol recently.', detail: 'Check if this applies. Tell hospital staff when and how much; they will advise you.' },
] as const

export type ScreeningAnswers = Record<(typeof screeningQuestions)[number]['key'], boolean>
export type ScreeningStatus = 'submitted' | 'discussion-needed'
export type ScreeningRecord = { id: string; answers: ScreeningAnswers; status: ScreeningStatus; createdAt: string }
export const emptyScreening: ScreeningAnswers = {
  ageConfirmed: false, weightConfirmed: false, intervalConfirmed: false,
  currentlyUnwell: false, disclosureAcknowledged: false, recentAlcohol: false,
}

export function parseScreeningAnswers(input: Record<string, unknown>): ScreeningAnswers {
  const answers = { ...emptyScreening }
  for (const { key } of screeningQuestions) {
    if (typeof input[key] !== 'boolean') throw new Error('Please answer every screening statement.')
    answers[key] = input[key]
  }
  return answers
}

// This flags discussion topics only. It cannot establish medical eligibility.
export function screeningStatus(answers: ScreeningAnswers): ScreeningStatus {
  return answers.ageConfirmed && answers.weightConfirmed && answers.intervalConfirmed &&
    answers.disclosureAcknowledged && !answers.currentlyUnwell && !answers.recentAlcohol
    ? 'submitted' : 'discussion-needed'
}
