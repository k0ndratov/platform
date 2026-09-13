import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TagInput from './TagInput.vue'

describe('TagInput', () => {
  it('adds a tag on Enter and emits the new list', async () => {
    const wrapper = mount(TagInput, { props: { modelValue: [] } })
    await wrapper.find('.tags__input').setValue('Vue')
    await wrapper.find('.tags__input').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([['Vue']])
  })

  it('adds a tag on comma', async () => {
    const wrapper = mount(TagInput, { props: { modelValue: [] } })
    await wrapper.find('.tags__input').setValue('Vue')
    await wrapper.find('.tags__input').trigger('keydown', { key: ',' })
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([['Vue']])
  })

  it('adds a tag on blur', async () => {
    const wrapper = mount(TagInput, { props: { modelValue: [] } })
    await wrapper.find('.tags__input').setValue('Vue')
    await wrapper.find('.tags__input').trigger('blur')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([['Vue']])
  })

  it('does not add a duplicate tag (case-insensitive)', async () => {
    const wrapper = mount(TagInput, { props: { modelValue: ['Vue'] } })
    await wrapper.find('.tags__input').setValue('vue')
    await wrapper.find('.tags__input').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('removes the last tag on Backspace when draft is empty', async () => {
    const wrapper = mount(TagInput, { props: { modelValue: ['A', 'B'] } })
    await wrapper.find('.tags__input').trigger('keydown', { key: 'Backspace' })
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([['A']])
  })

  it('removes a tag by index when its remove button is clicked', async () => {
    const wrapper = mount(TagInput, { props: { modelValue: ['A', 'B'] } })
    const removeButtons = wrapper.findAll('.tag__x')
    await removeButtons[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([['A']])
  })

  it('shows suggestions not already selected, and adds one on click', async () => {
    const wrapper = mount(TagInput, {
      props: { modelValue: [], suggestions: ['Vue', 'React'] },
    })
    let suggestButtons = wrapper.findAll('.suggest')
    expect(suggestButtons).toHaveLength(2)

    await suggestButtons[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([['Vue']])

    await wrapper.setProps({ modelValue: ['Vue'] })
    suggestButtons = wrapper.findAll('.suggest')
    expect(suggestButtons).toHaveLength(1)
    expect(suggestButtons[0].text()).toContain('React')
  })
})
