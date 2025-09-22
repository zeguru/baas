// src/rules/friendly-dsl.ts
export interface FriendlyRule {
  when: any; // same structure as engine `conditions`
  then: {
    do: string;
    with: Record<string, any>;
  };
  priority?: number;
}

export interface EngineRule {
  conditions: any;
  event: {
    type: string;
    params: Record<string, any>;
  };
  priority?: number;
}

export interface FriendlyEvent {
  do: string;
  with: Record<string, any>;
}

export interface EngineEvent {
  type: string;
  params: Record<string, any>;
}