import { useEffect, useState } from 'react'
import type { Product } from '../types/domain'
import { formatCurrency } from '../utils/format'

interface Props { products: Product[]; onChoose: (product: Product) => void }

export function HomeExperience({ products, onChoose }: Props) {
  const highlights = products.filter((product) => product.image).slice(0, 3)
  const [selected, setSelected] = useState(0)
  useEffect(() => {
    const move = () => document.documentElement.style.setProperty('--home-scroll', `${Math.min(window.scrollY / 18, 24)}px`)
    window.addEventListener('scroll', move, { passive: true }); move()
    return () => window.removeEventListener('scroll', move)
  }, [])
  const current = highlights[selected]
  if (!current) return null
  return <><section className="home-hero" aria-label="Cantinho do Açaí"><div className="home-hero__content"><p className="home-hero__eyebrow">Cantinho do Açaí</p><h2>Felicidade servida em cada camada.</h2><p>Feito com carinho, sabor de verdade e entrega para deixar seu momento mais gostoso.</p><div className="home-hero__actions"><a className="button button--primary" href="#cardapio">Ver cardápio</a><button className="button button--ghost" onClick={() => onChoose(current)}>Pedir agora</button></div></div><div className="home-hero__art"><img className="home-hero__owners" src="/owners-cantinho-do-acai.png" width="1024" height="1024" alt="Donos do Cantinho do Açaí" /><img className="home-hero__cup" src={current.image} alt="" /></div></section><section className="home-highlights" aria-labelledby="destaques"><div><p className="home-hero__eyebrow">Escolhas da casa</p><h2 id="destaques">Seu próximo favorito</h2></div><div className="home-highlights__tabs" role="tablist">{highlights.map((product, index) => <button role="tab" aria-selected={selected === index} className={selected === index ? 'is-selected' : ''} key={product.id} onClick={() => setSelected(index)}>{product.name}</button>)}</div><article className="home-feature"><img src={current.image} alt={current.name} loading="lazy" /><div><h3>{current.name}</h3><p>{current.description ?? current.subtitle ?? 'Uma escolha especial do Cantinho.'}</p><strong>{current.fromPrice ? 'A partir de ' : ''}{formatCurrency(current.price)}</strong><button className="button button--primary" onClick={() => onChoose(current)}>Escolher</button></div></article></section></>
}
