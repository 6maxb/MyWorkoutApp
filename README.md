# MyWorkoutApp

## Présentation

MyWorkoutApp est une application mobile développée en React Native avec Expo.

Le projet a pour objectif de proposer un suivi d'entraînement simple et rapide pendant une séance de musculation. L'utilisateur peut créer une séance, ajouter des exercices, enregistrer des séries avec poids et répétitions, marquer les séries comme complétées et consulter l'historique des séances.

## Stack utilisée

- React Native
- Expo
- TypeScript
- Expo Router
- SQLite avec expo-sqlite
- React Hook Form
- Zod
- Expo Haptics

## Fonctionnalités

- création d'une séance ;
- ajout d'une durée estimée ;
- ajout d'un commentaire ;
- ajout dynamique d'exercices ;
- ajout de séries avec poids et répétitions ;
- marquage des séries comme complétées ;
- retour haptique lors de la complétion ;
- historique des séances ;
- statistiques simples sur les séances ;
- gestion des états de chargement, d'erreur et de réessai.

## Lancement du projet

### Prérequis

- Node.js installé sur la machine ;
- npm installé ;
- Expo Go sur smartphone pour tester sur appareil réel ;
- ou un simulateur mobile si disponible.

### Installation

Depuis la racine du projet :

```bash
npm install
```

### Démarrage

```bash
npm start
```

### Lancement iOS

```bash
npm run ios
```

### Lancement Android

```bash
npm run android
```

### Lancement web

```bash
npm run web
```

## Test sur smartphone

1. Lancer `npm start`.
2. Vérifier que l'ordinateur et le smartphone sont connectés au même réseau Wi-Fi.
3. Ouvrir Expo Go sur le téléphone.
4. Scanner le QR code affiché dans le terminal.

Si la connexion au serveur de développement ne fonctionne pas, lancer Expo en tunnel :

```bash
node node_modules/expo/bin/cli start --tunnel
```

Si nécessaire, vider le cache :

```bash
node node_modules/expo/bin/cli start --clear --tunnel
```

## Configuration

Le projet ne nécessite pas de fichier `.env`, de clé API ou de variable d'environnement particulière.

Toutes les données sont stockées localement dans SQLite. Il n'y a donc pas de configuration serveur à prévoir.

## Architecture

- `app/` : routes Expo Router ;
- `app/(tabs)/` : écrans principaux Aujourd'hui et Archives ;
- `app/session/[id].tsx` : détail d'une séance ;
- `src/components/` : composants réutilisables ;
- `src/constants/` : constantes visuelles ;
- `src/context/` : provider SQLite ;
- `src/db/` : types et migrations SQLite ;
- `src/hooks/` : logique d'accès aux données.

## Vérification

Une vérification TypeScript peut être lancée avec :

```bash
npx tsc --noEmit
```

## Remise

Le dossier de remise est présent à la racine du projet :

- `DOSSIER_REMISE.md`
- `DOSSIER_REMISE.pdf`
