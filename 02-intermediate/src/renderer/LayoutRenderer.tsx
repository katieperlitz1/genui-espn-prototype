import type { ReactNode } from 'react'
import { useEvents } from '../context/EventContext'
import type { ComponentSpec } from '../lib/gemini'

import { HeroSection } from '../components/HeroSection'
import { ScoreCard } from '../components/ScoreCard'
import { NewsHeadline } from '../components/NewsHeadline'
import { StatTable } from '../components/StatTable'
import { QuickLinks } from '../components/QuickLinks'
import { TeamCard } from '../components/TeamCard'
import { Countdown } from '../components/Countdown'
import { TrendingTopics } from '../components/TrendingTopics'
import { MatchPreview } from '../components/MatchPreview'
import { BettingOdds } from '../components/BettingOdds'
import { PlayerSpotlight } from '../components/PlayerSpotlight'
import { InjuryReport } from '../components/InjuryReport'
import { StandingsSnapshot } from '../components/StandingsSnapshot'
import { VideoHighlight } from '../components/VideoHighlight'
import { BreakingAlert } from '../components/BreakingAlert'
import { GameLog } from '../components/GameLog'
import { HeadToHead } from '../components/HeadToHead'
import { DraftTracker } from '../components/DraftTracker'
import { FantasyAlert } from '../components/FantasyAlert'
import { Section } from '../components/containers/Section'
import { TabsComponent, type TabItem } from '../components/containers/Tabs'
import { CardRow } from '../components/containers/CardRow'

interface Props {
  layout: ComponentSpec[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cast<T>(props: Record<string, unknown>): T { return props as any }

export function LayoutRenderer({ layout }: Props) {
  const { logEvent } = useEvents()

  function render(spec: ComponentSpec, index: number): ReactNode {
    const sport = (spec.props.sport as string)
      ?? (spec.props.category as string)
      ?? (spec.props.accent as string)
      ?? 'general'

    function logClick() {
      logEvent({ event: 'CLICKED', item: spec.component, sport, timestamp: new Date().toISOString() })
    }

    // ── Containers ────────────────────────────────────────────────────────
    if (spec.component === 'Section') {
      const renderedChildren = (spec.children ?? []).map((c, i) => render(c, i))
      return <Section key={index} {...cast(spec.props)}>{renderedChildren}</Section>
    }

    if (spec.component === 'CardRow') {
      const renderedChildren = (spec.children ?? []).map((c, i) => render(c, i))
      return <CardRow key={index} {...cast(spec.props)}>{renderedChildren}</CardRow>
    }

    if (spec.component === 'Tabs') {
      const rawTabs = (spec.props.tabs as { label: string; children: ComponentSpec[] }[]) ?? []
      const tabs: TabItem[] = rawTabs.map(tab => ({
        label: tab.label,
        content: (tab.children ?? []).map((c, i) => render(c, i)),
      }))
      return <TabsComponent key={index} tabs={tabs} />
    }

    // ── Leaf components (wrapped in click logger) ─────────────────────────
    const leaf = renderLeaf(spec, index)
    if (!leaf) return null

    return (
      <div key={index} onClick={logClick} className="cursor-pointer">
        {leaf}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {layout.map((spec, i) => render(spec, i))}
    </div>
  )
}

function renderLeaf(spec: ComponentSpec, index: number): ReactNode {
  switch (spec.component) {
    case 'HeroSection':       return <HeroSection       key={index} {...cast(spec.props)} />
    case 'ScoreCard':         return <ScoreCard         key={index} {...cast(spec.props)} />
    case 'NewsHeadline':      return <NewsHeadline      key={index} {...cast(spec.props)} />
    case 'StatTable':         return <StatTable         key={index} {...cast(spec.props)} />
    case 'QuickLinks':        return <QuickLinks        key={index} {...cast(spec.props)} />
    case 'TeamCard':          return <TeamCard          key={index} {...cast(spec.props)} />
    case 'Countdown':         return <Countdown         key={index} {...cast(spec.props)} />
    case 'TrendingTopics':    return <TrendingTopics    key={index} {...cast(spec.props)} />
    case 'MatchPreview':      return <MatchPreview      key={index} {...cast(spec.props)} />
    case 'BettingOdds':       return <BettingOdds       key={index} {...cast(spec.props)} />
    case 'PlayerSpotlight':   return <PlayerSpotlight   key={index} {...cast(spec.props)} />
    case 'InjuryReport':      return <InjuryReport      key={index} {...cast(spec.props)} />
    case 'StandingsSnapshot': return <StandingsSnapshot key={index} {...cast(spec.props)} />
    case 'VideoHighlight':    return <VideoHighlight    key={index} {...cast(spec.props)} />
    case 'BreakingAlert':     return <BreakingAlert     key={index} {...cast(spec.props)} />
    case 'GameLog':           return <GameLog           key={index} {...cast(spec.props)} />
    case 'HeadToHead':        return <HeadToHead        key={index} {...cast(spec.props)} />
    case 'DraftTracker':      return <DraftTracker      key={index} {...cast(spec.props)} />
    case 'FantasyAlert':      return <FantasyAlert      key={index} {...cast(spec.props)} />
    default:
      return (
        <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-700">
          Unknown: <code className="font-mono">{spec.component}</code>
        </div>
      )
  }
}
