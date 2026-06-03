# RestoYonet Supabase Kurulumu

Bu proje Supabase bağlantısı geçerliyse Menü ekranında Supabase verisini kullanır. Bağlantı eksik veya hatalıysa geliştirme sırasında mock data akışı çalışmaya devam eder.

## 1. Supabase Projesi Oluşturma

1. Supabase hesabınızda yeni bir proje oluşturun.
2. Project Settings > API bölümünden Project URL ve anon public key değerlerini alın.
3. Proje kökünde `.env.local` oluşturun:

```bash
cp .env.example .env.local
```

4. `.env.local` içini doldurun:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Gerçek anahtarları repoya commit etmeyin.

## 2. Bağımlılık

Supabase istemcisi projeye eklendi. Gerekirse tekrar kurmak için:

```bash
npm install @supabase/supabase-js
```

## 3. Veritabanı Kurulumu

Supabase SQL Editor içinde sırayla çalıştırın:

1. `supabase/schema.sql`
2. `supabase/rls.sql`
3. `supabase/seed.sql`

Eğer Supabase istekleri `500` ve `42P17 infinite recursion detected in policy for relation "profiles"` hatası döndürürse, SQL Editor içinde `supabase/fix_rls_recursion.sql` dosyasını çalıştırın.

Hata devam ederse, SQL Editor içinde `supabase/reset_menu_read_policies.sql` dosyasını çalıştırın. Bu dosya Menü ekranı için `products` ve `categories` public demo okuma politikalarını temiz şekilde yeniden kurar.

`schema.sql` restoran bazlı çok kiracılı mimariyi, tabloları, indeksleri ve `updated_at` triggerlarını oluşturur.

`rls.sql` kullanıcı profilindeki `restaurant_id` üzerinden tenant izolasyonu için başlangıç RLS politikalarını ekler.

`seed.sql` gerçek auth kullanıcısı gerektirmeden demo restoran, kategori ve ürün verisi oluşturur.

## 4. Lokal Çalıştırma

```bash
npm install
npm run dev
```

Eksik Supabase env değerleri lokal mock geliştirmeyi bozmaz; konsolda geliştirici uyarısı gösterilir.

`.env.local` dosyasını düzenledikten sonra Vite dev server tamamen yeniden başlatılmalıdır:

```bash
Ctrl + C
npm run dev
```

## 5. Henüz Bağlı Olmayanlar

- Sipariş ekranı hâlâ mock data + Zustand kullanıyor.
- Auth akışı henüz eklenmedi.
- Profil oluşturma ve restoran seçimi henüz UI tarafına bağlanmadı.
- Realtime sipariş takibi henüz etkin değil.

## 6. Sonraki Entegrasyon Sırası

1. Supabase Auth ekleyin ve giriş yapan kullanıcının `profiles.restaurant_id` bilgisini okuyacak küçük bir session/profile store oluşturun.
2. `restaurantsService` ve `profilesService` dosyalarını ayarlar/profil ekranına bağlayın.
3. Menü ekranındaki ürün ekleme, düzenleme, silme ve stok durumu işlemlerini `productsService` üzerinden Supabase'e taşıyın.
4. Sipariş ekranını `ordersService` ile Supabase'e bağlayın; mock siparişleri sadece demo fallback olarak bırakın.
5. Masa, muhasebe ve rapor ekranlarını sırayla Supabase tablolarına bağlayın.
6. Remote şema kesinleşince tipleri üretin:

```bash
npx supabase gen types typescript --project-id <project-id> --schema public > src/types/database.ts
```

`src/services/ordersService.ts`, `src/services/profilesService.ts` ve `src/services/restaurantsService.ts` şu an bu sıradaki entegrasyonlar için hazır bekleyen servis dosyalarıdır.

## 7. Proje Temizlik Notları

- `node_modules/` bağımlılık klasörüdür; repoya eklenmez, `npm install` ile yeniden oluşturulur.
- `dist/` üretim build çıktısıdır; repoya eklenmez, `npm run build` ile yeniden oluşturulur.
- `.env.local` lokal gizli ayar dosyasıdır; repoya eklenmez.
- `.agents/` ve `skills-lock.json` uygulama runtime'ı için gerekli değildir, ajan destekli geliştirme için tutulabilir.
