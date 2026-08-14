CREATE OR REPLACE PROCEDURE PR_LOG_HATA(
    p_fonkodu IN VARCHAR2,
    p_prosedur_adi IN VARCHAR2,
    p_hata_mesaji IN VARCHAR2
) AS
PRAGMA AUTONOMOUS_TRANSACTION; -- Ana işlemden bağımsız çalışmasını sağlar
BEGIN
    INSERT INTO TB_HESAPLAMA_LOG (FON_KODU, DURUM, HATA_MESAJI)
    VALUES (
        p_fonkodu, 
        'HATA', 
        'Prosedür: ' || p_prosedur_adi || ' - Hata: ' || p_hata_mesaji
    );
    COMMIT;

    exception
        WHEN OTHERS THEN
            Rollback; -- Eğer log yazma sırasında bir hata oluşursa, işlemi geri alıyoruz.
END;
