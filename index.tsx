
import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

// --- HTTPS Force Redirect (Security) ---
if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
  window.location.href = window.location.href.replace('http:', 'https:');
}

// --- Types ---
type Language = 'it' | 'en' | 'de';
type Theme = 'light' | 'dark';

interface TranslationSet {
  nav: { value: string; works: string; cards: string; info: string; };
  hero: { title: string; subtitle: string; tagline: string; desc: string; btn: string; };
  value: { title: string; desc: string; points: string[]; };
  works: { title: string; steps: { title: string; desc: string; }[]; };
  cards: { title: string; items: { id: string; title: string; desc: string; btn: string; }[]; };
  exclusivity: { title: string; desc: string; points: string[]; };
  target: { title: string; points: string[]; note: string; };
  footer: { copy: string; tag: string; label: string; cta: string; privacy: string; cookies: string; };
  legal: {
    privacyTitle: string;
    privacyBody: string;
    cookieTitle: string;
    cookieBody: string;
    close: string;
  };
  cookieBanner: {
    text: string;
    accept: string;
    decline: string;
  };
  emailInquiry: {
    subject: string;
    body: string;
  };
}

// --- High Performance Custom Cursor Component ---
const CustomCursor: React.FC<{ theme: Theme }> = memo(({ theme }) => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      const target = e.target as HTMLElement;
      const isInteractive = 
        ['A', 'BUTTON', 'INPUT', 'TEXTAREA'].includes(target.tagName) ||
        target.closest('button') !== null ||
        target.closest('a') !== null ||
        window.getComputedStyle(target).cursor === 'pointer';
      setIsPointer(isInteractive);
      if (isHidden) setIsHidden(false);
    };

    const updateCursor = () => {
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.25;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.25;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) scale(${isPointer ? 2.5 : 1})`;
      rafId = requestAnimationFrame(updateCursor);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', () => setIsHidden(true));
    document.addEventListener('mouseenter', () => setIsHidden(false));
    rafId = requestAnimationFrame(updateCursor);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [isHidden, isPointer]);

  if (isHidden) return null;

  return (
    <>
      <div ref={dotRef} className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform hidden md:block" style={{ transition: 'none' }}>
        <div className="-translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--color-gold)] shadow-[0_0_12px_var(--color-gold)]" />
      </div>
      <div ref={ringRef} className="fixed top-0 left-0 pointer-events-none z-[9998] border rounded-full hidden md:block border-[var(--color-gold)] opacity-40 will-change-transform"
        style={{ width: '40px', height: '40px', marginTop: '-20px', marginLeft: '-20px', backgroundColor: isPointer ? 'rgba(var(--color-gold-rgb), 0.15)' : 'transparent', backdropFilter: isPointer ? 'blur(2px)' : 'none', transition: 'background-color 0.2s ease, border-color 0.2s ease' }} />
    </>
  );
});

// --- Memoized UI Components ---
const Section = memo(({ id, children, className = "" }: { id: string, children: React.ReactNode, className?: string }) => (
  <section id={id} className={`contain-content relative py-48 md:py-64 px-8 border-t border-[var(--color-border)] bg-[var(--color-bg)] transition-colors duration-500 ${className}`}>
    {children}
  </section>
));

const ThemeToggle = memo(({ theme, toggleTheme }: { theme: Theme, toggleTheme: () => void }) => (
  <button 
    onClick={toggleTheme}
    className="p-2 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-all group active:scale-95"
    title={theme === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
  >
    {theme === 'dark' ? (
      <svg className="w-4 h-4 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    )}
  </button>
));

const Header = memo(({ scrolled, t, lang, setLang, scrollToSection, theme, toggleTheme }: { scrolled: boolean, t: any, lang: Language, setLang: (l: Language) => void, scrollToSection: (id: string) => void, theme: Theme, toggleTheme: () => void }) => (
  <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${scrolled ? 'py-4 backdrop-blur-2xl border-b border-[var(--color-border)] bg-[var(--color-bg)]/70' : 'py-10 bg-transparent'}`}>
    <div className="container mx-auto px-8 sm:px-16 flex justify-between items-center">
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-3xl font-serif-display font-bold gold-text italic tracking-widest select-none active:scale-95 transition-transform">GB</button>
      <nav className="hidden lg:flex items-center gap-10">
        {[{ id: 'value', label: t.nav.value }, { id: 'works', label: t.nav.works }, { id: 'cards', label: t.nav.cards }, { id: 'contact', label: t.nav.info }].map(item => (
          <button key={item.id} onClick={() => scrollToSection(item.id)} className="text-[9px] font-black uppercase tracking-[0.5em] text-[var(--color-text-dim)] hover:text-[var(--color-gold)] relative group transition-colors">
            {item.label} <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-[var(--color-gold)] transition-all duration-500 group-hover:w-full" />
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-6">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <div className="flex gap-2">
           {(['it', 'en', 'de'] as Language[]).map(l => ( <button key={l} onClick={() => setLang(l)} className={`text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-full transition-all ${lang === l ? 'bg-[var(--color-gold)] text-black' : 'text-[var(--color-text-dim)] border border-[var(--color-border)] hover:text-[var(--color-text)]'}`}>{l}</button> ))}
        </div>
      </div>
    </div>
  </header>
));

const CookieBanner = memo(({ t }: { t: any }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const consent = localStorage.getItem('ora-cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  const handleConsent = (status: string) => {
    localStorage.setItem('ora-cookie-consent', status);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-8 left-8 right-8 md:left-auto md:max-w-md z-[100] animate-fade-up">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-8 rounded-[2rem] shadow-3xl backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)] mb-6 italic leading-relaxed">
          {t.cookieBanner.text}
        </p>
        <div className="flex gap-4">
          <button onClick={() => handleConsent('declined')} className="flex-1 py-3 rounded-full border border-[var(--color-border)] text-[9px] font-black uppercase tracking-widest hover:bg-[var(--color-bg)] transition-colors">{t.cookieBanner.decline}</button>
          <button onClick={() => handleConsent('accepted')} className="flex-1 py-3 rounded-full bg-[var(--color-gold)] text-black text-[9px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">{t.cookieBanner.accept}</button>
        </div>
      </div>
    </div>
  );
});

// --- Main App Component ---
const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('it');
  const [scrolled, setScrolled] = useState(false);
  const [heroActive, setHeroActive] = useState(false);
  const [legalView, setLegalView] = useState<'privacy' | 'cookies' | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ora-theme') as Theme;
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ora-theme', theme);
  }, [theme]);

  // Trigger hero animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setHeroActive(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const siteData: Record<Language, TranslationSet> = {
    it: {
      nav: { value: 'Visione', works: 'Metodo', cards: 'Collezioni', info: 'Contatti' },
      hero: { title: 'L\'Eleganza del Ricordo', subtitle: 'Tributi digitali su misura per momenti che meritano di durare.', tagline: 'Vendi status + intenzione.', desc: 'Oltre il servizio: una scelta consapevole.', btn: 'Inizia la Visione' },
      value: { title: 'Esperienze di Memoria', desc: 'Io non creo semplici file digitali. Progetto esperienze di memoria eleganti, intime e permanenti.', points: ['Design su misura', 'Narrazione emozionale', 'Qualità editoriale', 'Estetica senza tempo'] },
      works: { title: 'Metodo e Cura', steps: [{ title: '01 – Visione', desc: 'Ascolto, intenzione, tono emotivo.' }, { title: '02 – Design', desc: 'Concept visivo e narrativo personalizzato.' }, { title: '03 – Perfezione', desc: 'Raffinamento condiviso, dettagli, ritmo.' }, { title: '04 – Consegna', desc: 'Il tributo è pronto. Nessuna scadenza. Nessun rumore.' }] },
      cards: { title: 'Le Collezioni', items: [{ id: 'celebrazioni', title: 'Celebrazioni', desc: 'Per compleanni memorabili.', btn: 'Approfondisci' }, { id: 'unioni', title: 'Unioni', desc: 'L\'eterno fascino dell\'amore.', btn: 'Approfondisci' }, { id: 'ricorrenze', title: 'Ricorrenze', desc: 'Il calore delle tradizioni.', btn: 'Approfondisci' }, { id: 'memorial', title: 'In Memoriam', desc: 'Un omaggio solenne per onorare una vita.', btn: 'Approfondisci' }] },
      exclusivity: { title: 'L\'Esclusività dell\'Unico', desc: 'Non lavoro su volume. Non uso template preconfezionati. Non inseguo tendenze.', points: ['Ogni progetto è unico', 'Come il ricordo che rappresenta'] },
      target: { title: 'Per chi cerca l\'eccellenza', points: ['Dà valore ai dettagli', 'Cerca discrezione', 'Desidera qualcosa che duri'], note: 'Non è un prodotto di massa. È una scelta consapevole.' },
      footer: { copy: '© 2026 Giuseppe Basile. Eccellenza Digitale.', tag: 'Se senti che questo linguaggio ti appartiene, possiamo parlarne.', label: 'Conversazione Privata', cta: 'Richiedi una conversazione privata', privacy: 'Privacy Policy', cookies: 'Cookie Policy' },
      legal: {
        privacyTitle: 'Informativa Privacy',
        privacyBody: 'I dati personali forniti volontariamente tramite email (giu.bas.91@gmail.com) saranno trattati esclusivamente per rispondere alle richieste di contatto. Non effettuiamo profilazione né cessione a terzi.',
        cookieTitle: 'Cookie Policy',
        cookieBody: 'Utilizziamo solo cookie tecnici per il corretto funzionamento del sito. Non utilizziamo cookie di tracciamento di terze parti.',
        close: 'Chiudi'
      },
      cookieBanner: {
        text: 'Utilizziamo cookie tecnici per garantire la migliore esperienza. Nessun dato viene ceduto a terzi.',
        accept: 'Accetta tutto',
        decline: 'Rifiuta'
      },
      emailInquiry: {
        subject: 'Approfondimento Collezione: [TITOLO]',
        body: 'Gentile Giuseppe Basile,\n\nSono interessato a ricevere maggiori informazioni riguardo alla collezione "[TITOLO]".\n\nDescrizione del prodotto: [DESCRIZIONE]\n\nCordiali saluti.'
      }
    },
    en: {
        nav: { value: 'Vision', works: 'Method', cards: 'Collections', info: 'Contact' },
        hero: { title: 'The Elegance of Memory', subtitle: 'Tailor-made digital tributes for moments that deserve to last.', tagline: 'Sell status + intention.', desc: 'Beyond service: a conscious choice.', btn: 'Begin the Vision' },
        value: { title: 'Memory Experiences', desc: 'I do not create simple digital files. I design memory experiences: elegant, intimate, and permanent.', points: ['Tailor-made design', 'Emotional storytelling', 'Editorial quality', 'Timeless aesthetics'] },
        works: { title: 'Method and Care', steps: [{ title: '01 – Vision', desc: 'Listening, intention, emotional tone.' }, { title: '02 – Design', desc: 'Custom visual and narrative concept.' }, { title: '03 – Perfection', desc: 'Shared refinement, details, rhythm.' }, { title: '04 – Delivery', desc: 'The tribute is ready. No deadlines. No noise.' }] },
        cards: { title: 'The Collections', items: [{ id: 'celebrations', title: 'Celebrations', desc: 'For memorable birthdays.', btn: 'Explore' }, { id: 'unions', title: 'Unions', desc: 'The eternal charm of love.', btn: 'Explore' }, { id: 'recurrences', title: 'Recurrences', desc: 'The warmth of traditions.', btn: 'Explore' }, { id: 'memorial', title: 'In Memoriam', desc: 'A solemn tribute to honor a life.', btn: 'Explore' }] },
        exclusivity: { title: 'The Exclusivity of the Unique', desc: 'I do not work on volume. I do not use pre-packaged templates. I do not follow trends.', points: ['Every project is unique', 'Like the memory it represents'] },
        target: { title: 'For those seeking excellence', points: ['Values details', 'Seeks discretion', 'Desires something that lasts'], note: 'Not a mass product. A conscious choice.' },
        footer: { copy: '© 2026 Giuseppe Basile. Digital Excellence.', tag: 'If you feel this language belongs to you, let us talk.', label: 'Private Conversation', cta: 'Request a private conversation', privacy: 'Privacy Policy', cookies: 'Cookie Policy' },
        legal: {
          privacyTitle: 'Privacy Policy',
          privacyBody: 'Personal data provided voluntarily via email (giu.bas.91@gmail.com) will be processed exclusively to respond to contact requests. We do not perform profiling or transfer to third parties.',
          cookieTitle: 'Cookie Policy',
          cookieBody: 'We only use technical cookies for the correct functioning of the site. We do not use third-party tracking cookies.',
          close: 'Close'
        },
        cookieBanner: {
          text: 'We use technical cookies to ensure the best experience. No data is shared with third parties.',
          accept: 'Accept All',
          decline: 'Decline'
        },
        emailInquiry: {
          subject: 'Collection Inquiry: [TITOLO]',
          body: 'Dear Giuseppe Basile,\n\nI am interested in receiving more information regarding the "[TITOLO]" collection.\n\nProduct description: [DESCRIZIONE]\n\nKind regards.'
        }
      },
      de: {
        nav: { value: 'Vision', works: 'Methode', cards: 'Kollektionen', info: 'Kontakt' },
        hero: { title: 'Eleganz der Erinnerung', subtitle: 'Maßgeschneiderte digitale Ehrungen für Momente, die es wert sono, zu bleiben.', tagline: 'Status + Intention verkaufen.', desc: 'Jenseits des Service: eine bewusste Entscheidung.', btn: 'Vision beginnen' },
        value: { title: 'Erinnerungserlebnisse', desc: 'Ich erstelle keine einfachen digitalen Dateien. Ich gestalte Erinnerungserlebnisse: elegant, intim, dauerhaft.', points: ['Maßgeschneidertes Design', 'Emotionales Storytelling', 'Redaktionelle Qualität', 'Zeitlose Ästhetik'] },
        works: { title: 'Methode and Sorgfalt', steps: [{ title: '01 – Vision', desc: 'Zuhören, Intention, emotionaler Ton.' }, { title: '02 – Design', desc: 'Individuelles visuelles und narratives Konzept.' }, { title: '03 – Perfektion', desc: 'Gemeinsame Verfeinerung, Details, Rhythmus.' }, { title: '04 – Übergabe', desc: 'Die Ehrung ist bereit. Keine Fristen. Kein Lärm.' }] },
        cards: { title: 'Die Kollektionen', items: [{ id: 'feiern', title: 'Feiern', desc: 'Für unvergessliche Geburtstage.', btn: 'Vertiefen' }, { id: 'verbindungen', title: 'Verbindungen', desc: 'Der ewige Charme della Liebe.', btn: 'Vertiefen' }, { id: 'wiederkehr', title: 'Wiederkehr', desc: 'Die Wärme von Traditionen.', btn: 'Vertiefen' }, { id: 'gedenken', title: 'In Memoriam', desc: 'Eine feierliche Ehrung für ein Leben.', btn: 'Vertiefen' }] },
        exclusivity: { title: 'Exklusività des Einzigartigen', desc: 'Ich arbeite nicht auf Volumen. Ich verwende keine fertigen Vorlagen. Ich folge keinen Trends.', points: ['Jedes Projekt ist unico', 'Wie die Erinnerung, die es repräsentiert'] },
        target: { title: 'Für diejenigen, die Exzellenz suchen', points: ['Legt Wert auf Details', 'Sucht Diskretion', 'Wünscht sich etwas Dauerhaftes'], note: 'Kein Massenprodukt. Eine bewusste Entscheidung.' },
        footer: { copy: '© 2026 Giuseppe Basile. Digitale Exzellenz.', tag: 'Wenn Sie das Gefühl haben, dass diese Sprache zu Ihnen gehört, lassen Sie uns sprechen.', label: 'Privates Gespräch', cta: 'Privates Gespräch anfordern', privacy: 'Datenschutz', cookies: 'Cookies' },
        legal: {
          privacyTitle: 'Datenschutzerklärung',
          privacyBody: 'Freiwillig per E-Mail (giu.bas.91@gmail.com) bereitgestellte personenbezogene Daten werden ausschließlich zur Beantwortung von Kontaktanfragen verarbeitet. Wir betreiben kein Profiling und geben keine dati an Dritte weiter.',
          cookieTitle: 'Cookie-Richtlinie',
          cookieBody: 'Wir verwenden nur tecniche Cookies für das ordnungsgemäße Funktionieren della Website. Wir verwenden keine Tracking-Cookies von Drittanbietern.',
          close: 'Schließen'
        },
        cookieBanner: {
          text: 'Wir verwenden technische Cookies, um das beste Erlebnis zu gewährleisten. Es werden keine dati an Dritte weitergegeben.',
          accept: 'Alle akzeptieren',
          decline: 'Ablehnen'
        },
        emailInquiry: {
          subject: 'Anfrage zur Kollektion: [TITOLO]',
          body: 'Sehr geehrter Giuseppe Basile,\n\nich interessiere mich für weitere Informationen zur Kollektion "[TITOLO]".\n\nProduktbeschreibung: [DESCRIZIONE]\n\nMit freundlichen Grüßen.'
        }
      }
  };

  const t = siteData[lang];

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = scrolled ? 80 : 120;
      const targetPos = el.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }
  };

  const handleConversationRequest = () => {
    const email = "giu.bas.91@gmail.com";
    const subject = encodeURIComponent("Conversazione Privata - Richiesta ORA");
    window.location.href = `mailto:${email}?subject=${subject}`;
  };

  const handleProductInquiry = (productTitle: string, productDesc: string) => {
    const email = "giu.bas.91@gmail.com";
    const { subject, body } = t.emailInquiry;
    
    // Replace placeholders with dynamic data
    const formattedSubject = subject.replace('[TITOLO]', productTitle);
    const formattedBody = body
      .replace('[TITOLO]', productTitle)
      .replace('[DESCRIZIONE]', productDesc);

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(formattedSubject)}&body=${encodeURIComponent(formattedBody)}`;
  };

  return (
    <div className="min-h-screen transition-colors duration-500">
      
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden grid grid-cols-4 md:grid-cols-8 gap-8 p-12 opacity-[0.05] transition-opacity duration-1000 will-change-opacity">
        {Array.from({ length: 24 }).map((_, i) => ( <div key={i} className="w-full aspect-[1/3] border border-[var(--color-border)] rounded-full" /> ))}
      </div>

      <div className="fixed inset-0 pointer-events-none z-[1] mix-blend-overlay grain-bg opacity-[0.02] will-change-transform" />
      
      <CustomCursor theme={theme} />
      <CookieBanner t={t} />

      <Header 
        scrolled={scrolled} 
        t={t} 
        lang={lang} 
        setLang={setLang} 
        scrollToSection={scrollToSection} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      {/* Legal Modal */}
      {legalView && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[var(--color-bg)]/95 backdrop-blur-2xl">
          <div className="w-full max-w-2xl p-12 rounded-[3.5rem] border border-[var(--color-gold)]/20 bg-[var(--color-surface)] shadow-3xl text-center">
            <h3 className="text-2xl font-serif-display gold-text mb-8 font-black uppercase tracking-[0.3em] italic">
              {legalView === 'privacy' ? t.legal.privacyTitle : t.legal.cookieTitle}
            </h3>
            <p className="text-sm italic text-[var(--color-text-dim)] leading-relaxed mb-12">
              {legalView === 'privacy' ? t.legal.privacyBody : t.legal.cookieBody}
            </p>
            <button onClick={() => setLegalView(null)} className="px-12 py-4 rounded-full bg-[var(--color-gold)] text-black text-[9px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
              {t.legal.close}
            </button>
          </div>
        </div>
      )}

      <main className="will-change-scroll">
        <section id="home" className="relative min-h-screen flex items-center justify-center pt-32 px-8 overflow-hidden contain-layout">
          <div className="container mx-auto text-center relative z-10">
            <h1 className={`hero-element text-6xl sm:text-8xl md:text-[8rem] font-serif-display font-light mb-8 tracking-tighter leading-[1.1] drop-shadow-2xl max-w-6xl mx-auto ${heroActive ? 'is-visible' : ''}`} style={{ transitionDelay: '100ms' }}>{t.hero.title}</h1>
            <div className={`hero-element max-w-2xl mx-auto mb-16 ${heroActive ? 'is-visible' : ''}`} style={{ transitionDelay: '300ms' }}>
              <p className="text-2xl sm:text-3xl font-serif-display italic tracking-[0.05em] gold-text opacity-90 leading-relaxed">{t.hero.subtitle}</p>
            </div>
            <div className={`hero-element ${heroActive ? 'is-visible' : ''}`} style={{ transitionDelay: '500ms' }}>
              <button onClick={() => scrollToSection('value')} className="inline-block px-14 py-7 rounded-full bg-[var(--color-gold)] text-black text-[11px] font-black uppercase tracking-[0.5em] transition-transform duration-500 shadow-2xl hover:scale-105 italic">{t.hero.btn}</button>
            </div>
          </div>
        </section>

        <Section id="value" className="text-center">
          <div className="container mx-auto max-w-4xl">
            <div className="p-16 md:p-24 rounded-[4rem] border border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-3xl shadow-3xl space-y-12 animate-fade-up">
              <h3 className="text-4xl sm:text-6xl font-serif-display gold-text italic">{t.value.title}</h3>
              <p className="text-2xl sm:text-3xl italic text-[var(--color-text-dim)] leading-relaxed font-serif-display">{t.value.desc}</p>
              <div className="flex flex-wrap justify-center gap-8 pt-8">
                {t.value.points.map((p: string, i: number) => (
                  <li key={i} className="flex items-center gap-6 text-sm font-black uppercase tracking-[0.3em] text-[var(--color-text-dim)] group hover:text-[var(--color-text)] transition-colors list-none"><span className="w-2 h-2 rounded-full bg-[var(--color-gold)]" /> {p}</li>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section id="works" className="text-center">
          <h2 className="text-5xl sm:text-8xl font-serif-display mb-40 tracking-tighter max-w-5xl mx-auto leading-tight italic">{t.works.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {t.works.steps.map((step: any, idx: number) => (
              <div key={idx} className="p-16 border rounded-full border-[var(--color-border)] bg-[var(--color-surface)]/60 hover:border-[var(--color-gold)]/30 aspect-[3/4] flex flex-col items-center justify-center transition-all duration-700 shadow-2xl group">
                <h3 className="text-2xl font-serif-display font-black mb-6 gold-text uppercase text-center italic tracking-widest">{step.title}</h3>
                <p className="text-lg italic text-[var(--color-text-dim)] text-center leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="cards">
          <div className="container mx-auto">
            <div className="mb-48 border-b pb-24 border-[var(--color-border)]"><h2 className="text-6xl sm:text-9xl font-serif-display tracking-tighter italic">{t.cards.title}</h2></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {t.cards.items.map((card: any) => (
                <div key={card.id} className="p-16 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/60 hover:border-[var(--color-gold)] aspect-[1/2] flex flex-col items-center justify-center text-center transition-all duration-700 group shadow-2xl">
                  <h3 className="text-5xl font-serif-display font-black mb-12 group-hover:gold-text transition-colors italic leading-tight">{card.title}</h3>
                  <p className="text-xl mb-24 italic text-[var(--color-text-dim)] font-medium leading-relaxed">{card.desc}</p>
                  <button onClick={() => handleProductInquiry(card.title, card.desc)} className="px-12 py-8 rounded-full border border-[var(--color-gold)]/30 text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-black font-black uppercase tracking-[0.4em] text-[12px] transition-colors shadow-lg italic">{card.btn}</button>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section id="exclusivity">
          <div className="container mx-auto grid lg:grid-cols-2 gap-24 items-start">
            <div className="space-y-16">
              <h2 className="text-5xl sm:text-7xl font-serif-display italic tracking-tight text-[var(--color-text)] opacity-90">{t.exclusivity.title}</h2>
              <p className="text-2xl italic text-[var(--color-text-dim)] font-serif-display leading-relaxed">{t.exclusivity.desc}</p>
              <div className="grid gap-8">
                {t.exclusivity.points.map((p: string, i: number) => (
                  <div key={i} className="flex items-center gap-8 group">
                    <span className="text-4xl gold-text font-serif-display opacity-40 group-hover:opacity-100 transition-opacity">✧</span>
                    <p className="text-sm font-black uppercase tracking-[0.5em] text-[var(--color-text)]">{p}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-16 rounded-[4rem] border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/[0.02] backdrop-blur-3xl space-y-12 shadow-3xl">
              <h3 className="text-4xl font-serif-display italic gold-text">{t.target.title}</h3>
              <div className="space-y-6">{t.target.points.map((p: string, i: number) => (
                <div key={i} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-[var(--color-text-dim)]"><span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" /> {p}</div>
              ))}</div>
              <p className="text-xl font-serif-display italic border-t border-[var(--color-border)] pt-12 text-[var(--color-text-dim)] leading-relaxed">{t.target.note}</p>
            </div>
          </div>
        </Section>

        <footer id="contact" className="py-80 px-8 border-t border-[var(--color-border)] text-center relative overflow-hidden bg-[var(--color-bg)] transition-colors duration-500 contain-paint">
          <div className="container mx-auto relative z-10 max-w-4xl">
            <p className="text-2xl sm:text-4xl font-serif-display italic gold-text mb-16 leading-relaxed">{t.footer.tag}</p>
            <a href="mailto:giu.bas.91@gmail.com" className="text-3xl sm:text-5xl font-serif-display font-black italic block mb-12 hover:scale-[1.02] transition-transform underline underline-offset-[20px] decoration-[var(--color-border)] break-words">giu.bas.91@gmail.com</a>
            <div className="mt-24">
               <button onClick={handleConversationRequest} className="px-16 py-8 rounded-full bg-[var(--color-gold)] text-black font-black uppercase tracking-[0.5em] text-[11px] shadow-3xl hover:scale-105 transition-transform italic">{t.footer.cta}</button>
            </div>
            <div className="mt-32 flex justify-center gap-8 border-t border-[var(--color-border)] pt-16">
              <button onClick={() => setLegalView('privacy')} className="text-[9px] uppercase tracking-widest text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-opacity italic font-black">{t.footer.privacy}</button>
              <button onClick={() => setLegalView('cookies')} className="text-[9px] uppercase tracking-widest text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-opacity italic font-black">{t.footer.cookies}</button>
            </div>
            <div className="mt-16 flex flex-col md:flex-row justify-between items-center gap-10">
              <p className="text-[10px] uppercase tracking-[0.5em] font-black text-[var(--color-text-dim)] opacity-40 italic">{t.footer.copy}</p>
              <div className="w-12 h-px bg-[var(--color-border)]" />
              <p className="text-[10px] uppercase tracking-[0.5em] font-black text-[var(--color-text-dim)] opacity-40 italic">{t.footer.label}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120vw] h-[120vw] rounded-full blur-[250px] opacity-[0.15] bg-[var(--color-gold)] -z-10 will-change-transform" />
        </footer>
      </main>

      <style>{`
        * { cursor: none !important; }
        @media (pointer: coarse) { * { cursor: auto !important; } }
        .gold-text { background: linear-gradient(135deg, var(--color-gold) 0%, #F1D382 50%, var(--color-gold) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .font-serif-display { font-family: 'Cormorant Garamond', serif; }
        .grain-bg { 
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          transform: translateZ(0);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-gold); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: var(--color-bg); }
        
        @keyframes fade-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fade-up 1s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
        .shadow-3xl { filter: drop-shadow(0 40px 100px var(--color-shadow)); }
        
        /* Performance optimizations */
        .contain-content { contain: content; }
        .contain-layout { contain: layout; }
        .contain-paint { contain: paint; }
      `}</style>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) ReactDOM.createRoot(rootElement).render(<App />);
