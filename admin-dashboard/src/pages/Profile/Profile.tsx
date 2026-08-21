import { useState, useEffect, useCallback } from 'react'
import { AlertCircle, RefreshCw, CheckCircle } from 'lucide-react'
import type { User } from '../../services/types/auth'
import { getProfileApi } from '../../services/api/apiClient'
import { useAuth } from '../../context/useAuth'
import ProfileInfoCard from '../../components/profile/ProfileInfoCard'
import AccountInfoCard from '../../components/profile/AccountInfoCard'
import SecurityCard from '../../components/profile/SecurityCard'
import EditProfileModal from '../../components/profile/EditProfileModal'
import ChangePasswordModal from '../../components/profile/ChangePasswordModal'

export const Profile = () => {
  const { setUser: setAuthUser } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)

  // Fetch user profile on mount
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      const data = await getProfileApi()
      setProfile(data)
      setAuthUser(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load profile. Please try again.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }, [setAuthUser])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Callback when profile is updated in modal
  const handleProfileUpdated = (updatedUser: User) => {
    setProfile(updatedUser)
    setAuthUser(updatedUser)
    setSuccessBanner('Profile updated successfully.')
    setTimeout(() => {
      setSuccessBanner(null)
    }, 4000)
  }

  // Initials calculation
  const initials = profile?.fullName
    ? profile.fullName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'AK'

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D3AD32] border-t-transparent" />
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Loading profile...
          </span>
        </div>
      </div>
    )
  }

  if (errorMessage || !profile) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-[#0F131C] p-8 text-center text-gray-400 max-w-lg mx-auto mt-10">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-200">Unable to load profile</h3>
        <p className="mt-1 text-xs text-gray-400">
          {errorMessage || 'Please check your connection and try again.'}
        </p>
        <button
          type="button"
          onClick={fetchProfile}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#D3AD32] px-4 py-2 text-xs font-bold text-gray-950 transition-colors hover:bg-[#E4C043]"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto pb-10">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-100">
          My Profile
        </h1>
        <p className="mt-1 text-xs md:text-sm text-gray-400">
          Manage your personal information and account details.
        </p>
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400 shadow-sm transition-all">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* 2. Profile Summary & Personal Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProfileInfoCard
          profile={profile}
          initials={initials}
          onEditProfile={() => setIsEditModalOpen(true)}
        />

        <AccountInfoCard profile={profile} />
      </div>

      {/* 3. Security Settings */}
      <SecurityCard onChangePassword={() => setIsChangePasswordOpen(true)} />

      {/* 4. Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          user={profile}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleProfileUpdated}
        />
      )}

      {/* 5. Change Password Modal */}
      {isChangePasswordOpen && (
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      )}
    </div>
  )
}

export default Profile
