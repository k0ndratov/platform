import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('api', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses localApi when VITE_API_MODE is local', async () => {
    vi.stubEnv('VITE_API_MODE', 'local')
    vi.resetModules()
    const m = await import('./api.js')
    const { localApi } = await import('./api.local.js')
    expect(m.apiMode).toBe('local')
    expect(m.api).toBe(localApi)
  })

  it('uses remoteApi when VITE_API_MODE is not local', async () => {
    vi.unstubAllEnvs()
    vi.resetModules()
    const m = await import('./api.js')
    expect(m.apiMode).toBe('remote')

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 1 }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await m.api.me()
    expect(fetchMock).toHaveBeenCalled()
    expect(fetchMock.mock.calls[0][0]).toBe('/api/me')
    expect(result).toEqual({ id: 1 })
  })

  it('rejects with the server error message on a failed remote request', async () => {
    vi.unstubAllEnvs()
    vi.resetModules()
    const m = await import('./api.js')

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(m.api.me()).rejects.toThrow('Bad')
  })
})
