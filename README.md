# 🏆 Championnat Tally Carreaux

Plateforme moderne de gestion d'un championnat de football entre deux équipes — **Équipe Tally** vs **Équipe Carreaux** — au **Terrain Diéxal**.

Historique complet des matchs, statistiques automatiques des joueurs et des équipes, classements, records, confrontations, graphiques interactifs, galerie et actualités.

## Stack technique

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** — design system, mode clair/sombre
- **Framer Motion** — animations (via classes Tailwind + transitions)
- **Lucide React** — icônes
- **Recharts** — graphiques interactifs
- **Supabase** — PostgreSQL, Auth, Storage, Realtime, RLS
- **Vercel** — hébergement

---

## 1. Installation en local

### Prérequis
- Node.js 20+
- Un compte [Supabase](https://supabase.com) (gratuit)
- Un compte [Vercel](https://vercel.com) (gratuit, pour le déploiement)

### Étapes

```bash
# 1. Extraire le projet et installer les dépendances
cd tally-carreaux
npm install

# 2. Copier le fichier d'environnement
cp .env.local.example .env.local
```

---

## 2. Configuration de Supabase

### a) Créer le projet
1. Va sur [supabase.com](https://supabase.com) → **New Project**
2. Choisis un nom (ex: `tally-carreaux`), un mot de passe DB, une région proche.
3. Attends la fin du provisionnement (~2 min).

### b) Récupérer les clés API
Dans **Project Settings → API** :
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (à garder secrète, jamais exposée au client)

Colle ces valeurs dans `.env.local`.

### c) Exécuter les migrations SQL
Dans le dashboard Supabase → **SQL Editor** → **New query**, exécute **dans l'ordre** :

1. `supabase/migrations/0001_init.sql` — tables, vues de statistiques, RLS, données initiales (les 2 équipes)
2. `supabase/migrations/0002_storage.sql` — buckets de stockage (logos, photos joueurs, galerie, actualités) et leurs policies

> 💡 Alternative en ligne de commande avec la Supabase CLI :
> ```bash
> npm install -g supabase
> supabase login
> supabase link --project-ref <votre-project-ref>
> supabase db push
> ```

### d) Créer le compte administrateur
1. Dans Supabase → **Authentication → Users → Add user**, crée un utilisateur avec email/mot de passe.
2. Un `profile` est automatiquement créé (rôle `visiteur` par défaut, via trigger).
3. Passe-le en admin via **SQL Editor** :
   ```sql
   update public.profiles set role = 'admin' where email = 'ton-email@exemple.com';
   ```
4. Connecte-toi ensuite sur `/login` avec ces identifiants pour accéder à `/admin`.

### e) Activer Realtime (optionnel, déjà inclus dans la migration)
Les tables `matches`, `goals`, `sanctions`, `news` sont déjà ajoutées à la publication `supabase_realtime`, ce qui permet de brancher des abonnements temps réel côté client si tu veux pousser plus loin les mises à jour automatiques (ex: rafraîchir le dashboard sans reload).

---

## 3. Lancer le projet en local

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

- Pages publiques : accueil, matchs, joueurs, classements, records, confrontations, galerie, actualités
- `/login` : connexion admin
- `/admin` : espace de gestion (protégé par middleware + RLS)

---

## 4. Structure du projet

```
tally-carreaux/
├── supabase/
│   └── migrations/
│       ├── 0001_init.sql        # tables, vues stats, RLS, données initiales
│       └── 0002_storage.sql     # buckets Storage + policies
├── src/
│   ├── app/
│   │   ├── page.tsx             # Tableau de bord (accueil)
│   │   ├── matchs/               # Historique + détail d'un match
│   │   ├── joueurs/               # Liste + fiche joueur
│   │   ├── classements/          # Classements automatiques + graphiques
│   │   ├── records/               # Records du championnat
│   │   ├── confrontations/        # Face-à-face entre les 2 équipes
│   │   ├── galerie/               # Photos / vidéos (Supabase Storage)
│   │   ├── actualites/            # Actualités publiées
│   │   ├── login/                 # Connexion admin
│   │   └── admin/                 # CRUD joueurs, matchs, actualités, galerie
│   ├── components/
│   │   ├── layout/                # Navbar, ThemeToggle
│   │   ├── ui/                    # StatCard, TeamBadge, MatchCard
│   │   └── charts/                 # Graphiques Recharts
│   ├── lib/
│   │   ├── supabase/               # Clients (browser / server)
│   │   └── queries.ts              # Toutes les requêtes centralisées
│   ├── types/database.ts           # Types TypeScript du schéma
│   └── middleware.ts                # Protection de /admin
```

---

## 5. Comment tout est calculé automatiquement

Toute la logique de statistiques vit **dans la base de données** (vues SQL), pas dans le code applicatif :

- `player_stats` : matchs joués, buts, passes, homme du match, sanctions, contributions offensives — par joueur
- `team_stats` : victoires, défaites, nuls, buts marqués/encaissés, différence de buts, % de victoires — par équipe
- `team_recent_form` : forme sur les 5 derniers matchs
- `head_to_head` : agrégat des confrontations entre les 2 équipes
- `record_*` : plus large victoire, match le plus prolifique, meilleure performance individuelle, etc.

➡️ Dès qu'un admin ajoute un match, un but ou une sanction, **toutes ces vues se recalculent automatiquement** à la prochaine lecture — aucune synchronisation manuelle nécessaire.

---

## 6. Sécurité (RLS)

Deux rôles :
- **Visiteur** : lecture seule sur toutes les données sportives publiques
- **Administrateur** : lecture + écriture complète (joueurs, matchs, événements, actualités, galerie)

Les policies RLS sont définies dans `0001_init.sql` et `0002_storage.sql`, et s'appuient sur la table `profiles.role`. Le `middleware.ts` protège en plus les routes `/admin/*` côté Next.js.

---

## 7. Déploiement gratuit sur Vercel

1. Pousse le projet sur un repo GitHub.
2. Va sur [vercel.com/new](https://vercel.com/new) → importe le repo.
3. Dans **Environment Variables**, ajoute :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Clique **Deploy**. Vercel détecte automatiquement Next.js.
5. Une fois déployé, mets à jour l'URL dans `src/app/sitemap.ts` et `src/app/robots.ts`.

Le plan gratuit de Vercel + le plan gratuit de Supabase suffisent largement pour ce projet (2 équipes, trafic modéré).

---

## 8. Prochaines améliorations possibles

- Abonnements Supabase Realtime côté client pour un rafraîchissement instantané sans rechargement de page
- Upload direct des logos d'équipe et photos de joueurs depuis l'admin (buckets déjà prêts : `team-logos`, `player-photos`)
- Calcul de la « plus longue série de victoires » via une fonction SQL récursive dédiée
- Export PDF des feuilles de match
- Notifications push après chaque match

---

## Support

Pour toute question sur la configuration Supabase ou le déploiement, consulte :
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Vercel](https://vercel.com/docs)
