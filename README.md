# Amine ELKARTITE — Portfolio & administration

Portfolio français inspiré des maquettes fournies, avec six pages publiques, une administration et une API REST. Aucun framework frontend, CDN, service de formulaire tiers ou stockage de token dans le navigateur. Les images, polices, icônes et Chart.js sont servis localement.

## Démarrage sur une installation normale

Prérequis : Node.js 22 ou ultérieur, npm et MySQL 8 / MariaDB 10.4 ou ultérieur.

```sh
cd portfolio/backend
npm ci
cp .env.example .env
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Renseigner dans `.env` les paramètres de connexion MySQL et remplacer `JWT_SECRET` par la valeur aléatoire générée. Configurer `FRONTEND_URL` avec l’origine exacte du site (par défaut `http://localhost:5000`). Le frontend est servi par Express : ne pas l’ouvrir en `file://` ou avec un second serveur statique.

Créer une base et un utilisateur dédiés avec un compte MySQL d’installation. Remplacer les mots de passe d’exemple ci-dessous avant d’exécuter ces instructions :

```sql
CREATE DATABASE portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'portfolio_app'@'localhost' IDENTIFIED BY 'un-mot-de-passe-unique';
GRANT SELECT, INSERT, UPDATE, DELETE ON portfolio_db.* TO 'portfolio_app'@'localhost';
```

Importer le schéma avec un compte autorisé à créer les tables :

```sh
mysql -u root -p < ../database/portfolio.sql
```

Ou, si le compte configuré dans `.env` dispose des droits d’installation, exécuter `npm run db:init`. Ce script crée la base si nécessaire et ajoute le schéma et les exemples ; il ne supprime pas les données existantes. Il peut réintroduire les exemples supprimés si leurs identifiants sont libres : ne pas l’utiliser comme migration de production.

Puis :

```sh
npm run admin:create
npm start
```

Le script `admin:create` crée `amineelkartite@gmail.com`, génère un mot de passe fort et l’affiche une seule fois. Conserver ce mot de passe dans un gestionnaire. Un `ADMIN_PASSWORD` fourni par l’environnement est également accepté (12 caractères minimum, 72 octets maximum). Les comptes existants ne sont jamais écrasés. Le mot de passe est haché avec bcrypt, coût 12.

Ouvrir :

- http://localhost:5000
- http://localhost:5000/admin/login.html

`npm run dev` active le redémarrage automatique du backend. Les assets des bibliothèques sont déjà inclus ; `npm run assets` les recopie depuis les dépendances installées.

## Environnement préparé pour cette session

La configuration locale `backend/.env` utilise une MariaDB séparée via le socket `/private/tmp/amine-portfolio-mysql/mysql.sock`. Les bases XAMPP existantes n’ont pas été modifiées. Cette instance de test écoute uniquement sur un socket, pas sur le réseau.

Le mot de passe du compte local se trouve dans `backend/.local-admin.txt`, avec des permissions de lecture limitées au propriétaire. `.env` et ce fichier sont ignorés par Git. Ne pas les publier.

Si l’instance temporaire a été arrêtée et que son dossier existe encore, la relancer dans un terminal :

```sh
/Applications/XAMPP/xamppfiles/sbin/mysqld --no-defaults \
  --basedir=/Applications/XAMPP/xamppfiles \
  --datadir=/private/tmp/amine-portfolio-mysql \
  --socket=/private/tmp/amine-portfolio-mysql/mysql.sock \
  --pid-file=/private/tmp/amine-portfolio-mysql/mysql.pid \
  --skip-networking \
  --log-error=/private/tmp/amine-portfolio-mysql/error.log
```

Dans un autre terminal, exécuter `npm start` depuis `portfolio/backend`. Le dossier `/private/tmp` peut être effacé par le système : pour conserver durablement le contenu, utiliser une base normale et modifier `.env`, ou utiliser les volumes Docker ci-dessous.

## Fonctionnalités

