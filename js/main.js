function initObserver() {
    var observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active")
                observer.unobserve(entry.target)
            }
        })
    }, { threshold: 0.05 })

    document.querySelectorAll(".reveal").forEach(el => observer.observe(el))
}

async function setVersionText() {
    const btn = document.getElementById('download-latest')
    if (!btn) return

    let res
    try {
        res = await fetch("https://api.github.com/repos/ItzBloxxy/Bubblestrap/releases/latest")
    } catch (e) {
        return // no internet or github's down, wtv
    }
    if (!res.ok) return

    const data = await res.json()
    if (!data.tag_name)
        return

    btn.innerHTML = `<span class="icon icon-download btn-icon"></span> Download Bubblestrap ${data.tag_name}`
}

function handleRedirect() {
    let params = new URLSearchParams(location.search)
    const placeId = params.get("placeId")
    if (!placeId || !/^\d+$/.test(placeId)) return
    document.getElementById("main-site").style.display = "none"
    document.getElementById("join-overlay").style.display = "flex"

    let robloxUrl = `roblox://placeId=${placeId}`

    const accessCode = params.get("accessCode")
    const gameInstanceId = params.get("gameInstanceId")
    if (accessCode) robloxUrl += `&accessCode=${encodeURIComponent(accessCode)}`
    else if (gameInstanceId) robloxUrl += `&gameInstanceId=${encodeURIComponent(gameInstanceId)}`
    console.warn("Redirecting to Roblox:", robloxUrl)

    document.getElementById("join-status").textContent = "Launching Roblox…"

    const manualBtn = document.getElementById("manualJoinButton")
    manualBtn.href = robloxUrl

    // some browsers block instant redirects, so a cooldown is needed
    setTimeout(() => location.href = robloxUrl, 800)
}

window.addEventListener("DOMContentLoaded", function() {
    initObserver()
    handleRedirect()
    setVersionText()
})
