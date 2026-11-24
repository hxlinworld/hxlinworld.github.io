#!/usr/bin/env python3
"""Render the self-contained motion guide from content/motion-guide.json.

Run this after editing the curated content. The generated HTML is committed,
so the existing Next.js/GitHub Pages build needs no additional dependency.
"""
from pathlib import Path
from html import escape
from urllib.parse import urlparse
from datetime import datetime
import json

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'content/motion-guide.json').read_text())
OUT = ROOT / 'public/Humanoid-motion-learning-guide'
OUT.mkdir(parents=True, exist_ok=True)
COUNTS = {key: len(DATA[key]) for key in ('courses', 'researchers', 'repositories', 'talks')}
PEOPLE_COUNT = sum(len(group['people']) for group in DATA['researchers'])
PROJECT_COUNT = sum(len(group['projects']) for group in DATA['researchers'])
ENTRY_COUNT = sum(COUNTS.values())
LINK_COUNT = COUNTS['courses'] + COUNTS['repositories'] + COUNTS['talks'] + PEOPLE_COUNT + PROJECT_COUNT
SOURCE_DATE = datetime.fromisoformat(DATA['sourceUpdatedAt'].replace('Z', '+00:00')).strftime('%-d %B %Y')

def e(value):
    return escape(str(value), quote=True)

def domain(url):
    return urlparse(url).netloc.removeprefix('www.')

def link(title, url, cls='title-link'):
    return f'<a class="{cls}" data-resource href="{e(url)}" target="_blank" rel="noopener noreferrer">{e(title)}</a>'

def icon(name):
    paths = {
        'book': '<path d="M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4z"/><path d="M13 7a3 3 0 0 1 3-3h5v15h-5a4 4 0 0 0-3 2"/>',
        'code': '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18"/>',
        'talk': '<path d="M21 11a8 8 0 0 1-8 8H7l-4 3V11a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z"/><path d="M8 9h8m-8 5h5"/>',
        'search': '<circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 5 5"/>',
        'close': '<path d="m6 6 12 12M6 18 18 6"/>',
    }
    return f'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{paths[name]}</svg>'

def search_attr(item):
    return e(json.dumps(item, ensure_ascii=False).lower())

courses = []
for i, course in enumerate(DATA['courses']):
    title = 'Embodied AI · Robot Learning Foundations' if i == 0 else course['title']
    kind = 'Reading guide' if i == 0 else 'Course'
    courses.append(f'''<article class="resource-card course-card" data-item data-search="{search_attr(course)}">
      <div class="resource-meta">{icon('book')}<span>{kind}</span></div>
      <h3>{link(title, course['url'])}</h3>
      <p class="resource-subtitle">{e(course.get('subtitle', ''))}</p>
      <div class="resource-footer"><span class="tag">{'Preliminaries' if i == 0 else ('GAMES105' if i == 1 else 'CMU 16-831')}</span><span class="resource-domain">{e(domain(course['url']))}</span></div>
    </article>''')

researchers = []
for group in DATA['researchers']:
    profile_text = ' '.join(p['name'] + ' ' + p['affiliation'] for p in group['people'])
    people = ''.join(f'''<a class="person-link" data-resource href="{e(p['url'])}" target="_blank" rel="noopener noreferrer"><span class="person-name">{e(p['name'])}</span><span class="person-affiliation">{e(p['affiliation'])}</span></a>''' for p in group['people'])
    projects = ''.join(link(p['title'], p['url'], 'project-link') for p in group['projects'])
    number = len(group['projects'])
    project_label = f'{number} selected project' + ('s' if number != 1 else '') if number else 'Researcher homepage'
    initials = ''.join(w[0] for w in group['people'][0]['name'].split()[:2])
    researchers.append(f'''<article class="researcher-card" id="{e(group['id'])}" data-item data-search="{search_attr(group)}" data-profile="{e(profile_text.lower())}">
      <div class="researcher-profile"><span class="researcher-avatar" aria-hidden="true">{e(initials)}</span><div class="researcher-identities">{people}</div></div>
      <div class="project-area"><p class="project-label">{project_label}</p><div class="project-links">{projects}</div>{'<p class="resource-subtitle">Explore their work on the linked homepage.</p>' if not number else ''}</div>
    </article>''')

repositories = []
for repo in DATA['repositories']:
    repositories.append(f'''<article class="resource-card collection-card" data-item data-search="{search_attr(repo)}">
      <div class="resource-meta">{icon('code')}<span>{'Repository' if domain(repo['url']) == 'github.com' else 'Reading collection'}</span></div>
      <h3>{link(repo['title'], repo['url'])}</h3>
      {'<p class="resource-subtitle">' + e(repo['description']) + '</p>' if repo.get('description') else ''}
      <div class="resource-footer"><span class="resource-domain">{e(domain(repo['url']))}</span></div>
    </article>''')

