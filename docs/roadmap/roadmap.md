# Finance BFF — Experience Roadmap (espejo del Excel)

> Fuente de verdad: [`Finance-BFF-Experience-Roadmap.xlsx`](./Finance-BFF-Experience-Roadmap.xlsx), generado con el socio del proyecto.
> Este `.md` es un espejo fiel y legible/diff-eable. Regenerar con `python3 docs/roadmap/sync.py`.

Última sincronización del espejo: 2026-09-18

## Tablero de estado

| ID | User Story | Epic | Prioridad | Estado |
|----|------------|------|-----------|--------|
| 2.1 | Rediseñar el Hero | Primera impresión de la Landing | Alta | Completo |
| 2.2 | Mockup principal de Amy | Primera impresión de la Landing | Alta | Completo |
| 2.3 | CTA principal | Primera impresión de la Landing | Alta | Completo |
| 2.4 | Header y navegación | Primera impresión de la Landing | Media | Completo |
| 2.5 | Animaciones del Hero | Primera impresión de la Landing | Media | Completo |
| 2.6 | Responsive del Hero | Primera impresión de la Landing | Alta | Completo |
| 2.7 | Optimización emocional del Hero | Primera impresión de la Landing | Alta | Completo |
| 3.1 | Guardar progreso y permitir volver atrás | Onboarding Happy Path | Alta | Completo |
| 3.2 | Formato inteligente para valores de dinero | Onboarding Happy Path | Alta | Completo |
| 3.3 | Amy Detective reconoce primero el progreso | Onboarding Happy Path | Alta | Completo |
| 3.4 | Explicar claramente el punto de partida del ahorro | Onboarding Happy Path | Alta | Completo |
| 3.5 | Mostrar dinero restante al crear bolsitas | Onboarding Happy Path | Alta | Completo |
| 3.6 | Convertir Mis finanzas en un plan de acción | Acompañamiento después del onboarding | Alta | Pendiente |
| 3.7 | Guiar la creación de cajitas y bolsitas en el banco | Hábitos financieros y conexión con el banco | Alta | Pendiente |
| 3.8 | Crear el ritual semanal de registro de gastos | Hábitos financieros y conexión con el banco | Alta | Pendiente |
| 3.9 | Enseñar cómo usar el menú principal | Acompañamiento después del onboarding | Media | Pendiente |
| 3.10 | Simplificar la selección de país | Onboarding Happy Path | Media | Completo |
| 3.11 | Permitir configurar varias monedas | Onboarding Happy Path | Alta | Completo |
| 3.12 | Eliminar guiones -Hyphens innecesarios de los textos | Onboarding Happy Path | Media | Completo |
| 3.13 | Aclarar que los gastos fijos pueden completarse después | Onboarding Happy Path | Media | Completo |
| 3.14 | Proponer la próxima fecha válida para cajitas | Onboarding Happy Path | Alta | Completo |
| 3.15 | Calcular la recomendación después de definir importancia en la creación de bolsitas de ahorro | Onboarding Happy Path | Alta | Completo |
| 3.16 | Hacer evidente la acción Agregar bolsita | Onboarding Happy Path | Alta | Completo |
| 3.17 | Mantener visible el resumen del reparto de ahorro | Onboarding Happy Path | Alta | Completo |
| 4.1 | Confirmar transferencias de cada cajita por separado | Dashboard | Alta | Completo |
| 4.2 | Guiar y confirmar los abonos de cada bolsita | Dashboard | Alta | Completo |
| 4.3 | Actualizar el saldo disponible al confirmar movimientos | Dashboard | Alta | Completo |
| 4.4 | Registrar el pago de gastos fijos y reflejarlo en el saldo | Dashboard | Alta | Completo |
| 4.5 | Convertir la metodología de deuda en un plan de acción mensual | Dashboard | Mis deudas | Alta | Completo |
| 4.6 | Diferenciar cuota normal y abono adicional a capital | Dashboard | Mis deudas | Alta | Completo |
| 4.7 | Confirmar individualmente los pagos realizados en el banco | Dashboard | Mis deudas | Alta | Completo |
| 4.8 | Pedir el saldo real de la deuda después de registrar pagos | Dashboard | Mis deudas | Alta | Pendiente |
| 4.9 | Mostrar progreso y siguiente objetivo de salida de deudas | Dashboard | Mis deudas | Alta | Completo |
| 4.10 | Agregar Ingresos al menú lateral | Dashboard | Alta | Pendiente |
| 4.11 | Corregir el campo nombre al agregar gastos fijos | Dashboard | Mis gastos | Alta | Pendiente |
| 4.12 | Aclarar que el bolsillo o sobre de cada cajita se crea una sola vez | Dashboard | Mis cajitas | Alta | Pendiente |
| 4.13 | Confirmar una sola vez la creación de las cajitas en banco o efectivo | Dashboard | Mis cajitas | Alta | Pendiente |
| 4.14 | Confirmar una sola vez la creación de las bolsitas de ahorro en banco o efectivo | Dashboard | Mis ahorros | Alta | Pendiente |
| 4.15 | Mover la explicación de qué son las cajitas al inicio | Dashboard | Mis cajitas | Media | Pendiente |
| 4.16 | Unificar la estructura de Bolsitas con la de Cajitas | Dashboard | Mis ahorros | Media | Pendiente |
| 4.17 | Limitar nuevas bolsitas al dinero realmente disponible para ahorrar | Dashboard | Mis bolsitas | Alta | Pendiente |
| 4.18 | Validar nuevas cajitas contra la capacidad disponible | Dashboard | Mis cajitas | Alta | Pendiente |
| 4.19 | Explicar la metodología de salida de deudas con su autor | Dashboard | Mis deudas | Alta | Pendiente |
| 4.20 | Hacer literal el check del pago mensual de la deuda | Dashboard | Mis deudas | Alta | Pendiente |

## Detalle por User Story

### 2.1 · Rediseñar el Hero
**Epic:** Primera impresión de la Landing  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** El Hero comunica la propuesta de valor, pero la diferenciación frente a otras aplicaciones financieras no es inmediata. El producto tiene menos protagonismo del deseado y la jerarquía visual puede hacer que la usuaria invierta más tiempo del necesario para entender qué ofrece Finance BFF y por qué debería confiar en la plataforma.
- **Experiencia deseada:** Desde los primeros segundos la usuaria debe comprender que Finance BFF es una guía financiera paso a paso. El Hero debe transmitir cercanía, confianza y claridad, mostrando el producto como protagonista y motivando a iniciar el registro sin necesidad de hacer scroll.
- **Historia de usuario:** Como una mujer que visita Finance BFF por primera vez y siente que no tiene claridad sobre sus finanzas, quiero entender inmediatamente qué es Finance BFF, cómo me ayudará y por qué es diferente, para sentir confianza y querer empezar mi proceso de organización financiera.
- **Lineamientos de implementación:** Rediseñar completamente el Hero incorporando navegación, headline, subtítulo, CTA principal, CTA secundario, mockup del producto y diseño responsive.
- **Consideraciones de UX:** Conservar la identidad visual y la paleta de rosados. El mockup debe ser protagonista y el CTA principal debe tener la mayor jerarquía visual.
- **Objetivo de negocio:** Comunicar claramente la propuesta de valor e incrementar la conversión.
- **Resultado esperado:** La usuaria comprende el valor del producto y quiere continuar.
- **Criterio de éxito:** La propuesta de valor se entiende en pocos segundos.

### 2.2 · Mockup principal de Amy
**Epic:** Primera impresión de la Landing  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** Actualmente el producto no tiene suficiente protagonismo dentro del Hero, lo que dificulta que la usuaria imagine cómo será la experiencia después del registro. La propuesta depende demasiado del texto y poco de la demostración visual.
- **Experiencia deseada:** La usuaria debe visualizar inmediatamente una versión real del producto y entender que Amy interpreta la información financiera y la guía con recomendaciones personalizadas. El mockup debe generar confianza y reducir la incertidumbre sobre lo que recibirá.
- **Historia de usuario:** Como una mujer que está evaluando si Finance BFF realmente puede ayudarla, quiero ver el producto desde el primer momento para imaginar cómo sería utilizar la plataforma y entender que recibiré acompañamiento más allá de un simple registro de gastos.
- **Lineamientos de implementación:** Crear un mockup de alta fidelidad con información financiera realista, recomendaciones de Amy y componentes auténticos del producto.
- **Consideraciones de UX:** El mockup debe sentirse premium, ser coherente con la marca y convertirse en el principal apoyo visual del Hero.
- **Objetivo de negocio:** Hacer tangible el producto antes del registro.
- **Resultado esperado:** La usuaria visualiza claramente la experiencia.
- **Criterio de éxito:** El mockup comunica el funcionamiento del producto.

### 2.3 · CTA principal
**Epic:** Primera impresión de la Landing  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** El siguiente paso no destaca con suficiente fuerza y la usuaria puede perder algunos segundos identificando cuál es la acción principal que debe realizar para comenzar.
- **Experiencia deseada:** La acción principal debe ser evidente desde el primer vistazo. El CTA debe transmitir seguridad, eliminar dudas y motivar el registro sin competir con otros elementos visuales.
- **Historia de usuario:** Como una mujer que ya entendió el valor de Finance BFF, quiero identificar inmediatamente cuál es el siguiente paso para comenzar, sin sentir dudas o confusión, para iniciar mi proceso con seguridad y sin fricción.
- **Lineamientos de implementación:** Crear un CTA principal dominante y un CTA secundario para iniciar sesión, manteniendo consistencia en todos los dispositivos.
- **Consideraciones de UX:** Ubicar el CTA cerca de la propuesta de valor y mantener una jerarquía visual clara.
- **Objetivo de negocio:** Incrementar la conversión.
- **Resultado esperado:** La usuaria sabe exactamente qué hacer.
- **Criterio de éxito:** El CTA es el elemento de mayor protagonismo después del titular.

