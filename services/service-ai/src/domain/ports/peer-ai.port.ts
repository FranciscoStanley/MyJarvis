export interface PeerConsultInput {
  peerId: string;
  question: string;
  context?: string;
}

export interface PeerConsultResult {
  peerId: string;
  model: string;
  answer: string;
  available: boolean;
}

export interface PeerAiPort {
  listPeers(): string[];
  consult(input: PeerConsultInput): Promise<PeerConsultResult>;
}

export const PEER_AI = Symbol('PEER_AI');
