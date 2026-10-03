export const es = {
  // App Title and Header
  appTitle: "📚 Generador de Historias IA",
  appSubtitle: "Impulsado por Groq + runonweb",
  
  // Error Messages
  apiKeyNotFound: "⚠️ Clave API de Groq no configurada en el servidor.",
  apiKeyInstructions: "Por favor, configura GROQ_API_KEY en tu archivo .env y reinicia el servidor.",
  serverDown: "⚠️ El servidor de historias no está en ejecución.",
  serverDownInstructions: "Inícialo con \"pnpm dev\" (o \"pnpm run server\").",
  checkingServer: "Conectando con el servidor de historias...",
  
  // Story View
  storyTitle: "",
  pageInfo: "Página {current} de {total}",
  backToStories: "← Volver a Historias",
  storyColumn: "📖 Historia",
  illustrationColumn: "🎨 Ilustración",
  generatingImage: "Generando imagen...",
  previousPage: "← Anterior",
  nextPage: "Siguiente →",
  
  // Story List
  welcomeMessage: "📖 ¡Ingresa un prompt de historia abajo para generar una historia infantil de 5 párrafos con ilustraciones coloridas!",
  examples: "Ejemplos: \"Un dragón amigable que ama bailar\", \"La aventura en el jardín de un conejito\", \"Un puente mágico de arcoíris\"",
  promptLabel: "📝 Prompt:",
  generatedOn: "Generado el",
  readStory: "📖 Leer Historia",
  creatingStory: "🎭 Creando tu historia{withImages}...",
  withImages: " e ilustraciones",
  
  // Quota Error
  quotaNotice: "⚠️ Aviso de Cuota:",
  quotaExceeded: "Límite de uso de Groq alcanzado. Espera un momento e inténtalo de nuevo.",
  
  // Form Elements
  generateIllustrations: "Generar ilustraciones",
  webGPUUnsupported: "Las ilustraciones necesitan WebGPU (Chrome o Edge recientes)",
  downloadingImageModel: "Descargando modelo de imágenes (solo la primera vez, ~3,9 GB)... {progress}%",
  creatingImages: "Creando imágenes...",
  toddlerMode: "Modo 3 años",
  advancedMode: "Modo avanzado",
  simpleMode: "Modo simple",
  protagonist: "¿Quién es el protagonista?",
  protagonistExample: "Ejemplo: una niña, un perrito, un dragón, un robot...",
  protagonistPlaceholder: "Describe al protagonista...",
  goal: "¿Qué quiere o qué busca?",
  goalExample: "Ejemplo: encontrar su juguete perdido, hacer un amigo, llegar a la luna...",
  goalPlaceholder: "Describe su objetivo...",
  setting: "¿Dónde ocurre la historia?",
  settingExample: "Ejemplo: en un bosque, en el espacio, en el fondo del mar, en un castillo...",
  settingPlaceholder: "Describe el lugar...",
  problem: "¿Qué problema o villano aparece?",
  problemExample: "Ejemplo: un dragón dormilón, una tormenta, un monstruo triste...",
  problemPlaceholder: "Describe el problema o villano...",
  helper: "¿Quién le ayuda?",
  helperExample: "Ejemplo: una hada, su mejor amigo, una mascota mágica...",
  helperPlaceholder: "Describe quien ayuda...",
  ending: "¿Cómo termina el cuento?",
  endingExample: "Ejemplo: aprende a compartir, salva el día, encuentra su tesoro, hace un nuevo amigo...",
  endingPlaceholder: "Describe el final...",
  atLeastOneRequired: "Al menos una pregunta debe ser respondida",
  downloadPDF: "📄 Descargar PDF",
  downloadingPDF: "Generando PDF...",
  inputPlaceholder: "Ingresa tu prompt de historia infantil aquí... (ej., 'Un robot amigable aprendiendo a bailar')",
  generateStory: "Generar Historia",
  
  // Language Toggle
  language: "Idioma",
  english: "🇺🇸",
  spanish: "🇪🇸"
};