### 2.4 · Header y navegación
**Epic:** Primera impresión de la Landing  ·  **Prioridad:** Media  ·  **Estado:** Completo

- **Estado actual:** La navegación actual puede evolucionar para orientar mejor a usuarias nuevas y recurrentes, manteniendo el foco en la conversión sin generar distracciones.
- **Experiencia deseada:** La navegación debe sentirse simple, intuitiva y organizada. Debe facilitar el acceso a la información esencial y al inicio de sesión sin quitar protagonismo al Hero.
- **Historia de usuario:** Como una mujer que está explorando Finance BFF por primera vez, quiero encontrar una navegación clara y sencilla que me permita moverme por la página y acceder fácilmente al inicio de sesión si ya tengo una cuenta, para sentir que la plataforma está bien organizada.
- **Lineamientos de implementación:** Construir un header limpio con logo, enlaces esenciales y botón de iniciar sesión.
- **Consideraciones de UX:** Mantener simplicidad y coherencia visual.
- **Objetivo de negocio:** Facilitar la exploración.
- **Resultado esperado:** La navegación transmite orden y confianza.
- **Criterio de éxito:** La usuaria encuentra rápidamente lo que necesita.

### 2.5 · Animaciones del Hero
**Epic:** Primera impresión de la Landing  ·  **Prioridad:** Media  ·  **Estado:** Completo

- **Estado actual:** La experiencia es principalmente estática, por lo que la calidad percibida puede ser inferior al valor real del producto.
- **Experiencia deseada:** La interfaz debe sentirse viva mediante microanimaciones elegantes que acompañen la interacción sin distraer ni afectar el rendimiento.
- **Historia de usuario:** Como una mujer que está evaluando si puede confiar en Finance BFF, quiero que la página tenga movimientos y transiciones suaves que hagan la experiencia más agradable, para percibir el producto como moderno y profesional sin distraerme del contenido principal.
- **Lineamientos de implementación:** Incorporar microanimaciones al cargar el Hero y durante las interacciones clave.
- **Consideraciones de UX:** Las animaciones deben reforzar la experiencia y nunca convertirse en el foco.
- **Objetivo de negocio:** Incrementar la percepción de calidad.
- **Resultado esperado:** La experiencia se siente moderna.
- **Criterio de éxito:** Las animaciones no afectan el rendimiento.

### 2.6 · Responsive del Hero
**Epic:** Primera impresión de la Landing  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** La experiencia puede mejorar para garantizar que el mensaje conserve la misma claridad y jerarquía en cualquier tamaño de pantalla.
- **Experiencia deseada:** Sin importar el dispositivo, la usuaria debe recibir exactamente la misma propuesta de valor y una experiencia visual consistente.
- **Historia de usuario:** Como una mujer que puede descubrir Finance BFF desde su celular, tablet o computador, quiero recibir una experiencia consistente sin importar el dispositivo que esté utilizando, para comprender la propuesta de valor con la misma facilidad.
- **Lineamientos de implementación:** Optimizar completamente el Hero para desktop, tablet y móvil.
- **Consideraciones de UX:** Conservar jerarquía, legibilidad y paleta de colores.
- **Objetivo de negocio:** Garantizar consistencia.
- **Resultado esperado:** La experiencia es igual de clara en cualquier dispositivo.
- **Criterio de éxito:** No existen problemas de visualización.

### 2.7 · Optimización emocional del Hero
**Epic:** Primera impresión de la Landing  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** El Hero comunica beneficios funcionales, pero aún existe una oportunidad para conectar emocionalmente con mujeres que sienten frustración o ansiedad por sus finanzas.
- **Experiencia deseada:** La usuaria debe sentir que Finance BFF comprende su situación antes de hablarle de funcionalidades. La conexión emocional debe generar confianza y hacer que la plataforma se perciba cercana y humana.
- **Historia de usuario:** Como una mujer que durante mucho tiempo ha sentido frustración o desorden con sus finanzas, quiero sentir desde los primeros segundos que Finance BFF comprende mi situación y me habla de una manera cercana y empática, para confiar en que realmente puede acompañarme.
- **Lineamientos de implementación:** Refinar el contenido, imágenes y mensajes para reforzar empatía y acompañamiento.
- **Consideraciones de UX:** La emoción debe anteceder a la explicación funcional.
- **Objetivo de negocio:** Generar conexión emocional.
- **Resultado esperado:** La usuaria siente que Finance BFF fue creado para ella.
- **Criterio de éxito:** El Hero transmite cercanía y confianza.

### 3.1 · Guardar progreso y permitir volver atrás
**Epic:** Onboarding Happy Path  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** Durante el onboarding la usuaria puede avanzar entre varias pantallas, pero la experiencia no deja suficientemente explícito que su progreso se conserva si necesita salir. Además, el botón para regresar no está presente de forma consistente en todos los pasos.
- **Experiencia deseada:** La usuaria debe poder completar el onboarding a su ritmo. Todo dato confirmado o ingresado debe guardarse automáticamente y cada paso debe permitir volver atrás sin perder información ni obligarla a comenzar de nuevo.
- **Historia de usuario:** Como una mujer que está organizando sus finanzas por primera vez y puede no tener tiempo para completar todo el proceso en una sola sesión, quiero que Finance BFF guarde automáticamente lo que voy haciendo y me permita regresar a pasos anteriores, para avanzar a mi ritmo sin miedo a perder información. y que me avise que eso va a pasar.
- **Lineamientos de implementación:** Implementar guardado automático durante todo el onboarding. Al volver a ingresar, llevar a la usuaria al último paso pendiente con la información previamente diligenciada. Incluir una acción Atrás en todos los pasos donde exista una pantalla anterior y conservar los datos al navegar entre pasos.
- **Consideraciones de UX:** El guardado debe sentirse automático y silencioso, sin interrumpir el flujo. Evitar mensajes técnicos. Si se muestra confirmación, usar microcopy breve como 'Guardado'. La acción Atrás debe ser secundaria frente al CTA principal.
- **Objetivo de negocio:** Reducir abandono del onboarding y facilitar que más usuarias lo completen.
- **Resultado esperado:** La usuaria puede interrumpir y retomar el proceso sin perder avances ni repetir información.
- **Criterio de éxito:** Salir y regresar conserva los datos y el paso alcanzado. Todos los pasos aplicables permiten volver atrás sin pérdida de información.

### 3.2 · Formato inteligente para valores de dinero
**Epic:** Onboarding Happy Path  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** Los campos monetarios no mantienen una presentación consistente mientras la usuaria escribe y algunos inputs muestran controles nativos con flechas para aumentar o disminuir números.
- **Experiencia deseada:** Todos los valores de dinero deben ser fáciles de leer desde el momento en que se ingresan, mostrando el signo $ y separadores de miles de forma automática, sin controles numéricos que generen ruido visual.
- **Historia de usuario:** Como una mujer que está ingresando varios valores de ingresos, gastos, cajitas y ahorros, quiero ver los montos en un formato claro mientras los escribo, para evitar errores y entender rápidamente las cantidades que estoy registrando.
- **Lineamientos de implementación:** Aplicar formato monetario en todos los campos de dinero del producto: signo $ y puntos como separadores de miles. El formato debe actualizarse mientras se escribe. Eliminar las flechas nativas de incremento y decremento de los inputs numéricos y mantener el campo abierto para escritura directa.
- **Consideraciones de UX:** El formato debe ayudar a leer, no dificultar la edición. Mantener consistencia en onboarding, dashboard y módulos posteriores.
- **Objetivo de negocio:** Reducir errores de digitación y mejorar la comprensión de la información financiera.
- **Resultado esperado:** La usuaria interpreta los montos de inmediato y encuentra una experiencia consistente en toda la plataforma.
- **Criterio de éxito:** Todos los campos monetarios aplicables muestran $ y separadores de miles y ninguno presenta controles nativos de incremento/decremento.

### 3.3 · Amy Detective reconoce primero el progreso
**Epic:** Onboarding Happy Path  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** En el Happy Path la usuaria no tiene deudas y cuenta con capacidad para ahorrar, pero Amy Detective abre con un mensaje de alerta sobre el porcentaje de gastos fijos. El tono puede hacer que un escenario positivo se perciba como un problema.
- **Experiencia deseada:** Amy debe reconocer primero lo que la usuaria está haciendo bien y después mostrar oportunidades de mejora. En este escenario debe celebrar que no tiene deudas y que existe margen para organizar su ahorro antes de hablar de optimización de gastos.
- **Historia de usuario:** Como una mujer que acaba de compartir toda su información financiera y descubre que no tiene deudas y sí tiene capacidad de ahorro, quiero que Amy reconozca ese avance antes de señalar oportunidades de mejora, para sentir motivación y no interpretar mi situación como algo negativo.
- **Lineamientos de implementación:** Reescribir el estado de Amy Detective para el Happy Path. Abrir con una felicitación o reconocimiento positivo. Después explicar de manera tranquila que los gastos fijos representan una parte importante de los ingresos y que Amy puede ayudar a revisar si existe espacio para liberar aún más dinero. Mantener la opción de revisar gastos o continuar.
- **Consideraciones de UX:** Evitar lenguaje de alarma como '¡Oops!' cuando no existe una situación crítica. Amy debe sentirse como una BFF que reconoce avances y luego acompaña a mejorar.
- **Objetivo de negocio:** Fortalecer la relación emocional con Amy y evitar ansiedad innecesaria.
- **Resultado esperado:** La usuaria entiende que está en una buena posición y percibe la revisión de gastos como una oportunidad, no como una advertencia.
- **Criterio de éxito:** El mensaje comienza reconociendo el escenario positivo y la oportunidad de optimización aparece como segundo mensaje.