- Accueil et présentation : fond cinématique fourni, navigation active, menu mobile, liens téléphone/email.
- Services et compétences chargés depuis l’API ; services inactifs masqués ; ordre configurable ; barres animées via IntersectionObserver.
- Projets : recherche par texte/technologie, catégories, images locales, badges, fiche détaillée, liens externes lorsqu’ils sont renseignés. Les brouillons et projets en cours restent privés.
- Contact : validation native et serveur, état d’envoi, confirmation uniquement après enregistrement MySQL, erreur explicite, compteur de caractères. Le formulaire enregistre un message ; il n’envoie pas de notification email automatique.
- Administration : connexion, déconnexion, aperçu des projets et messages, revenus des factures réglées, répartition des projets, tâches du jour, recherche globale projets/clients.
- CRUD projets avec aperçu privé et upload ; CRUD services, compétences, clients, tâches, devis et factures. Les devis/factures servent au suivi interne ; aucun paiement, envoi automatique ou génération PDF n’est intégré.
- Messages : lecture, statuts non lu/lu/répondu, suppression et ouverture du logiciel email pour répondre.
- Paramètres : disponibilité, liens sociaux, changement de mot de passe avec révocation des sessions.
- Pages de confidentialité et erreur 404, métadonnées SEO, liens d’évitement, labels accessibles, prise en compte de la réduction des animations.
- URLs publiques propres (`/about`, `/services`, `/projects`, `/projects/:slug`, `/skills`, `/contact`) avec redirections 301 depuis les anciennes URLs `.html`.
- SEO rendu côté serveur : titres et descriptions uniques, canoniques, Open Graph, Twitter Cards, Person/WebSite/ProfessionalService et CreativeWork/BreadcrumbList pour les projets.
- Sitemap XML dynamique limité aux projets publiés, robots.txt dynamique, en-têtes noindex pour l’administration et l’API, favicon complet et manifeste web.
- Réglages SEO dans l’administration : site, Search Console, Bing, GA4 optionnel, métadonnées des six pages, SEO par projet et aperçus Google/social.

Les six projets Le Gourmet, Mode & Style, TicketPro, Portfolio Personnel, FinanceTrack et TravelGo sont des **exemples éditables**, identifiés dans leurs fiches. Leurs vignettes SVG sont des illustrations locales, pas des captures de produits publiés. Ajouter les vrais détails et URLs depuis l’administration. Les chiffres marketing « 20+ » et « 100% » proviennent du cahier des charges et sont statiques dans les pages publiques ; le tableau de bord utilise exclusivement les données de la base.

## API

Format : `{ "success": true, "message": "…", "data": … }`, ou `{ "success": false, "message": "…", "errors": […] }` pour une erreur de validation.

| Routes | Accès / usage |
| --- | --- |
| `GET /api/health` | État de la connexion DB |
| `GET /api/projects`, `GET /api/projects/:id` | Projets publiés/terminés uniquement |
| `GET /api/projects/manage`, `GET /api/projects/manage/:id` | Admin, y compris brouillons |
| `POST /api/projects`, `PUT /api/projects/:id`, `DELETE /api/projects/:id` | Admin, JSON ou multipart pour création/modification |
| `GET /api/services`, `GET /api/skills` | Public |
| `GET /api/services/manage` | Admin, y compris services masqués |
| `POST /api/messages` | Public, contact |
| `GET /api/messages`, `PATCH /api/messages/:id/status`, `DELETE /api/messages/:id` | Admin |
| `GET/POST /api/clients`, `/api/tasks`, `/api/quotes`, `/api/invoices` | Admin |
| `GET/PUT/DELETE /api/{resource}/:id` | Admin, clients/tâches/devis/factures/services/compétences |
| `POST /api/services`, `POST /api/skills` | Admin |
| `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` | Connexion et session |
| `GET /api/dashboard/stats`, `GET /api/admin/dashboard` | Admin, statistiques |
| `GET/PUT /api/settings`, `PUT /api/settings/password` | Admin |
| `GET /api/settings/public` | Liens sociaux et disponibilité publics |

Le login pose un cookie `portfolio_session` HttpOnly et SameSite=Strict, valable huit heures. Le token n’est volontairement **pas** renvoyé en JSON ni stocké dans localStorage. Le middleware accepte aussi `Authorization: Bearer …` pour un client possédant un JWT valide. Les mutations utilisant le cookie exigent `X-Requested-With: Portfolio` et une origine autorisée. La déconnexion révoque les sessions de ce compte ; le changement de mot de passe fait de même.

Les fichiers sont limités à 5 Mo, JPEG/PNG/WebP, avec contrôle de l’extension, du MIME et de la signature binaire. Les noms utilisent des UUID. Un remplacement/suppression retire l’ancienne image générée ; un échec SQL retire le nouvel upload. Les assets fournis ne sont jamais supprimés par cette procédure.

