# language: es
Característica: Ficha de persona
  Como cinéfilo
  Quiero ver la información de un actor o un director
  Para descubrir otras películas en las que ha participado

  Escenario: Abrir la ficha desde su URL
    Cuando entro en /personas/578
    Entonces se piden a TMDB los datos de la persona 578
    Y mientras llegan veo un mensaje de carga

  Escenario: Ver los datos de la persona
    Dado que TMDB devuelve la persona
    Entonces veo su nombre, su foto, su fecha y lugar de nacimiento y su biografía
    Y veo su fecha de fallecimiento solo si ha fallecido

  Escenario: Ver su filmografía
    Dado que la persona ha actuado en unas películas y ha dirigido otras
    Entonces veo la sección «Como intérprete» con las películas en las que actúa
    Y veo la sección «Como director» solo con las películas que dirige
    Y en cada sección las películas más recientes aparecen primero
    Y cada película enlaza a su ficha /peliculas/:id

  Escenario: Datos ausentes
    Dado una persona sin foto, biografía, fecha ni lugar de nacimiento ni películas
    Cuando se muestra su ficha
    Entonces veo el texto «no disponible» correspondiente en cada dato

  Escenario: Identificador no válido
    Cuando entro en /personas/abc
    Entonces no se hace ninguna petición
    Y veo un mensaje de dirección no válida con un enlace para volver a explorar

  Escenario: Reintentar tras un error
    Dado que TMDB no responde
    Cuando veo el mensaje de error
    Y pulso «Reintentar»
    Entonces se repite la petición
    Y veo la persona si esta vez responde

  Escenario: Pasar de una persona a otra
    Dado que estoy en la ficha de la persona 578
    Cuando navego a /personas/4587
    Entonces se cargan los datos de la persona 4587 sin recargar la aplicación
