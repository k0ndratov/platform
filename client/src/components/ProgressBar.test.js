import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressBar from './ProgressBar.vue'

describe('ProgressBar', () => {
  it('clamps the fill width to 0% for negative values', () => {
    const wrapper = mount(ProgressBar, { props: { value: -10 } })
    expect(wrapper.find('.fill').attributes('style')).toContain('width: 0%')
  })

  it('clamps the fill width to 100% for values above 100', () => {
    const wrapper = mount(ProgressBar, { props: { value: 150 } })
    expect(wrapper.find('.fill').attributes('style')).toContain('width: 100%')
  })

  it('sets the fill width to the value within range', () => {
    const wrapper = mount(ProgressBar, { props: { value: 42 } })
    expect(wrapper.find('.fill').attributes('style')).toContain('width: 42%')
  })

  it('sets the track height from the height prop', () => {
    const wrapper = mount(ProgressBar, { props: { value: 42, height: 12 } })
    expect(wrapper.find('.track').attributes('style')).toContain('height: 12px')
  })
})
