export interface VoicePort {
  transcribe(audioBase64: string, language?: string): Promise<{ text: string; confidence: number; language: string }>;
  synthesize(text: string, voice?: string): Promise<{ audioBase64: string; format: string }>;
}
export const VOICE_PORT = Symbol('VOICE_PORT');
