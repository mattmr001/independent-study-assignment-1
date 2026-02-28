// ABOUTME: Protocol domain types — static, reusable co-design configuration
// ABOUTME: Defines instruments, participant schemas, strategies, and result schemas

export interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect';
  options?: string[];
  required: boolean;
}

export interface Instrument {
  id: string;
  name: string;
  referenceItems: string[];
}

export interface StrategyDefinition {
  id: string;
  name: string;
  prompt: string;
}

export interface Protocol {
  id: string;
  name: string;
  description: string;
  instruments: Instrument[];
  participantSchema: FieldDefinition[];
  strategies: StrategyDefinition[];
}
