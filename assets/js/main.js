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
  // Supports two modes:
  // 1) If the form has a `data-endpoint` attribute (e.g. Formspree URL), it will POST the form to that endpoint.
  // 2) Otherwise it falls back to opening the user's default mail client with a prefilled mailto: link.
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if(form && status){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      status.textContent = 'Sending...';

      const endpoint = form.dataset.endpoint && form.dataset.endpoint.trim();

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
            finish('Sorry — there was a problem sending the message.');
          }
        }catch(err){
          console.error('Form submit exception', err);
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
