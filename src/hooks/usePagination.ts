import { useState } from 'react';
import { paginateItems } from '@/utils/pagination';

export function usePagination<T>(items: T[], resetKey = '', initialSize = 25) {
  const [state, setState] = useState({ page: 1, pageSize: initialSize, resetKey });
  if (state.resetKey !== resetKey) setState({ ...state, page: 1, resetKey });
  const result = paginateItems(items, state.resetKey === resetKey ? state.page : 1, state.pageSize);
  return {
    ...result,
    onPageChange: (page: number) => setState(current => ({ ...current, page, resetKey })),
    onPageSizeChange: (pageSize: number) => setState({ page: 1, pageSize, resetKey }),
  };
}