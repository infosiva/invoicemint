import { getContentOverrides } from '@/lib/content'
import HeroClient from './HeroClient'

export default async function HeroSection() {
  const overrides = await getContentOverrides()
  return <HeroClient overrides={overrides} />
}
