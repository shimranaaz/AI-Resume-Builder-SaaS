(function(){
  "use strict";

  /* ============================================================
     MOBILE SIDEBAR TOGGLE
     ============================================================ */
  var menuToggle = document.getElementById('menuToggle');
  var sidebar = document.getElementById('sidebar');
  menuToggle.addEventListener('click', function(){
    sidebar.classList.toggle('open');
  });
  sidebar.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){ sidebar.classList.remove('open'); });
  });

  /* ============================================================
     SCROLL PROGRESS BAR
     ============================================================ */
  var progressBar = document.getElementById('progressBar');
  function updateProgress(){
    var h = document.documentElement;
    var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progressBar.style.width = (scrolled || 0) + '%';
  }
  document.addEventListener('scroll', updateProgress, { passive:true });
  updateProgress();

  /* ============================================================
     SCROLL REVEAL ANIMATION
     ============================================================ */
  var revealEls = document.querySelectorAll('.reveal');
  var revealObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold:0.08, rootMargin:'0px 0px -60px 0px' });
  revealEls.forEach(function(el){ revealObserver.observe(el); });

  /* ============================================================
     ACTIVE SIDEBAR HIGHLIGHTING
     ============================================================ */
  var sections = document.querySelectorAll('.doc-section[id]');
  var navLinks = document.querySelectorAll('.sidebar a[data-nav]');
  function setActive(id){
    navLinks.forEach(function(l){
      l.classList.toggle('active', l.getAttribute('href') === '#' + id);
    });
  }
  var sectionObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){ setActive(entry.target.id); }
    });
  }, { rootMargin:'-15% 0px -70% 0px', threshold:0 });
  sections.forEach(function(s){ sectionObserver.observe(s); });

  /* ============================================================
     COPY CODE BUTTONS
     ============================================================ */
  function copyText(text, btn){
    navigator.clipboard.writeText(text).then(function(){
      var original = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
      btn.classList.add('copied');
      setTimeout(function(){
        btn.innerHTML = original;
        btn.classList.remove('copied');
      }, 1800);
    }).catch(function(){
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try{ document.execCommand('copy'); }catch(e){}
      document.body.removeChild(ta);
    });
  }
  document.querySelectorAll('.copy-btn[data-copy]').forEach(function(btn){
    btn.addEventListener('click', function(){
      copyText(btn.getAttribute('data-copy'), btn);
    });
  });

  /* Copy full documentation link */
  var copyDocsBtn = document.getElementById('copyDocsBtn');
  if(copyDocsBtn){
    copyDocsBtn.addEventListener('click', function(){
      copyText(window.location.href, copyDocsBtn);
    });
  }

  /* ============================================================
     FAQ ACCORDION
     ============================================================ */
  document.querySelectorAll('.acc-trigger').forEach(function(trigger){
    trigger.addEventListener('click', function(){
      var item = trigger.closest('.acc-item');
      var panel = item.querySelector('.acc-panel');
      var isOpen = item.classList.contains('open');

      document.querySelectorAll('.acc-item.open').forEach(function(openItem){
        if(openItem !== item){
          openItem.classList.remove('open');
          openItem.querySelector('.acc-panel').style.maxHeight = null;
        }
      });

      if(isOpen){
        item.classList.remove('open');
        panel.style.maxHeight = null;
      } else {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ============================================================
     SEARCH MODAL
     ============================================================ */
  var searchOverlay = document.getElementById('searchOverlay');
  var searchInput = document.getElementById('searchInput');
  var searchResults = document.getElementById('searchResults');
  var searchOpenBtn = document.getElementById('searchOpenBtn');

  var searchIndex = [];
  document.querySelectorAll('.doc-section[id]').forEach(function(section){
    var title = section.querySelector('.section-title, h1');
    var desc = section.querySelector('.section-desc, p.lead');
    searchIndex.push({
      id: section.id,
      title: title ? title.textContent.trim() : section.id,
      desc: desc ? desc.textContent.trim() : ''
    });
  });

  function openSearch(){
    searchOverlay.classList.add('show');
    searchInput.value = '';
    renderResults('');
    setTimeout(function(){ searchInput.focus(); }, 50);
  }
  function closeSearch(){
    searchOverlay.classList.remove('show');
  }
  function renderResults(query){
    var q = query.trim().toLowerCase();
    var matches = !q ? searchIndex : searchIndex.filter(function(item){
      return item.title.toLowerCase().indexOf(q) !== -1 || item.desc.toLowerCase().indexOf(q) !== -1;
    });
    if(matches.length === 0){
      searchResults.innerHTML = '<div class="search-empty">No results found for "' + query + '"</div>';
      return;
    }
    searchResults.innerHTML = matches.map(function(item){
      return '<div class="search-result-item" data-target="' + item.id + '">' +
        '<strong>' + item.title + '</strong>' +
        (item.desc ? '<span>' + item.desc.slice(0,80) + '</span>' : '') +
        '</div>';
    }).join('');
    searchResults.querySelectorAll('.search-result-item').forEach(function(el){
      el.addEventListener('click', function(){
        var target = document.getElementById(el.getAttribute('data-target'));
        closeSearch();
        if(target){ target.scrollIntoView({ behavior:'smooth', block:'start' }); }
      });
    });
  }

  searchOpenBtn.addEventListener('click', openSearch);
  searchOverlay.addEventListener('click', function(e){
    if(e.target === searchOverlay){ closeSearch(); }
  });
  searchInput.addEventListener('input', function(){ renderResults(searchInput.value); });

  document.addEventListener('keydown', function(e){
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){
      e.preventDefault();
      openSearch();
    }
    if(e.key === 'Escape'){
      closeSearch();
      closeLightbox();
    }
  });

  /* ============================================================
     LIGHTBOX FOR SCREENSHOTS
     ============================================================ */
  var lightbox = document.getElementById('lightbox');
  var lightboxBox = document.getElementById('lightboxBox');
  var lightboxClose = document.getElementById('lightboxClose');

  document.querySelectorAll('.shot-card').forEach(function(card){
    card.addEventListener('click', function(){
      var title = card.getAttribute('data-lightbox-title') || 'Preview';
      var icon = card.querySelector('.ph-icon') ? card.querySelector('.ph-icon').innerHTML : '<i class="fa-regular fa-image"></i>';
      lightboxBox.innerHTML =
        '<div class="browser-bar"><div class="code-dots"><span></span><span></span><span></span></div>' +
        '<span class="browser-url">' + title + '</span></div>' +
        '<div class="shot-placeholder" style="aspect-ratio:16/9;"><span class="ph-icon" style="font-size:48px;">' + icon + '</span>' + title + '</div>';
      lightbox.classList.add('show');
    });
  });
  function closeLightbox(){ lightbox.classList.remove('show'); }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function(e){
    if(e.target === lightbox){ closeLightbox(); }
  });

})();