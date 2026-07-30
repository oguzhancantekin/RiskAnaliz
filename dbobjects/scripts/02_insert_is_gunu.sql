DECLARE
    v_start_date DATE := TO_DATE('01.01.2023', 'DD.MM.YYYY');
    v_end_date   DATE := TO_DATE('31.12.2026', 'DD.MM.YYYY');
    v_current    DATE := v_start_date;
    v_is_gunu    NUMBER(1);
    v_day_name   VARCHAR2(20);
BEGIN
    WHILE v_current <= v_end_date LOOP
        v_day_name := TO_CHAR(v_current, 'DY', 'NLS_DATE_LANGUAGE=ENGLISH');
        
        IF v_day_name IN ('SAT', 'SUN') THEN
            v_is_gunu := 0; 
        ELSE
            v_is_gunu := 1; 
        END IF;
        
        -- Veritabanına kayit
        INSERT INTO TB_IS_GUNU (TARIH, IS_GUNU_MU, ACIKLAMA) 
        VALUES (v_current, v_is_gunu, CASE WHEN v_is_gunu = 0 THEN 'Hafta Sonu' ELSE 'İş Günü' END);
        
        -- sonraki güne geç
        v_current := v_current + 1;
    END LOOP;
    
    COMMIT;
END;
/

-- özel günler çıkar 
UPDATE TB_IS_GUNU SET IS_GUNU_MU = 0, ACIKLAMA = 'Yılbaşı' WHERE TO_CHAR(TARIH, 'DD.MM') = '01.01';
UPDATE TB_IS_GUNU SET IS_GUNU_MU = 0, ACIKLAMA = 'Ulusal Egemenlik ve Çocuk Bayramı' WHERE TO_CHAR(TARIH, 'DD.MM') = '23.04';
UPDATE TB_IS_GUNU SET IS_GUNU_MU = 0, ACIKLAMA = 'Emek ve Dayanışma Günü' WHERE TO_CHAR(TARIH, 'DD.MM') = '01.05';
UPDATE TB_IS_GUNU SET IS_GUNU_MU = 0, ACIKLAMA = 'Atatürk''ü Anma, Gençlik ve Spor Bayramı' WHERE TO_CHAR(TARIH, 'DD.MM') = '19.05';
UPDATE TB_IS_GUNU SET IS_GUNU_MU = 0, ACIKLAMA = 'Demokrasi ve Milli Birlik Günü' WHERE TO_CHAR(TARIH, 'DD.MM') = '15.07';
UPDATE TB_IS_GUNU SET IS_GUNU_MU = 0, ACIKLAMA = 'Zafer Bayramı' WHERE TO_CHAR(TARIH, 'DD.MM') = '30.08';
UPDATE TB_IS_GUNU SET IS_GUNU_MU = 0, ACIKLAMA = 'Cumhuriyet Bayramı' WHERE TO_CHAR(TARIH, 'DD.MM') = '29.10';

COMMIT;
