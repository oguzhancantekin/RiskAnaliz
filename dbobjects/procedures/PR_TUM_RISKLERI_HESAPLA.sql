CREATE OR REPLACE PROCEDURE PR_TUM_RISKLERI_HESAPLA( 
    p_tarih IN DATE,
    p_fonkodu IN VARCHAR2 DEFAULT NULL
) AS
    v_fiyat_sayisi NUMBER;
BEGIN
    -- 0. Tatil ve Hafta Sonu Kontrolü (Erken Çıkış)
    -- İlgili tarihte sistemde hiç fiyat verisi var mı bakıyoruz.
    BEGIN
        SELECT 1 INTO v_fiyat_sayisi 
        FROM TB_FON_FIYAT 
        WHERE TARIH = p_tarih AND ROWNUM = 1; 
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20001, 'HATA: Belirtilen tarih için fiyat verisi bulunamadı. Gün hafta sonuna veya tatile denk gelmiş olabilir.');
    END;

    -- 1. Hedef Fonları Belirle ve Hesapla
    -- Eğer p_fonkodu boşsa (NULL), sadece DURUM = 'AKTIF' olan tüm fonlar için çalışır.
    -- Eğer özel bir fon kodu verilmişse, DURUM'una bakmaksızın (zorunlu olarak) sadece o fon için çalışır.
    FOR r_fon IN (
        SELECT FON_KODU 
        FROM TB_FONLAR 
        WHERE (p_fonkodu IS NULL AND DURUM = 'AKTIF')
           OR (FON_KODU = p_fonkodu)
    ) LOOP
        BEGIN
            -- 1. Temel Getiriler
            PR_GETIRI_HESAPLA(r_fon.FON_KODU, p_tarih);
            
            -- 2. Volatilite ve Beta (Getiriye bağımlı)
            PR_VOLATILITE_HESAPLA(r_fon.FON_KODU, p_tarih);
            PR_BETA_HESAPLA(r_fon.FON_KODU, p_tarih);
            PR_DOWNSIDE_RISK_HESAPLA(r_fon.FON_KODU, p_tarih);
            
            -- 3. Gelişmiş Oranlar (Üsttekilere bağımlı)
            PR_SHARPE_HESAPLA(r_fon.FON_KODU, p_tarih);
            PR_SORTINO_HESAPLA(r_fon.FON_KODU, p_tarih);
            PR_TREYNOR_HESAPLA(r_fon.FON_KODU, p_tarih);
            PR_ALPHA_HESAPLA(r_fon.FON_KODU, p_tarih);
            PR_DEGISIM_KATSAYISI_HESAPLA(r_fon.FON_KODU, p_tarih);
            PR_RMD_HESAPLA(r_fon.FON_KODU, p_tarih);
            
        EXCEPTION
            WHEN OTHERS THEN
                PR_LOG_HATA(r_fon.FON_KODU, 'PR_TUM_RISKLERI_HESAPLA', SQLERRM);
        END;
    END LOOP;
END;

