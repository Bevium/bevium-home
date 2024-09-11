/**
 * Template Name: Anyar
 * Updated: Mar 10 2023 with Bootstrap v5.2.3
 * Template URL: https://bootstrapmade.com/anyar-free-multipurpose-one-page-bootstrap-theme/
 * Author: BootstrapMade.com
 * License: https://bootstrapmade.com/license/
 */
(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
      el = el.trim()
      if (all) {
          return [...document.querySelectorAll(el)]
      } else {
          return document.querySelector(el)
      }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
      let selectEl = select(el, all)
      if (selectEl) {
          if (all) {
              selectEl.forEach(e => e.addEventListener(type, listener))
          } else {
              selectEl.addEventListener(type, listener)
          }
      }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
      el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
      let position = window.scrollY + 200
      navbarlinks.forEach(navbarlink => {
          if (!navbarlink.hash) return
          let section = select(navbarlink.hash)
          if (!section) return
          if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
              navbarlink.classList.add('active')
          } else {
              navbarlink.classList.remove('active')
          }
      })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
      let header = select('#header')
      let offset = header.offsetHeight

      if (!header.classList.contains('fixed-top')) {
          offset += 70
      }

      let elementPos = select(el).offsetTop
      window.scrollTo({
          top: elementPos - offset,
          behavior: 'smooth'
      })
  }

  /**
   * Header fixed top on scroll
   */
  let selectHeader = select('#header')
  let selectTopbar = select('#topbar')
  if (selectHeader) {
      const headerScrolled = () => {
          if (window.scrollY > 100) {
              selectHeader.classList.add('header-scrolled')
              if (selectTopbar) {
                  selectTopbar.classList.add('topbar-scrolled')
              }
          } else {
              selectHeader.classList.remove('header-scrolled')
              if (selectTopbar) {
                  selectTopbar.classList.remove('topbar-scrolled')
              }
          }
      }
      window.addEventListener('load', headerScrolled)
      onscroll(document, headerScrolled)
  }

  let heroSection = select('#video')
  if (heroSection) {
      const heroScrolled = () => {
          var scaleSize = ((1 + (0.0005 * window.scrollY)) > 1.2) ? 1.2 : 1 + (0.0005 * window.scrollY);

          //heroSection.style.transform =  `scale(${scaleSize})`;
      }
      window.addEventListener('load', heroScrolled)
      onscroll(document, heroScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
      const toggleBacktotop = () => {
          if (window.scrollY > 100) {
              backtotop.classList.add('active')
          } else {
              backtotop.classList.remove('active')
          }
      }
      window.addEventListener('load', toggleBacktotop)
      onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
      select('#navbar').classList.toggle('navbar-mobile')
      this.classList.toggle('bi-list')
      this.classList.toggle('bi-x')
  })

  /**
   * Mobile nav dropdowns activate
   */
  on('click', '.navbar .dropdown > a', function(e) {
      if (select('#navbar').classList.contains('navbar-mobile')) {
          e.preventDefault()
          this.nextElementSibling.classList.toggle('dropdown-active')
      }
  }, true)

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
      if (select(this.hash)) {
          e.preventDefault()

          let navbar = select('#navbar')
          if (navbar.classList.contains('navbar-mobile')) {
              navbar.classList.remove('navbar-mobile')
              let navbarToggle = select('.mobile-nav-toggle')
              navbarToggle.classList.toggle('bi-list')
              navbarToggle.classList.toggle('bi-x')
          }
          scrollto(this.hash)
      }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
      if (window.location.hash) {
          if (select(window.location.hash)) {
              scrollto(window.location.hash)
          }
      }
  });

  /**
   * Clients Slider
   */
  new Swiper('.clients-slider', {
      speed: 400,
      loop: true,
      autoplay: {
          delay: 5000,
          disableOnInteraction: false
      },
      slidesPerView: 'auto',
      pagination: {
          el: '.clients-swiper-pagination',
          type: 'bullets',
          clickable: true
      },
      breakpoints: {
          320: {
              slidesPerView: 2,
              spaceBetween: 40
          },
          480: {
              slidesPerView: 3,
              spaceBetween: 60
          },
          640: {
              slidesPerView: 4,
              spaceBetween: 80
          },
          992: {
              slidesPerView: 6,
              spaceBetween: 120
          }
      }
  });

  /**
   * Games Slider
   */
  new Swiper('.games-slider', {
      speed: 200,
      loop: true,
      autoplay: {
          delay: 5000,
          disableOnInteraction: false
      },
      slidesPerView: 'auto',
      pagination: {
          el: '.games-swiper-pagination',
          type: 'bullets',
          clickable: true
      }
  });

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener('load', () => {
      let portfolioContainer = select('.portfolio-container');
      if (portfolioContainer) {
          let portfolioIsotope = new Isotope(portfolioContainer, {
              itemSelector: '.portfolio-item',
              layoutMode: 'fitRows'
          });

          let portfolioFilters = select('#portfolio-flters li', true);

          on('click', '#portfolio-flters li', function(e) {
              e.preventDefault();
              portfolioFilters.forEach(function(el) {
                  el.classList.remove('filter-active');
              });
              this.classList.add('filter-active');

              portfolioIsotope.arrange({
                  filter: this.getAttribute('data-filter')
              });
              portfolioIsotope.on('arrangeComplete', function() {
                  AOS.refresh()
              });
          }, true);
      }

  });

  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = GLightbox({
      selector: '.portfolio-lightbox'
  });

  /**
   * Initiate glightbox 
   */
  const gLightbox = GLightbox({
      selector: '.glightbox'
  });

  /**
   * Portfolio details slider
   */
  new Swiper('.portfolio-details-slider', {
      speed: 400,
      loop: true,
      autoplay: {
          delay: 5000,
          disableOnInteraction: false
      },
      pagination: {
          el: '.swiper-pagination',
          type: 'bullets',
          clickable: true
      }
  });

  /**
   * Animation on scroll
   */
  window.addEventListener('load', () => {
      AOS.init({
          duration: 1000,
          easing: 'ease-in-out',
          once: true,
          mirror: false
      })
  });

  window.onload = function() {
      if (window.innerWidth >= 992) {
          playDesktopVideo();
      } else {
          playMobileVideo();
      }

      document.getElementById('blog-content').innerHTML = loadBlogContent();
      loadFeeds();
  };

  function loadFeeds() {
      if (window.twttr) {
          twttr.ready(function(twttr) {
              twttr.events.bind('loaded', function(event) {
                  let preloader = document.getElementById('preloader');
                  if (preloader) {
                      preloader.remove();
                  }
                  console.log("Loaded");
                  document.getElementById('blog-content').style.opacity = '100';
              });
              twttr.widgets.load();
          });
      } else {
          console.error('Twitter widgets script not loaded');
      }
  }

  function playMobileVideo() {
    const videoElement = document.getElementById('bgVideo');
    videoElement.muted = true;
    videoElement.playsInline = true; 
    videoElement.autoplay = false;
    videoElement.src = 'assets/video/beviummobile.mp4';
    videoElement.loop = true;
    videoElement.load();
    videoElement.play();
  }

  function playDesktopVideo() {
      const videoElement = document.getElementById('bgVideo');
      videoElement.src = 'assets/video/BeviumBackgroundVideoHQ.mp4';
      videoElement.loop = true;
      videoElement.load();
      videoElement.play();
  }

  function loadBlogContent() {
      return `
    <div class="container" data-aos="zoom-in">
      <div class="row">
        <div class="col-lg-6 mt-4" data-aos="fade-up" data-aos-delay="50">
          <div class="row" style="padding-bottom: 10px;">
            <a class="twitter-timeline" data-height="400" data-theme="light" href="https://twitter.com/bevium?ref_src=twsrc%5Etfw">Tweets by bevium</a>
          </div>
          <div class="row">
            <iframe width="100" height="300" src="https://rss.app/embed/v1/feed/tpT2kdzMiAC6oqg4" frameborder="0"></iframe>
          </div>
        </div>
        <div class="col-lg-6 mt-4" data-aos="fade-up" data-aos-delay="200">
          <iframe width="100%" height="700" src="https://rss.app/embed/v1/feed/tLnlRnuAXgAk5jpW" frameborder="0"></iframe>
        </div>
      </div>
    </div>
    `;
  }

})()