-- Key Think: ejecutar una vez en el editor SQL de Supabase. Se puede repetir sin riesgo.

-- Nivel actual de los problemas (1 a 3).
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS think_level SMALLINT NOT NULL DEFAULT 1;

-- Una fila por cada intento de respuesta.
CREATE TABLE IF NOT EXISTS think_attempts (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    level          SMALLINT NOT NULL,    -- nivel al responder
    op             TEXT NOT NULL,        -- tipo de problema
    question       TEXT NOT NULL,
    correct_answer INTEGER NOT NULL,
    given_answer   INTEGER NOT NULL,
    is_correct     BOOLEAN NOT NULL,
    attempt_no     SMALLINT NOT NULL,    -- 1 = primer intento, 2 = segundo
    response_ms    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS think_attempts_created_at_idx ON think_attempts (created_at DESC);

-- El juego no tiene inicio de sesión: con la clave pública se puede leer y añadir, pero no cambiar ni borrar.
ALTER TABLE think_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "keythink_read" ON think_attempts;
DROP POLICY IF EXISTS "keythink_insert" ON think_attempts;
CREATE POLICY "keythink_read" ON think_attempts FOR SELECT TO anon USING (true);
CREATE POLICY "keythink_insert" ON think_attempts FOR INSERT TO anon WITH CHECK (true);
GRANT SELECT, INSERT ON think_attempts TO anon;
