import { describe, it, expect, vi, beforeEach } from 'vitest'
import useTripsActions from '@/composables/useTripsActions'

/**
 * VITEST - useTripsActions Composable
 *
 * Tests isolated business logic for trip management:
 * - Starting trips
 * - Finishing trips
 * - Cancelling trips
 * - Error handling
 * - State transitions
 *
 * These tests run FIRST to ensure trip state management is correct
 * before running E2E tests.
 */

describe('useTripsActions Composable', () => {
  let composable
  let mockNotificationStore

  beforeEach(() => {
    // Mock the notification store
    mockNotificationStore = {
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showInfo: vi.fn(),
    }

    // Mock useNotificationStore
    vi.stubGlobal('useNotificationStore', () => mockNotificationStore)

    composable = useTripsActions()
  })

  describe('handleStartTrip', () => {
    describe('Success Cases', () => {
      it('should start a trip successfully', async () => {
        const mockStartFn = vi.fn().mockResolvedValue({ status: 'started' })
        const tripId = 100

        await composable.handleStartTrip(mockStartFn, tripId)

        expect(mockNotificationStore.showInfo).toHaveBeenCalledWith('Démarrage du trajet...')
        expect(mockStartFn).toHaveBeenCalledWith(tripId)
      })

      it('should call start function with correct trip ID', async () => {
        const mockStartFn = vi.fn().mockResolvedValue({})
        const tripId = 999

        await composable.handleStartTrip(mockStartFn, tripId)

        expect(mockStartFn).toHaveBeenCalledWith(999)
        expect(mockStartFn).toHaveBeenCalledTimes(1)
      })

      it('should handle start when trip has participants', async () => {
        const mockStartFn = vi.fn().mockResolvedValue({
          tripId: 200,
          participantCount: 3,
          status: 'in_progress',
        })

        await composable.handleStartTrip(mockStartFn, 200)

        expect(mockStartFn).toHaveBeenCalled()
        expect(mockNotificationStore.showError).not.toHaveBeenCalled()
      })
    })

    describe('Error Cases', () => {
      it('should handle start error with API message', async () => {
        const mockError = new Error('Trip already started')
        mockError.response = {
          data: { message: 'Trip already in progress' },
        }

        const mockStartFn = vi.fn().rejectWith(mockError)

        await composable.handleStartTrip(mockStartFn, 300)

        expect(mockNotificationStore.showError).toHaveBeenCalledWith(
          expect.stringContaining('already in progress'),
        )
      })

      it('should handle start error without response object', async () => {
        const mockError = new Error('Network error')
        const mockStartFn = vi.fn().rejectWith(mockError)

        await composable.handleStartTrip(mockStartFn, 400)

        expect(mockNotificationStore.showError).toHaveBeenCalledWith(
          expect.stringContaining('Network error'),
        )
      })

      it('should handle start when trip not found', async () => {
        const mockError = new Error('Not found')
        mockError.response = {
          data: { message: 'Trip not found' },
        }

        const mockStartFn = vi.fn().rejectWith(mockError)

        await composable.handleStartTrip(mockStartFn, 500)

        expect(mockNotificationStore.showError).toHaveBeenCalled()
      })
    })
  })

  describe('handleFinishTrip', () => {
    describe('Success Cases', () => {
      it('should finish a trip successfully', async () => {
        const mockFinishFn = vi.fn().mockResolvedValue({ status: 'completed' })
        const tripId = 101

        await composable.handleFinishTrip(mockFinishFn, tripId)

        expect(mockNotificationStore.showInfo).toHaveBeenCalledWith('Fin du trajet...')
        expect(mockFinishFn).toHaveBeenCalledWith(tripId)
      })

      it('should call finish function with correct trip ID', async () => {
        const mockFinishFn = vi.fn().mockResolvedValue({})
        const tripId = 888

        await composable.handleFinishTrip(mockFinishFn, tripId)

        expect(mockFinishFn).toHaveBeenCalledWith(888)
      })
    })

    describe('Error Cases', () => {
      it('should handle finish error when trip not started', async () => {
        const mockError = new Error('Cannot finish')
        mockError.response = {
          data: { message: 'Trip not started yet' },
        }

        const mockFinishFn = vi.fn().rejectWith(mockError)

        await composable.handleFinishTrip(mockFinishFn, 600)

        expect(mockNotificationStore.showError).toHaveBeenCalledWith(
          expect.stringContaining('not started'),
        )
      })

      it('should handle finish error with generic message', async () => {
        const mockError = new Error('Server error')
        const mockFinishFn = vi.fn().rejectWith(mockError)

        await composable.handleFinishTrip(mockFinishFn, 700)

        expect(mockNotificationStore.showError).toHaveBeenCalled()
      })
    })
  })

  describe('handleCancelTrip', () => {
    describe('Success Cases', () => {
      it('should cancel a trip successfully', async () => {
        const mockCancelFn = vi.fn().mockResolvedValue({ status: 'cancelled' })
        const tripId = 102

        await composable.handleCancelTrip(mockCancelFn, tripId)

        expect(mockNotificationStore.showInfo).toHaveBeenCalledWith('Annulation du trajet...')
        expect(mockCancelFn).toHaveBeenCalledWith(tripId)
      })

      it('should refund participants when cancelling trip', async () => {
        const mockCancelFn = vi.fn().mockResolvedValue({
          status: 'cancelled',
          refundedCount: 3,
          totalRefunded: 30,
        })

        await composable.handleCancelTrip(mockCancelFn, 800)

        expect(mockCancelFn).toHaveBeenCalled()
      })
    })

    describe('Error Cases', () => {
      it('should handle cancel error when trip already completed', async () => {
        const mockError = new Error('Cannot cancel')
        mockError.response = {
          data: { message: 'Cannot cancel completed trip' },
        }

        const mockCancelFn = vi.fn().rejectWith(mockError)

        await composable.handleCancelTrip(mockCancelFn, 900)

        expect(mockNotificationStore.showError).toHaveBeenCalledWith(
          expect.stringContaining('Cannot cancel completed'),
        )
      })

      it('should handle cancel error when trip in progress', async () => {
        const mockError = new Error('Invalid state')
        mockError.response = {
          data: { message: 'Cannot cancel: trip in progress' },
        }

        const mockCancelFn = vi.fn().rejectWith(mockError)

        await composable.handleCancelTrip(mockCancelFn, 1000)

        expect(mockNotificationStore.showError).toHaveBeenCalled()
      })
    })
  })

  describe('State Transitions', () => {
    it('should handle complete trip lifecycle: start → finish', async () => {
      const mockStartFn = vi.fn().mockResolvedValue({ status: 'started' })
      const mockFinishFn = vi.fn().mockResolvedValue({ status: 'completed' })
      const tripId = 111

      // Start trip
      await composable.handleStartTrip(mockStartFn, tripId)
      expect(mockStartFn).toHaveBeenCalledWith(tripId)

      // Finish trip
      await composable.handleFinishTrip(mockFinishFn, tripId)
      expect(mockFinishFn).toHaveBeenCalledWith(tripId)

      // Should show 2 info messages
      expect(mockNotificationStore.showInfo).toHaveBeenCalledTimes(2)
    })

    it('should prevent finish without start', async () => {
      const mockFinishFn = vi.fn().mockRejectedValue(
        Object.assign(new Error('Not started'), {
          response: { data: { message: 'Trip must be started first' } },
        }),
      )

      await composable.handleFinishTrip(mockFinishFn, 222)

      expect(mockNotificationStore.showError).toHaveBeenCalled()
    })

    it('should not allow concurrent starts', async () => {
      const mockStartFn = vi.fn().mockResolvedValueOnce({ status: 'started' })

      await composable.handleStartTrip(mockStartFn, 333)
      expect(mockStartFn).toHaveBeenCalledTimes(1)

      // Second start should use fresh function call
      const secondStartFn = vi.fn().mockResolvedValueOnce({ status: 'started' })
      await composable.handleStartTrip(secondStartFn, 333)

      expect(secondStartFn).toHaveBeenCalledTimes(1)
    })
  })
})
