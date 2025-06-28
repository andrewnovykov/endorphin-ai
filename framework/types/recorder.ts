/**
 * Test recorder types
 */

import type { ToolParams } from './agent';

export interface RecorderSession {
  id: string;
  testId: string;
  commands: RecorderCommand[];
  startTime: Date;
  endTime?: Date;
}

export interface RecorderCommand {
  type: 'click' | 'fill' | 'navigate' | 'screenshot' | 'wait';
  params: ToolParams;
  timestamp: Date;
  description: string;
}
