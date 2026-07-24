const DOWNLOAD_ICON = `<span class="icon icon-download btn-icon"></span> `;

function initObserver() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

async function setVersionText() {
    const cacheKey = "bs_version_cache";
    const cacheExpiry = 3600000; // 1 hour
    const now = Date.now();

    const cachedData = (() => {
        try { return JSON.parse(localStorage.getItem(cacheKey)); } catch { return null; }
    })();

    // show cached version immediately if available 
    if (cachedData && (now - cachedData.timestamp < cacheExpiry)) {
        renderVersion(cachedData.version, false);
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch("https://api.github.com/repos/ItzBloxxy/Bubblestrap/releases/latest", {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) return;

        const data = await res.json();
        const newVersion = data.tag_name;
        if (!newVersion) return;

        const isNewUpdate = cachedData && cachedData.version !== newVersion;

        localStorage.setItem(cacheKey, JSON.stringify({ version: newVersion, timestamp: now }));
        renderVersion(newVersion, isNewUpdate);
    } catch (err) {
        console.warn("Update check failed.");
    }
}

function renderVersion(version, shouldAnimate) {
    const btn = document.getElementById("download-latest");
    if (!btn) return;

    // The icon markup is static/trusted, so innerHTML is fine here.
    btn.innerHTML = DOWNLOAD_ICON;
    // The version string comes from the GitHub API — append it as a text node
    // (not innerHTML) so it can never be interpreted as HTML/script.
    btn.appendChild(document.createTextNode(`Download Bubblestrap ${version}`));

    if (shouldAnimate) {
        btn.classList.add('version-update');
        setTimeout(() => btn.classList.remove('version-update'), 800);
    }
}

function handleRedirect() {
    const params = new URLSearchParams(location.search);
    const placeId = params.get("placeId");
    if (!placeId) return;

    document.getElementById("main-site").style.display = "none";
    document.getElementById("join-overlay").style.display = "flex";

    const accessCode = params.get("accessCode");
    const gameInstanceId = params.get("gameInstanceId");

    const robloxUrl = `roblox://placeId=${encodeURIComponent(placeId)}` +
        (accessCode ? `&accessCode=${encodeURIComponent(accessCode)}` :
         gameInstanceId ? `&gameInstanceId=${encodeURIComponent(gameInstanceId)}` : "");

    document.getElementById("join-status").textContent = "Launching Roblox…";
    const btn = document.getElementById("manualJoinButton");
    btn.href = robloxUrl;
    btn.style.display = "inline-flex";

    setTimeout(() => { location.href = robloxUrl; }, 1000);
}

window.addEventListener("DOMContentLoaded", () => {
    initObserver();
    handleRedirect();
    setVersionText();
});
