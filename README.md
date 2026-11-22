# Görünür — statik web sitesi

Düz HTML + CSS + JavaScript. Kurulum, derleme ya da sunucu gerekmez.

## Açmak
`index.html` dosyasına çift tıklayın. (Yazı tipi Google Fonts'tan geldiği için internet bağlantısı varsa Outfit fontu yüklenir; yoksa sistem fontu kullanılır.)

## Dosyalar
- `index.html` ana sayfa · `en.html` İngilizce
- `fiyatlar.html`, `karne.html`, `harita-kaydi.html`, `yorum-karti.html`, `yorum-cevabi.html`, `harita-reklami.html`
- `gizlilik.html`, `cerezler.html`, `kosullar.html` (taslak yasal metinler)
- `style.css` tüm stiller; renkler, yazı boyutları, köşeler, gölgeler ve geçişler dosyanın başında CSS değişkeni olarak tanımlı
- `main.js` tema, mobil menü, hero slaytı, kaydırınca belirme, çerez banner'ı, karne formu, WhatsApp linkleri
- `assets/img/` yorum ve ısı haritası görselleri (WebP, 1000 px ve 600 px)
- `sitemap.xml`, `robots.txt`, `favicon.svg`

## Doldurulacak yerler
- WhatsApp numarası: `main.js` içinde `WA_NUMBER = '905xxxxxxxxx'` (tek yerden değişir). HTML'deki `href="https://wa.me/905xxxxxxxxx"` sadece JS kapalıyken kullanılan yedek.
- `X Kişi`, `X Şirketi`, `X Semti`, `05xx xxx xx xx`, `info@gorunur.com`, `kvkk@gorunur.com`, `gorunur.com`
- İstatistikler: `[10'da 7]`, `[4'te 1]`, `[N]`, `[Ay Yıl]`, `[sektör]`
- Fiyatlar (analiz dosyasındaki referans tutarlar kullanıldı) ve `[600 TL]`, `[3,60 TL]` gibi köşeli parantezli tutarlar
- Yasal sayfalardaki `[tarih]`, `[adres]`, `[gerçek kişi / şirket türü]`, `[... servisi]` alanları — yayından önce hukukçuya kontrol ettirin
- `og-image.png` (1200×630) henüz yok; `<head>` içinde referansı var
