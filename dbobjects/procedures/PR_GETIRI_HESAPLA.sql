create or replace procedure PR_GETIRI_HESAPLA(
    p_fonkodu in varchar2,
    p_tarih in date
) AS
-- tarihleri tutacak degiskenler
V_DUN_TARIH DATE;
V_GECEN_YIL_TARIH DATE;

-- fiyatlari tutacak degiskenler
V_BUGUN_FIYAT NUMBER;
V_DUN_FIYAT NUMBER;
V_GECEN_YIL_FIYAT NUMBER;

-- sonuclari tutacak degiskenler
V_GUNLUK_GETIRI NUMBER;
V_YILLIK_GETIRI NUMBER;

V_BASLANGIC_TARIHI DATE;

BEGIN
V_BASLANGIC_TARIHI := ADD_MONTHS(p_tarih, -12);

-- bugunden kucuk en yakin is gunu (Bir önceki iş gününü buluyoruz ki günlük getiriyi hesaplayabilelim)
SELECT MAX(tarih) INTO V_DUN_TARIH 
FROM TB_IS_GUNU
WHERE TARIH < p_tarih
AND IS_GUNU_MU = 1;

-- Yıllık getiri hesaplamak için 1 yıl (12 ay) önceki güne veya ona en yakın ileri tarihteki ilk iş gününe gidiyoruz.
SELECT MIN(tarih)
INTO V_GECEN_YIL_TARIH
FROM TB_IS_GUNU
WHERE TARIH >= V_BASLANGIC_TARIHI
AND IS_GUNU_MU = 1;

-- İlgili fonun parametre olarak gönderilen bugünkü kapanış fiyatını (birim fiyat) çekiyoruz.
SELECT birim_fiyat INTO V_BUGUN_FIYAT FROM TB_FON_FIYAT
WHERE FON_KODU = p_fonkodu
AND TARIH = p_tarih;

-- İlgili fonun bulduğumuz 'bir önceki iş gününe' ait fiyatını çekiyoruz.
SELECT birim_fiyat into V_DUN_FIYAT from TB_FON_FIYAT
where FON_KODU=p_fonkodu
and tarih=V_DUN_TARIH;

-- İlgili fonun bulduğumuz '1 yıl önceki' fiyatını çekiyoruz.
SELECT birim_fiyat into V_GECEN_YIL_FIYAT from TB_FON_FIYAT
where FON_KODU=p_fonkodu
and tarih=V_GECEN_YIL_TARIH;

-- Temel Getiri Formülleri: (Bugünkü Fiyat - Eski Fiyat) / Eski Fiyat * 100
-- 1. Günlük Getiri (Yüzde cinsinden)
V_GUNLUK_GETIRI := (V_BUGUN_FIYAT-V_DUN_FIYAT)*100/(V_DUN_FIYAT);

-- 2. Yıllık Getiri (Yüzde cinsinden)
V_YILLIK_GETIRI := (V_BUGUN_FIYAT-V_GECEN_YIL_FIYAT)*100/(V_GECEN_YIL_FIYAT);

-- Hesaplanan sonuçları veritabanına kaydetme (Insert/Update)
-- MERGE komutu (Upsert) "Eğer veri varsa GÜNCELLE, yoksa YENİ EKLE" mantığıyla çalışır. ("Idempotency")
-- Bu sayede aynı tarih için prosedür 2 kere çalıştırılırsa hata vermez veya veriyi çiftlemez, sadece eski veriyi ezer.
MERGE INTO TB_RISK_SONUC trs
USING (SELECT p_fonkodu AS FON, p_tarih AS TAR, V_GUNLUK_GETIRI AS GG, V_YILLIK_GETIRI AS YG FROM DUAL) src
ON (trs.FON_KODU = src.FON AND trs.HESAPLAMA_TARIHI = src.TAR)
WHEN MATCHED THEN
    UPDATE SET trs.GUNLUK_GETIRI = src.GG, trs.YILLIK_GETIRI = src.YG
WHEN NOT MATCHED THEN
    INSERT (FON_KODU, HESAPLAMA_TARIHI, GUNLUK_GETIRI, YILLIK_GETIRI)
    VALUES (src.FON, src.TAR, src.GG, src.YG);

END;
/