### 3.4 · Explicar claramente el punto de partida del ahorro
**Epic:** Onboarding Happy Path  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** La pantalla 'Este es tu punto de partida' muestra cálculos y tres opciones de ahorro, pero no explica con suficiente claridad qué hizo Amy con la información registrada, de dónde sale el dinero disponible ni qué decisión debe tomar la usuaria.
- **Experiencia deseada:** Antes de pedir una elección, Amy debe resumir en lenguaje sencillo cuánto dinero queda realmente disponible después de compromisos, cómo llegó a ese resultado y por qué propone diferentes niveles de ahorro.
- **Historia de usuario:** Como una mujer que acaba de registrar ingresos, gastos y cajitas, quiero entender cuánto dinero me queda disponible y por qué Amy me recomienda ciertos montos de ahorro, para elegir una opción con confianza y sin sentir que estoy escogiendo números al azar.
- **Lineamientos de implementación:** Reorganizar la pantalla para explicar la secuencia del cálculo antes de mostrar las opciones. Mostrar claramente: dinero disponible después de gastos, reserva mensual para cajitas y monto realmente disponible para decidir. Después presentar las alternativas de ahorro explicando la diferencia entre recomendada, intermedia y flexible y cuánto dinero libre queda en cada caso.
- **Consideraciones de UX:** Priorizar comprensión sobre cantidad de información. Los números principales deben tener jerarquía visual y el lenguaje debe explicar decisiones, no fórmulas.
- **Objetivo de negocio:** Aumentar la confianza en las recomendaciones de Amy y facilitar la selección del plan de ahorro.
- **Resultado esperado:** La usuaria entiende de dónde sale su capacidad de ahorro, qué está eligiendo y cómo afecta su dinero disponible.
- **Criterio de éxito:** Una usuaria puede explicar con sus propias palabras de dónde sale el monto disponible y la diferencia entre las tres opciones antes de continuar.

### 3.5 · Mostrar dinero restante al crear bolsitas
**Epic:** Onboarding Happy Path  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** Durante la creación de bolsitas existe un indicador de dinero disponible para repartir, pero pierde protagonismo a medida que se agregan bolsitas. Cuando el monto llega a $0 se utiliza un estado naranja que puede interpretarse como advertencia.
- **Experiencia deseada:** La usuaria debe saber en todo momento cuánto dinero de su ahorro mensual ya distribuyó y cuánto le queda por asignar. Llegar a $0 debe sentirse como completar exitosamente la organización del ahorro.
- **Historia de usuario:** Como una mujer que está repartiendo por primera vez su ahorro entre diferentes propósitos, quiero ver claramente cuánto dinero me queda por distribuir después de cada bolsita, para organizarlo sin pasarme del límite y sentir satisfacción cuando termino.
- **Lineamientos de implementación:** Mantener visible y con alta jerarquía el saldo restante durante toda la creación de bolsitas. Actualizarlo en tiempo real después de agregar, editar o eliminar una bolsita. Cuando llegue a $0, reemplazar el estado de advertencia por un estado positivo con un mensaje como '¡Listo! Repartiste todo tu ahorro mensual' y habilitar claramente la continuación.
- **Consideraciones de UX:** No usar naranja, rojo ni lenguaje de error cuando el dinero fue distribuido correctamente. El estado final puede incluir una microcelebración coherente con la marca.
- **Objetivo de negocio:** Facilitar la distribución del ahorro y reforzar la sensación de progreso.
- **Resultado esperado:** La usuaria sabe cuánto le queda por repartir en cada momento y entiende que llegar a $0 significa que completó el paso.
- **Criterio de éxito:** El saldo restante se actualiza inmediatamente y el estado de $0 se presenta como éxito, no como alerta.

### 3.6 · Convertir Mis finanzas en un plan de acción
**Epic:** Acompañamiento después del onboarding  ·  **Prioridad:** Alta  ·  **Estado:** Pendiente

- **Estado actual:** Al terminar el onboarding la usuaria llega a un dashboard con información financiera completa, pero no recibe suficiente orientación sobre qué hacer con esos números ni cuál debería ser su siguiente acción.
- **Experiencia deseada:** El dashboard debe funcionar como el centro de acompañamiento de Amy. Además de mostrar números, debe traducir el plan financiero en acciones concretas, simples y priorizadas para que la usuaria sepa qué hacer en Finance BFF y en su vida real.
- **Historia de usuario:** Como una mujer que acaba de terminar de organizar sus finanzas con Amy, quiero que al llegar a Mis finanzas me expliquen qué construimos juntas y cuáles son mis próximos pasos, para no sentir que después del onboarding quedé sola frente a un dashboard.
- **Lineamientos de implementación:** Incorporar en Mis finanzas un bloque visible de acompañamiento, por ejemplo 'Tu plan con Amy' o 'Qué hacer ahora'. Mostrar pocas acciones prioritarias según el escenario de la usuaria, con CTA directo al módulo correspondiente. En el Happy Path pueden incluir: preparar cajitas en el banco, crear bolsitas de ahorro, registrar gastos de la semana y completar las transferencias recomendadas.
- **Consideraciones de UX:** El dashboard no debe convertirse en una lista pesada de pendientes. Priorizar máximo las acciones que realmente requieren atención y marcar visualmente las completadas. Amy debe mantener el tono de acompañamiento del onboarding.
- **Objetivo de negocio:** Transformar Finance BFF de una herramienta de visualización en una experiencia de acompañamiento financiero continuo.
- **Resultado esperado:** La usuaria entra al dashboard y sabe inmediatamente qué debe hacer después.
- **Criterio de éxito:** El dashboard presenta próximos pasos accionables y cada acción lleva directamente al lugar donde puede completarse o aprender cómo hacerla.

### 3.7 · Guiar la creación de cajitas y bolsitas en el banco
**Epic:** Hábitos financieros y conexión con el banco  ·  **Prioridad:** Alta  ·  **Estado:** Pendiente

- **Estado actual:** Finance BFF calcula cuánto reservar para cajitas y bolsitas, pero la aplicación no mueve físicamente el dinero. En algunos puntos se explica parcialmente qué hacer en el banco, mientras que en otros esta conexión con la vida real no es suficientemente visible.
- **Experiencia deseada:** La usuaria debe entender que Finance BFF organiza el plan y que ella debe separar el dinero en su banco. Amy debe convertir cada recomendación en una instrucción sencilla y permitir registrar que la acción ya fue realizada.
- **Historia de usuario:** Como una mujer que ya definió sus cajitas y bolsitas con Amy, quiero saber exactamente qué debo hacer en mi banco con esos montos, para que mi organización en Finance BFF se convierta en dinero realmente separado y no se quede solo en un plan dentro de la aplicación.
- **Lineamientos de implementación:** En Cajitas y Bolsitas de ahorro incluir instrucciones visibles sobre la acción bancaria correspondiente. Indicar qué monto total separar y, cuando aplique, cuánto corresponde a cada cajita o bolsita. Permitir marcar la transferencia mensual como realizada. Desde Mis finanzas, enlazar las tareas pendientes directamente a estos módulos.
- **Consideraciones de UX:** Evitar dar la impresión de que Finance BFF ya movió el dinero. Diferenciar claramente entre 'Amy reserva en tu presupuesto' y 'tú separas/transfieres en tu banco'. Usar lenguaje sencillo y accionable.
- **Objetivo de negocio:** Conectar la planificación digital con comportamientos financieros reales y aumentar la efectividad del producto.
- **Resultado esperado:** La usuaria entiende qué debe separar en su banco, lo hace y puede reflejar la acción en Finance BFF.
- **Criterio de éxito:** Los módulos explican explícitamente la acción bancaria y permiten registrar el cumplimiento mensual sin confundir reserva presupuestal con transferencia real.

### 3.8 · Crear el ritual semanal de registro de gastos
**Epic:** Hábitos financieros y conexión con el banco  ·  **Prioridad:** Alta  ·  **Estado:** Pendiente

- **Estado actual:** Mis gastos permite registrar transacciones manualmente o hablando con Amy, pero actualmente la funcionalidad depende de que la usuaria recuerde entrar por iniciativa propia.
- **Experiencia deseada:** Finance BFF debe ayudar a convertir el registro de gastos en un hábito simple y sostenible. Amy debe proponer una rutina semanal corta para revisar y registrar los gastos de los últimos días.
- **Historia de usuario:** Como una mujer que quiere tener una mejor relación con su dinero pero no quiere estar pendiente de cada compra todos los días, quiero tener un momento semanal sencillo para contarle a Amy en qué gasté, para mantener mis finanzas actualizadas sin sentir que llevar control es una carga.
- **Lineamientos de implementación:** Presentar en Mis gastos una rutina recomendada de actualización semanal. Explicar que puede dedicar unos minutos una vez por semana, idealmente domingo o lunes, a registrar los gastos de la semana usando voz o ingreso manual. Integrar esta acción dentro del plan del dashboard y permitir identificar cuándo la semana ya fue actualizada.
- **Consideraciones de UX:** El hábito debe sentirse liviano y realista. No transmitir culpa si la usuaria se atrasa. La voz debe presentarse como la forma más fácil de ponerse al día, no como una obligación.
- **Objetivo de negocio:** Incrementar la recurrencia de uso y ayudar a construir hábitos financieros sostenibles.
- **Resultado esperado:** La usuaria comprende cuándo y cómo actualizar sus gastos y percibe el proceso como un pequeño ritual semanal.
- **Criterio de éxito:** Mis gastos comunica la rutina semanal y el dashboard puede reflejar si la actualización de la semana está pendiente o completada.

