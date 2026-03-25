import { client } from '../lib/sanity'
import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'

export async function getStaticProps() {
  const studioProjects = await client.fetch(`
    *[_type == "studioProject"] | order(orderRank) {
      _id, title, client, categories, category, year, format, tileFormat,
      "thumbnail": thumbnail.asset->url,
      videoLoopUrl, featured
    }
  `)
  const productions = await client.fetch(`
    *[_type == "production"] | order(orderRank) {
      _id, title, director, genre, year, status, festivals, tileFormat,
      "poster": poster.asset->url,
      thumbnailColor, videoUrl
    }
  `)
  const teamMembers = await client.fetch(`
    *[_type == "teamMember"] | order(orderRank) {
      _id, name, role, email,
      "photo": photo.asset->url
    }
  `)
  const clients = await client.fetch(`
    *[_type == "client"] | order(orderRank) {
      _id, name, type,
      "logo": logo.asset->url
    }
  `)
  const showreels = await client.fetch(`
    *[_type == "showreel"] {
      _id, title, subtitle, type, framerateEmbedUrl
    }
  `)
  const expertise = await client.fetch(`
    *[_type == "expertise"] | order(orderRank) {
      _id, number, title, description,
      "image": image.asset->url
    }
  `)

  const siteSettings = await client.fetch(`
    *[_type == "siteSettings" && _id == "siteSettings"][0] {
      introLine1, introLine2,
      gatewayStudioTag, gatewayStudioTitle1, gatewayStudioTitle2, gatewayStudioSub,
      gatewayProdTag, gatewayProdTitle1, gatewayProdTitle2, gatewayProdSub,
      aboutManifestoLead, aboutManifestoBody1, aboutManifestoBody2,
      aboutClosingLine1, aboutClosingLine2,
      contactHeadquartersName, contactHeadquartersAddress,
      contactStudioName, contactStudioAddress,
      contactEmail, contactInstagram, contactLinkedin, contactFramerate,
      legalEntity1Name, legalEntity1Siret, legalEntity1Rcs, legalEntity1Capital, legalEntity1Vat,
      legalEntity2Name, legalEntity2Siret, legalEntity2Rcs, legalEntity2Capital, legalEntity2Vat,
      legalEntity3Name, legalEntity3Siret, legalEntity3Rcs, legalEntity3Capital, legalEntity3Vat, legalEntity3Address,
      footerCopyright,
    }
  `) || {}

  return {
    props: { studioProjects, productions, teamMembers, clients, showreels, expertise, siteSettings },
    revalidate: 30
  }
}

const statusLabel = { released: 'Released', post: 'Post-Production', dev: 'In Development' }

