---
name: lovable-ui-ux
description: React, Vite, Next.js, Tailwind, shadcn/ui ve benzeri modern frontend projelerinde sade, premium hissi veren, responsive, erişilebilir ve reusable UI/UX üretmek için kullanılır. Yeni sayfa, dashboard, admin panel, CRM, restoran/büfe yönetimi, finans takip, teknik servis, mobil uyumlu uygulama, form, tablo, kart, liste veya component tasarlarken önce kullanıcı akışını, layout'u, loading/empty/error/success state'lerini ve mobil görünümü planlatır; mevcut proje yapısına uyumlu modern SaaS/no-code builder kalitesinde arayüzler üretmeye rehberlik eder.
metadata:
  short-description: Modern SaaS kalitesinde reusable UI/UX rehberi
---

# Lovable UI/UX Skill

Bu skill, modern no-code/SaaS builder kalitesinden ilham alan fakat herhangi bir markayı taklit etmeyen bir UI/UX üretim yaklaşımı sağlar. Amaç hızlı, temiz, kullanıcı dostu, responsive, erişilebilir ve sürdürülebilir arayüzler üretmektir.

## Ne Zaman Kullanılır

- Yeni sayfa, dashboard, admin panel, CRM, restoran/büfe yönetimi, finans takip, teknik servis veya mobil uyumlu uygulama ekranı istenirse.
- React, Vite, Next.js, Tailwind, shadcn/ui veya benzeri frontend projelerinde component geliştirilecekse.
- Var olan bir ekran daha modern, sade, responsive veya premium hisli hale getirilecekse.
- Form, tablo, liste, kart, navigation, empty state, loading state, error state veya success state tasarlanacaksa.
- Kullanıcı akışı netleşmeden kod yazma riski varsa.

## Temel İş Akışı

1. Projeyi oku: framework, routing, component klasörleri, styling sistemi, shadcn/ui varlığı ve mevcut tasarım dilini kontrol et.
2. Koddan önce kısa UI/UX planı çıkar:
   - Kullanıcı amacı
   - Sayfa hiyerarşisi
   - Ana aksiyonlar
   - Veri/state ihtiyaçları
   - Loading, empty, error, success state
   - Mobil davranış
3. Mevcut component yapısına uy:
   - shadcn/ui varsa onu tercih et.
   - Yoksa sade, okunabilir Tailwind componentleri kullan.
   - Gereksiz dependency ekleme.
4. Reusable component üret:
   - Tekrar eden kart, tablo, filtre, form alanı ve durum görünümünü ayrıştır.
   - Abstraction sadece gerçek tekrar veya karmaşıklık varsa ekle.
5. Responsive ve erişilebilir kontrol yap:
   - Klavye kullanımı
   - Focus state
   - Kontrast
   - Mobil kırılım
   - Taşan metin
6. Son kontrolde state'leri ve temel kullanıcı akışını doğrula.

## Referans Dosyaları

İhtiyaca göre sadece ilgili dosyayı oku:

- Genel tasarım kararları için [design-principles.md](design-principles.md)
- Reusable component örüntüleri için [component-patterns.md](component-patterns.md)
- Sayfa kompozisyonları için [page-patterns.md](page-patterns.md)
- Dashboard/admin/CRM ekranları için [dashboard-patterns.md](dashboard-patterns.md)
- Form UX ve validasyon davranışı için [form-patterns.md](form-patterns.md)
- Mobil ve responsive davranış için [mobile-patterns.md](mobile-patterns.md)
- Erişilebilirlik kontrolü için [accessibility-checklist.md](accessibility-checklist.md)
- Koddan önce kullanılacak kısa plan/prompt parçaları için [prompt-snippets.md](prompt-snippets.md)

## Karar Kuralları

- Marka taklidi yapma; modern, sade, net ve kaliteli ürün arayüzü üret.
- Sayfa ilk açıldığında kullanıcının ne yapacağı 3 saniye içinde anlaşılmalı.
- Görsel kaliteyi animasyon veya dekorasyonla değil, hiyerarşi, spacing, tipografi ve tutarlılıkla kur.
- Dashboard ve operasyonel panellerde yoğun ama okunabilir bilgi düzeni tercih et; landing page estetiğini admin ekranlarına taşıma.
- Her sayfanın normal, loading, empty, error ve success durumunu düşün.
- Tailwind class'larını kısa, gruplanabilir ve okunabilir tut.
- Ekranın mobile hali sonradan ek değil, tasarımın parçası olsun.
- Gereksiz renk, gölge, gradient, kart içi kart ve bağımlılık ekleme.
