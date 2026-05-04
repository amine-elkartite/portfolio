/* =========================
   Portfolio UI + Dynamic GitHub / X / LinkedIn
   Author: Amine ELKARTITE
========================= */

const body = document.body;
const progress = document.querySelector(".scroll-progress");
const menuButton = document.querySelector(".menu-button");
const menuPanel = document.querySelector("#menuPanel");
const menuClose = document.querySelector(".menu-close");
const menuLinks = document.querySelectorAll(".menu-panel a");
const revealItems = document.querySelectorAll(".reveal");
const tiltCards = document.querySelectorAll("[data-tilt]");
const projectCards = document.querySelectorAll(".project-card");
const projectDialog = document.querySelector("#projectDialog");
const yearTarget = document.querySelector("[data-year]");
const backToTopButton = document.querySelector(".back-to-top");

const CONFIG = {
  github: {
    username: "amine-elkartite",
    reposLimit: 6,
  },
  x: {
    name: "Amine ELKARTITE",
    username: "Amine_Elkartite",
    displayUsername: "@Amine_Elkartite",
    url: "https://x.com/Amine_Elkartite",
    avatar: "assets/avatars/linkedIn-removebg-preview.png",
    description:
      "Cybersecurity, web development, SECUTrick updates and personal branding.",
  },
  linkedin: {
    name: "Amine ELKARTITE",
    url: "https://www.linkedin.com/in/amine-elkartite-7b4bb8323/",
    description: "Full Stack Developer | React / JavaScript / PHP | Cybersecurity | Secure applications.",
    headline: "Cyber Security Specialist · Founder @ SECUTrick",
    location: "Morocco · Hybrid / Remote",
    avatar: "assets/avatars/linkedIn-removebg-preview.png",
  },
};

/* =========================
   Helpers
========================= */

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateString) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function setHref(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.href = value;
}

/* =========================
   Year
========================= */

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

/* =========================
   Scroll progress
========================= */

function updateProgress() {
  if (!progress) return;

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progressValue = scrollable <= 0 ? 0 : (window.scrollY / scrollable) * 100;

  progress.style.width = `${progressValue}%`;

  if (backToTopButton) {
    backToTopButton.classList.toggle("is-visible", window.scrollY > 420);
  }
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
window.addEventListener("load", updateProgress);
updateProgress();

if (backToTopButton) {
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* =========================
   Menu
========================= */

function openMenu() {
  if (!menuPanel || !menuButton) return;

  body.classList.add("menu-open");
  menuPanel.classList.add("is-open");
  menuPanel.setAttribute("aria-hidden", "false");
  menuButton.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  if (!menuPanel || !menuButton) return;

  body.classList.remove("menu-open");
  menuPanel.classList.remove("is-open");
  menuPanel.setAttribute("aria-hidden", "true");
  menuButton.setAttribute("aria-expanded", "false");
}

if (menuButton) {
  menuButton.addEventListener("click", () => {
    if (menuPanel && menuPanel.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });
}

if (menuClose) {
  menuClose.addEventListener("click", closeMenu);
}

menuLinks.forEach((link) => link.addEventListener("click", closeMenu));

if (menuPanel) {
  menuPanel.addEventListener("click", (event) => {
    if (event.target === menuPanel) closeMenu();
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    closeProject();
  }
});

/* =========================
   Reveal animation
========================= */

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* =========================
   Tilt cards
========================= */

tiltCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (window.matchMedia("(max-width: 780px)").matches) return;

    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    card.style.transform = `rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

/* =========================
   Project dialog
========================= */

function closeProject() {
  if (!projectDialog) return;

  if (typeof projectDialog.close === "function" && projectDialog.open) {
    projectDialog.close();
  } else {
    projectDialog.removeAttribute("open");
  }
}

function openProject(card) {
  if (!projectDialog || !card) return;

  const dialogTitle = projectDialog.querySelector("h2");
  const dialogType = projectDialog.querySelector(".dialog-type");
  const dialogDesc = projectDialog.querySelector(".dialog-desc");
  const dialogImage = projectDialog.querySelector(".dialog-image img");
  const dialogTags = projectDialog.querySelector(".dialog-tags");

  const tags = (card.dataset.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (dialogTitle) dialogTitle.textContent = card.dataset.project || "Project";
  if (dialogType) dialogType.textContent = card.dataset.type || "Project";
  if (dialogDesc) dialogDesc.textContent = card.dataset.desc || "";

  if (dialogImage) {
    dialogImage.src = card.dataset.image || "";
    dialogImage.alt = `${card.dataset.project || "Project"} project preview`;
  }

  if (dialogTags) {
    dialogTags.innerHTML = "";

    tags.forEach((tag) => {
      const tagEl = document.createElement("span");
      tagEl.textContent = tag;
      dialogTags.appendChild(tagEl);
    });
  }

  if (typeof projectDialog.showModal === "function") {
    projectDialog.showModal();
  } else {
    projectDialog.setAttribute("open", "");
  }
}

projectCards.forEach((card) => {
  card.addEventListener("click", () => openProject(card));

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProject(card);
    }
  });
});

if (projectDialog) {
  const dialogClose = projectDialog.querySelector(".dialog-close");

  if (dialogClose) {
    dialogClose.addEventListener("click", closeProject);
  }

  projectDialog.addEventListener("click", (event) => {
    if (event.target === projectDialog) closeProject();
  });
}

/* =========================
   GitHub Dynamic Data
========================= */

const githubReposContainer = document.getElementById("githubRepos");
const githubReposCount = document.getElementById("githubReposCount");
const githubFollowersCount = document.getElementById("githubFollowersCount");
const githubFollowingCount = document.getElementById("githubFollowingCount");

async function loadGitHubProfile() {
  try {
    const response = await fetch(`https://api.github.com/users/${CONFIG.github.username}`);

    if (!response.ok) {
      throw new Error(`GitHub profile error: ${response.status}`);
    }

    const profile = await response.json();

    if (githubReposCount) githubReposCount.textContent = profile.public_repos ?? "--";
    if (githubFollowersCount) githubFollowersCount.textContent = profile.followers ?? "--";
    if (githubFollowingCount) githubFollowingCount.textContent = profile.following ?? "--";
  } catch (error) {
    console.error(error);

    if (githubReposCount) githubReposCount.textContent = "--";
    if (githubFollowersCount) githubFollowersCount.textContent = "--";
    if (githubFollowingCount) githubFollowingCount.textContent = "--";
  }
}

async function loadGitHubRepos() {
  if (!githubReposContainer) return;

  try {
    const response = await fetch(
      `https://api.github.com/users/${CONFIG.github.username}/repos?sort=updated&direction=desc&per_page=30`
    );

    if (!response.ok) {
      throw new Error(`GitHub repos error: ${response.status}`);
    }

    const repos = await response.json();

    const filteredRepos = repos
      .filter((repo) => !repo.fork)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, CONFIG.github.reposLimit);

    if (!filteredRepos.length) {
      githubReposContainer.innerHTML = `
        <article class="github-repo-card">
          <span>GitHub</span>
          <h3>No public repositories found</h3>
          <p>No repositories are available right now.</p>
        </article>
      `;
      return;
    }

    githubReposContainer.innerHTML = filteredRepos.map(createRepoCard).join("");
  } catch (error) {
    console.error(error);

    githubReposContainer.innerHTML = `
      <article class="github-repo-card">
        <span>GitHub</span>
        <h3>Repositories unavailable</h3>
        <p>Please check the GitHub username or API connection.</p>
      </article>
    `;
  }
}

