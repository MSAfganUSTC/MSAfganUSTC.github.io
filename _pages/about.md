---
permalink: /
author_profile: true
title: false
---

<div id="cv-content" class="cv-document">

<div class="pdf-only cv-pdf-header">
  <h1>{{ site.author.name | default: site.name }}</h1>
  <p>{{ site.author.bio }}</p>
  <p>
    {% if site.author.email %}{{ site.author.email }}{% endif %}
    {% if site.url %} · {{ site.url }}{% endif %}
  </p>
</div>

<section id="about" class="cv-section" markdown="1">
{% include sections/about.md %}
</section>

<section id="education" class="cv-section" markdown="1">
{% include sections/education.md %}
</section>

<section id="experience" class="cv-section" markdown="1">
{% include sections/experience.md %}
</section>

<section id="publications" class="cv-section" markdown="1">
{% include sections/publications.md %}
</section>

<section id="awards" class="cv-section" markdown="1">
{% include sections/awards.md %}
</section>

<section id="services" class="cv-section" markdown="1">
{% include sections/services.md %}
</section>

</div>

<p id="cv-download-status" class="cv-download-status no-pdf" role="status" aria-live="polite"></p>
