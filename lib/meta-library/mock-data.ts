import { Ad } from '@/types/ad'
import { getScoreLabel } from '@/lib/enrichment/performance-scorer'

type SeedAd = Omit<Ad, 'id' | 'created_at' | 'scraped_at'>

// Video samples from Google public CDN (rotated across video ads)
const VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
]
let vi = 0
const nextVideo = () => VIDEOS[vi++ % VIDEOS.length]

// Finance-focused demo ads — fintech, crypto, banca, pagos, inversión
const MOCK_ADS: SeedAd[] = [

  // === NUBANK ===
  {
    advertiser_name: 'Nubank', status: 'ACTIVE', media_type: 'video',
    primary_text: 'La tarjeta de crédito sin comisiones anuales. Sin letra pequeña. Beneficios reales desde el primer día.',
    headline: 'Tu primera tarjeta sin comisiones',
    image_url: 'https://picsum.photos/seed/nubank-mx/400/700',
    video_url: nextVideo(),
    start_date: '2025-08-01T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram', 'whatsapp_business'],
    performance_score: 94, estimated_spend_min: 3000, estimated_spend_max: 12000,
    raw_data: { country_code: 'MX', industry: 'fintech', creatives_count: 8, score_label: getScoreLabel(94) },
  },
  {
    advertiser_name: 'Nubank', status: 'ACTIVE', media_type: 'image',
    primary_text: 'Abre tu cuenta Nubank gratis. Sin cuota de manejo, con rendimiento del 13% EA.',
    headline: 'Cuenta sin cuota de manejo',
    image_url: 'https://picsum.photos/seed/nubank-co/400/700',
    start_date: '2025-10-01T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram'],
    performance_score: 85, estimated_spend_min: 1200, estimated_spend_max: 4800,
    raw_data: { country_code: 'CO', industry: 'fintech', creatives_count: 4, score_label: getScoreLabel(85) },
  },

  // === MERCADO PAGO ===
  {
    advertiser_name: 'Mercado Pago', status: 'ACTIVE', media_type: 'video',
    primary_text: 'Recibe pagos con tarjeta sin necesidad de punto de venta físico. Cobra desde tu celular ahora.',
    headline: 'Cobra con tu celular',
    image_url: 'https://picsum.photos/seed/mercadopago-ar/400/700',
    video_url: nextVideo(),
    start_date: '2025-07-15T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram'],
    performance_score: 87, estimated_spend_min: 1800, estimated_spend_max: 7200,
    raw_data: { country_code: 'AR', industry: 'fintech', creatives_count: 5, score_label: getScoreLabel(87) },
  },
  {
    advertiser_name: 'Mercado Pago', status: 'ACTIVE', media_type: 'carousel',
    primary_text: '¡Invierte en Mercado Pago y gana hasta 15% anual! Tu dinero siempre disponible.',
    headline: 'Tu plata rinde más con nosotros',
    image_url: 'https://picsum.photos/seed/mercadopago-mx/400/700',
    start_date: '2025-11-01T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram'],
    performance_score: 82, estimated_spend_min: 1000, estimated_spend_max: 4000,
    raw_data: { country_code: 'MX', industry: 'fintech', creatives_count: 6, score_label: getScoreLabel(82) },
  },

  // === BINANCE ===
  {
    advertiser_name: 'Binance', status: 'ACTIVE', media_type: 'video',
    primary_text: 'Compra Bitcoin, Ethereum y más de 350 criptomonedas con comisiones ultra bajas. Regístrate gratis.',
    headline: 'El exchange de crypto #1 del mundo',
    image_url: 'https://picsum.photos/seed/binance-mx/400/700',
    video_url: nextVideo(),
    start_date: '2025-09-01T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram'],
    performance_score: 91, estimated_spend_min: 4000, estimated_spend_max: 16000,
    raw_data: { country_code: 'MX', industry: 'fintech', creatives_count: 10, score_label: getScoreLabel(91) },
  },
  {
    advertiser_name: 'Binance', status: 'ACTIVE', media_type: 'video',
    primary_text: 'Earn up to 20% APY on your crypto. Flexible and fixed-term savings options.',
    headline: 'Earn rewards on your crypto',
    image_url: 'https://picsum.photos/seed/binance-us/400/700',
    video_url: nextVideo(),
    start_date: '2025-10-15T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram'],
    performance_score: 88, estimated_spend_min: 5000, estimated_spend_max: 20000,
    raw_data: { country_code: 'US', industry: 'fintech', creatives_count: 8, score_label: getScoreLabel(88) },
  },

  // === COINBASE ===
  {
    advertiser_name: 'Coinbase', status: 'ACTIVE', media_type: 'video',
    primary_text: 'The safest and easiest way to buy, sell and manage crypto. Trusted by 100M+ users.',
    headline: 'Get started with crypto today',
    image_url: 'https://picsum.photos/seed/coinbase-us/400/700',
    video_url: nextVideo(),
    start_date: '2025-08-15T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram', 'linkedin'],
    performance_score: 89, estimated_spend_min: 6000, estimated_spend_max: 24000,
    raw_data: { country_code: 'US', industry: 'fintech', creatives_count: 12, score_label: getScoreLabel(89) },
  },

  // === BITSO ===
  {
    advertiser_name: 'Bitso', status: 'ACTIVE', media_type: 'video',
    primary_text: 'Compra Bitcoin desde $1 MXN. El exchange de crypto más popular en México y LATAM.',
    headline: 'Tu crypto en pesos mexicanos',
    image_url: 'https://picsum.photos/seed/bitso-mx/400/700',
    video_url: nextVideo(),
    start_date: '2025-09-15T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram'],
    performance_score: 83, estimated_spend_min: 1500, estimated_spend_max: 6000,
    raw_data: { country_code: 'MX', industry: 'fintech', creatives_count: 6, score_label: getScoreLabel(83) },
  },
  {
    advertiser_name: 'Bitso', status: 'ACTIVE', media_type: 'image',
    primary_text: 'Invertí en crypto desde Argentina. Sin restricciones de CEPO. Retirá cuando quieras.',
    headline: 'Crypto sin restricciones en Argentina',
    image_url: 'https://picsum.photos/seed/bitso-ar/400/700',
    start_date: '2025-11-01T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram'],
    performance_score: 78, estimated_spend_min: 800, estimated_spend_max: 3200,
    raw_data: { country_code: 'AR', industry: 'fintech', creatives_count: 3, score_label: getScoreLabel(78) },
  },

  // === BBVA ===
  {
    advertiser_name: 'BBVA', status: 'ACTIVE', media_type: 'video',
    primary_text: 'Abre tu cuenta BBVA en minutos desde tu celular. Sin papeleos, sin ir a sucursal.',
    headline: 'Banca digital sin complicaciones',
    image_url: 'https://picsum.photos/seed/bbva-mx/400/700',
    video_url: nextVideo(),
    start_date: '2025-10-01T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram'],
    performance_score: 80, estimated_spend_min: 2000, estimated_spend_max: 8000,
    raw_data: { country_code: 'MX', industry: 'fintech', creatives_count: 7, score_label: getScoreLabel(80) },
  },
  {
    advertiser_name: 'BBVA', status: 'ACTIVE', media_type: 'carousel',
    primary_text: 'Hipotecas, préstamos y tarjetas con las mejores condiciones del mercado. Descubre más.',
    headline: 'Tu banco para cada etapa de tu vida',
    image_url: 'https://picsum.photos/seed/bbva-es/400/700',
    start_date: '2025-09-01T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram'],
    performance_score: 74, estimated_spend_min: 1500, estimated_spend_max: 6000,
    raw_data: { country_code: 'ES', industry: 'fintech', creatives_count: 5, score_label: getScoreLabel(74) },
  },

  // === RAPPI ===
  {
    advertiser_name: 'Rappi', status: 'ACTIVE', media_type: 'carousel',
    primary_text: '¡RappiPay te da hasta 10% de cashback en tu primera compra! Paga con QR o NFC.',
    headline: 'Cashback real con RappiPay',
    image_url: 'https://picsum.photos/seed/rappi-co/400/700',
    start_date: '2025-10-20T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram'],
    performance_score: 79, estimated_spend_min: 800, estimated_spend_max: 3200,
    raw_data: { country_code: 'CO', industry: 'fintech', creatives_count: 4, score_label: getScoreLabel(79) },
  },
  {
    advertiser_name: 'Rappi', status: 'ACTIVE', media_type: 'video',
    primary_text: 'RappiCard — La tarjeta que te da cashback en todo: delivery, supermercado y más.',
    headline: 'Gana cashback con tu RappiCard',
    image_url: 'https://picsum.photos/seed/rappi-mx/400/700',
    video_url: nextVideo(),
    start_date: '2025-11-01T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram'],
    performance_score: 84, estimated_spend_min: 1200, estimated_spend_max: 4800,
    raw_data: { country_code: 'MX', industry: 'fintech', creatives_count: 5, score_label: getScoreLabel(84) },
  },

  // === PAYPAL ===
  {
    advertiser_name: 'PayPal', status: 'ACTIVE', media_type: 'video',
    primary_text: 'Envía y recibe dinero al instante con PayPal. Sin comisiones entre usuarios en México.',
    headline: 'Pagos instantáneos con PayPal',
    image_url: 'https://picsum.photos/seed/paypal-mx/400/700',
    video_url: nextVideo(),
    start_date: '2025-08-01T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram'],
    performance_score: 81, estimated_spend_min: 1000, estimated_spend_max: 4000,
    raw_data: { country_code: 'MX', industry: 'fintech', creatives_count: 6, score_label: getScoreLabel(81) },
  },

  // === GBM+ ===
  {
    advertiser_name: 'GBM+', status: 'ACTIVE', media_type: 'video',
    primary_text: 'Invierte en acciones de Apple, Google, AMZN y más desde $10 MXN. Sin comisiones de compra.',
    headline: 'Invierte en Wall Street desde México',
    image_url: 'https://picsum.photos/seed/gbm-mx/400/700',
    video_url: nextVideo(),
    start_date: '2025-09-01T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram'],
    performance_score: 86, estimated_spend_min: 1500, estimated_spend_max: 6000,
    raw_data: { country_code: 'MX', industry: 'fintech', creatives_count: 7, score_label: getScoreLabel(86) },
  },

  // === SANTANDER ===
  {
    advertiser_name: 'Santander', status: 'ACTIVE', media_type: 'image',
    primary_text: 'Crédito personal aprobado en 24 horas. Hasta $300,000 MXN con tasa preferencial.',
    headline: 'Crédito personal en 24 horas',
    image_url: 'https://picsum.photos/seed/santander-mx/400/700',
    start_date: '2025-10-01T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram'],
    performance_score: 72, estimated_spend_min: 1800, estimated_spend_max: 7200,
    raw_data: { country_code: 'MX', industry: 'fintech', creatives_count: 3, score_label: getScoreLabel(72) },
  },

  // === NEQUI ===
  {
    advertiser_name: 'Nequi', status: 'ACTIVE', media_type: 'video',
    primary_text: 'Maneja tu plata desde el celular. Bolsillos para ahorrar, pagos QR y transferencias gratis.',
    headline: 'Tu cuenta digital que entiende tu vida',
    image_url: 'https://picsum.photos/seed/nequi-co/400/700',
    video_url: nextVideo(),
    start_date: '2025-08-15T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram'],
    performance_score: 83, estimated_spend_min: 900, estimated_spend_max: 3600,
    raw_data: { country_code: 'CO', industry: 'fintech', creatives_count: 6, score_label: getScoreLabel(83) },
  },

  // === INTERBANK ===
  {
    advertiser_name: 'Interbank', status: 'ACTIVE', media_type: 'carousel',
    primary_text: 'Multiplica tus ahorros con la mejor tasa del mercado. Depósito a plazo fijo desde S/ 500.',
    headline: 'La mejor tasa de ahorro en Perú',
    image_url: 'https://picsum.photos/seed/interbank-pe/400/700',
    start_date: '2025-11-15T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram'],
    performance_score: 76, estimated_spend_min: 600, estimated_spend_max: 2400,
    raw_data: { country_code: 'PE', industry: 'fintech', creatives_count: 4, score_label: getScoreLabel(76) },
  },

  // === FLINK ===
  {
    advertiser_name: 'Flink', status: 'ACTIVE', media_type: 'video',
    primary_text: 'Empieza a invertir con $10 pesos. Rendimiento anual de hasta 12%. Tu dinero trabaja por ti.',
    headline: 'Inversiones desde $10 pesos',
    image_url: 'https://picsum.photos/seed/flink-mx/400/700',
    video_url: nextVideo(),
    start_date: '2025-09-15T00:00:00Z',
    publisher_platforms: ['facebook', 'instagram'],
    performance_score: 80, estimated_spend_min: 700, estimated_spend_max: 2800,
    raw_data: { country_code: 'MX', industry: 'fintech', creatives_count: 5, score_label: getScoreLabel(80) },
  },
]

export function getMockAds(): SeedAd[] {
  return MOCK_ADS
}
