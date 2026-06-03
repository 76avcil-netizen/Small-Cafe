# Erişilebilirlik Checklist

## Semantik

- Sayfada anlamlı `main`, `header`, `nav`, `section` kullan.
- Başlık hiyerarşisi sıralı olsun.
- Button ile link rolleri karıştırılmasın.
- Tıklanabilir div yerine mümkünse `button` veya `a` kullan.

## Klavye

- Tüm interaktif öğelere Tab ile erişilebilmeli.
- Focus görünür olmalı.
- Dialog açıldığında focus dialog içine geçmeli.
- Dialog kapanınca focus tetikleyen öğeye dönmeli.
- Escape ile kapanması beklenen yüzeyler kapanmalı.

## İsimlendirme

- İkon-only buttonlarda `aria-label` olmalı.
- Form alanları label ile ilişkilendirilmeli.
- Hata ve yardım metinleri input ile bağlanmalı.
- Badge tek başına kritik anlam taşıyorsa metin anlaşılır olmalı.

## Kontrast

- Normal metin WCAG AA kontrast hedefini karşılamalı.
- Disabled metin okunmayacak kadar soluk olmamalı.
- Renk tek başına anlam taşımasın; durum metni veya ikonla destekle.
- Focus ring arka planda görünür olmalı.

## Formlar

- Required alanlar programatik ve görsel olarak belirtilmeli.
- Hata mesajları alanın altında ve net olmalı.
- Submit hatasında kullanıcı hatalı alana yönlendirilebilmeli.
- Placeholder label yerine geçmemeli.

## Dinamik İçerik

- Loading state ekran okuyucuyu gereksiz tekrarlarla boğmamalı.
- Toast/alert önemliyse uygun canlı bölge davranışı düşün.
- İçerik değişince focus kaybolmamalı.

## Mobil

- Dokunma hedefleri yeterli büyüklükte olmalı.
- Pinch zoom engellenmemeli.
- Yatay scroll sadece bilinçli ve gerekli yerlerde olmalı.
- Sticky footer/header içerik üstünü kapatmamalı.

## Son Kontrol

- Mouse olmadan ana akış tamamlanabiliyor mu?
- Ekran okuyucu için temel isimler anlamlı mı?
- Renk körlüğünde durumlar anlaşılır mı?
- 360px mobil genişlikte içerik taşmıyor mu?
- Loading, empty, error ve success state'leri erişilebilir mi?
