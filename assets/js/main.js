// Small JS for nav toggle and reveal animations
(function(){
  // Nav toggle
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if(btn && nav){
    btn.addEventListener('click', ()=>{
      const open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      btn.setAttribute('aria-expanded', String(!open));
    });
  }

  // Respect user preference for reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced) return;

  // Reveal elements on scroll
  const revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },{threshold: 0.12});

  document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

  // Highlight active section link in header
  const sections = document.querySelectorAll('main > .section');
  const navLinks = document.querySelectorAll('.site-nav a');
  const sectionObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const id = entry.target.id;
      const link = document.querySelector('.site-nav a[href="#'+id+'"]');
      if(entry.isIntersecting){
        navLinks.forEach(l=>l.classList.remove('active'));
        if(link) link.classList.add('active');
      }
    });
  },{threshold:0.45});

  sections.forEach(s=>sectionObserver.observe(s));

  // Simple contact form handling (client-side only)
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if(form && status){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      status.textContent = 'Sending...';
      // Simulate async submit
      setTimeout(()=>{
        status.textContent = 'Thanks — your message has been sent (demo).';
        form.reset();
      }, 800);
    });
  }

})();
