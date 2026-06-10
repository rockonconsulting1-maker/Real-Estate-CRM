import { Opportunity } from '@/types';

export function mapOpportunity(raw: any): Opportunity {
  return {
    id: raw.id,
    name: raw.name || '',
    pipelineId: raw.pipelineId || '',
    pipelineStageId: raw.pipelineStageId || '',
    status: raw.status || 'open',
    monetaryValue: raw.monetaryValue || 0,
    contactId: raw.contactId || '',
  };
}

export function stageById(stageId: string, pipelineStages: any[]) {
  return pipelineStages.find(s => s.id === stageId);
}
