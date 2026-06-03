# Component Patternleri

## Component Tasarlama Kuralı

Her component için önce şunları netleştir:

- Ne gösteriyor?
- Hangi aksiyonu destekliyor?
- Hangi state'leri var?
- Tekrar kullanılacak mı?
- Parent componentten hangi verileri almalı?
- Erişilebilir adı ve klavye davranışı var mı?

## Button

- Bir ekranda birincil aksiyon sayısını sınırlı tut.
- İkonlu button kullanıyorsan ikon anlamlı olmalı.
- Sadece ikon olan buttonlarda `aria-label` veya tooltip olmalı.
- Disabled button neden kullanılamadığını mümkünse çevresindeki metinle açıklamalı.

Örnek hiyerarşi:

```tsx
<Button>Kaydet</Button>
<Button variant="outline">Vazgeç</Button>
<Button variant="ghost" size="icon" aria-label="Filtreleri temizle">
  <X className="size-4" />
</Button>
```

## Card

- Metrik kartları kısa başlık, ana değer, küçük trend bilgisi içermeli.
- Liste item kartları tıklanabilir ise hover ve focus-visible state almalı.
- Kart içinde gereksiz açıklama metni biriktirme.

```tsx
<Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Aylık Ciro
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-semibold">₺128.400</div>
    <p className="mt-1 text-xs text-emerald-600">Geçen aya göre %12 artış</p>
  </CardContent>
</Card>
```

## Table

- Tablo tekrarlı operasyonel veri için uygundur.
- Kolon sayısı mobilde taşacaksa kart/list görünümüne geç.
- Satır aksiyonları sağda ve tutarlı yerde olmalı.
- Boş tablo, sadece boş alan değil açıklamalı empty state göstermeli.
- Loading sırasında skeleton satırlar kullan.

Tablo kolonları:

- Birincil kimlik bilgisi solda.
- Durum badge'i orta veya sağ tarafta.
- Para/tarih gibi sayısal bilgiler hizalı olmalı.
- Aksiyon menüsü en sağda.

## List

- Mobilde çoğu tablo listeye dönüşmeli.
- Liste item içinde başlık, alt bilgi, durum ve ana aksiyon yer almalı.
- Liste satır yüksekliği içerikle büyüyebilir ama aksiyonlar zıplamamalı.

## Badge

- Badge kısa durum göstergesi içindir.
- Uzun açıklama badge içinde verilmemeli.
- Renkler anlamla eşleşmeli.

```tsx
<Badge variant="secondary">Hazırlanıyor</Badge>
<Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
  Ödendi
</Badge>
```

## Navigation

- Ana navigasyon görev alanlarına göre gruplanmalı.
- Aktif sayfa belirgin olmalı.
- Mobilde navigation drawer, bottom nav veya kompakt menü kullanılabilir.
- Kullanıcı sık yaptığı aksiyona iki tıklamadan fazla uğraşmadan erişebilmeli.

## Dialog ve Drawer

- Dialog kısa ve odaklı işlemler için.
- Drawer detay inceleme, filtre veya düzenleme akışı için.
- Mobilde geniş formlar dialog yerine tam ekran drawer/sayfa olabilir.
- Kapatma, kaydetme ve iptal davranışı net olmalı.

## State Componentleri

Her veri yüzeyi için ortak state componentleri düşün:

- `LoadingState`: skeleton veya progress
- `EmptyState`: neden boş, sonraki aksiyon
- `ErrorState`: hata nedeni ve tekrar dene aksiyonu
- `SuccessState`: işlem tamamlandı feedback'i

```tsx
function EmptyOrders() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
      <h3 className="text-base font-semibold">Henüz sipariş yok</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        İlk sipariş geldiğinde burada durumunu ve ödeme bilgisini göreceksin.
      </p>
      <Button className="mt-4">Sipariş oluştur</Button>
    </div>
  );
}
```

## Reusability Kontrolü

- Component props'ları domain modelini gereksiz sızdırmamalı.
- Stil varyantları component içinde kontrollü olmalı.
- Aynı layout iki yerde tekrar ediyorsa componentleştir.
- Sadece bir yerde kullanılan karmaşık abstraction ekleme.
