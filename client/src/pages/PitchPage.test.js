import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PitchPage from './PitchPage.vue'
import { slides, DEMO_URL } from '../data/pitch'

const router = { push: vi.fn(), resolve: (to) => ({ href: `/resolved/${to.name}` }) }
vi.mock('vue-router', () => ({ useRouter: () => router }))

const press = async (w, k) => {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: k }))
  await w.vm.$nextTick()
}

let w
beforeEach(() => {
  w = mount(PitchPage, { attachTo: document.body }) // Transition is stubbed by default, so slides switch at once
})
afterEach(() => w.unmount())

describe('PitchPage', () => {
  it('shows the first slide and the counter', () => {
    expect(w.text()).toContain(slides[0].title)
    expect(w.text()).toContain(`1 / ${slides.length}`)
    expect(w.find('button[aria-label="Назад"]').attributes('disabled')).toBeDefined()
    expect(w.find('img').exists()).toBe(false) // the title slide has no screenshot
  })

  it('arrow keys move between slides and stop at both ends', async () => {
    await press(w, 'ArrowLeft')
    expect(w.text()).toContain(slides[0].title)
    await press(w, 'ArrowRight')
    expect(w.text()).toContain(slides[1].title)
    expect(w.text()).toContain(`2 / ${slides.length}`)
    for (let i = 0; i < slides.length + 2; i++) await press(w, 'ArrowRight')
    expect(w.text()).toContain(slides.at(-1).title)
    expect(w.find('button[aria-label="Дальше"]').attributes('disabled')).toBeDefined()
    await press(w, 'Home')
    expect(w.text()).toContain(slides[0].title)
  })

  it('dots jump to a slide', async () => {
    await w.find('button[aria-label="Слайд 3"]').trigger('click')
    expect(w.text()).toContain(slides[2].title)
  })

  it('a slide with a screenshot shows it and links to the real page in a new tab', async () => {
    const i = slides.findIndex((s) => s.image)
    await w.find(`button[aria-label="Слайд ${i + 1}"]`).trigger('click')
    const img = w.find('img')
    expect(img.attributes('src')).toBe(slides[i].image)
    expect(img.attributes('alt')).toBe(slides[i].imageAlt)
    const links = w.findAll(`a[href="/resolved/${slides[i].link.to.name}"]`)
    expect(links.length).toBe(2) // the button and the screenshot itself
    expect(links[0].text()).toContain(slides[i].link.label)
    expect(links[0].attributes('target')).toBe('_blank')
  })

  it('the last slide shows the QR code and links straight to the live demo', async () => {
    await press(w, 'End')
    const qr = w.find('a.qr')
    expect(qr.attributes('href')).toBe(DEMO_URL)
    expect(qr.find('img').attributes('src')).toBe('/pitch/qr.svg')
    expect(qr.text()).toContain('platform-nine-roan-19.vercel.app')
    expect(w.find('a.open-link').attributes('href')).toBe(DEMO_URL) // href wins over the router
  })

  it('Escape goes back to the dashboard', async () => {
    await press(w, 'Escape')
    expect(router.push).toHaveBeenCalledWith({ name: 'dashboard' })
  })
})
