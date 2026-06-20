export interface SynthesizeResult {
  audioBase64: string;
  format: string;
  clientSide?: boolean;
  text?: string;
  voice?: string;
  message?: string;
}

export interface VoicePort {
  transcribe(audioBase64: string, language?: string): Promise<{ text: string; confidence: number; language: string }>;
  synthesize(text: string, voice?: string): Promise<SynthesizeResult>;
}
export const VOICE_PORT = Symbol('VOICE_PORT');
