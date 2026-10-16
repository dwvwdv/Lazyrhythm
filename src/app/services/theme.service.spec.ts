import { ThemeService } from './theme.service';

describe('ThemeService prerender', () => {
  it('renders a deterministic theme without reading or writing browser preferences', () => {
    const read = spyOn(localStorage, 'getItem').and.callThrough();
    const write = spyOn(localStorage, 'setItem').and.callThrough();
    const serverDocument = document.implementation.createHTMLDocument('Prerender');
    const service = new ThemeService('server', serverDocument);

    expect(serverDocument.documentElement.getAttribute('data-theme')).toBe('light');
    service.toggleTheme();
    expect(serverDocument.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(read).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });
});
