# Guide de Test - Authentification

## Prérequis

- Backend FastAPI démarré sur `http://localhost:8000`
- Frontend Next.js démarré sur `http://localhost:3000`
- Base de données SQLite disponible

## Test 1 : Inscription d'un Participant

### Étapes :

1. Aller à `http://localhost:3000/authentification/inscription`
2. Remplir le formulaire :
   - **Nom complet** : `Alice Dupont`
   - **Email** : `alice@example.com`
3. Cliquer sur « S'inscrire »

### Résultat attendu :

- Message de succès : « Inscription reussie. Vous pouvez maintenant vous connecter. »
- Les données sont sauvegardées dans la base de données

### Vérification Backend :

```bash
curl http://localhost:8000/api/participants
```

## Test 2 : Connexion d'un Participant

### Étapes :

1. Aller à `http://localhost:3000/authentification/connexion`
2. Remplir le formulaire :
   - **Nom complet** : `Alice Dupont`
   - **Email** : `alice@example.com` (optionnel)
3. Cliquer sur « Se connecter »

### Résultat attendu :

- Redirection vers `/interface-invite`
- Token stocké dans `localStorage.getItem("token")`
- Participant stocké dans `localStorage.getItem("participant")`

### Test sans Email :

- Le formulaire accepte une connexion sans email si le nom complet est suffisant

### Test avec Email Incorrect :

- Affiche : « Participant non reconnu »

## Test 3 : Connexion Admin

### Étapes :

1. Aller à `http://localhost:3000/authentification/admin`
2. Remplir le formulaire avec les identifiants définis dans `backend/api/auth.py` :
   - **Username** : `admin`
   - **Password** : `5Pid6M3f!nG`
3. Cliquer sur « Acceder »

### Résultat attendu :

- Redirection vers `/interface-admin`
- Token « admin » stocké dans `localStorage`
- Rôle « admin » stocké dans `localStorage`

### Tests d'Erreurs :

- **Mauvais mot de passe** : « Identifiants incorrects »
- **Mauvais username** : « Identifiants incorrects »

## Test 4 : Navigation

### Test depuis l'accueil :

1. Aller à `http://localhost:3000`
2. Vérifier les trois liens d'authentification :
   - « Interface Admin » → `/interface-admin` (protégé)
   - Linka vers `/authentification/connexion` depuis le header

### Test du Header :

- Non connecté : « Se connecter » + lien « Admin »
- Connecté comme participant : « ✓ Connecté »
- Connecté comme admin : « ✓ Connecté » (le bouton Admin disparaît)

## Test 5 : API Endpoints

### POST /api/participants/login

```bash
curl -X POST http://localhost:8000/api/participants/login \
  -H "Content-Type: application/json" \
  -d '{"nom_complet":"Alice Dupont","email":"alice@example.com"}'
```

Réponse attendue :

```json
{
  "token": "participant:1",
  "participant": {
    "id": 1,
    "nom_complet": "Alice Dupont",
    "email": "alice@example.com",
    ...
  }
}
```

### POST /api/auth/admin/login

```bash
curl -X POST http://localhost:8000/api/auth/admin/login \
  -H "Authorization: Basic YWRtaW46NVBpZDZNM2Yhbkc="
```

Réponse attendue :

```json
{
  "token": "admin",
  "role": "admin",
  "username": "admin"
}
```

### POST /api/participants/add

```bash
curl -X POST http://localhost:8000/api/participants/add \
  -H "Content-Type: application/json" \
  -d '{"nom_complet":"Bob Martin","email":"bob@example.com"}'
```

## Test 6 : Persistance de Session

### Étapes :

1. Se connecter comme participant
2. Ouvrir les DevTools (F12) → Application → LocalStorage
3. Vérifier que `token` et `participant` sont présents
4. Recharger la page (F5)
5. Vérifier que la connexion persiste

## Test 7 : Gestion d'Erreurs

### Participant invalide :

- **Nom complet** : `Personne Inexistante`
- **Email** : laissé vide
- Résultat : « Participant non reconnu »

### Email invalide :

- **Email** : `invalide@example.com` (n'existe pas pour ce participant)
- Résultat : « Participant non reconnu »

### Champ vide :

- **Nom complet** : laissé vide
- Résultat : Le bouton est désactivé (validation HTML5)

## Notes de Debug

**Logs du navigateur :**
Accédez à la console (F12 → Console) pour voir :

- Les erreurs fetch
- Les réponses de l'API
- L'état du localStorage

**Logs du backend :**
Le backend affiche tous les logs dans le terminal :

```
✅ Réponse: POST /api/participants/login | Status: 200
```

**Base de données :**
Consultez `speed_meeting.db` si vous utilisez SQLite pour vérifier les données stockées.
