<!DOCTYPE html>
<html lang="fr" class="scroll-smooth">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vergasta | Par la région, pour la région.</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=JetBrains+Mono:wght@500&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">

    <script src="https://cdn.tailwindcss.com"></script>

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        'sans': ['Inter', 'sans-serif'],
                        'display': ['Space Grotesk', 'sans-serif'],
                        'mono': ['JetBrains Mono', 'monospace'],
                    },
                    colors: {
                        'paper': '#F9F9F9',
                        'ink': '#111111',
                        'accent-lime': '#D4FF00',
                        'accent-blue': '#4F46E5',
                        'swiss-grey': '#666666',
                    },
                    boxShadow: {
                        'neo': '5px 5px 0px 0px #111111',
                        'neo-sm': '3px 3px 0px 0px #111111',
                    },
                    backgroundImage: {
                        'dot-grid': 'radial-gradient(#cfcfcf 1px, transparent 1px)',
                    }
                }
            }
        }
    </script>

    <style>
        body {
            background-color: var(--tw-color-paper);
            background-image: var(--tw-background-image-dot-grid);
            background-size: 20px 20px;
        }

        .marquee-container {
            overflow: hidden;
            white-space: nowrap;
        }

        .marquee-content {
            display: inline-block;
            animation: marquee 40s linear infinite;
        }

        @keyframes marquee {
            0% {
                transform: translateX(0);
            }

            100% {
                transform: translateX(-50%);
            }
        }
    </style>
</head>

