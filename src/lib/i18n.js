import { useState, useEffect, useCallback } from "react";

export { LANGUAGES } from "./healthcareData";

const DICT = {
  en: {
    nav_dashboard: "Dashboard", nav_jobs: "Find Jobs", nav_saved: "Saved", nav_applications: "Applications",
    nav_profiles: "Search Profiles", nav_profile: "My Profile", nav_notifications: "Notifications",
    find_jobs: "Find Healthcare Jobs", search_placeholder: "Search by title, employer or country…",
    match: "Match", save: "Save", saved: "Saved", view_job: "View Job", prepare: "Prepare Application",
    apply: "Apply", visa_sponsorship: "Visa Sponsorship", relocation: "Relocation", remote: "Remote",
    onsite: "On-site", hybrid: "Hybrid", salary: "Salary", employability: "Employability Score",
    upload_cv: "Upload CV", analyze_cv: "Analyze with AI", no_jobs: "No jobs match your filters.",
    filters: "Filters", all: "All", country: "Country", profession: "Profession", job_type: "Job Type",
    work_mode: "Work Mode", clear: "Clear filters", recommended: "Recommended for You",
    global_map: "Global Job Map", applications: "Applications", interviews: "Interviews", offers: "Offers"
  },
  fr: {
    nav_dashboard: "Tableau de bord", nav_jobs: "Offres d'emploi", nav_saved: "Enregistrés", nav_applications: "Candidatures",
    nav_profiles: "Profils de recherche", nav_profile: "Mon profil", nav_notifications: "Notifications",
    find_jobs: "Trouver des emplois de santé", search_placeholder: "Rechercher par titre, employeur ou pays…",
    match: "Correspondance", save: "Enregistrer", saved: "Enregistré", view_job: "Voir l'offre", prepare: "Préparer la candidature",
    apply: "Postuler", visa_sponsorship: "Sponsorisation de visa", relocation: "Relocalisation", remote: "À distance",
    onsite: "Sur site", hybrid: "Hybride", salary: "Salaire", employability: "Score d'employabilité",
    upload_cv: "Télécharger le CV", analyze_cv: "Analyser avec l'IA", no_jobs: "Aucune offre ne correspond.",
    filters: "Filtres", all: "Tous", country: "Pays", profession: "Profession", job_type: "Type d'emploi",
    work_mode: "Mode de travail", clear: "Effacer les filtres", recommended: "Recommandé pour vous",
    global_map: "Carte mondiale des emplois", applications: "Candidatures", interviews: "Entretiens", offers: "Offres"
  },
  pt: {
    nav_dashboard: "Painel", nav_jobs: "Vagas", nav_saved: "Guardados", nav_applications: "Candidaturas",
    nav_profiles: "Perfis de busca", nav_profile: "Meu perfil", nav_notifications: "Notificações",
    find_jobs: "Encontrar empregos em saúde", search_placeholder: "Buscar por cargo, empregador ou país…",
    match: "Compatibilidade", save: "Guardar", saved: "Guardado", view_job: "Ver vaga", prepare: "Preparar candidatura",
    apply: "Candidatar", visa_sponsorship: "Patrocínio de visto", relocation: "Realocação", remote: "Remoto",
    onsite: "Presencial", hybrid: "Híbrido", salary: "Salário", employability: "Pontuação de empregabilidade",
    upload_cv: "Carregar CV", analyze_cv: "Analisar com IA", no_jobs: "Nenhuma vaga corresponde.",
    filters: "Filtros", all: "Todos", country: "País", profession: "Profissão", job_type: "Tipo de contrato",
    work_mode: "Modalidade", clear: "Limpar filtros", recommended: "Recomendado para si",
    global_map: "Mapa global de empregos", applications: "Candidaturas", interviews: "Entrevistas", offers: "Ofertas"
  },
  es: {
    nav_dashboard: "Panel", nav_jobs: "Empleos", nav_saved: "Guardados", nav_applications: "Candidaturas",
    nav_profiles: "Perfiles de búsqueda", nav_profile: "Mi perfil", nav_notifications: "Notificaciones",
    find_jobs: "Buscar empleos de salud", search_placeholder: "Buscar por cargo, empleador o país…",
    match: "Coincidencia", save: "Guardar", saved: "Guardado", view_job: "Ver empleo", prepare: "Preparar candidatura",
    apply: "Postular", visa_sponsorship: "Patrocinio de visa", relocation: "Reubicación", remote: "Remoto",
    onsite: "Presencial", hybrid: "Híbrido", salary: "Salario", employability: "Puntuación de empleabilidad",
    upload_cv: "Subir CV", analyze_cv: "Analizar con IA", no_jobs: "Ningún empleo coincide.",
    filters: "Filtros", all: "Todos", country: "País", profession: "Profesión", job_type: "Tipo de empleo",
    work_mode: "Modalidad", clear: "Borrar filtros", recommended: "Recomendado para ti",
    global_map: "Mapa global de empleos", applications: "Candidaturas", interviews: "Entrevistas", offers: "Ofertas"
  },
  de: {
    nav_dashboard: "Übersicht", nav_jobs: "Jobs", nav_saved: "Gespeichert", nav_applications: "Bewerbungen",
    nav_profiles: "Suchprofile", nav_profile: "Mein Profil", nav_notifications: "Benachrichtigungen",
    find_jobs: "Gesundheitsjobs finden", search_placeholder: "Nach Titel, Arbeitgeber oder Land suchen…",
    match: "Übereinstimmung", save: "Speichern", saved: "Gespeichert", view_job: "Job ansehen", prepare: "Bewerbung vorbereiten",
    apply: "Bewerben", visa_sponsorship: "Visa-Sponsoring", relocation: "Umzug", remote: "Remote",
    onsite: "Vor Ort", hybrid: "Hybrid", salary: "Gehalt", employability: "Beschäftigungsfähigkeit",
    upload_cv: "CV hochladen", analyze_cv: "Mit KI analysieren", no_jobs: "Keine Jobs passen zu den Filtern.",
    filters: "Filter", all: "Alle", country: "Land", profession: "Beruf", job_type: "Anstellungsart",
    work_mode: "Arbeitsmodus", clear: "Filter löschen", recommended: "Für dich empfohlen",
    global_map: "Globale Job-Karte", applications: "Bewerbungen", interviews: "Vorstellungsgespräche", offers: "Angebote"
  },
  ar: {
    nav_dashboard: "لوحة التحكم", nav_jobs: "الوظائف", nav_saved: "المحفوظ", nav_applications: "الطلبات",
    nav_profiles: "ملفات البحث", nav_profile: "ملفي", nav_notifications: "الإشعارات",
    find_jobs: "البحث عن وظائف صحية", search_placeholder: "ابحث حسب المسمى أو صاحب العمل أو الدولة…",
    match: "التطابق", save: "حفظ", saved: "محفوظ", view_job: "عرض الوظيفة", prepare: "تجهيز الطلب",
    apply: "تقديم", visa_sponsorship: "كفالة التأشيرة", relocation: "إعادة التوطين", remote: "عن بعد",
    onsite: "حضوري", hybrid: "هجين", salary: "الراتب", employability: "درجة التوظيف",
    upload_cv: "رفع السيرة الذاتية", analyze_cv: "تحليل بالذكاء الاصطناعي", no_jobs: "لا توجد وظائف مطابقة.",
    filters: "عوامل التصفية", all: "الكل", country: "الدولة", profession: "المهنة", job_type: "نوع الوظيفة",
    work_mode: "نوع العمل", clear: "مسح التصفية", recommended: "موصى به لك",
    global_map: "خريطة الوظائف العالمية", applications: "الطلبات", interviews: "المقابلات", offers: "العروض"
  }
};

export function useLanguage() {
  const [lang, setLangState] = useState(() => localStorage.getItem("dgh_lang") || "en");
  useEffect(() => {
    localStorage.setItem("dgh_lang", lang);
    document.documentElement.dir = DICT[lang] && lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = useCallback((l) => setLangState(l), []);
  const t = useCallback((key) => (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key, [lang]);
  return { lang, setLang, t };
}