function createRepoCard(repo) {
  const language = repo.language || "Project";
  const description =
    repo.description ||
    "Repository public créé par Amine ELKARTITE autour du web, du développement ou de la cybersécurité.";
  const updatedDate = formatDate(repo.updated_at);

  return `
    <article class="github-repo-card">
      <span>${escapeHTML(language)}</span>
      <h3>${escapeHTML(repo.name)}</h3>
      <p>${escapeHTML(description)}</p>

      <div class="repo-meta">
        <small>★ ${repo.stargazers_count}</small>
        <small>⑂ ${repo.forks_count}</small>
        <small>${updatedDate}</small>
      </div>

      <a href="${repo.html_url}" target="_blank" rel="noreferrer">
        View repository
      </a>
    </article>
  `;
}

/* =========================
   X + LinkedIn Dynamic Data
========================= */

function loadDynamicSocialProfiles() {
  loadXProfile();
  loadLinkedInProfile();
}

function loadXProfile() {
  setText("#xName", CONFIG.x.name);
  setText("#xUsername", CONFIG.x.displayUsername);
  setText("#xHandle", CONFIG.x.displayUsername);
  setText("#xDescription", CONFIG.x.description);
  setHref("#xProfileLink", CONFIG.x.url);

  const xAvatar = document.getElementById("xAvatar");

  if (xAvatar) {
    xAvatar.src = CONFIG.x.avatar;
    xAvatar.alt = `${CONFIG.x.name} X profile`;
  }
}

function loadLinkedInProfile() {
  setText("#linkedinName", CONFIG.linkedin.name);
  setText("#linkedinDescription", CONFIG.linkedin.description);
  setHref("#linkedinProfileLink", CONFIG.linkedin.url);
  setHref("#linkedinConnectLink", CONFIG.linkedin.url);

  const linkedinPreview = document.querySelector(".linkedin-preview");

  if (linkedinPreview) {
    linkedinPreview.innerHTML = `
      <div class="linkedin-avatar">
        <img
          src="${CONFIG.linkedin.avatar}"
          alt="${escapeHTML(CONFIG.linkedin.name)} profile"
        />
      </div>

      <div>
        <h3>${escapeHTML(CONFIG.linkedin.name)}</h3>
        <p>${escapeHTML(CONFIG.linkedin.headline)}</p>
        <span>${escapeHTML(CONFIG.linkedin.location)}</span>
      </div>
    `;
  }
}

/* =========================
   Init
========================= */

loadGitHubProfile();
loadGitHubRepos();
loadDynamicSocialProfiles();
