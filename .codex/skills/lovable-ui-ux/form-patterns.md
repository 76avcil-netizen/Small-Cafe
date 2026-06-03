# Form Patternleri

## Form Tasarlamadan Önce

- Kullanıcı neden bu formu dolduruyor?
- Hangi alanlar zorunlu?
- Hangi alanlar sonradan doldurulabilir?
- Hangi validasyon client tarafında yapılmalı?
- Başarılı kayıttan sonra ne olacak?
- Kaydetme başarısız olursa veri korunacak mı?

## Form Yapısı

- Label her zaman görünür olmalı.
- Placeholder yardımcı örnek olabilir, label yerine geçmez.
- Alanlar mantıklı gruplara ayrılmalı.
- Zorunlu alanlar net belirtilmeli.
- Yardım metni kısa ve alanın altında olmalı.
- Hata mesajı alanın hemen altında gösterilmeli.

## Layout

- Kısa formlar tek kolon olabilir.
- İlişkili kısa alanlar desktopta iki kolon olabilir.
- Mobilde tüm alanlar tek kolon olmalı.
- Aksiyon butonları form sonunda veya uzun formlarda sticky footer içinde olmalı.

## Validasyon

- Kullanıcı yazarken agresif hata gösterme.
- Blur sonrası veya submit sonrası hata göstermek çoğu durumda daha iyidir.
- Hata mesajı çözüm odaklı olmalı.
- Server hatası form değerlerini silmemeli.

## Loading ve Submit

- Submit sırasında button loading state almalı.
- Aynı formun çift submit edilmesi engellenmeli.
- Başarılı işlem sonrası toast, inline success veya yönlendirme kullanılmalı.
- Hata olursa form üzerinde net feedback verilmeli.

```tsx
<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
</Button>
```

## Select ve Combobox

- Kısa seçenek listelerinde select yeterlidir.
- Uzun veya aranabilir listelerde combobox kullan.
- Boş seçenek durumunu düşün.
- Seçim temizlenebiliyorsa açık bir temizleme aksiyonu sun.

## Dosya Yükleme

- Kabul edilen dosya tipleri ve limitler görünür olmalı.
- Upload progress gösterilmeli.
- Hatalı dosya için net mesaj verilmeli.
- Drag/drop varsa click ile seçim alternatifi de olmalı.

## Tehlikeli İşlemler

- Silme, iptal, ödeme alma gibi işlemlerde destructive variant kullan.
- Geri dönüşü zor işlemde confirmation dialog iste.
- Confirmation metni kısa ve spesifik olmalı.

## Form Erişilebilirliği

- `label` ile input ilişkilendirilmeli.
- Hata mesajı `aria-describedby` ile bağlanmalı.
- Required alanlar programatik olarak belirtilmeli.
- Tab sırası görsel sırayla uyumlu olmalı.
