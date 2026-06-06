import colors from './colors';

const categories = {
  electronics: { key: 'electronics', name: 'Electronique', emoji: '📱', color: colors.markers.electronics },
  vehicles:    { key: 'vehicles',    name: 'Vehicules',    emoji: '🚗', color: colors.markers.vehicles },
  furniture:   { key: 'furniture',   name: 'Meubles',      emoji: '🪑', color: colors.markers.furniture },
  sports:      { key: 'sports',      name: 'Sports',       emoji: '⚽', color: colors.markers.sports },
  clothing:    { key: 'clothing',    name: 'Vetements',    emoji: '👕', color: colors.markers.clothing },
  books:       { key: 'books',       name: 'Livres',       emoji: '▪', color: colors.markers.books },
  home:        { key: 'home',        name: 'Maison',       emoji: '🏠', color: colors.markers.home },
  other:       { key: 'other',       name: 'Autre',        emoji: '📦', color: colors.markers.other },
};

export default categories;
