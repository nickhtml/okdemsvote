export interface StateQuestionItem {
  id: string;
  number: string;
  referendum: string;
  topic: string;
  summary: string;
  fullText: string;
  question: string;
  recommendedVote: 'NO';
  recommendedLabel: string;
}

export interface JudicialRetentionJudge {
  id: string;
  name: string;
  court: string;
  divisionOrDistrict: string;
  question: string;
  recommendedVote: 'YES';
  recommendedLabel: string;
}

export interface JudicialCourtGroup {
  courtTitle: string;
  judges: JudicialRetentionJudge[];
}

export const STATE_QUESTIONS: StateQuestionItem[] = [
  {
    id: 'sq-845',
    number: 'STATE QUESTION NO. 845',
    referendum: 'LEGISLATIVE REFERENDUM NO. 378',
    topic: 'Judicial Nominating Commission Restructuring',
    summary:
      'Amends Article 7-B, Section 3 of the Oklahoma Constitution to dismantle the nonpartisan Judicial Nominating Commission (JNC). It removes restrictions on political party membership for gubernatorial appointees and allows partisan politicians to gain control over judicial appointments.',
    fullText:
      "This measure amends article 7-B, section 3 of the Oklahoma Constitution, changing the Judicial Nominating Commission's structure. Currently appointments are based on congressional districts as constituted in 1967. If approved, appointments to the fifteen-member Commission will be as follows: 1) Governor appoints six members, including one from each congressional district as of the time of their appointment; 2) the Oklahoma Bar Association appoints six members, including one from each congressional district as of the date of selection; and 3) no less than eight members select three at-large members. The measure will permit any number of the commissioners to be licensed attorneys in Oklahoma or another state. The prohibition against immediate family members from practicing law will be removed. The measure changes terms so that at-large commissioners would serve a two-year term, and all other commissioners would serve a six-year term. Additionally, it removes restrictions on political party membership for members appointed by the Governor and at-large members. The measure also permits a commissioner to succeed himself or herself. Vacancies will be filled in the same manner as a commissioner is appointed or selected for the remainder of the relevant term. This measure will not have a fiscal impact.",
    question: 'Shall the proposal be approved?',
    recommendedVote: 'NO',
    recommendedLabel: 'AGAINST THE PROPOSAL - NO'
  },
  {
    id: 'sq-847',
    number: 'STATE QUESTION NO. 847',
    referendum: 'LEGISLATIVE REFERENDUM NO. 381',
    topic: 'Property Tax Valuation & Senior Freeze Alterations',
    summary:
      'Amends Article 10, Sections 8B and 8C of the Oklahoma Constitution regarding property tax caps and the senior property tax freeze. Replaces the current stable property tax freeze for seniors age 65+ with a complex tiered scale tied to county median income, allowing property taxes to increase on many fixed-income seniors.',
    fullText:
      "This measure amends article 10, sections 8B and 8C of the Oklahoma Constitution. Currently, section 8B limits annual growth in fair cash value to 5% for most real property or 3% for homesteads and agricultural land. If approved, the measure would limit annual growth in fair cash value for tax year 2027 and after to 4% for most real property or 1.75% for homesteads and agricultural land. Currently, section 8C prohibits any increase in fair cash value of homestead property for persons age sixty-five (65) or older whose income does not exceed certain limits, sometimes referred to as the senior freeze. Instead of prohibiting any increase in fair cash value for these homesteads, there would be an annual limit of 1.75%. The measure eliminates the income cap on gross household income to qualify for the senior freeze. If approved, the annual limit on an increase in fair cash value would be tied to how much gross household income the homestead owner had in the preceding year. If a homeowner's gross household income from the previous year was at or below the median income for their county or area (as determined by the U.S. Department of Housing and Urban Development's estimated median income amount for the county or metropolitan statistical area), a homeowner's homestead fair cash value cannot be increased. If the income amount was in excess of certain thresholds, the limit on increases in fair cash value for homesteads owned by persons age 65 or older could be 0.35% (income over 100% up to 120%); 0.7% (income over 120% up to 140%); 1.05% (income over 140% up to 160%); 1.4% (income over 160% up to 180%); or 1.75% (income over 180%). If passed, this measure would have a fiscal impact on the state, but the exact impact is unknown.",
    question: 'Shall the proposal be approved?',
    recommendedVote: 'NO',
    recommendedLabel: 'AGAINST THE PROPOSAL - NO'
  }
];

