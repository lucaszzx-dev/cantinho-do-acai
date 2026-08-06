import { useEffect, useState } from 'react'
import type { Category, Product } from '../types/domain'
import { catalogApi } from '../api/catalog'

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
async function api(path: string, method = 'GET', body?: unknown) { const response = await fetch(`${baseUrl}${path}`, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); if (!response.ok) throw new Error('Não foi possível salvar as alterações.'); return response.json() }

export function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tab, setTab] = useState<'products' | 'categories' | 'store'>('products')
  const [message, setMessage] = useState('')
  const [store, setStore] = useState({ name: '', city: '', tagline: '', whatsappNumber: '', deliveryMode: '', minOrder: 0 })
  const load = () => Promise.all([catalogApi.products(), catalogApi.categories(), api('/api/admin/store')]).then(([p, c, s]) => { setProducts(p); setCategories(c); setStore(s) }).catch(() => setMessage('Não foi possível carregar o painel. Confirme se a API está ativa.'))
  useEffect(() => { load() }, [])
  const save = async (path: string, body: unknown) => { try { await api(path, 'PATCH', body); setMessage('Alterações salvas.'); load() } catch (error) { setMessage(error instanceof Error ? error.message : 'Erro ao salvar.') } }
  return <main className="admin-page"><header className="admin-header"><a href="/">← Cardápio</a><div><p>Área administrativa</p><h1>Cantinho do Açaí</h1></div></header><nav className="admin-tabs">{(['products', 'categories', 'store'] as const).map((item) => <button key={item} className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)}>{item === 'products' ? 'Produtos' : item === 'categories' ? 'Categorias' : 'Loja'}</button>)}</nav>{message && <p className="admin-message">{message}</p>}
    {tab === 'products' && <section className="admin-panel"><h2>Produtos</h2><p>Edite disponibilidade e ordem. Variantes e adicionais existentes permanecem preservados no catálogo.</p>{products.map((product) => <article className="admin-row" key={product.id}><div><strong>{product.name}</strong><small>{product.category} · R$ {product.price.toFixed(2)}</small></div><label><input type="checkbox" checked={product.available} onChange={(event) => save(`/api/admin/products/${product.id}`, { active: event.target.checked })} /> Disponível</label><input aria-label={`Ordem de ${product.name}`} type="number" defaultValue={products.indexOf(product)} onBlur={(event) => save(`/api/admin/products/${product.id}`, { sortOrder: Number(event.target.value) })} /></article>)}</section>}
    {tab === 'categories' && <section className="admin-panel"><h2>Categorias</h2>{categories.map((category, index) => <article className="admin-row" key={category.id}><div><strong>{category.name}</strong><small>{category.subtitle}</small></div><input aria-label={`Nome de ${category.name}`} defaultValue={category.name} onBlur={(event) => save(`/api/admin/categories/${category.id}`, { name: event.target.value })} /><input aria-label={`Ordem de ${category.name}`} type="number" defaultValue={index} onBlur={(event) => save(`/api/admin/categories/${category.id}`, { sortOrder: Number(event.target.value) })} /></article>)}</section>}
    {tab === 'store' && <section className="admin-panel"><h2>Configurações da loja</h2><form onSubmit={(event) => { event.preventDefault(); save('/api/admin/store', store) }}><label>Nome<input value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })} /></label><label>Cidade<input value={store.city} onChange={(e) => setStore({ ...store, city: e.target.value })} /></label><label>Slogan<input value={store.tagline} onChange={(e) => setStore({ ...store, tagline: e.target.value })} /></label><label>WhatsApp<input value={store.whatsappNumber} onChange={(e) => setStore({ ...store, whatsappNumber: e.target.value })} /></label><label>Pedido mínimo<input type="number" value={store.minOrder} onChange={(e) => setStore({ ...store, minOrder: Number(e.target.value) })} /></label><button className="button button--primary">Salvar configurações</button></form></section>}
  </main>
}
