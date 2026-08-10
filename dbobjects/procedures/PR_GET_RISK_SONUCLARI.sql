CREATE OR REPLACE PROCEDURE PR_GET_RISK_SONUCLARI(
    p_fonkodu IN VARCHAR2,
    p_cursor OUT SYS_REFCURSOR
) AS
    v_max_tarih DATE;
    v_fonkodu VARCHAR2(10);
BEGIN
    -- Veritabanındaki en son hesaplanmış tarihi bularak değişkene atıyoruz.
    SELECT MAX(HESAPLAMA_TARIHI) INTO v_max_tarih FROM TB_RISK_SONUC;
    
    -- Gelen fon kodu parametresinin sağındaki ve solundaki gereksiz boşlukları (TRIM) temizliyoruz.
    v_fonkodu := TRIM(p_fonkodu);

    -- P_CURSOR: Spring Boot (Java) tarafına dönecek olan veri tablosudur
    OPEN p_cursor FOR
        -- Risk sonuçları tablosuyla (TB_RISK_SONUC) fon bilgileri tablosunu (TB_FONLAR) fon kodu üzerinden birleştiriyoruz (LEFT JOIN).
        SELECT r.FON_KODU, 
               TO_CHAR(r.HESAPLAMA_TARIHI, 'YYYY-MM-DD') AS HESAPLAMA_TARIHI, -- Tarihi JSON'a uygun String formata çeviriyoruz
               r.BETA, r.ALPHA, r.SHARPE, r.SORTINO, r.TREYNOR, r.VOLATILITE, r.VAR_RMD, 
               r.DOWNSIDE_RISK, r.DEGISIM_KATSAYISI, r.GUNLUK_GETIRI, r.YILLIK_GETIRI, 
               f.FON_ADI, f.FON_TURU AS SEMSIYE, f.FON_KATEGORI, f.KURUCU 
        FROM TB_RISK_SONUC r 
        LEFT JOIN TB_FONLAR f ON r.FON_KODU = f.FON_KODU 
        WHERE r.HESAPLAMA_TARIHI = v_max_tarih -- Sadece son (en güncel) tarihteki verileri getiriyoruz
          AND NVL(f.DURUM, 'AKTIF') = 'AKTIF'  -- Sadece durumu aktif olanları getir (Durumu boş olanlar da aktif sayılır)
          AND (v_fonkodu IS NULL OR r.FON_KODU = v_fonkodu) -- Arayüzden belirli bir fon seçildiyse (filtre) sadece o fonu, seçilmediyse hepsini getirir.
        ORDER BY r.FON_KODU ASC; -- Listeyi fon koduna göre A'dan Z'ye sıralıyoruz.
END;

