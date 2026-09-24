import { Phase, JDLine } from '../types';

export const jdLines: JDLine[] = [
  { id: 'R1', text: 'Break complex marketing problems into structured hypotheses and research plans', type: 'Responsibility' },
  { id: 'R2', text: 'Conduct deep trend, search intent & cultural analysis for the Bangladeshi market', type: 'Responsibility' },
  { id: 'R3', text: 'Perform competitor gap analysis to identify untapped opportunities', type: 'Responsibility' },
  { id: 'R4', text: 'Support A/B testing and document "Failure Reports" & "Success Frameworks"', type: 'Responsibility' },
  { id: 'R5', text: 'Convert messy data into clear, leadership-ready insights', type: 'Responsibility' },
  { id: 'C1', text: 'Strong structured thinking', type: 'Competency' },
  { id: 'C2', text: 'Advanced Excel/Google Sheets', type: 'Competency' },
  { id: 'C3', text: 'Ability to interpret GA4 & Meta Analytics', type: 'Competency' },
  { id: 'C4', text: 'Excellent communication skills', type: 'Competency' },
  { id: 'C5', text: 'Comfortable using AI tools for research', type: 'Competency' },
];

export const phases: Phase[] = [
  {
    id: 'phase_1',
    number: 1,
    title: 'Problem Framing & First-Principles Thinking',
    course: 'Problem Solving Skills and Critical Thinking (Wiley Skills Network)',
    modules: [
      'Mod 2: Define the Problem — SMART problem statements, KPIs, explicit scope',
      'Mod 3: Problem Disaggregation & Prioritization — MECE logic trees, hypothesis trees',
      'Mod 4: Build a Great Workplan & Team Processes',
      'Mod 5: Conduct Analyses — question-based problem solving'
    ],
    application: 'Take a vague brief (e.g., "why did category conversion drop last month?") and decompose it from first principles: revenue = traffic × conversion rate × average order value. Turn each branch into a testable hypothesis.',
    jdLinesServed: ['R1', 'C1'],
    deliverable: 'One-page research plan: issue tree, ranked hypotheses, data source and method per branch, and the result that would change the decision.',
    workbenchId: '1',
    hoursMin: 5.5, hoursMax: 5.5
  },
  {
    id: 'phase_2',
    number: 2,
    title: 'AI-Assisted Research Workflow',
    course: 'Google AI Essentials',
    modules: [
      'Course 3: Discover the Art of Prompting — clear, specific prompts; few-shot prompting',
      'Course 4: Use AI Responsibly — bias, inaccuracy, privacy and security risks'
    ],
    application: 'Use AI to speed up desk research — landscape scans, question trees, summarising long sources — but treat every output as unverified until traced to a primary source.',
    jdLinesServed: ['C5'],
    deliverable: 'Verification log: 10 AI-generated claims about the Bangladeshi book market, each traced to a primary source and marked confirmed or unsupported.',
    workbenchId: '2',
    hoursMin: 2, hoursMax: 2
  },
  {
    id: 'phase_3',
    number: 3,
    title: 'Data Ingestion, Cleaning & Aggregation',
    course: 'Excel Skills for Data Analytics & Visualization + Google Sheets',
    modules: [
      'DA&V C1, Mod 1/4/5: Cleaning Text, Tables, Logical & Lookup Functions',
      'ESB C2, Mod 6: Pivot Tables, Charts & Slicers',
      'Google Sheets: QUERY, ARRAYFORMULA and IMPORTRANGE'
    ],
    application: 'Strip and normalise UTM parameters and campaign names from Meta Ads and GA4 exports into a table-driven intake sheet, pivot it by channel, and keep a Google Sheets twin.',
    jdLinesServed: ['C2', 'R5'],
    deliverable: 'Entry diagnostic + a refreshable intake → pivot → summary in both tools, with a data-dictionary tab.',
    workbenchId: '3',
    hoursMin: 16, hoursMax: 16
  },
  {
    id: 'phase_4',
    number: 4,
    title: 'Measurement Platforms — GA4 & Meta Analytics',
    course: 'Google Analytics Academy + Meta Blueprint',
    modules: [
      'GA 101/102/201: Manage GA data, reports, dive deeper',
      'Meta Blueprint: measuring success, key metrics in Ads Manager, Meta Pixel and Conversions API'
    ],
    application: 'Learn what each number means (GA4 sessions vs Ads Manager results) and why platforms never reconcile exactly (attribution rules). Read one real funnel end to end.',
    jdLinesServed: ['C3'],
    deliverable: 'Metric definition sheet (15 metrics) + one-week reconciliation note comparing GA4 sessions with Meta link clicks.',
    workbenchId: '4',
    hoursMin: 15, hoursMax: 18
  },
  {
    id: 'phase_5',
    number: 5,
    title: 'Trend, Search-Intent & Cultural Analysis',
    course: 'Google SEO Fundamentals + Google Trends / Search Console',
    modules: [
      'Google Trends: seasonality and momentum',
      'Search Console: queries, clicks, CTR',
      'SEO Fundamentals Mod 4: keyword research, intent mapping',
      'DataReportal & Culture: local market contexts (e.g., Ekushey Book Fair, Ramadan)'
    ],
    application: 'Build a Bangladesh demand calendar and an intent-tagged query map for Rokomari\'s main categories. Test hypotheses against actual date shifts (e.g., Book fair in Ramadan).',
    jdLinesServed: ['R2'],
    deliverable: '3-page Bangladesh Trend & Intent Brief: demand calendar, intent map of 50+ queries, three cultural drivers with evidence.',
    workbenchId: '5',
    hoursMin: 4.5, hoursMax: 6
  },
  {
    id: 'phase_6',
    number: 6,
    title: 'Competitor Gap Analysis',
    course: 'Business Strategy: Creating Competitive Advantage (IBM) + Meta Ad Library',
    modules: [
      'IBM Mod 1-2: SWOT, PESTEL, Porter\'s Five Forces, Blue Ocean strategy canvas',
      'Meta Ad Library: active competitor ads',
      'Strategy Canvas & ERRC grid'
    ],
    application: 'Score competitors (Wafilife, Daraz, etc.) on range, price, delivery, trust. Plot value curves, list gaps as hypotheses, rank by impact/effort.',
    jdLinesServed: ['R3'],
    deliverable: 'Competitor gap matrix + ranked opportunity list with testable hypotheses.',
    workbenchId: '6',
    hoursMin: 6, hoursMax: 6
  },
  {
    id: 'phase_7',
    number: 7,
    title: 'Experimentation — A/B Test Design, Evaluation',
    course: 'A/B Testing (Udacity) + Excel Regression',
    modules: [
      'Udacity Lesson 3-5: Metrics, Designing Experiments, Analyzing Results',
      'Excel Regression Models for Business Forecasting'
    ],
    application: 'Design before you run: hypothesis, primary metric, guardrail metrics, MDE, sample size. Write every test up blamelessly.',
    jdLinesServed: ['R4'],
    deliverable: 'Reusable Test Plan and Test Report templates + one retrospective write-up of a past campaign.',
    workbenchId: '7',
    hoursMin: 18, hoursMax: 19
  },
  {
    id: 'phase_8',
    number: 8,
    title: 'Insight Synthesis & Leadership Communication',
    course: 'Data Visualization in Excel + Problem Solving Mod 7',
    modules: [
      'DA&V C2, Mod 2-5: Charting techniques, custom interactive dashboards',
      'Problem Solving Mod 7: Synthesize Results & Tell a Great Story (pyramid structure)'
    ],
    application: 'Turn Phase 3–7 outputs into a one-page leadership brief: answer first, three findings, decision requested, confidence.',
    jdLinesServed: ['R5', 'C4'],
    deliverable: 'One-page leadership brief + 5-minute readout deck/script; searchable Failure/Success library index.',
    workbenchId: '8',
    hoursMin: 20, hoursMax: 20
  }
];
