# Operator Panel Roadmap

Son guncelleme: 2026-06-05 23:42 +03

## Tamamlananlar

- `operator` rolu eklendi.
- Operator kullanicilar icin `/operator` rotasi ve sidebar menusu eklendi.
- Operator rolunde restoran operasyon verilerinin otomatik yuklenmesi engellendi.
- Operator paneli demo iskeleti olusturuldu.
- Operator paneli Supabase verisine baglandi:
  - `restaurants`
  - `profiles`
  - `integration_accounts`
  - `integration_events`
- Supabase tarafinda operator rol checkleri, entegrasyon tablolari ve RLS politikalari hazirlandi.
- Login ekranina Operator demo girisi eklendi.
- Otomatik doldurulan email/sifre alanlari icin form submit davranisi duzeltildi.

## Siradaki Asamalar

1. Operator Paneli: Restoran ekle/duzenle
   - `restaurants` tablosuna panelden kayit ekleme.
   - Restoran adi, slug, telefon, adres, para birimi ve tema alanlarini yonetme.
   - Basarili/hata/loading durumlarini net gosterme.

2. Operator Paneli: Kullanici baglama
   - Supabase Auth kullanicisi olusturulduktan sonra profile kaydi baglama.
   - Restoran, ad soyad ve rol secimi.
   - Personel ayrildiginda pasiflestirme veya rol/restoran degistirme akisi.

3. Operator Paneli: Entegrasyon hesabi yonetimi
   - Provider secimi: Yemeksepeti, Feedme, Getir, Trendyol Yemek, Wolt vb.
   - Durum secimi: pending, connected, error, disabled.
   - Credential ve webhook secret bilgilerini frontend'e acmadan referans olarak tutma.

4. Webhook olay merkezi
   - Gelen bildirimleri listeleme.
   - Hata/uyari durumlarini filtreleme.
   - Bildirimi siparise donusturme akisi icin hazirlik.

5. Operator audit log
   - Restoran, kullanici ve entegrasyon degisikliklerini kaydetme.
   - Kim, ne zaman, hangi kaydi degistirdi bilgisini saklama.

## Guvenlik Notlari

- API key, service role key veya platform credential bilgileri frontend'e yazilmayacak.
- Operator paneli sadece `operator` rolune acik kalacak.
- Restoran kullanicilari operator rotalarini ve entegrasyon credential referanslarini gormeyecek.
- Supabase RLS politikalari her yeni tablo icin tekrar kontrol edilecek.

## Bir Sonraki Onerilen Adim

Operator Paneli v1 icin once `Restoran ekle/duzenle` akisini tamamlamak.
