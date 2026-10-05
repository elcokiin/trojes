# Trojes — One Pager · Execute the Idea 2026

> **Archivo final:** `Trojes_OnePager_Execute2026.pdf` · Español · 1 página · cuerpo ≥ 9 pt
> **Equipo:** Trojes · **Founder líder:** Diego Tenjo · **Contacto:** www.trojes@gmail.com
> Instrucciones de maquetación al final del archivo. Los campos `[POR COMPLETAR]` deben rellenarse antes de generar el PDF.

---

## Lenguaje ubicuo (reglas ↔ one pager)

> Este glosario es el contrato léxico con `rules-execute.md`. El PDF (`onepager-print.html`) usa
> **exactamente** estos términos; nada de vocablo inventado. Si aparece una palabra fuera de esta
> tabla, no va al one pager.

**Los 7 títulos de sección (visibles en el PDF, en este orden):**

| # | Título exacto (rules-execute.md) | Pts | Qué contiene |
|---|---|---|---|
| 1 | Problema y oportunidad | 20 | Problema + evidencia (encuesta, entrevistas, experimento) + por qué ahora |
| 2 | Producto / empresa a construir | 20 | Qué hace, cómo funciona, estado hoy, qué hace y qué no hace la IA |
| 3 | Ventaja frente a la competencia | 15 | Competidores directos + casera + "no hacer nada" + ventaja defendible a 12 meses |
| 4 | Mercado objetivo y TAM | 15 | TAM/SAM/SOM con fórmula, fuentes y supuestos rotulados |
| 5 | Usuario objetivo | 10 | Perfil concreto + evidencia de contacto (cuántos, qué aprendimos) |
| 6 | Equipo | 10 | Quiénes, rol de cada uno, roles faltantes |
| 7 | Qué buscan de Execute y de los inversionistas | 10 | Petición concreta + hito 6–12 meses + siguiente prueba |

**Término inventado → término de las reglas (prohibido → obligatorio):**

| Prohibido | Obligatorio (lenguaje de las reglas) |
|---|---|
| Tracción | Evidencia de contacto con clientes reales (sección 5) / evidencia del problema (sección 1) |
| Tendencias de mercado | Por qué ahora (oportunidad, dentro de "Problema y oportunidad") |
| Solución | Producto / empresa a construir |
| CTA / call to action | Qué buscan de Execute y de los inversionistas |
| Validación / validador | Interrogatorio de 8 ramas → veredicto (vocablo propio del producto) |
| Mercado de todos los colombianos | Cálculo de abajo hacia arriba (clientes × ticket anual) con fuente |

**Reglas de cifras (criterio editorial de las reglas):**

- Cada cifra lleva fuente, moneda y periodo. Ej.: `46 respuestas (encuesta propia, 3–4 oct 2026, excl. fundadores)`.
- El TAM va con fórmula, no solo un número. Supuestos rotulados como `supuesto`.
- Sin adjetivos vacíos: "revolucionario", "disruptivo", "único en el mercado", "no tenemos competencia".
- Una frase hace el trabajo de tres.

**Escala de calificación (para autoevaluarse antes de enviar):** 100% nivel inversión · 75% sólido (faltan una o dos cifras) · 50% incompleto (supuestos sin sustento) · 25% vago (adjetivos sin números) · 0% ausente.

---

## 1. Problema y oportunidad — 20 pts

**El problema:** hay personas que generan más ideas de las que ejecutan. Capturan rápido —una nota, un mensaje, una foto— y luego no vuelven: las notas se pierden entre aplicaciones, no se revisan y la idea muere. El costo no es el almacenamiento, es el arrepentimiento: saber que una idea buena existió y nadie hizo nada con ella.

**Evidencia (fuentes propias):**

- **Experimento propio (11/04/2026 – 16/06/2026):** en 2 meses y 5 días se escribieron **54 notas desestructuradas, de las cuales 28 eran ideas**; se intentó tomar acción en **8** y solo **3** llegaron a productos usables. Menos de 1 de cada 9 ideas llegó a algo.
- **Encuesta propia (3–4 oct 2026, 46 respuestas válidas):** **70%** tiene notas repartidas en 2 o más herramientas; **63%** no revisa sus notas o solo las deja guardadas; **54%** falló en capturar algo importante al menos una vez por semana; **13%**, estando en la calle, directamente no lo anota.
- **4 entrevistas profundas (1 h c/u):** el patrón se repite — se captura en el momento (mensajería, app de notas, papel) y el sistema de recordatorios depende de la memoria.

