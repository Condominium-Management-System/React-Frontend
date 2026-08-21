import { ShieldCheck, FileCheck } from 'lucide-react'
import type { User } from '../../services/types/auth'

interface AccountInfoCardProps {
  profile: User
}

export const AccountInfoCard = ({ profile }: AccountInfoCardProps) => {
  return (
    <div className="rounded-2xl border border-gray-800/80 bg-[#0F131C] p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3 border-b border-gray-800 pb-3.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-800 bg-gray-900 text-[#D3AD32]">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-100">
            Account Information
          </h3>
          <p className="text-[11px] text-gray-400">
            Property role and verification parameters
          </p>
        </div>
      </div>

      <div className="space-y-3.5 text-xs">
        <div>
          <span className="block text-gray-500 font-medium">System Role</span>
          <span className="mt-1 inline-block rounded-full border border-gray-800 bg-gray-900 px-2.5 py-0.5 font-bold text-gray-200 capitalize">
            {profile.role ? profile.role.replace(/_/g, ' ') : '—'}
          </span>
        </div>

        <div>
          <span className="block text-gray-500 font-medium">Verification Status</span>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
              <FileCheck className="h-3 w-3" />
              <span>{profile.isVerified !== false ? 'Verified' : 'Pending Verification'}</span>
            </span>
          </div>
        </div>

        <div>
          <span className="block text-gray-500 font-medium">Assigned Condominium</span>
          <p className="mt-0.5 font-semibold text-gray-200">
            {profile.condoName || 'Not assigned'}
          </p>
        </div>

        <div>
          <span className="block text-gray-500 font-medium">Condo Code</span>
          <p className="mt-0.5 font-bold text-[#D3AD32] font-mono">
            {profile.condoCode || 'Not assigned'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AccountInfoCard
