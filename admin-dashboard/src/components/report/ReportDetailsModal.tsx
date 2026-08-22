import { useState, useEffect } from 'react'
import { X, FileText, User, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react'
import type { Report, ReportStatus } from '../../services/types/report'
import { updateReportStatusApi, addReportResponseApi, getReportByIdApi } from '../../services/api/reportApi'

interface ReportDetailsModalProps {
  isOpen: boolean
  reportId: string | null
  onClose: () => void
  onReportUpdated: () => void
}

export const ReportDetailsModal = ({
  isOpen,
  reportId,
  onClose,
  onReportUpdated,
}: ReportDetailsModalProps) => {
  const [report, setReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Status Update state
  const [newStatus, setNewStatus] = useState<ReportStatus>('reported')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false)
  const [statusSuccessMessage, setStatusSuccessMessage] = useState<string | null>(null)

  // Response Message state
  const [responseMessage, setResponseMessage] = useState('')
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)

  useEffect(() => {
    if (isOpen && reportId) {
      loadReportDetails(reportId)
    } else {
      setReport(null)
      setErrorMessage(null)
      setStatusSuccessMessage(null)
    }
  }, [isOpen, reportId])

  const loadReportDetails = async (id: string) => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      const data = await getReportByIdApi(id)
      setReport(data)
      setNewStatus(data.status)
      setResolutionNotes(data.resolutionNotes || '')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load report details.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!report) return

    try {
      setIsSubmittingStatus(true)
      setErrorMessage(null)
      setStatusSuccessMessage(null)

      const updated = await updateReportStatusApi(report.id, {
        status: newStatus,
        resolutionNotes: resolutionNotes.trim() || undefined,
      })

      setReport(updated)
      setStatusSuccessMessage('Report status updated successfully.')
      onReportUpdated()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status.'
      setErrorMessage(msg)
    } finally {
      setIsSubmittingStatus(false)
    }
  }

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!report || !responseMessage.trim()) return

    try {
      setIsSubmittingResponse(true)
      setErrorMessage(null)

      await addReportResponseApi(report.id, {
        message: responseMessage.trim(),
        isAdminResponse: true,
      })

      setResponseMessage('')
      // Reload details to update responses thread
      const updated = await getReportByIdApi(report.id)
      setReport(updated)
      onReportUpdated()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send response.'
      setErrorMessage(msg)
    } finally {
      setIsSubmittingResponse(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-gray-800 bg-[#0F131C] text-gray-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D3AD32]/30 bg-[#D3AD32]/10 text-[#D3AD32]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-100">Maintenance Report Details</h3>
              <p className="text-xs text-gray-400">View and update ticket status and responses</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading && (
            <div className="py-12 text-center text-gray-400">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#D3AD32] border-t-transparent mx-auto" />
              <span className="mt-3 block text-xs font-semibold uppercase tracking-wider">
                Loading details...
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {report && !isLoading && (
            <>
              {/* Report Header Card */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-lg font-bold text-gray-100">{report.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-gray-700 bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-300 capitalize">
                      {report.category}
                    </span>
                    <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-bold text-orange-400 uppercase">
                      {report.priority}
                    </span>
                    <span className="rounded-full border border-[#D3AD32]/40 bg-[#D3AD32]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#D3AD32] uppercase">
                      {report.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">
                  {report.description}
                </p>

                {report.photoUrl && (
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold text-gray-400 mb-1.5">Attached Photo:</p>
                    <a
                      href={report.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-lg overflow-hidden border border-gray-700 max-w-xs hover:border-[#D3AD32] transition-colors"
                    >
                      <img
                        src={report.photoUrl}
                        alt="Report Attachment"
                        className="max-h-48 object-cover"
                      />
                    </a>
                  </div>
                )}
              </div>

              {/* Reporter Info & Timestamps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
                    <User className="h-4 w-4 text-[#D3AD32]" />
                    <span>Reporter Information</span>
                  </div>
                  <div className="text-xs space-y-1 text-gray-400">
                    <p>
                      <span className="text-gray-500">Name:</span>{' '}
                      <strong className="text-gray-200">{report.reporter?.fullName || 'Resident'}</strong>
                    </p>
                    <p>
                      <span className="text-gray-500">Email:</span> {report.reporter?.email || 'N/A'}
                    </p>
                    {report.reporter?.phoneNumber && (
                      <p>
                        <span className="text-gray-500">Phone:</span> {report.reporter.phoneNumber}
                      </p>
                    )}
                    <p>
                      <span className="text-gray-500">Unit:</span> Block {report.reporter?.block || 'N/A'}, Room {report.reporter?.roomNo || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
                    <FileText className="h-4 w-4 text-[#D3AD32]" />
                    <span>Status & Dates</span>
                  </div>
                  <div className="text-xs space-y-1 text-gray-400">
                    <p>
                      <span className="text-gray-500">Created:</span>{' '}
                      {new Date(report.createdAt).toLocaleString()}
                    </p>
                    {report.resolvedAt && (
                      <p>
                        <span className="text-gray-500">Resolved At:</span>{' '}
                        {new Date(report.resolvedAt).toLocaleString()}
                      </p>
                    )}
                    {report.resolutionNotes && (
                      <p>
                        <span className="text-gray-500">Resolution Notes:</span>{' '}
                        <span className="text-gray-300">{report.resolutionNotes}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                  Update Report Status
                </h4>

                {statusSuccessMessage && (
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{statusSuccessMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                      Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                      className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-gray-200 focus:border-[#D3AD32]/50 focus:outline-none cursor-pointer"
                    >
                      <option value="reported">Reported</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                      Resolution Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Add notes..."
                      className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:border-[#D3AD32]/50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSubmittingStatus}
                    className="rounded-lg bg-[#D3AD32] px-4 py-1.5 text-xs font-bold text-gray-950 hover:bg-[#b89528] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingStatus ? 'Updating...' : 'Save Status'}
                  </button>
                </div>
              </form>

              {/* Discussion / Responses Thread */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
                  <MessageSquare className="h-4 w-4 text-[#D3AD32]" />
                  <span>Responses & Activity ({report.responses?.length || 0})</span>
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {report.responses && report.responses.length > 0 ? (
                    report.responses.map((resp) => (
                      <div
                        key={resp.id}
                        className={`rounded-lg p-3 text-xs border ${
                          resp.isAdminResponse
                            ? 'bg-[#D3AD32]/10 border-[#D3AD32]/30 text-gray-200'
                            : 'bg-gray-800/60 border-gray-700 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                          <span className="font-semibold text-gray-200">
                            {resp.user?.fullName || (resp.isAdminResponse ? 'Admin' : 'Resident')}
                          </span>
                          <span>{new Date(resp.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="whitespace-pre-line">{resp.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 italic">No responses posted yet.</p>
                  )}
                </div>

                {/* Send Response Form */}
                <form onSubmit={handleSendResponse} className="flex gap-2">
                  <input
                    type="text"
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Type a response to this report..."
                    className="flex-1 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:border-[#D3AD32]/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingResponse || !responseMessage.trim()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#D3AD32] px-4 py-2 text-xs font-bold text-gray-950 hover:bg-[#b89528] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-800/80 bg-gray-900/40 px-6 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReportDetailsModal
