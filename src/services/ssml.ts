/**
 * ssml.ts — Shared SSML utilities for Azure TTS.
 */

export function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Builds a complete SSML document for Azure TTS using a single voice.
 * Multilingual voices (like en-US-JennyMultilingualNeural) will automatically
 * handle language switching between Vietnamese and English naturally.
 */
export function buildSsml(text: string, voiceName: string): string {
  const escaped = escapeXml(text.trim());
  return (
    `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='vi-VN'>` +
    `<voice name='${voiceName}'>` +
    `<prosody rate='0.95'>${escaped}</prosody>` +
    `</voice>` +
    `</speak>`
  );
}