### 3.9 · Enseñar cómo usar el menú principal
**Epic:** Acompañamiento después del onboarding  ·  **Prioridad:** Media  ·  **Estado:** Pendiente

- **Estado actual:** Después del onboarding aparecen varios módulos en el menú lateral, pero una usuaria nueva puede no saber qué función cumple cada uno ni cuándo debería entrar a cada sección.
- **Experiencia deseada:** La primera llegada al dashboard debe orientar brevemente sobre la estructura de Finance BFF y mostrar que el menú lateral es el lugar desde donde administrará cada parte de su vida financiera.
- **Historia de usuario:** Como una mujer que acaba de terminar el onboarding y ve por primera vez Mis finanzas, Mis gastos, Cajitas, Bolsitas de ahorro y Deudas, quiero entender para qué sirve cada sección y cuándo debo usarla, para moverme con seguridad sin tener que descubrir sola cómo funciona la plataforma.
- **Lineamientos de implementación:** Incluir una guía inicial breve en la primera entrada al dashboard que presente el menú lateral y explique el propósito de cada módulo en una frase. Evitar un tour largo. Permitir omitirlo y no repetirlo automáticamente después de completarlo.
- **Consideraciones de UX:** La orientación debe ser contextual y ligera. No bloquear innecesariamente el uso del dashboard ni convertir la primera entrada en otro onboarding extenso.
- **Objetivo de negocio:** Reducir confusión inicial y acelerar la adopción de los módulos principales.
- **Resultado esperado:** La usuaria entiende dónde registrar gastos, gestionar cajitas, organizar ahorro y revisar deudas.
- **Criterio de éxito:** La guía aparece en la primera entrada, puede omitirse y no vuelve a mostrarse una vez completada.

### 3.10 · Simplificar la selección de país
**Epic:** Onboarding Happy Path  ·  **Prioridad:** Media  ·  **Estado:** Completo

- **Estado actual:** El paso de país presenta demasiado texto y puede resultar abrumador.
- **Experiencia deseada:** Seleccionar el país de forma rápida mediante una lista desplegable con búsqueda.
- **Historia de usuario:** Como una usuaria que está comenzando su configuración, quiero encontrar mi país sin leer una lista extensa, para continuar rápidamente.
- **Lineamientos de implementación:** Reemplazar la presentación extensa por un selector desplegable con búsqueda por nombre. Permitir escribir para filtrar países y seleccionar una opción válida. Conservar la selección al regresar.
- **Consideraciones de UX:** Mostrar una instrucción breve y evitar sobrecargar la pantalla.
- **Objetivo de negocio:** Reducir fricción en el registro.
- **Resultado esperado:** La usuaria encuentra y selecciona su país fácilmente.
- **Criterio de éxito:** Se puede buscar, seleccionar y conservar un país válido.

### 3.11 · Permitir configurar varias monedas
**Epic:** Onboarding Happy Path  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** El paso de moneda permite seleccionar una sola moneda, aunque la usuaria puede manejar dinero en varias.
- **Experiencia deseada:** Permitir registrar una moneda principal y otras monedas utilizadas.
- **Historia de usuario:** Como una usuaria que recibe, gasta o ahorra dinero en distintas monedas, quiero configurar todas las que utilizo, para representar mi realidad financiera sin limitarme a una sola.
- **Lineamientos de implementación:** Permitir seleccionar varias monedas y distinguir una principal. Conservar la configuración para los registros posteriores. Definir cómo se mostrarán los montos por moneda y evitar sumarlos directamente sin una conversión explícita.
- **Consideraciones de UX:** No asumir que todos los valores comparten moneda. La configuración debe seguir siendo sencilla para quien utiliza solo una.
- **Objetivo de negocio:** Representar situaciones financieras reales y evitar cálculos engañosos.
- **Resultado esperado:** La usuaria puede configurar sus monedas y reconocer la moneda de cada monto.
- **Criterio de éxito:** Se pueden guardar varias monedas y una principal; los totales no mezclan monedas sin conversión definida.

### 3.12 · Eliminar guiones -Hyphens innecesarios de los textos
**Epic:** Onboarding Happy Path  ·  **Prioridad:** Media  ·  **Estado:** Completo

- **Estado actual:** Persisten guiones - hyphens utilizados como recurso de redacción en distintos textos de la experiencia.
- **Experiencia deseada:** Mantener una redacción natural, limpia y consistente con la voz de Finance BFF.
- **Historia de usuario:** Como una usuaria que interactúa con Amy, quiero leer mensajes fluidos y cercanos, para comprenderlos sin interrupciones visuales innecesarias que se vean generados por AI
- **Lineamientos de implementación:** Revisar exhaustivamente todos los textos del onboarding y del producto y eliminar los guiones usados como separadores de frases. Reescribir las oraciones cuando sea necesario. Conservar únicamente los guiones que tengan una función legítima, como signos matemáticos o parte de un dato.
- **Consideraciones de UX:** No eliminar signos necesarios para cálculos, fechas o información técnica. Evitar sustituciones mecánicas que deterioren la redacción.
- **Objetivo de negocio:** Mantener consistencia editorial y calidad percibida.
- **Resultado esperado:** Los mensajes se sienten naturales y coherentes con la marca.
- **Criterio de éxito:** La revisión editorial no encuentra guiones innecesarios en los textos visibles.

### 3.13 · Aclarar que los gastos fijos pueden completarse después
**Epic:** Onboarding Happy Path  ·  **Prioridad:** Media  ·  **Estado:** Completo

- **Estado actual:** Al registrar gastos fijos uno por uno, la usuaria puede sentir que debe recordar absolutamente todos antes de continuar.
- **Experiencia deseada:** Explicar que puede agregar o corregir gastos más adelante sin perder su progreso.
- **Historia de usuario:** Como una usuaria que está registrando sus gastos mensuales y puede olvidar alguno, quiero saber que podré agregarlo después, para avanzar sin sentir que debo tener toda la información perfecta.
- **Lineamientos de implementación:** Agregar una nota breve junto al formulario de gastos fijos indicando que podrá añadir o editar gastos posteriormente desde la aplicación. Mantener el acceso a la edición después del onboarding.
- **Consideraciones de UX:** El mensaje debe dar tranquilidad sin restar importancia a registrar información lo más completa posible.
- **Objetivo de negocio:** Reducir abandono y facilitar la actualización de datos.
- **Resultado esperado:** La usuaria continúa con confianza y sabe que puede completar sus gastos después.
- **Criterio de éxito:** La nota es visible y existe una ruta funcional para agregar o editar gastos posteriormente.

### 3.14 · Proponer la próxima fecha válida para cajitas
**Epic:** Onboarding Happy Path  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** Al crear una cajita, el selector puede permitir una fecha de pago que ya pasó, como junio de 2026 cuando se está configurando en septiembre de 2026.
- **Experiencia deseada:** Proponer automáticamente la próxima fecha futura correspondiente al gasto.
- **Historia de usuario:** Como una usuaria que está preparando gastos que se repiten, quiero que Amy me sugiera la próxima fecha de pago válida, para no crear una cajita con una fecha vencida.
- **Lineamientos de implementación:** Al seleccionar un mes o fecha de vencimiento, calcular la próxima ocurrencia futura según la periodicidad del gasto y la fecha actual. Si el gasto es anual y junio de este año ya pasó, proponer junio del año siguiente. Permitir ajustar la fecha y recalcular la reserva correspondiente.
- **Consideraciones de UX:** No asumir que todos los gastos son anuales. Mostrar claramente mes y año y evitar fechas pasadas por defecto.
- **Objetivo de negocio:** Evitar errores de planificación y mejorar la precisión de las reservas.
- **Resultado esperado:** La cajita se configura con una fecha futura coherente con su periodicidad.
- **Criterio de éxito:** Un gasto anual cuyo mes ya pasó propone el año siguiente y recalcula correctamente su reserva.

### 3.15 · Calcular la recomendación después de definir importancia en la creación de bolsitas de ahorro
**Epic:** Onboarding Happy Path  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** La recomendación de Amy aparece antes de que la usuaria seleccione la importancia de la bolsita.
- **Experiencia deseada:** Primero conocer la prioridad de la usuaria y después calcular una recomendación personalizada.
- **Historia de usuario:** Como una usuaria que está creando una bolsita de ahorro, quiero indicar qué tan importante es para mí antes de recibir una recomendación, para sentir que Amy tiene en cuenta mis prioridades.
- **Lineamientos de implementación:** Ubicar las estrellas de importancia antes del bloque de recomendación. Inicializar el monto recomendado en $0 hasta que se seleccione una importancia. Recalcular la recomendación cuando cambie la prioridad y permitir aceptar o editar el monto.
- **Consideraciones de UX:** No presentar una recomendación como personalizada antes de contar con la información necesaria. Explicar brevemente que la importancia ayuda a Amy a proponer un monto.
- **Objetivo de negocio:** Mejorar la relevancia y confianza en las recomendaciones.
- **Resultado esperado:** La usuaria entiende que su prioridad influye en el monto sugerido.
- **Criterio de éxito:** La recomendación inicia en $0, se calcula después de seleccionar importancia y se actualiza al cambiarla.

