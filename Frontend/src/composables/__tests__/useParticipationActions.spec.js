import { describe, it, expect, vi, beforeEach } from 'vitest'
import useParticipationActions from '@/composables/useParticipationActions'

/**
 * VITEST - useParticipationActions Composable
 *
 * Tests isolated business logic for participation management:
 * - Cancelling trips
 * - Credit refunds
 * - Penalty handling
 * - Error handling
 *
 * These tests run FIRST, in milliseconds, to catch logic bugs
 * before running the full E2E test.
 */

describe('useParticipationActions Composable', () => {
  let composable
  let mockNotificationStore
  let mockCancelFunction

  beforeEach(() => {
    // Mock the notification store
    mockNotificationStore = {
      showSuccess: vi.fn(),
      showError: vi.fn(),
    }

    // Mock useNotificationStore to return our mock
    vi.stubGlobal('useNotificationStore', () => mockNotificationStore)

    composable = useParticipationActions()
  })

  describe('handleCancelParticipation', () => {
    describe('Success Cases', () => {
      it('should handle basic cancellation success', async () => {
        const mockResult = {
          message: 'Participation cancelled successfully',
          creditsRefunded: 0,
        }

        mockCancelFunction = vi.fn().mockResolvedValue(mockResult)
        const carpoolingId = 123

        await composable.handleCancelParticipation(mockCancelFunction, carpoolingId)

        expect(mockCancelFunction).toHaveBeenCalledWith(carpoolingId)
        expect(mockNotificationStore.showSuccess).toHaveBeenCalledWith(
          expect.stringContaining('successfully'),
        )
      })

      it('should display credit refund when applicable', async () => {
        const mockResult = {
          message: 'Participation cancelled',
          creditsRefunded: 15,
        }

        mockCancelFunction = vi.fn().mockResolvedValue(mockResult)

        await composable.handleCancelParticipation(mockCancelFunction, 456)

        const successCall = mockNotificationStore.showSuccess.mock.calls[0][0]
        expect(successCall).toContain('15')
        expect(successCall).toContain('Crédits')
      })

      it('should display penalty when late cancellation', async () => {
        const mockResult = {
          message: 'Late cancellation',
          creditsRefunded: 10,
          penalty: 5,
        }

        mockCancelFunction = vi.fn().mockResolvedValue(mockResult)

        await composable.handleCancelParticipation(mockCancelFunction, 789)

        const successCall = mockNotificationStore.showSuccess.mock.calls[0][0]
        expect(successCall).toContain('Pénalité')
        expect(successCall).toContain('5')
      })

      it('should handle cancellation without refund', async () => {
        const mockResult = {
          message: 'Trip cancelled by driver',
          creditsRefunded: 0,
        }

        mockCancelFunction = vi.fn().mockResolvedValue(mockResult)

        await composable.handleCancelParticipation(mockCancelFunction, 999)

        expect(mockNotificationStore.showSuccess).toHaveBeenCalled()
        const call = mockNotificationStore.showSuccess.mock.calls[0][0]
        expect(call).not.toContain('undefined')
      })
    })

    describe('Error Cases', () => {
      it('should handle API error response', async () => {
        const mockError = new Error('Network error')
        mockError.response = {
          data: {
            message: 'Cannot cancel: trip already started',
          },
        }

        mockCancelFunction = vi.fn().rejectWith(mockError)

        await composable.handleCancelParticipation(mockCancelFunction, 111)

        expect(mockNotificationStore.showError).toHaveBeenCalledWith(
          expect.stringContaining('Cannot cancel'),
        )
      })

      it('should handle error without response object', async () => {
        const mockError = new Error('Connection failed')

        mockCancelFunction = vi.fn().rejectWith(mockError)

        await composable.handleCancelParticipation(mockCancelFunction, 222)

        expect(mockNotificationStore.showError).toHaveBeenCalledWith(
          expect.stringContaining('Connection failed'),
        )
      })

      it('should handle cancellation blocked by business rules', async () => {
        const mockError = new Error('Invalid state')
        mockError.response = {
          data: {
            message: 'Cannot cancel completed trip',
          },
        }

        mockCancelFunction = vi.fn().rejectWith(mockError)

        await composable.handleCancelParticipation(mockCancelFunction, 333)

        expect(mockNotificationStore.showError).toHaveBeenCalled()
        const errorCall = mockNotificationStore.showError.mock.calls[0][0]
        expect(errorCall).toContain('Cannot cancel completed')
      })
    })

    describe('Edge Cases', () => {
      it('should handle very large credit refunds', async () => {
        const mockResult = {
          message: 'Group trip cancelled',
          creditsRefunded: 500,
        }

        mockCancelFunction = vi.fn().mockResolvedValue(mockResult)

        await composable.handleCancelParticipation(mockCancelFunction, 444)

        const successCall = mockNotificationStore.showSuccess.mock.calls[0][0]
        expect(successCall).toContain('500')
      })

      it('should handle zero refund and zero penalty', async () => {
        const mockResult = {
          message: 'Cancelled',
          creditsRefunded: 0,
          penalty: 0,
        }

        mockCancelFunction = vi.fn().mockResolvedValue(mockResult)

        await composable.handleCancelParticipation(mockCancelFunction, 555)

        const successCall = mockNotificationStore.showSuccess.mock.calls[0][0]
        expect(successCall).not.toContain('NaN')
        expect(successCall).toContain('Cancelled')
      })
    })
  })
})
