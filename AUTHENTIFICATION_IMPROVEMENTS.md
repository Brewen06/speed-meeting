# Améliorations des Formulaires d'Authentification

## Résumé des changements

### 🎨 UI/UX Améliorée

Les formulaires d'authentification ont été complètement redesignés avec une interface moderne et cohérente :

- **Connexion Participant** : Design gradient avec couleurs vives (#ff8f6b, #4cc9a6)
- **Inscription Participant** : Palette légère et accessible (#93c5fd, #facc15)
- **Admin** : Design professionnel (#f97316, #38bdf8)

Chaque écran combine un formulaire compacte avec une section descriptive pour expliquer l'utilité de la page.

### 📋 Champs Formulaires

#### Participant - Connexion

- **Nom complet** (requis)
- **Email** (optionnel pour affiner la recherche)
- Pas de mot de passe (validation par nom reconnu en base de données)

#### Participant - Inscription

- **Nom complet** (requis)
- **Email** (requis pour l'inscription, optionnel pour la connexion)
- Pas de mot de passe

#### Admin - Connexion

- **Nom d'utilisateur** (requis)
- **Mot de passe** (requis)
- Utilise HTTP Basic Auth

### 🔐 Backend - Endpoints d'Authentification

#### 1. **POST `/api/participants/login`**

Permet la connexion d'un participant par nom complet + email optionnel

```json
{
  "nom_complet": "Clara Dupont",
  "email": "clara.dupont@email.com" // optionnel
}
```

Réponse :

```json
{
  "token": "participant:123",
  "participant": { ... }
}
```

#### 2. **POST `/api/auth/admin/login`**

Authentification admin avec Basic Auth

Headers requis:

```
Authorization: Basic base64(username:password)
```

Réponse :

```json
{
  "token": "admin",
  "role": "admin",
  "username": "admin"
}
```

#### 3. **POST `/api/participants/add`**

Création d'un nouveau participant (inscription)

```json
{
  "nom_complet": "Ines Martin",
  "email": "ines.martin@email.com"
}
```

### 🎯 Points Clés de Conception

1. **Pas de mot de passe pour les participants**
   - Les participants se connectent uniquement par leur nom complet
   - L'email est optionnel à la connexion mais requis à l'inscription
   - Cela simplifie le processus pour les invités

2. **Admin séparé**
   - Écran dédié pour l'administrateur
   - Utilise HTTP Basic Auth (sécurisé par le navigateur)
   - Accès via `/authentification/admin`

3. **Stockage des Tokens**
   - `localStorage.setItem("token", token)` pour l'authentification
   - `localStorage.setItem("participant", JSON.stringify(participant))` pour les données du participant
   - Permet de maintenir la session même après un rechargement

4. **Gestion d'Erreurs**
   - Messages clairs pour l'utilisateur
   - Réponses HTTP appropriées du backend (401 pour authentification échouée)
   - Feedback en temps réel (loading state, messages de succès/erreur)

### 🚀 Flux Utilisateur

**Nouveau Participant :**

1. Clique sur "Je m'inscris" depuis l'accueil
2. Entre son nom complet et email
3. Reçoit un message de confirmation
4. Se rend à la connexion
5. Entre son nom complet et email (optionnel)
6. Accède à son espace participant

**Admin :**

1. Clique sur "Admin" depuis l'accueil (ou depuis les formulaires)
2. Entre son username et password
3. Accède à l'interface d'administration
4. Peut importer les participants et lancer la session

### 📱 Navigation

- **Accueil** → Liens vers les trois authentifications
- **Header** → Affiche "Se connecter" ou "✓ Connecté" + bouton Admin visible

## Fichiers Modifiés

### Frontend

- `frontend/src/app/authentification/connexion/page.tsx` ✅
- `frontend/src/app/authentification/inscription/page.tsx` ✅
- `frontend/src/app/authentification/admin/page.tsx` ✅ (nouveau)
- `frontend/src/app/header.tsx` ✅
- `frontend/src/lib/api.ts` ✅ (nouveau)
- `frontend/src/app/interface-invite/mes-tables/page.tsx` ✅

### Backend

- `backend/api/auth.py` ✅ (ajout endpoint `/auth/admin/login`)
- `backend/api/participant.py` ✅ (ajout endpoint `/participants/login`)
- `backend/main.py` ✅ (ajout du router d'auth)

## Prochaines Étapes Recommandées

1. **Ajouter la persistance de session**
   - Implémenter la vérification des tokens à chaque navigation
   - Redirection automatique vers la connexion si token expiré

2. **Sécuriser les endpoints admin**
   - Ajouter `get_current_admin` aux endpoints sensibles du backend
   - Protéger l'import de participants

3. **Version mobile**
   - Adapter les formulaires pour les petits écrans
   - QR code scanner pour les participants

4. **Internationalisation**
   - Remplacer les textes en dur par des clés i18n
   - Support du français et anglais
