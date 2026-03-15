// mockReadings.ts

export type RubricaLevel = {
    destacado: string;
    logrado: string;
    proceso: string;
    inicio: string;
};

export interface CompetencyActivity {
    id: string;
    type: 'oralidad' | 'lectura' | 'escritura' | 'steam' | 'cantidad' | 'forma' | 'regularidad' | 'datos';
    pregunta: string;
    respuestaEsperada: string;
    capacidad: string;
    estandar: string;
    estrategiasAplicacion?: string;
    rubricaEvaluacion?: RubricaLevel;
}

export interface CompletedReading {
    id: string;
    titulo: string;
    grado: number;
    tipoTexto: string;
    portadaUrl: string;
    contenido: string;
    youtubeUrl?: string; // Nuevo
    sugerenciaLibro?: string; // Nuevo
    imagenesReferencia?: string[]; // Para Unsplash
    actividades: CompetencyActivity[];
}
export interface Reading {
    id: string;
    titulo: string;
    grado: number;
    nivel?: 'primaria' | 'secundaria';
    tipoTexto: string;
    portadaUrl: string; // Background image for the card
    contenido: string;
    youtubeUrl: string;
    sugerenciaLibro: string;
    imagenesReferencia?: string[];
    actividades: CompetencyActivity[];
    esVisual?: boolean;
    imagenesSecuencia?: string[];
    createdAt?: string;
    creatorName?: string;
    creatorId?: string;
<<<<<<< HEAD
    area?: string;
=======
>>>>>>> 0d9a26f8ba7f2a976111182f91fd404313322fb5
}

