/* =========================
   Basic UI interactions
========================= */

const menuButton = document.querySelector(".menu-button");
const menuPanel = document.querySelector("#menuPanel");
const menuClose = document.querySelector(".menu-close");
const menuLinks = document.querySelectorAll(".menu-panel__nav a");
const backToTopButton = document.querySelector(".back-to-top");
const scrollProgress = document.querySelector(".scroll-progress");

function openMenu() {
  if (!menuPanel || !menuButton) return;

  menuPanel.setAttribute("aria-hidden", "false");
  menuButton.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
}

function closeMenu() {
  if (!menuPanel || !menuButton) return;

  menuPanel.setAttribute("aria-hidden", "true");
  menuButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

if (menuButton) {
  menuButton.addEventListener("click", openMenu);
}

if (menuClose) {
  menuClose.addEventListener("click", closeMenu);
}

menuLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});


/* =========================
   Current year
========================= */

const yearElements = document.querySelectorAll("[data-year]");
const currentYear = new Date().getFullYear();

yearElements.forEach((element) => {
  element.textContent = currentYear;
});


/* =========================
   Scroll progress
========================= */

function updateScrollProgress() {
  if (!scrollProgress) return;

  const scrollTop = window.scrollY;
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;

  scrollProgress.style.width = `${progress}%`;

  if (backToTopButton) {
    if (scrollTop > 500) {
      backToTopButton.classList.add("is-visible");
    } else {
      backToTopButton.classList.remove("is-visible");
    }
  }
}

window.addEventListener("scroll", updateScrollProgress);
window.addEventListener("load", updateScrollProgress);

if (backToTopButton) {
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}


/* =========================
   Reveal animation
========================= */

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});


/* =========================
   Project dialog
========================= */

const projectCards = document.querySelectorAll(".project-card");
const projectDialog = document.querySelector("#projectDialog");
const dialogClose = document.querySelector(".dialog-close");

function openProjectDialog(card) {
  if (!projectDialog) return;

  const projectName = card.dataset.project || "";
  const projectType = card.dataset.type || "";
  const projectImage = card.dataset.image || "";
  const projectDescription = card.dataset.desc || "";
  const projectTags = card.dataset.tags || "";

  const dialogImage = projectDialog.querySelector(".dialog-image img");
  const dialogType = projectDialog.querySelector(".dialog-type");
  const dialogTitle = projectDialog.querySelector("h2");
  const dialogDesc = projectDialog.querySelector(".dialog-desc");
  const dialogTags = projectDialog.querySelector(".dialog-tags");

  if (dialogImage) {
    dialogImage.src = projectImage;
    dialogImage.alt = projectName;
  }

  if (dialogType) {
    dialogType.textContent = projectType;
  }

  if (dialogTitle) {
    dialogTitle.textContent = projectName;
  }

  if (dialogDesc) {
    dialogDesc.textContent = projectDescription;
  }

  if (dialogTags) {
    dialogTags.innerHTML = projectTags
      .split(",")
      .map((tag) => `<span>${tag.trim()}</span>`)
      .join("");
  }

  projectDialog.showModal();
}

projectCards.forEach((card) => {
  card.addEventListener("click", () => openProjectDialog(card));

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      openProjectDialog(card);
    }
  });
});

if (dialogClose && projectDialog) {
  dialogClose.addEventListener("click", () => {
    projectDialog.close();
  });
}

if (projectDialog) {
  projectDialog.addEventListener("click", (event) => {
    const dialogBox = projectDialog.getBoundingClientRect();

    const clickedOutside =
      event.clientX < dialogBox.left ||
      event.clientX > dialogBox.right ||
      event.clientY < dialogBox.top ||
      event.clientY > dialogBox.bottom;

    if (clickedOutside) {
      projectDialog.close();
    }
  });
}


/* =========================
   GitHub Dynamic Data
========================= */

const GITHUB_USERNAME = "amine-elkartite";

const githubReposContainer = document.getElementById("githubRepos");
const githubReposCount = document.getElementById("githubReposCount");
const githubFollowersCount = document.getElementById("githubFollowersCount");
const githubFollowingCount = document.getElementById("githubFollowingCount");

async function loadGitHubProfile() {
  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);

    if (!response.ok) {
      throw new Error("GitHub profile not found");
    }

    const profile = await response.json();

    if (githubReposCount) {
      githubReposCount.textContent = profile.public_repos ?? "--";
    }

    if (githubFollowersCount) {
      githubFollowersCount.textContent = profile.followers ?? "--";
    }

    if (githubFollowingCount) {
      githubFollowingCount.textContent = profile.following ?? "--";
    }
  } catch (error) {
    console.error("GitHub profile error:", error);

    if (githubReposCount) githubReposCount.textContent = "12";
    if (githubFollowersCount) githubFollowersCount.textContent = "--";
    if (githubFollowingCount) githubFollowingCount.textContent = "--";
  }
}

