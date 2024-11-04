CREATE TABLE landing_page_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    content_en TEXT NOT NULL,
    content_es TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert initial content
INSERT INTO landing_page_content (key, content_en, content_es) VALUES
('hero_title', 'VERDAD detects and tracks coordinated mis/disinformation on the radio', 'VERDAD detecta y rastrea la desinformación coordinada en la radio'),
('hero_description', 'VERDAD gives journalists powerful tools to investigate content targeting immigrant and minority communities through their trusted media sources. By recording radio broadcasts, then transcribing, translating, and analyzing them in real-time, we help journalists to investigate campaigns designed to spread false information.', 'VERDAD proporciona a los periodistas herramientas poderosas para investigar contenido dirigido a comunidades inmigrantes y minoritarias a través de sus fuentes de medios confiables. Al grabar transmisiones de radio, luego transcribirlas, traducirlas y analizarlas en tiempo real, ayudamos a los periodistas a investigar campañas diseñadas para difundir información falsa.'),
('footer_text', 'Created by journalist Martina Guzmán, designed and built by Public Data Works, with support from the Reynolds Journalism Institute, the Damon J. Keith Center for Civil Rights, and the MacArthur Foundation.', 'Creado por la periodista Martina Guzmán, diseñado y construido por Public Data Works, con el apoyo del Reynolds Journalism Institute, el Damon J. Keith Center for Civil Rights y la Fundación MacArthur.');

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_landing_page_content_updated_at
    BEFORE UPDATE ON landing_page_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
