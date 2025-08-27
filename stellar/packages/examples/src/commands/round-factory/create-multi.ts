import App from '../../app.js'

type CreatedRoundResult = {
  id: string
  name: string
  allow_applications: boolean
}

function toMs(date: Date): bigint {
  return BigInt(date.getTime())
}

function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}

function minutesFromNow(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000)
}

async function resolveProjectIdFromApplicant(app: App, applicant: string): Promise<bigint | null> {
  try {
    const tx = await app.project_contract.get_project_from_applicant({ applicant })
    const project = tx.result
    if (!project) return null
    return BigInt(project.id)
  } catch (e) {
    return null
  }
}

export default async function createMultiRounds(params: string[], app: App) {
  // Provided applicant addresses that map to project IDs
  const applicantAddresses: string[] = [
    'GAX2XNIH76T5MW5SIQGUOZUEPCQMG6RIGFYIEGNLXGM7VHEO2LIONNCC',
    'GDC6IZOROU5FRMJYF56IQKMQTH2OYI2OKNPWDGPPV26PBIM2KHPOKVUE',
  ]

  const projectIds: bigint[] = []
  for (const addr of applicantAddresses) {
    const pid = await resolveProjectIdFromApplicant(app, addr)
    if (pid) projectIds.push(pid)
  }

  const created: CreatedRoundResult[] = []

  const roundCatalog: Array<{ name: string; description: string }> = [
    {
      name: 'Open Source Sustainability Fund – Sprint',
      description:
        'Supporting maintainers of critical open-source infrastructure with focused microgrants to reduce technical debt and improve documentation.',
    },
    {
      name: 'Climate Innovation Challenge – Local Impact',
      description:
        'Backing practical, small-scale climate solutions that can be piloted in local communities within 30–60 days.',
    },
    {
      name: 'AI for Public Good – Builder Grants',
      description:
        'Funding builders using AI to improve access to information, public services, and community resilience while prioritizing transparency and safety.',
    },
    {
      name: 'Education Access Booster Round',
      description:
        'Microgrants for projects expanding access to quality learning materials, language inclusivity, and open curricula.',
    },
    {
      name: 'Healthcare Equity Microgrants',
      description:
        'Supporting initiatives that reduce disparities in care through accessible tools, data transparency, and community-led programs.',
    },
    {
      name: 'Clean Water Innovation Sprint',
      description:
        'Backing field-ready tools and open research to improve water access, quality monitoring, and sustainable distribution.',
    },
    {
      name: 'Civic Tech Builders Fund',
      description:
        'Grants for tools that strengthen local governance, participation, and accountability through open, user-friendly technology.',
    },
    {
      name: 'Arts & Culture Microgrants – Community Stories',
      description:
        'Enabling creators to document, preserve, and celebrate community narratives through open media and public exhibitions.',
    },
    {
      name: 'AgriTech Impact Seed Round',
      description:
        'Seeding practical tools that improve smallholder productivity, market access, and climate resilience with measurable outcomes.',
    },
    {
      name: 'Disaster Resilience Challenge',
      description:
        'Funding projects that enhance preparedness, rapid response coordination, and recovery through open standards and resilient infra.',
    },
  ]

  // We will create 10 rounds: alternating between with-application and direct-to-voting
  for (let i = 0; i < 2; i++) {
    const allowApplications = i % 2 === 0 // even index: with application; odd: direct voting

    // Edge-case handling: when skipping application, enforce at least 2 projects pre-selected
    if (!allowApplications && projectIds.length < 2) {
      throw new Error('Direct voting requires at least 2 approved projects, but fewer were resolved.')
    }

    // All rounds start today; ensure minimum durations (>=24h) and ordering
    const nowPlus15m = minutesFromNow(15)

    // Vary lengths slightly by index while respecting constraints
    const applicationStart = allowApplications ? nowPlus15m : undefined
    const applicationEnd = allowApplications ? hoursFromNow(24 + (i % 5)) : undefined

    // Voting must start after application end if applications allowed; else start today + 30m
    const votingStart = allowApplications
      ? hoursFromNow(26 + (i % 5))
      : minutesFromNow(30)

    // Voting length at least 24h
    const votingEnd = hoursFromNow((allowApplications ? 26 : 0) + 24 + (i % 6))

    // Prepare params
    const roundMeta = roundCatalog[i % roundCatalog.length]
    const roundName = roundMeta.name

    const txCreate = await app.round_contract.create_round({
      caller: app.wallet.account.publicKey,
      round_detail: {
        admins: [app.wallet.account.publicKey],
        allow_applications: allowApplications,
        allow_remaining_dist: false,
        application_start_ms: applicationStart ? toMs(applicationStart) : undefined,
        application_end_ms: applicationEnd ? toMs(applicationEnd) : undefined,
        application_wl_list_id: undefined,
        compliance_period_ms: undefined,
        compliance_req_desc: '',
        contacts: [
          { name: 'email', value: 'ops@grantpicks.dev' },
        ],
        cooldown_period_ms: undefined,
        description: roundMeta.description,
        expected_amount: BigInt(1000000000000000000),
        is_video_required: false,
        max_participants: 50,
        minimum_deposit: BigInt(0),
        name: roundName,
        num_picks_per_voter: 1,
        owner: app.wallet.account.publicKey,
        referrer_fee_basis_points: undefined,
        remaining_dist_address: app.wallet.account.publicKey,
        use_vault: true,
        use_whitelist_application: undefined,
        use_whitelist_voting: undefined,
        voting_start_ms: toMs(votingStart),
        voting_end_ms: toMs(votingEnd),
        voting_wl_list_id: undefined,
      },
    })

    const createRes = await txCreate.signAndSend()
    const round = createRes.result

    // If direct voting, add pre-approved projects (must be >=2)
    if (!allowApplications) {
      const txAdd = await app.round_contract.add_approved_project({
        round_id: BigInt(round.id),
        admin: app.wallet.account.publicKey,
        project_ids: projectIds,
      })
      await txAdd.signAndSend()
    }

    created.push({ id: String(round.id), name: round.name, allow_applications: round.allow_applications })
  }

  return created
}


