import logoImg from '../assets/brand/logo.png'

export function StoreLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`store-logo ${className}`.trim()}>
      <img src={logoImg} alt="Logo Cantinho do Açaí" />
    </div>
  )
}