### 3.16 · Hacer evidente la acción Agregar bolsita
**Epic:** Onboarding Happy Path  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** Después de seleccionar o editar el monto, no resulta suficientemente claro que debe pulsarse Agregar bolsita para incorporarla al reparto.
- **Experiencia deseada:** La acción de agregar debe destacarse y dejar claro cuándo el monto ya forma parte del ahorro distribuido.
- **Historia de usuario:** Como una usuaria que está creando sus bolsitas, quiero identificar fácilmente cómo confirmar cada una, para saber que quedó agregada y que el dinero restante se actualizó.
- **Lineamientos de implementación:** Dar mayor jerarquía visual al botón Agregar bolsita cuando los datos estén completos. Utilizar un estado de color claramente diferenciado dentro de la paleta de marca. Al agregar, mostrar la bolsita en la lista y actualizar inmediatamente los totales.
- **Consideraciones de UX:** Distinguir visualmente entre editar o aceptar una recomendación y confirmar la creación de la bolsita. No depender únicamente del color para comunicar el estado.
- **Objetivo de negocio:** Reducir errores y facilitar la finalización del reparto.
- **Resultado esperado:** La usuaria identifica la acción de confirmación y ve el resultado inmediatamente.
- **Criterio de éxito:** El botón se distingue claramente y al pulsarlo se agrega la bolsita y se actualiza el saldo.

### 3.17 · Mantener visible el resumen del reparto de ahorro
**Epic:** Onboarding Happy Path  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** Al agregar varias bolsitas, el resumen de dinero repartido y restante se desplaza hacia arriba y deja de estar visible.
- **Experiencia deseada:** Mantener siempre a la vista cuánto ahorro mensual se ha asignado y cuánto queda disponible.
- **Historia de usuario:** Como una usuaria que está distribuyendo su ahorro entre varias bolsitas, quiero consultar el total asignado y el saldo restante sin tener que desplazarme hacia arriba, para tomar decisiones con claridad mientras agrego nuevas bolsitas.
- **Lineamientos de implementación:** Implementar un resumen persistente o sticky que muestre ahorro mensual total, monto ya repartido y saldo restante. Actualizarlo al agregar, editar o eliminar bolsitas. Adaptar su ubicación a desktop y móvil sin tapar campos ni acciones.
- **Consideraciones de UX:** El resumen debe ser compacto, legible y mantenerse visible durante la interacción. Conservar el estado positivo cuando el reparto llegue a $0.
- **Objetivo de negocio:** Mejorar el control del presupuesto y reducir fricción durante la creación.
- **Resultado esperado:** La usuaria conoce el estado del reparto en todo momento.
- **Criterio de éxito:** El resumen permanece visible durante el desplazamiento y sus tres valores se actualizan correctamente.

### 4.1 · Confirmar transferencias de cada cajita por separado
**Epic:** Dashboard  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** El dashboard permite marcar como realizada la transferencia mensual del total de cajitas, pero no distinguir cuáles se han financiado realmente.
- **Experiencia deseada:** Permitir registrar el cumplimiento de cada cajita individualmente y mostrar el avance del mes.
- **Historia de usuario:** Como una usuaria que separa dinero para diferentes gastos en su banco, quiero marcar cada cajita cuando realice su transferencia, para llevar un control real de cuáles ya financié y cuáles siguen pendientes.
- **Lineamientos de implementación:** Agregar un check individual de transferencia mensual a cada cajita. Mostrar su monto recomendado y estado del mes. Mantener un resumen del total completado y pendiente. Permitir corregir una confirmación accidental y conservar el historial por mes.
- **Consideraciones de UX:** El check debe representar una acción real de la usuaria, no una transferencia ejecutada por Amy. Evitar que confirmar una cajita marque automáticamente las demás.
- **Objetivo de negocio:** Facilitar el seguimiento de reservas y reforzar el hábito de separar dinero.
- **Resultado esperado:** La usuaria sabe qué cajitas ya financió y cuáles faltan.
- **Criterio de éxito:** Cada cajita puede confirmarse independientemente y el resumen refleja únicamente las confirmaciones correspondientes.

### 4.2 · Guiar y confirmar los abonos de cada bolsita
**Epic:** Dashboard  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** El módulo de bolsitas muestra el plan de ahorro, pero no explica suficientemente que el dinero debe separarse en el banco ni permite registrar claramente el cumplimiento de cada aporte mensual.
- **Experiencia deseada:** Conectar cada bolsita con una acción bancaria concreta y permitir confirmar sus aportes.
- **Historia de usuario:** Como una usuaria que ya creó sus bolsitas de ahorro, quiero saber cuánto debo separar en mi banco y marcar cada aporte cuando lo realice, para convertir mi plan en un hábito y mantener un seguimiento confiable.
- **Lineamientos de implementación:** Incluir instrucciones visibles para crear o utilizar bolsillos, sobres o cuentas de ahorro en el banco. Mostrar el aporte mensual de cada bolsita y permitir marcarlo como realizado individualmente. Conservar el estado por mes y permitir corregir confirmaciones. Vincular las acciones pendientes con el dashboard principal.
- **Consideraciones de UX:** Diferenciar claramente entre el monto planeado, el dinero efectivamente ahorrado y una transferencia confirmada. No afirmar que Amy mueve dinero automáticamente.
- **Objetivo de negocio:** Promover hábitos de ahorro y conectar la planificación con acciones reales.
- **Resultado esperado:** La usuaria sabe qué hacer en su banco y puede registrar cada aporte realizado.
- **Criterio de éxito:** Cada bolsita permite confirmar su aporte mensual y muestra correctamente su estado pendiente o completado.

### 4.3 · Actualizar el saldo disponible al confirmar movimientos
**Epic:** Dashboard  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** Al marcar como realizados los aportes de cajitas o bolsitas, el dinero disponible del dashboard en la página principal no se actualiza de forma coherente.
- **Experiencia deseada:** El saldo debe reflejar los movimientos reales confirmados sin descontar dos veces el dinero que ya estaba reservado en el presupuesto.
- **Historia de usuario:** Como una usuaria que confirma que ya separó dinero para sus cajitas o bolsitas, quiero que el dashboard refleje correctamente ese movimiento, para confiar en el saldo disponible y saber cuánto puedo gastar realmente.
- **Lineamientos de implementación:** Revisar y corregir la lógica de actualización del saldo disponible al confirmar, editar o revertir aportes. Definir de forma explícita la diferencia entre saldo presupuestado, dinero reservado y dinero efectivamente transferido. Si las reservas ya fueron descontadas al calcular el disponible, una confirmación no debe volver a descontarlas. Mantener consistencia entre dashboard y módulos.
- **Consideraciones de UX:** Mostrar con claridad qué representa cada saldo. Evitar cambios inesperados y explicar el efecto de una confirmación cuando corresponda.
- **Objetivo de negocio:** Garantizar confianza en los cálculos y evitar decisiones basadas en saldos incorrectos.
- **Resultado esperado:** El dashboard y los módulos muestran cifras coherentes con el presupuesto y los movimientos confirmados.
- **Criterio de éxito:** Confirmar o revertir un aporte actualiza los estados y saldos correspondientes sin duplicar descuentos ni alterar indebidamente el disponible.

### 4.4 · Registrar el pago de gastos fijos y reflejarlo en el saldo
**Epic:** Dashboard  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** Mis gastos muestra los gastos fijos registrados, pero no permite identificar fácilmente cuáles ya fueron pagados durante el mes ni refleja ese seguimiento en el dashboard principal.
- **Experiencia deseada:** Permitir marcar cada gasto fijo como pagado y mantener un saldo disponible coherente con los pagos y compromisos del mes.
- **Historia de usuario:** Como una usuaria que paga sus gastos fijos en diferentes momentos del mes, quiero marcar cada uno cuando lo pague y ver cuáles siguen pendientes, para organizar mis pagos y conocer cuánto dinero tengo realmente disponible.
- **Lineamientos de implementación:** Agregar un check individual de pago a cada gasto fijo en Mis gastos. Mostrar estado pagado o pendiente por mes y permitir corregirlo. Reflejar el cumplimiento en Mis finanzas y actualizar los saldos pertinentes. Definir la lógica para que un gasto fijo ya descontado del presupuesto no vuelva a descontarse al marcarlo como pagado.
- **Consideraciones de UX:** Distinguir entre gasto presupuestado y pago realizado. Mantener visibles los pendientes sin presentar un gasto pagado como una nueva salida adicional de dinero.
- **Objetivo de negocio:** Facilitar el control de pagos y mejorar la confiabilidad del dashboard.
- **Resultado esperado:** La usuaria identifica qué gastos ya pagó y cuánto dinero queda disponible sin duplicaciones.
- **Criterio de éxito:** Cada gasto fijo puede marcarse individualmente y el dashboard refleja el estado y los saldos correctos sin doble descuento.

