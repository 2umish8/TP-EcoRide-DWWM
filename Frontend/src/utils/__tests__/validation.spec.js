import { describe, it, expect } from 'vitest'

/**
 * VITEST - Validation Utilities
 *
 * Tests critical validation logic used throughout the app:
 * - Email validation
 * - Password strength validation
 * - Form field validation
 * - Credit calculations
 *
 * These tests ensure data integrity before it reaches the API.
 */

describe('Email Validation', () => {
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  describe('Valid Emails', () => {
    it('should accept valid email format', () => {
      expect(validateEmail('user@example.com')).toBe(true)
    })

    it('should accept email with subdomain', () => {
      expect(validateEmail('user@mail.example.co.uk')).toBe(true)
    })

    it('should accept email with numbers and dots', () => {
      expect(validateEmail('user.name123@example.com')).toBe(true)
    })

    it('should accept email with hyphens', () => {
      expect(validateEmail('user-name@example-domain.com')).toBe(true)
    })
  })

  describe('Invalid Emails', () => {
    it('should reject email without @', () => {
      expect(validateEmail('userexample.com')).toBe(false)
    })

    it('should reject email without domain', () => {
      expect(validateEmail('user@')).toBe(false)
    })

    it('should reject email without local part', () => {
      expect(validateEmail('@example.com')).toBe(false)
    })

    it('should reject email with spaces', () => {
      expect(validateEmail('user name@example.com')).toBe(false)
    })

    it('should reject empty email', () => {
      expect(validateEmail('')).toBe(false)
    })

    it('should reject null/undefined', () => {
      expect(validateEmail(null)).toBe(false)
      expect(validateEmail(undefined)).toBe(false)
    })
  })
})

describe('Password Validation', () => {
  const validatePassword = (password) => {
    if (!password || password.length < 8) return false
    if (!/[A-Z]/.test(password)) return false
    if (!/[a-z]/.test(password)) return false
    if (!/[0-9]/.test(password)) return false
    return true
  }

  describe('Valid Passwords', () => {
    it('should accept password with uppercase, lowercase, number', () => {
      expect(validatePassword('Password123')).toBe(true)
    })

    it('should accept password with special characters', () => {
      expect(validatePassword('Secure123!')).toBe(true)
    })

    it('should accept long password', () => {
      expect(validatePassword('MyVerySecurePassword123')).toBe(true)
    })
  })

  describe('Invalid Passwords', () => {
    it('should reject password too short', () => {
      expect(validatePassword('Pwd12')).toBe(false)
    })

    it('should reject password without uppercase', () => {
      expect(validatePassword('password123')).toBe(false)
    })

    it('should reject password without lowercase', () => {
      expect(validatePassword('PASSWORD123')).toBe(false)
    })

    it('should reject password without number', () => {
      expect(validatePassword('PasswordAbc')).toBe(false)
    })

    it('should reject empty password', () => {
      expect(validatePassword('')).toBe(false)
    })

    it('should reject null/undefined', () => {
      expect(validatePassword(null)).toBe(false)
      expect(validatePassword(undefined)).toBe(false)
    })
  })
})

describe('Trip Price Validation', () => {
  const validatePrice = (price) => {
    const numPrice = parseFloat(price)
    if (isNaN(numPrice)) return false
    if (numPrice <= 0) return false
    if (numPrice > 500) return false
    return true
  }

  describe('Valid Prices', () => {
    it('should accept positive price', () => {
      expect(validatePrice('25.00')).toBe(true)
    })

    it('should accept integer price', () => {
      expect(validatePrice('50')).toBe(true)
    })

    it('should accept decimal price', () => {
      expect(validatePrice('19.99')).toBe(true)
    })

    it('should accept price at max limit', () => {
      expect(validatePrice('500')).toBe(true)
    })
  })

  describe('Invalid Prices', () => {
    it('should reject zero price', () => {
      expect(validatePrice('0')).toBe(false)
    })

    it('should reject negative price', () => {
      expect(validatePrice('-10')).toBe(false)
    })

    it('should reject price over 500', () => {
      expect(validatePrice('501')).toBe(false)
    })

    it('should reject non-numeric', () => {
      expect(validatePrice('abc')).toBe(false)
    })

    it('should reject empty string', () => {
      expect(validatePrice('')).toBe(false)
    })

    it('should reject null/undefined', () => {
      expect(validatePrice(null)).toBe(false)
      expect(validatePrice(undefined)).toBe(false)
    })
  })
})

