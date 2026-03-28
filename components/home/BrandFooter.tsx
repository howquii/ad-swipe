'use client'
import { useState } from 'react'
import { ExternalLink } from 'lucide-react'

interface Brand {
  name: string
  domain: string
  country: string
}

const FINANCE_BRANDS: Brand[] = [
  { name: 'Nubank',        domain: 'nubank.com',          country: 'MX/CO' },
  { name: 'Mercado Pago',  domain: 'mercadopago.com',     country: 'AR/MX' },
  { name: 'Binance',       domain: 'binance.com',         country: 'US/MX' },
  { name: 'Coinbase',      domain: 'coinbase.com',        country: 'US'    },
  { name: 'BBVA',          domain: 'bbva.com',            country: 'MX/ES' },
  { name: 'Bitso',         domain: 'bitso.com',           country: 'MX/AR' },
  { name: 'Rappi',         domain: 'rappi.com',           country: 'CO/MX' },
  { name: 'PayPal',        domain: 'paypal.com',          country: 'US/MX' },
  { name: 'GBM+',          domain: 'gbm.mx',              country: 'MX'    },
  { name: 'Santander',     domain: 'santander.com.mx',    country: 'MX'    },
  { name: 'Scotiabank',    domain: 'scotiabank.com.mx',   country: 'MX'    },
  { name: 'Nequi',         domain: 'nequi.com.co',        country: 'CO'    },
  { name: 'Flink',         domain: 'flink.mx',            country: 'MX'    },
  { name: 'Interbank',     domain: 'interbank.pe',        country: 'PE'    },
  { name: 'BCP',           domain: 'viabcp.com',          country: 'PE'    },
]

function metaLibraryUrl(name: string) {
  return `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&search_terms=${encodeURIComponent(name)}&media_type=all`
}

function BrandChip({ brand }: { brand: Brand }) {
  const [imgOk, setImgOk] = useState(true)
  const logoUrl = `https://logo.clearbit.com/${brand.domain}`

  return (
    <a
      href={metaLibraryUrl(brand.name)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-notion-border bg-white hover:border-gray-400 hover:bg-gray-50 transition-all shrink-0 group"
    >
      {imgOk ? (
        <img
          src={logoUrl}
          alt={brand.name}
          className="w-4 h-4 rounded-sm object-contain"
          onError={() => setImgOk(false)}
        />
      ) : (
        <span className="w-4 h-4 rounded-sm bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-500">
          {brand.name[0]}
        </span>
      )}
      <span className="text-[11px] font-medium text-notion-text whitespace-nowrap">{brand.name}</span>
      <ExternalLink size={9} className="text-notion-muted group-hover:text-gray-600 shrink-0" />
    </a>
  )
}

export default function BrandFooter() {
  return (
    <div className="border-t border-notion-border bg-white px-3 py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
      <span className="text-[10px] font-semibold text-notion-muted uppercase tracking-wide shrink-0 mr-1">
        Marcas
      </span>
      {FINANCE_BRANDS.map(brand => (
        <BrandChip key={brand.name} brand={brand} />
      ))}
    </div>
  )
}
