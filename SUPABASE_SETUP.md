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

Yeni Supabase projesinde SQL Editor içinde tek seferde çalıştırın:

1. `supabase/new_project_setup.sql`

Bu dosya restoran bazlı tabloları, indeksleri, `updated_at` triggerlarını, RLS politikalarını ve demo menü verisini birlikte oluşturur.

Supabase'in yeni proje ayarlarında tablolar Data API'ye otomatik açılmayabilir. `new_project_setup.sql` bu yüzden gerekli `GRANT` izinlerini açıkça verir; RLS politikaları satır erişimini yine kullanıcı profilindeki restoranla sınırlar.

Var olan eski kurulumlarda gerekirse ayrı dosyalar hâlâ kullanılabilir:

1. `supabase/schema.sql`
2. `supabase/rls.sql`
3. `supabase/seed.sql`
4. `supabase/add_restaurant_settings_columns.sql`
5. `supabase/add_order_location_columns.sql`

Eğer Supabase istekleri `500` ve `42P17 infinite recursion detected in policy for relation "profiles"` hatası döndürürse, SQL Editor içinde `supabase/fix_rls_recursion.sql` dosyasını çalıştırın.

Hata devam ederse, SQL Editor içinde `supabase/reset_menu_read_policies.sql` dosyasını çalıştırın. Bu dosya Menü ekranı için `products` ve `categories` public demo okuma politikalarını temiz şekilde yeniden kurar.

## 4. Auth Kullanıcısını Restorana Bağlama

1. Supabase Dashboard > Authentication > Users içinde kullanıcıyı oluşturun.
2. `supabase/link_user_profile.sql` dosyasında `CHANGE_ME@example.com`, isim, rol ve restoran slug değerlerini düzenleyin.
3. Dosyayı SQL Editor içinde çalıştırın.

Eski `supabase/link_admin_profile.sql` dosyası artık sadece geriye dönük yönlendirme notu içerir.

## 5. Lokal Çalıştırma

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

## 6. Entegrasyon Durumu

- Supabase env değerleri varsa gerçek Auth akışı kullanılır; yoksa demo giriş çalışır.
- Menü, ayarlar, sipariş, muhasebe giderleri, sarf/ikram stokları ve operatör paneli restoran profili üzerinden Supabase verisine bağlanır.
- Demo giriş geliştirme ve fallback için korunur.
- Realtime sipariş takibi henüz etkin değil.

## 7. Uzak Deploy Notları

Uzak makinede veya statik hosting sağlayıcısında şu ortam değişkenleri build öncesi tanımlanmalıdır:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
```

Supabase Auth ayarlarında production domaini `Site URL` ve `Redirect URLs` listesine ekleyin. React Router kullandığımız için sunucu tarafında `/orders`, `/accounting`, `/operator` gibi yolların `index.html` dosyasına düşmesi gerekir. Ayrıntılar için `DEPLOYMENT.md` dosyasına bakın.

## 8. Sonraki Entegrasyon Sırası

1. Masa ve rapor ekranlarını sırayla Supabase tablolarına bağlayın.
2. Realtime sipariş takibini etkinleştirin.
3. Remote şema kesinleşince tipleri üretin:

```bash
npx supabase gen types typescript --project-id <project-id> --schema public > src/types/database.ts
```

## 9. Proje Temizlik Notları

- `node_modules/` bağımlılık klasörüdür; repoya eklenmez, `npm install` ile yeniden oluşturulur.
- `dist/` üretim build çıktısıdır; repoya eklenmez, `npm run build` ile yeniden oluşturulur.
- `.env.local` lokal gizli ayar dosyasıdır; repoya eklenmez.
- `.agents/` ve `skills-lock.json` uygulama runtime'ı için gerekli değildir, ajan destekli geliştirme için tutulabilir.
