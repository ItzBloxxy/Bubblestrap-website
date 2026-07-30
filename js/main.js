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
    const btn = document.getElementById("download-latest");
    if (!btn) return;

    const cacheKey = "bs_version_cache";
    let cached = null;
    
    try {
        cached = JSON.parse(localStorage.getItem(cacheKey));
    } catch (e) {
        // ignore the corrupted cache
    }

    const now = Date.now();
    
    if (cached && now - cached.timestamp < 60 * 60 * 1000) {
        renderVersion(btn, cached.version);
        return;
    }
    
    try {
        const res = await fetch("https://api.github.com/repos/ItzBloxxy/Bubblestrap/releases/latest");
        if (!res.ok) return;
        
        const data = await res.json();
        if (!data.tag_name) return;
        
        localStorage.setItem(cacheKey, JSON.stringify({ version: data.tag_name, timestamp: now }));
        renderVersion(btn, data.tag_name);
    } catch (err) {
        console.warn("Update check failed.", err);
    }
}

function renderVersion(btn, version) {
    btn.innerHTML = `<span class="icon icon-download btn-icon"></span> Download Bubblestrap ${version}`;
}

function handleRedirect() {
    const params = new URLSearchParams(location.search);
    const placeId = params.get("placeId");
    
    if (!placeId || !/^\d+$/.test(placeId)) return;
    
    const mainSite = document.getElementById("main-site");
    const joinOverlay = document.getElementById("join-overlay");
    
    if (!mainSite || !joinOverlay) return;
    
    mainSite.style.display = "none";
    joinOverlay.style.display = "flex";
    
    let robloxUrl = `roblox://placeId=${placeId}`;
    
    const accessCode = params.get("accessCode");
    const gameInstanceId = params.get("gameInstanceId");
    
    if (accessCode) {
        robloxUrl += `&accessCode=${accessCode}`;
    } else if (gameInstanceId) {
        robloxUrl += `&gameInstanceId=${gameInstanceId}`;
    }

    const joinStatus = document.getElementById("join-status");
    if (joinStatus) joinStatus.textContent = "Launching Roblox…";
    
    const btn = document.getElementById("manualJoinButton");
    if (btn) {
        btn.href = robloxUrl;
        btn.style.display = "inline-flex";
    }
    
    setTimeout(() => { location.href = robloxUrl; }, 1000);
}

window.addEventListener("DOMContentLoaded", () => {
    initObserver();
    handleRedirect();
    setVersionText();
});