**Por qué ahora:**

1. **La IA se volvió barata:** el costo de lograr un nivel fijo de desempeño cayó **13× por año** desde 2023 ([Epoch AI, "The plunging price of thought", sep 2026](https://epoch.ai/publications/the-plunging-price-of-thought)); una sesión de interrogatorio cuesta ~**US$0,10–0,50** (estimación propia a precios de API, oct 2026 — marcar siempre como dato propio). Interrogar una idea con criterio ya no es caro.
2. **La voz es el canal natural:** el uso de voz y video en Colombia creció **+185% interanual** ([Infobip, Messaging Trends Report 2026](https://www.infobip.com/messaging-trends-report/regional-snapshot)). Capturar con la voz es comportamiento masivo, no una feature. *(Fuente del dato de notas de voz en WhatsApp: [VERIFICAR] antes de reutilizar.)*
3. **La brecha intención/ejecución es medible:** el miedo al fracaso alcanzó el **49%** de quienes ven oportunidades de negocio a nivel global (GEM 2024/2025). Hay mucha gente que quiere emprender y no avanza.

**Por qué nadie lo ha resuelto bien:** las apps de notas optimizan guardar, no decidir. Los validadores con IA (ver sección 3) cobran por consulta suelta y no tienen captura diaria ni historial. No existe hoy un producto que capture sin fricción **y** someta la idea a un interrogatorio serio antes de decidir.

---

## 2. Producto / empresa a construir — 20 pts

**Trojes** captura ideas sin fricción —texto, voz, imagen, offline-first— y las somete a un interrogatorio de 8 ramas que cierra con un veredicto: **la IA recomienda, el usuario decide**. **Estado:** MVP de captura desplegado en **trojes.app** (link + capturas). **IA:** hoy no corre en la app; la capa de análisis —cola de preparación, escaneo web anonimizado y veredicto— está diseñada y es lo que construimos a continuación.

**Cómo funciona hoy (MVP desplegado):** captura instantánea en una app PWA instalable que funciona offline; las ideas quedan en una bandeja con fijados; API propia para capturar desde cualquier herramienta. **Camino al producto completo:** idea capturada → cola de preparación (transcripción, limpieza, escaneo web anonimizado, generación del árbol de preguntas) → interrogatorio de 8 ramas (problema, para quién, riesgo, alternativas, viabilidad, diferenciación real, qué la mataría, siguiente prueba) → veredicto con recomendación de la IA y voto del usuario (**pinear / mantener / archivar**; se guardan ambos votos, el de la IA y el del usuario).

**Qué hace y qué no hace la IA:** hoy no ejecuta análisis en producción. Cuando esté, hará: transcribir, estructurar, escanear la web de forma anonimizada y recomendar. **No** ejecuta tareas, **no** integra otras apps y **no** decide por el usuario — recomienda y el usuario vota.

<!-- Screenshot del apartado 2 incluido en el HTML (`.shot`, 21 mm de alto). Probar login con cuenta nueva en trojes.app antes de enviar. -->

---

## 3. Ventaja frente a la competencia — 15 pts

| Competidor | Qué ofrece | Qué le falta |
|---|---|---|
| **Memos** (notas) | Notas rápidas, open source, gratis | No interroga ni decide; IA solo transcripción |
| **ideaShell** | Notas de voz con IA y acciones | Chat abierto, no entrevista estructurada ni veredicto; US$4,16–5,99/mes |
| **Voicenotes** | Transcripción y resúmenes de voz | No valida ideas; US$9/mes |
| **Notion / RemNote** | Estructura y notas con IA | Para estudiar, no para decidir |
| **ChatGPT** | Cualquier respuesta bajo pedido | Responde lo que le preguntes, pero no te interroga; sin cola, sin historial, sin veredicto |
| **ValidatorAI / IdeaValidate** | Validación de ideas con IA | Cobro por idea (US$19,9/idea), sin captura diaria, sin historial |
| **Casera:** WhatsApp consigo mismo, app de notas del celular, un libro, una agenda | Gratis y a la mano | Sin análisis, sin veredicto, todo se pierde |
| **No hacer nada** | — | La idea simplemente muere |

**Nuestra ventaja, con honestidad sobre el estado actual:** (1) **hoy:** captura diaria + interrogatorio en un solo producto, con el MVP ya corriendo en trojes.app — los validadores con IA no capturan a diario; (2) **privacidad por diseño** — el escaneo web es anonimizado y el texto crudo nunca sale del dispositivo; open source sirve para distribución y confianza, **no como barrera** (cualquiera puede copiar el código). **A 12 meses**, lo difícil de copiar es el **historial de decisiones** del usuario (qué archivó, qué pineó, en qué divergió de la IA). **No existe hoy**: la IA no corre en producción; se construye con la cola y el interrogatorio. El flujo de preguntas sí es clonable; el activo es el dato.

---

## 4. Mercado objetivo y TAM — 15 pts

**Mercado:** builders colombianos — estudiantes de emprendimiento/ingeniería y fundadores tempranos que capturan más ideas de las que ejecutan. Cálculo de abajo hacia arriba (clientes × ticket anual de **US$60/año** = Pro a US$5/mes, **supuesto de precio sin validar**; el 93% nunca pagó por productividad → por eso el modelo es freemium y el SOM solo asume 1% pagando):

- **TAM Colombia** = (799.890 estudiantes de economía/administración/ingeniería, **SNIES 2025**) + (297.475 nuevas empresas creadas en 2024, **Confecámaras 2024**) = 1.097.365 generadores de ideas × US$60 = **≈ US$65,8 millones/año**
- **SAM** = 30% del TAM que captura ideas digitalmente (*supuesto*) ≈ 329.200 usuarios × US$60 = **≈ US$19,7 millones/año**
- **SOM a 3 años** = 1% del SAM en usuarios pagando (*supuesto*) ≈ 3.300 × US$60 = **≈ US$197.000 ARR**

*Fuentes: [SNIES (MEN, 2025, base de matrícula)](https://snies.mineducacion.gov.co/) — filtro: matrícula en economía, administración e ingeniería; [Confecámaras, "Dinámica de creación de empresas en Colombia" (2024)](https://confecamaras.org.co/estudio/dinamica-de-creacion-de-empresas-en-colombia-2024/) — 297.475 empresas creadas (verificado, enlace el 4 oct 2026). Supuestos de conversión rotulados; **falta verificar en SNIES el agregado de 799.890 estudiantes**.* Como referencia de mercado, el mercado **global** de apps de notas con IA crece a un **CAGR de 18,75% (2026–2035)** ([Precedence Research, "AI Note Taking Market"](https://www.precedenceresearch.com/ai-note-taking-market)).

---

## 5. Usuario objetivo — 10 pts

**Perfil:** builder colombiano, 18–30 años, estudiante de economía, administración o ingeniería (mismo filtro que el TAM de la sección 4) o fundador temprano (Tunja/Bogotá y ciudades universitarias). **Comportamiento:** tiene muchas ideas —"ushh, imagínate si…"—, se las guarda en WhatsApp consigo mismo, en la app de notas del celular o en papel; publica y repostea en LinkedIn a otros haciendo cosas (frustración visible). **Qué lo lleva a cambiar:** dejar de perder ideas y quitarse la culpa de no haber intentado. **Dato clave:** 46% tiene la **mensajería** (no una app de notas) en la pantalla principal y 93% nunca ha pagado por una app de productividad — por eso el modelo es freemium.

**Evidencia de contacto real:** 4 entrevistas profundas (1 h c/u) + 46 respuestas de encuesta propia (3–4 oct 2026, en 2 días, muestra por conveniencia, excluyendo fundadores). **Lectura honesta: señal temprana, no validación** — la validación viene de los 100 beta testers de la sección 7. **Aprendizajes:** (1) la captura pasa por donde el usuario ya está —mensajería, notas, papel—, no por una app nueva con fricción; (2) el dolor no es "perder" la nota, es verla después y no haber hecho nada; (3) los sistemas de recordatorio se abandonan por costo, olvido o tiempo —nunca se completó una migración limpia a una herramienta.

---

## 6. Equipo — 10 pts

- **Diego Tenjo** — founder líder; tecnología y producto; diseñó y construyó el MVP offline-first de Trojes. `[POR COMPLETAR: una línea de experiencia]`
- **Lunna Sosa** — tecnología y producto; `[POR COMPLETAR: qué construyó / experiencia]`
- **Lo que nos falta:** ventas/GTM. **Cómo lo cubriremos:** mentoría de Execute en go-to-market + aliados (comunidad de Execute y universidades) como canal.
- **¿Ya hemos ejecutado juntos?** Sí — proyectos de la universidad, p. ej. [HydroSim](https://andean-water-stress-simulator-web.vercel.app/): simulador 3D regional de estrés hídrico en Boyacá (Tunja, Duitama, Sogamoso), monorepo Turbo con React + Three.js + Astro, desplegado en Vercel.

**Contacto (founder líder):** Diego Tenjo · www.trojes@gmail.com

---

## 7. Qué buscan de Execute y de los inversionistas — 10 pts

**No pedimos capital en esta etapa.** Buscamos:

1. **Difusión:** que el producto se use — beta testers del nicho (meta: 100) y presencia en la comunidad de Execute.
2. **Feedback:** sesiones con usuarios reales para validar el flujo de análisis.
3. **Mentoría:** go-to-market y producto, con mentores de Execute; e intros con inversionistas pre-semilla para la siguiente ronda.

**Hito a 12 meses:** **1.000 usuarios**, al menos **200 pagando** y **2 alianzas con universidades**. Lo siguiente que tenemos que probar es si el usuario repite el grilling: la captura ya está validada por el MVP; la retención del análisis, no.

---

### Notas de maquetación (NO van en el PDF)

- Generar `Trojes_OnePager_Execute2026.pdf` con `bun run onepager:pdf` (usa Playwright/Chromium con la hoja de estilo de `onepager-print.html`: A4, full-bleed sin margen `@page`, gráficos de fondo activos). El script valida antes de entregar: 1 página, tamaño A4, ≤ 10 MB, cuerpo ≥ 9 pt, sin desbordes y sin imágenes rotas. Nombre alternativo si los organizadores lo exigen literal: `Equipo_OnePager_Execute2026.pdf` (renombrar al enviar).
- El HTML de impresión es una versión condensada de este archivo: **1 página, ~1106 px de 1123 disponibles** (full-bleed; holgura ~17 px). Si cambias texto aquí, sincroniza el HTML y vuelve a generar el PDF (el script avisa si la página se queda corta o se pasa).
- **Margen libre: ~17 px (~4,5 mm).** El HTML ya incluye el screenshot del apartado 2 (`.shot`, 19 mm; era 27 mm y hacía desbordar la página a 1139 px). Si crece cualquier texto o imagen, medir de nuevo con `bun run onepager:pdf`: habrá que acortar contenido en otra sección. **Presupuesto:** una línea a 9 pt ≈ 16 px; columna `.col` de 355 px ≈ 58 caracteres/línea. **Nota de espacio:** en `.cols`, solo los recortes de la columna que define la altura de la fila (hoy: sección 2 en la fila 1 y sección 6 en la fila 3) reducen la altura total; recortar la columna más corta de la misma fila no libera espacio.
- Cuerpo mínimo 9 pt; nombre del equipo y contacto visibles.
- Límite: 1 página, ≤ 10 MB. Más de una página = −10 puntos.
- Verificar ortografía y consistencia de cifras (65,8M / 19,7M / 197K; 46 respuestas; 4 entrevistas; 54/28/8/3).
- Enviar por **los dos canales** antes de las 11:59 p.m. (Colombia): página Execute + correo `executetheideafgj@gmail.com`. Cuenta el último recibido.
- Revisión externa obligatoria: alguien fuera del equipo debe leerlo en 3 minutos y decir qué vende, a quién y por qué gana.
