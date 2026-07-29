import { NextRequest } from 'next/server'

// Adzuna Canada category mapping
const INDUSTRY_TO_ADZUNA: Record<string, { category: string; keywords: string }> = {
  Aerospace: { category: 'engineering-jobs',           keywords: 'aerospace OR aircraft OR aviation OR aeronautics' },
  IT:        { category: 'it-jobs',                    keywords: 'software OR developer OR engineer' },
  Trucking:  { category: 'logistics-warehouse-jobs',   keywords: 'truck OR dispatch OR logistics OR freight' },
  Drone:     { category: 'engineering-jobs',           keywords: 'drone OR UAV OR unmanned aerial' },
  Business:  { category: 'management-jobs',            keywords: 'MBA OR business OR operations OR management' },
}

const PROVINCE_TO_LOCATION: Record<string, string> = {
  ON: 'Ontario', BC: 'British Columbia', AB: 'Alberta', QC: 'Quebec',
  MB: 'Manitoba', SK: 'Saskatchewan', NS: 'Nova Scotia', NB: 'New Brunswick',
  Remote: 'Canada',
}

// Demo jobs for when Adzuna keys are not configured
const DEMO_JOBS = [
  { id: 'demo-1', title: 'Aircraft Maintenance Engineer', company: 'Bombardier', company_domain: 'bombardier.com', industry: 'Aerospace', province: 'QC', location_type: 'onsite',  salary_min: 85000,  salary_max: 105000, job_url: 'https://jobs.bombardier.com', source: 'Demo', posted_date: '2026-05-19', description: 'Responsible for line and base maintenance on business jet aircraft fleet. Experience with CRJ or Challenger series preferred.' },
  { id: 'demo-2', title: 'Flight Test Engineer',           company: 'CAE Inc.',    company_domain: 'cae.com',         industry: 'Aerospace', province: 'QC', location_type: 'onsite',  salary_min: 90000,  salary_max: 120000, job_url: 'https://www.cae.com/careers', source: 'Demo', posted_date: '2026-05-20', description: 'Support development and validation of flight simulation systems. Requires aircraft systems background and FAA/EASA knowledge.' },
  { id: 'demo-3', title: 'Software Developer — Avionics', company: 'MDA Space',   company_domain: 'mda.space',        industry: 'Aerospace', province: 'ON', location_type: 'hybrid',  salary_min: 95000,  salary_max: 130000, job_url: 'https://mda.space/en/careers', source: 'Demo', posted_date: '2026-05-21', description: 'Develop embedded software for space robotics systems. DO-178C, C/C++, real-time OS experience required.' },
  { id: 'demo-4', title: 'Full Stack Developer',           company: 'Shopify',     company_domain: 'shopify.com',      industry: 'IT',        province: 'ON', location_type: 'remote',  salary_min: 110000, salary_max: 160000, job_url: 'https://www.shopify.com/careers', source: 'Demo', posted_date: '2026-05-21', description: 'Build and scale e-commerce features used by millions of merchants globally. Ruby, TypeScript, React stack.' },
  { id: 'demo-5', title: 'Dispatch Coordinator',           company: 'TFI International', company_domain: 'tfiintl.com', industry: 'Trucking',  province: 'QC', location_type: 'onsite',  salary_min: 55000,  salary_max: 75000,  job_url: 'https://www.tfiintl.com/careers', source: 'Demo', posted_date: '2026-05-18', description: 'Coordinate freight movements across national network. Experience with TMS software and cross-border operations required.' },
  { id: 'demo-6', title: 'Drone Operations Specialist',    company: 'Draganfly',   company_domain: 'draganfly.com',    industry: 'Drone',     province: 'SK', location_type: 'onsite',  salary_min: 60000,  salary_max: 80000,  job_url: 'https://draganfly.com/careers', source: 'Demo', posted_date: '2026-05-17', description: 'Operate commercial UAS systems for public safety and agricultural clients. Transport Canada RPAS Advanced certification required.' },
  { id: 'demo-7', title: 'AI Software Engineer',           company: 'Cohere',      company_domain: 'cohere.com',       industry: 'IT',        province: 'ON', location_type: 'remote',  salary_min: 120000, salary_max: 180000, job_url: 'https://cohere.com/careers', source: 'Demo', posted_date: '2026-05-20', description: 'Build LLM-powered enterprise APIs. Strong ML background, Python, distributed systems experience required.' },
  { id: 'demo-8', title: 'Logistics Operations Manager',   company: 'Bison Transport', company_domain: 'bisontransport.com', industry: 'Trucking', province: 'MB', location_type: 'onsite', salary_min: 70000, salary_max: 95000, job_url: 'https://www.bisontransport.com/careers', source: 'Demo', posted_date: '2026-05-16', description: 'Manage refrigerated transport operations across western Canada. Oversee dispatch team and fleet optimization.' },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const industries = searchParams.get('industries')?.split(',').filter(Boolean) ?? []
  const provinces  = searchParams.get('provinces')?.split(',').filter(Boolean) ?? []
  const sizes      = searchParams.get('sizes')?.split(',').filter(Boolean) ?? []
  const jobType    = searchParams.get('jobType') ?? ''
  const salaryMin  = parseInt(searchParams.get('salaryMin') ?? '0')
  const page       = parseInt(searchParams.get('page') ?? '1')

  const appId  = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY

  // No Adzuna keys — return filtered demo data
  if (!appId || !appKey) {
    let results = DEMO_JOBS
    if (industries.length) results = results.filter(j => industries.includes(j.industry))
    if (provinces.length)  results = results.filter(j => provinces.includes(j.province) || j.location_type === 'remote')
    if (salaryMin > 0)     results = results.filter(j => (j.salary_min ?? 0) >= salaryMin)
    return Response.json({ jobs: results, total: results.length, demo: true })
  }

  // Adzuna live search
  try {
    const targetIndustries = industries.length ? industries : Object.keys(INDUSTRY_TO_ADZUNA)
    const allJobs: unknown[] = []

    for (const industry of targetIndustries) {
      const map = INDUSTRY_TO_ADZUNA[industry]
      if (!map) continue

      const targetProvinces = provinces.length ? provinces : ['ON', 'BC', 'AB', 'QC']
      for (const prov of targetProvinces.slice(0, 2)) {
        const location = prov === 'Remote' ? 'Canada' : (PROVINCE_TO_LOCATION[prov] ?? 'Canada')
        const params = new URLSearchParams({
          app_id:           appId,
          app_key:          appKey,
          results_per_page: '10',
          what:             map.keywords,
          where:            location,
          category:         map.category,
          sort_by:          'date',
          ...(salaryMin > 0 ? { salary_min: String(salaryMin) } : {}),
          ...(jobType === 'full-time' ? { full_time: '1' } : {}),
          ...(jobType === 'part-time' ? { part_time: '1' } : {}),
          ...(jobType === 'contract'  ? { contract:  '1' } : {}),
        })
        const url = `https://api.adzuna.com/v1/api/jobs/ca/search/${page}?${params}`
        const res = await fetch(url, { next: { revalidate: 3600 } })
        if (!res.ok) continue
        const data = await res.json() as { results?: unknown[] }
        const mapped = (data.results ?? []).map((j: unknown) => {
          const job = j as Record<string, unknown>
          const comp = job.company as Record<string, unknown> | undefined
          const loc  = job.location as Record<string, unknown> | undefined
          const locArea = loc?.area as string[] | undefined
          return {
            id:             job.id as string,
            title:          job.title as string,
            company:        comp?.display_name as string ?? 'Unknown',
            company_domain: '',
            industry,
            province:       prov,
            location_type:  (job.title as string ?? '').toLowerCase().includes('remote') ? 'remote' : 'onsite',
            salary_min:     job.salary_min as number | undefined,
            salary_max:     job.salary_max as number | undefined,
            job_url:        job.redirect_url as string,
            source:         'Adzuna',
            posted_date:    job.created as string,
            description:    job.description as string,
            location_label: locArea?.slice(-2).join(', ') ?? location,
          }
        })
        allJobs.push(...mapped)
      }
    }

    // Size filter — not available from Adzuna; skip silently (applied in company browser only)
    return Response.json({ jobs: allJobs, total: allJobs.length, demo: false })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Job search failed'
    return Response.json({ error: msg }, { status: 500 })
  }
}