### 4.5 · Convertir la metodología de deuda en un plan de acción mensual
**Epic:** Dashboard | Mis deudas  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** El módulo Mis deudas muestra la metodología recomendada, el orden sugerido y los saldos de las deudas, pero la usuaria todavía tiene que interpretar por sí sola qué debería hacer durante el mes. La información explica el enfoque, pero no termina de traducirlo en acciones concretas y priorizadas.
- **Experiencia deseada:** Al entrar a Mis deudas, la usuaria debe recibir un plan simple y accionable para ese mes. Amy debe indicarle qué pagos mínimos o cuotas debe cubrir en todas sus deudas, cuál es la deuda prioritaria según la metodología elegida y qué hacer si tiene dinero adicional disponible para acelerar su progreso.
- **Historia de usuario:** Como una mujer que tiene más de una deuda y ya recibió una metodología personalizada de Amy, quiero saber exactamente qué debo hacer este mes con cada deuda, para aplicar la estrategia sin tener que interpretar sola cómo funciona.
- **Lineamientos de implementación:** Incorporar un bloque visible llamado, por ejemplo, 'Tu plan de este mes'. Debe listar primero las obligaciones que deben mantenerse al día y después destacar la deuda prioritaria según el método seleccionado. Si existe capacidad para un pago adicional, explicar que ese dinero debe dirigirse a la deuda prioritaria. Cada acción debe enlazar con el registro del pago correspondiente. El plan debe actualizarse cuando cambien los saldos, se agregue una deuda o una deuda se liquide.
- **Consideraciones de UX:** El lenguaje debe ser directo, corto y orientado a la acción. Evitar repetir una explicación extensa de la metodología. La usuaria ya sabe qué método tiene; aquí necesita saber qué hacer ahora. Diferenciar visualmente 'mantener al día' de 'acelerar esta deuda'.
- **Objetivo de negocio:** Convertir la metodología elegida en comportamiento financiero real y aumentar la utilidad recurrente de Amy.
- **Resultado esperado:** La usuaria entiende qué debe pagar, qué deuda tiene prioridad y dónde dirigir cualquier dinero adicional.
- **Criterio de éxito:** Al entrar a Mis deudas existe un plan mensual claro, alineado con la metodología guardada, y las acciones cambian correctamente cuando cambian los datos de deuda.

### 4.6 · Diferenciar cuota normal y abono adicional a capital
**Epic:** Dashboard | Mis deudas  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** Actualmente la acción 'Registrar pago' no explica claramente si la usuaria está registrando la cuota mensual requerida, un pago adicional para reducir la deuda o ambos. Esto puede generar confusión sobre el efecto real del pago en el saldo.
- **Experiencia deseada:** Al registrar un movimiento, Amy debe ayudar a la usuaria a distinguir entre cumplir con su cuota habitual y realizar un abono adicional dirigido a capital. La explicación debe ser breve y educativa, dejando claro que una cuota normal puede incluir intereses, capital y otros cargos, mientras que un abono adicional a capital busca reducir directamente el saldo sujeto a las condiciones de la entidad financiera.
- **Historia de usuario:** Como una mujer que quiere avanzar con sus deudas pero no domina los términos financieros, quiero entender la diferencia entre pagar mi cuota y hacer un abono adicional a capital, para saber qué acción estoy registrando y cómo puede impactar mi deuda.
- **Lineamientos de implementación:** Al seleccionar Registrar pago, solicitar el tipo de movimiento: 'Pago de mi cuota' o 'Abono adicional a capital'. Incluir una explicación contextual breve para cada opción. No asumir que el valor completo de una cuota reduce el capital. Cuando la usuaria registre un abono a capital, aclarar que debe verificar en su banco o entidad financiera que el pago haya sido aplicado a capital y bajo qué condiciones. Permitir registrar ambos movimientos en el mismo mes.
- **Consideraciones de UX:** La educación debe aparecer en el momento de la decisión, no como una clase aparte. Usar lenguaje cotidiano. Evitar prometer una reducción específica de intereses o plazo porque depende de las condiciones del crédito.
- **Objetivo de negocio:** Mejorar la educación financiera dentro de la experiencia y reducir registros incorrectos.
- **Resultado esperado:** La usuaria sabe qué tipo de pago está registrando y comprende que ambos movimientos tienen funciones diferentes.
- **Criterio de éxito:** El flujo obliga a identificar el tipo de pago, muestra la explicación correspondiente y no descuenta automáticamente toda cuota del saldo de capital.

### 4.7 · Confirmar individualmente los pagos realizados en el banco
**Epic:** Dashboard | Mis deudas  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** El módulo permite registrar pagos, pero no existe una rutina visual suficientemente clara para confirmar qué obligaciones del mes ya fueron pagadas en el banco y cuáles siguen pendientes.
- **Experiencia deseada:** Cada deuda debe funcionar como una tarea mensual. La usuaria debe poder marcar cuando realizó el pago correspondiente en su banco y ver de inmediato qué deudas ya están al día y cuáles todavía requieren atención.
- **Historia de usuario:** Como una mujer que paga varias deudas en fechas diferentes, quiero marcar cada pago cuando lo haga en mi banco, para saber cuáles obligaciones ya cumplí este mes y cuáles todavía me faltan.
- **Lineamientos de implementación:** Agregar un check mensual individual por deuda asociado al pago de la cuota. Mostrar estados claros como 'Pendiente este mes' y 'Pago de este mes registrado'. Si la usuaria registra el pago desde el flujo de Registrar pago, actualizar automáticamente el check. Permitir corregir una marcación accidental y conservar el historial mensual.
- **Consideraciones de UX:** El check debe representar una confirmación de la usuaria, no una verificación bancaria automática. Evitar que marcar una deuda afecte a las demás. Mostrar el progreso del mes de forma positiva, por ejemplo '1 de 2 pagos del mes listos'.
- **Objetivo de negocio:** Crear una rutina mensual de seguimiento y reducir pagos olvidados.
- **Resultado esperado:** La usuaria puede ver de un vistazo qué pagos ya realizó y qué obligaciones siguen pendientes.
- **Criterio de éxito:** Cada deuda puede marcarse de manera independiente, el estado se conserva por mes y el resumen mensual coincide con los pagos registrados.

### 4.8 · Pedir el saldo real de la deuda después de registrar pagos
**Epic:** Dashboard | Mis deudas  ·  **Prioridad:** Alta  ·  **Estado:** Pendiente

- **Estado actual:** El dashboard muestra saldos y meses estimados, pero después de registrar una cuota la experiencia no deja suficientemente claro que Amy necesita conocer el saldo real que aparece en el banco o entidad financiera. Una cuota puede incluir intereses, capital y otros cargos, por lo que no es correcto asumir que todo el valor pagado reduce el capital.
- **Experiencia deseada:** Después de registrar un pago, Amy debe pedir de forma explícita y sencilla el saldo actual que la usuaria ve en su banco, extracto o entidad financiera. Ese dato debe convertirse en la referencia para actualizar el progreso de la deuda.
- **Historia de usuario:** Como una mujer que acaba de pagar una cuota de mi deuda, quiero que Amy me pida el saldo actualizado que veo en mi banco o entidad financiera, para que mi progreso refleje lo que realmente debo y no un cálculo estimado incorrectamente.
- **Lineamientos de implementación:** Después de registrar una cuota, mostrar un paso visible con una instrucción literal como 'Ahora cuéntame cuánto debes hoy según tu banco'. Permitir ingresar el saldo actualizado y explicar brevemente dónde encontrarlo. No restar automáticamente el valor completo de la cuota al capital. Si la usuaria no tiene el dato en ese momento, permitir continuar y dejar una tarea pendiente para actualizarlo después. Para abonos adicionales a capital, mantener igualmente la posibilidad de confirmar el saldo real.
- **Consideraciones de UX:** La usuaria no debe tener que calcular capital, intereses ni amortización. Amy solo debe pedir un dato fácil de encontrar: el saldo actual que muestra la entidad financiera. Evitar lenguaje técnico y explicar por qué se solicita sin generar fricción.
- **Objetivo de negocio:** Proteger la confiabilidad de los cálculos y del progreso mostrado en Finance BFF.
- **Resultado esperado:** El saldo de la deuda se mantiene alineado con la información real de la entidad financiera y la usuaria entiende exactamente qué dato debe actualizar.
- **Criterio de éxito:** Después de registrar un pago, Amy solicita explícitamente el saldo que aparece en el banco o entidad financiera; el saldo no disminuye automáticamente por el valor total de la cuota y puede quedar pendiente si la usuaria aún no tiene el dato.

### 4.9 · Mostrar progreso y siguiente objetivo de salida de deudas
**Epic:** Dashboard | Mis deudas  ·  **Prioridad:** Alta  ·  **Estado:** Completo

- **Estado actual:** Mis deudas muestra cuánto se debe actualmente, pero la experiencia se siente principalmente como una lista de obligaciones. La usuaria tiene poca visibilidad sobre cuánto ha avanzado desde que empezó y cuál es el siguiente hito dentro de su estrategia.
- **Experiencia deseada:** El módulo debe hacer visible el progreso para que pagar deudas se sienta como un proceso con avances concretos. Amy debe mostrar cuánto ha disminuido la deuda, cuál es la deuda prioritaria actual y qué hito viene después.
- **Historia de usuario:** Como una mujer que está trabajando mes a mes para salir de deudas, quiero ver cuánto he avanzado y cuál es mi próximo objetivo, para sentir que mis pagos están produciendo progreso y mantenerme motivada.
- **Lineamientos de implementación:** Incorporar un resumen de progreso basado en saldos reales registrados: saldo inicial, saldo actual y reducción acumulada. Destacar la deuda prioritaria y un siguiente objetivo concreto, por ejemplo completar el pago del mes, realizar un abono adicional o liquidar la deuda prioritaria. Cuando una deuda llegue a $0, mostrar una celebración y actualizar automáticamente cuál pasa a ser la siguiente prioridad según la metodología.
- **Consideraciones de UX:** Evitar mensajes que generen culpa si el progreso es lento. Celebrar constancia y cumplimiento, no únicamente grandes pagos. No mostrar fechas exactas de liquidación si no hay datos suficientes para estimarlas de manera responsable.
- **Objetivo de negocio:** Aumentar motivación, retención y continuidad en el plan de deuda.
- **Resultado esperado:** La usuaria percibe avance, entiende cuál es su siguiente meta y mantiene claridad sobre la estrategia.
- **Criterio de éxito:** El módulo muestra progreso basado en saldos reales, identifica la prioridad vigente y actualiza el siguiente objetivo al cambiar o liquidar una deuda.

