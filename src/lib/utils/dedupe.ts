export interface TopicSuggestion {
  direction: string;
  pain_point: string;
  growth_potential: string;
}

// 中文分词（简单实现）
function tokenize(text: string): Set<string> {
  // 移除标点符号
  const cleaned = text.replace(/[^\w\s\u4e00-\u9fa5]/g, '');
  // 简单分词：中文按字符，英文按空格
  const words = new Set<string>();

  for (const char of cleaned) {
    if (/[\u4e00-\u9fa5]/.test(char)) {
      words.add(char);
    }
  }

  const englishWords = cleaned.split(/\s+/).filter(w => w.length > 0);
  englishWords.forEach(w => words.add(w.toLowerCase()));

  return words;
}

// Jaccard相似度
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

export function isDuplicateTopic(
  newTopic: TopicSuggestion,
  existingTopics: TopicSuggestion[],
  threshold: number = 0.6
): TopicSuggestion | null {
  const newWords = tokenize(newTopic.direction);

  for (const existing of existingTopics) {
    const existingWords = tokenize(existing.direction);
    const similarity = jaccardSimilarity(newWords, existingWords);

    if (similarity >= threshold) {
      return existing;
    }
  }
  return null;
}

export function dedupeTopics(topics: TopicSuggestion[]): TopicSuggestion[] {
  const result: TopicSuggestion[] = [];
  const seen = new Set<string>();

  for (const topic of topics) {
    const key = topic.direction.toLowerCase().trim();
    if (!seen.has(key)) {
      const duplicate = isDuplicateTopic(topic, result);
      if (!duplicate) {
        result.push(topic);
        seen.add(key);
      }
    }
  }

  return result;
}
