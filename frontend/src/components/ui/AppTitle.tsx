interface AppTitleProps {
  size?: 'md' | 'lg'
}

export default function AppTitle({ size = 'md' }: AppTitleProps) {
  const textSizeClass = size === 'lg' ? 'text-3xl' : 'text-2xl'
  const iconSizeClass = size === 'lg' ? 'w-8 h-8' : 'w-7 h-7'

  return (
    <span className={`inline-flex items-center gap-2 font-heading font-bold ${textSizeClass} text-primary`}>
      <img src="/icons/favicon-32x32.png" alt="" className={`${iconSizeClass} rounded-lg`} />
      Bitácora ✈️
    </span>
  )
}