talks = []
for talk in DATA['talks']:
    host = domain(talk['url'])
    kind = 'Video' if 'bilibili' in host else ('Interview / Notes' if 'weixin' in host else 'Blog / Reading')
    talks.append(f'''<article class="talk-card" data-item data-search="{search_attr(talk)}">
      <span class="talk-icon">{icon('talk')}</span><div><div class="resource-meta"><span class="tag">{kind}</span><span class="resource-domain">{e(host)}</span></div>
      <h3>{link(talk['title'], talk['url'])}</h3></div>
    </article>''')

section_specs = [('courses', 'Courses', COUNTS['courses']), ('research', 'Researchers & Research', COUNTS['researchers']), ('collections', 'Awesome Repos', COUNTS['repositories']), ('talks', 'Talks & Blogs', COUNTS['talks'])]
nav = ''.join(f'<a href="#{id}" data-nav="{id}"><span>{title}</span><span class="nav-count">{count}</span></a>' for id, title, count in section_specs)
filters = f'<button class="filter-button" type="button" data-filter="all" aria-pressed="true">All <span>{ENTRY_COUNT}</span></button>' + ''.join(f'<button class="filter-button" type="button" data-filter="{id}" aria-pressed="false">{title} <span>{count}</span></button>' for id, title, count in section_specs)

# A decorative, code-native motion study. It conveys the subject, not research data.
poses = [
    ((22,12), [(22,28),(20,63),(14,80)], [(22,33),(5,49),(-4,65)], [(22,33),(37,49),(44,31)], [(14,80),(-2,106),(-11,132)], [(14,80),(35,101),(47,130)]),
    ((20,12), [(20,28),(18,62),(19,80)], [(20,34),(7,51),(0,66)], [(20,34),(35,44),(45,36)], [(19,80),(16,107),(4,132)], [(19,80),(34,103),(38,131)]),
    ((20,12), [(20,28),(19,62),(19,80)], [(20,34),(5,46),(-2,37)], [(20,34),(35,54),(38,70)], [(19,80),(36,105),(47,131)], [(19,80),(8,104),(-6,132)]),
]
pose_svg = ''
for idx, (head, *segments) in enumerate(poses):
    color = ['#a0c8c5', '#5c9c9d', '#167c79'][idx]
    parts = f'<circle cx="{head[0]}" cy="{head[1]}" r="8"/>'
    for segment in segments:
        parts += '<polyline points="' + ' '.join(f'{x},{y}' for x, y in segment) + '"/>'
    joints = set(point for segment in segments for point in segment)
    parts += ''.join(f'<circle cx="{x}" cy="{y}" r="2.3" fill="{color}" stroke="none"/>' for x,y in joints)
    pose_svg += f'<g transform="translate({50+idx*91},64)" fill="none" stroke="{color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">{parts}</g>'
art = f'''<svg viewBox="0 0 340 270" role="img" aria-label="An abstract sequence of three human motion poses">
  <defs><pattern id="dotgrid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#d7e9e7"/></pattern></defs>
  <rect x="7" y="7" width="326" height="244" rx="22" fill="url(#dotgrid)"/>
  <path d="M24 215H316" stroke="#adc9c6"/><path d="M33 211c68-25 143-35 270-3" fill="none" stroke="#b2d3cf" stroke-dasharray="4 6"/>
  {pose_svg}
  <text x="25" y="38" fill="#496c6d" font-family="monospace" font-size="12" letter-spacing="1.5">A STUDY IN MOTION</text>
  <text x="25" y="243" fill="#496c6d" font-family="monospace" font-size="11" letter-spacing="1">HUMAN · HUMANOID</text>
</svg>'''

html = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Human &amp; Humanoid Motion Learning Guide | Xiaolin Huang</title>
  <meta name="description" content="A curated guide to human and humanoid motion learning: {COUNTS['courses']} courses, {PEOPLE_COUNT} researchers, {PROJECT_COUNT} selected projects, {COUNTS['repositories']} resource collections, and {COUNTS['talks']} talks and blogs.">
  <meta name="theme-color" content="#147d78">
  <link rel="canonical" href="https://hxlinworld.github.io/Humanoid-motion-learning-guide/">
  <meta property="og:type" content="website"><meta property="og:title" content="Human &amp; Humanoid Motion Learning Guide">
  <meta property="og:description" content="Courses, researchers, selected projects, and resources for exploring human and humanoid motion learning.">
  <meta property="og:url" content="https://hxlinworld.github.io/Humanoid-motion-learning-guide/">
  <link rel="icon" href="./assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="./assets/styles.css"><script src="./assets/guide.js" defer></script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="masthead">
  <a class="brand" href="https://hxlinworld.github.io/"><span class="brand-mark" aria-hidden="true">xh.</span><span class="brand-name">Xiaolin Huang<small>RESEARCH NOTES</small></span></a>
  <nav class="top-links" aria-label="Site links"><a href="https://hxlinworld.github.io/">Personal homepage</a></nav>
