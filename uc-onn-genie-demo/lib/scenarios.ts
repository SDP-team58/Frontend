export interface Scenario {
  id: string
  title: string
  prompt: string
  response: string
}

export const scenarios: Scenario[] = [
  {
    id: "interest-rate-hike",
    title: "Interest-rate hike",
    prompt: "What happens if the Federal Reserve raises interest rates by 2% over the next year?",
    response: `Based on the GENIE macroeconomic model, a 2% interest rate hike over the next year would likely produce the following effects:

**Immediate Effects (0-3 months):**
- Mortgage rates increase, cooling demand in the housing market
- Consumer spending on durable goods (cars, appliances) slows due to higher borrowing costs
- Corporate investment growth moderates as financing becomes more expensive
- Stock market may experience short-term volatility

**Medium-term Effects (3-12 months):**
- Inflation gradually decelerates as higher rates reduce aggregate demand
- Unemployment may tick up slightly as growth slows
- Fixed-income securities become more attractive, potentially drawing funds from equities
- Export competitiveness improves as higher rates strengthen the USD

**Economic Growth Impact:**
- Real GDP growth could slow by 0.5-1.5 percentage points
- Potential decrease in private investment and business expansion
- Consumer debt servicing costs rise, impacting household savings rates

**Inflation & Employment Trade-off:**
This rate hike represents a classic monetary policy trade-off: reduced inflation at the cost of potentially higher unemployment (Phillips Curve dynamics). The model suggests this is a moderate policy adjustment with manageable recessionary risk.`,
  },
  {
    id: "energy-shock",
    title: "Energy shock",
    prompt: "How does a sudden 40% spike in global oil prices affect the US economy?",
    response: `A sudden 40% increase in global oil prices would trigger several cascading effects across the economy:

**Supply-Side Shocks:**
- Energy input costs rise across all sectors, squeezing profit margins
- Transportation and logistics costs increase significantly
- Manufacturing competitiveness declines, especially in energy-intensive industries
- Export prices rise, reducing global demand for US goods

**Inflation Surge:**
- CPI inflation increases by 1.5-2% within 3-6 months
- Core inflation (ex-energy) gradually rises as producers pass costs downstream
- Real household purchasing power declines, dampening consumption
- The Fed faces a policy dilemma: raise rates to combat inflation or maintain accommodation

**Aggregate Demand Effects:**
- Consumer spending weakens as purchasing power erodes
- Business investment plans may be deferred pending policy clarity
- Real wages decline unless matched by nominal wage growth
- Unemployment could rise 0.3-0.8 percentage points

**Sector-Specific Impact:**
- Energy sector profits surge temporarily, shifting capital allocation
- Airlines, shipping, and heavy manufacturing suffer margin compression
- Green energy and alternative technology investments accelerate
- Low-income households face greater burden (energy/transportation essentials)

**Overall Economic Impact:**
- Potential stagflation scenario with 0.5-1% GDP growth slowdown and 1.5-2% inflation surge
- Fiscal stimulus could mitigate, but adds deficit concerns
- Duration depends on whether oil prices remain elevated or normalize`,
  },
  {
    id: "housing-slowdown",
    title: "Housing slowdown",
    prompt: "What are the macroeconomic implications of a 20% decline in national housing prices?",
    response: `A 20% decline in national housing prices would have substantial ripple effects through multiple economic channels:

**Wealth Effect & Consumption:**
- Household net worth declines significantly, reducing consumption by 2-4%
- Most severe impact on households with highest home equity concentration
- Construction employment drops as new housing starts decline
- Real estate services (appraisal, brokerage) sector contracts

**Financial System Stress:**
- Banks' mortgage portfolios face increased default risk
- Home equity lines of credit become unavailable or more expensive
- Financial institutions tighten lending standards further
- Mortgage-backed securities and derivatives face re-pricing
- Credit availability may tighten, amplifying recessionary pressures

**Labor Market Effects:**
- Construction sector sheds 500K-1M jobs within 6-12 months
- Manufacturing (appliances, fixtures, materials) employment declines
- Unemployment rises 0.5-1.5 percentage points
- Wage growth pressures ease as labor demand softens

**Investment & Capex:**
- Business investment in warehouses, logistics, and facilities declines
- Builders and developers default on loan obligations
- Commercial real estate faces pressures as economics worsen
- Consumer confidence deteriorates sharply

**Monetary Policy Response:**
- The Fed likely cuts rates to support markets and economy
- Quantitative measures may be necessary if crisis deepens
- Coordination with Treasury Department on emergency lending facilities

**Growth & Inflation Dynamic:**
- Real GDP growth could decline 1-2% in first year
- Deflation risk if shock is severe enough to exceed demand shortfalls
- Recovery typically takes 3-5 years for housing market stabilization`,
  },
  {
    id: "geopolitical-risk",
    title: "Geopolitical risk",
    prompt: "How would a major geopolitical crisis affect US economic outlook?",
    response: `A major geopolitical crisis creates uncertainty and disruption across multiple economic dimensions:

**Financial Market Volatility:**
- Stock market experiences sharp 10-20% correction as investors flee to safety
- Treasury yields drop as "flight to quality" occurs—bonds rally
- Credit spreads widen; corporate borrowing costs increase
- Volatility index (VIX) spikes, adding psychological drag on sentiment
- Currency markets may show dollar strength as safe haven demand rises

**Supply Chain Disruptions:**
- Shipping routes face delays, adding logistics costs
- Key commodity supplies (oil, metals, grains) tighten
- Just-in-time manufacturing faces bottlenecks
- Consumer prices rise for affected goods categories
- Companies delay investment decisions pending clarity

**Trade & Tariff Environment:**
- Retaliatory tariffs may emerge, raising input costs
- Trade finance becomes more expensive or unavailable
- Export orders decline as global demand softens
- Multinational corporations reassess supply diversification

**Employment & Wages:**
- Hiring freezes emerge as uncertainty peaks
- Consumer and business confidence indices decline sharply
- Unemployment rises 0.3-1% as layoffs occur in exposed sectors
- Wage growth moderates as labor demand weakens

**Fiscal Response:**
- Government spending on defense/security may increase
- Emergency budget packages possible if crisis persists
- Deficit implications depending on magnitude of stimulus
- Potential debt ceiling or budget constraints

**Duration & Severity:**
- Short-term impact: 2-4 quarter slowdown with -0.5 to -1% GDP effect
- Moderate duration: 1-2 year recovery period if resolved relatively quickly
- Severe case: multi-year recession if combined with financial instability
- Policy coordination between Treasury, Fed, and international partners critical`,
  },
  {
    id: "soft-landing",
    title: "Soft-landing baseline",
    prompt: "Model a scenario where the economy achieves a soft landing with controlled disinflation.",
    response: `A soft-landing scenario represents an optimal economic outcome where inflation gradually normalizes without triggering recession:

**Monetary Policy Success:**
- Fed maintains restrictive rates long enough to reach 2% inflation target
- Inflation decreases from elevated levels through demand moderation
- Real rates remain positive but gradually normalize as nominal rates fall
- Market expectations remain anchored; wage-price spiral avoided
- Credit conditions tighten moderately but don't freeze

**Growth Dynamics:**
- Real GDP growth moderates to 1.5-2% annually (below trend but positive)
- No recession; unemployment remains near 4-4.5%
- Labor force participation stabilizes or improves modestly
- Productivity gains support real wage growth despite inflation moderation

**Inflation Trajectory:**
- CPI declines from peaks of 8-9% down to 2-3% over 18-24 months
- Core inflation follows with lag, stabilizing around 2.5%
- Energy and commodity prices normalize without supply shocks
- Inflation expectations remain well-anchored at 2-2.5%

**Employment & Wages:**
- Labor market remains resilient with job growth averaging 100-150K/month
- Wage growth moderates to 3-4% annually (consistent with productivity + inflation target)
- Unemployment rises slightly to 4.5-4.8% but remains relatively low
- No major wave of job losses or corporate downsizing

**Asset Markets:**
- Stock market recovers and reaches new highs as path clarifies
- Corporate profit margins stabilize as inflation subsides
- Bond yields settle into a sustainable 3.5-4% range for 10-year Treasuries
- Real estate market stabilizes with modest appreciation

**Financial Stability:**
- Banks maintain healthy capital buffers
- Credit growth normalizes at pace consistent with GDP growth
- Consumer balance sheets strengthen as real wages improve
- Corporate debt-to-GDP stabilizes or declines slightly

**Policy Environment:**
- Fed maintains data-dependent approach, eventually cutting rates
- Fiscal policy remains neutral to slightly restrictive
- International coordination supports global growth
- No major supply shocks or geopolitical crises

**Timeline:**
This soft-landing path typically materializes over 24-36 months, with optimal outcome by year-end 2025 or early 2026. Success requires continued policy discipline and absence of major external shocks.`,
  },
]
