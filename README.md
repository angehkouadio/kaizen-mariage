# Kaizen du Mariage — GitHub + Vercel

## Déploiement
1. Dépose tous les fichiers de ce dossier dans un dépôt GitHub.
2. Importe le dépôt dans Vercel.
3. Le projet est statique : aucun build n'est nécessaire.

## Sauvegarde locale
L'application fonctionne immédiatement avec `localStorage`.

## Sauvegarde en ligne avec Supabase
1. Crée un projet Supabase.
2. Dans SQL Editor, exécute `schema.sql`.
3. Active l'authentification souhaitée dans Supabase Auth.
4. Ouvre `supabase-config.js`.
5. Renseigne l'URL du projet et la clé `anon` / `publishable`.
6. Ne mets jamais une clé `service_role` dans GitHub ou dans le navigateur.

Le fichier `supabase.js` est déjà préparé pour lire et enregistrer l'état du parcours
dans `kaizen_marriage_state` pour l'utilisateur connecté.

## PWA / téléphone
- `manifest.json`
- `service-worker.js`
- icônes 192x192 et 512x512
- navigation mobile en bas de l'écran

## Connexion utilisateur
La page d’accueil contient maintenant la création de compte, la connexion et la déconnexion via Supabase Auth (email + mot de passe).
