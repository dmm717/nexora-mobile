import { useMemo } from 'react';

export type FilterType = 'all' | 'active' | 'completed';

export function useFilteredInterviewHistory(rawData: any, filter: FilterType, page: number) {
  return useMemo(() => {
    const isItemCompleted = (item: any) =>
      item.status === 'completed' || Boolean(item.reportAvailable);

    const allItems = [...(rawData?.items ?? [])].sort((a, b) => {
      const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    const activeItems = allItems.filter((item) => !isItemCompleted(item));
    const completedItems = allItems.filter((item) => isItemCompleted(item));

    const totalCountAll = allItems.length;
    const totalCountActive = activeItems.length;
    const totalCountCompleted = completedItems.length;

    const filteredList =
      filter === 'active'
        ? activeItems
        : filter === 'completed'
        ? completedItems
        : allItems;

    const PAGE_SIZE = 10;
    const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
    const paginatedItems = filteredList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const hasNextPage = page < totalPages;

    return {
      totalCountAll,
      totalCountActive,
      totalCountCompleted,
      totalPages,
      paginatedItems,
      hasNextPage,
    };
  }, [rawData, filter, page]);
}
