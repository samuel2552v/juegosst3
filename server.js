const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir archivos estáticos de la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Banco de Preguntas (42 preguntas)
const allQuestions = [
    { question: "¿Qué significan las siglas EPP?", options: ["Equipos de Protección Personal", "Elementos para Prevenir Peligros", "Equipos de Primeros Pasos", "Elementos de Protección Pública"], answer: 0 },
    { question: "¿Cuál es el propósito principal de una pausa activa?", options: ["Perder tiempo de trabajo", "Reducir la fatiga laboral y prevenir trastornos osteomusculares", "Hablar con los compañeros", "Hacer ejercicio intenso para adelgazar"], answer: 1 },
    { question: "En caso de un incendio en la oficina, ¿qué es lo PRIMERO que debes hacer?", options: ["Correr rápidamente hacia la salida", "Buscar tus pertenencias", "Mantener la calma y activar la alarma", "Usar el ascensor para bajar más rápido"], answer: 2 },
    { question: "¿Qué color de señalización se utiliza para indicar obligación (ej. 'Uso obligatorio de casco')?", options: ["Rojo", "Amarillo", "Verde", "Azul"], answer: 3 },
    { question: "Según la ergonomía frente al computador, la pantalla debe estar a la altura de:", options: ["El pecho", "Los ojos", "Por encima de la cabeza", "El teclado"], answer: 1 },
    { question: "Un 'Casi Accidente' (Incidente) es:", options: ["Un evento que causó una lesión grave", "Un evento que tuvo el potencial de causar daño, pero no lo hizo", "Un accidente que ocurrió fuera del trabajo", "Un daño material importante a la empresa"], answer: 1 },
    { question: "¿Cuál de las siguientes es una postura correcta para levantar una carga pesada?", options: ["Doblar la espalda sin flexionar las rodillas", "Mantener la carga lejos del cuerpo", "Doblar las rodillas y mantener la espalda recta", "Girar el tronco mientras se levanta la carga"], answer: 2 },
    { question: "¿A qué se refiere el término 'Riesgo Biológico'?", options: ["Exposición a virus, bacterias y hongos", "Manejo de posturas inadecuadas", "Uso de sustancias inflamables", "Trabajo en espacios confinados"], answer: 0 },
    { question: "El Sistema de Gestión (SG-SST) es responsabilidad de:", options: ["Solo del empleador", "El empleador, con participación de todos los trabajadores", "El Comité Paritario (COPASST)", "La Administradora de Riesgos (ARL)"], answer: 1 },
    { question: "¿Cuál es el límite máximo de peso recomendado para levantar manualmente por hombres (norma general)?", options: ["10 kg", "25 kg", "50 kg", "100 kg"], answer: 1 },
    { question: "¿Qué tipo de extintor se utiliza para fuegos de equipos eléctricos energizados?", options: ["Agua a presión", "Espuma", "Clase C (CO2 / Solkaflam)", "Polvo Químico Seco Multipropósito ABC"], answer: 2 },
    { question: "La hipoacusia neurosensorial está relacionada principalmente con:", options: ["Falta de luz", "Exposición a vibraciones", "Exposición a ruido excesivo", "Contacto químico"], answer: 2 },
    { question: "¿Qué hacer ante un derrame de una sustancia química desconocida?", options: ["Limpiarlo con trapos inmediatamente", "Echarle agua", "Evacuar el área, aislarla y reportar", "Olerlo para identificar qué es"], answer: 2 },
    { question: "Movimientos repetitivos y manipulación manual de cargas son ejemplos de riesgos:", options: ["Psicosociales", "Biomecánicos / Ergonómicos", "Físicos", "Químicos"], answer: 1 },
    { question: "Un plan de emergencias debe incluir, como mínimo:", options: ["Rutas de evacuación, puntos de encuentro y brigadas", "Menú de cafetería y horarios", "Planilla de asistencia diaria", "Datos bancarios de empleados"], answer: 0 },
    { question: "¿Qué función principal cumple el arnés de seguridad de cuerpo entero?", options: ["Aumentar la comodidad", "Distribuir las fuerzas de una caída por todo el cuerpo", "Proteger de riesgos eléctricos", "Servir como cinturón portaherramientas"], answer: 1 },
    { question: "El 'Estrés Laboral' y el 'Acoso' son considerados riesgos:", options: ["Físicos", "Químicos", "Biomecánicos", "Psicosociales"], answer: 3 },
    { question: "En primeros auxilios, ¿qué significa la regla PAS?", options: ["Pausar, Atender, Sanar", "Prevenir, Avisar, Salir", "Proteger, Avisar, Socorrer", "Primeros Auxilios Seguros"], answer: 2 },
    { question: "El uso del casco de seguridad es obligatorio en áreas donde haya riesgo de:", options: ["Ruido", "Caída de objetos o golpes en la cabeza", "Gases tóxicos", "Frío extremo"], answer: 1 },
    { question: "La iluminación deficiente o el deslumbramiento en un puesto es un riesgo:", options: ["Psicosocial", "Físico", "Locativo", "Biológico"], answer: 1 },
    { question: "¿Qué significa la sigla ARL?", options: ["Asociación Reguladora Laboral", "Agencia de Riesgos Locales", "Administradora de Riesgos Laborales", "Alianza para la Recreación Libre"], answer: 2 },
    { question: "¿Con qué frecuencia se debe realizar una inspección visual de los extintores?", options: ["Diariamente", "Al menos una vez al mes", "Cada 5 años", "Solo cuando se recargan"], answer: 1 },
    { question: "El COPASST se llama 'Paritario' porque:", options: ["Se reúne un par de veces al año", "Tiene igual número de representantes del empleador y los trabajadores", "Es para empresas grandes", "Maneja dinero de la empresa"], answer: 1 },
    { question: "Cuando usas productos químicos, siempre debes consultar la:", options: ["Factura de compra", "Hoja de Datos de Seguridad (FDS)", "Etiqueta de precio", "Receta de internet"], answer: 1 },
    { question: "¿Qué es una enfermedad laboral?", options: ["La que da por cambios de clima", "La contraída como resultado de la exposición a factores de riesgo de la actividad laboral", "Cualquier enfermedad contagiosa", "Una enfermedad congénita"], answer: 1 },
    { question: "¿Qué forma y color tiene la señal de advertencia de peligro (Ej: Riesgo Eléctrico)?", options: ["Círculo rojo", "Cuadrado verde", "Triángulo amarillo con borde negro", "Rectángulo azul"], answer: 2 },
    { question: "¿Qué EPP básico NO se recomienda usar al operar un taladro o sierra circular manual?", options: ["Gafas de seguridad", "Protección auditiva", "Guantes holgados de tela", "Calzado cerrado"], answer: 2 },
    { question: "Las pausas activas recomendadas suelen durar:", options: ["1 minuto", "5 a 10 minutos", "30 minutos", "1 hora"], answer: 1 },
    { question: "La fatiga visual por uso de pantallas se puede prevenir aplicando:", options: ["Regla 20-20-20 (cada 20 min, mirar a 20 pies por 20 seg)", "Cerrando los ojos todo el día", "Acercándose más al monitor", "Subiendo el brillo al 100%"], answer: 0 },
    { question: "¿Qué indican las señales de color rojo?", options: ["Obligación", "Información general", "Prohibición y equipos contra incendio", "Evacuación"], answer: 2 },
    { question: "¿Qué indican las señales de color verde?", options: ["Peligro o Advertencia", "Salvamento, vías de evacuación y seguridad", "Obligación", "Riesgo biológico"], answer: 1 },
    { question: "Trabajar en andamios o escaleras a partir de cierta altura (ej. 1.5m o 2m según el país) se considera:", options: ["Trabajo rutinario", "Trabajo en alturas (requiere permiso y arnés)", "Trabajo en caliente", "Trabajo seguro"], answer: 1 },
    { question: "Al usar el teclado y el ratón, la muñeca debe estar:", options: ["Doblada hacia arriba", "Doblada hacia abajo", "Apoyada en el borde de la mesa", "Recta, en posición neutra y alineada"], answer: 3 },
    { question: "Un brigadista de emergencias es:", options: ["El jefe de la empresa", "Un paramédico externo", "Un trabajador voluntario capacitado para actuar en emergencias", "El vigilante del edificio"], answer: 2 },
    { question: "Si te cortas el dedo con papel en la oficina y sangras, ¿se considera accidente laboral?", options: ["No, es muy leve", "Solo si requieres incapacidad", "Sí, si ocurrió realizando tus labores, por leve que sea", "No, los accidentes son solo en fábricas"], answer: 2 },
    { question: "El calzado de seguridad con puntera de acero protege principalmente contra:", options: ["Electricidad estática", "Golpes y caída de objetos pesados en los pies", "Gases tóxicos", "Rayos UV"], answer: 1 },
    { question: "La principal causa de accidentes laborales en entornos de oficina suele ser:", options: ["Explosiones", "Atrapamientos en máquinas", "Caídas al mismo nivel (resbalones/tropiezos)", "Intoxicaciones"], answer: 2 },
    { question: "Para prevenir lesiones auditivas en áreas muy ruidosas, se debe usar:", options: ["Gafas", "Tapones o protectores tipo copa", "Mascarillas", "Casco"], answer: 1 },
    { question: "¿Qué es un trabajo 'en caliente'?", options: ["Trabajar en días muy soleados", "Operaciones que generan calor, chispas o llamas abiertas (ej. soldadura)", "Trabajar cerca de hornos encendidos", "Estar bajo mucha presión laboral"], answer: 1 },
    { question: "En caso de sismo durante tu jornada laboral, ¿cuál es la instrucción principal?", options: ["Correr despavorido", "Agacharse, cubrirse, sujetarse y evacuar calmadamente cuando termine", "Usar el ascensor inmediatamente", "Llamar a todos tus familiares desde el puesto"], answer: 1 },
    { question: "¿Qué evalúa una Matriz de Peligros y Riesgos?", options: ["El estado financiero de la empresa", "Los tipos de peligros, quién puede sufrir daños y cómo se controlan", "El clima laboral", "La puntualidad de los empleados"], answer: 1 },
    { question: "Los gases, vapores, humos y polvos son ejemplos de agentes de riesgo:", options: ["Físico", "Locativo", "Químico", "Eléctrico"], answer: 2 },
    // NUEVAS PREGUNTAS (35)
    { question: "En trabajos en alturas, ¿cuál es la medida principal de prevención?", options: ["Sistemas de protección contra caídas (Arnés y línea de vida)", "Usar ropa ajustada", "Trabajar rápido para terminar pronto", "Poner colchonetas en el piso"], answer: 0 },
    { question: "¿A partir de qué altura se considera trabajo en alturas en la mayoría de normativas?", options: ["0.5 metros", "1.5 o 2.0 metros según el país", "5.0 metros", "10 metros"], answer: 1 },
    { question: "Un andamio debe estar asegurado y nivelado. Si le falta una rueda o está cojo:", options: ["Se le pone un pedazo de madera", "Se usa con cuidado", "No se debe usar hasta que sea reparado o reemplazado", "Solo puede subir una persona"], answer: 2 },
    { question: "¿Qué debe revisarse en un arnés antes de usarlo?", options: ["Costuras, hebillas y cintas libres de desgaste o cortes", "Que combine con la ropa", "Que sea nuevo de paquete", "Nada, si está en la bodega es seguro"], answer: 0 },
    { question: "La 'línea de vida' sirve para:", options: ["Medir la presión arterial", "Conectar el arnés a un punto de anclaje seguro", "Guiar el camino en la oscuridad", "Hacer nudos de amarre"], answer: 1 },
    { question: "En la etiqueta de un producto químico, el pictograma de una calavera con tibias cruzadas significa:", options: ["Peligro de muerte (Tóxico)", "Peligro eléctrico", "Sustancia corrosiva", "Material reciclable"], answer: 0 },
    { question: "¿Qué significa el pictograma de una llama en un producto químico?", options: ["Que debe calentarse antes de usar", "Peligro de inflamabilidad", "Mantener a temperatura ambiente", "Sustancia radiactiva"], answer: 1 },
    { question: "¿Qué no se debe hacer NUNCA al almacenar productos químicos?", options: ["Tener la hoja de seguridad a mano", "Usar recipientes originales", "Reenvasarlos en botellas de bebidas o comida", "Mantenerlos en áreas ventiladas"], answer: 2 },
    { question: "La exposición continua a solventes sin mascarilla adecuada puede causar daño en:", options: ["Sistema respiratorio y nervioso", "Los huesos", "Los músculos", "El sistema digestivo exclusivamente"], answer: 0 },
    { question: "Para limpiar un derrame químico se debe usar:", options: ["El trapeador de la cocina", "Kit de derrames (absorbentes especiales)", "Agua a presión", "Soplarlo con un ventilador"], answer: 1 },
    { question: "En la atención de un herido, la bioseguridad implica:", options: ["Usar guantes de látex/nitrilo para evitar contacto con fluidos", "Correr a abrazarlo", "Lavar las manos después, sin importar qué se toque", "Cerrar los ojos"], answer: 0 },
    { question: "¿Qué hacer si una persona sufre una quemadura leve en el trabajo?", options: ["Aplicar crema dental", "Ponerle hielo directamente", "Lavar con abundante agua a temperatura ambiente", "Reventar las ampollas"], answer: 2 },
    { question: "En un botiquín de primeros auxilios de empresa NO debe haber:", options: ["Gasas y vendas", "Tijeras", "Medicamentos como pastillas para el dolor (Analgesicos)", "Suero fisiológico"], answer: 2 },
    { question: "El número de emergencias nacional es comúnmente el:", options: ["911 o 123", "000", "555", "111"], answer: 0 },
    { question: "Al realizar RCP (Reanimación Cardiopulmonar), la prioridad es:", options: ["Dar agua al paciente", "Compresiones torácicas fuertes y rápidas", "Acomodar la cabeza", "Preguntar su nombre"], answer: 1 },
    { question: "La investigación de un accidente laboral busca principalmente:", options: ["Buscar culpables y despedirlos", "Identificar las causas raíz para evitar que se repita", "Llenar un requisito de papel", "Cobrar el seguro"], answer: 1 },
    { question: "Toda empresa debe tener una Política de Seguridad y Salud que debe ser:", options: ["Secreta", "Conocida y comprendida por todos los trabajadores", "Escrita en inglés", "Renovada cada 10 años"], answer: 1 },
    { question: "Las inspecciones de seguridad sirven para:", options: ["Criticar el trabajo de los demás", "Identificar condiciones inseguras antes de que causen accidentes", "Justificar despidos", "Perder tiempo"], answer: 1 },
    { question: "El reporte de actos y condiciones inseguras es deber de:", options: ["Solo del de Seguridad (SST)", "Solo de los jefes", "Todos los trabajadores", "Nadie"], answer: 2 },
    { question: "Un 'Acto Inseguro' es:", options: ["Una falla en la máquina", "Un comportamiento del trabajador que omite una medida de seguridad", "El mal clima", "La falta de luz"], answer: 1 },
    { question: "Las guardas de seguridad en las máquinas tienen como objetivo:", options: ["Hacer la máquina más bonita", "Evitar el atrapamiento de extremidades", "Reducir el consumo de energía", "Evitar que la máquina se ensucie"], answer: 1 },
    { question: "Antes de hacer mantenimiento a un equipo eléctrico, se debe aplicar la regla de:", options: ["Llamar al jefe", "Bloqueo y etiquetado (Lockout/Tagout)", "Usar guantes de tela", "Trabajar muy rápido"], answer: 1 },
    { question: "¿Por qué no se debe usar ropa holgada o joyería cerca de piezas giratorias?", options: ["Porque se ensucian", "Por riesgo de atrapamiento", "Porque da calor", "Porque no se ve profesional"], answer: 1 },
    { question: "Una herramienta manual defectuosa (ej: martillo con mango roto) debe ser:", options: ["Usada con mucho cuidado", "Pegada con cinta adhesiva", "Retirada de servicio inmediatamente y reportada", "Regalada a un compañero"], answer: 2 },
    { question: "La proyección de partículas al usar una pulidora requiere protección:", options: ["En los pies", "Visual y facial (Gafas y careta)", "Auditiva exclusivamente", "En la espalda"], answer: 1 },
    { question: "El exceso de carga de trabajo y el bajo apoyo social generan riesgo:", options: ["Físico", "Biológico", "Psicosocial", "Químico"], answer: 2 },
    { question: "El Síndrome de Burnout se traduce como:", options: ["Síndrome del trabajador quemado o agotado", "Síndrome de la alergia", "Dolor de espalda crónico", "Exceso de energía"], answer: 0 },
    { question: "Una forma de promover el bienestar psicosocial en el trabajo es:", options: ["Fomentar el buen clima laboral y la comunicación efectiva", "Obligar a hacer horas extras", "Prohibir hablar entre compañeros", "Ignorar los problemas"], answer: 0 },
    { question: "¿Qué debe hacer un trabajador si es víctima de acoso laboral?", options: ["Quedarse callado", "Reportarlo al Comité de Convivencia Laboral", "Pelear con el acosador", "Renunciar inmediatamente sin avisar"], answer: 1 },
    { question: "Las actividades de bienestar y recreación en la empresa ayudan a:", options: ["Aumentar el estrés", "Disminuir la motivación", "Mejorar la salud mental y cohesión de equipo", "Perder dinero"], answer: 2 },
    { question: "Al subir o bajar escaleras, ¿cuál es la principal medida de seguridad?", options: ["Usar el celular", "Correr si vas tarde", "Sujetarse del pasamanos", "Bajar de dos en dos escalones"], answer: 2 },
    { question: "¿Qué es el autocuidado en SST?", options: ["Cuidar solo de uno mismo y no de los demás", "Asumir la responsabilidad personal por la propia salud y seguridad", "Dejarle la seguridad al empleador", "Cuidar los carros en el parqueadero"], answer: 1 },
    { question: "Si observas un cable pelado en tu lugar de trabajo:", options: ["Lo tocas para ver si tiene corriente", "Lo tapas con una alfombra", "No lo tocas y reportas la condición insegura de inmediato", "Lo arreglas tú mismo sin saber"], answer: 2 },
    { question: "En ergonomía, ¿cómo debe ser el espaldar de la silla de oficina?", options: ["Muy blando", "Que brinde soporte a la zona lumbar (curva baja de la espalda)", "Totalmente recto", "No importa el espaldar"], answer: 1 },
    { question: "¿Qué es la higiene postural?", options: ["Bañarse antes del trabajo", "El conjunto de normas para mantener la correcta alineación del cuerpo", "Limpiar el puesto de trabajo", "Lavar la ropa de trabajo"], answer: 1 }
];

