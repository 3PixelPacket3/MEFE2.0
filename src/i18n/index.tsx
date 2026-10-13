import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'fr' | 'es';

export interface TranslationDictionary {
  [key: string]: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    // Brand & App
    appName: "MEFE",
    appSubtitle: "AI Wardrobe & Mood Studio",
    tagline: "Mindful Fashion & Emotional Well-being",
    
    // Navigation
    navSocial: "Social",
    navCloset: "Closet",
    navOutfits: "Outfits",
    navJournal: "Journal",
    navMenu: "Menu",
    navInsights: "AI Insights",
    navAvatar: "Avatar Studio",
    navRetailers: "Shop the Look",
    navAdmin: "Admin Dashboard",
    navSettings: "Settings",

    // Global Shell
    searchPlaceholder: "Search wardrobe, outfits, posts...",
    installPwa: "Install App",
    installed: "Installed",
    adminBadge: "Admin",
    premiumBadge: "PRO",
    cloudConnected: "Cloud Sync Active",
    offlineMode: "Offline Mode",

    // Closet Screen
    closetTitle: "My Closet",
    addNewItem: "+ Add New Item",
    allCategories: "All Items",
    catTops: "Tops",
    catBottoms: "Bottoms",
    catDresses: "Dresses",
    catOuterwear: "Outerwear",
    catShoes: "Shoes",
    catAccessories: "Accessories",
    filterByColor: "Color",
    filterByVibe: "Emotional Vibe",
    filterByUseCase: "Occasion",
    wornCount: "Worn {count} times",
    neverWorn: "Never worn yet",
    lastWorn: "Last worn: {date}",
    shopSimilar: "Shop Similar Items",
    deleteItem: "Delete Item",
    editItem: "Edit Item",
    noItemsFound: "No items match your filter. Tap '+ Add New Item' to expand your wardrobe!",

    // Add Item Modal
    addItemTitle: "Add Clothing Item",
    itemNameLabel: "Item Name",
    itemCategoryLabel: "Category",
    itemColorsLabel: "Colors (e.g. Terracotta, Brown)",
    itemUseCasesLabel: "Use Cases (e.g. Work, Dinner, Casual)",
    itemEmotionalTagsLabel: "Emotional Vibe (e.g. Confident, Powerful)",
    itemImageLabel: "Upload Photo",
    itemTransparentPngLabel: "Optional Transparent PNG (for Avatar Studio)",
    saveItemBtn: "Save to Closet",
    cancelBtn: "Cancel",

    // Outfits & Calendar
    outfitsTitle: "Outfits & Calendar",
    tabBuilder: "Outfit Builder",
    tabCalendar: "Wardrobe Calendar",
    launchAvatarFab: "90s Clueless Studio",
    dropZonePlaceholder: "Drag or tap items from your wardrobe below to style an ensemble",
    outfitNameLabel: "Outfit Ensemble Name",
    moodTargetLabel: "Target Mood / Emotional Outcome",
    saveOutfitBtn: "Save Outfit",
    clearCanvasBtn: "Clear Canvas",
    scheduleDatesLabel: "Schedule on Calendar",
    scheduledOn: "Scheduled for {dates}",
    assignOutfitToDate: "Assign Outfit to Date",
    noOutfitsFound: "No outfits created yet. Use the builder above to style your first look!",

    // Clueless Avatar Studio
    avatarTitle: "The 'Clueless' Avatar Studio",
    avatarSubtitle: "Interactive 2D layered fitting room & Cher Horowitz AI fashion stylist",
    baseMannequin: "Mannequin Base",
    skinTone: "Skin Tone",
    hairStyle: "Hair Style",
    hairColor: "Hair Color",
    playVoice: "Listen to Cher's Advice",
    stopVoice: "Stop Speech",
    wardrobeRack: "Your Wardrobe Rack",
    layerOnAvatar: "Tap to layer onto avatar",
    saveAvatarLook: "Save Look as Outfit",
    aiThinking: "Consulting Gemini AI Stylist...",

