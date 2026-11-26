import { describe, expect, it } from 'vite-plus/test';
import { biographyHtml } from './biography';

describe('biographyHtml', () => {
  it('keeps a biography already written as rich text', () => {
    expect(biographyHtml('<p>Peintre <strong>surréaliste</strong> belge.</p>')).toBe(
      '<p>Peintre <strong>surréaliste</strong> belge.</p>',
    );
  });

  it('turns each line of a biography typed as plain text into a paragraph', () => {
    expect(
      biographyHtml('Né à Lessines.\n\nMort à Bruxelles.\r\nPeintre & poète <surréaliste>.'),
    ).toBe(
      '<p>Né à Lessines.</p><p>Mort à Bruxelles.</p><p>Peintre &amp; poète &lt;surréaliste&gt;.</p>',
    );
  });

  it('is empty for an artist without a biography', () => {
    expect(biographyHtml(null)).toBe('');
  });
});