<body class="text-ink font-sans antialiased selection:bg-accent-lime selection:text-ink">

    <header class="fixed top-0 w-full z-50 bg-paper/95 backdrop-blur border-b-2 border-ink">
        <div class="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
            <a href="#" class="flex items-center gap-3">
                <div class="relative w-10 h-10">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="relative w-7 h-7">
                            <div class="absolute left-1/2 top-0 w-2 h-full bg-accent-blue transform -translate-x-1/2"></div>
                            <div class="absolute top-1/2 left-0 w-full h-2 bg-accent-lime transform -translate-y-1/2"></div>
                        </div>
                    </div>
                </div>
                <span class="font-display font-bold text-xl tracking-tight">Vergasta Websites</span>
            </a>

            <nav class="hidden md:flex gap-8 text-sm font-bold uppercase tracking-wide">
                <a href="#services" class="hover:text-accent-blue transition-colors">Expertise</a>
                <a href="#projets" class="hover:text-accent-blue transition-colors">Réalisations</a>
                <a href="#contact" class="hover:text-accent-blue transition-colors">Contact</a>
            </nav>

            <a href="#contact" class="hidden md:block font-mono text-xs bg-ink text-white px-4 py-2 hover:bg-accent-blue transition-colors shadow-neo-sm">
                Demander une offre
            </a>

            <button class="md:hidden text-2xl">☰</button>
        </div>
    </header>

    <main class="pt-20">

        <section class="py-20 md:py-32 px-6 border-b-2 border-ink relative overflow-hidden bg-white">
            <div class="absolute right-1/4 top-1/2 -translate-y-1/2 w-1/3 h-full flex items-center justify-center pointer-events-auto">
                <img src="country.png" alt="" class="country-map h-auto w-full object-contain max-h-[400px]">
            </div>

            <div class="max-w-6xl mx-auto relative z-10">

                <div class="inline-flex items-center gap-2 mb-6 border border-ink bg-white px-3 py-1 shadow-neo-sm">
                    <span class="w-2 h-2 bg-accent-lime rounded-full animate-pulse"></span>
                    <span class="font-mono text-xs font-bold uppercase">Basé à St-Imier (CH)</span>
                </div>

                <h1 class="font-display font-bold text-5xl md:text-7xl leading-[1.1] mb-6">
                    SITES WEB <br>
                    <span class="text-accent-blue">SUR MESURE.</span>
                </h1>

                <div class="text-xl md:text-2xl font-medium italic border-l-4 border-accent-lime pl-4 mb-8 max-w-2xl">
                    "Par la région, pour la région."
                </div>

                <p class="text-swiss-grey max-w-lg mb-10 text-lg">
                    Nous créons des sites vitrines et des outils de gestion sur mesure pour les entreprises locales. Design suisse, efficacité numérique.
                </p>

                <div class="flex flex-wrap gap-4">
                    <a href="#contact" class="bg-accent-lime text-ink border-2 border-ink px-8 py-3 font-bold uppercase shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                        Recevoir une offre
                    </a>
                    <a href="#projets" class="bg-white text-ink border-2 border-ink px-8 py-3 font-bold uppercase shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                        Voir le travail
                    </a>
                </div>
            </div>

            <div class="absolute bottom-4 right-4 font-mono text-[10px] text-swiss-grey hidden md:block">
                47.1523° N / 6.9960° E
            </div>
        </section>

        <div class="bg-ink text-white py-3 border-b-2 border-ink marquee-container font-mono text-sm uppercase tracking-widest">
            <div class="marquee-content">
                Sites vitrines ⸱ Outils de gestion ⸱ E-commerce avec Stripe ⸱ Identité Visuelle ⸱ SEO Local ⸱ Hébergement Inclus ⸱ 100% Digital Workflow ⸱
            </div>
        </div>

        <section id="services" class="py-24 px-6 max-w-6xl mx-auto">
            <h2 class="font-display font-bold text-4xl mb-12 uppercase">Ce que nous faisons</h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="bg-white border-2 border-ink p-8 shadow-neo hover:shadow-neo-sm transition-shadow">
                    <div class="w-10 h-10 bg-accent-lime border border-ink mb-6 flex items-center justify-center font-bold text-xl">1</div>
                    <h3 class="font-display font-bold text-2xl mb-4">Sites vitrines</h3>
                    <p class="text-sm text-swiss-grey leading-relaxed mb-4">
                        Pour présenter votre activité, vos horaires et vos services. Un design clair et efficace qui inspire confiance à vos clients locaux.
                    </p>
                    <ul class="text-sm text-swiss-grey space-y-2">
                        <li>✓ Design responsive (mobile & desktop)</li>
                        <li>✓ Formulaire de contact intégré</li>
                        <li>✓ Optimisé pour le référencement local</li>
                        <li>✓ Domaine & hébergement inclus</li>
                    </ul>
                </div>

                <div class="bg-white border-2 border-ink p-8 shadow-neo hover:shadow-neo-sm transition-shadow">
                    <div class="w-10 h-10 bg-accent-blue text-white border border-ink mb-6 flex items-center justify-center font-bold text-xl">2</div>
                    <h3 class="font-display font-bold text-2xl mb-4">Outils de gestion</h3>
                    <p class="text-sm text-swiss-grey leading-relaxed mb-4">
                        Des applications web sur mesure pour gérer vos stocks, vos réservations, vos plannings ou vos fichiers internes. Simplifiez votre administration quotidienne.
                    </p>
                    <ul class="text-sm text-swiss-grey space-y-2">
                        <li>✓ Interface personnalisée à vos besoins</li>
                        <li>✓ Gestion de données sécurisée</li>
                        <li>✓ Accès multi-utilisateurs</li>
                        <li>✓ Maintenance & support technique</li>
                    </ul>
                </div>

                <div class="bg-white border-2 border-ink p-8 shadow-neo hover:shadow-neo-sm transition-shadow">
                    <div class="w-10 h-10 bg-white border border-ink mb-6 flex items-center justify-center font-bold text-xl">3</div>
                    <h3 class="font-display font-bold text-2xl mb-4">E-commerce</h3>
                    <p class="text-sm text-swiss-grey leading-relaxed mb-4">
                        Vendez vos produits en ligne avec une boutique moderne. Intégration Stripe pour des paiements sécurisés par carte bancaire, directement sur votre site.
                    </p>
                    <ul class="text-sm text-swiss-grey space-y-2">
                        <li>✓ Catalogue produits avec images</li>
                        <li>✓ Paiement Stripe (CB, Twint, etc.)</li>
                        <li>✓ Gestion des commandes</li>
                        <li>✓ Pack complet : site + domaine + hébergement</li>
                    </ul>
                </div>
            </div>

            <div class="mt-12 p-6 bg-accent-lime/20 border-2 border-accent-lime">
                <h4 class="font-bold text-lg mb-3">📦 Pack tout-en-un</h4>
                <p class="text-sm text-swiss-grey">
                    Nos tarifs incluent la réalisation complète du site, l'achat du nom de domaine, l'hébergement web et la maintenance technique. Vous n'avez rien d'autre à prévoir.
                </p>
            </div>
        </section>

        <section id="projets" class="py-24 bg-accent-blue border-y-2 border-ink text-white px-6">
            <div class="max-w-5xl mx-auto">
                <div class="flex items-end justify-between mb-8">
                    <h2 class="font-display font-bold text-4xl uppercase">Réalisation Récente</h2>
                    <span class="font-mono text-xs bg-accent-lime text-ink px-2 py-1">PROJET PHARE</span>
                </div>

                <div class="bg-paper border-2 border-ink shadow-[8px_8px_0px_rgba(0,0,0,0.2)] rounded-sm overflow-hidden text-ink">
                    <div class="border-b border-ink p-3 bg-white flex items-center gap-3">
                        <div class="flex gap-1.5">
                            <div class="w-3 h-3 rounded-full bg-ink"></div>
                            <div class="w-3 h-3 rounded-full border border-ink"></div>
                        </div>
                        <div class="flex-1 bg-paper border border-ink/20 rounded px-3 py-1 text-xs font-mono text-swiss-grey truncate">
                            https://bd-pokecards.ch
                        </div>
                    </div>

                    <div class="p-8 md:p-12 bg-white">
                        <div class="mb-6">
                            <h3 class="font-display font-bold text-3xl mb-2">BD-POKECARDS.CH</h3>
                            <p class="text-swiss-grey text-sm mb-4">
                                Site E-commerce et de gestion de collection. Une interface dense mais lisible, conçue pour traiter un grand volume de données produits avec paiements Stripe intégrés.
                            </p>
                            <a href="https://bd-pokecards.ch" target="_blank" class="inline-block border-b-2 border-accent-blue font-bold hover:text-accent-blue transition-colors">
                                Visiter le site en ligne ↗
                            </a>
                        </div>

                        <div class="w-full border-2 border-ink shadow-neo aspect-video">
                            <iframe
                                src="https://bd-pokecards.ch"
                                class="w-full h-full"
                                title="BD-POKECARDS.CH"
                                loading="lazy">
                            </iframe>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="contact" class="py-24 px-6 max-w-6xl mx-auto">
            <div class="grid md:grid-cols-2 gap-16">

                <div>
                    <h2 class="font-display font-bold text-4xl mb-6 uppercase">Processus <br>Digital.</h2>
                    <p class="text-lg mb-8">
                        Pour garantir des tarifs compétitifs et une rapidité d'exécution, nous privilégions un flux de travail 100% numérique.
                    </p>

                    <div class="space-y-6">
                        <div class="flex gap-4">
                            <div class="font-mono font-bold text-accent-blue">01.</div>
                            <div>
                                <h4 class="font-bold uppercase text-sm">Demande</h4>
                                <p class="text-sm text-swiss-grey">Vous remplissez le formulaire ci-contre avec vos besoins.</p>
                            </div>
                        </div>
                        <div class="flex gap-4">
                            <div class="font-mono font-bold text-accent-blue">02.</div>
                            <div>
                                <h4 class="font-bold uppercase text-sm">Analyse</h4>
                                <p class="text-sm text-swiss-grey">Nous étudions votre projet et préparons une solution technique adaptée.</p>
                            </div>
                        </div>
                        <div class="flex gap-4">
                            <div class="font-mono font-bold text-accent-blue">03.</div>
                            <div>
                                <h4 class="font-bold uppercase text-sm">Offre par Email</h4>
                                <p class="text-sm text-swiss-grey">Vous recevez un devis détaillé sous 48h. Simple et efficace.</p>
                            </div>
                        </div>
                    </div>

                    <div class="mt-12 p-4 bg-accent-lime/20 border border-accent-lime text-sm font-medium">
                        📍 Nous sommes basés physiquement à St-Imier, mais nous travaillons à distance pour optimiser votre temps et le nôtre.
                    </div>
                </div>

                <div class="bg-white border-2 border-ink p-8 shadow-neo">
                    <h3 class="font-display font-bold text-2xl mb-6">Demander une offre</h3>
                    <form class="space-y-4">
                        <div>
                            <label class="block font-mono text-xs font-bold uppercase mb-1">Nom / Société</label>
                            <input type="text" class="w-full bg-paper border border-ink p-3 focus:outline-none focus:border-accent-blue transition-colors">
                        </div>
                        <div>
                            <label class="block font-mono text-xs font-bold uppercase mb-1">Email</label>
                            <input type="email" class="w-full bg-paper border border-ink p-3 focus:outline-none focus:border-accent-blue transition-colors">
                        </div>
                        <div>
                            <label class="block font-mono text-xs font-bold uppercase mb-1">Type de projet</label>
                            <select class="w-full bg-paper border border-ink p-3 focus:outline-none focus:border-accent-blue transition-colors">
                                <option>Site vitrine</option>
                                <option>Outil de gestion / interne</option>
                                <option>E-commerce (avec Stripe)</option>
                                <option>Autre</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-mono text-xs font-bold uppercase mb-1">Détails</label>
                            <textarea rows="4" class="w-full bg-paper border border-ink p-3 focus:outline-none focus:border-accent-blue transition-colors" placeholder="Décrivez brièvement votre besoin..."></textarea>
                        </div>
                        <button class="w-full bg-ink text-white font-bold uppercase py-4 hover:bg-accent-blue transition-colors border-2 border-transparent">
                            Envoyer la demande
                        </button>
                    </form>
                </div>
            </div>
        </section>

    </main>

    <footer class="bg-white border-t-2 border-ink py-8 px-6">
        <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-xs text-swiss-grey uppercase">
            <div>© 2025 Vergasta Websites. St-Imier.</div>
            <div>Par la région, pour la région.</div>
        </div>
    </footer>

    <script>
        // Duplication automatique du contenu du marquee pour un défilement infini fluide
        document.addEventListener('DOMContentLoaded', function() {
            const marqueeContainer = document.querySelector('.marquee-container');
            const marqueeContent = document.querySelector('.marquee-content');

            if (marqueeContent && marqueeContainer) {
                // Récupère le contenu HTML original
                const originalContent = marqueeContent.innerHTML;

                // Duplique le contenu 3 fois pour garantir un défilement vraiment continu
                marqueeContent.innerHTML = originalContent + originalContent + originalContent;
            }
        });
    </script>

</body>

</html>
