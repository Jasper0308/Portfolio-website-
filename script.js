// helpers
const $ = s => document.querySelector(s)
const $$ = s => Array.from(document.querySelectorAll(s))

// set current year
document.addEventListener('DOMContentLoaded', () => {
  const y = new Date().getFullYear()
  const yearEl = document.getElementById('year')
  if (yearEl) yearEl.textContent = y

  // create animated orbs
  const orbsRoot = document.querySelector('.orbs')
  if (orbsRoot) {
    const colors = [
      'rgba(255,20,147,0.95)',
      'rgba(0,200,255,0.9)',
      'rgba(0,255,120,0.9)',
      'rgba(255,180,0,0.85)',
      'rgba(180,0,255,0.85)'
    ]
    for (let i = 0; i < 5; i++) {
      const o = document.createElement('div')
      o.className = 'orb o' + (i + 1)
      o.style.background = colors[i % colors.length]
      orbsRoot.appendChild(o)
    }
  }

  // small parallax for orbs
  document.addEventListener('mousemove', (e) => {
    const cx = (e.clientX / window.innerWidth - 0.5)
    const cy = (e.clientY / window.innerHeight - 0.5)
    $$('.orbs .orb').forEach((orb, i) => {
      const speed = (i + 1) * 6
      orb.style.transform = `translate3d(${cx * speed}px, ${cy * speed}px, 0)`
    })
  })

  // reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('show')
    })
  }, { threshold: 0.12 })

  $$('.slide-up').forEach(el => io.observe(el))
  $$('.card').forEach(el => io.observe(el))

  // animate skill bars when visible
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const fills = e.target.querySelectorAll('.bar-fill')
        fills.forEach(f => {
          const v = f.getAttribute('data-fill') || 0
          f.style.width = v + '%'
        })
        skillObserver.unobserve(e.target)
      }
    })
  }, { threshold: 0.2 })
  $$('.skills').forEach(s => skillObserver.observe(s))

  // simple tilt for project cards
  $$('.project[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', tilt)
    card.addEventListener('pointerleave', resetTilt)
  })

  // add subtle glow on profile using canvas
  const canvas = document.querySelector('.pic-glow')
  const img = document.querySelector('.profile-pic')
  if (canvas && img && canvas.getContext) {
    function fitCanvas() {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      drawGlow()
    }
    function drawGlow() {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0,0,canvas.width,canvas.height)
      const grd = ctx.createLinearGradient(0,0,canvas.width,canvas.height)
      grd.addColorStop(0, 'rgba(255,20,147,0.12)')
      grd.addColorStop(0.5, 'rgba(0,200,255,0.12)')
      grd.addColorStop(1, 'rgba(0,255,120,0.10)')
      ctx.fillStyle = grd
      ctx.fillRect(0,0,canvas.width,canvas.height)
      ctx.globalCompositeOperation = 'lighter'
      for (let i=0; i<5; i++) {
        ctx.beginPath()
        ctx.arc(canvas.width/2, canvas.height/2, (canvas.width * 0.5) + i*8, 0, Math.PI*2)
        ctx.fillStyle = `rgba(255,255,255,${0.02 - i*0.002})`
        ctx.fill()
      }
    }
    window.addEventListener('resize', fitCanvas)
    fitCanvas()
  }

  // typed headline effect (non-blocking)
  $$('.typed').forEach(el => {
    const text = el.getAttribute('data-text') || el.textContent || ''
    el.textContent = ''
    let i = 0
    const tick = () => {
      if (i <= text.length) {
        el.textContent = text.slice(0, i)
        i++
        setTimeout(tick, 28)
      }
    }
    tick()
  })

  // footer social icon glow
  $$('.social-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.boxShadow = '0 10px 50px rgba(0,200,255,0.15)'
      link.style.transform = 'translateY(-6px) scale(1.06)'
    })
    link.addEventListener('mouseleave', () => {
      link.style.boxShadow = ''
      link.style.transform = ''
    })
  })
})

// tilt math functions
function tilt(e) {
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  const px = (e.clientX - rect.left) / rect.width
  const py = (e.clientY - rect.top) / rect.height
  const rx = (py - 0.5) * 10
  const ry = (px - 0.5) * -16
  el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`
}
function resetTilt(e) {
  e.currentTarget.style.transform = 'none'
}