export const JUDICIAL_RETENTION_GROUPS: JudicialCourtGroup[] = [
  {
    courtTitle: 'JUSTICES OF THE OKLAHOMA SUPREME COURT',
    judges: [
      {
        id: 'sc-1',
        name: 'M. JOHN KANE IV',
        court: 'Oklahoma Supreme Court',
        divisionOrDistrict: 'District 1',
        question: 'Shall M. JOHN KANE IV of the OKLAHOMA SUPREME COURT be retained in office?',
        recommendedVote: 'YES',
        recommendedLabel: 'YES (RETAIN)'
      },
      {
        id: 'sc-4',
        name: 'TRAVIS V. JETT',
        court: 'Oklahoma Supreme Court',
        divisionOrDistrict: 'District 4',
        question: 'Shall TRAVIS V. JETT of the OKLAHOMA SUPREME COURT be retained in office?',
        recommendedVote: 'YES',
        recommendedLabel: 'YES (RETAIN)'
      },
      {
        id: 'sc-6',
        name: 'DANA KUEHN',
        court: 'Oklahoma Supreme Court',
        divisionOrDistrict: 'District 6',
        question: 'Shall DANA KUEHN of the OKLAHOMA SUPREME COURT be retained in office?',
        recommendedVote: 'YES',
        recommendedLabel: 'YES (RETAIN)'
      },
      {
        id: 'sc-9',
        name: 'RICHARD B. DARBY',
        court: 'Oklahoma Supreme Court',
        divisionOrDistrict: 'District 9',
        question: 'Shall RICHARD B. DARBY of the OKLAHOMA SUPREME COURT be retained in office?',
        recommendedVote: 'YES',
        recommendedLabel: 'YES (RETAIN)'
      }
    ]
  },
  {
    courtTitle: 'JUDGES OF THE OKLAHOMA COURT OF CRIMINAL APPEALS',
    judges: [
      {
        id: 'cca-2',
        name: 'ROBERT L. HUDSON',
        court: 'Oklahoma Court of Criminal Appeals',
        divisionOrDistrict: 'District 2',
        question: 'Shall ROBERT L. HUDSON of the OKLAHOMA COURT OF CRIMINAL APPEALS be retained in office?',
        recommendedVote: 'YES',
        recommendedLabel: 'YES (RETAIN)'
      }
    ]
  },
  {
    courtTitle: 'JUDGES OF THE OKLAHOMA COURT OF CIVIL APPEALS',
    judges: [
      {
        id: 'co-1-1',
        name: 'STACIE L. HIXON',
        court: 'Oklahoma Court of Civil Appeals',
        divisionOrDistrict: 'District 1 - Office 1',
        question: 'Shall STACIE L. HIXON of the OKLAHOMA COURT OF CIVIL APPEALS be retained in office?',
        recommendedVote: 'YES',
        recommendedLabel: 'YES (RETAIN)'
      },
      {
        id: 'co-1-2',
        name: 'JANE P. WISEMAN',
        court: 'Oklahoma Court of Civil Appeals',
        divisionOrDistrict: 'District 1 - Office 2',
        question: 'Shall JANE P. WISEMAN of the OKLAHOMA COURT OF CIVIL APPEALS be retained in office?',
        recommendedVote: 'YES',
        recommendedLabel: 'YES (RETAIN)'
      },
      {
        id: 'co-2-1',
        name: 'DEBORAH B. BARNES',
        court: 'Oklahoma Court of Civil Appeals',
        divisionOrDistrict: 'District 2 - Office 1',
        question: 'Shall DEBORAH B. BARNES of the OKLAHOMA COURT OF CIVIL APPEALS be retained in office?',
        recommendedVote: 'YES',
        recommendedLabel: 'YES (RETAIN)'
      },
      {
        id: 'co-2-2',
        name: 'JAMES R. HUBER',
        court: 'Oklahoma Court of Civil Appeals',
        divisionOrDistrict: 'District 2 - Office 2',
        question: 'Shall JAMES R. HUBER of the OKLAHOMA COURT OF CIVIL APPEALS be retained in office?',
        recommendedVote: 'YES',
        recommendedLabel: 'YES (RETAIN)'
      }
    ]
  }
];
