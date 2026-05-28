# MyWorkoutApp

## Présentation

MyWorkoutApp est une application mobile développée en React Native avec Expo.

Le projet a pour objectif de proposer un suivi d'entraînement simple et rapide pendant une séance de musculation. L'utilisateur peut créer une séance, ajouter des exercices, enregistrer des séries avec poids et répétitions, marquer les séries comme complétées, consulter l'historique des séances et suivre un objectif hebdomadaire de séances.

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
- objectif hebdomadaire de 3 séances avec progression ;
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

- `app/` : routes Expo Router et layouts de navigation.
- `app/(tabs)/index.tsx` : écran `Aujourd'hui`, création d'une séance, résumé de la dernière séance et affichage de l'objectif hebdomadaire.
- `app/(tabs)/history.tsx` : écran `Archives`, liste des séances enregistrées et statistiques simples.
- `app/session/[id].tsx` : détail d'une séance, affichage des exercices et ajout de séries.
- `src/components/` : composants réutilisables d'interface, par exemple les cartes de séance, les états vides et les boutons.
- `src/constants/Colors.ts` : couleurs partagées et styles d'ombre selon la plateforme.
- `src/context/DatabaseProvider.tsx` : provider SQLite placé à la racine de l'application.
- `src/db/migrations.ts` : initialisation de SQLite, `foreign_keys`, `journal_mode = WAL` et création des tables.
- `src/db/types.ts` : types TypeScript des séances, exercices, séries et progression hebdomadaire.
- `src/hooks/useCreateSession.ts` : création d'une séance avec transaction SQLite.
- `src/hooks/useSessions.ts` : chargement de l'historique, calcul des statistiques et calcul de l'objectif hebdomadaire.
- `src/hooks/useSessionDetails.ts` : chargement détaillé d'une séance avec ses exercices et ses séries.
- `src/hooks/useSessionMutations.ts` : ajout d'exercices, ajout de séries et mise à jour des séries complétées.

## Flux de données

### Création d'une séance

1. L'utilisateur remplit le formulaire sur l'écran `Aujourd'hui`.
2. `React Hook Form` récupère les valeurs du formulaire.
3. `Zod` valide les données avant enregistrement.
4. `useCreateSession` enregistre la séance et les exercices dans SQLite via une transaction.
5. L'application redirige ensuite vers `app/session/[id].tsx`.

### Chargement de l'historique et de l'objectif hebdomadaire

1. `useSessions` charge toutes les séances depuis SQLite.
2. Le hook calcule les statistiques simples affichées dans l'historique.
3. Le même hook calcule aussi l'objectif hebdomadaire en comptant les séances de la semaine en cours.
4. L'écran `Aujourd'hui` affiche la progression vers l'objectif de `3` séances.

### Détail d'une séance

1. L'identifiant de la séance est lu depuis la route dynamique.
2. `useSessionDetails` charge la séance, ses exercices et ses séries.
3. `useSessionMutations` permet d'ajouter un exercice, d'ajouter des séries et de marquer une série comme complétée.

## Vérification

Une vérification TypeScript peut être lancée avec :

```bash
npx tsc --noEmit
```

## Remise

Le dossier de remise est présent à la racine du projet au format PDF :

- `DOSSIER_REMISE.pdf`
