# Tasarım Prensipleri

## Genel Yaklaşım

- Arayüz sade, hızlı anlaşılır ve premium hisli olmalı.
- Kullanıcıyı etkilemeye çalışan karmaşık dekorasyon yerine güven veren hiyerarşi kullanılmalı.
- Sayfa, kullanıcının görevini tamamlamasına yardım etmeli; görsel stil görevin önüne geçmemeli.
- Her ekranın bir ana amacı, birincil aksiyonu ve net bilgi sırası olmalı.
- Var olan projenin dili, spacing sistemi, component yapısı ve renkleri korunmalı.

## Hiyerarşi

- En önemli bilgi üstte ve görünür olmalı.
- Birincil aksiyon tek ve belirgin olmalı.
- İkincil aksiyonlar daha sessiz görsel ağırlıkta kalmalı.
- Başlıklar kısa, açıklamalar görev odaklı olmalı.
- Sayfa içi bölümler görsel olarak ayrılmalı fakat ağır kart yığınlarına dönüşmemeli.

## Spacing

- 4px tabanlı spacing mantığını koru.
- Kompakt araç yüzeylerinde `gap-2`, `gap-3`, `p-3`, `p-4` yeterlidir.
- Ana sayfa bölümlerinde `gap-6`, `gap-8`, `py-6`, `py-8` kullanılabilir.
- Kart içi boşluk tutarlı olmalı; aynı ekranda benzer kartlar aynı padding kullanmalı.
- Mobilde yatay padding genellikle `px-4`, desktopta `px-6` veya `px-8` yeterlidir.

## Tipografi

- Başlıklar kısa ve taranabilir olmalı.
- Dashboard içinde hero ölçekli font kullanma.
- İç panel başlıkları küçük ve sıkı tutulmalı: `text-sm font-medium` veya `text-base font-semibold`.
- Sayfa başlığı için çoğu üründe `text-2xl font-semibold` yeterlidir.
- Açıklama metni düşük kontrastlı ama okunabilir olmalı: `text-muted-foreground`.
- Letter spacing varsayılan kalmalı; negatif tracking kullanma.

## Renk ve Kontrast

- Ana renk sadece vurgu ve aksiyon için kullanılmalı.
- Ekranı tek bir renk ailesinin tonlarına boğma.
- Durum renkleri anlamlı olmalı:
  - Başarı: yeşil
  - Uyarı: amber/sarı
  - Hata: kırmızı
  - Bilgi: mavi
- Metin kontrastı WCAG AA seviyesini hedeflemeli.
- Placeholder metin, gerçek label yerine kullanılmamalı.

## Kartlar ve Yüzeyler

- Kartlar tekrar eden item, metrik, modal veya gerçek çerçeveli araçlar için kullanılmalı.
- Sayfanın her bölümünü kart yapma.
- Kart radius değeri genellikle `rounded-lg` veya daha küçük olmalı.
- Kart içi kart kullanmaktan kaçın.
- Gölge yerine çoğu durumda border ve arka plan ayrımı daha profesyonel görünür.

## Etkileşim

- Hover, active, disabled ve focus state her interaktif öğede bulunmalı.
- Button hiyerarşisi açık olmalı:
  - Primary: ana iş
  - Secondary/outline: destek iş
  - Ghost: düşük öncelikli araç
  - Destructive: geri dönüşü zor işlem
- Loading sırasında kullanıcıya sistemin çalıştığı gösterilmeli.
- Başarılı işlem sonrası sessiz ama net feedback verilmeli.
- Hata mesajı sadece neyin yanlış olduğunu değil, mümkünse ne yapılacağını da söylemeli.

## Modern Ama Sakin Görünüm

- Premium hissi büyük dekoratif efektlerden değil, temiz hizalama ve iyi boşluktan gelir.
- Gradient, blur, cam efekti ve parlak gölgeler sadece ürün dilinde zaten varsa kullanılmalı.
- SaaS/admin ekranlarında bilgi yoğunluğu korunmalı; boş alan estetik uğruna işlevi azaltmamalı.
- Görsel yoğunluk kullanıcı rolüne göre ayarlanmalı: operasyonel kullanıcı hızlı tarama ister.
