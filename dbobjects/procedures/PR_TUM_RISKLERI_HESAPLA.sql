CREATE OR REPLACE PROCEDURE PR_TUM_RISKLERI_HESAPLA(
    p_tarih IN DATE
) AS
BEGIN
    -- Aktif olan (durum=1) tüm fonlar için sırayla tüm risk prosedürlerini çağırır
    FOR r_fon IN (SELECT FON_KODU FROM TB_FONLAR WHERE DURUM = 'AKTIF') LOOP
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
                -- Bir fonda hata olursa diğer fonların hesaplanması kesilmesin diye Exception burada yakalanır
                -- Opsiyonel: TB_HESAPLAMA_LOG tablosuna insert yapılabilir
                -- DBMS_OUTPUT.PUT_LINE('HATA (Fon: ' || r_fon.FON_KODU || '): ' || SQLERRM);
                NULL;
        END;
    END LOOP;
END;
/