### 4.10 · Agregar Ingresos al menú lateral
**Epic:** Dashboard  ·  **Prioridad:** Alta  ·  **Estado:** Pendiente

- **Estado actual:** Mis finanzas permite visualizar y editar los ingresos, pero el menú lateral no tiene una sección propia de Ingresos. Esto rompe la lógica de navegación porque otros componentes del dashboard sí cuentan con un módulo independiente.
- **Experiencia deseada:** La usuaria debe encontrar en el menú lateral cada componente que construye su panorama financiero, incluyendo Ingresos, y poder consultarlo y editarlo desde un lugar dedicado.
- **Historia de usuario:** Como una usuaria que quiere mantener mi información financiera actualizada, quiero tener una sección de Ingresos en el menú lateral, para revisar y editar mis fuentes de ingreso sin depender del dashboard principal.
- **Lineamientos de implementación:** Agregar 'Ingresos' al menú lateral y crear una vista dedicada que muestre las fuentes registradas, montos y total de ingresos. Permitir agregar, editar y eliminar ingresos desde allí. Los cambios deben reflejarse inmediatamente en Mis finanzas y en todos los cálculos que dependan de ingresos.
- **Consideraciones de UX:** Mantener la misma lógica visual y de navegación de los demás módulos. Evitar duplicar comportamientos diferentes entre editar ingresos desde Mis finanzas y desde la nueva sección.
- **Objetivo de negocio:** Hacer la arquitectura de información más consistente y facilitar el mantenimiento de datos.
- **Resultado esperado:** La usuaria puede administrar sus ingresos desde una sección claramente identificable y los cambios se reflejan en todo Finance BFF.
- **Criterio de éxito:** Existe Ingresos en el menú lateral, permite CRUD de fuentes de ingreso y cualquier cambio actualiza correctamente los cálculos relacionados.

### 4.11 · Corregir el campo nombre al agregar gastos fijos
**Epic:** Dashboard | Mis gastos  ·  **Prioridad:** Alta  ·  **Estado:** Pendiente

- **Estado actual:** Durante el test del 15 de septiembre, al intentar agregar un nuevo gasto fijo desde Mis gastos, el campo de nombre no permite escribir, impidiendo completar el registro.
- **Experiencia deseada:** La usuaria debe poder agregar un gasto fijo nuevo sin bloqueos, diligenciando normalmente su nombre y los demás datos requeridos.
- **Historia de usuario:** Como una usuaria que identificó un gasto fijo que no registré durante el onboarding, quiero poder escribir su nombre y agregarlo desde Mis gastos, para mantener mi información actualizada.
- **Lineamientos de implementación:** Corregir el bug del campo Nombre en el formulario de nuevos gastos fijos. Verificar entrada por teclado, foco, edición, validaciones y guardado. Probar también agregar más de un gasto consecutivamente y editar un gasto ya creado.
- **Consideraciones de UX:** El campo debe comportarse igual que los demás inputs de texto y conservar las reglas globales de guardado y formato del producto.
- **Objetivo de negocio:** Evitar bloqueos funcionales y permitir que la información financiera permanezca completa.
- **Resultado esperado:** La usuaria puede crear nuevos gastos fijos desde Mis gastos sin errores.
- **Criterio de éxito:** El campo Nombre acepta texto, el gasto puede guardarse correctamente y el flujo funciona en los dispositivos soportados.

### 4.12 · Aclarar que el bolsillo o sobre de cada cajita se crea una sola vez
**Epic:** Dashboard | Mis cajitas  ·  **Prioridad:** Alta  ·  **Estado:** Pendiente

- **Estado actual:** El texto actual indica 'Cada mes, crea un bolsillo o sobre en tu banco por cada cajita', lo que puede hacer pensar que la usuaria debe crear un nuevo bolsillo todos los meses.
- **Experiencia deseada:** La experiencia debe explicar que la estructura se crea una sola vez y que, después, cada mes la usuaria únicamente agrega el monto correspondiente a ese mismo bolsillo o sobre.
- **Historia de usuario:** Como una usuaria que está llevando mis cajitas a mi banco o a efectivo, quiero entender que debo crear cada bolsillo o sobre una sola vez y luego alimentarlo mensualmente, para no repetir una tarea innecesaria.
- **Lineamientos de implementación:** Reescribir la instrucción bancaria. Explicar en dos pasos: 1) una sola vez, crear un bolsillo, cuenta, sobre digital o sobre físico por cada cajita; 2) cada mes, adicionar allí el monto recomendado por Amy. Usar ejemplos de nombres solo como apoyo.
- **Consideraciones de UX:** Diferenciar visualmente la configuración inicial de la rutina mensual. No asumir que todas las usuarias utilizan bancos con función de bolsillos; permitir el equivalente en efectivo.
- **Objetivo de negocio:** Conectar correctamente el plan de Amy con la acción real y evitar confusión operativa.
- **Resultado esperado:** La usuaria entiende qué debe configurar una sola vez y qué acción debe repetir cada mes.
- **Criterio de éxito:** El texto ya no indica crear un bolsillo cada mes y distingue claramente configuración inicial de aporte mensual.

### 4.13 · Confirmar una sola vez la creación de las cajitas en banco o efectivo
**Epic:** Dashboard | Mis cajitas  ·  **Prioridad:** Alta  ·  **Estado:** Pendiente

- **Estado actual:** Finance BFF guía a la usuaria para separar dinero, pero no registra si ya creó en su banco o en efectivo la estructura real donde guardará cada cajita.
- **Experiencia deseada:** La usuaria debe poder confirmar una única vez que ya creó el bolsillo, cuenta o sobre correspondiente a cada cajita. Después de esa confirmación, la tarea de configuración no debe reaparecer mensualmente.
- **Historia de usuario:** Como una usuaria que ya creó el espacio real para una cajita, quiero marcar que esa configuración ya está lista, para que Amy recuerde que ya hice ese paso y solo me pida los aportes mensuales.
- **Lineamientos de implementación:** Agregar un check de configuración inicial por cajita, con opciones coherentes para banco o efectivo. Guardar este estado de forma persistente durante la vida de la cajita. Separarlo del check mensual de transferencia o aporte. Si se crea una cajita nueva en el futuro, mostrar la tarea únicamente para esa nueva cajita.
- **Consideraciones de UX:** Usar lenguaje literal como 'Ya creé esta cajita en mi banco o en un sobre'. No confundir este check único con el cumplimiento mensual.
- **Objetivo de negocio:** Reducir tareas repetitivas y ayudar a convertir el plan digital en una estructura real.
- **Resultado esperado:** Amy sabe qué cajitas ya existen fuera de la plataforma y solo recuerda a la usuaria los aportes que correspondan.
- **Criterio de éxito:** Cada cajita tiene un estado persistente de configuración inicial independiente del check mensual y este no se reinicia cada mes.

### 4.14 · Confirmar una sola vez la creación de las bolsitas de ahorro en banco o efectivo
**Epic:** Dashboard | Mis ahorros  ·  **Prioridad:** Alta  ·  **Estado:** Pendiente

- **Estado actual:** Las bolsitas representan propósitos de ahorro dentro de Finance BFF, pero no existe un estado claro que indique si la usuaria ya creó el espacio equivalente en su banco o en efectivo.
- **Experiencia deseada:** La usuaria debe poder confirmar una única vez que creó el bolsillo, cuenta o sobre donde guardará el dinero de cada bolsita. Luego Amy debe concentrarse en los aportes mensuales, no en repetir la configuración.
- **Historia de usuario:** Como una usuaria que ya creó en mi banco o en efectivo el espacio para una bolsita de ahorro, quiero marcar que esa configuración ya está lista, para que Amy recuerde ese avance y me acompañe únicamente con los aportes siguientes.
- **Lineamientos de implementación:** Agregar un check de configuración inicial por bolsita. Permitir indicar que se maneja mediante banco o efectivo si aporta valor a la experiencia. Persistir el estado mientras exista la bolsita y mantenerlo separado de los checks de aportes mensuales. Las nuevas bolsitas deben generar su propia tarea inicial.
- **Consideraciones de UX:** Usar el mismo patrón visual y conceptual definido para Cajitas para evitar que la usuaria tenga que aprender dos comportamientos distintos.
- **Objetivo de negocio:** Conectar las metas de ahorro con acciones reales y reducir repetición innecesaria.
- **Resultado esperado:** La usuaria distingue entre crear la bolsita una vez y alimentarla periódicamente.
- **Criterio de éxito:** Cada bolsita conserva un estado de configuración inicial independiente de los aportes mensuales y la experiencia es consistente con Cajitas.

### 4.15 · Mover la explicación de qué son las cajitas al inicio
**Epic:** Dashboard | Mis cajitas  ·  **Prioridad:** Media  ·  **Estado:** Pendiente

- **Estado actual:** La explicación de qué son las Cajitas aparece después de otros contenidos, por lo que una usuaria puede empezar a interactuar con la sección antes de entender su propósito.
- **Experiencia deseada:** Al entrar a Mis cajitas, la usuaria debe comprender primero qué son, para qué sirven y después qué debe hacer con ellas.
- **Historia de usuario:** Como una usuaria que entra a Mis cajitas, quiero entender desde el inicio qué significa este concepto, para interpretar correctamente los montos y acciones que aparecen después.
- **Lineamientos de implementación:** Reordenar la jerarquía de la página para ubicar '¿Qué son las Cajitas?' al inicio del contenido principal. Después mantener una secuencia consistente: qué son, cómo funcionan, qué debes hacer en tu banco o con efectivo y, finalmente, gestión de las cajitas.
- **Consideraciones de UX:** La explicación inicial debe ser breve y escaneable. No aumentar innecesariamente la longitud de la página.
- **Objetivo de negocio:** Reducir esfuerzo cognitivo y mejorar la comprensión del módulo.
- **Resultado esperado:** La usuaria entiende el concepto antes de empezar a gestionar cajitas.
- **Criterio de éxito:** La definición aparece antes de instrucciones y controles de gestión y la jerarquía de lectura sigue un orden lógico.

