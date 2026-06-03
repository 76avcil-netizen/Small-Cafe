# Prompt Snippetleri

Bu parçalar, Codex'in kod yazmadan önce kısa UI/UX planı çıkarması ve tutarlı uygulama yapması için kullanılabilir.

## Yeni Sayfa

```text
Bu sayfayı geliştirmeden önce kısa bir UI/UX planı çıkar:
- kullanıcı amacı
- layout hiyerarşisi
- primary/secondary aksiyonlar
- loading, empty, error, success state
- mobil davranış
Sonra mevcut proje yapısına uyup uygula. shadcn/ui varsa onu kullan, yoksa sade Tailwind componentleri oluştur. Gereksiz dependency ekleme.
```

## Dashboard

```text
Bu dashboard için önce karar odaklı bir plan çıkar:
- en kritik metrikler
- ana grafik/tablo alanı
- filtreler
- son aktiviteler veya bekleyen işler
- loading/empty/error state
- mobilde kart ve liste düzeni
Ardından responsive, sade ve operasyonel kullanıma uygun UI uygula.
```

## Form

```text
Bu formu kodlamadan önce alan gruplarını, validasyon davranışını, submit/loading/error/success state'lerini ve mobil layout'u planla. Label, yardım metni, hata mesajı ve klavye erişilebilirliğini ihmal etmeden mevcut component sistemine uygun uygula.
```

## Component Refactor

```text
Bu componenti reusable hale getirirken mevcut API'yi ve tasarım dilini koru. Tekrar eden layout/stil parçalarını sade props veya küçük alt componentlerle ayrıştır. Gereksiz abstraction ve yeni dependency ekleme. Hover, disabled, loading ve erişilebilirlik state'lerini kontrol et.
```

## Mobil İyileştirme

```text
Bu ekranı mobil için iyileştir:
- 360px genişlikte taşma kontrolü
- tablo varsa liste/kart alternatifi
- toolbar ve filtrelerin mobil davranışı
- dokunma hedefleri
- dialog/drawer uygunluğu
- button metinlerinin sığması
Sonra desktop deneyimini bozmadan uygula.
```

## Empty/Error State

```text
Bu veri yüzeyi için anlamlı loading, empty ve error state ekle. Empty state kullanıcıya neden boş olduğunu ve sonraki mantıklı aksiyonu söylesin. Error state tekrar dene veya geri dön aksiyonu içersin. Görsel stil mevcut proje ile uyumlu ve erişilebilir olsun.
```

## Tasarım Kalitesi Kontrolü

```text
Uygulamadan sonra kısa kalite kontrol yap:
- spacing ve typography tutarlı mı?
- primary action net mi?
- mobile layout taşmıyor mu?
- loading/empty/error/success state var mı?
- klavye ve focus state çalışıyor mu?
- mevcut component yapısına uyuldu mu?
```
