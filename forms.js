/* Mindful Wellness · formularios por programa
   Cada botón con data-form="clave" abre su formulario.
   Paso 1: datos de contacto (se guardan de inmediato).
   Paso 2: preguntas específicas del programa.
   Las respuestas van a la hoja de Google "Solicitudes Mindful Wellness". */
(function(){
  var ENDPOINT = "";            // URL del Apps Script (se completa al conectar la hoja)
  var WA = "12016799969";

  function L(){ return document.documentElement.getAttribute('data-lang')==='en' ? 1 : 0; }
  function t(x){ return Array.isArray(x) ? x[L()] : x; }

  /* ---------- bloques reutilizables ---------- */
  var MOD = {k:'modalidad', l:['¿Cómo prefieres?','How do you prefer?'], t:'radio', o:[['Virtual','Virtual'],['En persona','In person'],['Cualquiera','Either']]};
  var HOR = {k:'horario', l:['¿Qué horario te queda mejor?','What time works best?'], t:'multi', o:[['Mañana','Morning'],['Tarde','Afternoon'],['Noche','Evening'],['Fin de semana','Weekend']]};
  var VIA = {k:'contacto_por', l:['¿Cómo prefieres que te contactemos?','How should we contact you?'], t:'radio', o:[['WhatsApp','WhatsApp'],['Llamada','Phone call'],['Correo','Email']]};
  var IDI = {k:'idioma', l:['Idioma','Language'], t:'radio', o:[['Español','Spanish'],['Inglés','English'],['Bilingüe','Bilingual']]};
  var MAS = {k:'comentarios', l:['¿Algo más que quieras contarnos? (opcional)','Anything else you would like to share? (optional)'], t:'textarea'};
  var IND = {k:'industria', l:['Sector','Industry'], t:'radio', req:1, o:[['Salud','Health care'],['Servicios comunitarios','Community services'],['Hospitalidad','Hospitality'],['Atención al cliente','Customer service'],['Educación','Education'],['Otro','Other']]};
  var TAM = {k:'participantes', l:['¿Cuántas personas participarían?','How many participants?'], t:'radio', req:1, o:[['1–15','1–15'],['16–30','16–30'],['31–60','31–60'],['Más de 60','60+']]};
  var MDC = {k:'modalidad', l:['Modalidad','Delivery'], t:'radio', o:[['Presencial','On-site'],['Virtual','Virtual'],['Híbrido','Hybrid']]};
  var CUA = {k:'cuando', l:['¿Para cuándo lo necesitan?','When do you need it?'], t:'radio', o:[['Este mes','This month'],['En 1–3 meses','In 1–3 months'],['En 3–6 meses','In 3–6 months'],['Aún no sabemos','Not sure yet']]};
  var RET = {k:'reto', l:['¿Cuál es el principal reto de tu equipo hoy?','What is your team\'s main challenge today?'], t:'textarea', req:1};

  var PERSON = [
    {k:'nombre', l:['Nombre y apellido','Full name'], t:'text', req:1, ac:'name'},
    {k:'email', l:['Correo electrónico','Email'], t:'email', req:1, ac:'email'},
    {k:'whatsapp', l:['WhatsApp o teléfono','WhatsApp or phone'], t:'tel', req:1, ac:'tel'}
  ];
  var ORG = [
    {k:'nombre', l:['Nombre y apellido','Full name'], t:'text', req:1, ac:'name'},
    {k:'cargo', l:['Cargo','Job title'], t:'text', ac:'organization-title'},
    {k:'organizacion', l:['Organización','Organization'], t:'text', req:1, ac:'organization'},
    {k:'email', l:['Correo de trabajo','Work email'], t:'email', req:1, ac:'email'},
    {k:'whatsapp', l:['Teléfono','Phone'], t:'tel', ac:'tel'}
  ];

  /* ---------- formularios ---------- */
  var F = {
    impulso: {c:PERSON, ti:['Impulso · quiero más información','Impulso · tell me more'], q:[
      {k:'proyecto', l:['¿Qué proyecto o meta quieres retomar?','What project or goal do you want to pick back up?'], t:'textarea', req:1},
      {k:'pausa', l:['¿Cuánto tiempo lleva en pausa?','How long has it been on hold?'], t:'radio', o:[['Menos de 6 meses','Under 6 months'],['6–12 meses','6–12 months'],['1–3 años','1–3 years'],['Más de 3 años','Over 3 years']]},
      {k:'obstaculo', l:['¿Qué te ha detenido?','What has held you back?'], t:'multi', o:[['Falta de tiempo','Lack of time'],['Miedo o inseguridad','Fear or self-doubt'],['No sé por dónde empezar','Not sure where to start'],['Dinero','Money'],['Falta de apoyo','Lack of support'],['Otro','Other']]},
      MOD, HOR, VIA]},
    evolucion: {c:PERSON, ti:['Evolución · quiero más información','Evolución · tell me more'], q:[
      {k:'area', l:['¿En qué área quieres claridad?','Where do you want clarity?'], t:'multi', req:1, o:[['Vida personal','Personal life'],['Carrera o trabajo','Career or work'],['Mi negocio','My business'],['Relaciones','Relationships'],['Bienestar','Well-being']]},
      {k:'meta', l:['¿Qué te gustaría lograr en estas 8 semanas?','What would you like to achieve in these 8 weeks?'], t:'textarea', req:1},
      {k:'coach_antes', l:['¿Has trabajado antes con una coach?','Have you worked with a coach before?'], t:'radio', o:[['Sí','Yes'],['No','No']]},
      MOD, HOR, VIA]},
    emprendedores: {c:PERSON, ti:['Haz crecer tu negocio · quiero más información','Grow your business · tell me more'], q:[
      {k:'etapa', l:['¿En qué etapa está tu negocio?','What stage is your business in?'], t:'radio', req:1, o:[['Es una idea','It\'s an idea'],['Empecé hace menos de 1 año','Started less than a year ago'],['Ya vendo','I\'m already selling'],['Quiero crecer o formalizarme','I want to grow or formalize']]},
      {k:'negocio', l:['¿Qué vendes o quieres vender?','What do you sell or want to sell?'], t:'textarea', req:1},
      {k:'reto', l:['¿Cuál es tu mayor reto?','What is your biggest challenge?'], t:'multi', o:[['Mi marca','My brand'],['Conseguir clientes','Getting customers'],['Ponerle precio','Pricing'],['Ventas y redes sociales','Sales and social media'],['Organización y sistemas','Organization and systems'],['Finanzas','Finances'],['Registro o permisos (LLC)','Registration or permits (LLC)']]},
      {k:'redes', l:['¿Tienes redes sociales o página web del negocio?','Do you have business social media or a website?'], t:'radio', o:[['Sí','Yes'],['No','No'],['Estoy en eso','Working on it']]},
      HOR, VIA]},
    sesion: {c:PERSON, ti:['Primera conversación gratuita · 20 min','Free first conversation · 20 min'], q:[
      {k:'tema', l:['¿Qué te gustaría trabajar?','What would you like to work on?'], t:'radio', req:1, o:[['Bienestar y estilo de vida','Well-being and lifestyle'],['Estrés y emociones','Stress and emotions'],['Metas y propósito','Goals and purpose'],['Finanzas personales','Personal finances'],['Relaciones','Relationships'],['Carrera o trabajo','Career or work'],['Otro','Other']]},
      {k:'situacion', l:['Cuéntanos brevemente tu situación','Briefly tell us about your situation'], t:'textarea'},
      MOD, HOR, VIA]},
    familias: {c:PERSON, ti:['Pareja y familia · quiero participar','Couples & family · I want to join'], q:[
      {k:'para', l:['¿Para quién es?','Who is it for?'], t:'radio', req:1, o:[['Pareja','Couple'],['Padres e hijos','Parents and children'],['Toda la familia','Whole family']]},
      {k:'fortalecer', l:['¿Qué les gustaría fortalecer?','What would you like to strengthen?'], t:'multi', o:[['Comunicación','Communication'],['Acuerdos en casa','Agreements at home'],['Crianza','Parenting'],['Finanzas del hogar','Household finances'],['Bienestar familiar','Family well-being']]},
      {k:'personas', l:['¿Cuántas personas participarían?','How many people would take part?'], t:'radio', o:[['2','2'],['3–4','3–4'],['5 o más','5+']]},
      {k:'formato', l:['¿Qué formato prefieren?','Which format do you prefer?'], t:'radio', o:[['Taller en grupo','Group workshop'],['Sesión privada','Private session'],['No estoy seguro','Not sure']]},
      MOD, HOR, VIA]},
    empleo: {c:PERSON, ti:['Prepárate para buscar empleo','Get ready to find a job'], q:[
      {k:'situacion', l:['¿Cuál es tu situación?','What is your situation?'], t:'radio', req:1, o:[['Estoy buscando trabajo','I\'m looking for a job'],['Quiero cambiar de trabajo','I want to change jobs'],['Llegué hace poco a EE. UU.','I recently arrived in the U.S.'],['Quiero volver a trabajar','I want to return to work']]},
      {k:'area', l:['¿En qué área o tipo de trabajo?','What field or type of job?'], t:'text'},
      {k:'ingles', l:['Tu nivel de inglés','Your English level'], t:'radio', o:[['Básico','Basic'],['Intermedio','Intermediate'],['Avanzado','Advanced']]},
      {k:'resume', l:['¿Tienes hoja de vida (resume)?','Do you have a resume?'], t:'radio', o:[['Sí, en inglés','Yes, in English'],['Sí, en español','Yes, in Spanish'],['No','No']]},
      {k:'necesita', l:['¿Con qué necesitas ayuda?','What do you need help with?'], t:'multi', o:[['Hoja de vida','Resume'],['Dónde buscar','Where to look'],['Cómo aplicar','How to apply'],['Entrevistas','Interviews'],['Habilidades para el trabajo','Job skills'],['Plan de búsqueda','Job search plan']]},
      HOR, VIA]},
    finanzas: {c:PERSON, ti:['Educación financiera · primera sesión sin costo','Financial education · free first session'], q:[
      {k:'para', l:['¿Es para ti, tu familia o tu negocio?','Is it for you, your family or your business?'], t:'radio', o:[['Para mí','For me'],['Para mi familia','For my family'],['Para mi negocio','For my business']]},
      {k:'mejorar', l:['¿Qué te gustaría mejorar?','What would you like to improve?'], t:'multi', req:1, o:[['Presupuesto','Budget'],['Ahorro','Savings'],['Deudas','Debt'],['Crédito','Credit'],['Metas a futuro','Future goals'],['Finanzas del negocio','Business finances']]},
      MOD, HOR, VIA]},
    mujeres: {c:PERSON, ti:['Mujeres con Propósito · quiero ser parte','Mujeres con Propósito · I want to join'], q:[
      {k:'busca', l:['¿Qué te gustaría encontrar aquí?','What are you hoping to find here?'], t:'multi', o:[['Un espacio para cuidarme','A space to care for myself'],['Descubrir mi propósito','Discover my purpose'],['Conocer a otras mujeres','Meet other women'],['Crecer personal y profesionalmente','Grow personally and professionally']]},
      {k:'ciudad', l:['¿En qué ciudad vives?','What city do you live in?'], t:'text'},
      {k:'como_supo', l:['¿Cómo nos conociste?','How did you hear about us?'], t:'radio', o:[['Instagram','Instagram'],['Facebook','Facebook'],['WhatsApp','WhatsApp'],['Una amiga','A friend'],['Un evento','An event'],['Otro','Other']]},
      MOD]},
    hombres: {c:PERSON, ti:['Hombres de Valor · quiero ser parte','Hombres de Valor · I want to join'], q:[
      {k:'edad', l:['Rango de edad','Age range'], t:'radio', o:[['18–25','18–25'],['26–40','26–40'],['41–60','41–60'],['Más de 60','60+']]},
      {k:'rol', l:['¿Qué papel de tu vida quieres fortalecer?','Which role in your life do you want to strengthen?'], t:'multi', o:[['Hijo','Son'],['Padre o figura paterna','Father or father figure'],['Pareja','Partner'],['Hermano o amigo','Brother or friend'],['Mentor','Mentor'],['Trabajador o emprendedor','Worker or business owner'],['Líder en mi comunidad','Community leader']]},
      {k:'interes', l:['¿Qué temas te interesan?','Which topics interest you?'], t:'multi', o:[['Bienestar emocional','Emotional well-being'],['Vínculos y familia','Relationships and family'],['Talentos y propósito','Talents and purpose'],['Emprendimiento y liderazgo','Entrepreneurship and leadership'],['Comunidad y legado','Community and legacy']]},
      {k:'ciudad', l:['¿En qué ciudad vives?','What city do you live in?'], t:'text'},
      MOD]},
    encuentros: {c:PERSON, ti:['Próximos encuentros · quiero información','Upcoming gatherings · tell me more'], q:[
      {k:'tipo', l:['¿Qué tipo de encuentro te interesa?','Which kind of gathering interests you?'], t:'multi', o:[['Talleres de bienestar','Well-being workshops'],['Mujeres con Propósito','Mujeres con Propósito'],['Hombres de Valor','Hombres de Valor'],['Familia','Family'],['Emprendimiento','Entrepreneurship']]},
      {k:'ciudad', l:['¿En qué ciudad vives?','What city do you live in?'], t:'text'},
      VIA]},
    aliado: {c:ORG, ti:['Quiero ser aliado de Mindful Wellness','Become a Mindful Wellness ally'], q:[
      {k:'tipo', l:['¿Cómo te gustaría colaborar?','How would you like to collaborate?'], t:'multi', req:1, o:[['Patrocinio','Sponsorship'],['Prestar un espacio','Provide a venue'],['Referir personas','Refer people'],['Organizar un evento juntos','Co-host an event'],['Otro','Other']]},
      {k:'comunidad', l:['¿A qué comunidad atiende tu organización?','Who does your organization serve?'], t:'textarea'},
      MAS]},
    invitar: {c:ORG, ti:['Invita a Mónica a tu evento','Invite Mónica to your event'], q:[
      {k:'evento', l:['¿Qué tipo de evento es?','What kind of event is it?'], t:'radio', req:1, o:[['Evento interno de empresa','Internal company event'],['Congreso o conferencia','Conference'],['Asociación o red profesional','Association or network'],['Comunidad, iglesia o escuela','Community, church or school'],['Feria o evento abierto','Fair or public event'],['Otro','Other']]},
      {k:'nombre_evento', l:['Nombre del evento','Event name'], t:'text'},
      {k:'fecha', l:['Fecha o mes del evento','Event date or month'], t:'text', req:1},
      {k:'lugar', l:['Ciudad o lugar (o "virtual")','City or venue (or "virtual")'], t:'text', req:1},
      {k:'asistentes', l:['¿Cuántas personas asistirán?','Expected attendance'], t:'radio', req:1, o:[['Menos de 30','Under 30'],['30–100','30–100'],['100–300','100–300'],['Más de 300','300+']]},
      {k:'publico', l:['¿Quién es el público?','Who is the audience?'], t:'text'},
      {k:'temas', l:['¿Qué temas quieres que Mónica trate?','Which topics should Mónica cover?'], t:'multi', req:1, o:[['Bienestar y manejo del estrés','Well-being and stress management'],['Servicio y comunidad hispana','Service and the Hispanic community'],['Liderazgo y equipos diversos','Leadership and diverse teams'],['Propósito y crecimiento personal','Purpose and personal growth'],['Mujeres y liderazgo','Women and leadership'],['Educación financiera','Financial education'],['Desarrollo laboral','Workforce development'],['Otro (descríbelo abajo)','Other (describe below)']]},
      {k:'duracion', l:['Duración de la participación','Length of the talk'], t:'radio', o:[['15–30 min','15–30 min'],['45–60 min','45–60 min'],['90 min o taller','90 min or workshop'],['Medio día','Half day']]},
      IDI,
      {k:'formato', l:['Formato','Format'], t:'radio', o:[['Charla principal','Keynote'],['Taller práctico','Hands-on workshop'],['Panel','Panel'],['Moderación','Moderator']]},
      {k:'presupuesto', l:['¿Tienen presupuesto asignado para la participación?','Is there a budget for the speaker?'], t:'radio', o:[['Sí','Yes'],['Aún no','Not yet'],['Es un evento comunitario','Community event']]},
      MAS]},
    propuesta: {c:ORG, ti:['Solicita una propuesta','Request a proposal'], q:[
      {k:'interes', l:['¿Qué te interesa?','What are you interested in?'], t:'radio', req:1, o:[['Servicio bilingüe de excelencia','Bilingual service excellence'],['Equipos de salud culturalmente competentes','Culturally competent health care teams'],['Bienestar y resiliencia del personal','Workforce well-being & resilience'],['Liderazgo para equipos diversos','Leadership for diverse teams'],['Diseño de programas de desarrollo laboral','Workforce development program design'],['Programa continuo de inducción','Ongoing onboarding program'],['Aún no lo sé','Not sure yet']]},
      IND, TAM, MDC, IDI, CUA, RET]},
    continuo: {c:ORG, ti:['Programa continuo de inducción','Ongoing onboarding program'], q:[
      IND,
      {k:'contrataciones', l:['¿Cuántas personas contratan por trimestre (aprox.)?','About how many people do you hire per quarter?'], t:'radio', req:1, o:[['Menos de 10','Under 10'],['10–25','10–25'],['26–50','26–50'],['Más de 50','50+']]},
      {k:'sedes', l:['¿Cuántas sedes o ubicaciones?','How many sites or locations?'], t:'radio', o:[['1','1'],['2–3','2–3'],['4 o más','4+']]},
      {k:'puestos', l:['¿Para qué puestos? (recepción, servicio, enfermería…)','Which roles? (front desk, service, nursing…)'], t:'text'},
      IDI, MDC, CUA, MAS]}
  };
  /* formatos corporativos (comparten base + preguntas propias) */
  function corp(ti, extra){ return {c:ORG, ti:ti, q:[IND, TAM].concat(extra||[]).concat([MDC, IDI, CUA, RET])}; }
  F['taller'] = corp(['Taller práctico · solicitar información','Hands-on workshop · request info'], [
    {k:'tema', l:['¿Sobre qué tema?','On which topic?'], t:'radio', o:[['Servicio bilingüe','Bilingual service'],['Salud culturalmente competente','Culturally competent care'],['Bienestar del personal','Workforce well-being'],['Liderazgo','Leadership'],['Otro','Other']]},
    {k:'duracion', l:['Duración ideal','Ideal length'], t:'radio', o:[['90 min','90 min'],['Medio día','Half day'],['Día completo','Full day']]}]);
  F['serie'] = corp(['Serie de formación · solicitar información','Training series · request info'], [
    {k:'semanas', l:['¿Cuántas semanas imaginan?','How many weeks do you have in mind?'], t:'radio', o:[['4','4'],['6','6'],['Más de 6','More than 6'],['No sabemos','Not sure']]},
    {k:'objetivo', l:['¿Qué cambio quieren ver al terminar?','What change do you want to see at the end?'], t:'textarea'}]);
  F['formadores'] = corp(['Formación de formadores · solicitar información','Train-the-trainer · request info'], [
    {k:'formadores', l:['¿Cuántas personas serían formadoras?','How many future trainers?'], t:'radio', o:[['1–3','1–3'],['4–8','4–8'],['Más de 8','8+']]},
    {k:'replicar', l:['¿Qué formación quieren replicar internamente?','What training do you want to deliver internally?'], t:'textarea'}]);
  F['coaching-lideres'] = corp(['Coaching para líderes · solicitar información','Leadership coaching · request info'], [
    {k:'tipo', l:['¿Individual o grupal?','One-on-one or group?'], t:'radio', o:[['Individual','One-on-one'],['Grupal','Group'],['Ambos','Both']]},
    {k:'lideres', l:['¿Cuántos líderes o supervisores?','How many leaders or supervisors?'], t:'radio', o:[['1–3','1–3'],['4–10','4–10'],['Más de 10','10+']]},
    {k:'retos', l:['Retos principales','Main challenges'], t:'multi', o:[['Comunicación','Communication'],['Conflictos','Conflict'],['Delegar','Delegation'],['Equipos diversos','Diverse teams'],['Rotación de personal','Turnover']]}]);
  F['consultoria'] = corp(['Consultoría y diseño · solicitar información','Consulting & design · request info'], [
    {k:'entregable', l:['¿Qué necesitan diseñar?','What do you need designed?'], t:'multi', req:1, o:[['Currículo','Curriculum'],['Materiales de capacitación','Training materials'],['Programa completo','Full program'],['Evaluación de resultados','Outcome evaluation'],['Propuesta para fondos (grant)','Grant proposal content']]},
    {k:'poblacion', l:['¿A qué población atenderá el programa?','Who will the program serve?'], t:'text'},
    {k:'plazo', l:['¿Cuál es el plazo de entrega?','What is the deadline?'], t:'text'}]);
  F['p-servicio'] = corp(['Servicio bilingüe de excelencia','Bilingual service excellence'], [
    {k:'canales', l:['¿Dónde atiende tu equipo?','Where does your team serve customers?'], t:'multi', o:[['En persona','In person'],['Por teléfono','Phone'],['Chat o correo','Chat or email'],['Recepción','Front desk']]},
    {k:'mejorar', l:['¿Qué quieren mejorar?','What do you want to improve?'], t:'multi', o:[['Quejas de clientes','Customer complaints'],['Comunicación con clientes hispanos','Communication with Hispanic customers'],['Ventas y fidelización','Sales and retention'],['Trabajo en equipo','Teamwork']]}]);
  F['p-salud'] = corp(['Equipos de salud culturalmente competentes','Culturally competent health care teams'], [
    {k:'personal', l:['¿Qué personal participaría?','Which staff would take part?'], t:'multi', o:[['Promotores de salud (CHWs)','Community health workers'],['Enfermería','Nursing'],['Navegadores de pacientes','Patient navigators'],['Recepción y admisión','Front desk & intake'],['Médicos y clínicos','Physicians & clinicians']]},
    {k:'creditos', l:['¿Necesitan horas de educación continua o certificado?','Do you need continuing education hours or a certificate?'], t:'radio', o:[['Sí','Yes'],['No','No'],['Por definir','To be decided']]}]);
  F['p-bienestar'] = corp(['Bienestar y resiliencia del personal','Workforce well-being & resilience'], [
    {k:'senales', l:['¿Qué están viendo en el equipo?','What are you seeing in the team?'], t:'multi', o:[['Estrés o agotamiento','Stress or burnout'],['Rotación de personal','Turnover'],['Ausentismo','Absenteeism'],['Conflictos','Conflict'],['Estrés financiero','Financial stress']]},
    {k:'turnos', l:['¿El equipo trabaja por turnos?','Does the team work shifts?'], t:'radio', o:[['Sí','Yes'],['No','No']]}]);
  F['p-liderazgo'] = corp(['Liderazgo para equipos diversos','Leadership for diverse teams'], [
    {k:'lideres', l:['¿Cuántos supervisores o líderes?','How many supervisors or leaders?'], t:'radio', o:[['1–5','1–5'],['6–15','6–15'],['Más de 15','15+']]},
    {k:'retos', l:['Retos principales','Main challenges'], t:'multi', o:[['Comunicación','Communication'],['Conflictos','Conflict'],['Negociación','Negotiation'],['Productividad','Productivity'],['Equipos multiculturales','Multicultural teams']]}]);
  F['p-laboral'] = corp(['Diseño de programas de desarrollo laboral','Workforce development program design'], [
    {k:'poblacion', l:['¿A qué población atiende el programa?','Who does the program serve?'], t:'text'},
    {k:'etapa', l:['¿En qué etapa están?','What stage are you at?'], t:'radio', o:[['Diseño desde cero','Design from scratch'],['Rediseño','Redesign'],['Evaluación de resultados','Outcome evaluation']]},
    {k:'fondos', l:['¿El programa tiene financiamiento?','Is the program funded?'], t:'radio', o:[['Sí, con fondos públicos','Yes, public funding'],['Sí, privado o fundación','Yes, private or foundation'],['Estamos buscando fondos','Seeking funding']]}]);

  /* ---------- estilos ---------- */
  var css = '.mwf-ov{position:fixed;inset:0;background:rgba(30,8,22,.62);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(3px)}'+
  '.mwf{background:#FCF8F1;color:#2E2228;width:min(620px,100%);max-height:92vh;overflow:auto;border-radius:24px;box-shadow:0 30px 80px rgba(0,0,0,.35);font-family:inherit}'+
  '.mwf-h{position:sticky;top:0;background:linear-gradient(120deg,#4E1A38,#7A3B63);color:#fff;padding:22px 26px 18px;border-radius:24px 24px 0 0;z-index:1}'+
  '.mwf-h small{display:block;letter-spacing:.14em;text-transform:uppercase;font-size:.72rem;opacity:.85;margin-bottom:4px}'+
  '.mwf-h h3{margin:0;font-size:1.35rem;line-height:1.25;color:#fff}'+
  '.mwf-x{position:absolute;right:16px;top:14px;background:rgba(255,255,255,.15);border:0;color:#fff;width:34px;height:34px;border-radius:50%;font-size:1.2rem;cursor:pointer}'+
  '.mwf-steps{display:flex;gap:6px;margin-top:12px}.mwf-steps i{flex:1;height:4px;border-radius:4px;background:rgba(255,255,255,.3)}.mwf-steps i.on{background:#E7D3A6}'+
  '.mwf-b{padding:22px 26px 26px}.mwf-intro{margin:0 0 16px;color:#5C4A55;font-size:.95rem}'+
  '.mwf-f{margin-bottom:16px}.mwf-f>label,.mwf-f>p{display:block;font-weight:700;font-size:.93rem;margin:0 0 7px;color:#4E1A38}'+
  '.mwf-f input[type=text],.mwf-f input[type=email],.mwf-f input[type=tel],.mwf-f textarea{width:100%;box-sizing:border-box;border:1.5px solid #E2D6CC;border-radius:12px;padding:11px 13px;font:inherit;background:#fff}'+
  '.mwf-f textarea{min-height:84px;resize:vertical}.mwf-f input:focus,.mwf-f textarea:focus{outline:none;border-color:#7A3B63;box-shadow:0 0 0 3px rgba(122,59,99,.15)}'+
  '.mwf-ch{display:flex;flex-wrap:wrap;gap:8px}.mwf-ch label{cursor:pointer}.mwf-ch input{position:absolute;opacity:0;pointer-events:none}'+
  '.mwf-ch span{display:inline-block;border:1.5px solid #E2D6CC;background:#fff;border-radius:999px;padding:8px 14px;font-size:.9rem;transition:.15s}'+
  '.mwf-ch input:checked+span{background:#4E1A38;border-color:#4E1A38;color:#fff}.mwf-ch input:focus-visible+span{box-shadow:0 0 0 3px rgba(122,59,99,.3)}'+
  '.mwf-req{color:#B4436C}.mwf-err{color:#B4436C;font-size:.85rem;margin-top:6px;display:none}.mwf-f.bad .mwf-err{display:block}.mwf-f.bad input,.mwf-f.bad textarea{border-color:#B4436C}'+
  '.mwf-ok{display:flex;gap:10px;align-items:flex-start;font-size:.85rem;color:#5C4A55;margin:6px 0 16px}.mwf-ok input{margin-top:3px}'+
  '.mwf-a{display:flex;gap:10px;justify-content:space-between;align-items:center;margin-top:8px;flex-wrap:wrap}'+
  '.mwf-btn{border:0;border-radius:999px;padding:13px 24px;font:700 .95rem inherit;cursor:pointer;background:#4E1A38;color:#fff}.mwf-btn.ghost{background:transparent;color:#4E1A38;border:1.5px solid #4E1A38}.mwf-btn.gold{background:#C9A45C;color:#2E2228}'+
  '.mwf-btn[disabled]{opacity:.6;cursor:wait}.mwf-done{text-align:center;padding:10px 4px}.mwf-done h4{font-size:1.3rem;color:#4E1A38;margin:6px 0 8px}.mwf-done p{color:#5C4A55}'+
  '.mwf-done .mwf-a{justify-content:center;margin-top:18px}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function field(f, i){
    var id='mwf-'+f.k+'-'+i, req=f.req?' <span class="mwf-req">*</span>':'', h='';
    var err='<div class="mwf-err">'+esc(t(['Este dato es necesario','This is required']))+'</div>';
    if(f.t==='radio'||f.t==='multi'){
      var ty=f.t==='radio'?'radio':'checkbox';
      h='<div class="mwf-f" data-k="'+f.k+'" data-req="'+(f.req?1:0)+'" data-t="'+f.t+'"><p>'+esc(t(f.l))+req+'</p><div class="mwf-ch">';
      f.o.forEach(function(o){ h+='<label><input type="'+ty+'" name="'+f.k+'" value="'+esc(o[0])+'"><span>'+esc(t(o))+'</span></label>'; });
      return h+'</div>'+err+'</div>';
    }
    var inp = f.t==='textarea' ? '<textarea id="'+id+'" name="'+f.k+'"></textarea>'
      : '<input id="'+id+'" name="'+f.k+'" type="'+f.t+'"'+(f.ac?' autocomplete="'+f.ac+'"':'')+'>';
    return '<div class="mwf-f" data-k="'+f.k+'" data-req="'+(f.req?1:0)+'" data-t="'+f.t+'"><label for="'+id+'">'+esc(t(f.l))+req+'</label>'+inp+err+'</div>';
  }
  function read(box){
    var d={}, ok=true;
    box.querySelectorAll('.mwf-f').forEach(function(w){
      var k=w.dataset.k, ty=w.dataset.t, v;
      if(ty==='radio'||ty==='multi'){ v=[].map.call(w.querySelectorAll('input:checked'),function(x){return x.value;}).join(', '); }
      else { v=(w.querySelector('input,textarea').value||'').trim(); }
      var bad = w.dataset.req==='1' && !v;
      if(ty==='email' && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) bad=true;
      w.classList.toggle('bad',bad); if(bad) ok=false; d[k]=v;
    });
    return ok?d:null;
  }
  function send(data){
    if(!ENDPOINT) return Promise.resolve();
    var body=new URLSearchParams(); Object.keys(data).forEach(function(k){ body.append(k,data[k]); });
    return fetch(ENDPOINT,{method:'POST',mode:'no-cors',body:body}).catch(function(){});
  }
  function waText(form, data){
    var l=L(), lines=[(l?'Hi Mónica! I\'m interested in: ':'¡Hola Mónica! Me interesa: ')+t(form.ti)];
    [].concat(form.c, form.q).forEach(function(f){ if(data[f.k]) lines.push('• '+t(f.l)+': '+data[f.k]); });
    return 'https://wa.me/'+WA+'?text='+encodeURIComponent(lines.join('\n'));
  }

  function open(key, extra){
    var form=F[key]; if(!form) return false;
    var lead='MW-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
    var base={lead_id:lead, formulario:key, programa:t(form.ti)+(extra?(' · '+extra):''), idioma_web:L()?'EN':'ES', pagina:location.pathname, origen:document.referrer||''};
    var ov=document.createElement('div'); ov.className='mwf-ov'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true');
    var stepsHTML='<div class="mwf-steps"><i class="on"></i><i></i></div>';
    ov.innerHTML='<div class="mwf"><div class="mwf-h"><small>Mindful Wellness</small><h3>'+esc(t(form.ti))+'</h3><button class="mwf-x" type="button" aria-label="Cerrar">×</button>'+stepsHTML+'</div><div class="mwf-b"></div></div>';
    document.body.appendChild(ov); document.body.style.overflow='hidden';
    var b=ov.querySelector('.mwf-b'), bars=ov.querySelectorAll('.mwf-steps i');
    function close(){ ov.remove(); document.body.style.overflow=''; document.removeEventListener('keydown',esc_); }
    function esc_(e){ if(e.key==='Escape') close(); }
    document.addEventListener('keydown',esc_);
    ov.querySelector('.mwf-x').onclick=close; ov.addEventListener('click',function(e){ if(e.target===ov) close(); });
    var contact={};
    function step1(){
      bars[0].className='on'; bars[1].className='';
      b.innerHTML='<p class="mwf-intro">'+esc(t(['Primero, ¿cómo te contactamos? Así no perdemos tu solicitud.','First, how can we reach you? This way your request is never lost.']))+'</p>'+
        form.c.map(field).join('')+
        '<label class="mwf-ok"><input type="checkbox" checked> <span>'+esc(t(['Acepto que Mindful Wellness me contacte sobre esta solicitud.','I agree that Mindful Wellness may contact me about this request.']))+'</span></label>'+
        '<div class="mwf-a"><span></span><button class="mwf-btn" type="button">'+esc(t(['Continuar →','Continue →']))+'</button></div>';
      Object.keys(contact).forEach(function(k){ var el=b.querySelector('[name="'+k+'"]'); if(el) el.value=contact[k]; });
      var f=b.querySelector('input'); if(f) f.focus();
      b.querySelector('.mwf-btn').onclick=function(){
        var d=read(b); if(!d) return; contact=d;
        send(Object.assign({estado:'contacto'},base,d)); step2();
      };
    }
    function step2(){
      bars[0].className='on'; bars[1].className='on';
      b.innerHTML='<p class="mwf-intro">'+esc(t(['Gracias, ','Thank you, ']))+esc((contact.nombre||'').split(' ')[0])+'. '+esc(t(['Cuéntanos un poco más para preparar tu respuesta.','Tell us a little more so we can prepare our reply.']))+'</p>'+
        form.q.map(field).join('')+
        '<div class="mwf-a"><button class="mwf-btn ghost" type="button" data-back>'+esc(t(['← Atrás','← Back']))+'</button><button class="mwf-btn gold" type="button" data-send>'+esc(t(['Enviar solicitud','Send request']))+'</button></div>';
      b.querySelector('[data-back]').onclick=step1;
      b.querySelector('[data-send]').onclick=function(){
        var d=read(b); if(!d){ var e=b.querySelector('.bad'); if(e) e.scrollIntoView({block:'center',behavior:'smooth'}); return; }
        var btn=this; btn.disabled=true; btn.textContent=t(['Enviando…','Sending…']);
        var all=Object.assign({estado:'completo'},base,contact,d);
        send(all).then(function(){ done(all); });
      };
      ov.querySelector('.mwf').scrollTop=0;
    }
    function done(all){
      var wa=waText(form, all);
      b.innerHTML='<div class="mwf-done"><div style="font-size:2rem">💜</div><h4>'+esc(t(['¡Recibimos tu solicitud!','We received your request!']))+'</h4><p>'+
        esc(t(['Mónica revisará lo que nos contaste y te contactará en menos de 24 horas para seguir la conversación.','Mónica will review what you shared and contact you within 24 hours to continue the conversation.']))+'</p>'+
        (ENDPOINT?'':'<p>'+esc(t(['Para enviarla ahora mismo, toca el botón de WhatsApp: el mensaje ya está escrito.','To send it right now, tap the WhatsApp button: the message is already written.']))+'</p>')+
        '<div class="mwf-a"><a class="mwf-btn'+(ENDPOINT?' ghost':'')+'" href="'+wa+'" target="_blank" rel="noopener">'+esc(t([ENDPOINT?'¿Prefieres WhatsApp? Escríbenos':'Enviar por WhatsApp',ENDPOINT?'Prefer WhatsApp? Message us':'Send via WhatsApp']))+'</a><button class="mwf-btn'+(ENDPOINT?'':' ghost')+'" type="button" data-close>'+esc(t(['Cerrar','Close']))+'</button></div></div>';
      b.querySelector('[data-close]').onclick=close;
      if(window.gtag) try{ gtag('event','generate_lead',{form:all.formulario}); }catch(e){}
    }
    step1();
    return true;
  }
  window.MWForm = {open:open, forms:F, post:send, ready:function(){return !!ENDPOINT;}};
  document.addEventListener('click',function(e){
    var a=e.target.closest('[data-form]'); if(!a) return;
    if(open(a.getAttribute('data-form'), a.getAttribute('data-form-extra'))){ e.preventDefault(); e.stopPropagation(); }
  },true);
  /* precios al final: botón "Ver la inversión" */
  document.addEventListener('click',function(e){
    var a=e.target.closest('[data-inv]'); if(!a) return; e.preventDefault();
    var box=document.getElementById(a.getAttribute('data-inv')); if(!box) return;
    box.hidden=!box.hidden; a.setAttribute('aria-expanded',String(!box.hidden));
  });
})();