Les champs SQL sont sélectionnés dans des listes internes et les valeurs passent par des requêtes paramétrées. Les textes sont affichés via échappement HTML pour conserver les caractères naturels sans exécuter de balises. La politique CSP, Helmet, les limites de corps et de tentatives et le contrôle des URLs complètent ces protections. Les pratiques de session et de sécurité suivent la [documentation Express](https://expressjs.com/en/advanced/best-practice-security/).

## Vérification

Les tests doivent utiliser une base de développement dédiée : ils créent puis suppriment leurs propres enregistrements. Ils nécessitent le serveur démarré et le compte administrateur créé.

```sh
cd portfolio/backend
npm test
```

Les identifiants de test viennent de `TEST_ADMIN_PASSWORD` ou, pour cette session, de `.local-admin.txt`. `TEST_BASE_URL` permet de remplacer `http://localhost:5000` dans les tests API.

Tests navigateur :

```sh
npx playwright install chromium
node tests/browser-check.js
```

`CHROMIUM_PATH` permet d’utiliser un Chromium existant. Le script vérifie les six pages publiques, les tailles 1536/768/390 px, les filtres et fiches projets, les pages admin, le CRUD client, le parcours contact → boîte de réception et la déconnexion. Les captures sont écrites dans `/private/tmp/amine-portfolio-check` (ou le dossier temporaire du système).

## Déploiement

### Vercel

Le dépôt inclut `index.js` et `vercel.json` pour exécuter l’application Express comme Vercel Function. Dans Vercel, conserver la racine du projet à la racine du dépôt et définir le Framework Preset sur **Express** ou laisser `vercel.json` le sélectionner.

Configurer pour Production, Preview et Development les variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `FRONTEND_URL`, `CANONICAL_HOST` et `NODE_ENV=production`. La base MySQL/MariaDB doit accepter les connexions depuis Vercel ; une base locale ou Docker liée à `127.0.0.1` n’est pas accessible depuis une Function.

Le système de fichiers d’une Vercel Function n’est pas un stockage persistant. Pour conserver les images envoyées depuis l’administration en production, connecter un stockage objet puis adapter `middleware/upload.js`. Les images déjà livrées dans `frontend/assets/images/` restent disponibles normalement.

1. Utiliser une base durable et un utilisateur limité à cette base ; importer le schéma avec un compte d’installation.
2. Définir un nouveau `JWT_SECRET`, `NODE_ENV=production`, les paramètres DB et `FRONTEND_URL=https://votre-domaine`.
   Définir aussi `CANONICAL_HOST` sans protocole et renseigner dans Paramètres → SEO l’URL canonique réellement possédée. La valeur initiale `https://amineelkartite.com` sert de configuration de départ et doit être remplacée si le domaine final diffère.
3. Servir derrière un reverse proxy HTTPS. Les cookies sont `Secure` en production et ne fonctionneront pas en HTTP. Activer `TRUST_PROXY=1` uniquement derrière un proxy de confiance qui remplace les en-têtes transférés ; ne pas exposer alors directement le port Node au public.
4. Exécuter `npm ci --omit=dev` et `npm start` sous un compte non privilégié / gestionnaire de processus.
5. Conserver et sauvegarder `backend/uploads/projects/` ainsi que la base. Les journaux ne contiennent pas les corps des messages ni les mots de passe.
6. Remplacer les exemples et personnaliser les textes métier avant publication.
7. Ajouter les codes Google/Bing après validation du domaine. GA4 reste absent tant qu’aucun identifiant `G-…` n’est renseigné dans l’administration ou via `GA_MEASUREMENT_ID`.

Une configuration Docker Compose optionnelle est fournie. Elle ne publie le port applicatif que sur `127.0.0.1:5000` et n’expose pas MariaDB. Créer `portfolio/.env` depuis `portfolio/.env.example`, choisir trois secrets distincts et renseigner le domaine HTTPS, puis :

```sh
cd portfolio
cp .env.example .env
# Renseigner .env avant de continuer.
docker compose up -d --build
docker compose exec app npm run admin:create
```

La base est initialisée depuis le SQL seulement à la création du volume. Les volumes `database` et `uploads` conservent les données. `docker compose down` les garde ; ne pas utiliser `down -v` pour un site à conserver. Cette configuration Docker est fournie pour le déploiement ; les vérifications de cette session ont utilisé Node et MariaDB directement, pas Docker.

Les limites de tentatives sont en mémoire du processus. Pour plusieurs instances Node, brancher un magasin de rate-limit partagé avant de répartir le trafic. Aucun domaine ni hébergement n’a été configuré ou publié dans cette session.

## Assets & licences

- Images du poste de travail : fichiers fournis dans le dossier initial.
- Vignettes des projets et monogramme : SVG locaux modifiables.
- Inter : licence SIL Open Font License dans `frontend/assets/fonts/OFL.txt`.
- Devicon : licence MIT dans `frontend/assets/icons/devicon-LICENSE` ; les marques restent la propriété de leurs titulaires.
- Lucide et Chart.js : licences conservées dans `frontend/assets/vendor/`.
