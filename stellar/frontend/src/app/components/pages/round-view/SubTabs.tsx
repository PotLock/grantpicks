import React from 'react'

type Tab = 'about' | 'applications' | 'admins'

const SubTabs = ({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) => (
  <div className="flex items-center gap-6 border-b border-black/10 mt-6">
    {(['about', 'applications', 'admins'] as const).map((t) => (
      <button
        key={t}
        className={`relative py-3 text-sm font-semibold ${active === t ? 'text-grantpicks-black-950' : 'text-grantpicks-black-500'}`}
        onClick={() => onChange(t)}
      >
        {t === 'applications' ? 'Applications' : t === 'admins' ? 'Admins' : 'About'}
        {active === t && <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-grantpicks-black-950 rounded-full" />}
      </button>
    ))}
  </div>
)

export default SubTabs
