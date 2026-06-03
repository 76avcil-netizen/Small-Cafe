# Dashboard Patternleri

## Dashboard Amacı

Dashboard, kullanıcının sistemi hızlıca anlamasını ve aksiyon almasını sağlar. Sadece güzel grafik dizmek değildir.

Önce şunları belirle:

- Kullanıcı hangi kararı vermek istiyor?
- En kritik 3-5 metrik nedir?
- Hangi sorunlar görünür olmalı?
- Kullanıcı buradan hangi aksiyonlara gitmeli?
- Veri güncelliği nasıl anlaşılacak?

## Layout

- Üstte sayfa başlığı, tarih aralığı ve birincil aksiyon.
- Altında 3-5 metrik kartı.
- Sonra ana grafik veya tablo.
- Sağ/alt bölümde uyarılar, bekleyen işler veya son aktiviteler.
- Mobilde metrik kartları tek/iki kolon, grafikler tam genişlik olmalı.

## Metrik Kartları

Her metrik kartı:

- Kısa label
- Ana değer
- Trend veya context
- Gerekirse küçük ikon

Kaçınılacaklar:

- Çok büyük ikonlar
- Uzun açıklamalar
- Aynı renkte çok fazla kart
- Her metriği aynı önemde göstermek

## Grafikler

- Grafik sadece karar vermeye yardım ediyorsa kullanılmalı.
- Eksen, label ve tooltip okunabilir olmalı.
- Renk sayısı sınırlı tutulmalı.
- Veri yoksa empty chart state gösterilmeli.
- Loading sırasında chart skeleton kullan.

## Tablo ve Aktivite

- Operasyonel dashboardlarda son işlemler tablosu çok değerlidir.
- Satırlar taranabilir olmalı.
- Durum badge'i ve tarih bilgisi görünür olmalı.
- Aksiyon menüsü tutarlı yerde kalmalı.

## Filtreler

- Tarih aralığı, durum ve arama en sık kullanılan filtrelerdir.
- Filtreler üstte kompakt bir toolbar içinde durmalı.
- Çok sayıda filtre varsa drawer veya popover kullan.
- Aktif filtre sayısı görünür olabilir.

## Dashboard State'leri

- Loading: metrik kart skeletonları ve grafik/table skeleton.
- Empty: "Henüz veri yok" + ilk veri oluşturma aksiyonu.
- Error: tekrar dene + mümkünse son başarılı veri zamanı.
- Partial data: çalışmayan bölüm ayrı hata göstermeli, tüm dashboard çökertülmemeli.

## Admin/CRM Kalitesi

- Yoğun veriyi okunabilir kıl.
- Row spacing, column alignment ve badge renkleri tutarlı olsun.
- Sayfa aksiyonları predictable yerlerde kalsın.
- Sidebar/nav aktif durumu net olsun.
- Kullanıcı rolüne göre gereksiz aksiyonları gizle veya disabled hale getir.
