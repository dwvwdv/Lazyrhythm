import { pickVersion, pickVersionsBy } from './localize';
import { localizeProject } from '../page/works/works.component';
import { WebsiteProjectRow } from '../services/website-data.service';

describe('localize', () => {
  const zh = { slug: 'a', lang: 'zh-TW', title: '中文' };
  const en = { slug: 'a', lang: 'en', title: 'English' };
  const onlyZh = { slug: 'b', lang: 'zh-TW', title: '只有中文' };

  it('picks the version for the active language', () => {
    expect(pickVersion([zh, en], 'en')).toBe(en);
    expect(pickVersion([zh, en], 'zh-TW')).toBe(zh);
  });

  it('falls back to another language when no translation exists', () => {
    expect(pickVersion([onlyZh], 'en')).toBe(onlyZh);
    expect(pickVersion([], 'en')).toBeNull();
  });

  it('keeps one version per slug in the original order', () => {
    expect(pickVersionsBy([zh, onlyZh, en], item => item.slug, 'en')).toEqual([en, onlyZh]);
  });

  it('localizes projects and falls back to the English columns', () => {
    const row: WebsiteProjectRow = {
      slug: 'p',
      title: 'Project',
      description: 'English description',
      image_url: null,
      image_fit: 'cover',
      project_url: 'https://example.com',
      category: 'other',
      tags: ['Tool'],
      technologies: ['Angular'],
      featured: false,
      sort_order: 1,
      translations: { 'zh-TW': { description: '中文描述', tags: ['工具'] } }
    };

    const zhProject = localizeProject(row, 'zh-TW');
    expect(zhProject.title).toBe('Project');
    expect(zhProject.description).toBe('中文描述');
    expect(zhProject.tags).toEqual(['工具']);

    const enProject = localizeProject(row, 'en');
    expect(enProject.description).toBe('English description');
    expect(localizeProject({ ...row, translations: null }, 'zh-TW').tags).toEqual(['Tool']);
  });
});