### 4.16 · Unificar la estructura de Bolsitas con la de Cajitas
**Epic:** Dashboard | Mis ahorros  ·  **Prioridad:** Media  ·  **Estado:** Pendiente

- **Estado actual:** Mis cajitas y Mis ahorros presentan información relacionada con conceptos similares, pero el orden de definiciones, títulos e instrucciones no sigue siempre el mismo patrón, obligando a la usuaria a volver a buscar dónde está cada tipo de información.
- **Experiencia deseada:** Los módulos deben compartir una arquitectura visual predecible. Si la definición, funcionamiento e instrucciones bancarias aparecen en determinadas posiciones en Cajitas, Bolsitas debe respetar el mismo orden y jerarquía.
- **Historia de usuario:** Como una usuaria que ya aprendió a usar Cajitas, quiero encontrar la información de Bolsitas organizada de la misma manera, para moverme por Amy sin tener que aprender nuevamente dónde está cada cosa.
- **Lineamientos de implementación:** Definir y aplicar un patrón común para ambos módulos: título del módulo, qué es, cómo funciona, qué debes hacer en tu banco o con efectivo y área de gestión. Alinear ubicación, jerarquía de títulos, componentes informativos y lenguaje cuando tengan funciones equivalentes.
- **Consideraciones de UX:** La consistencia debe reducir esfuerzo cognitivo sin forzar que contenidos diferentes se vean idénticos. Reutilizar patrones, no duplicar información innecesaria.
- **Objetivo de negocio:** Mejorar la usabilidad y crear un sistema de diseño más consistente y escalable.
- **Resultado esperado:** La usuaria reconoce inmediatamente dónde encontrar explicación, funcionamiento e instrucciones en ambos módulos.
- **Criterio de éxito:** Cajitas y Bolsitas comparten el mismo orden conceptual y patrones visuales equivalentes para contenidos equivalentes.

### 4.17 · Limitar nuevas bolsitas al dinero realmente disponible para ahorrar
**Epic:** Dashboard | Mis bolsitas  ·  **Prioridad:** Alta  ·  **Estado:** Pendiente

- **Estado actual:** Al crear una nueva bolsita, el sistema puede aceptar un aporte mensual superior a la capacidad disponible de la usuaria. En la prueba fue posible registrar una bolsita de $11.000.000 aun teniendo ingresos de $10.000.000.
- **Experiencia deseada:** Antes de crear o modificar una bolsita, Amy debe mostrar cuánto dinero sigue disponible para ahorro y evitar comprometer un monto mensual superior a esa capacidad.
- **Historia de usuario:** Como una usuaria que está creando nuevas bolsitas, quiero ver cuánto dinero todavía puedo destinar al ahorro y recibir un límite cuando intento superar esa capacidad, para no construir un plan imposible de cumplir.
- **Lineamientos de implementación:** Mostrar de forma persistente el monto disponible para nuevas bolsitas y actualizarlo al agregar, editar o eliminar una. Validar el aporte mensual antes de guardar. Si supera el disponible, bloquear la creación y explicar cuánto puede asignar como máximo. La validación debe utilizar la misma fuente de cálculo que el dashboard para evitar inconsistencias.
- **Consideraciones de UX:** El mensaje no debe regañar. Explicar de forma práctica: 'Para mantener tu plan equilibrado, te quedan $X disponibles para nuevas bolsitas'. Mantener visible el dato durante la creación.
- **Objetivo de negocio:** Evitar planes de ahorro financieramente inviables y aumentar la confianza en las recomendaciones.
- **Resultado esperado:** La usuaria solo puede comprometer ahorro dentro de su capacidad disponible y conoce su margen restante en todo momento.
- **Criterio de éxito:** No se puede guardar una bolsita cuyo aporte mensual exceda el disponible y el monto restante se actualiza correctamente con cada cambio.

### 4.18 · Validar nuevas cajitas contra la capacidad disponible
**Epic:** Dashboard | Mis cajitas  ·  **Prioridad:** Alta  ·  **Estado:** Pendiente

- **Estado actual:** Al agregar nuevas cajitas después del onboarding, el sistema necesita controlar el impacto de la nueva reserva mensual sobre el dinero disponible. Sin una validación, la usuaria puede crear compromisos que superen su capacidad financiera.
- **Experiencia deseada:** Antes de guardar una cajita nueva o modificar una existente, Amy debe mostrar el impacto de su cuota mensual y evitar que el conjunto de compromisos deje un plan financieramente inviable.
- **Historia de usuario:** Como una usuaria que quiere prepararme para nuevos gastos periódicos, quiero saber cuánto espacio tengo disponible antes de crear una cajita, para no comprometer más dinero del que realmente puedo reservar cada mes.
- **Lineamientos de implementación:** Calcular la cuota mensual de la nueva cajita antes de guardarla y mostrar cuánto dinero disponible quedaría después de incorporarla. Si la cuota supera la capacidad disponible definida por el plan, bloquear la creación o solicitar un ajuste del monto, fecha o configuración según corresponda. Actualizar el cálculo al editar o eliminar cajitas.
- **Consideraciones de UX:** Explicar el límite en términos de capacidad mensual, no del monto total del gasto. Mantener coherencia con la fórmula central y evitar mensajes alarmistas.
- **Objetivo de negocio:** Prevenir sobreasignación de dinero y mantener un plan mensual sostenible.
- **Resultado esperado:** La usuaria entiende el costo mensual de cada nueva cajita y no puede crear una reserva que haga inviable su plan.
- **Criterio de éxito:** La vista previa muestra el impacto mensual y el sistema impide guardar una cajita cuando su reserva excede la capacidad disponible.

### 4.19 · Explicar la metodología de salida de deudas con su autor
**Epic:** Dashboard | Mis deudas  ·  **Prioridad:** Alta  ·  **Estado:** Pendiente

- **Estado actual:** Mis deudas muestra el nombre de la metodología recomendada, pero la explicación no ofrece suficiente contexto sobre qué significa, por qué Amy la eligió y de dónde viene el enfoque.
- **Experiencia deseada:** La usuaria debe recibir una explicación breve y confiable de su metodología, incluyendo cómo funciona, por qué encaja con sus preferencias y la referencia al autor o fuente reconocida que corresponda.
- **Historia de usuario:** Como una mujer que recibió una estrategia para salir de deudas, quiero entender en pocas palabras cómo funciona y en qué enfoque reconocido se basa, para confiar en el plan que estoy siguiendo.
- **Lineamientos de implementación:** Crear un bloque compacto de 'Tu método' dentro de Mis deudas. Mostrar nombre del método, explicación de 2 a 3 frases, cómo se aplica en su caso y autor o fuente correspondiente. Para métodos inspirados en enfoques conocidos, atribuir con precisión y evitar presentar como autor único a quien no lo sea. Mantener un enlace o detalle ampliable si se necesita más contexto sin recargar la vista.
- **Consideraciones de UX:** Debe sentirse educativo y confiable, no académico. Evitar párrafos largos. La atribución debe ser factual y revisada antes de publicación.
- **Objetivo de negocio:** Aumentar comprensión y confianza en la estrategia de deuda recomendada por Amy.
- **Resultado esperado:** La usuaria entiende qué método está siguiendo, cómo aplicarlo y cuál es su fundamento.
- **Criterio de éxito:** Cada metodología tiene una explicación breve, aplicación práctica y atribución validada sin sobrecargar la pantalla.

### 4.20 · Hacer literal el check del pago mensual de la deuda
**Epic:** Dashboard | Mis deudas  ·  **Prioridad:** Alta  ·  **Estado:** Pendiente

- **Estado actual:** El estado inicial del check dice 'Pendiente este mes'. Aunque después cambia a 'Pago de este mes registrado', el texto inicial no deja claro que la usuaria debe hacer clic allí después de pagar la cuota en su banco.
- **Experiencia deseada:** La acción debe decir exactamente qué debe hacer la usuaria y cuándo debe marcarla, sin exigir que interprete un estado como una instrucción.
- **Historia de usuario:** Como una usuaria que acaba de pagar la cuota de una deuda en mi banco, quiero ver una instrucción literal para marcar ese pago en Amy, para saber exactamente cómo mantener mi seguimiento actualizado.
- **Lineamientos de implementación:** Reemplazar el texto accionable ambiguo por una instrucción como 'Haz clic aquí cuando pagues la cuota de este mes en tu banco' o una versión equivalente consistente con el diseño. Después de marcar, cambiar a un estado confirmado como 'Pago de este mes registrado'. Permitir deshacer si se marcó por error.
- **Consideraciones de UX:** No depender solo del color o del ícono de check. El texto previo debe describir la acción y el posterior debe confirmar el resultado.
- **Objetivo de negocio:** Mejorar la comprensión del seguimiento mensual y aumentar la calidad de los datos registrados.
- **Resultado esperado:** La usuaria entiende sin explicación adicional dónde confirmar el pago de su cuota.
- **Criterio de éxito:** El estado pendiente contiene una instrucción explícita, el clic cambia a confirmación y puede revertirse si fue accidental.