    // Mood Journal
    journalTitle: "Daily Mood Journal",
    dailyCheckin: "Daily Emotional Check-in",
    moodScoreLabel: "How do you feel today? (1 - 10)",
    moodLow: "Low Energy / Melancholy",
    moodNeutral: "Balanced / Steady",
    moodHigh: "Radiant & Empowered",
    whatDidYouWear: "What did you wear today?",
    selectOutfitOrItem: "Select an Outfit or Clothing Item",
    emotionsLoggedLabel: "Emotions you're experiencing today",
    journalReflectionLabel: "Daily Mindful Reflection",
    journalPlaceholder: "How did your outfit influence your energy, meetings, or confidence today?",
    submitJournalBtn: "Log Daily Journal",
    journalHistoryTitle: "Journal History & Reflections",
    noJournalEntries: "No journal entries logged yet. Check in above to start unlocking AI Insights!",

    // AI Insights
    insightsTitle: "Google Gemini AI Wardrobe Insights",
    insightsSubtitle: "Deep pattern recognition between what you wear and how you feel",
    heroPowerColor: "Your Statistical Power Color",
    topOutfitBadge: "Top Mood-Boosting Ensemble",
    generateInsightsBtn: "Generate New AI Insights",
    analyzingData: "Analyzing your mood & closet patterns with Gemini Pro...",
    categoryCorrelationsTitle: "Mood Score vs Clothing Category",
    actionableTipTitle: "Empowerment Recommendation for the Week",
    periodWeekly: "This Week",
    periodMonthly: "This Month",
    periodAllTime: "All Time",
    avgMood: "Avg Mood",

    // Social Feed
    socialTitle: "MEFE Community Feed",
    shareLookBtn: "+ Share Your Look",
    liked: "Liked",
    comments: "Comments",
    addCommentPlaceholder: "Leave an uplifting comment...",
    sendComment: "Post",
    taggedItems: "Tagged Wardrobe Pieces",
    shopThisLook: "Shop This Look",
    noPostsYet: "Be the first to share an empowering outfit with the MEFE community!",

    // Retailers Drawer
    shopTheLookTitle: "Shop the Look",
    shopTheLookSubtitle: "Explore similar pieces from curated partner retailers",
    searchAffiliates: "Search retailer catalogs...",
    visitStore: "Shop at Store",
    partnerRetailers: "Curated Brands",

    // Admin Dashboard
    adminTitle: "Executive Admin Dashboard",
    tabUsers: "User Moderation",
    tabRetailers: "Retailer Catalogs",
    tabEmbed: "Dynamic HTML Embed Generator",
    tabLogs: "Audit Trail",
    grantPremium: "Grant Pro",
    revokePremium: "Revoke Pro",
    muteUser: "Mute User",
    banUser: "Ban User",
    unbanUser: "Activate User",
    activeStatus: "Active",
    mutedStatus: "Muted",
    bannedStatus: "Banned",
    addRetailerBtn: "+ Add Retailer Store",
    embedGeneratorTitle: "Continuous Single-Line HTML/CSS Embed Snippet",
    embedGeneratorNotice: "Self-contained continuous string without line breaks; all CTAs carry target='_blank'.",
    copySnippet: "Copy Continuous Snippet",
    copied: "Copied to Clipboard!",

