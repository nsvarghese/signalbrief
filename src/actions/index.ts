import type { ActionHandler } from 'deepspace/worker'
import type { Env } from '../../worker'
import { research, synthesize } from './briefs'
export const actions: Record<string, ActionHandler<Env>> = { research, synthesize }
