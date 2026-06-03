# Mobil Patternleri

## Mobil Öncelikli Düşünme

Mobil görünüm, desktop tasarımın sıkıştırılmış hali değildir. Kullanıcının küçük ekranda en hızlı tamamlaması gereken akış öne alınmalıdır.

Kontrol soruları:

- Mobilde ilk görünen bilgi ne?
- Birincil aksiyon başparmakla kolay erişiliyor mu?
- Tablo listeye dönüşüyor mu?
- Filtreler fazla yer kaplıyor mu?
- Dialog yerine drawer veya tam ekran sayfa daha mı iyi?

## Responsive Layout

- Mobilde tek kolon varsay.
- Tablet için iki kolon, desktop için grid kullanılabilir.
- Sabit genişliklerden kaçın; `minmax`, `max-w`, `w-full` kullan.
- Uzun metinler taşmamalı: `min-w-0`, `truncate`, `break-words` gerektiğinde ekle.
- Toolbarlar mobilde wrap olabilir veya dropdown/drawer'a taşınabilir.

## Navigation

- Küçük uygulamalarda bottom nav işe yarar.
- Çok bölümlü adminlerde sidebar desktopta, drawer mobilde kullanılabilir.
- Aktif rota açıkça görünmeli.
- Mobil menü kapandıktan sonra focus mantıklı yere dönmeli.

## Tablo Yerine Liste

Mobilde tablo yerine kart/liste item kullan:

- Başlık
- Alt bilgi
- Durum
- Kritik sayı/tarih
- Aksiyon menüsü

Bu yapı kullanıcıya yatay scroll yaptırmaktan daha iyidir.

## Formlar

- Input yüksekliği rahat dokunulabilir olmalı.
- İki kolon form mobilde tek kolona dönmeli.
- Date/time/select kontrollerinde native deneyim bozulmamalı.
- Submit butonu uzun formda altta sticky olabilir.

## Dialog ve Drawer

- Küçük confirmation dialog mobilde kullanılabilir.
- Uzun içerik, filtre veya düzenleme akışı için drawer/tam ekran daha uygundur.
- Drawer içeriği scroll edebilir, aksiyon footer'ı sabit kalabilir.

## Dokunma Alanları

- Tıklanabilir alanlar en az 40px, ideal olarak 44px yüksekliğe yakın olmalı.
- İkon butonlar yeterli padding almalı.
- Birbirine çok yakın destructive ve primary aksiyon koyma.

## Performans Hissi

- Mobilde skeleton kısa ve hızlı algılanmalı.
- Çok ağır animasyonlardan kaçın.
- Büyük görseller optimize edilmeli.
- Layout shift yaratacak geç yüklenen içeriklere boyut ver.

## Test Kontrolü

- 360px genişlikte taşma var mı?
- Header aksiyonları sıkışıyor mu?
- Modal/drawer ekran dışında kalıyor mu?
- Button metinleri taşıyor mu?
- Klavye açıldığında form submit alanı erişilebilir mi?