</header>
<div class="layout">
<aside class="sidebar" aria-label="Guide navigation">
  <p class="sidebar-label">THE GUIDE</p><a class="guide-name" href="#overview">Human &amp; Humanoid<br>Motion Learning</a>
  <nav class="section-nav" aria-label="On this page">{nav}</nav>
  <div class="sidebar-note"><p>A collection to learn from,<br>and return to.</p><span>{LINK_COUNT} curated links</span></div>
</aside>
<main id="main">
  <section class="hero" id="overview" aria-labelledby="guide-title">
    <div class="hero-copy"><p class="eyebrow">ROBOT LEARNING · CHARACTER ANIMATION</p>
      <h1 id="guide-title">Human &amp; Humanoid<br><span class="accent">Motion Learning.</span></h1>
      <p class="hero-description">A curated guide to the courses, people, and research behind human and humanoid motion. Find a starting point. Follow an idea further.</p>
      <div class="hero-actions"><a class="primary-link" href="#courses">Explore the guide</a><a class="text-link" href="#research">Meet the researchers</a></div>
    </div>
    <div class="hero-art">{art}</div>
    <div class="hero-stats"><div><strong>{PROJECT_COUNT}</strong><span>selected projects</span></div><div><strong>{PEOPLE_COUNT}</strong><span>researchers</span></div><div><strong>4</strong><span>resource sections</span></div></div>
  </section>
  <section class="guide-controls" aria-label="Find resources">
    <div class="search-field">{icon('search')}<label class="sr-only" for="search">Search the guide</label><input id="search" type="search" placeholder="Search researchers, projects, or resources…" autocomplete="off" spellcheck="false"><kbd aria-hidden="true">/</kbd><button class="clear-search" type="button" aria-label="Clear search" hidden>{icon('close')}</button></div>
    <div class="filter-row"><div class="category-filters" role="group" aria-label="Filter by section">{filters}</div><p class="result-count" aria-live="polite" aria-atomic="true">{ENTRY_COUNT} entries</p></div>
  </section>
  <div class="empty-state" hidden><h2>No matching resources</h2><p>Try a researcher’s name, a project such as DeepMimic, or a broader keyword.</p><button type="button" id="reset-search">Clear filters</button></div>
  <section class="content-section" id="courses" data-section="courses" aria-labelledby="courses-title">
    <div class="section-heading"><div><p class="eyebrow">BUILD THE FOUNDATIONS</p><h2 id="courses-title">Courses</h2><p class="section-description">Start with character animation and the fundamentals of robot learning.</p></div><span class="section-count">{COUNTS['courses']} resources</span></div>
    <div class="course-grid">{''.join(courses)}</div>
  </section>
  <section class="content-section" id="research" data-section="research" aria-labelledby="research-title">
    <div class="section-heading"><div><p class="eyebrow">FOLLOW THE IDEAS</p><h2 id="research-title">Researchers &amp; Selected Research</h2><p class="section-description">Explore the people and projects collected in the original guide.</p></div><span class="section-count">{PROJECT_COUNT} projects</span></div>
    <div class="researcher-list">{''.join(researchers)}</div>
  </section>
  <section class="content-section" id="collections" data-section="collections" aria-labelledby="collections-title">
    <div class="section-heading"><div><p class="eyebrow">KEEP EXPLORING</p><h2 id="collections-title">Awesome Repos</h2><p class="section-description">Reading lists, resource collections, and practical starting points.</p></div><span class="section-count">{COUNTS['repositories']} collections</span></div>
    <div class="collection-grid">{''.join(repositories)}</div>
  </section>
  <section class="content-section" id="talks" data-section="talks" aria-labelledby="talks-title">
    <div class="section-heading"><div><p class="eyebrow">BEYOND THE PAPERS</p><h2 id="talks-title">Talks &amp; Blogs</h2><p class="section-description">Conversations, technical talks, and notes from across the field.</p></div><span class="section-count">{COUNTS['talks']} resources</span></div>
    <div class="talk-list">{''.join(talks)}</div>
  </section>
  <footer class="site-footer"><div><strong>Human &amp; Humanoid Motion Learning Guide</strong><p>A curated collection of courses, researchers, projects, and resources.</p><small>Content last updated: {SOURCE_DATE}.</small></div><nav aria-label="Footer"><a href="https://hxlinworld.github.io/">Xiaolin Huang’s homepage</a><a href="#overview">Back to overview</a></nav></footer>
</main>
</div>
<button class="back-to-top" type="button" aria-label="Back to top" hidden>Top</button>
</body>
</html>
'''
(OUT / 'index.html').write_text('\n'.join(line.rstrip() for line in html.splitlines()) + '\n', encoding='utf-8')
print(f'Generated {OUT / "index.html"} with {LINK_COUNT} source links.')
