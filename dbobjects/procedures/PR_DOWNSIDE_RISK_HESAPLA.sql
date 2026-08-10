CREATE OR REPLACE PROCEDURE PR_DOWNSIDE_RISK_HESAPLA(
    p_fonkodu IN VARCHAR2,
    p_tarih IN DATE
) AS
    v_downside_risk NUMBER;
    v_baslangic_tarihi DATE;
BEGIN
    v_baslangic_tarihi := ADD_MONTHS(p_tarih, -12);

    -- 1. ADIM: Matematiksel Downside Risk Formülü
    -- Volatiliteye (Standart Sapma) çok benzer, ancak sadece zararla (negatif) kapanan günlerin sapmasını alır.
    -- Alt sorgu (derived table) ile RAM'de günlük getirileri hesaplayan bir yapı oluşturuyoruz.
    -- 2. ADIM: Hesaplama
    -- LEAST(0, F_GETIRI): Getiri pozitifse (0'dan büyükse) onu 0 sayar. Getiri negatifse kendisini alır.
    -- Böylece sadece kaybettiren (zarar) günlerin kareleri (POWER(..., 2)) toplanır (SUM).
    -- Tıpkı Volatilitede (STDDEV_SAMP) olduğu gibi, burada da popülasyon (N) yerine örneklem (N-1) varyansını baz alıyoruz: COUNT(*) - 1
    -- Bulunan sonucun karekökü (SQRT) alınıp yıllıklandırmak için SQRT(252) ile çarpılır.
    SELECT NVL(SQRT(SUM(POWER(LEAST(0, F_GETIRI), 2)) / NULLIF(COUNT(*) - 1, 0)) * SQRT(252), 0)
    INTO v_downside_risk
    FROM (
        SELECT 
            -- (Bugün - Dün) / Dün formülü ile günlük getiriyi hesaplar (Dünkü fiyatı LAG fonksiyonuyla bulur)
            (BIRIM_FIYAT - LAG(BIRIM_FIYAT) OVER (ORDER BY TARIH)) / NULLIF(LAG(BIRIM_FIYAT) OVER (ORDER BY TARIH), 0) AS F_GETIRI
        FROM TB_FON_FIYAT
        WHERE FON_KODU = p_fonkodu
          AND TARIH BETWEEN v_baslangic_tarihi AND p_tarih
    )
    WHERE F_GETIRI IS NOT NULL;

    -- 3. ADIM: Sonucu Veritabanına Yazma
    UPDATE TB_RISK_SONUC
    SET DOWNSIDE_RISK = v_downside_risk
    WHERE FON_KODU = p_fonkodu AND HESAPLAMA_TARIHI = p_tarih;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20001, 'Downside Risk Hesaplarken Hata: ' || SQLERRM);
END;

