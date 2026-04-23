export type SignalType = "competitor" | "patent" | "market";
export type SignalStatus = "pending" | "analyzed" | "decided";
export type Verdict = "Build" | "Invest" | "Ignore";
export type PersonaKey = "innovator" | "traditionalist" | "analyst";
export type Stance =
  | "strongly_agree"
  | "agree"
  | "neutral"
  | "disagree"
  | "strongly_disagree";
export type FeedbackAction = "approve" | "reject" | "boost" | "deprioritize";

export interface Signal {
  id: string;
  type: SignalType;
  title: string;
  description: string;
  source: string;
  rawContent: string;
  tags: string[];
  relevanceScore: number | null;
  status: SignalStatus;
  createdAt: string;
  updatedAt: string;
  analysis?: Analysis | null;
  decision?: Decision | null;
  feedback?: UserFeedback[];
}

export interface Analysis {
  id: string;
  signalId: string;
  summary: string;
  keyInsights: string[];
  relevance: number;
  urgency: number;
  marketImpact: number;
  affectedProducts: string[];
  createdAt: string;
}

export interface Decision {
  id: string;
  signalId: string;
  verdict: Verdict;
  confidence: number;
  reasoning: string;
  productIdea: string | null;
  impactScore: number;
  impactBreakdown?: ImpactBreakdown | null;
  timeframe: string | null;
  createdAt: string;
  updatedAt: string;
  personas?: PersonaArgument[];
}

export interface PersonaArgument {
  id: string;
  decisionId: string;
  persona: PersonaKey;
  personaName: string;
  stance: Stance;
  argument: string;
  quote: string;
  createdAt: string;
}

export interface UserFeedback {
  id: string;
  signalId: string;
  action: FeedbackAction;
  importance: number | null;
  comment: string | null;
  createdAt: string;
}

export interface AnalysisResult {
  summary: string;
  keyInsights: string[];
  relevance: number;
  urgency: number;
  marketImpact: number;
  affectedProducts: string[];
}

export interface DecisionResult {
  verdict: Verdict;
  confidence: number;
  reasoning: string;
  productIdea: string | null;
  impactScore: number;
  impactBreakdown?: ImpactBreakdown | null;
  timeframe: string | null;
}

export interface PersonaResult {
  stance: Stance;
  argument: string;
  quote: string;
}

export interface ImpactDimension {
  score: number;
  rationale: string;
}

export interface ImpactBreakdown {
  marketReach:       ImpactDimension;
  revenueImpact:     ImpactDimension;
  competitiveThreat: ImpactDimension;
  timeSensitivity:   ImpactDimension;
}

export interface SignalDraft {
  type: SignalType;
  title: string;
  description: string;
  source: string;
  rawContent: string;
  tags: string[];
}
