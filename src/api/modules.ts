import { api } from './client';

export interface Module {
  module_id: string;
  module_name: string;
  module_description: string | null;
  created_at: string;
}

export interface SubModule {
  sub_module_id: string;
  sub_module_name: string;
  sub_module_description: string | null;
  created_at: string;
}

export function getModules(): Promise<Module[]> {
  return api.get<Module[]>('/module/getModules/').then((r) => r.data);
}

export function getSubModules(): Promise<SubModule[]> {
  return api.get<SubModule[]>('/module/getSubModules/').then((r) => r.data);
}