async function loadGitHubRepos() {
  if (!githubReposContainer) return;

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=12`
    );

    if (!response.ok) {
      throw new Error("GitHub repositories not found");
    }

    const repos = await response.json();

    const filteredRepos = repos
      .filter((repo) => !repo.fork)
      .sort((a, b) => {
        return new Date(b.updated_at) - new Date(a.updated_at);
      })
      .slice(0, 6);

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

    githubReposContainer.innerHTML = filteredRepos
      .map((repo) => createRepoCard(repo))
      .join("");
  } catch (error) {
    console.error("GitHub repositories error:", error);

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
    repo.description || "Public GitHub repository by Amine ELKARTITE.";
  const updatedDate = formatGitHubDate(repo.updated_at);

  return `
    <article class="github-repo-card">
      <span>${escapeHTML(language)}</span>
      <h3>${escapeHTML(repo.name)}</h3>
      <p>${escapeHTML(description)}</p>

      <div class="repo-meta">
        <small>★ ${repo.stargazers_count}</small>
        <small>⑂ ${repo.forks_count}</small>
        <small>Updated ${updatedDate}</small>
      </div>

      <a href="${repo.html_url}" target="_blank" rel="noreferrer">
        View repository
      </a>
    </article>
  `;
}

function formatGitHubDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}


/* =========================
   Dynamic Social Profiles
========================= */

const SOCIAL_PROFILES = {
  x: {
    username: "Amine_Elkartite",
    displayUsername: "@Amine_Elkartite",
    url: "https://x.com/Amine_Elkartite",
    description:
      "Cybersecurity, web development, SECUTrick updates and personal branding.",
  },

  linkedin: {
    name: "Amine ELKARTITE",
    url: "https://www.linkedin.com/in/amine-elkartite-7b4bb8323/",
    description:
      "Full Stack Developer | React / JavaScript / PHP | Cybersecurity | Secure applications.",
    headline: "Cyber Security Specialist · Founder @ SECUTrick",
    location: "Morocco · Hybrid / Remote",
  },
};

function loadDynamicSocialProfiles() {
  loadXProfile();
  loadLinkedInProfile();
}

function loadXProfile() {
  const xUsername = document.getElementById("xUsername");
  const xDescription = document.getElementById("xDescription");
  const xProfileLink = document.getElementById("xProfileLink");
  const xTimeline = document.getElementById("xTimeline");

  if (xUsername) {
    xUsername.textContent = SOCIAL_PROFILES.x.displayUsername;
  }

  if (xDescription) {
    xDescription.textContent = SOCIAL_PROFILES.x.description;
  }

  if (xProfileLink) {
    xProfileLink.href = SOCIAL_PROFILES.x.url;
  }

  if (xTimeline) {
    xTimeline.innerHTML = `
      <a
        class="twitter-timeline"
        data-height="420"
        data-theme="dark"
        href="${SOCIAL_PROFILES.x.url}"
      >
        Posts by ${SOCIAL_PROFILES.x.displayUsername}
      </a>
    `;

    loadXWidgetScript();
  }
}

function loadXWidgetScript() {
  const existingScript = document.querySelector(
    'script[src="https://platform.twitter.com/widgets.js"]'
  );

  if (existingScript) {
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load();
    }

    return;
  }

  const script = document.createElement("script");
  script.src = "https://platform.twitter.com/widgets.js";
  script.async = true;
  script.charset = "utf-8";
  document.body.appendChild(script);
}

function loadLinkedInProfile() {
  const linkedinName = document.getElementById("linkedinName");
  const linkedinDescription = document.getElementById("linkedinDescription");
  const linkedinProfileLink = document.getElementById("linkedinProfileLink");
  const linkedinConnectLink = document.getElementById("linkedinConnectLink");

  if (linkedinName) {
    linkedinName.textContent = SOCIAL_PROFILES.linkedin.name;
  }

  if (linkedinDescription) {
    linkedinDescription.textContent = SOCIAL_PROFILES.linkedin.description;
  }

  if (linkedinProfileLink) {
    linkedinProfileLink.href = SOCIAL_PROFILES.linkedin.url;
  }

  if (linkedinConnectLink) {
    linkedinConnectLink.href = SOCIAL_PROFILES.linkedin.url;
  }

  const linkedinPreview = document.querySelector(".linkedin-preview");

  if (linkedinPreview) {
    linkedinPreview.innerHTML = `
      <div class="linkedin-avatar">
        <img
          src="assets/avatars/linkedIn-removebg-preview.png"
          alt="${escapeHTML(SOCIAL_PROFILES.linkedin.name)} profile"
        />
      </div>

      <div>
        <h3>${escapeHTML(SOCIAL_PROFILES.linkedin.name)}</h3>
        <p>${escapeHTML(SOCIAL_PROFILES.linkedin.headline)}</p>
        <span>${escapeHTML(SOCIAL_PROFILES.linkedin.location)}</span>
      </div>
    `;
  }
}


/* =========================
   Security helper
========================= */

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================
   Init
========================= */

loadGitHubProfile();
loadGitHubRepos();
loadDynamicSocialProfiles();