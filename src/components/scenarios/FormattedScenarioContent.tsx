import React, { useMemo } from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

type ContentBlock =
  | { type: 'h3'; content: string }
  | { type: 'h4'; content: string }
  | { type: 'list'; items: string[] }
  | { type: 'p'; content: string };

function parseMarkdownBlocks(text: string): ContentBlock[] {
  if (!text) return [];
  const lines = text.split('\n');
  const blocks: ContentBlock[] = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({ type: 'list', items: [...currentList] });
      currentList = [];
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed.startsWith('- ')) {
      currentList.push(trimmed.replace(/^- \s*/, ''));
      continue;
    }

    flushList();

    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h3', content: trimmed.replace(/^# \s*/, '') });
    } else if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      blocks.push({ type: 'h4', content: trimmed.replace(/^###?\s*/, '') });
    } else {
      blocks.push({ type: 'p', content: trimmed });
    }
  }
  flushList();
  return blocks;
}

interface FormattedScenarioContentProps {
  text: string;
  colors: any;
}

export const FormattedScenarioContent = ({ text, colors }: FormattedScenarioContentProps) => {
  const blocks = useMemo(() => parseMarkdownBlocks(text), [text]);

  return (
    <View style={{ gap: 6 }}>
      {blocks.map((block, idx) => {
        if (block.type === 'h3' || block.type === 'h4') {
          return (
            <ThemedText key={`h-${idx}`} style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 4 }}>
              {block.content}
            </ThemedText>
          );
        }
        if (block.type === 'list') {
          return (
            <View key={`ul-${idx}`} style={{ gap: 4, paddingLeft: 4 }}>
              {block.items.map((item, itemIdx) => (
                <View key={`li-${idx}-${itemIdx}`} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                  <ThemedText style={{ fontSize: 13, color: colors.primary, fontWeight: '700' }}>•</ThemedText>
                  <ThemedText style={{ fontSize: 13, lineHeight: 19, color: colors.text, flex: 1 }}>{item}</ThemedText>
                </View>
              ))}
            </View>
          );
        }
        return (
          <ThemedText key={`p-${idx}`} style={{ fontSize: 13, lineHeight: 19, color: colors.text }}>
            {block.content}
          </ThemedText>
        );
      })}
    </View>
  );
};
