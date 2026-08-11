CREATE OR REPLACE PROCEDURE PR_TUM_RISKLERI_HESAPLA(
    p_tarih IN DATE
) AS
    v_fiyat_sayisi NUMBER;
BEGIN
    -- 0. Tatil ve Hafta Sonu Kontrolü (Erken Çıkış)
    -- İlgili tarihte sistemde hiç fiyat verisi var mı bakıyoruz.
    -- Eğer o gün için fiyat girilmemişse, işlem günü değildir, bu yüzden doğrudan hata fırlatıyoruz.
    SELECT COUNT(*) INTO v_fiyat_sayisi FROM TB_FON_FIYAT WHERE TARIH = p_tarih;
    
    IF v_fiyat_sayisi = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'HATA: Belirtilen tarih (' || TO_CHAR(p_tarih, 'DD.MM.YYYY') || ') için fiyat verisi bulunamadı. Gün hafta sonuna veya tatile denk gelmiş olabilir.');
    END IF;

    -- 1. Önce Akıllı Veri Sağlığı ve Anomali Tespit motorunu çalıştır
    -- (NMG gibi %100 üstü günlük sıçrama yapan veya ölü fonları PASIF konuma al)
    PR_FON_DURUM_GUNCELLE;

    -- 1. Sadece veri sağlığı temiz olan AKTIF fonlar için risk oranlarını hesapla
    FOR r_fon IN (SELECT FON_KODU FROM TB_FONLAR WHERE NVL(DURUM, 'AKTIF') = 'AKTIF') LOOP
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
                NULL;
        END;
    END LOOP;
END;

