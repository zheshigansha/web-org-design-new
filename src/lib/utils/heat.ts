import type { Content, HeatMetric } from '@/lib/db/schema';

export function calculateHeatScore(
  content: Pick<Content, 'likes' | 'reads' | 'interactions'>,
  metric: HeatMetric
): number {
  switch (metric) {
    case 'likes':
      return content.likes;
    case 'reads':
      return content.reads;
    case 'interactions':
      return content.interactions;
    case 'composite':
      // 归一化后加权计算
      const likesScore = Math.log10(content.likes + 1) * 2;
      const readsScore = Math.log10(content.reads + 1) * 1;
      const interactionScore = Math.log10(content.interactions + 1) * 3;
      return likesScore + readsScore + interactionScore;
    default:
      return 0;
  }
}

export function sortByHeat<T extends Pick<Content, 'likes' | 'reads' | 'interactions'>>(
  items: T[],
  metric: HeatMetric
): T[] {
  return [...items].sort((a, b) => {
    const scoreA = calculateHeatScore(a, metric);
    const scoreB = calculateHeatScore(b, metric);
    return scoreB - scoreA;
  });
}
