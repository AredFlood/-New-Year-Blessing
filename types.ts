export interface Contact {
  id: string;
  name: string;
  relationship?: string;
  memories?: string;
  avatarColor?: string;
  generatedGreetings?: GeneratedGreetings;
  isBlessed?: boolean;
}

export interface GeneratedGreetings {
  formal: string;
  casual: string;
  creative: CreativeTemplate[];
}

export interface CreativeTemplate {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  IMPORT = 'IMPORT',
  MEMORY_INPUT = 'MEMORY_INPUT',
  PREVIEW = 'PREVIEW',
}

export enum GreetingType {
  FORMAL = 'formal',
  CASUAL = 'casual',
  CREATIVE = 'creative',
}