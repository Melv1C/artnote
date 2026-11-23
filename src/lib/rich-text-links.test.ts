import { describe, expect, it } from 'vite-plus/test';
import { linkHref, shortenAddressLinks } from './rich-text-links';

describe('shortenAddressLinks', () => {
  it('shows a link whose text is its address as the site it points to', () => {
    const html =
      '<p>Maison des Géants, [<a target="_blank" href="https://maisondesgeants.lescollections.be/index.php/Detail/objects/286">https://maisondesgeants.lescollections.be/index.php/Detail/objects/286</a>].</p>';
    expect(shortenAddressLinks(html)).toBe(
      '<p>Maison des Géants, [<a target="_blank" href="https://maisondesgeants.lescollections.be/index.php/Detail/objects/286">maisondesgeants.lescollections.be</a>].</p>',
    );
  });

  it('drops the www of the site', () => {
    expect(
      shortenAddressLinks(
        '<a href="https://www.kikirpa.be/fr/x?a=1&amp;b=2">https://www.kikirpa.be/fr/x?a=1&amp;b=2</a>',
      ),
    ).toBe('<a href="https://www.kikirpa.be/fr/x?a=1&amp;b=2">kikirpa.be</a>');
  });

  it('keeps the words a writer chose for a link', () => {
    const html = '<a href="https://www.fine-arts-museum.be">site du musée</a>';
    expect(shortenAddressLinks(html)).toBe(html);
  });

  it('keeps a link whose address cannot be read', () => {
    const html = '<a href="not a url">https://broken</a>';
    expect(shortenAddressLinks(html)).toBe(html);
  });
});

describe('linkHref', () => {
  it('opens an address typed without its protocol over https', () => {
    expect(linkHref('  kikirpa.be/fr ')).toBe('https://kikirpa.be/fr');
  });

  it('keeps a web or mail address as written', () => {
    expect(linkHref('http://www.fine-arts-museum.be')).toBe('http://www.fine-arts-museum.be');
    expect(linkHref('mailto:info@kikirpa.be')).toBe('mailto:info@kikirpa.be');
  });

  it('refuses an empty address or one that would run code', () => {
    expect(linkHref('   ')).toBeNull();
    expect(linkHref('javascript:alert(1)')).toBeNull();
    expect(linkHref('data:text/html,<script>alert(1)</script>')).toBeNull();
  });
});
