import type { ExpressionSpecification, LayerSpecification, StyleSpecification } from 'maplibre-gl';

/** MapLibre's own words in French: the map region's accessible name, its marker and popup labels. */
export const MAPLIBRE_FRENCH_LOCALE = {
  'AttributionControl.ToggleAttribution': 'Afficher ou masquer les crédits',
  'AttributionControl.MapFeedback': 'Signaler une erreur sur la carte',
  'Map.Title': 'Carte',
  'Marker.Title': 'Repère',
  'Popup.Close': 'Fermer',
};

/** A label in French where the tiles have a French name (Gand, Anvers), else the local name. */
const FRENCH_NAME: ExpressionSpecification = ['coalesce', ['get', 'name:fr'], ['get', 'name']];

const readsName = (expression: unknown): boolean =>
  Array.isArray(expression)
    ? expression[0] === 'get' && typeof expression[1] === 'string'
      ? expression[1].startsWith('name')
      : expression.some(readsName)
    : false;

/**
 * The style with every place and street name in French when available. OpenFreeMap's styles
 * label in English (Ghent, Antwerp); labels that are not names, such as road numbers, stay.
 */
export function withFrenchLabels(style: StyleSpecification): StyleSpecification {
  return {
    ...style,
    layers: style.layers.map((layer): LayerSpecification =>
      layer.type === 'symbol' && readsName(layer.layout?.['text-field'])
        ? { ...layer, layout: { ...layer.layout, 'text-field': FRENCH_NAME } }
        : layer,
    ),
  };
}
