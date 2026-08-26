(function () {
  const video = document.getElementById("bumper");
  const veil = document.querySelector(".play-veil");
  const list = document.getElementById("episode-list");
  const site = window.SITE || {};
  const slug = (site.rssSlug || "").trim();
  const rssUrl = (site.rssFeedUrl || "").trim();
  const platforms = site.platforms || {};

  Object.entries(platforms).forEach(([key, href]) => {
    if (!href) return;
    document.querySelectorAll(`[data-platform="${key}"]`).forEach((link) => {
      link.setAttribute("href", href);
    });
  });

  function emptyState() {
    list.innerHTML = `
      <article class="episode episode-empty">
        <p>New episodes dropping soon. Subscribe to get notified.</p>
      </article>`;
  }

  function renderPlayer() {
    if (!slug) {
      emptyState();
      return;
    }

    list.innerHTML = `
      <iframe
        class="rss-player"
        src="https://player.rss.com/${encodeURIComponent(slug)}/?limit=10"
        title="Bitcoin District Podcast"
        width="100%"
        height="500"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        scrolling="no"
      ></iframe>`;
  }

  async function loadEpisodes() {
    if (!slug && !rssUrl) {
      emptyState();
      return;
    }

    if (!rssUrl) {
      renderPlayer();
      return;
    }

    try {
      const response = await fetch(rssUrl, {
        headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      });
      if (!response.ok) throw new Error("feed unavailable");
      const xml = await response.text();
      const hasItems = /<item[\s>]/i.test(xml);
      if (hasItems) renderPlayer();
      else emptyState();
    } catch (error) {
      renderPlayer();
    }
  }

  if (veil && video) {
    const play = () => {
      video.play();
      veil.classList.add("is-hidden");
    };

    veil.addEventListener("click", play);
    video.addEventListener("click", () => {
      if (video.paused) play();
      else video.pause();
    });
    video.addEventListener("pause", () => {
      if (!video.ended) veil.classList.remove("is-hidden");
    });
    video.addEventListener("ended", () => {
      veil.classList.remove("is-hidden");
      veil.querySelector(".play-copy").textContent = "Replay intro";
    });
  }

  loadEpisodes();
})();
