/** JSON contract v1; importing these types requires no runtime dependency. */
export type AnimationBehavior = 'idle' | 'read' | 'write' | 'listen' | 'speak' | 'think' | 'search' | 'analyse' | 'compare' | 'contact' | 'summon' | 'report';
export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';
export type AvatarEmotion = 'neutral' | 'happy' | 'curious' | 'concerned' | 'sad' | 'angry' | 'surprised';
export type Focus = [number, number];
export interface AnimationProfile {
  label: string;
  behavior: AnimationBehavior;
  state: AvatarState;
  activity: 'none' | 'planning' | 'searching' | 'analysing' | 'reporting';
  focus: Focus;
  duration: number;
  tempo: number;
  intensity: number;
  travel: number;
  tilt: number;
  lean: number;
  pulse: number;
  radiance: number;
}
export interface AnimationConfiguration {
  version: 1;
  profiles: Record<string, Partial<AnimationProfile> & { extends?: string }>;
  tools?: Record<string, string>;
}
export interface ActionOptions {
  id?: string;
  priority?: number;
  focus?: Focus;
  agentCount?: number;
  tool?: string;
  record?: string;
  duration?: number | null;
}
export interface AudioSignals {
  outputVoiceLevel?: number;
  inputMicLevel?: number;
  frequencyBands?: number[];
  inputFrequencyBands?: number[];
  glitchIntensity?: number;
}
export interface ActionAPI {
  start(name: string, options?: ActionOptions): string;
  play(name: string, options?: ActionOptions): string;
  finish(id: string): boolean;
  cancel(id: string): boolean;
  stopAll(): void;
  snapshot(): { active: string | null; id: string | null; pending: { id: string; name: string; tool: string }[] };
}
export interface AnimationLibraryAPI {
  get(id: string): AnimationProfile;
  list(): (AnimationProfile & { id: string })[];
  configure(id: string, patch: Partial<AnimationProfile> & { extends?: string }): AnimationProfile;
  bindTools(mapping: Record<string, string>): void;
  resolveTool(tool: string): string;
  export(): AnimationConfiguration;
  import(configuration: AnimationConfiguration | string): AnimationConfiguration;
  reset(id?: string): void;
}
interface EventBase { version: 1 }
interface StartOptions { focus?: Focus; agentCount?: number; priority?: number }
export type AgentEvent =
  | (EventBase & StartOptions & { type: 'action.start'; id: string; animation: string })
  | (EventBase & StartOptions & { type: 'tool.start'; id: string; tool: string })
  | (EventBase & StartOptions & { type: 'subagent.start'; id: string })
  | (EventBase & StartOptions & { type: 'speech.start' | 'listening.start'; id?: string })
  | (EventBase & { type: 'action.end' | 'action.cancel' | 'tool.end' | 'tool.error' | 'subagent.end' | 'subagent.error'; id: string })
  | (EventBase & { type: 'speech.end' | 'listening.end'; id?: string })
  | (EventBase & { type: 'signals'; signals: AudioSignals })
  | (EventBase & { type: 'emotion'; emotion: AvatarEmotion; intensity?: number })
  | (EventBase & { type: 'reset' });