export default function Home({ studioProjects, productions, teamMembers, clients, showreels, expertise, siteSettings }) {
  const s = siteSettings || {}
  const [page, setPage] = useState('gateway')
  const [intro, setIntro] = useState(true)
  const [modal, setModal] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const curRef = useRef(null)

  const openModal = (url, title) => { if (url) setModal({ url, title }) }
  const closeModal = () => setModal(null)

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
    const t = setTimeout(() => { setIntro(false) }, 3200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (page !== 'gateway' || intro) return
    const studio = document.getElementById('panel-studio')
    const prod = document.getElementById('panel-prod')
    if (!studio || !prod) return
    const onSE = () => { prod.classList.add('hover-studio'); prod.classList.remove('hover-prod'); studio.classList.add('hover-studio') }
    const onSL = () => { prod.classList.remove('hover-studio'); studio.classList.remove('hover-studio') }
    const onPE = () => { prod.classList.add('hover-prod'); prod.classList.remove('hover-studio'); studio.classList.add('hover-prod') }
    const onPL = () => { prod.classList.remove('hover-prod'); studio.classList.remove('hover-prod') }
    studio.addEventListener('mouseenter', onSE); studio.addEventListener('mouseleave', onSL)
    prod.addEventListener('mouseenter', onPE); prod.addEventListener('mouseleave', onPL)
    return () => {
      studio.removeEventListener('mouseenter', onSE); studio.removeEventListener('mouseleave', onSL)
      prod.removeEventListener('mouseenter', onPE); prod.removeEventListener('mouseleave', onPL)
    }
  }, [page, intro])

  const placeholderStudio = [
    { _id:'p1', title:'Eclipse VFX', client:'Canal+', category:'Visual Effects', year:'2024', format:'4K HDR' },
    { _id:'p2', title:"Songe d'une Nuit", client:'Arte', category:'Color Grading', year:'2024', format:'DCP' },
    { _id:'p3', title:'Urban Decay', client:'Nike', category:'Motion Design', year:'2023', format:'Social / OOH' },
    { _id:'p4', title:'Fractures', client:'Netflix', category:'Post-Production', year:'2024', format:'Dolby Vision' },
    { _id:'p5', title:'Lumière Noire', client:'Dior', category:'Comp & VFX', year:'2023', format:'4K' },
    { _id:'p6', title:'Territories', client:'Arte/ZDF', category:'Grade & Sound', year:'2024', format:'HDR10+' },
    { _id:'p7', title:'Deep Blue', client:'Greenpeace', category:'Motion + VFX', year:'2023', format:'4K' },
  ]
  const studioList = studioProjects.length >= 7
    ? studioProjects
    : [...studioProjects, ...placeholderStudio.slice(studioProjects.length)]

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
    { _id:'3', name:'Arte', type:'production' }, { _id:'4', name:'ZDF', type:'production' },
    { _id:'5', name:'Greenpeace', type:'production' }, { _id:'6', name:'Client 06', type:'production' },
    { _id:'7', name:'Dior', type:'brand' }, { _id:'8', name:'Nike', type:'brand' },
    { _id:'9', name:'Omega', type:'brand' }, { _id:'10', name:'Brand 04', type:'brand' },
    { _id:'11', name:'Brand 05', type:'brand' }, { _id:'12', name:'Brand 06', type:'brand' },
  ]

  const expertiseList = expertise.length > 0 ? expertise : [
    {_id:'1', number:'01', title:'Creative Direction', description:'Strong visual concepts built around clear storytelling — from research and moodboards to final vision.'},
    {_id:'2', number:'02', title:'Production', description:'Full production management — scouting, casting, crew coordination, on-set oversight at any scale.'},
    {_id:'3', number:'03', title:'Post-Production & VFX', description:"Creative vision meets technical precision — immersive, high-quality films meeting today's standards."},
    {_id:'4', number:'04', title:'Immersive & XR', description:'XR, VR, motion capture and interactive technologies as narrative mediums for new creative territories.'},
    {_id:'5', number:'05', title:'AI & Innovation', description:'AI integrated as a creative tool — guided by human intent, used to explore, iterate, and produce.'},
  ]

  const generalReel = showreels.find(s => s.type === 'general') || { framerateEmbedUrl: 'https://framerate.tv/embed/f25fba94-20aa-4a22-8692-2a990683f769?primary_color=%2523ffffff&track_color=%2523ffffff&theme=minimal', title: 'General Showreel', subtitle: 'Production · Direction · Post' }
  const vfxReel = showreels.find(s => s.type === 'vfx') || { framerateEmbedUrl: 'https://framerate.tv/embed/673d357a-2c4e-44a6-a8e9-bba376ed9594?primary_color=%2523ffffff&track_color=%2523ffffff&theme=minimal', title: '3D / VFX / AI Showreel', subtitle: 'Visual Effects · Motion · AI' }

  const hues = ['20,20,20','12,12,18','18,12,12','10,11,15','19,17,12','10,14,11','9,13,19']
  const phues = ['18,11,8','9,12,19','15,9,12','13,13,9','11,17,13','19,13,17']

  const CSS = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--k:#000;--w:#fff;--cream:#e8e3dc;--gold:#a89878;--muted:#5a5a5a;--D:'Syne',sans-serif;--M:'DM Mono',monospace}
    html,body{background:var(--k);color:var(--w);height:100%;overflow:hidden}
    body{font-family:var(--D);-webkit-font-smoothing:antialiased}
    ::selection{background:var(--gold);color:var(--k)}
    .cur{position:fixed;width:5px;height:5px;background:var(--w);border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:width .35s,height .35s,opacity .35s;mix-blend-mode:difference}
    .cur.h{width:38px;height:38px;opacity:.45}
    .screen{display:none;width:100vw;height:100vh}
    .screen.active{display:flex;flex-direction:column}
    #s-intro{background:var(--k);align-items:center;justify-content:center;flex-direction:column;gap:0;position:fixed;inset:0;z-index:300;transition:opacity .85s}
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
    .gw-studio{z-index:1;background:#080808}
    .gw-prod{z-index:2;background:#06060a;justify-content:flex-end;clip-path:polygon(55% 0,100% 0,100% 100%,40% 100%);transition:clip-path 1.1s cubic-bezier(.76,0,.24,1)}
    .gw-prod.hover-prod{clip-path:polygon(42% 0,100% 0,100% 100%,27% 100%)}
    .gw-prod.hover-studio{clip-path:polygon(65% 0,100% 0,100% 100%,50% 100%)}
    .gw-prod .gw-content{text-align:right}
    .gw-prod .gw-tag{flex-direction:row-reverse}
    .gw-prod .gw-tag::before{display:none}
    .gw-prod .gw-tag::after{content:'';width:18px;height:1px;background:currentColor}
    .gw-prod .gw-cta{flex-direction:row-reverse}
    .gw-iframe-wrap{position:absolute;inset:0;overflow:hidden;z-index:0;opacity:0;transition:opacity 1.4s ease}
    .gw-panel:hover .gw-iframe-wrap{opacity:1}
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
    .sg{padding:3px;display:grid;gap:3px;grid-template-columns:repeat(12,1fr);grid-auto-rows:22vw;grid-auto-flow:row dense;background:rgba(255,255,255,.03)}
    .sg-item{background:var(--k);position:relative;overflow:hidden;cursor:none}
    .sg-item.fmt-tall{grid-column:span 4;grid-row:span 2}
    .sg-item.fmt-wide{grid-column:span 5}
    .sg-item.fmt-std{grid-column:span 3}
    .sg-item:not([class*="fmt"]):nth-child(10n+1){grid-column:span 4;grid-row:span 2}
    .sg-item:not([class*="fmt"]):nth-child(10n+2){grid-column:span 5}
    .sg-item:not([class*="fmt"]):nth-child(10n+3){grid-column:span 3}
    .sg-item:not([class*="fmt"]):nth-child(10n+4){grid-column:span 5}
    .sg-item:not([class*="fmt"]):nth-child(10n+5){grid-column:span 3}
    .sg-item:not([class*="fmt"]):nth-child(10n+6){grid-column:span 5}
    .sg-item:not([class*="fmt"]):nth-child(10n+7){grid-column:span 3}
    .sg-item:not([class*="fmt"]):nth-child(10n+8){grid-column:span 4;grid-row:span 2}
    .sg-item:not([class*="fmt"]):nth-child(10n+9){grid-column:span 5}
    .sg-item:not([class*="fmt"]):nth-child(10n+10){grid-column:span 3}
    .sg-thumb{position:absolute;inset:0;overflow:hidden;background:#060606}
    .sg-bg{position:absolute;inset:0;transition:transform .9s cubic-bezier(.76,0,.24,1)}
    .sg-item:hover .sg-bg{transform:scale(1.04)}
    .sg-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.88) 0%,transparent 55%);opacity:0;transition:opacity .5s}
    .sg-item:hover .sg-ov{opacity:1}
    .sg-info{position:absolute;bottom:0;left:0;right:0;padding:1.4rem;transform:translateY(5px);opacity:0;transition:transform .5s cubic-bezier(.76,0,.24,1),opacity .5s}
    .sg-item:hover .sg-info{transform:translateY(0);opacity:1}
    .sg-cat{font-family:var(--M);font-size:10px;letter-spacing:.28em;color:var(--gold);text-transform:uppercase;margin-bottom:.3rem}
    .sg-name{font-family:var(--D);font-weight:600;font-size:clamp(14px,1.8vw,24px);letter-spacing:-.02em;text-transform:uppercase}
    .sg-cl{font-family:var(--M);font-size:11px;letter-spacing:.15em;color:var(--cream);opacity:.4;margin-top:.25rem}
    .sg-n{position:absolute;top:1rem;right:1.1rem;font-family:var(--M);font-size:11px;letter-spacing:.15em;color:rgba(255,255,255,.2);z-index:3}
    .pg{padding:3px;display:grid;gap:3px;grid-template-columns:repeat(12,1fr);grid-auto-rows:22vw;grid-auto-flow:row dense;background:rgba(255,255,255,.03)}
    .pg-item{background:var(--k);position:relative;overflow:hidden;cursor:none}
    .pg-item.fmt-tall{grid-column:span 4;grid-row:span 2}
    .pg-item.fmt-wide{grid-column:span 5}
    .pg-item.fmt-std{grid-column:span 3}
    .pg-item:not([class*="fmt"]):nth-child(10n+1){grid-column:span 5}
    .pg-item:not([class*="fmt"]):nth-child(10n+2){grid-column:span 3}
    .pg-item:not([class*="fmt"]):nth-child(10n+3){grid-column:span 4;grid-row:span 2}
    .pg-item:not([class*="fmt"]):nth-child(10n+4){grid-column:span 5}
    .pg-item:not([class*="fmt"]):nth-child(10n+5){grid-column:span 3}
    .pg-item:not([class*="fmt"]):nth-child(10n+6){grid-column:span 4;grid-row:span 2}
    .pg-item:not([class*="fmt"]):nth-child(10n+7){grid-column:span 5}
    .pg-item:not([class*="fmt"]):nth-child(10n+8){grid-column:span 3}
    .pg-item:not([class*="fmt"]):nth-child(10n+9){grid-column:span 5}
    .pg-item:not([class*="fmt"]):nth-child(10n+10){grid-column:span 3}
    .pg-thumb{position:absolute;inset:0;overflow:hidden;background:#060606}
    .pg-bg{position:absolute;inset:0;transition:transform .9s cubic-bezier(.76,0,.24,1)}
    .pg-item:hover .pg-bg{transform:scale(1.04)}
    .pg-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.88) 0%,transparent 55%);opacity:0;transition:opacity .5s}
    .pg-item:hover .pg-ov{opacity:1}    .pg-info{position:absolute;bottom:0;left:0;right:0;padding:1.4rem;transform:translateY(5px);opacity:0;transition:transform .5s cubic-bezier(.76,0,.24,1),opacity .5s}
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
    .ab-clients-col-label{font-family:var(--M);font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:var(--muted);margin-bottom:1.2rem}
    .ab-clients-split{display:grid;grid-template-columns:1fr auto 1fr;gap:0;align-items:start}
    .ab-clients-divider{width:1px;background:rgba(255,255,255,.06);margin:0 4vw;align-self:stretch}
    .ab-clients-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,.04)}
    .ab-client{background:var(--k);font-family:var(--D);font-weight:700;font-size:clamp(11px,1vw,14px);letter-spacing:.04em;text-transform:uppercase;color:rgba(255,255,255,.18);padding:1.6rem 1.2rem;transition:color .4s,background .4s;cursor:none;text-align:center}
    .ab-client:hover{color:var(--w);background:#080808}
    .ab-team{padding:5rem 5vw;border-bottom:1px solid rgba(255,255,255,.06)}
    .ab-team-grid{display:flex;flex-wrap:wrap;justify-content:center;gap:3rem 5vw;align-items:start}
    .ab-member{display:flex;flex-direction:column;align-items:center;text-align:center;cursor:none}
    .ab-member-photo-wrap{width:clamp(90px,9vw,130px);height:clamp(90px,9vw,130px);border-radius:50%;overflow:hidden;border:1px solid rgba(255,255,255,.08);flex-shrink:0;transition:border-color .4s;position:relative;background:#0d0d0d}
    .ab-member:hover .ab-member-photo-wrap{border-color:var(--gold)}
    .ab-member-photo{width:100%;height:100%;object-fit:cover;border-radius:50%}
    .ab-member-photo-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;transition:transform .5s cubic-bezier(.76,0,.24,1)}
    .ab-member:hover .ab-member-photo-placeholder{transform:scale(1.08)}
    .ab-member-photo-placeholder::after{content:'+';font-family:var(--M);font-size:20px;color:rgba(255,255,255,.12);font-weight:300}
    .ab-member-name{font-family:var(--D);font-weight:600;font-size:clamp(11px,1vw,13px);letter-spacing:-.005em;text-transform:uppercase;color:var(--w);margin-top:1rem;line-height:1.2;transition:color .3s;white-space:nowrap}
    .ab-member:hover .ab-member-name{color:var(--cream)}
    .ab-member-role{font-family:var(--M);font-size:10px;letter-spacing:.18em;color:var(--gold);margin-top:.35rem;text-transform:uppercase;line-height:1.5;white-space:nowrap}
    .ab-member-email{font-family:var(--M);font-size:10px;letter-spacing:.08em;color:var(--muted);margin-top:.4rem;transition:color .3s;white-space:nowrap}
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
    .ct-submit{display:inline-flex;align-items:center;gap:1rem;margin-top:2.5rem;font-family:var(--M);font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:var(--k);background:var(--gold);border:none;cursor:none;padding:1rem 2rem;transition:background .3s,gap .3s;width:auto}
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
    .burger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:4px;z-index:200}
    .burger-line{display:block;width:22px;height:1px;background:var(--w);transition:transform .3s,opacity .3s}
    .burger-line.open:nth-child(1){transform:translateY(6px) rotate(45deg)}
    .burger-line.open:nth-child(2){opacity:0}
    .burger-line.open:nth-child(3){transform:translateY(-6px) rotate(-45deg)}
    .mobile-menu{display:none;position:fixed;inset:0;background:var(--k);z-index:150;flex-direction:column;align-items:center;justify-content:center;gap:2.5rem}
    .mobile-menu-btn{font-family:var(--D);font-weight:700;font-size:clamp(24px,7vw,40px);letter-spacing:-.02em;text-transform:uppercase;color:var(--w);background:none;border:none;cursor:pointer;transition:color .3s}
    .mobile-menu-btn:hover{color:var(--gold)}
    @media(max-width:768px){
      html,body{overflow:auto}
      .cur{display:none}
      .screen{height:auto;min-height:100vh}
      #s-intro{height:100vh}
      #s-gateway{height:100vh}
      .gw-panel{padding:6vw}
      .gw-studio{clip-path:none!important;position:relative;height:50vh;display:flex}
      .gw-prod{clip-path:none!important;position:relative;height:50vh;display:flex;justify-content:flex-start}
      .gw-svg-line{display:none}
      .gw-title{font-size:clamp(28px,8vw,48px)}
      .gw-tag,.gw-sub,.gw-cta{opacity:1!important;transform:none!important}
      .gw-iframe-wrap{opacity:0.4!important}
      nav{padding:1rem 1.5rem;position:relative}
      .nav-right{display:none}
      .burger{display:flex}
      .mobile-menu{display:flex}
      .page{height:auto;min-height:100vh;overflow-y:auto}
      .s-head{padding:5rem 5vw 2rem;flex-direction:column;gap:1rem;align-items:flex-start}
      .s-meta{text-align:left}
      .s-title{font-size:clamp(48px,12vw,80px)}
      .sg,.pg{grid-template-columns:1fr;gap:2px;padding:2px}
      .sg-item,.pg-item{grid-column:1/-1!important}
      .sg-thumb,.pg-thumb{aspect-ratio:16/9!important}
      .sg-info,.pg-info{opacity:1!important;transform:none!important}
      .sg-ov,.pg-ov{opacity:1!important}
      .ab-manifesto{grid-template-columns:1fr;gap:2rem;padding:3rem 5vw}
      .ab-lead{font-size:clamp(22px,6vw,36px)}
      .ab-reels{padding:3rem 5vw}
      .ab-reels-grid{grid-template-columns:1fr;gap:2rem}
      .ab-services{padding:3rem 5vw}
      .ab-services-grid{grid-template-columns:1fr 1fr;gap:2px}
      .ab-clients{padding:3rem 5vw}
      .ab-clients-split{grid-template-columns:1fr;gap:2rem}
      .ab-clients-divider{display:none}
      .ab-clients-grid{grid-template-columns:repeat(2,1fr)}
      .ab-team{padding:3rem 5vw}
      .ab-team-grid{flex-direction:column;align-items:center;gap:2.5rem}
      .ab-member{width:100%;max-width:280px}
      .ab-member-name,.ab-member-role,.ab-member-email{white-space:normal}
      .ab-closing{padding:4rem 5vw}
      .ct-wrap{grid-template-columns:1fr}
      .ct-left{border-right:none;border-bottom:1px solid rgba(255,255,255,.06);padding:3rem 5vw}
      .ct-right{padding:3rem 5vw}
      .ct-submit{cursor:pointer}
      .lg-wrap{padding:3rem 5vw 4rem}
      .lg-row{grid-template-columns:1fr;gap:.3rem}
      footer{flex-direction:column;gap:1.5rem;text-align:center;padding:2rem 5vw}
      .ft-r{flex-wrap:wrap;justify-content:center;gap:1.5rem}
      button,.ft-a,.nav-btn{cursor:pointer}
      .modal-inner{width:95vw}
      .modal-close{top:-2rem;font-size:12px}
    }
    @media(max-width:480px){
      .ab-services-grid{grid-template-columns:1fr}
      .gw-title{font-size:clamp(24px,9vw,40px)}
    }
  `

  return (
    <>
      <Head>
        <title>In Real Life</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet" />
      </Head>

      <style>{CSS}</style>

      <div ref={curRef} className="cur" />

      <div id="s-intro" className={`screen active${!intro ? ' out' : ''}`} style={{display:'flex'}}>
        <img src="/LOGO_IRL_WHITE.png" alt="IRL" className="intro-logo" />
        <div className="intro-sep" />
        <div className="intro-tagline">
          <span className="intro-line1">{s.introLine1 || 'We are In Real Life.'}</span>
          <span className="intro-line2">{s.introLine2 || 'House of Possibilities.'}</span>
        </div>
      </div>

      {page !== 'gateway' && (
        <nav>
          <button className="nav-brand" onClick={() => { setPage('gateway'); setMenuOpen(false) }}>
            <img src="/LOGO_IRL_WHITE.png" alt="IRL" className="nav-logo" />
            <span className="nav-name">In Real Life <em>·</em> {page === 'studio' ? 'Studio' : page === 'prod' ? 'Productions' : page === 'about' ? 'About' : page === 'contact' ? 'Contact' : 'Legal'}</span>
          </button>
          <button className="burger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span className={`burger-line${menuOpen ? ' open' : ''}`}/>
            <span className={`burger-line${menuOpen ? ' open' : ''}`}/>
            <span className={`burger-line${menuOpen ? ' open' : ''}`}/>
          </button>
          <div className="nav-right">
            {['studio','prod','about','contact'].map(p => (
              <button key={p} className={`nav-btn${page === p ? ' on' : ''}`} onClick={() => setPage(p)}>
                {p === 'studio' ? 'Studio' : p === 'prod' ? 'Productions' : p === 'about' ? 'About' : 'Contact'}
              </button>
            ))}
            <button className="nav-btn" onClick={() => setPage('gateway')}>← Home</button>
          </div>
          {menuOpen && (
            <div className="mobile-menu">
              {['studio','prod','about','contact'].map(p => (
                <button key={p} className="mobile-menu-btn" onClick={() => { setPage(p); setMenuOpen(false) }}>
                  {p === 'studio' ? 'Studio' : p === 'prod' ? 'Productions' : p === 'about' ? 'About' : 'Contact'}
                </button>
              ))}
              <button className="mobile-menu-btn" onClick={() => { setPage('gateway'); setMenuOpen(false) }}>← Home</button>
            </div>
          )}
        </nav>
      )}

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
              <div className="gw-tag">{s.gatewayStudioTag || 'Post-Production · Creative'}</div>
              <div className="gw-title"><div>{s.gatewayStudioTitle1 || 'In Real Life'}</div><div>{s.gatewayStudioTitle2 || 'Studio'}</div></div>
              <div className="gw-sub">{s.gatewayStudioSub || 'VFX · Color · Motion · Sound'}</div>
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
              <div className="gw-tag">{s.gatewayProdTag || 'Fiction Films'}</div>
              <div className="gw-title"><div>{s.gatewayProdTitle1 || 'In Real Life'}</div><div>{s.gatewayProdTitle2 || 'Productions'}</div></div>
              <div className="gw-sub">{s.gatewayProdSub || 'Feature · Short · Series · Doc'}</div>
              <div className="gw-cta"><span className="gw-cta-line"/>Discover</div>
            </div>
          </div>
          <svg className="gw-svg-line" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="55" y1="0" x2="40" y2="100" stroke="rgba(255,255,255,0.13)" strokeWidth="0.2" vectorEffect="non-scaling-stroke"/>
          </svg>
        </div>
      )}

      {page === 'studio' && (
        <div className="screen active page">
          <div style={{height:'3.5rem'}}/>
          <div className="s-head">
            <div className="s-title">Studio</div>
            <div className="s-meta"><div>{studioList.length} projects</div><div><b>Paris — International</b></div><div>Post-Production · VFX · Motion</div></div>
          </div>
          <div className="sg">
            {studioList.map((p,i) => (
              <div key={p._id} className={`sg-item${p.tileFormat ? ' fmt-'+p.tileFormat : ''}`} data-hover onClick={() => openModal(p.videoLoopUrl, p.title)}>
                <div className="sg-thumb">
                  {p.thumbnail
                    ? <img src={p.thumbnail} alt={p.title} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />
                    : <div className="sg-bg" style={{position:'absolute',inset:0,background:`linear-gradient(${120+i*28}deg,rgb(${hues[i%hues.length]}) 0%,#050505 100%)`}}/>
                  }
                  <div className="sg-ov"/>
                  <div className="sg-n">0{i+1}</div>
                  <div className="sg-info">
                    <div className="sg-cat">{Array.isArray(p.categories) ? p.categories.join(' · ') : p.category}</div>
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

      {page === 'prod' && (
        <div className="screen active page">
          <div style={{height:'3.5rem'}}/>
          <div className="s-head">
            <div className="s-title" style={{color:'var(--cream)'}}>Films</div>
            <div className="s-meta"><div>{prodList.length} projects</div><div><b>Fiction · Documentary</b></div><div>Feature · Short · Series</div></div>
          </div>
          <div className="pg">
            {prodList.map((p,i) => (
              <div key={p._id} className={`pg-item${p.tileFormat ? ' fmt-'+p.tileFormat : ''}`} data-hover onClick={() => openModal(p.videoUrl, p.title)}>
                <div className="pg-thumb">
                  {p.poster
                    ? <img src={p.poster} alt={p.title} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />
                    : <div className="pg-bg" style={{position:'absolute',inset:0,background:`linear-gradient(${155+i*22}deg,rgb(${p.thumbnailColor || phues[i%phues.length]}) 0%,#040404 100%)`}}/>
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
                    {p.videoUrl && <div style={{marginTop:'.5rem',fontFamily:'var(--M)',fontSize:'10px',letterSpacing:'.2em',color:'var(--gold)',textTransform:'uppercase'}}>▶ Watch</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Footer setPage={setPage} />
        </div>
      )}

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
              <p className="ab-lead">We are <em>In Real Life</em> — {(s.aboutManifestoLead || 'We are In Real Life — a creative studio built at the intersection of storytelling, technology, and craft.').replace('We are In Real Life — ', '')}</p>
            </div>
            <div style={{paddingTop:'.5rem'}}>
              <p className="ab-body">{s.aboutManifestoBody1 || "Born in Paris, operating worldwide. We don't just make films. We build worlds, shape narratives, and push images further than they've been before. From the first spark of an idea to the final frame, we carry projects through every stage — creative direction, production, post-production, and beyond."}</p>
              <p className="ab-body">{s.aboutManifestoBody2 || "We work with agencies, production companies, and brands that believe in the power of a strong image. Our team brings together directors, producers, VFX artists, colorists, motion designers, and AI specialists — united by a single obsession: making something that lasts."}</p>
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
              {expertiseList.map(s => (
                <div key={s._id} className="ab-service">
                  <div className="ab-service-img">
                    {s.image
                      ? <img src={s.image} alt={s.title} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />
                      : <div className="ab-service-img-inner"><span className="ab-service-img-label">Image</span></div>
                    }
                  </div>
                  <div className="ab-service-body">
                    <div className="ab-service-num">{s.number}</div>
                    <div className="ab-service-title">{s.title}</div>
                    <div className="ab-service-desc">{s.description}</div>
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
                    {m.photo
                      ? <img className="ab-member-photo" src={m.photo} alt={m.name} />
                      : <div className="ab-member-photo-placeholder" />
                    }
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
            <div>
              <span className="ab-closing-line1">{s.aboutClosingLine1 || 'We are In Real Life.'}</span>
              <span className="ab-closing-line2">{s.aboutClosingLine2 || 'House of Possibilities.'}</span>
            </div>
          </div>
          <Footer setPage={setPage} />
        </div>
      )}

      {page === 'contact' && <ContactPage setPage={setPage} s={s} />}
      {page === 'legal' && <LegalPage setPage={setPage} s={s} />}

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

function Footer({ setPage, s = {} }) {
  return (
    <footer>
      <div className="ft-l">{s.footerCopyright || '© 2025 In Real Life — Paris'}</div>
      <div className="ft-r">
        <button className="ft-a" onClick={() => setPage('contact')}>Contact</button>
        <button className="ft-a" onClick={() => window.open(s.contactInstagram || 'https://www.instagram.com/in.real.life_studio/','_blank')}>Instagram</button>
        <button className="ft-a" onClick={() => setPage('legal')}>Legal</button>
      </div>
    </footer>
  )
}

function ContactPage({ setPage, s = {} }) {
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
            <div><div className="ct-info-tag">Registered Office</div><div className="ct-address"><strong>{s.contactHeadquartersName || 'WE ARE IRL'}</strong>{s.contactHeadquartersAddress || '149 Avenue du Maine, 75014 Paris, France'}</div></div>
            <div><div className="ct-info-tag">Studio</div><div className="ct-address"><strong>{s.contactStudioName || 'In Real Life Studio'}</strong>{s.contactStudioAddress || '70 Rue Jean Bleuzen, 92170 Vanves, France'}</div></div>
            <div><div className="ct-info-tag">General Enquiries</div><div className="ct-address">{s.contactEmail || 'pierre@weareirl.com'}</div></div>
            <div>
              <div className="ct-info-tag">Follow Us</div>
              <div className="ct-socials">
                {(s.contactInstagram || 'https://www.instagram.com/in.real.life_studio/') && <a className="ct-social" href={s.contactInstagram || 'https://www.instagram.com/in.real.life_studio/'} target="_blank" rel="noreferrer"><span className="ct-social-line"/>Instagram</a>}
                {(s.contactLinkedin || 'https://www.linkedin.com/company/in-real-life-studio/') && <a className="ct-social" href={s.contactLinkedin || 'https://www.linkedin.com/company/in-real-life-studio/'} target="_blank" rel="noreferrer"><span className="ct-social-line"/>LinkedIn</a>}
                {(s.contactFramerate || 'https://framerate.tv/profile/weareirl') && <a className="ct-social" href={s.contactFramerate || 'https://framerate.tv/profile/weareirl'} target="_blank" rel="noreferrer"><span className="ct-social-line"/>FrameRate</a>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer setPage={setPage} />
    </div>
  )
}

function LegalPage({ setPage, s = {} }) {
  const e1 = s.legalEntity1Name || 'WE ARE IRL'
  const e2 = s.legalEntity2Name || 'In Real Life Studio'
  const e3 = s.legalEntity3Name || 'In Real Life Productions'
  return (
    <div className="screen active page">
      <div style={{height:'3.5rem'}}/>
      <div className="s-head"><div className="s-title">Legal</div><div className="s-meta"><div><b>Legal Notice</b></div><div>France</div></div></div>
      <div className="lg-wrap">
        {[
          { tag:'Parent Company', title: e1, rows:[
            ['Legal form','SAS — Simplified Joint Stock Company'],
            ['Registered office', s.contactHeadquartersAddress || '149 Avenue du Maine, 75014 Paris, France'],
            ['SIRET', s.legalEntity1Siret || '[XXX XXX XXX XXXXX]'],
            ['RCS', s.legalEntity1Rcs || 'Paris [B XXX XXX XXX]'],
            ['VAT number', s.legalEntity1Vat || 'FR [XX XXX XXX XXX]'],
            ['Share capital', s.legalEntity1Capital || '[XX 000] €'],
            ['Publication Director','Pierre-Joseph Secondi'],
            ['Contact', s.contactEmail || 'pierre@weareirl.com'],
          ]},
          { tag:'Subsidiary — Post-Production & Creative', title: e2, rows:[
            ['Legal form','SAS — Simplified Joint Stock Company'],
            ['Registered office', s.contactStudioAddress || '70 Rue Jean Bleuzen, 92170 Vanves, France'],
            ['SIRET', s.legalEntity2Siret || '[XXX XXX XXX XXXXX]'],
            ['RCS', s.legalEntity2Rcs || 'Paris [B XXX XXX XXX]'],
            ['Share capital', s.legalEntity2Capital || '[XX 000] €'],
            ['VAT number', s.legalEntity2Vat || 'FR [XX XXX XXX XXX]'],
          ]},
          { tag:'Subsidiary — Fiction Films', title: e3, rows:[
            ['Legal form','SAS — Simplified Joint Stock Company'],
            ['Registered office', s.legalEntity3Address || '[Full address — to be completed]'],
            ['SIRET', s.legalEntity3Siret || '[XXX XXX XXX XXXXX]'],
            ['RCS', s.legalEntity3Rcs || 'Paris [B XXX XXX XXX]'],
            ['Share capital', s.legalEntity3Capital || '[XX 000] €'],
            ['VAT number', s.legalEntity3Vat || 'FR [XX XXX XXX XXX]'],
          ]},
          { tag:'Website Hosting', title:'Vercel Inc.', rows:[
            ['Address','340 S Lemon Ave #4133, Walnut, CA 91789, United States'],
            ['Website','vercel.com'],
          ]},
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
        <div className="lg-block"><div className="lg-block-tag">Personal Data</div><div className="lg-block-title">Privacy Policy</div><p className="lg-text">This website does not collect personal data for commercial purposes. In accordance with the GDPR, you have the right to access, rectify and delete your data. Contact: <span style={{color:'var(--gold)'}}>{s.contactEmail || 'pierre@weareirl.com'}</span></p></div>
        <div className="lg-sep"/>
        <div className="lg-block"><div className="lg-block-tag">Cookies</div><div className="lg-block-title">Cookie Policy</div><p className="lg-text">This website does not use tracking or advertising cookies. No data is transmitted to third parties for advertising purposes.</p></div>
      </div>
      <Footer setPage={setPage} s={s} />
    </div>
  )
}