    // Settings
    settingsTitle: "Settings & Cloud Sync",
    userProfile: "User Profile",
    languageSelect: "Language / Langue / Idioma",
    firebaseConfig: "Firebase Cloud Credentials (Optional)",
    geminiApiKeyLabel: "Google AI Studio (Gemini) API Key",
    apiKeyHint: "Enter your Gemini API key to activate real-time Gemini AI insights & dialogue.",
    demoModeToggle: "Toggle Admin Role (Testing)",
    saveSettings: "Save Configuration",
  },

  fr: {
    // Brand & App
    appName: "MEFE",
    appSubtitle: "Garde-robe IA & Studio d'Humeur",
    tagline: "Mode consciente & Bien-être émotionnel",
    
    // Navigation
    navSocial: "Social",
    navCloset: "Dressing",
    navOutfits: "Tenues",
    navJournal: "Journal",
    navMenu: "Menu",
    navInsights: "Insights IA",
    navAvatar: "Studio Avatar",
    navRetailers: "Acheter le Look",
    navAdmin: "Tableau de Bord Admin",
    navSettings: "Paramètres",

    // Global Shell
    searchPlaceholder: "Rechercher dressing, tenues, publications...",
    installPwa: "Installer l'App",
    installed: "Installé",
    adminBadge: "Admin",
    premiumBadge: "PRO",
    cloudConnected: "Synchronisation Cloud Active",
    offlineMode: "Mode Hors-ligne",

    // Closet Screen
    closetTitle: "Mon Dressing",
    addNewItem: "+ Ajouter une Pièce",
    allCategories: "Tous les Articles",
    catTops: "Hauts",
    catBottoms: "Bas",
    catDresses: "Robes",
    catOuterwear: "Manteaux & Vestes",
    catShoes: "Chaussures",
    catAccessories: "Accessoires",
    filterByColor: "Couleur",
    filterByVibe: "Énergie Émotionnelle",
    filterByUseCase: "Occasion",
    wornCount: "Porté {count} fois",
    neverWorn: "Pas encore porté",
    lastWorn: "Dernière fois: {date}",
    shopSimilar: "Articles Similaires",
    deleteItem: "Supprimer l'Article",
    editItem: "Modifier l'Article",
    noItemsFound: "Aucune pièce ne correspond. Appuyez sur '+ Ajouter une Pièce' !",

    // Add Item Modal
    addItemTitle: "Ajouter une Pièce Vestimentaire",
    itemNameLabel: "Nom de la Pièce",
    itemCategoryLabel: "Catégorie",
    itemColorsLabel: "Couleurs (ex. Terracotta, Marron)",
    itemUseCasesLabel: "Occasions (ex. Travail, Dîner, Détente)",
    itemEmotionalTagsLabel: "Vibe Émotionnelle (ex. Confiante, Puissante)",
    itemImageLabel: "Téléverser une Photo",
    itemTransparentPngLabel: "PNG Transparent Optionnel (pour le Studio Avatar)",
    saveItemBtn: "Enregistrer dans le Dressing",
    cancelBtn: "Annuler",

    // Outfits & Calendar
    outfitsTitle: "Tenues & Calendrier",
    tabBuilder: "Créateur de Tenue",
    tabCalendar: "Calendrier Vestimentaire",
    launchAvatarFab: "Studio Avatar 90s",
    dropZonePlaceholder: "Glissez ou appuyez sur vos vêtements ci-dessous pour composer votre tenue",
    outfitNameLabel: "Nom de l'Ensemble",
    moodTargetLabel: "Objectif Émotionnel",
    saveOutfitBtn: "Enregistrer la Tenue",
    clearCanvasBtn: "Effacer la Toile",
    scheduleDatesLabel: "Planifier sur le Calendrier",
    scheduledOn: "Planifié pour {dates}",
    assignOutfitToDate: "Assigner une Tenue à la Date",
    noOutfitsFound: "Aucune tenue créée. Utilisez le créateur ci-dessus pour votre premier look !",

    // Clueless Avatar Studio
    avatarTitle: "Le Studio Avatar 'Clueless'",
    avatarSubtitle: "Cabine d'essayage 2D interactive & styliste IA Cher Horowitz",
    baseMannequin: "Mannequin de Base",
    skinTone: "Carnation",
    hairStyle: "Coiffure",
    hairColor: "Couleur des Cheveux",
    playVoice: "Écouter l'Avis de Cher",
    stopVoice: "Arrêter la Voix",
    wardrobeRack: "Votre Portant de Vêtements",
    layerOnAvatar: "Appuyez pour superposer",
    saveAvatarLook: "Enregistrer comme Tenue",
    aiThinking: "Consultation du Styliste Gemini IA...",

    // Mood Journal
    journalTitle: "Journal Quotidien d'Humeur",
    dailyCheckin: "Bilan Émotionnel Quotidien",
    moodScoreLabel: "Comment vous sentez-vous aujourd'hui ? (1 - 10)",
    moodLow: "Basse Énergie / Mélancolie",
    moodNeutral: "Équilibré / Posé",
    moodHigh: "Rayonnant & Puissant",
    whatDidYouWear: "Qu'avez-vous porté aujourd'hui ?",
    selectOutfitOrItem: "Sélectionnez une Tenue ou un Vêtement",
    emotionsLoggedLabel: "Émotions ressenties aujourd'hui",
    journalReflectionLabel: "Réflexion Consciente",
    journalPlaceholder: "Comment votre tenue a-t-elle influencé votre énergie et votre confiance ?",
    submitJournalBtn: "Enregistrer le Bilan",
    journalHistoryTitle: "Historique & Réflexions",
    noJournalEntries: "Aucune entrée pour l'instant. Enregistrez votre premier bilan ci-dessus !",

    // AI Insights
    insightsTitle: "Analyses de Garde-robe Google Gemini IA",
    insightsSubtitle: "Reconnaissance de motifs profonds entre vos vêtements et vos émotions",
    heroPowerColor: "Votre Couleur d'Autonomisation",
    topOutfitBadge: "Tenue Stimulatrice d'Humeur N°1",
    generateInsightsBtn: "Générer de Nouveaux Insights IA",
    analyzingData: "Analyse de vos données d'humeur avec Gemini Pro...",
    categoryCorrelationsTitle: "Score d'Humeur vs Catégorie Vestimentaire",
    actionableTipTitle: "Conseil Énergétique de la Semaine",
    periodWeekly: "Cette Semaine",
    periodMonthly: "Ce Mois",
    periodAllTime: "Tout l'Historique",
    avgMood: "Humeur Moy.",

    // Social Feed
    socialTitle: "Communauté MEFE",
    shareLookBtn: "+ Partager un Look",
    liked: "Aimé",
    comments: "Commentaires",
    addCommentPlaceholder: "Laissez un commentaire bienveillant...",
    sendComment: "Publier",
    taggedItems: "Pièces Identifiées",
    shopThisLook: "Acheter ce Look",
    noPostsYet: "Soyez le premier à partager votre look inspirant avec la communauté !",

    // Retailers Drawer
    shopTheLookTitle: "Acheter le Look",
    shopTheLookSubtitle: "Trouvez des pièces similaires auprès de nos marques partenaires",
    searchAffiliates: "Rechercher dans les catalogues...",
    visitStore: "Visiter la Boutique",
    partnerRetailers: "Marques Partenaires",

    // Admin Dashboard
    adminTitle: "Tableau de Bord Administrateur",
    tabUsers: "Modération des Utilisateurs",
    tabRetailers: "Catalogues Partenaires",
    tabEmbed: "Générateur d'Intégration HTML",
    tabLogs: "Journal d'Audit",
    grantPremium: "Accorder Pro",
    revokePremium: "Révoquer Pro",
    muteUser: "Mettre en Sourdine",
    banUser: "Bannir",
    unbanUser: "Réactiver",
    activeStatus: "Actif",
    mutedStatus: "En sourdine",
    bannedStatus: "Banni",
    addRetailerBtn: "+ Ajouter un Partenaire",
    embedGeneratorTitle: "Code d'Intégration HTML/CSS en Ligne Continue",
    embedGeneratorNotice: "Chaîne continue autonome sans saut de ligne ; tous les liens portent target='_blank'.",
    copySnippet: "Copier la Ligne Continue",
    copied: "Copié dans le Presse-papiers !",

    // Settings
    settingsTitle: "Paramètres & Synchronisation Cloud",
    userProfile: "Profil Utilisateur",
    languageSelect: "Langue / Language / Idioma",
    firebaseConfig: "Identifiants Firebase Cloud (Optionnel)",
    geminiApiKeyLabel: "Clé API Google AI Studio (Gemini)",
    apiKeyHint: "Entrez votre clé API Gemini pour activer les analyses en temps réel.",
    demoModeToggle: "Basculer Rôle Admin (Test)",
    saveSettings: "Enregistrer la Configuration",
  },

  es: {
    // Brand & App
    appName: "MEFE",
    appSubtitle: "Armario IA & Estudio de Estado de Ánimo",
    tagline: "Moda Consciente y Bienestar Emocional",
    
    // Navigation
    navSocial: "Social",
    navCloset: "Armario",
    navOutfits: "Conjuntos",
    navJournal: "Diario",
    navMenu: "Menú",
    navInsights: "Perspectivas IA",
    navAvatar: "Estudio Avatar",
    navRetailers: "Comprar el Look",
    navAdmin: "Panel de Administración",
    navSettings: "Ajustes",

    // Global Shell
    searchPlaceholder: "Buscar en armario, conjuntos, publicaciones...",
    installPwa: "Instalar App",
    installed: "Instalado",
    adminBadge: "Admin",
    premiumBadge: "PRO",
    cloudConnected: "Sincronización en la Nube Activa",
    offlineMode: "Modo Fuera de Línea",

    // Closet Screen
    closetTitle: "Mi Armario",
    addNewItem: "+ Añadir Nueva Prenda",
    allCategories: "Todas las Prendas",
    catTops: "Partes de Arriba",
    catBottoms: "Partes de Abajo",
    catDresses: "Vestidos",
    catOuterwear: "Abrigos y Chaquetas",
    catShoes: "Calzado",
    catAccessories: "Accesorios",
    filterByColor: "Color",
    filterByVibe: "Vibra Emocional",
    filterByUseCase: "Ocasión",
    wornCount: "Usado {count} veces",
    neverWorn: "Aún no estrenado",
    lastWorn: "Última vez: {date}",
    shopSimilar: "Prendas Similares",
    deleteItem: "Eliminar Prenda",
    editItem: "Editar Prenda",
    noItemsFound: "No hay prendas coincidentes. ¡Toca '+ Añadir Nueva Prenda' para expandir tu estilo!",

    // Add Item Modal
    addItemTitle: "Añadir Prenda al Armario",
    itemNameLabel: "Nombre de la Prenda",
    itemCategoryLabel: "Categoría",
    itemColorsLabel: "Colores (ej. Terracota, Marrón)",
    itemUseCasesLabel: "Ocasiones (ej. Trabajo, Cena, Casual)",
    itemEmotionalTagsLabel: "Vibra Emocional (ej. Confiada, Poderosa)",
    itemImageLabel: "Subir Foto",
    itemTransparentPngLabel: "PNG Transparente Opcional (para el Estudio Avatar)",
    saveItemBtn: "Guardar en el Armario",
    cancelBtn: "Cancelar",

    // Outfits & Calendar
    outfitsTitle: "Conjuntos & Calendario",
    tabBuilder: "Creador de Looks",
    tabCalendar: "Calendario de Moda",
    launchAvatarFab: "Estudio Avatar 90s",
    dropZonePlaceholder: "Arrastra o toca prendas de tu armario abajo para componer tu conjunto",
    outfitNameLabel: "Nombre del Conjunto",
    moodTargetLabel: "Meta Emocional",
    saveOutfitBtn: "Guardar Conjunto",
    clearCanvasBtn: "Limpiar Lienzo",
    scheduleDatesLabel: "Programar en Calendario",
    scheduledOn: "Programado para {dates}",
    assignOutfitToDate: "Asignar Conjunto a la Fecha",
    noOutfitsFound: "Aún no hay conjuntos. ¡Usa el creador arriba para diseñar tu primer estilo!",

    // Clueless Avatar Studio
    avatarTitle: "El Estudio Avatar 'Clueless'",
    avatarSubtitle: "Probador interactivo en 2D & estilista IA Cher Horowitz",
    baseMannequin: "Maniquí Base",
    skinTone: "Tono de Piel",
    hairStyle: "Peinado",
    hairColor: "Color de Pelo",
    playVoice: "Escuchar el Consejo de Cher",
    stopVoice: "Detener Voz",
    wardrobeRack: "Tu Perchero de Moda",
    layerOnAvatar: "Toca para superponer",
    saveAvatarLook: "Guardar como Conjunto",
    aiThinking: "Consultando a la Estilista Gemini IA...",

    // Mood Journal
    journalTitle: "Diario Emocional Diario",
    dailyCheckin: "Registro Emocional del Día",
    moodScoreLabel: "¿Cómo te sientes hoy? (1 - 10)",
    moodLow: "Baja Energía / Melancolía",
    moodNeutral: "Equilibrado / Estable",
    moodHigh: "Radiante y Empoderada",
    whatDidYouWear: "¿Qué te pusiste hoy?",
    selectOutfitOrItem: "Selecciona un Conjunto o Prenda",
    emotionsLoggedLabel: "Emociones experimentadas hoy",
    journalReflectionLabel: "Reflexión Consciente Diaria",
    journalPlaceholder: "¿Cómo influyó tu vestimenta en tu energía y confianza hoy?",
    submitJournalBtn: "Guardar Registro Diario",
    journalHistoryTitle: "Historial de Registros",
    noJournalEntries: "Sin registros aún. ¡Haz tu chequeo arriba para desbloquear análisis de IA!",

    // AI Insights
    insightsTitle: "Perspectivas de Armario Google Gemini IA",
    insightsSubtitle: "Patrones profundos entre lo que vistes y cómo te sientes",
    heroPowerColor: "Tu Color Estadístico de Poder",
    topOutfitBadge: "Conjunto N°1 que Eleva tu Ánimo",
    generateInsightsBtn: "Generar Nuevas Perspectivas IA",
    analyzingData: "Analizando tus registros y armario con Gemini Pro...",
    categoryCorrelationsTitle: "Puntuación de Ánimo vs Categoría",
    actionableTipTitle: "Consejo de Empoderamiento de la Semana",
    periodWeekly: "Esta Semana",
    periodMonthly: "Este Mes",
    periodAllTime: "Todo el Tiempo",
    avgMood: "Ánimo Prom.",

    // Social Feed
    socialTitle: "Comunidad MEFE",
    shareLookBtn: "+ Compartir un Look",
    liked: "Te gusta",
    comments: "Comentarios",
    addCommentPlaceholder: "Deja un comentario positivo...",
    sendComment: "Publicar",
    taggedItems: "Prendas Etiquetadas",
    shopThisLook: "Comprar este Look",
    noPostsYet: "¡Sé la primera persona en compartir un look empoderador con MEFE!",

    // Retailers Drawer
    shopTheLookTitle: "Comprar el Look",
    shopTheLookSubtitle: "Descubre prendas similares en nuestras tiendas asociadas",
    searchAffiliates: "Buscar en catálogos asociados...",
    visitStore: "Visitar Tienda",
    partnerRetailers: "Marcas Destacadas",

    // Admin Dashboard
    adminTitle: "Panel de Control de Administrador",
    tabUsers: "Moderación de Usuarios",
    tabRetailers: "Catálogo de Marcas",
    tabEmbed: "Generador de Código HTML Continuo",
    tabLogs: "Historial de Auditoría",
    grantPremium: "Otorgar Pro",
    revokePremium: "Revocar Pro",
    muteUser: "Silenciar",
    banUser: "Bloquear",
    unbanUser: "Reactivar",
    activeStatus: "Activo",
    mutedStatus: "Silenciado",
    bannedStatus: "Bloqueado",
    addRetailerBtn: "+ Añadir Tienda Asociada",
    embedGeneratorTitle: "Fragmento de Código HTML/CSS en Línea Continua",
    embedGeneratorNotice: "Cadena continua independiente sin saltos de línea; todos los enlaces incluyen target='_blank'.",
    copySnippet: "Copiar Línea Continua",
    copied: "¡Copiado al Portapapeles!",

    // Settings
    settingsTitle: "Configuración & Sincronización en la Nube",
    userProfile: "Perfil de Usuario",
    languageSelect: "Idioma / Language / Langue",
    firebaseConfig: "Credenciales de Firebase Cloud (Opcional)",
    geminiApiKeyLabel: "Clave de API Google AI Studio (Gemini)",
    apiKeyHint: "Ingresa tu clave de Gemini para activar análisis y diálogos en tiempo real.",
    demoModeToggle: "Alternar Rol Admin (Prueba)",
    saveSettings: "Guardar Configuración",
  }
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode; initialLanguage?: Language }> = ({
  children,
  initialLanguage = 'en'
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('mefe_language') as Language;
    return saved && ['en', 'fr', 'es'].includes(saved) ? saved : initialLanguage;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mefe_language', lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.en;
    let text = dict[key] || translations.en[key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }
    return text;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
