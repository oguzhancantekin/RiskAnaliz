CREATE OR REPLACE PROCEDURE PR_SAVE_FON(
    p_fonkodu IN VARCHAR2,
    p_fonadi IN VARCHAR2,
    p_fonturu IN VARCHAR2
) AS
BEGIN
    -- Sadece veritabanında henüz bulunmayan yeni fonları ekle (Zaten varsa işlem yapma)
    INSERT INTO TB_FONLAR (FON_KODU, FON_ADI, FON_TURU)
    SELECT p_fonkodu, p_fonadi, p_fonturu
    FROM DUAL
    WHERE NOT EXISTS (
        SELECT 1 FROM TB_FONLAR WHERE FON_KODU = p_fonkodu
    );
END;