// Estado del juego
let players = {}; // { socketId: { name, score, lastAnswerCorrect } }
let gameState = 'waiting'; // waiting, playing, results, podium
let questionDeck = [];
let currentQuestionIndex = 0;
let questionsPerRound = 7;
let questionsAnsweredInRound = 0;
let hostSocketId = null;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

io.on('connection', (socket) => {
    
    // El host se conecta
    socket.on('register_host', () => {
        hostSocketId = socket.id;
        gameState = 'waiting';
        for (let p in players) {
            players[p].score = 0;
            io.to(p).emit('back_to_lobby');
        }
        socket.emit('host_registered', {});
        // Enviar jugadores actuales si el host se reconecta
        io.to(hostSocketId).emit('update_players', Object.values(players));
    });

    // Un jugador se conecta
    socket.on('player_join', (name) => {
        if (gameState !== 'waiting') {
            socket.emit('join_error', 'El juego ya ha comenzado.');
            return;
        }

        players[socket.id] = {
            id: socket.id,
            name: name,
            score: 0,
            hasAnswered: false,
            lastAnswerCorrect: false
        };

        socket.emit('join_success');
        
        if (hostSocketId) {
            io.to(hostSocketId).emit('update_players', Object.values(players));
        }
    });

    // El host inicia el juego
    socket.on('start_game', () => {
        if (socket.id !== hostSocketId) return;
        
        // Barajar si es necesario
        if (questionDeck.length < questionsPerRound) {
            questionDeck = allQuestions.map((_, index) => index);
            shuffleArray(questionDeck);
        }

        questionsAnsweredInRound = 0;
        
        // Reset scores
        for (let p in players) {
            players[p].score = 0;
        }
        
        gameState = 'playing';
        io.emit('game_started');
        sendNextQuestion();
    });

    function sendNextQuestion() {
        if (questionsAnsweredInRound >= questionsPerRound) {
            gameState = 'podium';
            const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);
            io.to(hostSocketId).emit('show_podium', sortedPlayers);
            io.emit('game_over');
            return;
        }

        questionsAnsweredInRound++;
        const nextQIndex = questionDeck.pop();
        const q = allQuestions[nextQIndex];
        
        currentQuestionIndex = nextQIndex;

        // Reset player answer status
        for (let p in players) {
            players[p].hasAnswered = false;
        }

        const questionData = {
            question: q.question,
            options: q.options,
            number: questionsAnsweredInRound,
            total: questionsPerRound
        };

        io.to(hostSocketId).emit('new_question', questionData);
        // A los jugadores solo les avisamos que pueden responder
        socket.broadcast.emit('prepare_answer');
    }

    // Un jugador envía una respuesta
    socket.on('submit_answer', (data) => {
        const { answerIndex, timeLeft } = data; // timeLeft de 1 a 15
        const player = players[socket.id];
        
        if (!player || player.hasAnswered || gameState !== 'playing') return;

        player.hasAnswered = true;
        const q = allQuestions[currentQuestionIndex];
        
        if (answerIndex === q.answer) {
            player.lastAnswerCorrect = true;
            const timeBonus = Math.floor((timeLeft / 15) * 50);
            player.score += (100 + timeBonus);
        } else {
            player.lastAnswerCorrect = false;
        }

        // Avisar al host que alguien respondió
        if (hostSocketId) {
            io.to(hostSocketId).emit('player_answered', Object.values(players).filter(p => p.hasAnswered).length);
        }
    });

    // El host dice que se acabó el tiempo de la pregunta
    socket.on('time_up', () => {
        if (socket.id !== hostSocketId) return;
        
        const q = allQuestions[currentQuestionIndex];
        // Enviar resultados al host
        const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);
        io.to(hostSocketId).emit('show_results', {
            correctAnswer: q.answer,
            ranking: sortedPlayers
        });

        // Enviar resultado individual a cada jugador
        for (let p in players) {
            if (players[p].hasAnswered && players[p].lastAnswerCorrect) {
                io.to(p).emit('answer_result', { correct: true, score: players[p].score });
            } else {
                io.to(p).emit('answer_result', { correct: false, score: players[p].score });
            }
        }
    });

    // El host pide la siguiente pregunta
    socket.on('next_question', () => {
        if (socket.id !== hostSocketId) return;
        sendNextQuestion();
    });

    // El host reinicia el juego a la sala de espera
    socket.on('reset_game', () => {
        if (socket.id !== hostSocketId) return;
        gameState = 'waiting';
        // Limpiar jugadores o solo reiniciar scores? Mejor dejarlos conectados
        for (let p in players) {
            players[p].score = 0;
            io.to(p).emit('back_to_lobby');
        }
        io.to(hostSocketId).emit('update_players', Object.values(players));
    });

    // Desconexión
    socket.on('disconnect', () => {
        if (socket.id === hostSocketId) {
            hostSocketId = null;
            gameState = 'waiting';
            for (let p in players) {
                players[p].score = 0;
                io.to(p).emit('back_to_lobby');
            }
        } else if (players[socket.id]) {
            delete players[socket.id];
            if (hostSocketId) {
                io.to(hostSocketId).emit('update_players', Object.values(players));
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