export const mockReadings: Reading[] = [
    // --- 1ER GRADO: VISUALES (Cuentos sin letras, enfocados en Pativilca/Barranca) ---
    {
        id: '1-plaza',
        titulo: 'Aventura en la Plaza de Pativilca',
        grado: 1,
        tipoTexto: 'Cuento Visual',
        portadaUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwer-qWaCnDcve_33PaYSFUMCFvoyBSSl2IUWViDrt-abZdNoFzGkeFKCGks4jsvQosrK2sq7j1PcTHtL4K_tWgPN-CnXPX-waRWQKU6xWInhjqwtf9rPLHUPCYYvjeZHDGEiJveqDw=s1360-w1360-h1020-rw', // user provided plaza
        contenido: '',
        esVisual: true,
        imagenesSecuencia: [
            '/images/visuals/plaza_seq_1.png',
            '/images/visuals/plaza_seq_2.png',
            '/images/visuals/plaza_seq_3.png',
            '/images/visuals/plaza_seq_4.png'
        ],
        youtubeUrl: 'https://www.youtube.com/watch?v=t9tDSy7AFOI', // Pativilca plaza turismo
        sugerenciaLibro: 'Imágenes de Mi Pueblo',
        actividades: [
            {
                id: 'act-1-1',
                type: 'oralidad',
                pregunta: '¿Qué le pasó al peluche del niño en la pileta?',
                respuestaEsperada: 'El niño expresa usando gestos o palabras simples que el perrito travieso se llevó el juguete en la segunda imagen.',
                capacidad: 'Obtiene información del texto oral.',
                estandar: 'Se comunica oralmente mediante textos cortos y sencillos. Deduce emociones de los personajes por su expresión.',
                estrategiasAplicacion: '??? Misión de Detectives: Formar un círculo en la alfombra y usar una lupa de juguete. Cada niño "descubre" una pista en la imagen.',
                rubricaEvaluacion: {
                    destacado: 'Imita la escena completa y explica con gran entusiasmo la travesura.',
                    logrado: 'Señala claramente en la imagen qué hizo el perrito con sus propias palabras.',
                    proceso: 'Señala al perrito pero no logra explicar claramente la acción.',
                    inicio: 'Se distrae y no logra conectar las imágenes para contar el suceso.'
                }
            },
            {
                id: 'act-1-2',
                type: 'lectura',
                pregunta: 'Observa la última foto. ¿Cómo se sienten ahora?',
                respuestaEsperada: 'Identifica y nombra la emoción de "alegría/felicidad" viendo la sonrisa de ambos.',
                capacidad: 'Infiere e interpreta información del texto.',
                estandar: 'Lee diversos tipos de textos de estructura simple en los que predominan imágenes.',
                estrategiasAplicacion: '?? Juego de Espejos: Pide a los niños que pongan "cara de la foto 3" (tristeza) y luego "cara de la foto 4" (alegría).',
                rubricaEvaluacion: {
                    destacado: 'Hace una conexión personal ("Están felices, como cuando yo juego en el parque de Pativilca").',
                    logrado: 'Reconoce la felicidad sin dudar viendo las expresiones.',
                    proceso: 'Nombra la emoción con ayuda del profesor.',
                    inicio: 'Muestra desinterés y no reconoce las emociones.'
                }
            },
            {
                id: 'act-1-3',
                type: 'escritura',
                pregunta: 'Eres el nuevo guardaparque de la Municipalidad de Pativilca. Dibuja y dicta a tu profesor un pequeño "Letrero de Reglas" para que los niños cuiden las piletas.',
                respuestaEsperada: 'Produce trazos y dicta oralmente una regla comunitaria (ej. "No botar basura al agua").',
                capacidad: 'Adecúa el texto a la situación comunicativa.',
                estandar: 'Escribe a partir de sus hipótesis de escritura diversos tipos de textos sobre temas conocidos.',
                estrategiasAplicacion: '??? Letreros del Parque: Se le entrega un rectángulo de cartulina para que diseñe su letrero oficial y lo "plante" en la plaza del salón.',
                rubricaEvaluacion: {
                    destacado: 'Dibuja la norma claramente y dicta una oración imperativa relacionada al cuidado del espacio.',
                    logrado: 'Dibuja una acción de cuidado comunitaria.',
                    proceso: 'Solo dibuja rayones esporádicos sin intención normativa.',
                    inicio: 'Se rehúsa a tomar el lápiz o color.'
                }
            }
        ]
    },
    {
        id: '1-gato-puerto',
        titulo: 'El Gato Pescador de Supe Puerto',
        grado: 1,
        tipoTexto: 'Cuento Visual',
        portadaUrl: '/images/visuals/gato_portada.png',
        contenido: '',
        esVisual: true,
        imagenesSecuencia: [
            '/images/visuals/gato_seq_1.png',
            '/images/visuals/gato_seq_2.png',
            '/images/visuals/gato_seq_3.png',
            '/images/visuals/gato_seq_4.png'
        ],
        youtubeUrl: 'https://www.youtube.com/watch?v=2mObfhNzr8E', // Cuento infantil de un gato
        sugerenciaLibro: 'Mascotas del Mar',
        actividades: [
            {
                id: 'act-1-1b',
                type: 'oralidad',
                pregunta: '¿Qué animalito vemos en las fotos y qué está mirando tan concentrado?',
                respuestaEsperada: 'El niño dice que es un gato y que está mirando el agua o los peces.',
                capacidad: 'Obtiene información del texto oral.',
                estandar: 'Se comunica oralmente mediante textos cortos y sencillos. Extrae información explícita.',
                estrategiasAplicacion: '?? A Pescar Palabras: Poner figuras de animales marinos en una piscina de plástico pequeña. Cada niño pesca uno y hace su sonido.',
                rubricaEvaluacion: {
                    destacado: 'Identifica al animal, la acción, e imita el maullido del gato.',
                    logrado: 'Nombra al gato y dice que busca peces.',
                    proceso: 'Señala al gato pero no expresa qué está haciendo.',
                    inicio: 'No logra identificar al personaje principal de las fotos.'
                }
            },
            {
                id: 'act-1-2b',
                type: 'lectura',
                pregunta: '¿En la última foto (4), el gatito está despierto o dormido?',
                respuestaEsperada: 'Identifica que el gato está dormido/descansando después de comer/jugar.',
                capacidad: 'Infiere e interpreta información del texto.',
                estandar: 'Deduce el final de una secuencia visual simple.',
                estrategiasAplicacion: '?? El Gato Dice: Un juego de "Simón dice" pero con acciones del gato (estirarse, pescar, dormir).',
                rubricaEvaluacion: {
                    destacado: 'Dice que el gato está "lleno y con sueño" deduciendo causa y efecto.',
                    logrado: 'Identifica claramente que está durmiendo.',
                    proceso: 'Duda sobre la acción o responde de forma ambigua.',
                    inicio: 'No logra interpretar el estado del gato en la imagen.'
                }
            },
            {
                id: 'act-1-3b',
                type: 'escritura',
                pregunta: 'Imagina que eres un capitán pesquero de Supe. Haz un dibujo y ponle "tu firma mágica" (trazos cortos) a un diploma especial para premiar al gato pescador.',
                respuestaEsperada: 'El niño realiza un trazo intencional figurando su nombre o firma para autorizar el premio.',
                capacidad: 'Adecúa el texto a la situación comunicativa.',
                estandar: 'Produce letras o grafismos para representar su nombre y avalar un texto corto.',
                estrategiasAplicacion: '?? Diplomas al Mérito: Entregar formatos de diploma pre-impresos para que cada niño estampe su firma/dedo y "premie" simbólicamente al gato.',
                rubricaEvaluacion: {
                    destacado: 'Traza letras reconocibles de su nombre en el espacio de la firma.',
                    logrado: 'Realiza un garabato ordenado con intención de firmar o dejar su marca.',
                    proceso: 'Hace trazos fuera del lugar indicado o daña el papel.',
                    inicio: 'No realiza ningún tipo de trazo sobre el papel.'
                }
            }
        ]
    },
    {
        id: '1-helados',
        titulo: 'El Heladero de la Calle Real',
        grado: 1,
        tipoTexto: 'Cuento Visual',
        portadaUrl: '/images/visuals/helado_portada.png',
        contenido: '',
        esVisual: true,
        imagenesSecuencia: [
            '/images/visuals/helado_seq_1.png',
            '/images/visuals/helado_seq_2.png',
            '/images/visuals/helado_seq_3.png',
            '/images/visuals/helado_seq_4.png'
        ],
        youtubeUrl: 'https://www.youtube.com/watch?v=siIr6QY4FXM', // Cuento del heladerito
        sugerenciaLibro: 'Dulces Helados',
        actividades: [
            {
                id: 'act-1-1c',
                type: 'oralidad',
                pregunta: 'Cuando suena la bocina del heladero ("¡Pee!, ¡Pee!"), ¿qué hacen los niños?',
                respuestaEsperada: 'Corren alegres para comprar un helado.',
                capacidad: 'Obtiene información del texto oral.',
                estandar: 'Comprende la intención de los sonidos y gestos.',
                estrategiasAplicacion: '?? Sonidos de mi Calle: El profesor hace diferentes ruidos con la boca (claxon, pájaro, heladero) y los niños deben adivinar de qué se trata.',
                rubricaEvaluacion: {
                    destacado: 'Hace el sonido de la bocina y actúa cómo corren los niños.',
                    logrado: 'Dice que los niños corren emocionados hacia él.',
                    proceso: 'Señala el helado pero no explica la acción de los niños.',
                    inicio: 'No asocia el sonido con la imagen de los niños corriendo.'
                }
            },
            {
                id: 'act-1-2c',
                type: 'lectura',
                pregunta: 'Mira la foto número 3. ¿De qué sabor crees que es ese helado?',
                respuestaEsperada: 'El alumno asocia el color del helado con un sabor conocido (ej. Rosado = Fresa, Marrón = Chocolate).',
                capacidad: 'Infiere e interpreta información del texto.',
                estandar: 'Asocia características visuales (color) con conocimientos previos (sabores).',
                estrategiasAplicacion: '?? Tiendita de Helados: Crear conos de cartulina y bolas de papel crepé de colores. Los niños "venden" helados de colores.',
                rubricaEvaluacion: {
                    destacado: 'Da varios sabores posibles basado en los colores y texturas de la imagen.',
                    logrado: 'Acierta un sabor coherente con el color mostrado.',
                    proceso: 'Dice un sabor que no coincide para nada con el color de la foto.',
                    inicio: 'No logra realizar la asociación visual.'
                }
            },
            {
                id: 'act-1-3c',
                type: 'escritura',
                pregunta: 'Eres el dueño de la heladería vecina. Escribe "SÍ HAY" (copiando las letras) en un cartelito para avisar a los vecinos de Pativilca que todavía tienes helados de fresa.',
                respuestaEsperada: 'Escribe letras o pseudo-letras intentando copiar el mensaje en un contexto de letrero comercial.',
                capacidad: 'Adecúa el texto a la situación comunicativa.',
                estandar: 'Traza grafías o letras de su entorno copiando mensajes breves.',
                estrategiasAplicacion: '?? Letreros de Tienda: Usar una pizarra pequeña para que intenten copiar el letrero comercial como en una tienda.',
                rubricaEvaluacion: {
                    destacado: 'Copia perfectamente las letras "SÍ HAY" y añade un dibujo del producto.',
                    logrado: 'Intenta copiar las grafías de forma medianamente legible.',
                    proceso: 'Dibuja círculos o trazos que no se asemejan a las letras sugeridas.',
                    inicio: 'Garabatos desordenados sin intención de forma.'
                }
            }
        ]
    },

    // --- 2DO GRADO: TEXTOS DISCONTINUOS / SIMPLES (Recetas, avisos) ---
    {
        id: '2-alfajores',
        titulo: 'Los Ricos Alfajores de Mi Abuela',
        grado: 2,
        tipoTexto: 'Receta Instructiva',
        portadaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Alfajores.jpg/1280px-Alfajores.jpg', // Alfajores peruanos
        contenido: '<b>¡Hola, amiguitos!</b> Soy Juanito, y vivo cerquita al mercado de Barranca. Mi abuela prepara los alfajores de maicena más suaves del mundo entero.\n\n?? <b>INGREDIENTES MÁGICOS:</b>\n- 2 tazas secretas de maicena blanca como la nieve.\n- 1 taza de harina suavizada.\n- Mucho manjar blanco dulce.\n- Coco rallado para decorar.\n\n????? <b>PASOS PARA LA MAGIA:</b>\n1. Mezcla todo con las manos limpias hasta tener una masa gordita.\n2. Con un rodillo, aplana la masa y corta circulitos (¡parecen monedas!).\n3. Llévalos al horno calientito con mucho cuidado y ayuda de mamá.\n4. Al final, únelos con mucho manjar blanco y pásalos por el coco.\n\n¡Anímate a prepararlos el domingo con tu familia!',
        youtubeUrl: 'https://www.youtube.com/watch?v=Evze31m1F28', // Como hacer alfajores de maicena
        sugerenciaLibro: 'Recetario Divertido para Niños Pequeños',
        actividades: [
            {
                id: 'act-2-1',
                type: 'oralidad',
                pregunta: '¿Para qué sirve la lista que nos dio Juanito en la historia?',
                respuestaEsperada: 'El alumno explica que es una receta y sirve para saber cómo preparar un alimento (alfajores).',
                capacidad: 'Reflexiona y evalúa la forma, el contenido y contexto del texto oral.',
                estandar: 'Se comunica oralmente interactuando de forma pertinente al propósito.',
                estrategiasAplicacion: '??? Entrevista Culinaria: Poner un "micrófono falso" a un niño para que actúe como Juanito y los demás le hacen preguntas sobre sus alfajores de Barranca.',
                rubricaEvaluacion: {
                    destacado: 'Explica claramente que es una receta y da ejemplos de otras recetas que conoce.',
                    logrado: 'Menciona que es una receta para cocinar alfajores.',
                    proceso: 'Dice que es comida, pero no logra identificar el formato de receta.',
                    inicio: 'Se queda en silencio o responde sobre otro tema.'
                }
            },
            {
                id: 'act-2-2',
                type: 'lectura',
                pregunta: 'En la receta, ¿qué ingrediente es "blanco como la nieve"?',
                respuestaEsperada: 'La maicena.',
                capacidad: 'Obtiene información del texto escrito.',
                estandar: 'Lee textos de estructura simple que presentan información evidente y predecible.',
                estrategiasAplicacion: '????? Carrera del Saber: Dividir la pizarra en zonas. Leer la pregunta y los niños deben correr a tocar la imagen correcta del ingrediente pegada en la pizarra.',
                rubricaEvaluacion: {
                    destacado: 'Lee la lista y responde rápidamente, destacando la metáfora de la nieve.',
                    logrado: 'Identifica la maicena localizando la palabra en la lista.',
                    proceso: 'Se confunde con el harina o intenta adivinar sin releer el texto.',
                    inicio: 'No logra localizar información explícita simple.'
                }
            },
            {
                id: 'act-2-3',
                type: 'escritura',
                pregunta: 'Eres el Jefe Panadero del "Horno de San Jerónimo". Escríbele a tu ayudante una notita rápida enumerando 3 ingredientes urgentes que debe comprar en el mercado de Barranca.',
                respuestaEsperada: 'Escribe un listado corto de compras ordenado por columnas.',
                capacidad: 'Organiza y desarrolla las ideas de forma coherente y cohesionada.',
                estandar: 'Escribe textos en torno a un tema y agrupa las ideas en formatos de bloque (listas/viñetas).',
                estrategiasAplicacion: '?? El Ayudante Despistado: Un compañero actúa como el ayudante que olvida todo; el niño debe redactar su ticket urgente.',
                rubricaEvaluacion: {
                    destacado: 'La lista es precisa, enumera 3 ingredientes usando guiones y sin faltas ortográficas graves.',
                    logrado: 'Logra escribir al menos 2 ingredientes a manera de lista.',
                    proceso: 'Logra escribir una sola palabra confusa.',
                    inicio: 'Evade la actividad de escritura.'
                }
            }
        ]
    },
    {
        id: '2-aviso-mascota',
        titulo: 'SE BUSCA: El Perrito Manchitas',
        grado: 2,
        tipoTexto: 'Aviso de Búsqueda',
        portadaUrl: '/images/visuals/portada_perrito.png', // cute dog looking up
        contenido: '<b>¡ATENCIÓN VECINOS DE PATIVILCA!</b>\n\nPor favor, ayúdenme a encontrar a mi perrito.\n\n?? <b>Nombre:</b> Manchitas\n?? <b>Tamaño:</b> Pequeño, ¡cabe en una mochila!\n?? <b>Color:</b> Blanco con una mancha negra grande en el ojo derecho (parece un pirata).\n?? <b>Se perdió en:</b> La plaza principal, cerca de la pileta, el día domingo por la tarde.\n?? <b>Recompensa:</b> ¡Un abrazo gigante y s/50 soles!\n\nSi lo ves, llama urgente al teléfono de mi mamá: <b>987-654-321</b>. Manchitas es muy juguetón pero le asustan los sonidos fuertes. ¡Queremos que vuelva a casa!',
        youtubeUrl: 'https://www.youtube.com/watch?v=2DZG2BbldPc', // Cuento infantil perro perdido
        sugerenciaLibro: 'Amo a mi Mascota',
        actividades: [
            {
                id: 'act-2-1b',
                type: 'oralidad',
                pregunta: 'Si ves a Manchitas en la calle, ¿qué es lo PEORE que podrías hacer según el aviso?',
                respuestaEsperada: 'Hacer sonidos fuertes, porque a Manchitas le asustan.',
                capacidad: 'Infiere e interpreta información del texto oral.',
                estandar: 'Se comunica oralmente para reflexionar sobre mensajes.',
                estrategiasAplicacion: '?? Roleplay de Búsqueda: Un niño actúa de vecino que encuentra a Manchitas y narra en voz alta cómo lo llamaría sin asustarlo.',
                rubricaEvaluacion: {
                    destacado: 'Infiere correctamente y propone una forma calmada de acercarse al perrito.',
                    logrado: 'Menciona que no hay que hacer ruidos fuertes.',
                    proceso: 'Se queda pensando en el dinero de la recompensa.',
                    inicio: 'No responde de manera pertinente a la pregunta.'
                }
            },
            {
                id: 'act-2-2b',
                type: 'lectura',
                pregunta: 'Revisa el aviso. ¿Qué característica hace que Manchitas parezca un pirata?',
                respuestaEsperada: 'Su mancha negra grande en el ojo derecho.',
                capacidad: 'Obtiene información del texto escrito.',
                estandar: 'Localiza información en textos con varios elementos complejos en su estructura.',
                estrategiasAplicacion: '?? Detectives Visuales: Encierra en un círculo rojo la parte del texto que describe el "costume" de pirata.',
                rubricaEvaluacion: {
                    destacado: 'Lee fluído y localiza exactamente la analogía visual de la mancha y el pirata.',
                    logrado: 'Menciona la mancha negra en el ojo.',
                    proceso: 'Dice que es blanco, omitiendo el detalle del ojo.',
                    inicio: 'No logra obtener la información literal.'
                }
            },
            {
                id: 'act-2-3b',
                type: 'escritura',
                pregunta: 'Eres de la Junta Vecinal de Protección Animal. Redacta un mensaje de WhatsApp advirtiendo en el grupo de vecinos sobre el perrito perdido.',
                respuestaEsperada: 'Produce un texto corto, directo y descriptivo imitando el formato visual de un mensaje digital o red social.',
                capacidad: 'Adecúa el texto a la situación comunicativa y redacta ordenadamente.',
                estandar: 'Escribe y adapta su registro a diversos textos informativos simples y simulando canales digitales cotidianos.',
                estrategiasAplicacion: '?? Plantilla Chat: Darles una hoja con un marco de celular de cartón impreso para que llenen su "mensaje de WhatsApp".',
                rubricaEvaluacion: {
                    destacado: 'Imita el tono urgente y solidario, usa signos de admiración y relata cómo reconocer al perro.',
                    logrado: 'Escribe una oración corta sobre el perro y pide ayuda al grupo vecinal.',
                    proceso: 'Escribe sobre perros sin el propósito del mensaje de búsqueda.',
                    inicio: 'Solo dibuja al perro sin crear el mensaje textual.'
                }
            }
        ]
    },
    {
        id: '2-invitacion',
        titulo: 'Gran Campeonato de Fulbito',
        grado: 2,
        tipoTexto: 'Afiche Deportivo',
        portadaUrl: '/images/visuals/portada_fulbito.png', // soccer ball / field
        contenido: '? <b>TITANES DE BARRANCA: ¡AL CAMPO!</b> ?\n\nEstán todos invitados al campeonato inter-aulas "Copa Primavera".\n\n?? <b>Día de la Gran Final:</b> Viernes 24 de Septiembre.\n? <b>Hora de pitazo inicial:</b> 3:00 de la tarde.\n??? <b>Lugar:</b> El Complejo Deportivo "Los Ángeles" de Barranca.\n\n?? <b>¡Habrá Kiosko!</b>\nVenderemos panchos, chicha morada heladita y chocotejas para juntar fondos para nuestro viaje de promoción.\n\n¡No faltes, ven con tu barra y tus globos de colores!',
        youtubeUrl: 'https://www.youtube.com/watch?v=Yp7hc68Oc3Q', // Campeonato de futbol niños infantil
        sugerenciaLibro: 'Mi primer libro de Deportes',
        actividades: [
            {
                id: 'act-2-1c',
                type: 'oralidad',
                pregunta: 'Imagina que invitas a tu mejor amigo. ¡Usa tu voz más fuerte de narrador de fútbol para leer el título del afiche!',
                respuestaEsperada: 'El alumno eleva el tono de voz y modula con entusiasmo leyendo "Titanes de Barranca: ¡Al Campo!".',
                capacidad: 'Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada.',
                estandar: 'Se comunica oralmente interactuando y expresando tonos de voz intencionados.',
                estrategiasAplicacion: '??? Relator Deportivo: Pasarse un tubo de PVC como micrófono para gritar el gol inicial de "Titanes".',
                rubricaEvaluacion: {
                    destacado: 'Lee el título con una entonación histriónica, asumiendo el rol al 100%.',
                    logrado: 'Eleva la voz notoriamente al leer el título.',
                    proceso: 'Lo lee con voz plana y baja.',
                    inicio: 'Se avergüenza y no participa del ejercicio de entonación.'
                }
            },
            {
                id: 'act-2-2c',
                type: 'lectura',
                pregunta: '¿Para qué sirve el dinero que recaudarán vendiendo chocotejas?',
                respuestaEsperada: 'Para juntar fondos para el viaje de promoción.',
                capacidad: 'Obtiene e infiere información del texto escrito.',
                estandar: 'Obtiene información de causas y efectos explícitos en el texto.',
                estrategiasAplicacion: '??? Identifica el Motivo: Usar resaltador amarillo vibrante para encerrar la "meta" económica del kiosko.',
                rubricaEvaluacion: {
                    destacado: 'Señala rápidamente el segmento y explica con sus palabras qué es la "promoción".',
                    logrado: 'Identifica la frase "fondos para viaje de promoción".',
                    proceso: 'Menciona que es para comprar comida o divaga.',
                    inicio: 'No logra recuperar esa información literal del texto.'
                }
            },
            {
                id: 'act-2-3c',
                type: 'escritura',
                pregunta: '¡Eres el Capitán del equipo de fulbito! Escríbele a tus compañeros un poderoso "Grito de Guerra" deportivo antes de salir a jugar contra los de Barranca.',
                respuestaEsperada: 'Redacción de una arenga deportiva breve orientada a la motivación y exaltación del equipo local.',
                capacidad: 'Utiliza convenciones del lenguaje escrito de forma pertinente.',
                estandar: 'Escribe utilizando vocabulario emotivo, exclamativo, recursos rítmicos y persuasivos.',
                estrategiasAplicacion: '?? Arengas Vivas: Tras escribir su lema, los niños golpean las mesas para crear un ritmo y cantan la arenga al unísono.',
                rubricaEvaluacion: {
                    destacado: 'La arenga tiene métrica o rima, incorpora su orgullo pativilcano y signos de exclamación notables.',
                    logrado: 'Escribe una frase motivacional deportiva coherente con ánimos competitivos y sanos.',
                    proceso: 'Escribe palabras sueltas como "vamos a ganar" sin elaborar estructuralmente una idea.',
                    inicio: 'No redacta la arenga propuesta.'
                }
            }
        ]
    },
    // --- 3ER GRADO: Cuentos locales y narrativos ---
    {
        id: '3-paramonga',
        titulo: 'El Misterio en la Fortaleza',
        grado: 3,
        tipoTexto: 'Cuento Mágico',
        portadaUrl: '/images/visuals/portada_fortaleza.png', // Paramonga ruins
        contenido: 'Muy cerca del mar, donde sopla un viento tibio y salado, se levanta la imponente Fortaleza de Paramonga. Desde niño, Mateo escuchaba que, en las noches de luna llena, los muros de adobe parecían brillar como si guardaran un secreto de oro antiguo.\n\nUn sábado, durante una visita escolar desde su colegio en Pativilca, Mateo se alejó dos pasitos del grupo. Justo detrás de un muro zigzagueante, vio a un pelícano gigante con una pequeña bolsa tejida colgando de su pico.\n\n—"No temas, chiquillo" —graznó el pelícano, asombrando a Mateo (¡los pelícanos no hablan!). "Soy el Guardián de la Fortaleza. Llevo semillas ancestrales de algodón de colores que crecían aquí hace miles de años."\n\nEl ave mágica le entregó la bolsita a Mateo con la misión de plantarlas en el biohuerto de su escuela. Y así fue como la I.E. 20504 logró tener el jardín de algodón más colorido y misterioso de toda la provincia.',
        youtubeUrl: 'https://www.youtube.com/watch?v=u-qZL_JLbrg', // Fortaleza de Paramonga
        sugerenciaLibro: 'Leyendas de la Costa Norteña',
        actividades: [
            {
                id: 'act-3-1',
                type: 'oralidad',
                pregunta: '¿Por qué la misión del pelícano era tan importante para la escuela?',
                respuestaEsperada: 'Porque le dio semillas antiguas (ancestrales) para plantar en la escuela y no dejar que la historia se olvide.',
                capacidad: 'Reflexiona y evalúa la forma, el contenido y contexto del texto oral.',
                estandar: 'Se comunica oralmente mediante diversos tipos de textos; infiere información relevante y conclusiones.',
                estrategiasAplicacion: '? Fogata Narrativa: Bajar la luz del aula, hacer un círculo en el piso alrededor de una "fogata" de cartón y debatir en susurros sobre los guardianes mágicos.',
                rubricaEvaluacion: {
                    destacado: 'Argumenta con soltura y vincula el algodón ancestral con la identidad cultural local.',
                    logrado: 'Responde correctamente basándose en los detalles principales del cuento.',
                    proceso: 'Menciona las semillas pero no explica por qué son especiales.',
                    inicio: 'No logra explicar la misión del personaje.'
                }
            },
            {
                id: 'act-3-2',
                type: 'lectura',
                pregunta: '¿Qué características mágicas o raras suceden en esta historia?',
                respuestaEsperada: 'El pelícano gigante que habla, y los muros de adobe que brillan en luna llena.',
                capacidad: 'Infiere e interpreta información del texto escrito.',
                estandar: 'Lee diversos tipos de texto con varios elementos complejos en su estructura.',
                estrategiasAplicacion: '?? Rompecabezas Textual: Entregar la historia en tiras de papel desordenadas a grupos pequeños. Deben armarla y luego atrapar los elementos mágicos con resaltador.',
                rubricaEvaluacion: {
                    destacado: 'Deduce e identifica todos los elementos mágicos, separándolos de los elementos reales de Paramonga.',
                    logrado: 'Identifica fácilmente al pelícano hablador.',
                    proceso: 'Confunde elementos reales con ficticios al explicar.',
                    inicio: 'Señala partes del texto al azar sin comprensión de la fantasía.'
                }
            },
            {
                id: 'act-3-3',
                type: 'escritura',
                pregunta: 'Eres el Jefe de Arqueólogos de la I.E. 20504. Escribe una "Ficha de Museo" (título, antigüedad y poder mágico) para el algodón de colores que encontró Mateo.',
                respuestaEsperada: 'El estudiante redacta de manera estructurada una ficha técnica/mágica de un objeto.',
                capacidad: 'Adecúa el texto a la situación comunicativa y redacta ordenadamente.',
                estandar: 'Escribe de forma coherente empleando formatos descriptivos específicos (fichas).',
                estrategiasAplicacion: '??? Galería Histórica: Pegar las fichas junto a pedacitos de algodón sintético tintado en las paredes del aula para crear su propio museo.',
                rubricaEvaluacion: {
                    destacado: 'Escribe la ficha con excelente ortografía, organizando los 3 datos requeridos con claridad.',
                    logrado: 'Cumple el propósito llenando la ficha de museo con los datos básicos del algodón.',
                    proceso: 'Escribe solo un párrafo en texto seguido sin usar el formato de ficha descriptiva.',
                    inicio: 'Escribe sin sentido lógico o evade la tarea de redacción descriptiva.'
                }
            }
        ]
    },
    {
        id: '3-misterio-mercado',
        titulo: 'El Misterio en el Mercado Antiguo',
        grado: 3,
        tipoTexto: 'Cuento de Detectives',
        portadaUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Mercado_de_Abasto_Tirso_de_Molina.jpg', // marketplace fresh produce
        contenido: 'El antiguo mercado de Pativilca siempre huele a mandarinas y hierba luisa. Sin embargo, doña Carmen, la vendedora de frutas más alegre, tenía un gran problema: ¡Sus paltas gigantes estaban desapareciendo!\n\nLuciano y Valentina, dos amigos inseparables de tercer grado, decidieron investigar. Se escondieron detrás de unas cajas de manzanas y sacaron su libreta de detectives.\n\n—"Ayer desaparecieron tres paltas", susurró Valentina. "Y solo dejaron unas pequeñas huellas con barro".\n\nDe pronto, vieron una sombra escabullirse cerca al puesto de Carmen. Era un monito travieso que había escapado. Luciano, en lugar de gritar, le ofreció un cuarto de plátano. El monito soltó la palta y se acercó a comer.\n\nEsa mañana, los niños no solo resolvieron el misterio, sino que doña Carmen adoptó al monito, nombrándolo "El Guardián Frutero".',
        youtubeUrl: 'https://www.youtube.com/watch?v=t9tDSy7AFOI', // Mercado misterio
        sugerenciaLibro: 'Pequeños Detectives',
        actividades: [
            {
                id: 'act-3-1b',
                type: 'oralidad',
                pregunta: 'Si fueras el detective Luciano, ¿cómo le explicarías a doña Carmen quién era el culpable sin asustarla?',
                respuestaEsperada: 'El alumno elabora un discurso calmado relatando el descubrimiento del monito.',
                capacidad: 'Adecúa, organiza y desarrolla las ideas de forma coherente.',
                estandar: 'Expresa sus ideas adaptando el registro al interlocutor (un adulto preocupado).',
                estrategiasAplicacion: '?? Teléfono Malogrado Policial: Un alumno "llama" a comisaría para reportar lo sucedido con el monito, practicando dicción y organización de ideas.',
                rubricaEvaluacion: {
                    destacado: 'Atrapa la atención del público, actúa con empatía como Luciano y narra los eventos lógicamente.',
                    logrado: 'Explica que fue el monito de manera clara y directa.',
                    proceso: 'Dice que fue el mono pero no estructura bien el resto de la explicación.',
                    inicio: 'Se paraliza al intentar asumir el rol de detective.'
                }
            },
            {
                id: 'act-3-2b',
                type: 'lectura',
                pregunta: '¿Cuál fue la pista clave ("huellas") que los hizo dudar si el ladrón era una persona?',
                respuestaEsperada: 'Las pequeñas huellas con barro que no correspondían a un humano.',
                capacidad: 'Obtiene información del texto escrito.',
                estandar: 'Localiza detalles explícitos e importantes en un texto narrativo.',
                estrategiasAplicacion: '?? Siguiendo Huellas: Dibujar huellas de manos y pies. Los niños deben "leer" en alto la pista exacta cuando pisan la huella correcta.',
                rubricaEvaluacion: {
                    destacado: 'Identifica las huellas de barro e infiere rápidamente que eran de un animal pequeño.',
                    logrado: 'Ubica la pista "huellas con barro".',
                    proceso: 'Menciona que faltaban tres paltas, ignorando la pista física.',
                    inicio: 'No logra identificar los indicios en el texto.'
                }
            },
            {
                id: 'act-3-3b',
                type: 'escritura',
                pregunta: 'Eres el periodista responsable de "La Ventana de Pativilca". Redacta una Noticia de Último Minuto (con un titular gigantesco) para avisar al pueblo que Doña Carmen tiene un mono de ayudante.',
                respuestaEsperada: 'Redacta un texto periodístico básico organizando: Titular y Cuerpo de noticia.',
                capacidad: 'Adecúa el texto a la situación comunicativa y formato.',
                estandar: 'Escribe utilizando formatos específicos estructurados (noticias periodísticas impresas).',
                estrategiasAplicacion: '?? Reporteros Escolares: Entregar plantillas de periódicos miniatura en blanco para que redacten su primicia sobre el monito asumiendo su rol.',
                rubricaEvaluacion: {
                    destacado: 'Redacta la noticia usando vocabulario ágil, espectacularidad (buen titular) y ortografía adecuada.',
                    logrado: 'Escribe un titular llamativo y explica brevemente la adopción del monito en cuerpo.',
                    proceso: 'Elabora oraciones simples pero no respeta el formato de noticia informativa.',
                    inicio: 'No logra estructurar los hechos periodísticos por escrito requeridos.'
                }
            }
        ]
    },
    {
        id: '3-cana-azucar',
        titulo: 'La Dulce Caña de Azúcar de nuestro Valle',
        grado: 3,
        tipoTexto: 'Historia Local',
        portadaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Sugarcane_fields_in_Cuba.jpg/1280px-Sugarcane_fields_in_Cuba.jpg', // Caña de azúcar
        contenido: 'Nuestra tierra de Pativilca es abrazada por un inmenso mar verde que se mueve al ritmo del viento. No es un mar de agua salada, sino un mar dulce: los grandes campos de caña de azúcar.\n\nDesde hace muchos años, los abuelos de nuestros abuelos trabajaban en los campos cortando la noble caña bajo el sol ardiente. Esta planta, alta y fuerte, llega en grandes camiones al molino donde la trituran para sacar su jugo.\n\nEse jugo oscuro y pegajoso se convierte luego en la rubia azúcar que endulza nuestro desayuno y nos da energía para jugar. Cuando el viento sopla fuerte en el valle, trae consigo ese aroma a caña fresca que nos recuerda el trabajo duro de nuestra comunidad.\n\nLa caña de azúcar es el motor de muchas familias en Pativilca, Paramonga y todo el Norte Chico.',
        youtubeUrl: 'https://www.youtube.com/watch?v=-s72whvPW3Q', // Caña de azucar Paramonga
        sugerenciaLibro: 'Campos de Dulzura',
        actividades: [
            {
                id: 'act-3-1cana',
                type: 'oralidad',
                pregunta: '¿Por qué el cuento dice que Pativilca es abrazada por un "mar verde"?',
                respuestaEsperada: 'Porque los inmensos campos de caña se mueven con el viento y parecen olas verdes.',
                capacidad: 'Infiere e interpreta información del texto oral.',
                estandar: 'Comprende el significado de lenguaje figurado sencillo.',
                estrategiasAplicacion: '?? Danza de la Caña: Los niños forman líneas y se mueven de lado a lado como hojas de caña mecidas por el viento norteño mientras explican la metáfora.',
                rubricaEvaluacion: {
                    destacado: 'Explica claramente y con entusiasmo la comparación poética entre el campo y el mar.',
                    logrado: 'Indica que el "mar verde" se refiere a la planta de la caña de azúcar.',
                    proceso: 'Asocia el mar pero no explica por qué es "verde".',
                    inicio: 'No logra entender la metáfora.'
                }
            },
            {
                id: 'act-3-2cana',
                type: 'lectura',
                pregunta: '¿En qué se convierte el jugo oscuro y pegajoso de la caña?',
                respuestaEsperada: 'Se convierte en el azúcar rubia que consumimos.',
                capacidad: 'Obtiene información del texto escrito.',
                estandar: 'Localiza información explícita e importante en un texto.',
                estrategiasAplicacion: '?? Detectives Azucareros: Entregarles caña real o una foto. Deben buscar en el texto el párrafo exacto donde dice el destino de la caña.',
                rubricaEvaluacion: {
                    destacado: 'Lee el párrafo velozmente, encuentra la respuesta y explica el proceso entero.',
                    logrado: 'Localiza con éxito que se convierte en azúcar.',
                    proceso: 'Tarda en localizar pero acaba encontrando "jugo" o "azúcar".',
                    inicio: 'No logra obtener la información del texto.'
                }
            },
            {
                id: 'act-3-3cana',
                type: 'escritura',
                pregunta: 'Eres un trabajador de los antiguos trapiches. Dibuja y escribe cómo era un día en el campo cortando caña bajo el sol brillante de Pativilca.',
                respuestaEsperada: 'Escribe narrando brevemente en primera persona su experiencia como trabajador en el campo.',
                capacidad: 'Adecúa el texto a la situación comunicativa usando recursos empáticos.',
                estandar: 'Escribe asumiendo roles imaginarios o históricos.',
                estrategiasAplicacion: '?? Sombreros de Paja: Repartimos sombreros de campesino (o hechos de papel). Escribiendo desde la empatía y la historia local.',
                rubricaEvaluacion: {
                    destacado: 'Redacta un relato profundo destacando el valor del trabajo y el clima.',
                    logrado: 'Asume el rol y relata un día básico de trabajo cortando caña.',
                    proceso: 'Dibuja pero escribe de forma aislada sin adoptar el personaje.',
                    inicio: 'No logra asumir el rol ni producir texto coherente.'
                }
            }
        ]
    },

    // --- 4TO GRADO: Textos Históricos, Informativos y Noticias ---
    {
        id: '4-bolivar',
        titulo: 'EXTRA EXTRA: ¡Bolívar en Pativilca!',
        grado: 4,
        tipoTexto: 'Noticia Histórica',
        portadaUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Museo_Simon_Bolivar_Pativilca.jpg', // Historical colonial house
        contenido: '<b>PERIÓDICO "EL CORREO DE LA HISTORIA" - Edición 1824</b>\n\n?? <b>¿Sabías qué?</b>\nEl mismísimo Libertador Simón Bolívar instaló su cuartel general en una casona de nuestro querido distrito de Pativilca.\n\n?? <b>Un Héroe Enfermo, un Héroe Valiente:</b>\nEn enero de aquel año, Bolívar cayó gravemente enfermo. Estaba postrado en una silla, muy débil y flaco. Los médicos y generales pensaban que la causa libertadora estaba perdida, pues el ejército patriota estaba dividido y sin dinero.\n\n?? <b>"¡Triunfar!"</b>\nEl funcionario Joaquín Mosquera, viéndolo tan mal en aquella casita colonial de Pativilca, se le acercó preocupado y le preguntó: "Y ahora, mi General, ¿qué piensa usted hacer?".\nAnte el asombro de todos, Bolívar se incorporó con ojos de águila, sacó fuerzas de la nada y gritó retumbando la casona: <b>"¡Triunfar!"</b>.\n\nEse gran grito de resiliencia nació aquí, en las tierras que ahora pisamos diariamente.',
        youtubeUrl: 'https://www.youtube.com/watch?v=Y-0rVCeDUf4', // Simon Bolivar Pativilca
        sugerenciaLibro: 'Historias de la Independencia en mi Ciudad',
        actividades: [
            {
                id: 'act-4-1',
                type: 'oralidad',
                pregunta: 'Si fueras reportero de esa época y Bolívar gritara "¡Triunfar!", ¿qué dirías frente a la cámara/pueblo para dar la noticia?',
                respuestaEsperada: 'El alumno dramatiza el reporte de noticias transmitiendo urgencia, asombro y el impacto de la frase de Bolívar.',
                capacidad: 'Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada (Oral).',
                estandar: 'Se comunica oralmente emitiendo opiniones y argumentando, adaptándose a roles específicos.',
                estrategiasAplicacion: '??? Reportero Histórico: Utilizar un tubo de cartón como micrófono. En parejas, uno actúa como Bolívar en su silla y el otro "transmite en vivo desde Pativilca" la gran noticia a la clase.',
                rubricaEvaluacion: {
                    destacado: 'Dramatiza perfectamente el rol periodístico, modulando su voz con gran fluidez y asombro.',
                    logrado: 'Relata el evento como si fuera una noticia con los datos correctos.',
                    proceso: 'Se pone nervioso, relata los hechos en desorden sin adoptar el personaje.',
                    inicio: 'No logra participar en la dramatización.'
                }
            },
            {
                id: 'act-4-2',
                type: 'lectura',
                pregunta: '¿Por qué la respuesta de Bolívar ("¡Triunfar!") fue tan sorprendente para Joaquín Mosquera?',
                respuestaEsperada: 'Porque Bolívar estaba extremadamente enfermo y débil, y en lugar de rendirse, mostró una fuerza inquebrantable.',
                capacidad: 'Infiere e interpreta información del texto.',
                estandar: 'Asocia el sentido de palabras, recursos formales (negritas) con la intención del texto.',
                estrategiasAplicacion: '?? Asamblea de la Verdad: Dividir la clase en dos. La mitad busca los "problemas" en el texto, y la otra mitad busca la "actitud" del héroe. Luego se confrontan las posturas.',
                rubricaEvaluacion: {
                    destacado: 'Realiza un excelente contraste argumentativo entre el estado físico de Bolívar y su fortaleza mental.',
                    logrado: 'Comprende y explica que estaba muy enfermo pero decidió no rendirse.',
                    proceso: 'Ubica donde está la frase "¡Triunfar!" pero no explica correctamente el asombro.',
                    inicio: 'No logra inferir el contraste entre enfermedad y actitud.'
                }
            },
            {
                id: 'act-4-3',
                type: 'escritura',
                pregunta: 'Eres el General Sucre, el mejor amigo de Bolívar. Escríbele un "Telegrama Urgente" (máximo 15 palabras) alegrándote profundamente desde las montañas por su fuerza en Pativilca.',
                respuestaEsperada: 'Redacta un telegrama (mensaje ultra sintético y muy formal) comunicando alegría y aliento sin pasarse del límite de texto.',
                capacidad: 'Utiliza convenciones del lenguaje escrito de forma pertinente para sintetizar.',
                estandar: 'Escribe o diseña recursos textuales muy breves acordes a restricciones de formato drásticas (como el telegrama).',
                estrategiasAplicacion: '?? Correos de Época: Trabajar con rectángulos de papel amarillo. Explicarles que cada palabra "cuesta un sol de oro", deben ser letales directos e inspiradores.',
                rubricaEvaluacion: {
                    destacado: 'El telegrama es potente, respeta el formato hiper-breve y mantiene un majestuoso tono militar y valiente.',
                    logrado: 'Redacta un mensaje sincero alegrándose sin desobedecer la restricción estricta de palabras.',
                    proceso: 'Su texto es extremadamente largo y no respeta la regla vital del formato corto telegráfico.',
                    inicio: 'No logra asumir el rol militar ni realiza la síntesis textual requerida.'
                }
            }
        ]
    },
    {
        id: '4-guia-turismo',
        titulo: 'Conoce Tu Ciudad: Turistas por un Día',
        grado: 4,
        tipoTexto: 'Infografía / Guía Local',
        portadaUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Hotel_de_Turistas_del_Cusco.jpg', // Turistas / Peruvian Valley
        contenido: '<b>¡BIENVENIDO AL CIRCUITO NORTE CHICO!</b>\n\nNuestra zona tiene tesoros escondidos. Como buen estudiante, debes conocerlos para guiarnos el fin de semana:\n\n??? <b>PARADA 1: La Plaza de Pativilca</b>\nAquí Bolívar planeó la independencia. Fíjate en la pileta central y los árboles gigantes que nos dan sombra.\n\n??? <b>PARADA 2: El Museo de Sitio</b>\nUn museo con momias antiguas y cerámicas de los antiguos pobladores. ¡Guarda silencio al entrar para no despertar a la historia!\n\n??? <b>PARADA 3: Las Playas de Barranca</b>\nDonde el sol se esconde. Famosas por sus olas bravas y la deliciosa comida de mar (¡tienes que pedir un ceviche fresquito!).\n\n<i>No olvides usar sombrero, bloqueador y llevar una botella de agua reutilizable. ¡Protejamos nuestro patrimonio!</i>',
        youtubeUrl: 'https://www.youtube.com/watch?v=qpF5qfuiEWU', // Turismo Barranca playas
        sugerenciaLibro: 'Guía de Aventuras en el Norte Chico',
        actividades: [
            {
                id: 'act-4-1b',
                type: 'oralidad',
                pregunta: 'Conviértete en Guía Turístico escolar. Explícale a la clase la importancia de la "Parada 1" usando mucha energía.',
                respuestaEsperada: 'El alumno adopta postura de líder/guía y narra la importancia histórica de la plaza de Pativilca.',
                capacidad: 'Interactúa estratégicamente con distintos interlocutores.',
                estandar: 'Modifica su forma de hablar según el rol que asume (guía) para informar a un grupo turístico.',
                estrategiasAplicacion: '?? El Autobús Imaginario: Acomodar las sillas en pares detrás del guía. El guía toma un "micrófono" e inicia su ruta hablando a los pasajeros.',
                rubricaEvaluacion: {
                    destacado: 'Excelente dominio de escenario. Saluda a los "turistas" y explica el rol de Bolívar con carisma.',
                    logrado: 'Narra la importancia de la plaza mencionando a Bolívar y la pileta.',
                    proceso: 'Lee de su cuaderno sin mirar al público ni adaptar su voz grupal.',
                    inicio: 'Se rehúsa a hablar frente al grupo simulado.'
                }
            },
            {
                id: 'act-4-2b',
                type: 'lectura',
                pregunta: '¿Cuáles son los tres consejos de salud/ecología finales que da la guía?',
                respuestaEsperada: 'Usar sombrero, bloqueador y llevar una botella de agua reutilizable.',
                capacidad: 'Obtiene información del texto escrito.',
                estandar: 'Localiza detalles puntuales (listas condicionales) al final de un texto discontinuo.',
                estrategiasAplicacion: '?? Empaca la Mochila: Dibujar una mochila en la pizarra. Los niños corren y pegan post-its dentro de la mochila solo con los objetos útiles mencionados.',
                rubricaEvaluacion: {
                    destacado: 'Lee fluído, localiza la información y explica el porqué (botella para no contaminar).',
                    logrado: 'Localiza e identifica correctamente los 3 elementos.',
                    proceso: 'Identifica el bloqueador pero olvida o menciona erróneamente el resto.',
                    inicio: 'No logra ubicar la información requerida en la sección final del texto.'
                }
            },
            {
                id: 'act-4-3b',
                type: 'escritura',
                pregunta: 'Actúa ahora como un niño Turista de Lima. Redacta el reverso de una Tarjeta Postal a tu colegio de la gran ciudad, resumiendo por qué te emocionaron tanto las playas de Barranca y el Museo.',
                respuestaEsperada: 'Redacción de un texto epistolar corto/postal donde relata su propia experiencia para persuadir afectivamente.',
                capacidad: 'Adecúa el texto a la situación comunicativa, respetando estructuras epistolares híbridas.',
                estandar: 'Escribe postales enfocando un lenguaje asombrado a un receptor específico geográficamente lejano.',
                estrategiasAplicacion: '??? Postales del Norte Chico: En un rectángulo grueso de cartulina, dibujan un sello postal y al reverso escriben un sumario de la visita lleno de asombro foráneo.',
                rubricaEvaluacion: {
                    destacado: 'La adecuación de turista asombrado es impecable; transmite calidez, cita los lugares y cierra bien su mensaje de despedida.',
                    logrado: 'Escribe la postal resaltando la experiencia playera con ánimo claro a otro niño.',
                    proceso: 'Nombra el lugar pero obvia el formato postal omitiendo los datos del destinatario o el saludo postal.',
                    inicio: 'Redacción en prosa estándar vacía de persuasión que no se comporta como texto turístico relacional.'
                }
            }
        ]
    },
    {
        id: '4-carta-pescador',
        titulo: 'Una botella en el mar de Supe',
        grado: 4,
        tipoTexto: 'Carta Epistolar',
        portadaUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Message_in_a_bottle%5E_-_geograph.org.uk_-_817479.jpg', // Message in a bottle
        contenido: '<i>Puerto de Supe, 15 de Octubre</i>\n\nEstimado niño o niña que encuentre esta carta:\n\nMi nombre es Don Pedro, y tengo 70 años. Desde que era niño como tú, saltaba al mar oscuro y misterioso poco antes del amanecer para pescar anchovetas y jureles para llevar al mercado.\n\nTe escribo esta nota porque el mar me susurró algo esta mañana: está cansado. Veo que las grandes fábricas y los desagües oscurecen algunas playas. Los peces, que son grandes amigos míos, están nadando mar adentro escapando de la suciedad.\n\nNo tengo mucho dinero para poner anuncios en la televisión gigante, así que prefiero confiar en la magia del mar. Sé que esta botella de vidrio retornable llegará a tus manos limpias.\n\nTe pido un favor: cuéntale a tu familia y a tus amigos que el mar no es un basurero gigante, sino un enorme plato azul que nos regala comida. Si lo ensuciamos, mañana no tendremos peces ni playas limpias para jugar.\n\nCon esperanza,\n<i>Don Pedro, un viejo pescador que ama a su Océano.</i>',
        youtubeUrl: 'https://www.youtube.com/watch?v=cSQhPy1_XRA', // Cuidar el mar para niños animado
        sugerenciaLibro: 'Carta a la Tierra',
        actividades: [
            {
                id: 'act-4-1c',
                type: 'oralidad',
                pregunta: 'El pescador no tiene dinero para salir en TV. Únete en grupo y graben un "Spot de Televisión de 30 segundos" transmitiendo el ruego de Don Pedro.',
                respuestaEsperada: 'Alumnos dramatizan un comercial televisivo corto pidiendo cuidar el mar.',
                capacidad: 'Adecúa, organiza y desarrolla ideas para persuadir a una audiencia masiva.',
                estandar: 'Comunica su mensaje utilizando recursos no verbales y paraverbales en formatos masivos simulados.',
                estrategiasAplicacion: '?? Director, Cámara, ¡Acción!: Usar una silla como cámara y un aplaudidor. Los niños montan un "comercial dramático" usando el guión de la necesidad de los peces.',
                rubricaEvaluacion: {
                    destacado: 'El comercial es ingenioso, impactante, el alumno proyecta una voz fuerte y convincente, excelente uso de gestos.',
                    logrado: 'Transmite el mensaje central (no contaminar el mar) en un bloque oral de manera clara.',
                    proceso: 'Su intervención es tímida, corta y dubitativa, le cuesta salir de la lectura al papel.',
                    inicio: 'Se niega sistemáticamente a la actuación frente a sus compañeros.'
                }
            },
            {
                id: 'act-4-2c',
                type: 'lectura',
                pregunta: 'Según Don Pedro, ¿por qué los peces están nadando "mar adentro"?',
                respuestaEsperada: 'Para escapar de la suciedad, de la contaminación de fábricas y desagües.',
                capacidad: 'Infiere e interpreta información del texto escrito.',
                estandar: 'Deduce relaciones de causa-efecto complejas que se encuentran en párrafos distintos.',
                estrategiasAplicacion: '?? Cadena de Causas: Hacer en la pizarra flechas que conecten: "Contaminación" -> "Mar Oscuro" -> "Los peces escapan". Que los estudiantes tracen las líneas.',
                rubricaEvaluacion: {
                    destacado: 'Comprende perfectamente la causa y el efecto de la contaminación en el hábitat.',
                    logrado: 'Identifica la suciedad/contaminación como el problema que ahuyenta a los peces.',
                    proceso: 'Afirma que los peces escapan sin detallar las causas específicas planteadas.',
                    inicio: 'No logra identificar por qué se alejan las especies marinas.'
                }
            },
            {
                id: 'act-4-3c',
                type: 'escritura',
                pregunta: 'El Alcalde Mayor de Supe leyó la carta del pescador pero no sabe escribir comunicados. Eres su mejor asesor ecológico; redacta un "Pergamino Oficial" ordenando dos Leyes protectoras para el mar de la ciudad.',
                respuestaEsperada: 'Redacta un texto normativo/oficial corto prohibiendo acciones sucias o promoviendo protección.',
                capacidad: 'Produce textos formales con claro propósito imperativo y normativo.',
                estandar: 'Redacta textos de coherencia organizativa asumiendo el registro formal y cívico de la autoridad del pueblo.',
                estrategiasAplicacion: '?? El Bando del Alcalde: Papeles enrollados como bandos reales en el escritorio. Luego de escribirlos con plumón grueso los "promulgan" parados sobre una silla.',
                rubricaEvaluacion: {
                    destacado: 'Domina magistralmente el estilo directivo e imperativo formulando edictos que previenen contaminación costera certeramente.',
                    logrado: 'Escribe al menos dos normas formales sancionando de forma imaginaria a quien arroje basuras.',
                    proceso: 'Escribe mensajes informales pidiendo el "por favor" en vez de ordenar u obligar mediante reglamentación lúdica.',
                    inicio: 'Inicia oraciones impertinentes al objeto jurídico/defensivo buscado por la tarea ecológica legal.'
                }
            }
        ]
    },
    // --- 5TO GRADO: Textos Argumentativos y Diarios Históricos ---
    {
        id: '5-caral',
        titulo: 'El Diario de un Arquitecto de Caral',
        grado: 5,
        tipoTexto: 'Diario Histórico',
        portadaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Caral_ene01_2011_luca_galuzzi.jpg/1280px-Caral_ene01_2011_luca_galuzzi.jpg', // Caral pyramids
        contenido: '<i>Valle de Supe, Año 2500 a.C.</i>\n\nHoy terminamos de colocar las últimas piedras de la Pirámide Mayor. Como arquitecto principal, me siento orgulloso. No hemos usado armas ni murallas para construir nuestra gran ciudad; nuestro poder es la flauta de hueso de pelícano, el comercio de achiote y el conocimiento del clima.\n\nEsta mañana vi a los niños del valle corriendo con anchovetas secas que intercambiaron por algodón con los pueblos de la sierra. Aquí en Caral, la paz es nuestra mejor tecnología. Sabemos que los temblores fuertes vendrán (la Pachamama siempre se mueve), por eso usamos "shicras", redes llenas de piedras en las bases de nuestras pirámides para que no se caigan.\n\nEspero que en miles de años, los niños que vivan en estas tierras entiendan que una civilización grande se construye con inteligencia y comercio, no con guerras.',
        youtubeUrl: 'https://www.youtube.com/watch?v=xLdI0R3A3o0', // Caral documental
        sugerenciaLibro: 'Los Secretos de la Ciudad Sagrada',
        actividades: [
            {
                id: 'act-5-1',
                type: 'oralidad',
                pregunta: 'Imagina que tú eres ese antiguo arquitecto frente a los pobladores. Da un pequeño y solemne discurso explicando por qué las "shicras" salvarán sus vidas.',
                respuestaEsperada: 'El alumno asume el rol del arquitecto y argumenta, con voz fuerte, cómo las shicras en la base de la pirámide resisten los temblores.',
                capacidad: 'Adecúa, organiza y desarrolla las ideas de forma coherente en exposiciones.',
                estandar: 'Se comunica oralmente mediante exposiciones formales, asumiendo roles históricos y argumentando lógicamente.',
                estrategiasAplicacion: '??? El Ágora de Caral: Usar una tarima o silla para que el "arquitecto" suba y exponga. Los demás compañeros (el pueblo) le hacen preguntas improvisadas.',
                rubricaEvaluacion: {
                    destacado: 'Discurso impecable, utiliza vocabulario formal e histórico, y responde a las preguntas del "pueblo" con soltura.',
                    logrado: 'Explica eficientemente el uso sismorresistente de las shicras en su discurso.',
                    proceso: 'Narra el texto de forma plana, sin persuasión ni asunción de rol.',
                    inicio: 'Se niega a exponer frente al salón.'
                }
            },
            {
                id: 'act-5-2',
                type: 'lectura',
                pregunta: 'Según el diario, ¿cuál es "la mejor tecnología" y el verdadero poder de la ciudad de Caral, en lugar de usar armas?',
                respuestaEsperada: 'La paz, la música (flauta de hueso) y el comercio (intercambio de anchovetas por algodón).',
                capacidad: 'Obtiene e infiere información del texto escrito.',
                estandar: 'Deduce el mensaje central y valores subyacentes en un texto histórico.',
                estrategiasAplicacion: '?? La Balanza del Poder: Dibujar una balanza en la pizarra. De un lado poner "Armas", del otro los valores que ellos encuentren en el texto. Gana el lado con más peso textual.',
                rubricaEvaluacion: {
                    destacado: 'Infiere que la civilización prosperó mediante medios pacíficos y económicos, citando claramente el texto.',
                    logrado: 'Menciona la paz y el comercio como la base de su sociedad.',
                    proceso: 'Menciona las shicras u otros datos técnicos en lugar de los conceptos sociales.',
                    inicio: 'No logra responder la pregunta de comprensión crítica.'
                }
            },
            {
                id: 'act-5-3',
                type: 'escritura',
                pregunta: 'Eres el Mercader Supremo de Caral. Escribe un "Pacto de Intercambio" (contrato antiguo) ofreciendo tus mejores flautas de pelícano por los pescados de Supe.',
                respuestaEsperada: 'Texto descriptivo simulando un contrato o acuerdo de trueque, estableciendo términos justos.',
                capacidad: 'Adecúa el texto a la situación comunicativa y redacta ordenadamente.',
                estandar: 'Escribe de forma coherente empleando un registro formal (contractual) adaptado a un rol histórico.',
                estrategiasAplicacion: '?? El Gran Trueque: Usar hojas manchadas con café. Redactan su pacto comercial y luego deben "chocar los puños" con un compañero para sellar el trato.',
                rubricaEvaluacion: {
                    destacado: 'El pacto es muy creativo, emplea lenguaje antiguo convincente y establece equidad en el trueque sin errores ortográficos.',
                    logrado: 'Escribe un acuerdo claro de qué intercambia por qué, asumiendo su rol de negociante histórico.',
                    proceso: 'Solo menciona los objetos que quiere sin formularlos dentro de un pacto o acuerdo formal.',
                    inicio: 'Escribe sin referirse al intercambio propuesto.'
                }
            }
        ]
    },
    {
        id: '5-opinion-plaza',
        titulo: 'Debate Escolar: ¿Cambiar la Plaza de Armas?',
        grado: 5,
        tipoTexto: 'Artículo de Opinión',
        portadaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Plaza_de_Armas_Puno_2.JPG/1280px-Plaza_de_Armas_Puno_2.JPG', // Plaza de Armas peruana
        contenido: '<b>COLUMNA DE OPINIÓN ESTUDIANTIL</b>\n<i>Por: María Fernanda, 5to "A"</i>\n\nHace una semana, el municipio de Pativilca propuso talar tres de los árboles más antiguos de nuestra histórica Plaza de Armas para construir un parqueo de motos. Personalmente, considero que esta es una pésima idea.\n\nEn primer lugar, la plaza es nuestro Patrimonio Cultural. Bajo esa sombra, miles de ciudadanos, e incluso personajes históricos como Bolívar, encontraron refugio del fuerte sol norteño.\n\nEn segundo lugar, quitar árboles en tiempos de calentamiento global es retroceder. ¡Necesitamos más oxígeno, no más humo de escape!\n\nEntiendo que el parqueo es necesario para los mototaxistas, pero propongo una solución: usar el terreno baldío detrás del mercado. Así, respetamos a los trabajadores de transporte, protegemos nuestra historia verde y mantenemos fresca el alma de nuestra ciudad.',
        youtubeUrl: 'https://www.youtube.com/watch?v=t9tDSy7AFOI', // Video debate o noticia local
        sugerenciaLibro: 'Jóvenes Ciudadanos',
        actividades: [
            {
                id: 'act-5-1b',
                type: 'oralidad',
                pregunta: 'Organiza un mini-debate. Tú eres el alcalde defendiendo el parqueo, y tu compañero defenderá la postura de María Fernanda.',
                respuestaEsperada: 'Simulación de un debate escolar con argumentos claros (Desarrollo local vs. Conservación e Historia).',
                capacidad: 'Interactúa estratégicamente con distintos interlocutores y participa de discusiones.',
                estandar: 'Participa en intercambios orales debatiendo con respeto y utilizando argumentos variados.',
                estrategiasAplicacion: '?? Tribunal Escolar: Poner dos carpetas enfrentadas. El "Jurado" (resto del salón) levanta cartulinas verdes o rojas calificando qué argumento fue más fuerte.',
                rubricaEvaluacion: {
                    destacado: 'Defiende su postura (incluso si no está de acuerdo personalmente) con argumentos sólidos, volumen de voz adecuado y excelente postura.',
                    logrado: 'Menciona al menos un argumento lógico para defender la posición asignada.',
                    proceso: 'Se ríe, pierde el enfoque del debate o solo repite lo que dice su compañero.',
                    inicio: 'Se niega a participar del debate de roles.'
                }
            },
            {
                id: 'act-5-2b',
                type: 'lectura',
                pregunta: '¿Cuál es la "solución intermedia" (el punto medio) que propone la autora al final de su columna?',
                respuestaEsperada: 'Usar el terreno baldío detrás del mercado para hacer el parqueadero de motos, salvando así los árboles.',
                capacidad: 'Obtiene información del texto escrito.',
                estandar: 'Deduce la tesis secundaria y la conclusión alternativa de un texto argumentativo.',
                estrategiasAplicacion: '??? Subrayado Crítico: Usar resaltador azul para los argumentos en contra, y resaltador verde para la "solución".',
                rubricaEvaluacion: {
                    destacado: 'Lee y explica con sus palabras que una solución cívica debe satisfacer a ambas partes (mototaxistas y ambientalistas).',
                    logrado: 'Identifica y menciona la propuesta del terreno baldío.',
                    proceso: 'Menciona que no talen los árboles, omitiendo la propuesta de reubicación de motos.',
                    inicio: 'No logra identificar la propuesta principal de solución.'
                }
            },
            {
                id: 'act-5-3b',
                type: 'escritura',
                pregunta: 'Eres el Representante de Estudiantes de Pativilca. Escribe un "Petición Formal" de 3 líneas al Alcalde proponiendo el terreno baldío para salvar la plaza.',
                respuestaEsperada: 'Estudiante produce un petitorio breve, formal y asertivo dirigido a una autoridad local identificada.',
                capacidad: 'Adecúa el texto a la situación comunicativa, y utiliza convenciones del lenguaje de forma pertinente.',
                estandar: 'Escribe peticiones o cartas formales cortas con un propósito cívico apelativo.',
                estrategiasAplicacion: '?? El Buzón Municipal: Repartir hojas membretadas ficticias de la Municipalidad para que escriban su petición y "sellen" el documento al terminar.',
                rubricaEvaluacion: {
                    destacado: 'Redacta con excelente cortesía política, es preciso en la petición del terreno y no tiene falta ortográfica.',
                    logrado: 'Solicita educadamente el uso del terreno alternativo para las motos.',
                    proceso: 'Exige agresivamente cosas al alcalde perdiendo el registro formal cívico adecuado.',
                    inicio: 'No realiza la redacción petitoria solicitada dirigida a la autoridad.'
                }
            }
        ]
    },
    {
        id: '5-mito-cerro',
        titulo: 'El Mito del Cerro de la Horca',
        grado: 5,
        tipoTexto: 'Mito / Leyenda Local',
        portadaUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Desierto_en_el_aire.jpg', // Desert hills / Cerro de la horca
        contenido: 'Cuenta la leyenda que muy cerca de la Fortaleza de Paramonga se encuentra el espeso Cerro de la Horca. Nuestros abuelos decían que los antiguos habitantes no lo subían al atardecer, pues escuchaban lamentos traídos por el fuerte viento costero.\n\nUn día escolar, el profesor don Ramiro llevó a los niños de 5to grado en excursión para explicarles la verdadera historia. “No teman, chicos”, sonrió agarrando un fósil. “Los lamentos que escuchaban no eran de fantasmas. Este cerro era un antiguo cementerio ceremonial Chimú. El viento choca fuertemente contra los orificios de los huacos rotos que quedan sepultados, creando ese silbido fantasmal como una flauta gigante.”\n\nDesde ese día, los niños de Paramonga no le temen al cerro; ahora saben subirlo en silencio, respetando la música hermosa que la tierra y el viento tocan para sus ancestros.',
        youtubeUrl: 'https://www.youtube.com/watch?v=u-qZL_JLbrg', // Documental cortos leyenda preinca
        sugerenciaLibro: 'Mitos del Valle Fortaleza',
        actividades: [
            {
                id: 'act-5-1c',
                type: 'oralidad',
                pregunta: 'Cuenta a la clase algún mito urbano infantil de tu localidad, pero explícale luego a tus compañeros la "explicación real" que creas que tenga.',
                respuestaEsperada: 'El alumno relata una breve historia (mito o cuento oral) y luego intenta argumentar lógicamente su verdadero origen (fenómeno natural, ecos, etc.).',
                capacidad: 'Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada.',
                estandar: 'Comunica historias orales ordenadamente y contrasta información mítica con explicaciones lógicas ante un público.',
                estrategiasAplicacion: '?? Cazadores de Mitos: Un alumno se sienta en "la silla del misterio" con luz tenue y cuenta su mito, y luego la clase entera hace lluvia de ideas de qué fenómeno científico lo explica.',
                rubricaEvaluacion: {
                    destacado: 'Narra con excelente histrionismo el mito e hipotetiza de manera muy inteligente una explicación científica/lógica.',
                    logrado: 'Cuenta una breve historia sobrenatural local y da una razón sencilla de por qué ocurre (ej. "es el viento").',
                    proceso: 'Cuenta la historia de fantasmas, pero sin proporcionar o intentar buscar la explanation realista solicitada.',
                    inicio: 'Responde con monosílabos o desconoce totalmente el trabajo propuesto.'
                }
            },
            {
                id: 'act-5-2c',
                type: 'lectura',
                pregunta: 'Según don Ramiro, ¿qué sonaba como una "flauta gigante" de forma accidental?',
                respuestaEsperada: 'El viento chocando fuertemente contra los orificios de los huacos (cerámicas) rotos sepultados en el cerro.',
                capacidad: 'Obtiene información del texto escrito.',
                estandar: 'Localiza datos relevantes y los extrae demostrando comprensión lectora de causas físicas dentro de un texto narrativo.',
                estrategiasAplicacion: '?? Lupa Científica: Pedirles que encierren con un círculo la "Mentira/Mito" y subrayen con regla la "Verdad Científica" propuesta en la lectura.',
                rubricaEvaluacion: {
                    destacado: 'Responde con fluidez identificando el viento, el huaco y el efecto acústico exacto.',
                    logrado: 'Menciona que era el viento entrando en los huacos.',
                    proceso: 'Atribuye el sonido explícitamente a fantasmas ignorando todo el núcleo central del cuento.',
                    inicio: 'No localiza la metáfora central de la lectura.'
                }
            },
            {
                id: 'act-5-3c',
                type: 'escritura',
                pregunta: 'Imagina que eres un locutor de la radio de Paramonga. Escribe en 2 líneas el "Anuncio Comercial" de la excursión escolar de don Ramiro al Cerro.',
                respuestaEsperada: 'Formula un texto publicitario/radial muy corto para persuadir y emocionar al oyente (sus compañeros).',
                capacidad: 'Adecúa el texto a la situación comunicativa (radial/comercial).',
                estandar: 'Produce cuñas o textos publicitarios cortos, evidenciando síntesis y manejo del impacto auditivo simulado.',
                estrategiasAplicacion: '?? Radio Escolar: Con un micrófono falso, "transmiten en vivo" el spot rápido que acaban de escribir con la voz de locutor comercial.',
                rubricaEvaluacion: {
                    destacado: 'Escribe un anuncio cautivador, invitador, dinámico y que utiliza signos que indican la entonación exclamativa fuerte.',
                    logrado: 'Logra escribir una cuña que invita a ir la excursión de forma emocionante.',
                    proceso: 'Escribe un relato de lo que hicieron los alumnos perdiendo el propósito vendedor del spot.',
                    inicio: 'Simplemente copia frases aleatorias del texto original.'
                }
            }
        ]
    },
    // --- 6TO GRADO: Reflexión Crítica y Mitos Ecológicos ---
    {
        id: '6-fortaleza',
        titulo: 'El Misterio del Valle de Fortaleza',
        grado: 6,
        tipoTexto: 'Mito Ecológico',
        portadaUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/WV_banner_Northern_Sierra_Peru_Valle_Rio_Tactago.jpg', // River valley Peru
        contenido: 'El Río Fortaleza desciende raudo desde las alturas, abriendo un valle fértil muy cerca a nuestra provincia de Barranca. Cuentan los más ancianos que el río no desciende solo; afirman que baja acompañado de un ente protector gigante formado por piedras rodantes y lodo espeso: El Guardián de Fortaleza.\n\nCuentan que hace siglos, antes de los abuelos de tus abuelos, arribaron forasteros inescrupulosos que deseaban cortar todos los árboles de la cuenca alta para fundir plata. Al ver cómo mutilaban el bosque originario, las aguas claras del río comenzaron a espesarse y oscurecerse en señal de dolor. \n\nFue entonces, en plena lluvia andina de febrero, que las montañas aullaron. Una enorme crecida bajó con violencia por la quebrada llevándose campamentos, herramientas y ahuyentando a los destructores. Pero aquel suceso dejó una lección en el valle: el lodo y la inundación (el "huaico", como lo conocemos), no era un castigo despiadado, sino el último rugido desesperado de una naturaleza herida que intentaba limpiar su hogar.\n\nHoy en día, nuestras comunidades en los valles limítrofes entienden que plantar árboles en las alturas y cuidar las riberas no es solo agricultura... es nuestra forma de cantarle una canción de cuna al río y asegurarnos que su Guardián no tenga que despertar enojado de nuevo.',
        youtubeUrl: 'https://www.youtube.com/watch?v=cSQhPy1_XRA', // Video de ecosistemas o un huayco animado/educativo
        sugerenciaLibro: 'Mitos Ecológicos del Perú Antiguo',
        actividades: [
            {
                id: 'act-6-1',
                type: 'oralidad',
                pregunta: 'El cuento define al huayco (deslizamiento) de una manera poética. Explica con tus palabras a la clase esta metáfora.',
                respuestaEsperada: 'El alumno explica con soltura oral que el autor compara un desastre natural con "el rugido de una naturaleza herida limpiando su hogar" por la tala de árboles.',
                capacidad: 'Infiere e interpreta información del texto oral.',
                estandar: 'Se comunica oralmente mediante exposiciones de textos complejos o abstractos con vocabulario especializado.',
                estrategiasAplicacion: '?? Panel Comunitario: Simular una "Junta de Vecinos" de Pativilca. Un alumno explica poéticamente el peligro de talar, otro alumno da datos reales sobre inundaciones.',
                rubricaEvaluacion: {
                    destacado: 'Comprende el nivel simbólico excelentemente, usando lenguaje rico y maduro frente a la audiencia sin titubear.',
                    logrado: 'Explica eficientemente que el Guardián o huayco representa la furia del río por el maltrato a la naturaleza.',
                    proceso: 'Se pone nervioso, lee su respuesta y no logra despegarse del nivel literal del texto.',
                    inicio: 'No logra explicar o rechaza la exposición pública.'
                }
            },
            {
                id: 'act-6-2',
                type: 'lectura',
                pregunta: '¿Cuál es la enseñanza ecológica principal que deja la historia de las comunidades limítrofes?',
                respuestaEsperada: 'Que cuidar los bosques ribereños y reforestar (cantarle de cuna al río) evita inundaciones y desastres (el despertar del Guardián).',
                capacidad: 'Reflexiona y evalúa la forma, el contenido y el contexto del texto.',
                estandar: 'Lee diversos y amplios textos reflexivos evaluando la utilidad del contenido frente a problemas sociales o ambientales actuales.',
                estrategiasAplicacion: '?? Pescadores de Tesis: El profesor pone "peces de cartulina" en el piso. Atrás de uno está la moraleja real. Tienen que leer y justificar a cuál pez "pescaron".',
                rubricaEvaluacion: {
                    destacado: 'Formula conclusiones críticas sobre la responsabilidad humana frente a los desastres naturales.',
                    logrado: 'Localiza y comprende claramente la lección final del autor.',
                    proceso: 'Se queda con partes no relevantes de la historia y falla al deducir la moraleja central.',
                    inicio: 'No logra entender las motivaciones de los elementos ambientales en el texto.'
                }
            },
            {
                id: 'act-6-3',
                type: 'escritura',
                pregunta: 'Eres el Jefe de Defensa Civil de la Provincia de Barranca. Redacta el "Tuit Oficial" (140 caracteres) declarando alerta naranja por las lluvias en cuenca alta.',
                respuestaEsperada: 'Diseño de un microtexto informativo digital y de emergencia, con lenguaje técnico, hashtags y alta capacidad de síntesis.',
                capacidad: 'Adecúa el texto a formatos estrictos e informativos urgentes en redes.',
                estandar: 'Escribe textos concisos emulando entornos digitales de publicación masiva (Twitter).',
                estrategiasAplicacion: '?? Plantilla en Redes: Darles cartulinas con la plantilla de un tweet (con espacio para su foto originaria dibujada y hashtags creativos).',
                rubricaEvaluacion: {
                    destacado: 'El tuit es hiper sintético, no tiene errores, avisa del clima certeramente y emplea un hashtag local pertinente (#AlertaPativilca).',
                    logrado: 'Escribe un mensaje de emergencia corto como autoridad cívica de Defensa Civil.',
                    proceso: 'Se extiende escribiendo una carta formal grande arruinando la limitación del microtexto.',
                    inicio: 'No respeta el rol de autoridad para un mensaje informativo.'
                }
            }
        ]
    },
    {
        id: '6-ensayo-pesca',
        titulo: 'Ensayo Literario: La Vida del Hombre de Mar',
        grado: 6,
        tipoTexto: 'Ensayo Literario',
        portadaUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Jos%C3%A9_Olaya_%C3%B3leo.jpg', // Fishing boats
        contenido: '<b>La nobleza del anzuelo</b>\n<i>Autor: Anónimo</i>\n\nEl mar que baña las costas de Supe Puerto y Barranca no es solo agua salada; es la sangre viva que nutre a nuestra comunidad. El pescador artesanal no es un simple recolector, es un poeta de la madrugada. Mientras nosotros dormimos protegidos del viento paracas, el hombre de mar surca las olas más bravas impulsado por una fe inquebrantable en San Pedro y en su propio esfuerzo.\n\nEn un mundo moderno que valora la inmediatez y lo sintético, el pescador nos recuerda la virtud de la paciencia. Él sabe que el mar no obedece a horarios humanos; tiene su propio ciclo de furia y calma. El pescador entiende que no se le roba al mar, sino que la Pachamama marina regala su fruto a quien se lo gana con sudor y respeto.\n\nSin embargo, la pesca industrial que arrastra el fondo marino amenaza esta forma poética y noble de vivir. Proteger la pesca artesanal es más que cuidar la economía de mil familias; es abrazar y defender nuestra verdadera identidad costeña.',
        youtubeUrl: 'https://www.youtube.com/watch?v=qpF5qfuiEWU', // Documental pescadores
        sugerenciaLibro: 'Voces del Mar de Grau',
        actividades: [
            {
                id: 'act-6-1b',
                type: 'oralidad',
                pregunta: 'El texto dice: "el mar no obedece horarios humanos". Reflexiona en voz alta frente al salón: ¿Por qué el estilo de vida actual choca con esa idea de la naturaleza?',
                respuestaEsperada: 'El alumno debe comparar la inmediatez de la ciudad (tecnología, rapidez) con la paciencia de la naturaleza y el pescador.',
                capacidad: 'Reflexiona y evalúa la forma, el contenido y contexto del texto oral.',
                estandar: 'Se comunica oralmente mediante exposiciones justificando la validez y pertinencia de sus aportes.',
                estrategiasAplicacion: '?? Tribuna Libre: Usar formato TED Talk. Cada alumno tiene 60 segundos en el centro del círculo para exponer su punto de vista existencial.',
                rubricaEvaluacion: {
                    destacado: 'Elabora un discurso brillante conectando la prisa de la vida urbana con la paciencia milenaria del mar.',
                    logrado: 'Explica de forma clara cómo el ser humano moderno quiere todo rápido a diferencia de la naturaleza.',
                    proceso: 'Divaga sobre el mar o los peces, sin tocar el tema de los "horarios/inmediatez" que pide la pregunta.',
                    inicio: 'Se rehúsa a reflexionar en público sobre temas abstractos.'
                }
            },
            {
                id: 'act-6-2b',
                type: 'lectura',
                pregunta: 'Identifica la antítesis (oposición) que el autor plantea al final del ensayo y descríbela.',
                respuestaEsperada: 'El autor opone/contrasta la pesca artesanal (nobleza, paciencia, respeto) frente a la pesca industrial destructiva (que arrastra el fondo).',
                capacidad: 'Infiere e interpreta información del texto.',
                estandar: 'Deduce relaciones lógicas (oposición/antítesis) presentes en ensayos y textos argumentativos profundos.',
                estrategiasAplicacion: '?? Balanza de Conceptos: En una ficha, dividir. "Lado Artesanal" vs "Lado Industrial". Los alumnos extraen del texto los adjetivos que el autor le da a cada uno.',
                rubricaEvaluacion: {
                    destacado: 'Nombra claramente el contraste entre pesca artesanal y pesca de arrastre industrial como conflicto principal.',
                    logrado: 'Reconoce que hay una pesca buena (manual) y una mala (grandes barcos).',
                    proceso: 'Menciona a los pescadores pero ignora la mención a la pesca industrial casi por completo.',
                    inicio: 'No logra identificar ninguna oposición o problema social planteado.'
                }
            },
            {
                id: 'act-6-3b',
                type: 'escritura',
                pregunta: 'Eres el Líder del Sindicato de Pescadores de Supe Puerto. Escribe un heroico "Manifiesto de Muelle" defendiendo su origen artesanal frente a los barcos grandes.',
                respuestaEsperada: 'Texto argumentativo breve, emotivo y de corte político/comunitario asumiendo la voz de un gremio.',
                capacidad: 'Adecúa y desarrolla ideas para justificar una postura corporativa legítima.',
                estandar: 'Produce manifiestos o textos declarativos argumentando con madurez e identidad laboral/cultural.',
                estrategiasAplicacion: '??? Asamblea en el Muelle: Cada cual redacta su declaratoria breve. Se escoge la mejor y el estudiante la lee subido al escritorio como un verdadero líder.',
                rubricaEvaluacion: {
                    destacado: 'Redacta con potente dignidad, vocación de liderazgo y sin usar agresiones informales, empleando lenguaje culto de lucha comunitaria.',
                    logrado: 'Escribe un lindo mensaje defendiendo el uso de sus botecitos en contra de las fábricas abusivas.',
                    proceso: 'Escribe peticiones sin argumento político/laboral ("no sean malos con nosotros").',
                    inicio: 'No asume la postura madura exigida para un estudiante de 6to de primaria.'
                }
            }
        ]
    },
    {
        id: '6-entrevista-cocinera',
        titulo: 'Secretos del Perol: Entrevista a Doña Rosa',
        grado: 6,
        tipoTexto: 'Entrevista / Reportaje',
        portadaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Cajamarca_cocina.jpg/1280px-Cajamarca_cocina.jpg', // Cocina tradicional peruana
        contenido: '<b>"A LA OLLA NO SE LE APURA"</b>\n<i>Por la Revista Estudiantil Norte Chico</i>\n\nNuestra reportera Camila (6to B) visitó el mercado antiguo de Pativilca para entrevistar a doña Rosa, ganadora del premio al "Mejor Picante de Cuy y Tamal Pativilcano".\n\n<b>Camila:</b> Doña Rosa, ¡qué aromas maravillosos hay aquí! ¿Cuál es el secreto de sus famosas comidas que atraen turistas de todas partes?\n<b>Doña Rosa:</b> (Ríe mientras mueve el cucharón de palo de guayabo). Hola mija, el secreto no es un condimento mágico. El ingrediente más caro del mundo se llama "Tiempo". Hoy en día, todos cocinan en microondas o a fuego máximo. Mi madre me enseñó que los aderezos —ese chinito, el ají panca, el ají mirasol— sudan a fuego lentito, en ollita de barro. Así cantan los sabores.\n\n<b>Camila:</b> Dicen por ahí que los jóvenes ya no quieren aprender a cocinar con leña y barro...\n<b>Doña Rosa:</b> Es triste. Dejar de cocinar nuestras recetas es empezar a olvidar quiénes somos. Cada tamal amarrado lleva la historia de los incas y la herencia de los afros, todo mezclado en esta tierra hermosa. Por eso, mis puertas están abiertas las tardes de domingo para quien quiera untarse las manos de masa morada.\n\n<i>Reportó para todos: Camila Gómez.</i>',
        youtubeUrl: 'https://www.youtube.com/watch?v=Evze31m1F28', // Video gastronomia peruana local
        sugerenciaLibro: 'Raíces y Recetas',
        actividades: [
            {
                id: 'act-6-1c',
                type: 'oralidad',
                pregunta: 'Elige un compañero. Uno será Camila y el otro Doña Rosa. Dramaticen la entrevista, pero añadan una pregunta FINAL que no está en el texto.',
                respuestaEsperada: 'Los alumnos realizan un Roleplay y demuestran improvisación coherente al crear una pregunta extra referida al tema culinario/cultural.',
                capacidad: 'Adecúa, organiza y desarrolla las ideas al improvisar argumentativamente.',
                estandar: 'Se expresa oralmente interactuando en simulaciones y aportando ideas nuevas derivadas del contexto.',
                estrategiasAplicacion: '??? Set de Televisión: Armar un "Set" de entrevistas. El jurado califica naturalidad, no memoria. El foco es la improvisación de la pregunta final.',
                rubricaEvaluacion: {
                    destacado: 'Dramatizan excepcionalmente, y elaboran una pregunta final y una respuesta profunda sobre la gastronomía como herencia cultural.',
                    logrado: 'Conducen la entrevista fluido y logran agregar una pregunta extra básica (ej. "Y qué le gusta más de cocinar?").',
                    proceso: 'Leen el documento mecánicamente sin añadir la pregunta nueva solicitada en la instrucción.',
                    inicio: 'Se paralizan y no logran escenificar la conversación grupal.'
                }
            },
            {
                id: 'act-6-2c',
                type: 'lectura',
                pregunta: '¿Por qué Doña Rosa afirma que "Dejar de cocinar nuestras recetas es empezar a olvidar quiénes somos"?',
                respuestaEsperada: 'Porque la comida agrupa la historia (Incas, herencia afroperuana) y refleja la identidad de la comunidad originaria.',
                capacidad: 'Obtiene e infiere información del texto.',
                estandar: 'Interpreta el sentido global del texto, deduciendo las posturas socioculturales profundas del autor/entrevistado.',
                estrategiasAplicacion: '?? El Rompecabezas Cultural: En una pizarra hacer un esquema donde "Identidad" está al centro y los niños deben conectar palabras como "Incas", "Afro", "Recetas", deduciéndolo del texto.',
                rubricaEvaluacion: {
                    destacado: 'Infiere a la perfección la conexión intrínseca entre la gastronomía y la preservación de la memoria histórica ancestral.',
                    logrado: 'Relaciona que la comida local (tamal) es parte de la historia de la gente y sus abuelos.',
                    proceso: 'Afirma que sin cocinar nos morimos de hambre o similares, perdiéndose el matiz cultural identitario.',
                    inicio: 'No logra explicar la frase célebre de la cocinera.'
                }
            },
            {
                id: 'act-6-3c',
                type: 'escritura',
                pregunta: 'Imagina que eres Doña Rosa. Escribe con mucho amor una "Dedicatoria Secreta" detrás de un cucharón de palo de madera para regalárselo a la pequeña Camila.',
                respuestaEsperada: 'Redacta una nota hiper breve, de altísimo valor afectivo y cultural para asegurar el relevo generacional.',
                capacidad: 'Adecúa el texto a la situación comunicativa, valorando convenciones emotivas e introspectivas.',
                estandar: 'Escribe de forma personal y entrañable transfiriendo valores históricos a otros destinatarios.',
                estrategiasAplicacion: '?? La Cuchara de la Historia: Si es posible, traer cucharones de palo baratos o de cartón para que redacten su legado empapado afectivamente en el propio objeto tridimensional.',
                rubricaEvaluacion: {
                    destacado: 'Es capaz de sintetizar el valor de la identidad peruana en un pequeño regalo, con delicadeza literaria profunda.',
                    logrado: 'Escribe una frase transmitiéndole a Camila herencia o cariño.',
                    proceso: 'Escribe dedicatorias vacías (ej. "Con cariño de Rosa") perdiendo todo rastro de herenci cultural.',
                    inicio: 'Se resiste al ejercicio afectivo o emocional planteado por la lectura profunda.'
                }
            }
        ]
    }
];







