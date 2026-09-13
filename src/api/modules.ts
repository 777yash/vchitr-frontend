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

// Public catalog metadata only; lessons, tests and results are never cached here.
let catalog: { data: SubModule[]; expires: number } | undefined;
let pendingCatalog: Promise<SubModule[]> | undefined;
export function getSubModules(): Promise<SubModule[]> {
  if (catalog && Date.now() < catalog.expires) return Promise.resolve(catalog.data);
  if (pendingCatalog) return pendingCatalog;
  pendingCatalog = api.get<SubModule[]>('/module/getSubModules/').then(({ data }) => {
    catalog = { data, expires: Date.now() + 30_000 };
    return data;
  }).finally(() => { pendingCatalog = undefined; });
  return pendingCatalog;
}

export function preloadSubjects(): void { void getSubModules().catch(() => {}); }
