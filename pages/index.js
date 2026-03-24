import { client } from '../lib/sanity'
import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'

export async function getStaticProps() {
  const studioProjects = await client.fetch(`
    *[_type == "studioProject"] | order(order asc) {
      _id, title, client, category, year, format,
      "thumbnail": thumbnail.asset->url,
      videoLoopUrl, featured
    }
  `)
  const productions = await client.fetch(`
    *[_type == "production"] | order(order asc) {
      _id, title, director, genre, year, status, festivals,
      "poster": poster.asset->url,
      thumbnailColor
    }
  `)
  const teamMembers = await client.fetch(`
    *[_type == "teamMember"] | order(order asc) {
      _id, name, role, email,
      "photo": photo.asset->url
    }
  `)
  const clients = await client.fetch(`
    *[_type == "client"] | order(order asc) {
      _id, name, type,
      "logo": logo.asset->url
    }
  `)
  const showreels = await client.fetch(`
    *[_type == "showreel"] {
      _id, title, subtitle, type, framerateEmbedUrl
    }
  `)

  return {
    props: { studioProjects, productions, teamMembers, clients, showreels },
    revalidate: 30
  }
}

const statusLabel = { released: 'Released', post: 'Post-Production', dev: 'In Development' }

export default function Home({ studioProjects, productions, teamMembers, clients, showreels }) {
  const [page, setPage] = useState('gateway')
  const [intro, setIntro] = useState(true)
  const curRef = useRef(null)

  useEffect(() => {
    const mv = e => {
      if (curRef.current) {
        curRef.current.style.left = e.clientX + 'px'
        curRef.current.style.top = e.clientY + 'px'
      }
    }
    const ov = e => {
      if (curRef.current)
        curRef.current.classList.toggle('h', !!e.target.closest('button,[data-hover],.sg-item,.pg-item,.gw-panel'))
    }
    window.addEventListener('mousemove', mv)
    window.addEventListener('mouseover', ov)
    return () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseover', ov) }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setIntro(false)
    }, 3200)
    return () => clearTimeout(t)
  }, [])

  // Gateway hover
  useEffect(() => {
    if (page !== 'gateway') return
    const studio = document.getElementById('panel-studio')
    const prod = document.getElementById('panel-prod')
    if (!studio || !prod) return
    const onSE = () => { prod.classList.add('hover-studio'); prod.classList.remove('hover-prod'); studio.classList.add('hover-studio') }
    const onSL = () => { prod.classList.remove('hover-studio'); studio.classList.remove('hover-studio') }
    const onPE = () => { prod.classList.add('hover-prod'); prod.classList.remove('hover-studio'); studio.classList.add('hover-prod') }
    const onPL = () => { prod.classList.remove('hover-prod'); studio.classList.remove('hover-prod') }
    studio.addEventListener('mouseenter', onSE)
    studio.addEventListener('mouseleave', onSL)
    prod.addEventListener('mouseenter', onPE)
    prod.addEventListener('mouseleave', onPL)
    return () => {
      studio.removeEventListener('mouseenter', onSE); studio.removeEventListener('mouseleave', onSL)
      prod.removeEventListener('mouseenter', onPE); prod.removeEventListener('mouseleave', onPL)
    }
  }, [page])

  const [modal, setModal] = useState(null) // { url, title }

  const openModal = (url, title) => { if (url) setModal({ url, title }) }
  const closeModal = () => setModal(null)

  const studioList = studioProjects.length > 0 ? studioProjects : [
    { _id:'1', title:'Eclipse VFX', client:'Canal+', category:'Visual Effects', year:'2024', format:'4K HDR' },
    { _id:'2', title:'Songe d\'une Nuit', client:'Arte', category:'Color Grading', year:'2024', format:'DCP' },
    { _id:'3', title:'Urban Decay', client:'Nike', category:'Motion Design', year:'2023', format:'Social / OOH' },
    { _id:'4', title:'Fractures', client:'Netflix', category:'Post-Production', year:'2024', format:'Dolby Vision' },
    { _id:'5', title:'Lumière Noire', client:'Dior', category:'Comp & VFX', year:'2023', format:'4K' },
    { _id:'6', title:'Territories', client:'Arte/ZDF', category:'Grade & Sound', year:'2024', format:'HDR10+' },
    { _id:'7', title:'Deep Blue', client:'Greenpeace', category:'Motion + VFX', year:'2023', format:'4K' },
  ]

  const prodList = productions.length > 0 ? productions : [
    { _id:'1', title:'La Chute du Verbe', director:'Camille Roux', genre:'Drama', year:'2024', status:'dev', festivals:['Cannes L.C.','ACID 2025'] },
    { _id:'2', title:'Mémoire Vive', director:'Jonas Merck', genre:'Thriller', year:'2023', status:'post', festivals:['Sundance 2024'] },
    { _id:'3', title:'Les Absents', director:'Aïsha Diallo', genre:'Short Film', year:'2023', status:'released', festivals:['César','Clermont-Ferrand'] },
    { _id:'4', title:'Strates', director:'Paul Vernet', genre:'Documentary', year:'2024', status:'dev', festivals:[] },
    { _id:'5', title:'Corps Étrangers', director:'Lila Kern', genre:'Drama', year:'2025', status:'dev', festivals:[] },
    { _id:'6', title:'Le Passeur', director:'Marc Allain', genre:'Feature Film', year:'2023', status:'released', festivals:['Locarno','Unifrance'] },
  ]

  const teamList = teamMembers.length > 0 ? teamMembers : [
    { _id:'1', name:'Pierre-Joseph Secondi', role:'Founder · Producer · Director', email:'pierre@weareirl.com' },
    { _id:'2', name:'Vincent Laurin', role:'Director · Editor', email:'vincent@weareirl.com' },
    { _id:'3', name:'Basile Boveroux', role:'Production Manager', email:'basile@weareirl.com' },
    { _id:'4', name:'Gautier Houillon', role:'Creative & Artistic Director', email:'gautier@weareirl.com' },
    { _id:'5', name:'Lionel Dourt', role:'Senior 3D & VFX Artist', email:'lionel@weareirl.com' },
    { _id:'6', name:'Anne-Gaëlle Geoffroy', role:'Editor · Junior VFX & 3D Artist', email:'anne-gaelle@weareirl.com' },
  ]

  const clientList = clients.length > 0 ? clients : [
    { _id:'1', name:'Canal+', type:'production' }, { _id:'2', name:'Netflix', type:'production' },
    { _id:'3', name:'Arte', type:'production' },   { _id:'4', name:'ZDF', type:'production' },
    { _id:'5', name:'Greenpeace', type:'production' }, { _id:'6', name:'Client 06', type:'production' },
    { _id:'7', name:'Dior', type:'brand' },        { _id:'8', name:'Nike', type:'brand' },
    { _id:'9', name:'Omega', type:'brand' },       { _id:'10', name:'Brand 04', type:'brand' },
    { _id:'11', name:'Brand 05', type:'brand' },   { _id:'12', name:'Brand 06', type:'brand' },
  ]

  const generalReel = showreels.find(s => s.type === 'general') || { framerateEmbedUrl: 'https://framerate.tv/embed/f25fba94-20aa-4a22-8692-2a990683f769?primary_color=%2523ffffff&track_color=%2523ffffff&theme=minimal', title: 'General Showreel', subtitle: 'Production · Direction · Post' }
  const vfxReel    = showreels.find(s => s.type === 'vfx')     || { framerateEmbedUrl: 'https://framerate.tv/embed/673d357a-2c4e-44a6-a8e9-bba376ed9594?primary_color=%2523ffffff&track_color=%2523ffffff&theme=minimal', title: '3D / VFX / AI Showreel', subtitle: 'Visual Effects · Motion · AI' }

  const hues = ['20,20,20','12,12,18','18,12,12','10,11,15','19,17,12','10,14,11','9,13,19']
  const phues = ['18,11,8','9,12,19','15,9,12','13,13,9','11,17,13','19,13,17']

  return (
    <>
      <Head>
        <title>In Real Life</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--k:#000;--w:#fff;--cream:#e8e3dc;--gold:#a89878;--muted:#5a5a5a;--D:'Syne',sans-serif;--M:'DM Mono',monospace}
        html,body{background:var(--k);color:var(--w);height:100%;overflow:hidden}
        body{font-family:var(--D);-webkit-font-smoothing:antialiased}
        ::selection{background:var(--gold);color:var(--k)}
        .cur{position:fixed;width:5px;height:5px;background:var(--w);border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:width .35s,height .35s,opacity .35s;mix-blend-mode:difference}
        .cur.h{width:38px;height:38px;opacity:.45}
        .screen{display:none;width:100vw;height:100vh}
        .screen.active{display:flex;flex-direction:column}
        #s-intro{background:var(--k);align-items:center;justify-content:center;flex-direction:column;position:fixed;inset:0;z-index:300;transition:opacity .85s}
        #s-intro.out{opacity:0;pointer-events:none}
        .intro-logo{width:clamp(64px,9vw,100px);opacity:0;transform:scale(.88);animation:logoIn .9s cubic-bezier(.33,1,.68,1) .3s forwards}
        @keyframes logoIn{to{opacity:1;transform:scale(1)}}
        .intro-sep{width:1px;height:0;background:rgba(255,255,255,.15);margin:2.6rem auto;animation:lineGrow .5s ease .95s forwards}
        @keyframes lineGrow{to{height:40px}}
        .intro-tagline{overflow:hidden;text-align:center}
        .intro-line1,.intro-line2{font-family:var(--D);font-weight:500;font-size:clamp(11px,1.05vw,15px);letter-spacing:.22em;text-transform:uppercase;color:var(--cream);display:block;transform:translateY(100%);opacity:0}
        .intro-line1{animation:wordUp .7s cubic-bezier(.33,1,.68,1) 1.05s forwards}
        .intro-line2{color:var(--gold);font-weight:400;margin-top:.65rem;letter-spacing:.28em;animation:wordUp .7s cubic-bezier(.33,1,.68,1) 1.25s forwards}
        @keyframes wordUp{to{transform:translateY(0);opacity:1}}
        #s-gateway{position:relative;overflow:hidden;background:#000;animation:fadeIn .9s ease forwards}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .gw-panel{position:absolute;inset:0;display:flex;align-items:flex-end;padding:4vw 4.5vw;cursor:none}
        .gw-studio{z-index:1;background:#080808;clip-path:polygon(0 0,55% 0,40% 100%,0 100%);transition:clip-path 1.1s cubic-bezier(.76,0,.24,1)}
        .gw-studio.hover-studio{clip-path:polygon(0 0,65% 0,50% 100%,0 100%)}
        .gw-studio.hover-prod{clip-path:polygon(0 0,42% 0,27% 100%,0 100%)}
        .gw-prod{z-index:2;background:#06060a;justify-content:flex-end;clip-path:polygon(55% 0,100% 0,100% 100%,40% 100%);transition:clip-path 1.1s cubic-bezier(.76,0,.24,1)}
        .gw-prod.hover-prod{clip-path:polygon(42% 0,100% 0,100% 100%,27% 100%)}
        .gw-prod.hover-studio{clip-path:polygon(65% 0,100% 0,100% 100%,50% 100%)}
        .gw-iframe-wrap{position:absolute;inset:0;overflow:hidden;z-index:0;opacity:0;transition:opacity 1.4s ease}
        .gw-panel:hover .gw-iframe-wrap{opacity:1}
        .gw-studio .gw-iframe-wrap{clip-path:polygon(0 0,55% 0,40% 100%,0 100%)}
        .gw-studio .gw-iframe-wrap iframe{position:absolute;top:50%;left:23%;width:calc(100vh * 16 / 9);height:100%;transform:translate(-50%,-50%);border:none;pointer-events:none}
        .gw-prod .gw-iframe-wrap iframe{position:absolute;top:50%;left:73%;width:calc(100vh * 16 / 9);height:100%;transform:translate(-50%,-50%);border:none;pointer-events:none}
        .gw-vignette{position:absolute;inset:0;z-index:1;background:linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.15) 70%)}
        .gw-idx{position:absolute;top:2.5rem;left:4.5vw;z-index:3;font-family:var(--M);font-size:9px;letter-spacing:.22em;color:rgba(255,255,255,.16)}
        .gw-mark{position:absolute;top:2.2rem;right:2.5rem;z-index:3;width:26px;opacity:.12;transition:opacity .6s}
        .gw-panel:hover .gw-mark{opacity:.28}
        .gw-content{position:relative;z-index:3}
        .gw-tag{font-family:var(--M);font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:.7rem;margin-bottom:1.6rem;opacity:0;transform:translateY(5px);transition:opacity .55s .08s,transform .55s .08s}
        .gw-tag::before{content:'';width:24px;height:1px;background:currentColor}
        .gw-panel:hover .gw-tag{opacity:1;transform:translateY(0)}
        .gw-title{font-family:var(--D);font-weight:700;text-transform:uppercase;font-size:clamp(28px,4vw,72px);line-height:.9;letter-spacing:-.04em;color:var(--w);white-space:nowrap}
        .gw-sub{font-family:var(--M);font-size:11px;letter-spacing:.22em;color:var(--cream);opacity:0;margin-top:1.4rem;line-height:1.9;transform:translateY(7px);transition:opacity .65s .18s,transform .65s .18s}
        .gw-panel:hover .gw-sub{opacity:.38;transform:translateY(0)}
        .gw-cta{display:inline-flex;align-items:center;gap:.9rem;margin-top:2.8rem;font-family:var(--M);font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);opacity:0;transform:translateY(7px);transition:opacity .65s .28s,transform .65s .28s}
        .gw-cta-line{width:32px;height:1px;background:currentColor}
        .gw-panel:hover .gw-cta{opacity:1;transform:translateY(0)}
        .gw-svg-line{position:absolute;inset:0;z-index:10;pointer-events:none;width:100%;height:100%}
        .gw-prod .gw-content{text-align:right}
        .gw-prod .gw-tag{flex-direction:row-reverse}
        .gw-prod .gw-tag::before{display:none}
        .gw-prod .gw-tag::after{content:'';width:18px;height:1px;background:currentColor}
        .gw-prod .gw-cta{flex-direction:row-reverse}
        nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:1.8rem 3rem;display:flex;justify-content:space-between;align-items:center}
        .nav-brand{display:flex;align-items:center;gap:.9rem;cursor:none;background:none;border:none;color:var(--w)}
        .nav-logo{width:22px;opacity:.85}
        .nav-name{font-family:var(--D);font-weight:700;font-size:13px;letter-spacing:.18em;text-transform:uppercase}
        .nav-name em{font-style:normal;color:var(--gold)}
        .nav-right{display:flex;align-items:center;gap:2.2rem}
        .nav-btn{font-family:var(--M);font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);background:none;border:none;cursor:none;padding:0;transition:color .3s;position:relative}
        .nav-btn::after{content:'';position:absolute;bottom:-3px;left:0;right:0;height:1px;background:var(--gold);transform:scaleX(0);transition:transform .3s}
        .nav-btn:hover,.nav-btn.on{color:var(--w)}
        .nav-btn.on::after,.nav-btn:hover::after{transform:scaleX(1)}
        .page{width:100vw;height:100vh;background:var(--k);overflow-y:auto;animation:pgIn .7s cubic-bezier(.76,0,.24,1) forwards;flex-direction:column}
        @keyframes pgIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .s-head{padding:8.5rem 5vw 3rem;display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid rgba(255,255,255,.05)}
        .s-title{font-family:var(--D);font-weight:700;text-transform:uppercase;font-size:clamp(64px,10vw,148px);letter-spacing:-.05em;line-height:.82}
        .s-meta{font-family:var(--M);font-size:12px;letter-spacing:.2em;color:var(--muted);text-align:right;line-height:2.2}
        .s-meta b{font-weight:400;color:var(--gold)}
        .sg{padding:3px;display:grid;gap:3px;grid-template-columns:repeat(12,1fr);background:rgba(255,255,255,.03)}
        .sg-item{background:var(--k);position:relative;overflow:hidden;cursor:none}
        .sg-item:nth-child(1){grid-column:1/8}.sg-item:nth-child(2){grid-column:8/13}.sg-item:nth-child(3){grid-column:1/5}.sg-item:nth-child(4){grid-column:5/10}.sg-item:nth-child(5){grid-column:10/13}.sg-item:nth-child(6){grid-column:1/6}.sg-item:nth-child(7){grid-column:6/13}
        .sg-thumb{aspect-ratio:16/9;width:100%;position:relative;overflow:hidden;background:#060606}
        .sg-item:nth-child(2) .sg-thumb,.sg-item:nth-child(5) .sg-thumb{aspect-ratio:4/5}
        .sg-item:nth-child(3) .sg-thumb{aspect-ratio:1}
        .sg-bg{position:absolute;inset:0;transition:transform .9s cubic-bezier(.76,0,.24,1)}
        .sg-item:hover .sg-bg{transform:scale(1.04)}
        .sg-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.88) 0%,transparent 55%);opacity:0;transition:opacity .5s}
        .sg-item:hover .sg-ov{opacity:1}
        .sg-info{position:absolute;bottom:0;left:0;right:0;padding:1.4rem;transform:translateY(5px);opacity:0;transition:transform .5s cubic-bezier(.76,0,.24,1),opacity .5s}
        .sg-item:hover .sg-info{transform:translateY(0);opacity:1}
        .sg-cat{font-family:var(--M);font-size:10px;letter-spacing:.28em;color:var(--gold);text-transform:uppercase;margin-bottom:.3rem}
        .sg-name{font-family:var(--D);font-weight:600;font-size:clamp(18px,2.2vw,28px);letter-spacing:-.02em;text-transform:uppercase}
        .sg-cl{font-family:var(--M);font-size:11px;letter-spacing:.15em;color:var(--cream);opacity:.4;margin-top:.25rem}
        .sg-n{position:absolute;top:1rem;right:1.1rem;font-family:var(--M);font-size:11px;letter-spacing:.15em;color:rgba(255,255,255,.2);z-index:3}
        .pg{padding:3px;display:grid;gap:3px;grid-template-columns:repeat(12,1fr);background:rgba(255,255,255,.03)}
        .pg-item{background:var(--k);position:relative;overflow:hidden;cursor:none}
        .pg-item:nth-child(1){grid-column:1/6}.pg-item:nth-child(2){grid-column:6/13}.pg-item:nth-child(3){grid-column:1/5}.pg-item:nth-child(4){grid-column:5/9}.pg-item:nth-child(5){grid-column:9/13}.pg-item:nth-child(6){grid-column:1/13}
        .pg-thumb{aspect-ratio:16/9;width:100%;position:relative;overflow:hidden;background:#060606}
        .pg-item:nth-child(1) .pg-thumb{aspect-ratio:4/5}.pg-item:nth-child(3) .pg-thumb{aspect-ratio:1}.pg-item:nth-child(5) .pg-thumb{aspect-ratio:3/4}.pg-item:nth-child(6) .pg-thumb{aspect-ratio:21/6}
        .pg-bg{position:absolute;inset:0;transition:transform .9s cubic-bezier(.76,0,.24,1)}
        .pg-item:hover .pg-bg{transform:scale(1.04)}
        .pg-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.88) 0%,transparent 55%);opacity:0;transition:opacity .5s}
        .pg-item:hover .pg-ov{opacity:1}
        .pg-info{position:absolute;bottom:0;left:0;right:0;padding:1.4rem;transform:translateY(5px);opacity:0;transition:transform .5s cubic-bezier(.76,0,.24,1),opacity .5s}
        .pg-item:hover .pg-info{transform:translateY(0);opacity:1}
        .pg-badge{font-family:var(--M);font-size:10px;letter-spacing:.25em;text-transform:uppercase;padding:2px 7px;border:1px solid;display:inline-block;margin-bottom:.5rem}
        .released{color:var(--gold);border-color:rgba(168,152,120,.3)}.post{color:#85afc4;border-color:rgba(133,175,196,.28)}.dev{color:var(--muted);border-color:rgba(56,56,56,.7)}
        .pg-title{font-family:var(--D);font-weight:600;font-size:clamp(16px,2vw,26px);letter-spacing:-.02em;text-transform:uppercase;color:var(--w);line-height:1}
        .pg-dir{font-family:var(--M);font-size:11px;letter-spacing:.18em;color:var(--cream);opacity:.5;margin-top:.3rem}
        .pg-fests{display:flex;flex-wrap:wrap;gap:8px;margin-top:.5rem}
        .pg-fest{font-family:var(--M);font-size:10px;letter-spacing:.16em;color:var(--gold);opacity:.85}
        .pg-n{position:absolute;top:1rem;right:1.1rem;font-family:var(--M);font-size:11px;letter-spacing:.15em;color:rgba(255,255,255,.2);z-index:3}
        footer{padding:2.2rem 5vw;border-top:1px solid rgba(255,255,255,.05);display:flex;justify-content:space-between;align-items:center;margin-top:auto}
        .ft-l{font-family:var(--M);font-size:11px;letter-spacing:.2em;color:var(--muted)}
        .ft-r{display:flex;gap:2.5rem}
        .ft-a{font-family:var(--M);font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);background:none;border:none;cursor:none;transition:color .3s}
        .ft-a:hover{color:var(--gold)}
        .ab-tag{font-family:var(--M);font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:1rem;margin-bottom:3rem}
        .ab-tag span{width:28px;height:1px;background:var(--gold);display:block}
        .ab-manifesto{display:grid;grid-template-columns:1fr 1fr;gap:6vw;padding:5rem 5vw;border-bottom:1px solid rgba(255,255,255,.06);align-items:start}
        .ab-lead{font-family:var(--D);font-weight:700;font-size:clamp(28px,3.8vw,56px);line-height:1.1;letter-spacing:-.035em;color:var(--w)}
        .ab-lead em{font-style:normal;color:var(--gold)}
        .ab-body{font-family:var(--M);font-weight:300;font-size:13px;letter-spacing:.05em;line-height:2.1;color:#525252}
        .ab-body+.ab-body{margin-top:1.5rem}
        .ab-reels{padding:5rem 5vw;border-bottom:1px solid rgba(255,255,255,.06)}
        .ab-reels-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px}
        .ab-reel{position:relative}
        .ab-reel-info{padding:1.2rem 0 0;display:flex;align-items:baseline;gap:1rem}
        .ab-reel-num{font-family:var(--M);font-size:11px;letter-spacing:.2em;color:var(--gold);flex-shrink:0}
        .ab-reel-title{font-family:var(--D);font-weight:600;font-size:clamp(14px,1.5vw,19px);letter-spacing:-.02em;text-transform:uppercase;color:var(--w)}
        .ab-reel-sub{font-family:var(--M);font-size:11px;letter-spacing:.18em;color:var(--muted);text-transform:uppercase;margin-top:.3rem}
        .ab-services{padding:5rem 5vw;border-bottom:1px solid rgba(255,255,255,.06)}
        .ab-services-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:3px}
        .ab-service{position:relative;overflow:hidden;background:#060606;cursor:none;transition:background .4s}
        .ab-service-img{aspect-ratio:3/4;width:100%;position:relative;overflow:hidden;background:#0d0d0d}
        .ab-service-img-inner{position:absolute;inset:0;background:linear-gradient(160deg,#141414 0%,#080808 100%);transition:transform .9s cubic-bezier(.76,0,.24,1);display:flex;align-items:center;justify-content:center}
        .ab-service:hover .ab-service-img-inner{transform:scale(1.05)}
        .ab-service-img-label{font-family:var(--M);font-size:8px;letter-spacing:.3em;color:rgba(255,255,255,.08);text-transform:uppercase}
        .ab-service-body{padding:1.4rem 1.2rem 1.8rem}
        .ab-service-num{font-family:var(--M);font-size:10px;letter-spacing:.25em;color:var(--gold);margin-bottom:.7rem}
        .ab-service-title{font-family:var(--D);font-weight:700;font-size:clamp(13px,1.2vw,16px);letter-spacing:-.015em;text-transform:uppercase;color:var(--w);line-height:1.1;margin-bottom:.8rem}
        .ab-service-desc{font-family:var(--M);font-weight:300;font-size:11px;letter-spacing:.04em;line-height:1.85;color:#444;transition:color .4s}
        .ab-service:hover .ab-service-desc{color:#5a5a5a}
        .ab-clients{padding:5rem 5vw;border-bottom:1px solid rgba(255,255,255,.06)}
        .ab-clients-split{display:grid;grid-template-columns:1fr auto 1fr;gap:0;align-items:start}
        .ab-clients-col-label{font-family:var(--M);font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:var(--muted);margin-bottom:1.2rem}
        .ab-clients-divider{width:1px;background:rgba(255,255,255,.06);margin:0 4vw;align-self:stretch}
        .ab-clients-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,.04)}
        .ab-client{background:var(--k);font-family:var(--D);font-weight:700;font-size:clamp(11px,1vw,14px);letter-spacing:.04em;text-transform:uppercase;color:rgba(255,255,255,.18);padding:1.6rem 1.2rem;transition:color .4s,background .4s;cursor:none;text-align:center}
        .ab-client:hover{color:var(--w);background:#080808}
        .ab-team{padding:5rem 5vw;border-bottom:1px solid rgba(255,255,255,.06)}
        .ab-team-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:2.5rem;align-items:start}
        .ab-member{display:flex;flex-direction:column;align-items:center;text-align:center;cursor:none}
        .ab-member-photo-wrap{width:clamp(90px,9vw,130px);height:clamp(90px,9vw,130px);border-radius:50%;overflow:hidden;border:1px solid rgba(255,255,255,.08);flex-shrink:0;transition:border-color .4s}
        .ab-member:hover .ab-member-photo-wrap{border-color:var(--gold)}
        .ab-member-photo{width:100%;height:100%;background:#0d0d0d;display:flex;align-items:center;justify-content:center;transition:transform .5s cubic-bezier(.76,0,.24,1)}
        .ab-member:hover .ab-member-photo{transform:scale(1.08)}
        .ab-member-photo::after{content:'+';font-family:var(--M);font-size:20px;color:rgba(255,255,255,.12);font-weight:300}
        .ab-member-name{font-family:var(--D);font-weight:600;font-size:clamp(11px,1vw,13px);letter-spacing:-.005em;text-transform:uppercase;color:var(--w);margin-top:1rem;line-height:1.2;transition:color .3s}
        .ab-member:hover .ab-member-name{color:var(--cream)}
        .ab-member-role{font-family:var(--M);font-size:10px;letter-spacing:.18em;color:var(--gold);margin-top:.35rem;text-transform:uppercase;line-height:1.5}
        .ab-member-email{font-family:var(--M);font-size:10px;letter-spacing:.08em;color:var(--muted);margin-top:.4rem;transition:color .3s}
        .ab-member:hover .ab-member-email{color:var(--cream)}
        .ab-closing{padding:7rem 5vw;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;text-align:center;border-top:1px solid rgba(255,255,255,.05)}
        .ab-closing-logo{width:clamp(52px,7vw,80px);opacity:.9}
        .ab-closing-sep{width:1px;height:40px;background:rgba(255,255,255,.15);margin:2.2rem auto}
        .ab-closing-line1{font-family:var(--D);font-weight:500;font-size:clamp(13px,1.3vw,18px);letter-spacing:.22em;text-transform:uppercase;color:var(--cream);display:block;line-height:1}
        .ab-closing-line2{font-family:var(--D);font-weight:400;font-size:clamp(13px,1.3vw,18px);letter-spacing:.28em;text-transform:uppercase;color:var(--gold);display:block;margin-top:.65rem;line-height:1}
        .ct-wrap{display:grid;grid-template-columns:1fr 1fr;gap:0;min-height:calc(100vh - 12rem)}
        .ct-left{padding:4rem 5vw;border-right:1px solid rgba(255,255,255,.06);display:flex;flex-direction:column;justify-content:space-between}
        .ct-right{padding:4rem 5vw;display:flex;flex-direction:column;gap:4rem}
        .ct-form{display:flex;flex-direction:column;gap:0}
        .ct-field{display:flex;flex-direction:column;gap:.5rem;border-bottom:1px solid rgba(255,255,255,.07);padding:1.8rem 0}
        .ct-field:first-child{border-top:1px solid rgba(255,255,255,.07)}
        .ct-label{font-family:var(--M);font-size:9px;letter-spacing:.3em;text-transform:uppercase;color:var(--gold)}
        .ct-input,.ct-textarea{font-family:var(--M);font-size:13px;letter-spacing:.05em;color:var(--w);background:none;border:none;outline:none;padding:.3rem 0;width:100%;resize:none;caret-color:var(--gold)}
        .ct-input::placeholder,.ct-textarea::placeholder{color:var(--muted)}
        .ct-textarea{min-height:120px}
        .ct-submit{display:inline-flex;align-items:center;gap:1rem;margin-top:2.5rem;font-family:var(--M);font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:var(--k);background:var(--gold);border:none;cursor:none;padding:1rem 2rem;transition:background .3s,gap .3s}
        .ct-submit:hover{background:var(--cream);gap:1.4rem}
        .ct-sent{display:none;font-family:var(--M);font-size:12px;letter-spacing:.15em;margin-top:1.5rem}
        .ct-info-tag{font-family:var(--M);font-size:9px;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:.8rem;margin-bottom:1rem}
        .ct-info-tag::before{content:'';width:20px;height:1px;background:var(--gold)}
        .ct-address{font-family:var(--M);font-size:12px;letter-spacing:.08em;color:var(--cream);line-height:2;opacity:.7}
        .ct-address strong{font-weight:400;color:var(--w);opacity:1;display:block;font-size:11px;letter-spacing:.2em;text-transform:uppercase;margin-bottom:.4rem;font-family:var(--D);font-weight:600}
        .ct-socials{display:flex;flex-direction:column;gap:.8rem;margin-top:.5rem}
        .ct-social{display:inline-flex;align-items:center;gap:.9rem;font-family:var(--M);font-size:11px;letter-spacing:.15em;color:var(--muted);text-decoration:none;transition:color .3s;cursor:none}
        .ct-social:hover{color:var(--w)}
        .ct-social-line{width:20px;height:1px;background:currentColor;flex-shrink:0}
        .lg-wrap{padding:4rem 5vw 6rem;max-width:860px}
        .lg-block{padding:3rem 0}
        .lg-block-tag{font-family:var(--M);font-size:9px;letter-spacing:.28em;text-transform:uppercase;color:var(--gold);margin-bottom:.8rem}
        .lg-block-title{font-family:var(--D);font-weight:700;font-size:clamp(20px,2.5vw,32px);letter-spacing:-.03em;text-transform:uppercase;color:var(--w);margin-bottom:1.8rem;line-height:1}
        .lg-grid{display:flex;flex-direction:column;gap:0}
        .lg-row{display:grid;grid-template-columns:280px 1fr;padding:.9rem 0;border-bottom:1px solid rgba(255,255,255,.04)}
        .lg-row:first-child{border-top:1px solid rgba(255,255,255,.04)}
        .lg-key{font-family:var(--M);font-size:11px;letter-spacing:.15em;color:var(--muted);text-transform:uppercase}
        .lg-val{font-family:var(--M);font-size:11px;letter-spacing:.08em;color:var(--cream);opacity:.7}
        .lg-sep{height:1px;background:rgba(255,255,255,.06)}
        .lg-text{font-family:var(--M);font-weight:300;font-size:12px;letter-spacing:.05em;line-height:2;color:var(--muted)}
        .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:500;display:flex;align-items:center;justify-content:center;cursor:none;animation:fadeIn .3s ease}
        .modal-inner{position:relative;width:90vw;max-width:1200px}
        .modal-close{position:absolute;top:-2.5rem;right:0;font-family:var(--M);font-size:10px;letter-spacing:.25em;text-transform:uppercase;color:var(--muted);background:none;border:none;cursor:none;transition:color .3s;padding:0}
        .modal-close:hover{color:var(--w)}
        .modal-video{position:relative;padding-bottom:56.25%;height:0;overflow:hidden;background:#000}
        .modal-video iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:none}
        .modal-title{font-family:var(--D);font-weight:600;font-size:clamp(14px,1.5vw,20px);letter-spacing:-.02em;text-transform:uppercase;color:var(--w);margin-top:1.2rem}
          .sg-item,.pg-item{grid-column:1/-1!important}
          .s-head{flex-direction:column;gap:1rem;align-items:flex-start}
          nav{padding:1.2rem 1.5rem}
          .ab-manifesto{grid-template-columns:1fr}
          .ab-reels-grid{grid-template-columns:1fr}
          .ab-services-grid{grid-template-columns:repeat(2,1fr)}
          .ab-clients-grid{grid-template-columns:repeat(3,1fr)}
          .ab-team-grid{grid-template-columns:repeat(3,1fr)}
          .ct-wrap{grid-template-columns:1fr}
          .ct-left{border-right:none;border-bottom:1px solid rgba(255,255,255,.06)}
          .lg-row{grid-template-columns:1fr;gap:.3rem}
        }
      `}</style>

      {/* CURSOR */}
      <div ref={curRef} className="cur" />

      {/* INTRO */}
      <div id="s-intro" className={`screen active${!intro ? ' out' : ''}`} style={{display:'flex'}}>
        <img src="/LOGO_IRL_WHITE.png" alt="IRL" className="intro-logo" />
        <div className="intro-sep" />
        <div className="intro-tagline">
          <span className="intro-line1">We are In Real Life.</span>
          <span className="intro-line2">House of Possibilities.</span>
        </div>
      </div>

      {/* NAV */}
      {page !== 'gateway' && (
        <nav>
          <button className="nav-brand" onClick={() => setPage('gateway')}>
            <img src="/LOGO_IRL_WHITE.png" alt="IRL" className="nav-logo" />
            <span className="nav-name">In Real Life <em>·</em> {page === 'studio' ? 'Studio' : page === 'prod' ? 'Productions' : page === 'about' ? 'About' : page === 'contact' ? 'Contact' : 'Legal'}</span>
          </button>
          <div className="nav-right">
            {['studio','prod','about','contact'].map(p => (
              <button key={p} className={`nav-btn${page === p ? ' on' : ''}`} onClick={() => setPage(p)}>
                {p === 'studio' ? 'Studio' : p === 'prod' ? 'Productions' : p === 'about' ? 'About' : 'Contact'}
              </button>
            ))}
            <button className="nav-btn" onClick={() => setPage('gateway')}>← Home</button>
          </div>
        </nav>
      )}

      {/* GATEWAY */}
      {page === 'gateway' && !intro && (
        <div id="s-gateway" className="screen active" style={{display:'block'}}>
          <div className="gw-panel gw-studio" id="panel-studio" data-hover onClick={() => setPage('studio')}>
            <div className="gw-iframe-wrap">
              <iframe src="https://framerate.tv/embed/673d357a-2c4e-44a6-a8e9-bba376ed9594?background=1" allow="autoplay; fullscreen" loading="lazy" />
            </div>
            <div className="gw-vignette" />
            <div className="gw-idx">01</div>
            <img src="/LOGO_IRL_WHITE.png" alt="" className="gw-mark" />
            <div className="gw-content">
              <div className="gw-tag">Post-Production · Creative</div>
              <div className="gw-title"><div>In Real Life</div><div>Studio</div></div>
              <div className="gw-sub">VFX · Color · Motion · Sound</div>
              <div className="gw-cta"><span className="gw-cta-line"/>Discover</div>
            </div>
          </div>
          <div className="gw-panel gw-prod" id="panel-prod" data-hover onClick={() => setPage('prod')}>
            <div className="gw-iframe-wrap">
              <iframe src="https://framerate.tv/embed/a03e23a2-88c8-44c2-937d-72007f6344d3?background=1" allow="autoplay; fullscreen" loading="lazy" />
            </div>
            <div className="gw-vignette" />
            <div className="gw-idx" style={{left:'auto',right:'4.5vw'}}>02</div>
            <img src="/LOGO_IRL_WHITE.png" alt="" className="gw-mark" />
            <div className="gw-content">
              <div className="gw-tag">Fiction Films</div>
              <div className="gw-title"><div>In Real Life</div><div>Productions</div></div>
              <div className="gw-sub">Feature · Short · Series · Doc</div>
              <div className="gw-cta"><span className="gw-cta-line"/>Discover</div>
            </div>
          </div>
          <svg className="gw-svg-line" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="55" y1="0" x2="40" y2="100" stroke="rgba(255,255,255,0.13)" strokeWidth="0.2" vectorEffect="non-scaling-stroke"/>
          </svg>
        </div>
      )}

      {/* STUDIO */}
      {page === 'studio' && (
        <div className="screen active page">
          <div style={{height:'3.5rem'}}/>
          <div className="s-head">
            <div className="s-title">Studio</div>
            <div className="s-meta"><div>{studioList.length} projects</div><div><b>Paris — International</b></div><div>Post-Production · VFX · Motion</div></div>
          </div>
          <div className="sg">
            {studioList.map((p,i) => (
              <div key={p._id} className="sg-item" data-hover onClick={() => openModal(p.videoLoopUrl, p.title)} style={{cursor: p.videoLoopUrl ? 'none' : 'default'}}>
                <div className="sg-thumb">
                  {p.thumbnail
                    ? <img src={p.thumbnail} alt={p.title} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />
                    : <div className="sg-bg" style={{background:`linear-gradient(${120+i*28}deg,rgb(${hues[i%hues.length]}) 0%,#050505 100%)`}}/>
                  }
                  <div className="sg-ov"/>
                  <div className="sg-n">0{i+1}</div>
                  <div className="sg-info">
                    <div className="sg-cat">{p.category}</div>
                    <div className="sg-name">{p.title}</div>
                    <div className="sg-cl">{p.client} · {p.year}{p.format ? ` · ${p.format}` : ''}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Footer setPage={setPage} />
        </div>
      )}

      {/* PRODUCTIONS */}
      {page === 'prod' && (
        <div className="screen active page">
          <div style={{height:'3.5rem'}}/>
          <div className="s-head">
            <div className="s-title" style={{color:'var(--cream)'}}>Films</div>
            <div className="s-meta"><div>{prodList.length} projects</div><div><b>Fiction · Documentary</b></div><div>Feature · Short · Series</div></div>
          </div>
          <div className="pg">
            {prodList.map((p,i) => (
              <div key={p._id} className="pg-item" data-hover>
                <div className="pg-thumb">
                  {p.poster
                    ? <img src={p.poster} alt={p.title} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />
                    : <div className="pg-bg" style={{background:`linear-gradient(${155+i*22}deg,rgb(${p.thumbnailColor || phues[i%phues.length]}) 0%,#040404 100%)`}}/>
                  }
                  <div className="pg-ov"/>
                  <div className="pg-n">0{i+1}</div>
                  <div className="pg-info">
                    <span className={`pg-badge ${p.status}`}>{statusLabel[p.status]}</span>
                    <div className="pg-title">{p.title}</div>
                    <div className="pg-dir">{p.director} · {p.genre} · {p.year}</div>
                    {p.festivals?.length > 0 && (
                      <div className="pg-fests">{p.festivals.map(f => <span key={f} className="pg-fest">{f}</span>)}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Footer setPage={setPage} />
        </div>
      )}

      {/* ABOUT */}
      {page === 'about' && (
        <div className="screen active page">
          <div style={{height:'3.5rem'}}/>
          <div className="s-head">
            <div className="s-title">About</div>
            <div className="s-meta"><div><b>Paris — Worldwide</b></div><div>Est. 2015</div></div>
          </div>
          <div className="ab-manifesto">
            <div>
              <div className="ab-tag"><span></span>Who We Are</div>
              <p className="ab-lead">We are <em>In Real Life</em> — a creative studio built at the intersection of storytelling, technology, and craft.</p>
            </div>
            <div style={{paddingTop:'.5rem'}}>
              <p className="ab-body">Born in Paris, operating worldwide. We don't just make films. We build worlds, shape narratives, and push images further than they've been before. From the first spark of an idea to the final frame, we carry projects through every stage — creative direction, production, post-production, and beyond.</p>
              <p className="ab-body">We work with agencies, production companies, and brands that believe in the power of a strong image. Our team brings together directors, producers, VFX artists, colorists, motion designers, and AI specialists — united by a single obsession: making something that lasts.</p>
            </div>
          </div>
          <div className="ab-reels">
            <div className="ab-tag"><span></span>Our Work</div>
            <div className="ab-reels-grid">
              {[generalReel, vfxReel].map((r,i) => (
                <div key={i} className="ab-reel">
                  <div style={{position:'relative',paddingBottom:'56.25%',height:0,overflow:'hidden',background:'#080808'}}>
                    <iframe src={r.framerateEmbedUrl} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}}/>
                  </div>
                  <div className="ab-reel-info">
                    <span className="ab-reel-num">0{i+1}</span>
                    <div>
                      <div className="ab-reel-title">{r.title}</div>
                      <div className="ab-reel-sub">{r.subtitle}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="ab-services">
            <div className="ab-tag"><span></span>Our Expertise</div>
            <div className="ab-services-grid">
              {[
                {n:'01',t:'Creative Direction',d:'Strong visual concepts built around clear storytelling — from research and moodboards to final vision.'},
                {n:'02',t:'Production',d:'Full production management — scouting, casting, crew coordination, on-set oversight at any scale.'},
                {n:'03',t:'Post-Production & VFX',d:'Creative vision meets technical precision — immersive, high-quality films meeting today\'s standards.'},
                {n:'04',t:'Immersive & XR',d:'XR, VR, motion capture and interactive technologies as narrative mediums for new creative territories.'},
                {n:'05',t:'AI & Innovation',d:'AI integrated as a creative tool — guided by human intent, used to explore, iterate, and produce.'},
              ].map(s => (
                <div key={s.n} className="ab-service">
                  <div className="ab-service-img"><div className="ab-service-img-inner"><span className="ab-service-img-label">Image</span></div></div>
                  <div className="ab-service-body">
                    <div className="ab-service-num">{s.n}</div>
                    <div className="ab-service-title">{s.t}</div>
                    <div className="ab-service-desc">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="ab-clients">
            <div className="ab-tag"><span></span>Selected Clients & Brands</div>
            <div className="ab-clients-split">
              <div>
                <div className="ab-clients-col-label">Production Companies & Networks</div>
                <div className="ab-clients-grid">
                  {clientList.filter(c=>c.type==='production').map(c=><div key={c._id} className="ab-client">{c.name}</div>)}
                </div>
              </div>
              <div className="ab-clients-divider"/>
              <div>
                <div className="ab-clients-col-label">Brands & Agencies</div>
                <div className="ab-clients-grid">
                  {clientList.filter(c=>c.type==='brand').map(c=><div key={c._id} className="ab-client">{c.name}</div>)}
                </div>
              </div>
            </div>
          </div>
          <div className="ab-team">
            <div className="ab-tag"><span></span>The Team</div>
            <div className="ab-team-grid">
              {teamList.map(m => (
                <div key={m._id} className="ab-member">
                  <div className="ab-member-photo-wrap">
                    <div className="ab-member-photo">
                      {m.photo && <img src={m.photo} alt={m.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>}
                    </div>
                  </div>
                  <div className="ab-member-name">{m.name}</div>
                  <div className="ab-member-role">{m.role}</div>
                  <div className="ab-member-email">{m.email}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="ab-closing">
            <img src="/LOGO_IRL_WHITE.png" alt="IRL" className="ab-closing-logo"/>
            <div className="ab-closing-sep"/>
            <div><span className="ab-closing-line1">We are In Real Life.</span><span className="ab-closing-line2">House of Possibilities.</span></div>
          </div>
          <Footer setPage={setPage} />
        </div>
      )}

      {/* CONTACT */}
      {page === 'contact' && <ContactPage setPage={setPage} />}

      {/* LEGAL */}
      {page === 'legal' && <LegalPage setPage={setPage} />}
      {/* VIDEO MODAL */}
      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-inner" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕ &nbsp;Close</button>
            <div className="modal-video">
              <iframe
                src={modal.url.includes('?') ? modal.url + '&autoplay=1' : modal.url + '?autoplay=1'}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="modal-title">{modal.title}</div>
          </div>
        </div>
      )}
    </>
  )
}

function Footer({ setPage }) {
  return (
    <footer>
      <div className="ft-l">© 2025 In Real Life — Paris</div>
      <div className="ft-r">
        <button className="ft-a" onClick={() => setPage('contact')}>Contact</button>
        <button className="ft-a" onClick={() => window.open('https://www.instagram.com/in.real.life_studio/','_blank')}>Instagram</button>
        <button className="ft-a" onClick={() => setPage('legal')}>Legal</button>
      </div>
    </footer>
  )
}

function ContactPage({ setPage }) {
  const [status, setStatus] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const btn = e.target.querySelector('.ct-submit')
    btn.textContent = 'Sending...'
    btn.style.opacity = '.5'
    try {
      const res = await fetch('https://formspree.io/f/xqeyrjoj', {
        method: 'POST', body: new FormData(e.target), headers: { Accept: 'application/json' }
      })
      if (res.ok) { setStatus('ok'); e.target.reset() }
      else setStatus('err')
    } catch { setStatus('err') }
    btn.textContent = 'Send message →'
    btn.style.opacity = '1'
  }

  return (
    <div className="screen active page">
      <div style={{height:'3.5rem'}}/>
      <div className="s-head">
        <div className="s-title">Contact</div>
        <div className="s-meta"><div><b>Get in Touch</b></div><div>Paris — Vanves</div></div>
      </div>
      <div className="ct-wrap">
        <div className="ct-left">
          <div>
            <div className="ab-tag" style={{marginBottom:'2.5rem'}}><span></span>Send us a message</div>
            <form className="ct-form" onSubmit={handleSubmit} action="https://formspree.io/f/xqeyrjoj" method="POST">
              <div className="ct-field"><label className="ct-label">Name</label><input className="ct-input" name="name" type="text" placeholder="Your full name" required /></div>
              <div className="ct-field"><label className="ct-label">Email</label><input className="ct-input" name="email" type="email" placeholder="your@email.com" required /></div>
              <div className="ct-field"><label className="ct-label">Subject</label><input className="ct-input" name="subject" type="text" placeholder="Project, collaboration, enquiry..." /></div>
              <div className="ct-field"><label className="ct-label">Message</label><textarea className="ct-textarea" name="message" placeholder="Tell us about your project..."/></div>
              {status !== 'ok' && <button type="submit" className="ct-submit">Send message →</button>}
              {status === 'ok' && <div className="ct-sent" style={{display:'block',color:'var(--gold)'}}>✓ Message sent — we&apos;ll get back to you shortly.</div>}
              {status === 'err' && <div className="ct-sent" style={{display:'block',color:'#c47'}}>✕ Something went wrong. Please email pierre@weareirl.com</div>}
            </form>
          </div>
        </div>
        <div className="ct-right">
          <div style={{display:'flex',flexDirection:'column',gap:'2.5rem'}}>
            <div><div className="ct-info-tag">Registered Office</div><div className="ct-address"><strong>WE ARE IRL</strong>149 Avenue du Maine<br/>75014 Paris, France</div></div>
            <div><div className="ct-info-tag">Studio</div><div className="ct-address"><strong>In Real Life Studio</strong>70 Rue Jean Bleuzen<br/>92170 Vanves, France</div></div>
            <div><div className="ct-info-tag">General Enquiries</div><div className="ct-address">pierre@weareirl.com</div></div>
            <div>
              <div className="ct-info-tag">Follow Us</div>
              <div className="ct-socials">
                <a className="ct-social" href="https://www.instagram.com/in.real.life_studio/" target="_blank" rel="noreferrer"><span className="ct-social-line"/>Instagram</a>
                <a className="ct-social" href="https://www.linkedin.com/company/in-real-life-studio/" target="_blank" rel="noreferrer"><span className="ct-social-line"/>LinkedIn</a>
                <a className="ct-social" href="https://framerate.tv/profile/weareirl" target="_blank" rel="noreferrer"><span className="ct-social-line"/>FrameRate</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer setPage={setPage} />
    </div>
  )
}

function LegalPage({ setPage }) {
  return (
    <div className="screen active page">
      <div style={{height:'3.5rem'}}/>
      <div className="s-head"><div className="s-title">Legal</div><div className="s-meta"><div><b>Legal Notice</b></div><div>France</div></div></div>
      <div className="lg-wrap">
        {[
          { tag:'Parent Company', title:'WE ARE IRL', rows:[['Legal form','SAS — Simplified Joint Stock Company'],['Registered office','149 Avenue du Maine, 75014 Paris, France'],['SIRET','[XXX XXX XXX XXXXX]'],['RCS','Paris [B XXX XXX XXX]'],['VAT number','FR [XX XXX XXX XXX]'],['Share capital','[XX 000] €'],['Publication Director','Pierre-Joseph Secondi'],['Contact','pierre@weareirl.com']] },
          { tag:'Subsidiary — Post-Production & Creative', title:'In Real Life Studio', rows:[['Legal form','SAS — Simplified Joint Stock Company'],['Registered office','70 Rue Jean Bleuzen, 92170 Vanves, France'],['SIRET','[XXX XXX XXX XXXXX]'],['RCS','Paris [B XXX XXX XXX]'],['Share capital','[XX 000] €'],['VAT number','FR [XX XXX XXX XXX]']] },
          { tag:'Subsidiary — Fiction Films', title:'In Real Life Productions', rows:[['Legal form','SAS — Simplified Joint Stock Company'],['Registered office','[Full address — to be completed]'],['SIRET','[XXX XXX XXX XXXXX]'],['RCS','Paris [B XXX XXX XXX]'],['Share capital','[XX 000] €'],['VAT number','FR [XX XXX XXX XXX]']] },
          { tag:'Website Hosting', title:'Vercel Inc.', rows:[['Address','340 S Lemon Ave #4133, Walnut, CA 91789, United States'],['Website','vercel.com']] },
        ].map((b,i) => (
          <div key={i}>
            <div className="lg-block">
              <div className="lg-block-tag">{b.tag}</div>
              <div className="lg-block-title">{b.title}</div>
              <div className="lg-grid">{b.rows.map(([k,v])=><div key={k} className="lg-row"><span className="lg-key">{k}</span><span className="lg-val">{v}</span></div>)}</div>
            </div>
            <div className="lg-sep"/>
          </div>
        ))}
        <div className="lg-block"><div className="lg-block-tag">Intellectual Property</div><div className="lg-block-title">All Rights Reserved</div><p className="lg-text">All content on this website is the exclusive property of WE ARE IRL, In Real Life Studio and In Real Life Productions, protected under French and international intellectual property laws. Any reproduction without prior written authorisation is strictly prohibited.</p></div>
        <div className="lg-sep"/>
        <div className="lg-block"><div className="lg-block-tag">Personal Data</div><div className="lg-block-title">Privacy Policy</div><p className="lg-text">This website does not collect personal data for commercial purposes. In accordance with the GDPR, you have the right to access, rectify and delete your data. Contact: <span style={{color:'var(--gold)'}}>pierre@weareirl.com</span></p></div>
        <div className="lg-sep"/>
        <div className="lg-block"><div className="lg-block-tag">Cookies</div><div className="lg-block-title">Cookie Policy</div><p className="lg-text">This website does not use tracking or advertising cookies. No data is transmitted to third parties for advertising purposes.</p></div>
      </div>
      <Footer setPage={setPage} />
    </div>
  )
}
