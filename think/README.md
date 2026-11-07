# Key Think

Juego de problemas de razonamiento para un niño de 6 años, derivado de Key Math (`math/` en `luxiodev93.github.io`), que no se modifica.

## Cómo funciona
- Tres problemas seguidos bien resueltos dan 1 hit; un fallo reinicia la racha.
- La sesión termina al llegar a 10 hits o al pulsar Salir. Los hits ganados ya están guardados.
- Tras un fallo hay una pista y otro intento; al terminar cada problema se explica la solución.
- Hay 3 niveles, que cambian según los primeros intentos: sube con 7 de 8 y baja con 3 de 8 o menos.

## Archivos
- `index.html`, `style.css`: interfaz.
- `script.js`: juego, niveles, registro, tienda y modo desarrollador (7 clics en el título).
- `puzzles.js`: generadores de problemas, incluidos los de visión espacial (cuadrículas con emojis, giros, espejos, caminos, dados), que ocupan dos huecos por nivel.
- `supabase_think_attempts.sql`: crea la tabla de respuestas y la columna de nivel. Se ejecuta una vez.

## Datos
Usa el mismo proyecto de Supabase que Key Math: `hits`, `daily_hits` y las recompensas de `user_stats` son compartidos, incluido el límite de 50 hits al día. Las respuestas van a `think_attempts`.

## Publicar
Es una web estática: basta con servir estos archivos, por ejemplo con GitHub Pages. Antes hay que ejecutar el SQL.

`index.html` referencia `sounds/correct.mp3` y `sounds/error.mp3`, que no están incluidos: el juego funciona sin sonido hasta que se añadan.
