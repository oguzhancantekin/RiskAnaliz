package com.demo.riskanaliz.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RiskSonucDTO {
    @JsonProperty("FON_KODU")
    private String fonKodu;
    @JsonProperty("HESAPLAMA_TARIHI")
    private String hesaplamaTarihi;
    @JsonProperty("BETA")
    private BigDecimal beta;
    @JsonProperty("ALPHA")
    private BigDecimal alpha;
    @JsonProperty("SHARPE")
    private BigDecimal sharpe;
    @JsonProperty("SORTINO")
    private BigDecimal sortino;
    @JsonProperty("TREYNOR")
    private BigDecimal treynor;
    @JsonProperty("VOLATILITE")
    private BigDecimal volatilite;
    @JsonProperty("VAR_RMD")
    private BigDecimal varRmd;
    @JsonProperty("DOWNSIDE_RISK")
    private BigDecimal downsideRisk;
    @JsonProperty("DEGISIM_KATSAYISI")
    private BigDecimal degisimKatsayisi;
    @JsonProperty("GUNLUK_GETIRI")
    private BigDecimal gunlukGetiri;
    @JsonProperty("YILLIK_GETIRI")
    private BigDecimal yillikGetiri;
    @JsonProperty("FON_ADI")
    private String fonAdi;
    @JsonProperty("SEMSIYE")
    private String semsiye; // FON_TURU AS SEMSIYE
    @JsonProperty("FON_KATEGORI")
    private String fonKategori;
    @JsonProperty("KURUCU")
    private String kurucu;

    public String getFonKodu() {
        return fonKodu;
    }

    public void setFonKodu(String fonKodu) {
        this.fonKodu = fonKodu;
    }

    public String getHesaplamaTarihi() {
        return hesaplamaTarihi;
    }

    public void setHesaplamaTarihi(String hesaplamaTarihi) {
        this.hesaplamaTarihi = hesaplamaTarihi;
    }

    public BigDecimal getBeta() {
        return beta;
    }

    public void setBeta(BigDecimal beta) {
        this.beta = beta;
    }

    public BigDecimal getAlpha() {
        return alpha;
    }

    public void setAlpha(BigDecimal alpha) {
        this.alpha = alpha;
    }

    public BigDecimal getSharpe() {
        return sharpe;
    }

    public void setSharpe(BigDecimal sharpe) {
        this.sharpe = sharpe;
    }

    public BigDecimal getSortino() {
        return sortino;
    }

    public void setSortino(BigDecimal sortino) {
        this.sortino = sortino;
    }

    public BigDecimal getTreynor() {
        return treynor;
    }

    public void setTreynor(BigDecimal treynor) {
        this.treynor = treynor;
    }

    public BigDecimal getVolatilite() {
        return volatilite;
    }

    public void setVolatilite(BigDecimal volatilite) {
        this.volatilite = volatilite;
    }

    public BigDecimal getVarRmd() {
        return varRmd;
    }

    public void setVarRmd(BigDecimal varRmd) {
        this.varRmd = varRmd;
    }

    public BigDecimal getDownsideRisk() {
        return downsideRisk;
    }

    public void setDownsideRisk(BigDecimal downsideRisk) {
        this.downsideRisk = downsideRisk;
    }

    public BigDecimal getDegisimKatsayisi() {
        return degisimKatsayisi;
    }

    public void setDegisimKatsayisi(BigDecimal degisimKatsayisi) {
        this.degisimKatsayisi = degisimKatsayisi;
    }

    public BigDecimal getGunlukGetiri() {
        return gunlukGetiri;
    }

    public void setGunlukGetiri(BigDecimal gunlukGetiri) {
        this.gunlukGetiri = gunlukGetiri;
    }

    public BigDecimal getYillikGetiri() {
        return yillikGetiri;
    }

    public void setYillikGetiri(BigDecimal yillikGetiri) {
        this.yillikGetiri = yillikGetiri;
    }

    public String getFonAdi() {
        return fonAdi;
    }

    public void setFonAdi(String fonAdi) {
        this.fonAdi = fonAdi;
    }

    public String getSemsiye() {
        return semsiye;
    }

    public void setSemsiye(String semsiye) {
        this.semsiye = semsiye;
    }

    public String getFonKategori() {
        return fonKategori;
    }

    public void setFonKategori(String fonKategori) {
        this.fonKategori = fonKategori;
    }

    public String getKurucu() {
        return kurucu;
    }

    public void setKurucu(String kurucu) {
        this.kurucu = kurucu;
    }
}
