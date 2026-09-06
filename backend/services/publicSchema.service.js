import {pool} from '../config/database.js';

let schemaPromise;

async function initializePublicSchema() {
  await pool.query(`CREATE TABLE IF NOT EXISTS projects (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description VARCHAR(500) NOT NULL,
    long_description TEXT,
    thumbnail VARCHAR(500),
    category VARCHAR(80) NOT NULL,
    technologies JSON,
    github_url VARCHAR(2048),
    live_url VARCHAR(2048),
    status ENUM('draft','published','in_progress','completed') DEFAULT 'draft',
    featured BOOLEAN DEFAULT FALSE,
    seo_title VARCHAR(255),
    seo_description VARCHAR(320),
    og_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX(status)
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(80) PRIMARY KEY,
    setting_value TEXT
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS seo_settings (
    id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
    site_name VARCHAR(120) NOT NULL,
    site_url VARCHAR(255) NOT NULL,
    default_title VARCHAR(255) NOT NULL,
    default_description VARCHAR(320) NOT NULL,
    default_og_image VARCHAR(255) NOT NULL,
    google_site_verification VARCHAR(255),
    bing_site_verification VARCHAR(255),
    google_analytics_id VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS page_seo (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    page_key ENUM('home','about','services','projects','skills','contact') NOT NULL UNIQUE,
    seo_title VARCHAR(255) NOT NULL,
    seo_description VARCHAR(320) NOT NULL,
    canonical_url VARCHAR(255),
    og_image VARCHAR(255),
    robots VARCHAR(80) DEFAULT 'index, follow',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);

  await pool.query(`INSERT IGNORE INTO settings (setting_key,setting_value) VALUES
    ('availability','true'),('linkedin_url',''),('github_url',''),('instagram_url','')`);

  await pool.query(`INSERT IGNORE INTO seo_settings
    (id,site_name,site_url,default_title,default_description,default_og_image)
    VALUES (1,'Amine ELKARTITE','https://amine-elkartite.vercel.app','Amine ELKARTITE | Développeur Full-Stack au Maroc',
    'Portfolio d''Amine ELKARTITE, développeur Full-Stack au Maroc. Sites web, applications, e-commerce, APIs et solutions digitales sur mesure.',
    '/assets/images/og-cover.jpg')`);

  await pool.query(`INSERT IGNORE INTO page_seo (page_key,seo_title,seo_description,canonical_url,og_image) VALUES
    ('home','Amine ELKARTITE | Développeur Full-Stack au Maroc','Portfolio d''Amine ELKARTITE, développeur Full-Stack au Maroc. Création de sites web, applications, e-commerce, APIs et solutions sur mesure.','/','/assets/images/og-cover.jpg'),
    ('about','À propos | Amine ELKARTITE - Développeur Full-Stack','Découvrez Amine ELKARTITE, développeur Full-Stack spécialisé dans la conception de solutions web modernes pour entreprises et particuliers.','/about','/assets/images/og-cover.jpg'),
    ('services','Création de Sites Web & Applications | Amine ELKARTITE','Création de sites vitrines, e-commerce, applications web, APIs, bases de données, UI/UX, déploiement et maintenance par Amine ELKARTITE.','/services','/assets/images/og-cover.jpg'),
    ('projects','Projets Web & Applications | Portfolio Amine ELKARTITE','Découvrez les projets web et applications réalisés par Amine ELKARTITE : sites vitrines, e-commerce, APIs et solutions sur mesure.','/projects','/assets/images/og-cover.jpg'),
    ('skills','Compétences Full-Stack | Amine ELKARTITE','Explorez les compétences Full-Stack d''Amine ELKARTITE : JavaScript, Node.js, Express.js, PHP, Laravel, MySQL, React et outils DevOps.','/skills','/assets/images/og-cover.jpg'),
    ('contact','Contact | Amine ELKARTITE - Développeur Web Maroc','Contactez Amine ELKARTITE pour discuter de votre site web, application ou solution digitale au Maroc ou à distance.','/contact','/assets/images/og-cover.jpg')`);

  await pool.query(`INSERT IGNORE INTO projects
    (id,title,slug,description,long_description,thumbnail,category,technologies,status,featured) VALUES
    (1,'Le Gourmet','le-gourmet','Site vitrine pour un restaurant avec réservation en ligne.','Projet de démonstration — Site vitrine pour un restaurant avec réservation en ligne.','/assets/images/project-gourmet.svg','Sites Web','[\"HTML5\",\"CSS3\",\"JavaScript\"]','published',1),
    (2,'Mode & Style','mode-style','Boutique en ligne de vêtements avec gestion des commandes.','Projet de démonstration — Boutique en ligne de vêtements avec gestion des commandes.','/assets/images/project-mode.svg','E-commerce','[\"Laravel\",\"PHP\",\"MySQL\"]','published',1),
    (3,'TicketPro','ticketpro','Application web de gestion des tickets et notifications.','Projet de démonstration — Application web de gestion des tickets et notifications.','/assets/images/project-ticket.svg','Applications Web','[\"PHP\",\"JavaScript\",\"MySQL\"]','published',1),
    (4,'Portfolio Personnel','portfolio-personnel','Mon site portfolio pour présenter mes compétences et projets.','Projet de démonstration — Mon site portfolio pour présenter mes compétences et projets.','/assets/images/project-portfolio.svg','Sites Web','[\"HTML5\",\"CSS3\",\"JavaScript\"]','published',1),
    (5,'FinanceTrack','finance-track','Application web de suivi des dépenses personnelles.','Projet de démonstration — Application web de suivi des dépenses personnelles.','/assets/images/project-finance.svg','Applications Web','[\"React\",\"Node.js\",\"MongoDB\"]','published',1),
    (6,'TravelGo','travelgo','Site de réservation de voyages avec catalogue dynamique.','Projet de démonstration — Site de réservation de voyages avec catalogue dynamique.','/assets/images/project-travel.svg','Sites Web','[\"PHP\",\"JavaScript\",\"MySQL\"]','published',1)`);
}

export function ensurePublicSchema() {
  if (!schemaPromise) {
    schemaPromise = initializePublicSchema().catch(error => {
      schemaPromise = undefined;
      throw error;
    });
  }
  return schemaPromise;
}
