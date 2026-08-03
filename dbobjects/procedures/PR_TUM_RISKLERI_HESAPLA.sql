CREATE OR REPLACE PROCEDURE PR_TUM_RISKLERI_HESAPLA(
    p_tarih IN DATE
) AS
BEGIN
    -- 0. Önce Akıllı Veri Sağlığı ve Anomali Tespit motorunu çalıştır
    -- (NMG gibi %100 üstü günlük sıçrama yapan veya ölü fonları PASIF konuma al)
    PR_FON_DURUM_GUNCELLE;

    -- 1. Sadece veri sağlığı temiz olan AKTIF fonlar için risk oranlarını hesapla
    FOR r_fon IN (SELECT FON_KODU FROM TB_FONLAR WHERE NVL(DURUM, 'AKTIF') = 'AKTIF') LOOP --tüm fonlar için bu spleri çağırması performans olarak ne kadar sürüyor
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
/
