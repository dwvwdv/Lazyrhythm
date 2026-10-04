import { parseTags, slugify } from './article-editor.component';

describe('article editor helpers', () => {
  it('slugifies latin titles', () => {
    expect(slugify('  Hello, Godot 4.3 Devlog!  ')).toBe('hello-godot-4-3-devlog');
    expect(slugify('Café déjà vu')).toBe('cafe-deja-vu');
  });

  it('returns an empty slug for titles without latin characters', () => {
    expect(slugify('團隊近況')).toBe('');
  });

  it('parses comma separated tags', () => {
    expect(parseTags('godot, #devlog，更新、godot, ')).toEqual(['godot', 'devlog', '更新']);
  });
});
