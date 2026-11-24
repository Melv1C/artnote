import { describe, expect, it } from 'vite-plus/test';
import type { ExpressionSpecification, LayerSpecification, StyleSpecification } from 'maplibre-gl';
import { withFrenchLabels } from './map-french';

// The label expression of OpenFreeMap's Positron and Fiord styles (2026-11)
const OPENFREEMAP_NAME: ExpressionSpecification = [
  'case',
  ['has', 'name:nonlatin'],
  ['concat', ['get', 'name:latin'], '\n', ['get', 'name:nonlatin']],
  ['coalesce', ['get', 'name_en'], ['get', 'name']],
];

const style = (layers: StyleSpecification['layers']): StyleSpecification => ({
  version: 8,
  sources: {},
  layers,
});

describe('withFrenchLabels', () => {
  it('labels places with their French name, else their local name', () => {
    const result = withFrenchLabels(
      style([
        {
          id: 'place_city',
          type: 'symbol',
          source: 'openmaptiles',
          layout: { 'text-field': OPENFREEMAP_NAME, 'text-size': 14 },
        },
      ]),
    );
    expect(result.layers[0]).toMatchObject({
      layout: {
        'text-field': ['coalesce', ['get', 'name:fr'], ['get', 'name']],
        'text-size': 14,
      },
    });
  });

  it('leaves labels that are not names, such as road numbers', () => {
    const road: LayerSpecification = {
      id: 'highway_shield',
      type: 'symbol',
      source: 'openmaptiles',
      layout: { 'text-field': ['to-string', ['get', 'ref']] },
    };
    expect(withFrenchLabels(style([road])).layers[0]).toEqual(road);
  });

  it('leaves layers without labels', () => {
    const water: LayerSpecification = { id: 'water', type: 'fill', source: 'openmaptiles' };
    expect(withFrenchLabels(style([water])).layers[0]).toEqual(water);
  });
});
