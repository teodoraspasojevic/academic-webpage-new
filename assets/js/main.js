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

  // THEME TOGGLE: persist user preference and respect system setting
  const themeToggle = document.getElementById('theme-toggle');
  const applyTheme = (mode) => {
    if(mode === 'dark'){
      document.body.classList.add('dark');
      if(themeToggle) themeToggle.setAttribute('aria-pressed','true');
    } else {
      document.body.classList.remove('dark');
      if(themeToggle) themeToggle.setAttribute('aria-pressed','false');
    }
  };

  // read saved preference
  const saved = localStorage.getItem('theme');
  if(saved) applyTheme(saved);
  else {
    // no saved preference — respect OS preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      const isDark = document.body.classList.contains('dark');
      const next = isDark ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('theme', next);
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
  // Supports two modes:
  // 1) If the form has a `data-endpoint` attribute (e.g. Formspree URL), it will POST the form to that endpoint.
  // 2) If the form has an absolute `action` URL, that will be used as the endpoint.
  // 3) Otherwise it falls back to opening the user's default mail client with a prefilled mailto: link.
  // If you have a known endpoint (e.g. Formspree), provide it here as a last-resort fallback so published pages that strip attributes still work.
  const DEFAULT_FORM_ENDPOINT = 'https://formspree.io/f/xreabkee';
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if(form && status){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      status.textContent = 'Sending...';

      // Prefer explicit data-endpoint, otherwise use absolute action URL if available
      let endpoint = '';
      if(form.dataset && form.dataset.endpoint && form.dataset.endpoint.trim()){
        endpoint = form.dataset.endpoint.trim();
      } else if(form.action && form.action.trim()){
        const act = form.action.trim();
        // use action only if it's an absolute URL (http/https or protocol-relative)
        if(act.startsWith('http') || act.startsWith('//')){
          endpoint = act;
        }
      }

      // Last-resort: use hardcoded DEFAULT_FORM_ENDPOINT if nothing else found
      if(!endpoint && DEFAULT_FORM_ENDPOINT){
        endpoint = DEFAULT_FORM_ENDPOINT;
      }

      // Helper to show final state
      const finish = (msg, ok=true) => {
        status.textContent = msg;
        if(ok) form.reset();
      };

      if(endpoint){
        // POST to configured endpoint (expects FormData)
        try{
          const fd = new FormData(form);
          const res = await fetch(endpoint, { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } });
          if(res.ok){
            finish('Thanks — your message has been sent.');
          } else {
            // Try to parse json error message
            let data;
            try{ data = await res.json(); }catch(e){/*ignore*/}
            console.error('Form submit error', res.status, data);
            // If fetch failed due to CORS or server rejecting JSON, try native submit once as fallback
            if(!form.dataset.nativeTried){
              form.dataset.nativeTried = '1';
              // submit the form natively (this will perform a regular POST to the action URL)
              form.submit();
              return;
            }
            finish('Sorry — there was a problem sending the message.');
          }
        }catch(err){
          console.error('Form submit exception', err);
          // If fetch threw (network/CORS), fallback to native submit once
          if(!form.dataset.nativeTried){
            form.dataset.nativeTried = '1';
            form.submit();
            return;
          }
          finish('Error sending form — please try again later.');
        }
        return;
      }

      // Fallback: open user's mail client with prefilled subject/body
      try{
        const name = form.querySelector('[name="name"]').value || '';
        const email = form.querySelector('[name="email"]').value || '';
        const message = form.querySelector('[name="message"]').value || '';
        const to = 'spasojevic.teodora@gmail.com';
        const subject = encodeURIComponent('Website contact from ' + name);
        const body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message);
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
        finish('Opening your mail app...');
      }catch(err){
        console.error('Mailto fallback failed', err);
        // Keep the simulated behavior as last resort
        setTimeout(()=>{
          finish('Thanks — your message has been sent (demo).');
        }, 800);
      }
    });
  }

})();
