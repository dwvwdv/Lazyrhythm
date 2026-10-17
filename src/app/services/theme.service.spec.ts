import { ThemeService } from './theme.service';

describe('ThemeService prerender', () => {
  it('leaves the theme to the stylesheet without reading or writing browser preferences', () => {
    const read = spyOn(localStorage, 'getItem').and.callThrough();
    const write = spyOn(localStorage, 'setItem').and.callThrough();
    const serverDocument = document.implementation.createHTMLDocument('Prerender');
    const service = new ThemeService('server', serverDocument);

    expect(serverDocument.documentElement.hasAttribute('data-theme')).toBeFalse();
    service.toggleTheme();
    expect(serverDocument.documentElement.hasAttribute('data-theme')).toBeFalse();
    expect(read).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });
});
