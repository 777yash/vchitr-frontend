import { useEffect, useState } from 'react';
import { api, extractApiError } from './client';
import type { SubjectPreference } from '../learning/course';

// No material or result cache: each resource opening requests the backend.
export function useLearningResource<T>(path: string) {
  const [revision, setRevision] = useState(0);
  const requestKey = path + ':' + revision;
  const [state, setState] = useState<{ key: string; data?: T; error?: string }>({ key: '' });
  useEffect(() => {
    const controller = new AbortController();
    api.get<T>('/learning' + path, { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setState({ key: requestKey, data }); })
      .catch((err) => { if (!controller.signal.aborted) setState({ key: requestKey, error: extractApiError(err) }); });
    return () => controller.abort();
  }, [path, requestKey]);
  return { data: state.key === requestKey ? state.data : undefined,
    error: state.key === requestKey ? state.error : undefined,
    reload: () => setRevision((value) => value + 1) };
}

export async function saveLearningLevel(subjectId: string, level: string) {
  const { data } = await api.put<SubjectPreference>('/learning/subjects/' + subjectId + '/level', { level });
  return data;
}
