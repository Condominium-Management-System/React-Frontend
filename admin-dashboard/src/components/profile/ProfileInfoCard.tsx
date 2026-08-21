import { User as UserIcon, Mail, Phone, Pencil, Building2 } from 'lucide-react'
import type { User } from '../../services/types/auth'

interface ProfileInfoCardProps {
  profile: User
  initials: string
  onEditProfile: () => void
}

export const ProfileInfoCard = ({
  profile,
  initials,
  onEditProfile,
}: ProfileInfoCardProps) => {
  return (
    <>
      {/* Profile Summary Banner */}
      <div className="rounded-2xl border border-gray-800/80 bg-[#0F131C] p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#D3AD32]/40 bg-[#D3AD32]/10 text-xl font-black text-[#D3AD32] shadow-md">
              {initials}
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-[#0F131C]" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-extrabold text-gray-100">
                  {profile.fullName || '—'}
                </h2>
                <span className="rounded-full border border-[#D3AD32]/30 bg-[#D3AD32]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#D3AD32] capitalize">
                  {profile.role ? profile.role.replace(/_/g, ' ') : '—'}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-gray-500" />
                <span>{profile.email || '—'}</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-400 flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-[#D3AD32]" />
                <span>{profile.condoName || profile.condoCode || 'Not assigned'}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onEditProfile}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D3AD32] px-4 py-2.5 text-xs font-bold text-gray-950 transition-colors hover:bg-[#E4C043] shadow-sm shrink-0 cursor-pointer"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="rounded-2xl border border-gray-800/80 bg-[#0F131C] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-800 pb-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-800 bg-gray-900 text-[#D3AD32]">
            <UserIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-100">
              Personal Information
            </h3>
            <p className="text-[11px] text-gray-400">
              Your primary contact and national details
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs">
          <div>
            <span className="block text-gray-500 font-medium">Full Name</span>
            <p className="mt-0.5 font-semibold text-gray-200">
              {profile.fullName || '—'}
            </p>
          </div>

          <div>
            <span className="block text-gray-500 font-medium">Email Address</span>
            <p className="mt-0.5 font-semibold text-gray-200">
              {profile.email || '—'}
            </p>
          </div>

          <div>
            <span className="block text-gray-500 font-medium">Phone Number</span>
            <p className="mt-0.5 font-semibold text-gray-200 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-gray-500" />
              <span>{profile.phoneNumber || 'Not assigned'}</span>
            </p>
          </div>

          <div>
            <span className="block text-gray-500 font-medium">FAN Number</span>
            <p className="mt-0.5 font-semibold text-[#D3AD32] font-mono">
              {profile.fan || 'Not assigned'}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfileInfoCard
