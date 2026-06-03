# Sayfa Patternleri

## Sayfa Tasarlamadan Önce

Kısa plan:

- Kullanıcı bu sayfaya neden geliyor?
- İlk bakışta hangi bilgi görünmeli?
- Birincil aksiyon nedir?
- İkincil aksiyonlar nelerdir?
- Veri yoksa ne olacak?
- Veri yüklenirken ne görünecek?
- Hata olursa kullanıcı nasıl toparlanacak?
- Mobilde hangi içerik önce gelecek?

## Standart App Sayfası

Yapı:

- Üst başlık alanı
- Kısa açıklama veya context
- Sağda/altında ana aksiyon
- Filtre/arama bölümü
- İçerik alanı
- State alanları

```tsx
<main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-2xl font-semibold">Siparişler</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Aktif ve tamamlanan siparişleri takip et.
      </p>
    </div>
    <Button>Yeni sipariş</Button>
  </div>

  <section className="flex flex-col gap-4">
    {/* Filters */}
    {/* Content */}
  </section>
</main>
```

## Detail Sayfası

- Üstte geri dönüş ve ana kimlik bilgisi.
- Kritik durum badge'i başlık alanına yakın olmalı.
- Ana aksiyonlar sağda, mobilde alta alınmalı.
- Detaylar mantıklı gruplara ayrılmalı.
- Audit/history gibi ikincil bilgiler sayfanın altına veya sekmeye alınmalı.

## Create/Edit Sayfası

- Kullanıcının tamamlaması gereken adımlar net olmalı.
- Geniş formlarda tek uzun kolon yerine bölümlendirme kullan.
- Kaydet/iptal aksiyonları sabit veya kolay erişilebilir olmalı.
- Unsaved changes riski varsa uyarı düşün.
- Başarılı işlem sonrası kullanıcının nereye gideceği belirlenmeli.

## Empty İlk Kullanım Sayfası

- Boş ekranı hata gibi gösterme.
- Kullanıcıya neden boş olduğunu ve ilk aksiyonu söyle.
- Çok uzun açıklama yazma.
- Örnek veri veya onboarding aksiyonu varsa sun.

## Error Sayfası

- Hata dili sakin ve net olmalı.
- Teknik hata ayrıntısı kullanıcıya gerekli değilse gizli kalmalı.
- Tekrar dene, geri dön veya destek al aksiyonu ver.

## Success Sayfası

- İşlem tamamlandı bilgisini net ver.
- Sonraki mantıklı aksiyonları göster.
- Gereksiz kutlama animasyonu ekleme; ürün diline uygunsa küçük feedback yeterlidir.

## Landing Olmayan Ürün Ekranları

- Admin/dashboard ekranlarında marketing hero kullanma.
- İlk viewportta görev yapılabilir içerik görünmeli.
- Başlık ve filtre alanı fazla yer kaplamamalı.
- Kullanıcı tekrar tekrar bu ekranı kullanacaksa taranabilirlik estetikten önce gelir.
