import { Key, Lock } from 'lucide-react'

interface SecurityCardProps {
  onChangePassword: () => void
}

export const SecurityCard = ({ onChangePassword }: SecurityCardProps) => {
  return (
    <div className="rounded-2xl border border-gray-800/80 bg-[#0F131C] p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-800 bg-gray-900 text-[#D3AD32]">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-100">Security</h3>
            <p className="text-xs text-gray-400">
              Manage your password and authentication security
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <Lock className="h-3.5 w-3.5 text-gray-500" />
            <span>••••••••••••</span>
          </div>

          <button
            type="button"
            onClick={onChangePassword}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D3AD32]/40 bg-[#D3AD32]/10 px-4 py-2 text-xs font-bold text-[#D3AD32] transition-colors hover:bg-[#D3AD32]/20 cursor-pointer"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Change Password</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SecurityCard
