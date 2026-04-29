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
const dialogTitle = projectDialog.querySelector("h2");
const dialogType = projectDialog.querySelector(".dialog-type");
const dialogDesc = projectDialog.querySelector(".dialog-desc");
const dialogImage = projectDialog.querySelector(".dialog-image img");
const dialogTags = projectDialog.querySelector(".dialog-tags");
const dialogClose = projectDialog.querySelector(".dialog-close");
const yearTarget = document.querySelector("[data-year]");
const backToTopButton = document.querySelector(".back-to-top");

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progressValue = scrollable <= 0 ? 0 : (window.scrollY / scrollable) * 100;
  progress.style.width = `${progressValue}%`;

  if (backToTopButton) {
    backToTopButton.classList.toggle("is-visible", window.scrollY > 420);
  }
}

function openMenu() {
  body.classList.add("menu-open");
  menuPanel.classList.add("is-open");
  menuPanel.setAttribute("aria-hidden", "false");
  menuButton.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  body.classList.remove("menu-open");
  menuPanel.classList.remove("is-open");
  menuPanel.setAttribute("aria-hidden", "true");
  menuButton.setAttribute("aria-expanded", "false");
}

function closeProject() {
  if (typeof projectDialog.close === "function") {
    projectDialog.close();
  } else {
    projectDialog.removeAttribute("open");
  }
}

menuButton.addEventListener("click", () => {
  if (menuPanel.classList.contains("is-open")) {
    closeMenu();
  } else {
    openMenu();
  }
});

menuClose.addEventListener("click", closeMenu);
menuLinks.forEach((link) => link.addEventListener("click", closeMenu));
menuPanel.addEventListener("click", (event) => {
  if (event.target === menuPanel) {
    closeMenu();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    if (projectDialog.open) {
      closeProject();
    }
  }
});

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

if (backToTopButton) {
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

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

function openProject(card) {
  const tags = (card.dataset.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  dialogTitle.textContent = card.dataset.project;
  dialogType.textContent = card.dataset.type;
  dialogDesc.textContent = card.dataset.desc;
  dialogImage.src = card.dataset.image;
  dialogImage.alt = `${card.dataset.project} project preview`;
  dialogTags.innerHTML = "";

  tags.forEach((tag) => {
    const tagEl = document.createElement("span");
    tagEl.textContent = tag;
    dialogTags.appendChild(tagEl);
  });

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

dialogClose.addEventListener("click", closeProject);

projectDialog.addEventListener("click", (event) => {
  if (event.target === projectDialog) {
    closeProject();
  }
});
