CREATE DATABASE IF NOT EXISTS portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE portfolio_db;
CREATE TABLE IF NOT EXISTS users (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120) NOT NULL, email VARCHAR(254) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL,
 role ENUM('admin') NOT NULL DEFAULT 'admin', token_version INT NOT NULL DEFAULT 0,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS projects (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, title VARCHAR(150) NOT NULL, slug VARCHAR(200) NOT NULL UNIQUE,
 description VARCHAR(500) NOT NULL, long_description TEXT, thumbnail VARCHAR(500), category VARCHAR(80) NOT NULL, technologies JSON,
 github_url VARCHAR(2048), live_url VARCHAR(2048), status ENUM('draft','published','in_progress','completed') DEFAULT 'draft', featured BOOLEAN DEFAULT FALSE,
 seo_title VARCHAR(255), seo_description VARCHAR(320), og_image VARCHAR(255),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX(status)
);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255), ADD COLUMN IF NOT EXISTS seo_description VARCHAR(320), ADD COLUMN IF NOT EXISTS og_image VARCHAR(255);
CREATE TABLE IF NOT EXISTS services (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,title VARCHAR(150) NOT NULL,description TEXT NOT NULL,icon VARCHAR(60) NOT NULL,
 order_position INT UNSIGNED DEFAULT 0,active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS skills (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,name VARCHAR(80) NOT NULL,category VARCHAR(80) NOT NULL,percentage TINYINT UNSIGNED NOT NULL CHECK(percentage<=100),
 icon VARCHAR(60),order_position INT UNSIGNED DEFAULT 0,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS messages (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,name VARCHAR(100) NOT NULL,email VARCHAR(254) NOT NULL,subject VARCHAR(200) NOT NULL,message TEXT NOT NULL,
 status ENUM('unread','read','replied') DEFAULT 'unread',created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,INDEX(status)
);
CREATE TABLE IF NOT EXISTS clients (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,name VARCHAR(120) NOT NULL,company VARCHAR(150),email VARCHAR(254) NOT NULL,phone VARCHAR(30),notes TEXT,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS tasks (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,title VARCHAR(200) NOT NULL,description TEXT,status ENUM('todo','in_progress','done') DEFAULT 'todo',priority ENUM('low','medium','high') DEFAULT 'medium',due_date DATE,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS quotes (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,number VARCHAR(60) UNIQUE NOT NULL,client_id INT UNSIGNED,title VARCHAR(200) NOT NULL,amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK(amount>=0),status ENUM('draft','sent','accepted','rejected') DEFAULT 'draft',due_date DATE,notes TEXT,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS invoices (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,number VARCHAR(60) UNIQUE NOT NULL,client_id INT UNSIGNED,title VARCHAR(200) NOT NULL,amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK(amount>=0),status ENUM('draft','sent','paid','overdue') DEFAULT 'draft',due_date DATE,paid_at DATE,notes TEXT,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS settings (setting_key VARCHAR(80) PRIMARY KEY,setting_value TEXT);
CREATE TABLE IF NOT EXISTS seo_settings (
 id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1, site_name VARCHAR(120) NOT NULL, site_url VARCHAR(255) NOT NULL,
 default_title VARCHAR(255) NOT NULL, default_description VARCHAR(320) NOT NULL, default_og_image VARCHAR(255) NOT NULL,
 google_site_verification VARCHAR(255), bing_site_verification VARCHAR(255), google_analytics_id VARCHAR(32),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS page_seo (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, page_key ENUM('home','about','services','projects','skills','contact') NOT NULL UNIQUE,
 seo_title VARCHAR(255) NOT NULL, seo_description VARCHAR(320) NOT NULL, canonical_url VARCHAR(255), og_image VARCHAR(255), robots VARCHAR(80) DEFAULT 'index, follow',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
INSERT IGNORE INTO settings VALUES ('availability','true'),('linkedin_url',''),('github_url',''),('instagram_url','');
INSERT IGNORE INTO seo_settings (id,site_name,site_url,default_title,default_description,default_og_image) VALUES (1,'Amine ELKARTITE','https://amineelkartite.com','Amine ELKARTITE | Développeur Full-Stack au Maroc','Portfolio d''Amine ELKARTITE, développeur Full-Stack au Maroc. Sites web, applications, e-commerce, APIs et solutions digitales sur mesure.','/assets/images/og-cover.jpg');
INSERT IGNORE INTO page_seo (page_key,seo_title,seo_description,canonical_url,og_image) VALUES
('home','Amine ELKARTITE | Développeur Full-Stack au Maroc','Portfolio d''Amine ELKARTITE, développeur Full-Stack au Maroc. Création de sites web, applications, e-commerce, APIs et solutions sur mesure.','/','/assets/images/og-cover.jpg'),
('about','À propos | Amine ELKARTITE - Développeur Full-Stack','Découvrez Amine ELKARTITE, développeur Full-Stack spécialisé dans la conception de solutions web modernes pour entreprises et particuliers.','/about','/assets/images/og-cover.jpg'),
('services','Création de Sites Web & Applications | Amine ELKARTITE','Création de sites vitrines, e-commerce, applications web, APIs, bases de données, UI/UX, déploiement et maintenance par Amine ELKARTITE.','/services','/assets/images/og-cover.jpg'),
('projects','Projets Web & Applications | Portfolio Amine ELKARTITE','Découvrez les projets web et applications réalisés par Amine ELKARTITE : sites vitrines, e-commerce, APIs et solutions sur mesure.','/projects','/assets/images/og-cover.jpg'),
('skills','Compétences Full-Stack | Amine ELKARTITE','Explorez les compétences Full-Stack d''Amine ELKARTITE : JavaScript, Node.js, Express.js, PHP, Laravel, MySQL, React et outils DevOps.','/skills','/assets/images/og-cover.jpg'),
('contact','Contact | Amine ELKARTITE - Développeur Web Maroc','Contactez Amine ELKARTITE pour discuter de votre site web, application ou solution digitale au Maroc ou à distance.','/contact','/assets/images/og-cover.jpg');
UPDATE projects SET slug='le-gourmet' WHERE id=1 AND slug='gourmet';
UPDATE projects SET slug='mode-style' WHERE id=2 AND slug='mode';
UPDATE projects SET slug='ticketpro' WHERE id=3 AND slug='ticket';
UPDATE projects SET slug='portfolio-personnel' WHERE id=4 AND slug='portfolio';
UPDATE projects SET slug='finance-track' WHERE id=5 AND slug='finance';
UPDATE projects SET slug='travelgo' WHERE id=6 AND slug='travel';
INSERT IGNORE INTO services (id,title,description,icon,order_position) VALUES (1,'Sites Web Vitrines','Des sites modernes et professionnels pour présenter votre activité et attirer de nouveaux clients.','monitor',1);
INSERT IGNORE INTO services (id,title,description,icon,order_position) VALUES (2,'Sites E-commerce','Des boutiques en ligne sécurisées, performantes et faciles à gérer pour développer votre chiffre d’affaires.','shopping-cart',2);
INSERT IGNORE INTO services (id,title,description,icon,order_position) VALUES (3,'Applications Web Sur Mesure','Des solutions web adaptées à vos besoins spécifiques, de la conception au déploiement.','code-xml',3);
INSERT IGNORE INTO services (id,title,description,icon,order_position) VALUES (4,'Applications Mobiles / PWA','Des applications mobiles performantes et multiplateformes, accessibles partout depuis le web.','smartphone',4);
INSERT IGNORE INTO services (id,title,description,icon,order_position) VALUES (5,'APIs & Bases de données','Conception et intégration d’APIs robustes et sécurisées avec gestion de bases de données optimisées.','database',5);
INSERT IGNORE INTO services (id,title,description,icon,order_position) VALUES (6,'Design UI/UX','Des interfaces modernes, intuitives et responsive pour une meilleure expérience utilisateur.','paintbrush',6);
INSERT IGNORE INTO services (id,title,description,icon,order_position) VALUES (7,'Déploiement & Hébergement','Mise en ligne de vos projets avec un suivi complet et des solutions fiables et sécurisées.','cloud',7);
INSERT IGNORE INTO services (id,title,description,icon,order_position) VALUES (8,'Maintenance & Support','Un accompagnement continu pour garantir la performance, la sécurité et l’évolution de vos projets.','settings',8);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (1,'HTML5','Front-end',95,'html',0);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (2,'CSS3','Front-end',90,'css',1);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (3,'JavaScript','Front-end',90,'js',2);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (4,'React.js','Front-end',85,'react',3);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (5,'Next.js','Front-end',80,'next',4);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (6,'PHP','Back-end',90,'php',0);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (7,'Laravel','Back-end',85,'laravel',1);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (8,'Node.js','Back-end',80,'node',2);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (9,'Express.js','Back-end',85,'express',3);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (10,'MySQL','Back-end',85,'mysql',4);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (11,'MongoDB','Back-end',75,'mongo',5);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (12,'Git','Outils & DevOps',85,'git',0);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (13,'Docker','Outils & DevOps',75,'docker',1);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (14,'GitHub','Outils & DevOps',85,'github',2);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (15,'Linux','Outils & DevOps',70,'linux',3);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (16,'Postman','Outils & DevOps',80,'postman',4);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (17,'Tailwind CSS','Design & Autres',85,'tailwind',0);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (18,'Figma','Design & Autres',75,'figma',1);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (19,'Adobe XD','Design & Autres',70,'xd',2);
INSERT IGNORE INTO skills (id,name,category,percentage,icon,order_position) VALUES (20,'VS Code','Design & Autres',90,'vscode',3);
INSERT IGNORE INTO projects (id,title,slug,description,long_description,thumbnail,category,technologies,status,featured) VALUES (1,'Le Gourmet','le-gourmet','Site vitrine pour un restaurant avec réservation en ligne.','Projet de démonstration — Site vitrine pour un restaurant avec réservation en ligne. Cet exemple illustre les types de solutions proposées. Remplacez ce contenu par les détails de votre réalisation dans l’administration.','/assets/images/project-gourmet.svg','Sites Web','["HTML5", "CSS3", "JavaScript"]','published',1);
INSERT IGNORE INTO projects (id,title,slug,description,long_description,thumbnail,category,technologies,status,featured) VALUES (2,'Mode & Style','mode-style','Boutique en ligne de vêtements avec gestion des commandes.','Projet de démonstration — Boutique en ligne de vêtements avec gestion des commandes. Cet exemple illustre les types de solutions proposées. Remplacez ce contenu par les détails de votre réalisation dans l’administration.','/assets/images/project-mode.svg','E-commerce','["Laravel", "PHP", "MySQL"]','published',1);
INSERT IGNORE INTO projects (id,title,slug,description,long_description,thumbnail,category,technologies,status,featured) VALUES (3,'TicketPro','ticketpro','Application web de gestion des tickets et notifications.','Projet de démonstration — Application web de gestion des tickets et notifications. Cet exemple illustre les types de solutions proposées. Remplacez ce contenu par les détails de votre réalisation dans l’administration.','/assets/images/project-ticket.svg','Applications Web','["PHP", "JavaScript", "MySQL"]','published',1);
INSERT IGNORE INTO projects (id,title,slug,description,long_description,thumbnail,category,technologies,status,featured) VALUES (4,'Portfolio Personnel','portfolio-personnel','Mon site portfolio pour présenter mes compétences et projets.','Projet de démonstration — Mon site portfolio pour présenter mes compétences et projets. Cet exemple illustre les types de solutions proposées. Remplacez ce contenu par les détails de votre réalisation dans l’administration.','/assets/images/project-portfolio.svg','Sites Web','["HTML5", "CSS3", "JavaScript"]','published',1);
INSERT IGNORE INTO projects (id,title,slug,description,long_description,thumbnail,category,technologies,status,featured) VALUES (5,'FinanceTrack','finance-track','Application web de suivi des dépenses personnelles.','Projet de démonstration — Application web de suivi des dépenses personnelles. Cet exemple illustre les types de solutions proposées. Remplacez ce contenu par les détails de votre réalisation dans l’administration.','/assets/images/project-finance.svg','Applications Web','["React", "Node.js", "MongoDB"]','published',1);
INSERT IGNORE INTO projects (id,title,slug,description,long_description,thumbnail,category,technologies,status,featured) VALUES (6,'TravelGo','travelgo','Site de réservation de voyages avec catalogue dynamique.','Projet de démonstration — Site de réservation de voyages avec catalogue dynamique. Cet exemple illustre les types de solutions proposées. Remplacez ce contenu par les détails de votre réalisation dans l’administration.','/assets/images/project-travel.svg','Sites Web','["PHP", "JavaScript", "MySQL"]','published',1);
