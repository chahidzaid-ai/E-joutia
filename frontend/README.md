# E-Joutia - Frontend Mobile

Application mobile React Native pour E-Joutia, une marketplace de proximite avec carte interactive.

## Fonctionnalites

- Carte interactive avec react-native-maps
- Marqueurs personnalises par categorie (couleurs et icones)
- Position utilisateur avec point bleu
- Centrage automatique sur la position
- Modale de previsualisation rapide (photo, titre, prix, distance)
- Calcul de distance avec formule Haversine

## Installation

```bash
npm install
```

## Lancement

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

## Structure

```
frontend/
├── package.json
├── app.json
├── babel.config.js
├── index.js
├── App.js
├── screens/
│   └── MapScreen.js
├── components/
│   ├── ListingMarker.js
│   └── QuickPreviewModal.js
├── utils/
│   └── location.js
└── constants/
    ├── colors.js
    └── categories.js
```

## API Backend

L'application se connecte au backend Django sur `http://localhost:8000/api/listings/`.

Parametres de requete:
- `user_lat` - Latitude de l'utilisateur
- `user_lon` - Longitude de l'utilisateur