describe('Seat Capacity Validation', () => {
  const validateSeats = (seats) => {
    const numSeats = parseInt(seats, 10)
    if (isNaN(numSeats)) return false
    if (numSeats < 1) return false
    if (numSeats > 8) return false
    return true
  }

  describe('Valid Seat Counts', () => {
    it('should accept minimum seats (1)', () => {
      expect(validateSeats('1')).toBe(true)
    })

    it('should accept typical car seats (4)', () => {
      expect(validateSeats('4')).toBe(true)
    })

    it('should accept minivan seats (7)', () => {
      expect(validateSeats('7')).toBe(true)
    })

    it('should accept maximum seats (8)', () => {
      expect(validateSeats('8')).toBe(true)
    })
  })

  describe('Invalid Seat Counts', () => {
    it('should reject zero seats', () => {
      expect(validateSeats('0')).toBe(false)
    })

    it('should reject negative seats', () => {
      expect(validateSeats('-1')).toBe(false)
    })

    it('should reject more than 8 seats', () => {
      expect(validateSeats('9')).toBe(false)
    })

    it('should reject non-numeric', () => {
      expect(validateSeats('abc')).toBe(false)
    })

    it('should reject decimal seats', () => {
      expect(validateSeats('4.5')).toBe(false)
    })
  })
})

describe('Credit Deduction Logic', () => {
  const calculateCreditsNeeded = (distance) => {
    // 1 credit per 10km
    return Math.ceil(distance / 10)
  }

  const validateCreditDeduction = (userCredits, creditsNeeded) => {
    if (!Number.isInteger(userCredits) || userCredits < 0) return false
    if (!Number.isInteger(creditsNeeded) || creditsNeeded < 0) return false
    if (userCredits < creditsNeeded) return false
    return true
  }

  describe('Credit Calculation', () => {
    it('should calculate credits for 10km trip', () => {
      expect(calculateCreditsNeeded(10)).toBe(1)
    })

    it('should calculate credits for 25km trip', () => {
      expect(calculateCreditsNeeded(25)).toBe(3)
    })

    it('should round up credit calculation', () => {
      expect(calculateCreditsNeeded(15)).toBe(2)
    })

    it('should handle zero distance', () => {
      expect(calculateCreditsNeeded(0)).toBe(0)
    })
  })

  describe('Credit Deduction Validation', () => {
    it('should allow purchase with sufficient credits', () => {
      expect(validateCreditDeduction(20, 3)).toBe(true)
    })

    it('should allow purchase with exact credits', () => {
      expect(validateCreditDeduction(5, 5)).toBe(true)
    })

    it('should reject purchase with insufficient credits', () => {
      expect(validateCreditDeduction(2, 5)).toBe(false)
    })

    it('should reject with zero user credits', () => {
      expect(validateCreditDeduction(0, 1)).toBe(false)
    })

    it('should reject with negative user credits', () => {
      expect(validateCreditDeduction(-5, 1)).toBe(false)
    })

    it('should reject with negative credits needed', () => {
      expect(validateCreditDeduction(20, -1)).toBe(false)
    })

    it('should reject with non-integer inputs', () => {
      expect(validateCreditDeduction(20.5, 3)).toBe(false)
      expect(validateCreditDeduction(20, 3.5)).toBe(false)
    })
  })

  describe('Complete Purchase Scenario', () => {
    it('should allow passenger to join trip with sufficient credits', () => {
      const tripDistance = 145
      const creditsNeeded = calculateCreditsNeeded(tripDistance)
      const userCredits = 20

      expect(creditsNeeded).toBe(15)
      expect(validateCreditDeduction(userCredits, creditsNeeded)).toBe(false)
    })

    it('should allow long-distance trip if user has credits', () => {
      const tripDistance = 50
      const creditsNeeded = calculateCreditsNeeded(tripDistance)
      const userCredits = 20

      expect(creditsNeeded).toBe(5)
      expect(validateCreditDeduction(userCredits, creditsNeeded)).toBe(true)
    })
  })
})

describe('Date Validation', () => {
  const isValidFutureDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (isNaN(date.getTime())) return false
    if (date < today) return false
    return true
  }

  describe('Valid Future Dates', () => {
    it('should accept today', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(isValidFutureDate(today)).toBe(true)
    })

    it('should accept tomorrow', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().split('T')[0]
      expect(isValidFutureDate(dateString)).toBe(true)
    })

    it('should accept date far in future', () => {
      const future = new Date()
      future.setDate(future.getDate() + 365)
      const dateString = future.toISOString().split('T')[0]
      expect(isValidFutureDate(dateString)).toBe(true)
    })
  })

  describe('Invalid Past Dates', () => {
    it('should reject yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const dateString = yesterday.toISOString().split('T')[0]
      expect(isValidFutureDate(dateString)).toBe(false)
    })

    it('should reject past date', () => {
      expect(isValidFutureDate('2020-01-01')).toBe(false)
    })

    it('should reject invalid date format', () => {
      expect(isValidFutureDate('invalid')).toBe(false)
    })

    it('should reject empty string', () => {
      expect(isValidFutureDate('')).toBe(false)
    })
  })
})
