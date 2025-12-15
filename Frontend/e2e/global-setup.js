/* global process */
import axios from 'axios'
// child_process execSync removed - not needed in global setup
import path from 'path'
import fs from 'fs'

const BASE_URL = process.env.CI ? 'http://localhost:3000/api' : 'http://localhost:3000/api'

async function waitForBackend(url, timeout = 30000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      // Backend exposes /api/health - our BASE_URL already contains /api
      const res = await axios.get(url + '/health')
      if (res.status === 200) return true
    } catch {
      // continue
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error('Backend did not respond in time: ' + url)
}

export default async function globalSetup() {
  console.log('\nPlaywright globalSetup - seeding backend for E2E tests')

  // const backendScriptsDir = path.resolve(process.cwd(), '..', 'Backend', 'scripts')
  // const cleanScript = path.join(backendScriptsDir, 'cleanDatabase.js')

  try {
    // Skip running the backend clean script inside Playwright context due to environment differences
    // (we couldn't reliably spawn or import it across all environments). Proceed with seeding.

    // Create a consistent test user by calling the API
    console.log('Waiting for backend to be available (timeout 120s)...')
    // Allow a longer timeout for local dev environments where DB migrations may delay startup
    await waitForBackend(BASE_URL, 120000)

    console.log('Registering test users...')

    const TEST_USER_PSEUDO = 'test'
    const TEST_USER_EMAIL = 'test@test.com'
    const TEST_PASSWORD = 'Test2025!'

    const uniqueSuffix = Date.now()
    const NON_DRIVER_PSEUDO = `test-non-driver-${uniqueSuffix}`
    const NON_DRIVER_EMAIL = `test-non-driver-${uniqueSuffix}@test.com`
    const NON_DRIVER_PASSWORD = 'Test2025!'

    // Register user (if already exists, fallback to login)
    let token
    try {
      await axios.post(`${BASE_URL}/users/register`, {
        pseudo: TEST_USER_PSEUDO,
        email: TEST_USER_EMAIL,
        password: TEST_PASSWORD,
      })
      console.log('Test user registered')
    } catch {
      console.log('Could not register (might already exist), continuing to login ...')
    }

    // Register non-driver user (must stay without chauffeur role)
    try {
      await axios.post(`${BASE_URL}/users/register`, {
        pseudo: NON_DRIVER_PSEUDO,
        email: NON_DRIVER_EMAIL,
        password: NON_DRIVER_PASSWORD,
      })
      console.log('Non-driver test user registered')
    } catch {
      console.log('Could not register non-driver user (might already exist), continuing ...')
    }

    // Login to obtain token
    const loginResp = await axios.post(`${BASE_URL}/users/login`, {
      identifier: TEST_USER_PSEUDO,
      password: TEST_PASSWORD,
    })
    token = loginResp.data.token

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } }

    // Add role 'chauffeur' if needed
    try {
      await axios.post(`${BASE_URL}/users/become-driver`, {}, authHeaders)
      console.log('Added chauffeur role to test user')
    } catch (err) {
      console.log(
        'Add role may already exist or endpoint prevented it:',
        err?.response?.data?.message || err.message,
      )
    }

    // Try to create a 'Renault Clio' vehicle
    const vehiclePayload = {
      plate_number: 'CL-2020-RENO',
      model: 'Clio 2020',
      seats_available: 4,
      is_electric: false,
      brand_name: 'Renault',
      color_name: 'Gris',
    }

    let vehicleId = null
    try {
      const addVehicleResp = await axios.post(`${BASE_URL}/vehicles`, vehiclePayload, authHeaders)
      // The backend returns vehicleId or vehicle object
      vehicleId =
        addVehicleResp.data.vehicleId || addVehicleResp.data.vehicle?.id || addVehicleResp.data.id
      console.log('Vehicle created with id', vehicleId)
    } catch {
      console.log('Could not create vehicle (maybe exists). Trying to fetch existing vehicles...')
      try {
        const myVehiclesResp = await axios.get(`${BASE_URL}/vehicles/my-vehicles`, authHeaders)
        if (
          Array.isArray(myVehiclesResp.data.vehicles) &&
          myVehiclesResp.data.vehicles.length > 0
        ) {
          vehicleId = myVehiclesResp.data.vehicles[0].id
          console.log('Found existing vehicle', vehicleId)
        }
      } catch (err2) {
        console.error('Could not fetch vehicles:', err2.message)
      }
    }

    const testData = {
      TEST_USER_PSEUDO,
      TEST_USER_EMAIL,
      TEST_PASSWORD,
      VEHICLE_ID: vehicleId,
      NON_DRIVER_PSEUDO,
      NON_DRIVER_EMAIL,
      NON_DRIVER_PASSWORD,
    }

    // Write to e2e/test-data.json so tests can use it
    const outputPath = path.resolve(process.cwd(), 'e2e', 'test-data.json')
    fs.writeFileSync(outputPath, JSON.stringify(testData, null, 2), 'utf8')
    console.log('Wrote test-data to', outputPath)

    console.log('globalSetup complete')
  } catch (err) {
    console.error('Error during global setup:', err)
    throw err
  }
}
