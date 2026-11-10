---
permalink: /
author_profile: true
title: false
---

<div class="site-language-control no-pdf" aria-label="Website language selector">
  <div class="site-language-control__label">
    <i class="fas fa-globe" aria-hidden="true"></i>
    <span>Language</span>
  </div>
  <div id="google_translate_element"></div>
</div>

<div id="cv-content" class="cv-document">

<div class="pdf-only cv-pdf-header">
  <img class="cv-pdf-profile" src="{{ '/images/' | append: site.author.avatar | relative_url }}" alt="{{ site.author.name | default: site.name }}">
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

<section id="code" class="cv-section" markdown="1">
<div class="cv-section-title"><i class="fab fa-github" aria-hidden="true"></i><span>Research Code</span></div>
Selected repositories: [FaceExpr](https://github.com/MSAfganUSTC/FaceExpr) · [DiffAgeX](https://github.com/MSAfganUSTC/DiffAgeX) · [ViDiExPo](https://github.com/MSAfganUSTC/ViDiExPo) · [All repositories](https://github.com/MSAfganUSTC).
</section>

<section id="education" class="cv-section" markdown="1">
{% include sections/education.md %}
</section>

<section id="experience" class="cv-section" markdown="1">
{% include sections/experience.md %}
</section>

<section id="ongoing-projects" class="cv-section" markdown="1">
<div class="cv-section-title"><i class="fas fa-flask" aria-hidden="true"></i><span>Ongoing Research Projects</span></div>

### Medical Image Analysis and Diabetic Wound Assessment
**Status:** Ongoing collaboration

Investigating deep learning and image augmentation methods for diabetic wound assessment, including analysis of infection-related visual characteristics and longitudinal evaluation of wound healing.

### Generalizable Information Integration in Pretrained Generative Models
**Status:** Research direction

Investigating adaptive mechanisms for integrating complementary conditioning information into pretrained diffusion models while preserving their existing generative capabilities. The research emphasizes controllability, representation learning, and systematic evaluation.
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

<section id="references" class="cv-section" markdown="1">
{% include sections/references.md %}
</section>

<section id="cv-panel" class="cv-section no-pdf">
  <div class="cv-section-title">
    <i class="fas fa-file-pdf" aria-hidden="true"></i>
    <span>Curriculum Vitae</span>
  </div>
  <p>Download a PDF generated from the current academic information on this page.</p>
  <p><a href="/#download-cv" class="cv-download-link"><strong>Download Current CV (PDF)</strong></a></p>
</section>

</div>

<p id="cv-download-status" class="cv-download-status no-pdf" role="status" aria-live="polite"></p>
